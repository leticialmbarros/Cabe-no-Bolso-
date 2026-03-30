import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Wallet, CreditCard, History, Trash2, MapPin } from 'lucide-react';
import { AppSettings, PriceHistoryEntry } from '../types';
import { formatCurrency } from '../utils';

interface SettingsViewProps {
  settings: AppSettings;
  onUpdateSettings: (s: AppSettings) => void;
  priceHistory: PriceHistoryEntry[];
  onClearHistory: () => void;
  onBack: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ 
  settings, 
  onUpdateSettings, 
  priceHistory, 
  onClearHistory, 
  onBack 
}) => {
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
        <h2 className="text-xl font-semibold">Configurações</h2>
      </div>

      <div className="space-y-4">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-2 text-gray-400">
            <MapPin size={18} />
            <h3 className="text-xs font-bold uppercase tracking-widest">Localização</h3>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Cidade e Estado</label>
            <input 
              type="text"
              placeholder="Ex: Porto Alegre, RS"
              className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-gray-200"
              value={settings.location || ''}
              onChange={e => onUpdateSettings({ ...settings, location: e.target.value })}
            />
            <p className="text-[10px] text-gray-400 mt-2">Usado para buscar promoções em mercados próximos a você.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-2 text-gray-400">
            <Wallet size={18} />
            <h3 className="text-xs font-bold uppercase tracking-widest">Orçamento</h3>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Meta de Gasto (R$)</label>
            <input 
              type="number"
              placeholder="0,00"
              className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-gray-200"
              value={settings.budget || ''}
              onChange={e => onUpdateSettings({ ...settings, budget: parseFloat(e.target.value) || 0 })}
            />
            <p className="text-[10px] text-gray-400 mt-2">Defina um limite para acompanhar seu progresso no carrinho.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center gap-2 text-gray-400">
            <CreditCard size={18} />
            <h3 className="text-xs font-bold uppercase tracking-widest">Fidelidade</h3>
          </div>
          <div>
            <label className="text-xs text-gray-400 mb-1 block">Desconto Padrão (%)</label>
            <input 
              type="number"
              placeholder="0"
              className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-gray-200"
              value={settings.loyaltyDiscount || ''}
              onChange={e => onUpdateSettings({ ...settings, loyaltyDiscount: parseFloat(e.target.value) || 0 })}
            />
            <p className="text-[10px] text-gray-400 mt-2">Ex: Desconto automático aplicado para membros do clube ou CPF na nota.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-gray-400">
              <History size={18} />
              <h3 className="text-xs font-bold uppercase tracking-widest">Histórico de Preços</h3>
            </div>
            {priceHistory.length > 0 && (
              <button onClick={onClearHistory} className="text-[10px] text-red-400 font-bold uppercase">Limpar</button>
            )}
          </div>
          
          {priceHistory.length === 0 ? (
            <p className="text-xs text-gray-400 italic">Nenhum preço salvo ainda.</p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
              {priceHistory.map((entry, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs py-2 border-b border-gray-50 last:border-0">
                  <span className="text-gray-600 font-medium truncate max-w-[150px]">{entry.productName}</span>
                  <span className="text-gray-400 font-mono">{formatCurrency(entry.pricePerUnit)}/{entry.unit}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};
