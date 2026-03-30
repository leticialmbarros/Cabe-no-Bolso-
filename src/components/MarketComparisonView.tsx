import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Store, TrendingDown, AlertCircle, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { MarketComparison, CartItem } from '../types';
import { compareCartAcrossMarkets } from '../services/geminiService';
import { formatCurrency } from '../utils';

interface MarketComparisonViewProps {
  cart: CartItem[];
  location: string;
  onBack: () => void;
}

export const MarketComparisonView: React.FC<MarketComparisonViewProps> = ({ cart, location, onBack }) => {
  const [comparisons, setComparisons] = useState<MarketComparison[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const performComparison = async () => {
      const itemNames = cart.map(item => `${item.name} (${item.quantity}${item.unit})`);
      try {
        const results = await compareCartAcrossMarkets(itemNames, location);
        // Sort by total price
        setComparisons(results.sort((a, b) => a.totalPrice - b.totalPrice));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    performComparison();
  }, [cart, location]);

  const cheapestMarket = comparisons[0];

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="p-4 bg-white border-b flex items-center gap-4 sticky top-0 z-10">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-gray-900">Comparar Mercados</h2>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20 text-center gap-6"
            >
              <div className="relative">
                <div className="w-20 h-20 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-600" size={32} />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-bold text-gray-900">Analisando sua lista...</h3>
                <p className="text-sm text-gray-500 max-w-xs mx-auto">
                  A IA está pesquisando os preços atuais em {location} para encontrar o melhor lugar para você comprar.
                </p>
              </div>
            </motion.div>
          ) : comparisons.length > 0 ? (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Summary Card */}
              <div className="bg-green-600 text-white p-6 rounded-3xl shadow-lg shadow-green-100 flex items-center justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-widest opacity-80 mb-1">Melhor Opção</p>
                  <h3 className="text-2xl font-black">{cheapestMarket.marketName}</h3>
                  <p className="text-sm opacity-90 mt-1">Economia estimada para sua lista</p>
                </div>
                <div className="text-right">
                  <p className="text-3xl font-black">{formatCurrency(cheapestMarket.totalPrice)}</p>
                  <div className="flex items-center gap-1 justify-end mt-1">
                    <TrendingDown size={14} />
                    <span className="text-xs font-bold">Mais barato</span>
                  </div>
                </div>
              </div>

              {/* Market List */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-2">Comparativo Geral</h3>
                {comparisons.map((comp, idx) => (
                  <div 
                    key={idx}
                    className={`bg-white p-5 rounded-2xl border transition-all ${idx === 0 ? 'border-green-500 ring-1 ring-green-500' : 'border-gray-100'}`}
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <Store size={18} className={idx === 0 ? 'text-green-600' : 'text-gray-400'} />
                          <h4 className="font-bold text-gray-900">{comp.marketName}</h4>
                          {idx === 0 && <CheckCircle2 size={16} className="text-green-600" />}
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {comp.foundItemsCount} de {comp.totalItemsCount} itens encontrados
                        </p>
                      </div>
                      <div className="text-right">
                        <p className={`text-xl font-black ${idx === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                          {formatCurrency(comp.totalPrice)}
                        </p>
                        {idx > 0 && (
                          <p className="text-[10px] text-red-500 font-bold">
                            +{formatCurrency(comp.totalPrice - cheapestMarket.totalPrice)}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Mini Item List */}
                    <div className="space-y-1 border-t border-gray-50 pt-3">
                      {comp.items.slice(0, 3).map((item, i) => (
                        <div key={i} className="flex justify-between text-[10px]">
                          <span className="text-gray-500 truncate max-w-[150px]">{item.name}</span>
                          <span className="font-mono text-gray-400">{formatCurrency(item.price)}</span>
                        </div>
                      ))}
                      {comp.items.length > 3 && (
                        <p className="text-[10px] text-gray-400 italic">...e mais {comp.items.length - 3} itens</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex gap-3">
                <AlertCircle className="text-blue-600 shrink-0" size={20} />
                <p className="text-xs text-blue-800 leading-relaxed">
                  Os preços são estimativas baseadas em encartes e sites oficiais. A disponibilidade pode variar conforme a unidade do mercado.
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <AlertCircle className="mx-auto text-gray-300 mb-4" size={48} />
              <h3 className="text-lg font-bold text-gray-900">Ops! Não conseguimos comparar.</h3>
              <p className="text-sm text-gray-500 mt-2">
                Tente novamente em alguns instantes ou verifique sua conexão.
              </p>
              <button 
                onClick={onBack}
                className="mt-6 px-6 py-2 bg-gray-900 text-white rounded-full text-sm font-bold"
              >
                Voltar
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};
