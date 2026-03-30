import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Trash2, ShoppingCart, Package, AlertCircle, CreditCard, Sparkles } from 'lucide-react';
import { CartItem, Category } from '../types';
import { formatCurrency, getCategoryIcon } from '../utils';

interface CartViewProps {
  cart: CartItem[];
  budget: number;
  onBack: () => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onCompareMarkets: () => void;
}

export const CartView: React.FC<CartViewProps> = ({ cart, budget, onBack, onRemove, onClear, onCompareMarkets }) => {
  const total = cart.reduce((acc, item) => acc + item.finalPrice, 0);
  const budgetProgress = budget > 0 ? (total / budget) * 100 : 0;

  // Group by category
  const groupedCart = cart.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = [];
    acc[item.category].push(item);
    return acc;
  }, {} as Record<Category, CartItem[]>);

  const categories = Object.keys(groupedCart) as Category[];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 -ml-2 text-gray-400 hover:text-black">
            <ArrowLeft size={20} />
          </button>
          <h2 className="text-xl font-semibold">Meu Carrinho</h2>
        </div>
        {cart.length > 0 && (
          <button onClick={onClear} className="text-xs text-red-400 hover:text-red-600 font-medium flex items-center gap-1">
            <Trash2 size={14} />
            Limpar
          </button>
        )}
      </div>

      {budget > 0 && (
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Orçamento: {formatCurrency(budget)}</p>
            <p className={`text-xs font-bold ${budgetProgress > 100 ? 'text-red-500' : 'text-gray-400'}`}>
              {budgetProgress.toFixed(0)}%
            </p>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
            <div 
              className={`h-full transition-all duration-500 ${budgetProgress > 100 ? 'bg-red-500' : budgetProgress > 80 ? 'bg-orange-400' : 'bg-green-500'}`} 
              style={{ width: `${Math.min(budgetProgress, 100)}%` }}
            ></div>
          </div>
        </div>
      )}

      {cart.length === 0 ? (
        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-300">
            <ShoppingCart size={40} />
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Carrinho Vazio</h3>
            <p className="text-sm text-gray-400">Você ainda não adicionou nenhum item.</p>
          </div>
          <button 
            onClick={onBack}
            className="bg-[#4A4A4A] text-white px-6 py-3 rounded-2xl text-sm font-medium"
          >
            Começar a Comprar
          </button>
        </div>
      ) : (
        <>
          <div className="space-y-6">
            {categories.map(category => (
              <div key={category} className="space-y-2">
                <div className="flex items-center gap-2 px-2">
                  <div className="text-gray-400">{getCategoryIcon(category)}</div>
                  <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest">{category}</h3>
                </div>
                <div className="space-y-2">
                  {groupedCart[category].map((item, idx) => (
                    <motion.div 
                      key={item.id + idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="bg-white p-4 rounded-3xl border border-gray-100 flex items-center gap-4"
                    >
                      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                        <Package size={20} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-gray-800 truncate">
                          {item.name || 'Produto sem nome'}
                        </h4>
                        <p className="text-xs text-gray-400">
                          {item.quantity}{item.unit} • {item.appliedPromoDescription}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono font-bold text-gray-800">{formatCurrency(item.finalPrice)}</p>
                        <button 
                          onClick={() => onRemove(item.id)}
                          className="text-[10px] text-red-400 hover:text-red-600 font-bold uppercase tracking-tighter"
                        >
                          Remover
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="bg-[#1A1A1A] text-white p-8 rounded-[2rem] shadow-xl mt-8">
            <div className="flex justify-between items-end mb-6">
              <div>
                <p className="text-gray-500 text-[10px] uppercase font-bold mb-1">Total da Compra</p>
                <p className="text-5xl font-light tracking-tighter">{formatCurrency(total)}</p>
              </div>
              <div className="text-right space-y-3">
                <button 
                  onClick={onCompareMarkets}
                  className="flex items-center gap-2 px-4 py-2 bg-white/10 text-white rounded-xl text-[10px] font-bold hover:bg-white/20 transition-colors border border-white/10"
                >
                  <Sparkles size={14} className="text-orange-400" />
                  Comparar Mercados
                </button>
                <p className="text-xs text-gray-500">{cart.length} itens</p>
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/10 flex items-start gap-3">
                <AlertCircle className="text-orange-400 shrink-0" size={18} />
                <p className="text-xs text-gray-400 leading-relaxed">
                  Lembre-se de conferir se todas as promoções de atacado foram atingidas no caixa.
                </p>
              </div>
              
              <button className="w-full bg-white text-black py-4 rounded-2xl font-semibold flex items-center justify-center gap-2">
                <CreditCard size={18} />
                Finalizar Lista
              </button>
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
};
