import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Plus, Trash2, ShoppingCart, CheckCircle2, Circle, Package, Search } from 'lucide-react';
import { ShoppingListItem, Category, Unit } from '../types';
import { getCategoryIcon } from '../utils';

interface ShoppingListViewProps {
  items: ShoppingListItem[];
  onBack: () => void;
  onAddItem: (item: Omit<ShoppingListItem, 'id' | 'isBought'>) => void;
  onUpdateItem: (item: ShoppingListItem) => void;
  onDeleteItem: (id: string) => void;
  onToggleBought: (id: string) => void;
  onAddToCart: (item: ShoppingListItem) => void;
}

const CATEGORIES: Category[] = ['Hortifruti', 'Açougue', 'Laticínios', 'Padaria', 'Limpeza', 'Higiene', 'Bebidas', 'Mercearia', 'Outros'];
const UNITS: Unit[] = ['un', 'kg', 'g', 'L', 'ml'];

export const ShoppingListView: React.FC<ShoppingListViewProps> = ({ 
  items, 
  onBack, 
  onAddItem, 
  onUpdateItem,
  onDeleteItem, 
  onToggleBought,
  onAddToCart
}) => {
  const [newItemName, setNewItemName] = useState('');
  const [newItemQty, setNewItemQty] = useState(1);
  const [newItemUnit, setNewItemUnit] = useState<Unit>('un');
  const [newItemCategory, setNewItemCategory] = useState<Category>('Outros');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<ShoppingListItem | null>(null);

  const handleAdd = () => {
    if (!newItemName.trim()) return;
    onAddItem({
      name: newItemName,
      quantity: newItemQty,
      unit: newItemUnit,
      category: newItemCategory
    });
    setNewItemName('');
    setNewItemQty(1);
    setShowAddForm(false);
  };

  const handleUpdate = () => {
    if (!editingItem || !editingItem.name.trim()) return;
    onUpdateItem(editingItem);
    setEditingItem(null);
  };

  const sortedItems = [...items].sort((a, b) => {
    if (a.isBought === b.isBought) return 0;
    return a.isBought ? 1 : -1;
  });

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <header className="p-4 bg-white border-b flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <h2 className="text-xl font-bold text-gray-900">Lista de Compras</h2>
        </div>
        <button 
          onClick={() => setShowAddForm(!showAddForm)}
          className="p-2 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-colors"
        >
          <Plus size={20} />
        </button>
      </header>

      <main className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {showAddForm && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 space-y-4 overflow-hidden"
            >
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-gray-500">Novo Item</h3>
                <button onClick={() => setShowAddForm(false)} className="text-gray-400 hover:text-gray-600">
                  <ArrowLeft size={16} className="rotate-90" />
                </button>
              </div>
              <input
                type="text"
                value={newItemName}
                onChange={(e) => setNewItemName(e.target.value)}
                placeholder="O que você precisa comprar?"
                className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-gray-200"
              />
              <div className="flex gap-2">
                <div className="flex-1">
                  <label className="text-[10px] text-gray-400 uppercase font-bold ml-1">Quantidade</label>
                  <input
                    type="number"
                    inputMode="decimal"
                    value={newItemQty}
                    onChange={(e) => setNewItemQty(parseFloat(e.target.value) || 0)}
                    className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-gray-200"
                  />
                </div>
                <div className="w-24">
                  <label className="text-[10px] text-gray-400 uppercase font-bold ml-1">Unidade</label>
                  <select
                    value={newItemUnit}
                    onChange={(e) => setNewItemUnit(e.target.value as Unit)}
                    className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-gray-200"
                  >
                    {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="text-[10px] text-gray-400 uppercase font-bold ml-1">Categoria</label>
                <select
                  value={newItemCategory}
                  onChange={(e) => setNewItemCategory(e.target.value as Category)}
                  className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-gray-200"
                >
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <button
                onClick={handleAdd}
                className="w-full py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
              >
                Adicionar à Lista
              </button>
            </motion.div>
          )}

          {editingItem && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/20 backdrop-blur-sm"
            >
              <div className="bg-white w-full max-w-sm p-6 rounded-3xl shadow-xl space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-bold">Editar Item</h3>
                  <button onClick={() => setEditingItem(null)} className="text-gray-400 hover:text-gray-600">
                    <Plus className="rotate-45" size={24} />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Nome</label>
                    <input
                      type="text"
                      value={editingItem.name}
                      onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                      className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-gray-200"
                    />
                  </div>
                  
                  <div className="flex gap-2">
                    <div className="flex-1">
                      <label className="text-xs text-gray-400 mb-1 block">Quantidade</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        value={editingItem.quantity}
                        onChange={(e) => setEditingItem({ ...editingItem, quantity: parseFloat(e.target.value) || 0 })}
                        className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-gray-200"
                      />
                    </div>
                    <div className="w-24">
                      <label className="text-xs text-gray-400 mb-1 block">Unidade</label>
                      <select
                        value={editingItem.unit}
                        onChange={(e) => setEditingItem({ ...editingItem, unit: e.target.value as Unit })}
                        className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-gray-200"
                      >
                        {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-gray-400 mb-1 block">Categoria</label>
                    <select
                      value={editingItem.category}
                      onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value as Category })}
                      className="w-full p-3 bg-gray-50 border-none rounded-xl focus:ring-2 focus:ring-gray-200"
                    >
                      {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setEditingItem(null)}
                    className="flex-1 py-3 bg-gray-100 text-gray-600 rounded-xl font-bold hover:bg-gray-200 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleUpdate}
                    className="flex-1 py-3 bg-gray-900 text-white rounded-xl font-bold hover:bg-gray-800 transition-colors"
                  >
                    Salvar
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          {sortedItems.length === 0 ? (
            <div className="text-center py-20 text-gray-400">
              <Package size={48} className="mx-auto mb-4 opacity-20" />
              <p>Sua lista está vazia.</p>
              <p className="text-xs">Comece adicionando o que você precisa!</p>
            </div>
          ) : (
            sortedItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`bg-white p-4 rounded-xl border flex items-center gap-4 group transition-all ${item.isBought ? 'opacity-50 border-gray-100' : 'border-gray-100 shadow-sm'}`}
              >
                <button 
                  onClick={() => onToggleBought(item.id)}
                  className={`shrink-0 transition-colors ${item.isBought ? 'text-green-500' : 'text-gray-300 hover:text-gray-400'}`}
                >
                  {item.isBought ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>

                <div className="flex-1 min-w-0" onClick={() => !item.isBought && setEditingItem(item)}>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">{getCategoryIcon(item.category)}</span>
                    <h4 className={`font-bold text-gray-900 truncate ${item.isBought ? 'line-through' : ''}`}>
                      {item.name}
                    </h4>
                  </div>
                  <p className="text-xs text-gray-500">
                    {item.quantity}{item.unit} • {item.category}
                  </p>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  {!item.isBought && (
                    <button
                      onClick={() => onAddToCart(item)}
                      className="p-2 bg-orange-50 text-orange-600 rounded-lg hover:bg-orange-600 hover:text-white transition-all"
                      title="Adicionar ao Carrinho"
                    >
                      <ShoppingCart size={18} />
                    </button>
                  )}
                  <button
                    onClick={() => onDeleteItem(item.id)}
                    className="p-2 text-red-400 hover:text-red-600 transition-colors"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </main>
    </div>
  );
};
