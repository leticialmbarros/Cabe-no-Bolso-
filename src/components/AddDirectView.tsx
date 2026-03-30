import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, PlusCircle } from 'lucide-react';
import { Product } from '../types';
import { ProductForm } from './ProductForm';

interface AddDirectViewProps {
  onBack: () => void;
  onAddToCart: (p: Product) => void;
  initialProduct?: Partial<Product>;
}

export const AddDirectView: React.FC<AddDirectViewProps> = ({ onBack, onAddToCart, initialProduct }) => {
  const [product, setProduct] = useState<Product>({ 
    id: Math.random().toString(36).substr(2, 9), 
    name: initialProduct?.name || '', 
    price: initialProduct?.price || 0, 
    quantity: initialProduct?.quantity || 1, 
    unit: initialProduct?.unit || 'un', 
    promotion: initialProduct?.promotion || { type: 'none' },
    category: initialProduct?.category || 'Mercearia'
  });

  const isValid = product.price > 0 && product.quantity > 0;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center gap-4 mb-2">
        <button onClick={onBack} className="p-2 -ml-2 text-gray-400 hover:text-black">
          <ArrowLeft size={20} />
        </button>
        <h2 className="text-xl font-semibold">Adicionar ao Carrinho</h2>
      </div>

      <ProductForm label="Detalhes do Produto" product={product} onChange={setProduct} />

      <button 
        disabled={!isValid}
        onClick={() => onAddToCart(product)}
        className={`w-full py-5 rounded-[2rem] font-semibold flex items-center justify-center gap-2 transition-all ${
          isValid 
            ? 'bg-[#4A4A4A] text-white shadow-lg active:scale-[0.98]' 
            : 'bg-gray-200 text-gray-400 cursor-not-allowed'
        }`}
      >
        <PlusCircle size={20} />
        Confirmar e Adicionar
      </button>
    </motion.div>
  );
};
