import { GoogleGenAI, Type } from "@google/genai";
import { MarketPromotion, MarketComparison } from "../types";

let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn("GEMINI_API_KEY is missing. AI features will not work.");
      // We still return an instance, but it will fail on calls.
      // Or we can throw a more descriptive error when called.
    }
    aiInstance = new GoogleGenAI({ apiKey: apiKey || "" });
  }
  return aiInstance;
};

export interface OCRResult {
  name?: string;
  price?: number;
  quantity?: number;
  unit?: string;
  promotionType?: string;
  promotionDetails?: string;
}

export const analyzeLabelImage = async (base64Image: string): Promise<OCRResult | null> => {
  try {
    const response = await getAI().models.generateContent({
      model: "gemini-3-flash-preview",
      contents: [
        {
          parts: [
            { text: "Analise esta etiqueta de preço de supermercado. Extraia o nome do produto, o preço principal, a quantidade/peso e a unidade (g, kg, ml, L, un). Se houver uma promoção (ex: leve 3 pague 2, atacado), identifique-a. Retorne APENAS um JSON com as chaves: name, price, quantity, unit, promotionType, promotionDetails." },
            { inlineData: { mimeType: "image/jpeg", data: base64Image.split(',')[1] || base64Image } }
          ]
        }
      ],
      config: {
        responseMimeType: "application/json"
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text) as OCRResult;
    }
  } catch (error) {
    console.error("Gemini OCR Error:", error);
  }
  return null;
};

export const analyzeDeal = async (productName: string, pricePerUnit: number, unit: string): Promise<string> => {
  try {
    const response = await getAI().models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `O produto "${productName}" está custando ${pricePerUnit} por ${unit}. No mercado brasileiro atual, isso é considerado um bom preço, médio ou caro? Dê uma resposta curta e direta de uma frase.`
    });
    return response.text || "Sem dados comparativos no momento.";
  } catch (error) {
    return "Não foi possível analisar o preço no momento.";
  }
};

export const searchMarketPromotions = async (market: string, location: string): Promise<MarketPromotion[]> => {
  try {
    const response = await getAI().models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Busque as principais promoções e ofertas do dia para o supermercado "${market}" em "${location}". Foque em itens de cesta básica, carnes e hortifruti. Retorne uma lista de produtos com preço e descrição curta.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              product: { type: Type.STRING },
              price: { type: Type.NUMBER },
              unit: { type: Type.STRING },
              description: { type: Type.STRING }
            },
            required: ["product", "price", "unit"]
          }
        }
      }
    });
    
    const text = response.text;
    if (text) {
      return JSON.parse(text) as MarketPromotion[];
    }
    return [];
  } catch (error) {
    console.error("Erro ao buscar promoções:", error);
    return [];
  }
};

export const compareCartAcrossMarkets = async (cartItems: string[], location: string): Promise<MarketComparison[]> => {
  try {
    const response = await getAI().models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Compare o custo total desta lista de compras: [${cartItems.join(', ')}] em 3 ou 4 grandes supermercados em "${location}". 
      Para cada mercado, encontre o preço aproximado de cada item hoje e calcule o total. 
      Se não encontrar um item específico, use uma estimativa baseada no mercado local.
      Retorne uma lista de objetos MarketComparison em JSON.`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              marketName: { type: Type.STRING },
              totalPrice: { type: Type.NUMBER },
              foundItemsCount: { type: Type.NUMBER },
              totalItemsCount: { type: Type.NUMBER },
              items: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    name: { type: Type.STRING },
                    price: { type: Type.NUMBER },
                    found: { type: Type.BOOLEAN }
                  },
                  required: ["name", "price", "found"]
                }
              }
            },
            required: ["marketName", "totalPrice", "foundItemsCount", "totalItemsCount", "items"]
          }
        }
      }
    });

    const text = response.text;
    if (text) {
      return JSON.parse(text) as MarketComparison[];
    }
    return [];
  } catch (error) {
    console.error("Erro ao comparar mercados:", error);
    return [];
  }
};
