import React, { useState, useRef } from 'react';
import { motion } from 'motion/react';
import { Tag, Camera, Loader2, Scale } from 'lucide-react';
import { Product, Unit, PromotionType, Promotion, Category } from '../types';
import { analyzeLabelImage } from '../services/geminiService';

interface ProductFormProps {
  label: string;
  product: Product;
  onChange: (p: Product) => void;
}

const CATEGORIES: Category[] = [
  'Hortifruti', 'Açougue', 'Laticínios', 'Padaria', 'Limpeza', 'Higiene', 'Bebidas', 'Mercearia', 'Outros'
];

export const ProductForm: React.FC<ProductFormProps> = ({ label, product, onChange }) => {
  const [showPromo, setShowPromo] = useState(product.promotion.type !== 'none');
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const updatePromo = (updates: Partial<Promotion>) => {
    onChange({
      ...product,
      promotion: { ...product.promotion, ...updates }
    });
  };

  const handleScan = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsScanning(true);
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const result = await analyzeLabelImage(base64);
      if (result) {
        onChange({
          ...product,
          name: result.name || product.name,
          price: result.price || product.price,
          quantity: result.quantity || product.quantity,
          unit: (result.unit?.toLowerCase() as Unit) || product.unit,
        });
      }
      setIsScanning(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">{label}</h3>
        <button 
          onClick={() => fileInputRef.current?.click()}
          disabled={isScanning}
          className="flex items-center gap-1 text-xs font-bold text-blue-500 bg-blue-50 px-3 py-1.5 rounded-full hover:bg-blue-100 transition-colors"
        >
          {isScanning ? <Loader2 size={14} className="animate-spin" /> : <Camera size={14} />}
          {isScanning ? 'Analisando...' : 'Escanear Etiqueta'}
        </button>
        <input 
          type="file" 
          accept="image/*" 
          capture="environment" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleScan}
        />
      </div>
      
      <div className="space-y-3">
        <div>
          <label className="text-xs text-gray-400 mb-1 block">Nome do Produto</label>
          <input 
            type="text"
            placeholder="Ex: Sabão Líquido"
            className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-gray-200"
            value={product.name}
            onChange={e => onChange({ ...product, name: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Categoria</label>
            <select 
              className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-gray-200 appearance-none"
              value={product.category}
              onChange={e => onChange({ ...product, category: e.target.value as Category })}
            >
              {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>
          <div className="flex items-end">
            <button 
              onClick={() => onChange({ ...product, isVariableWeight: !product.isVariableWeight })}
              className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-medium transition-colors ${product.isVariableWeight ? 'bg-green-100 text-green-700' : 'bg-gray-50 text-gray-400'}`}
            >
              <Scale size={14} />
              Peso Variável
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Preço (R$)</label>
            <input 
              type="number"
              inputMode="decimal"
              placeholder="0,00"
              className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-gray-200"
              value={product.price || ''}
              onChange={e => onChange({ ...product, price: parseFloat(e.target.value) || 0 })}
            />
          </div>
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="text-xs text-gray-400 mb-1 block">Qtd</label>
              <input 
                type="number"
                inputMode="decimal"
                placeholder="1"
                className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-gray-200"
                value={product.quantity || ''}
                onChange={e => onChange({ ...product, quantity: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div className="w-20">
              <label className="text-xs text-gray-400 mb-1 block">Un</label>
              <select 
                className="w-full bg-gray-50 border-none rounded-xl px-2 py-3 text-sm focus:ring-2 focus:ring-gray-200 appearance-none"
                value={product.unit}
                onChange={e => onChange({ ...product, unit: e.target.value as Unit })}
              >
                <option value="g">g</option>
                <option value="kg">kg</option>
                <option value="ml">ml</option>
                <option value="L">L</option>
                <option value="un">un</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-2">
        <button 
          onClick={() => {
            const next = !showPromo;
            setShowPromo(next);
            if (!next) onChange({ ...product, promotion: { type: 'none' } });
          }}
          className={`text-xs flex items-center gap-1 font-medium transition-colors ${showPromo ? 'text-orange-500' : 'text-gray-400 hover:text-gray-600'}`}
        >
          <Tag size={14} />
          {showPromo ? 'Remover Promoção' : 'Adicionar Promoção'}
        </button>

        {showPromo && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="mt-4 p-4 bg-orange-50 rounded-2xl space-y-3 overflow-hidden"
          >
            <select 
              className="w-full bg-white border-none rounded-xl px-3 py-2 text-xs focus:ring-2 focus:ring-orange-200"
              value={product.promotion.type}
              onChange={e => updatePromo({ type: e.target.value as PromotionType })}
            >
              <option value="none">Selecione o tipo...</option>
              <option value="buyXPayY">Leve X, Pague Y</option>
              <option value="secondUnitDiscount">2ª Unidade com Desconto</option>
              <option value="wholesale">Preço de Atacado</option>
              <option value="progressive">Desconto Progressivo</option>
              <option value="paymentMethod">Desconto PIX/Cartão</option>
            </select>

            {product.promotion.type === 'buyXPayY' && (
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="number" placeholder="Leve X" 
                  className="bg-white border-none rounded-lg px-3 py-2 text-xs"
                  onChange={e => updatePromo({ buyQty: parseInt(e.target.value) })}
                />
                <input 
                  type="number" placeholder="Pague Y" 
                  className="bg-white border-none rounded-lg px-3 py-2 text-xs"
                  onChange={e => updatePromo({ payQty: parseInt(e.target.value) })}
                />
              </div>
            )}

            {(product.promotion.type === 'secondUnitDiscount' || product.promotion.type === 'progressive' || product.promotion.type === 'paymentMethod') && (
              <div className="flex items-center gap-2">
                <input 
                  type="number" placeholder="% de Desconto" 
                  className="flex-1 bg-white border-none rounded-lg px-3 py-2 text-xs"
                  onChange={e => updatePromo({ discountPercentage: parseFloat(e.target.value) })}
                />
                <span className="text-xs text-orange-700 font-bold">%</span>
              </div>
            )}

            {product.promotion.type === 'wholesale' && (
              <div className="grid grid-cols-2 gap-2">
                <input 
                  type="number" placeholder="Qtd Mínima" 
                  className="bg-white border-none rounded-lg px-3 py-2 text-xs"
                  onChange={e => updatePromo({ minQty: parseInt(e.target.value) })}
                />
                <input 
                  type="number" placeholder="Preço Unitário" 
                  className="bg-white border-none rounded-lg px-3 py-2 text-xs"
                  onChange={e => updatePromo({ wholesalePrice: parseFloat(e.target.value) })}
                />
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
};
