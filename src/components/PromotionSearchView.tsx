import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Search, Store, Sparkles, Loader2, Plus, ExternalLink } from 'lucide-react';
import { MarketPromotion, Product } from '../types';
import { searchMarketPromotions } from '../services/geminiService';
import { formatCurrency } from '../utils';

interface PromotionSearchViewProps {
  location: string;
  onBack: () => void;
  onAddProduct: (p: Product) => void;
}

const COMMON_MARKETS = [
  'Zaffari',
  'Bourbon',
  'Asun',
  'Rissul',
  'Carrefour',
  'BIG',
  'Nacional',
  'Atacadão',
  'Desco'
];

export const PromotionSearchView: React.FC<PromotionSearchViewProps> = ({ location, onBack, onAddProduct }) => {
  const [market, setMarket] = useState('');
  const [loading, setLoading] = useState(false);
  const [promotions, setPromotions] = useState<MarketPromotion[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = async (selectedMarket?: string) => {
    const targetMarket = selectedMarket || market;
    if (!targetMarket) return;

    setLoading(true);
    setSearched(true);
    try {
      const results = await searchMarketPromotions(targetMarket, location);
      setPromotions(results);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = (promo: MarketPromotion) => {
    const newProduct: Product = {
      id: Math.random().toString(36).substr(2, 9),
      name: promo.product,
      price: promo.price,
      quantity: 1,
      unit: (promo.unit.toLowerCase().includes('kg') ? 'kg' : 'un') as any,
      category: 'Outros',
      promotion: { type: 'none' },
      store: market || 'Mercado'
    };
    onAddProduct(newProduct);
  };

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="p-4 bg-white border-b flex items-center gap-4 sticky top-0 z-10">
        <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
          <ArrowLeft size={24} />
        </button>
        <h2 className="text-xl font-bold text-gray-900">Buscar Ofertas</h2>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-6">
        <div className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-2 text-orange-600 mb-2">
            <Sparkles size={20} />
            <span className="text-sm font-semibold uppercase tracking-wider">IA de Ofertas</span>
          </div>
          
          <div className="relative">
            <input
              type="text"
              value={market}
              onChange={(e) => setMarket(e.target.value)}
              placeholder="Qual supermercado?"
              className="w-full p-4 pl-12 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-orange-500 transition-all"
            />
            <Store className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          </div>

          <div className="flex flex-wrap gap-2">
            {COMMON_MARKETS.map(m => (
              <button
                key={m}
                onClick={() => {
                  setMarket(m);
                  handleSearch(m);
                }}
                className="px-3 py-1.5 bg-gray-100 hover:bg-orange-100 hover:text-orange-700 rounded-lg text-sm font-medium transition-colors"
              >
                {m}
              </button>
            ))}
          </div>

          <button
            onClick={() => handleSearch()}
            disabled={loading || !market}
            className="w-full py-4 bg-orange-600 text-white rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-orange-700 disabled:opacity-50 transition-all shadow-lg shadow-orange-200"
          >
            {loading ? <Loader2 className="animate-spin" /> : <Search size={20} />}
            {loading ? 'Buscando encartes...' : 'Buscar Promoções Hoje'}
          </button>
          
          <p className="text-xs text-center text-gray-500">
            Buscando em: <span className="font-semibold">{location}</span>
          </p>
        </div>

        <div className="space-y-4">
          <h3 className="font-bold text-gray-700 flex items-center gap-2">
            {searched ? 'Resultados Encontrados' : 'Sugestões para você'}
          </h3>

          <AnimatePresence mode="popLayout">
            {loading ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col items-center justify-center py-12 text-gray-400 gap-4"
              >
                <div className="relative">
                  <div className="w-16 h-16 border-4 border-orange-100 border-t-orange-600 rounded-full animate-spin"></div>
                  <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-600" size={24} />
                </div>
                <p className="text-sm animate-pulse">A IA está lendo os encartes digitais...</p>
              </motion.div>
            ) : promotions.length > 0 ? (
              <div className="grid gap-3">
                {promotions.map((promo, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between group hover:border-orange-200 transition-all"
                  >
                    <div className="flex-1">
                      <h4 className="font-bold text-gray-900">{promo.product}</h4>
                      <p className="text-xs text-gray-500">{promo.description}</p>
                      <div className="mt-1 flex items-center gap-2">
                        <span className="text-lg font-black text-orange-600">{formatCurrency(promo.price)}</span>
                        <span className="text-xs text-gray-400">/ {promo.unit}</span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleAdd(promo)}
                      className="p-3 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-600 hover:text-white transition-all"
                    >
                      <Plus size={20} />
                    </button>
                  </motion.div>
                ))}
              </div>
            ) : searched && (
              <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                <p className="text-gray-500">Nenhuma oferta clara encontrada para hoje.</p>
                <button onClick={() => handleSearch()} className="text-orange-600 font-bold mt-2 text-sm">Tentar novamente</button>
              </div>
            )}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
};
