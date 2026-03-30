export type Unit = 'g' | 'kg' | 'ml' | 'L' | 'un';

export type Category = 
  | 'Hortifruti' 
  | 'Açougue' 
  | 'Laticínios' 
  | 'Padaria' 
  | 'Limpeza' 
  | 'Higiene' 
  | 'Bebidas' 
  | 'Mercearia' 
  | 'Outros';

export type PromotionType = 
  | 'none'
  | 'buyXPayY' 
  | 'secondUnitDiscount' 
  | 'wholesale' 
  | 'progressive' 
  | 'paymentMethod' 
  | 'combo';

export interface Promotion {
  type: PromotionType;
  buyQty?: number;
  payQty?: number;
  discountPercentage?: number;
  minQty?: number;
  wholesalePrice?: number;
  description?: string;
}

export interface Product {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: Unit;
  promotion: Promotion;
  category: Category;
  isVariableWeight?: boolean; // For fruits/veggies
  store?: string;
}

export interface ShoppingListItem {
  id: string;
  name: string;
  quantity: number;
  unit: Unit;
  category: Category;
  isBought: boolean;
}

export interface CartItem extends Product {
  finalPrice: number;
  totalQuantity: number;
  appliedPromoDescription?: string;
  addedAt: number;
}

export interface PriceHistoryEntry {
  productName: string;
  pricePerUnit: number;
  unit: Unit;
  date: number;
  store?: string;
}

export interface AppSettings {
  budget: number;
  loyaltyDiscount: number; // e.g. 5% for "CPF na nota"
  location: string;
}

export interface MarketPromotion {
  product: string;
  price: number;
  unit: string;
  description: string;
}

export interface MarketComparison {
  marketName: string;
  totalPrice: number;
  foundItemsCount: number;
  totalItemsCount: number;
  items: {
    name: string;
    price: number;
    found: boolean;
  }[];
}
