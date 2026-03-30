import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Check, TrendingDown, Info, ShoppingCart, Sparkles, Loader2 } from 'lucide-react';
import { Product } from '../types';
import { calculateRealPrice, formatUnitValue } from '../utils';
import { ProductForm } from './ProductForm';
import { analyzeDeal } from '../services/geminiService';

interface CompareViewProps {
  onBack: () => void;
  onAddToCart: (p: Product) => void;
  loyaltyDiscount: number;
}

export const CompareView: React.FC<CompareViewProps> = ({ onBack, onAddToCart, loyaltyDiscount }) => {
  const [p1, setP1] = useState<Product>({ id: '1', name: '', price: 0, quantity: 0, unit: 'un', promotion: { type: 'none' }, category: 'Mercearia' });
  const [p2, setP2] = useState<Product>({ id: '2', name: '', price: 0, quantity: 0, unit: 'un', promotion: { type: 'none' }, category: 'Mercearia' });
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const res1 = calculateRealPrice(p1, loyaltyDiscount);
  const res2 = calculateRealPrice(p2, loyaltyDiscount);

  const isValid = p1.price > 0 && p1.quantity > 0 && p2.price > 0 && p2.quantity > 0;
  
  let winner: Product | null = null;
  let savings = 0;

  if (isValid) {
    if (res1.pricePerUnit < res2.pricePerUnit) {
      winner = p1;
      savings = ((res2.pricePerUnit - res1.pricePerUnit) / res2.pricePerUnit) * 100;
    } else if (res2.pricePerUnit < res1.pricePerUnit) {
      winner = p2;
      savings = ((res1.pricePerUnit - res2.pricePerUnit) / res1.pricePerUnit) * 100;
    }
  }

  useEffect(() => {
    if (winner && winner.name) {
      const timer = setTimeout(async () => {
        setIsAnalyzing(true);
        const analysis = await analyzeDeal(
          winner!.name, 
          winner === p1 ? res1.pricePerUnit : res2.pricePerUnit, 
          winner!.unit
        );
        setAiAnalysis(analysis);
        setIsAnalyzing(false);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setAiAnalysis(null);
    }
  }, [winner?.id, winner?.name]);

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
        <h2 className="text-xl font-semibold">Comparar Produtos</h2>
      </div>

      <div className="space-y-4">
        <ProductForm label="Opção A" product={p1} onChange={setP1} />
        <div className="flex justify-center">
          <div className="bg-gray-200 h-px w-full max-w-[100px] self-center"></div>
          <span className="px-4 text-[10px] font-bold text-gray-300 uppercase tracking-widest">VS</span>
          <div className="bg-gray-200 h-px w-full max-w-[100px] self-center"></div>
        </div>
        <ProductForm label="Opção B" product={p2} onChange={setP2} />
      </div>

      {isValid && (
        <motion.div 
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-[#1A1A1A] text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <TrendingDown size={120} />
          </div>

          <div className="relative z-10">
            <div className="flex items-center gap-2 text-green-400 mb-4">
              <Check size={20} />
              <span className="text-xs font-bold uppercase tracking-widest">Melhor Escolha</span>
            </div>

            <h3 className="text-3xl font-light mb-6">
              {winner ? (winner === p1 ? 'Opção A' : 'Opção B') : 'Empate'} é mais vantajosa
            </h3>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Preço Real Unitário</p>
                <p className="text-xl font-mono">{formatUnitValue(winner === p1 ? res1.pricePerUnit : res2.pricePerUnit, winner === p1 ? p1.unit : p2.unit)}</p>
              </div>
              <div>
                <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Economia de</p>
                <p className="text-xl font-mono text-green-400">{savings.toFixed(1)}%</p>
              </div>
            </div>

            {aiAnalysis && (
              <div className="mb-8 p-4 bg-white/5 rounded-2xl border border-white/10 flex gap-3">
                <Sparkles className="text-blue-400 shrink-0" size={18} />
                <p className="text-xs text-gray-300 italic">
                  {aiAnalysis}
                </p>
              </div>
            )}

            {isAnalyzing && (
              <div className="mb-8 flex items-center gap-2 text-xs text-gray-500">
                <Loader2 size={14} className="animate-spin" />
                Analisando oferta com IA...
              </div>
            )}

            <div className="space-y-3">
              <button 
                onClick={() => winner && onAddToCart(winner)}
                className="w-full bg-white text-black py-4 rounded-2xl font-semibold hover:bg-gray-100 transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingCart size={18} />
                Adicionar ao Carrinho
              </button>
              <p className="text-[10px] text-center text-gray-500">
                Calculado com base no preço real após promoções aplicadas.
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {!isValid && (
        <div className="p-8 border-2 border-dashed border-gray-200 rounded-[2rem] flex flex-col items-center justify-center text-center space-y-3">
          <Info className="text-gray-300" size={32} />
          <p className="text-sm text-gray-400 max-w-[200px]">Preencha os dados acima para ver a comparação</p>
        </div>
      )}
    </motion.div>
  );
};
