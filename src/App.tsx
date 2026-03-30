import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Calculator, 
  ShoppingCart, 
  PlusCircle, 
  Settings,
  Wallet,
  History,
  Search,
  ListTodo
} from 'lucide-react';
import { Product, CartItem, AppSettings, PriceHistoryEntry, ShoppingListItem } from './types';
import { calculateRealPrice, formatCurrency } from './utils';

// Components
import { MenuButton } from './components/MenuButton';
import { CompareView } from './components/CompareView';
import { AddDirectView } from './components/AddDirectView';
import { CartView } from './components/CartView';
import { SettingsView } from './components/SettingsView';
import { PromotionSearchView } from './components/PromotionSearchView';
import { MarketComparisonView } from './components/MarketComparisonView';
import { ShoppingListView } from './components/ShoppingListView';

type View = 'menu' | 'compare' | 'add' | 'cart' | 'settings' | 'promoSearch' | 'marketCompare' | 'shoppingList';

export default function App() {
  const [view, setView] = useState<View>('menu');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [shoppingList, setShoppingList] = useState<ShoppingListItem[]>([]);
  const [settings, setSettings] = useState<AppSettings>({ budget: 0, loyaltyDiscount: 0, location: 'Porto Alegre, RS' });
  const [priceHistory, setPriceHistory] = useState<PriceHistoryEntry[]>([]);
  const [prefilledProduct, setPrefilledProduct] = useState<Partial<Product> | null>(null);
  
  // Persistence
  useEffect(() => {
    const savedCart = localStorage.getItem('cabe-no-bolso-cart');
    const savedList = localStorage.getItem('cabe-no-bolso-list');
    const savedSettings = localStorage.getItem('cabe-no-bolso-settings');
    const savedHistory = localStorage.getItem('cabe-no-bolso-history');

    if (savedCart) try { setCart(JSON.parse(savedCart)); } catch (e) {}
    if (savedList) try { setShoppingList(JSON.parse(savedList)); } catch (e) {}
    if (savedSettings) try { setSettings(JSON.parse(savedSettings)); } catch (e) {}
    if (savedHistory) try { setPriceHistory(JSON.parse(savedHistory)); } catch (e) {}
  }, []);

  useEffect(() => {
    localStorage.setItem('cabe-no-bolso-cart', JSON.stringify(cart));
    localStorage.setItem('cabe-no-bolso-list', JSON.stringify(shoppingList));
    localStorage.setItem('cabe-no-bolso-settings', JSON.stringify(settings));
    localStorage.setItem('cabe-no-bolso-history', JSON.stringify(priceHistory));
  }, [cart, shoppingList, settings, priceHistory]);

  const addToCart = (product: Product) => {
    const { totalPaid, pricePerUnit, promoDescription } = calculateRealPrice(product, settings.loyaltyDiscount);
    
    const newItem: CartItem = {
      ...product,
      finalPrice: totalPaid,
      totalQuantity: 1,
      appliedPromoDescription: promoDescription,
      addedAt: Date.now()
    };

    setCart([...cart, newItem]);

    // Log to history if it has a name
    if (product.name) {
      const historyEntry: PriceHistoryEntry = {
        productName: product.name,
        pricePerUnit,
        unit: product.unit,
        date: Date.now()
      };
      setPriceHistory(prev => [historyEntry, ...prev].slice(0, 50));
    }

    setView('cart');
  };

  const removeFromCart = (id: string) => {
    setCart(cart.filter(item => item.id !== id));
  };

  const clearCart = () => {
    if (confirm('Deseja limpar todo o carrinho?')) {
      setCart([]);
    }
  };

  // Shopping List Actions
  const addShoppingItem = (item: Omit<ShoppingListItem, 'id' | 'isBought'>) => {
    const newItem: ShoppingListItem = {
      ...item,
      id: Math.random().toString(36).substr(2, 9),
      isBought: false
    };
    setShoppingList([...shoppingList, newItem]);
  };

  const deleteShoppingItem = (id: string) => {
    setShoppingList(shoppingList.filter(item => item.id !== id));
  };

  const updateShoppingItem = (updatedItem: ShoppingListItem) => {
    setShoppingList(shoppingList.map(item => 
      item.id === updatedItem.id ? updatedItem : item
    ));
  };

  const toggleShoppingItem = (id: string) => {
    setShoppingList(shoppingList.map(item => 
      item.id === id ? { ...item, isBought: !item.isBought } : item
    ));
  };

  const moveToListToCart = (item: ShoppingListItem) => {
    // When moving to cart, we need to ask for the price since the list only has name/qty
    // For now, we'll open the "Add Direct" view with pre-filled data
    // Or just mark it as bought and let the user add it manually?
    // The user said: "clico no botão que adiciona diretamente no carrinho"
    // But we don't have the price. Let's redirect to 'add' with state.
    
    // Actually, let's just mark it as bought for now and provide a way to add it.
    // Or better: toggle it as bought and then the user can use the "Add Direct" or "Compare"
    // But the request is "add directly".
    // Let's implement a simple "Add to Cart" that prompts for price if missing?
    // No, let's just mark it as bought and maybe the user will add it via OCR or manual.
    
    // Re-reading: "clico no botão que adiciona diretamente no carrinho, assim posso ter a lista de compras e vou saber o que eu ja adicionei ao carrinho"
    // I will toggle it as bought and then the user can add it.
    // Actually, I'll implement a way to "buy" it which marks it as bought in the list.
    toggleShoppingItem(item.id);
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.finalPrice, 0);
  const budgetProgress = settings.budget > 0 ? (cartTotal / settings.budget) * 100 : 0;

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] font-sans pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10 flex justify-between items-center">
        <div className="flex items-center gap-2" onClick={() => setView('menu')} style={{ cursor: 'pointer' }}>
          <div className="w-8 h-8 bg-[#4A4A4A] rounded-lg flex items-center justify-center text-white">
            <Calculator size={18} />
          </div>
          <h1 className="text-xl font-semibold tracking-tight">Cabe no Bolso</h1>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setView('settings')}
            className={`p-2 transition-colors ${view === 'settings' ? 'text-black' : 'text-gray-400 hover:text-black'}`}
          >
            <Settings size={22} />
          </button>
          {cart.length > 0 && view !== 'cart' && (
            <button 
              onClick={() => setView('cart')}
              className="relative p-2 text-gray-600 hover:text-black transition-colors"
            >
              <ShoppingCart size={24} />
              <span className="absolute -top-1 -right-1 bg-[#4A4A4A] text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center">
                {cart.length}
              </span>
            </button>
          )}
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-6">
        <AnimatePresence mode="wait">
          {view === 'menu' && (
            <motion.div 
              key="menu"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              <div className="mb-8">
                <h2 className="text-2xl font-light text-gray-500 mb-1">Bem-vindo(a)</h2>
                <p className="text-gray-400 text-sm">O que vamos economizar hoje?</p>
              </div>

              <MenuButton 
                icon={<Search className="text-orange-600" />}
                title="Buscar Ofertas IA"
                description="Ver encartes de hoje nos mercados"
                onClick={() => setView('promoSearch')}
              />

              <MenuButton 
                icon={<ListTodo className="text-purple-500" />}
                title="Minha Lista"
                description="Planeje suas compras antes de ir"
                onClick={() => setView('shoppingList')}
                badge={shoppingList.filter(i => !i.isBought).length || undefined}
              />

              <MenuButton 
                icon={<Calculator className="text-blue-500" />}
                title="Comparar Produtos"
                description="Descubra qual embalagem vale mais a pena"
                onClick={() => setView('compare')}
              />
              
              <MenuButton 
                icon={<PlusCircle className="text-green-500" />}
                title="Adicionar Direto"
                description="Já sabe o que quer? Adicione ao carrinho"
                onClick={() => setView('add')}
              />

              <MenuButton 
                icon={<ShoppingCart className="text-orange-500" />}
                title="Ver Carrinho"
                description={`Total: ${formatCurrency(cartTotal)}`}
                onClick={() => setView('cart')}
                badge={cart.length > 0 ? cart.length : undefined}
              />

              {settings.budget > 0 && (
                <div className="mt-12 p-6 bg-white rounded-3xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-1">Orçamento Mensal</p>
                      <p className="text-4xl font-light tracking-tighter">{formatCurrency(settings.budget)}</p>
                    </div>
                    <div className="text-right">
                      <p className={`text-xs font-bold ${budgetProgress > 100 ? 'text-red-500' : 'text-gray-400'}`}>
                        {budgetProgress.toFixed(0)}% utilizado
                      </p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${budgetProgress > 100 ? 'bg-red-500' : budgetProgress > 80 ? 'bg-orange-400' : 'bg-green-500'}`} 
                      style={{ width: `${Math.min(budgetProgress, 100)}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {cart.length > 0 && settings.budget === 0 && (
                <div className="mt-12 p-6 bg-white rounded-3xl shadow-sm border border-gray-100">
                  <div className="flex justify-between items-end mb-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-gray-400 font-semibold mb-1">Total Atual</p>
                      <p className="text-4xl font-light tracking-tighter">{formatCurrency(cartTotal)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-400">{cart.length} itens no carrinho</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 h-1 rounded-full overflow-hidden">
                    <div className="bg-[#4A4A4A] h-full" style={{ width: '100%' }}></div>
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {view === 'compare' && (
            <CompareView 
              onBack={() => setView('menu')} 
              onAddToCart={addToCart} 
              loyaltyDiscount={settings.loyaltyDiscount}
            />
          )}

          {view === 'add' && (
            <AddDirectView 
              onBack={() => {
                setView('menu');
                setPrefilledProduct(null);
              }} 
              onAddToCart={(p) => {
                addToCart(p);
                setPrefilledProduct(null);
              }} 
              initialProduct={prefilledProduct || undefined}
            />
          )}

          {view === 'cart' && (
            <CartView 
              cart={cart} 
              budget={settings.budget}
              onBack={() => setView('menu')} 
              onRemove={removeFromCart}
              onClear={clearCart}
              onCompareMarkets={() => setView('marketCompare')}
            />
          )}

          {view === 'settings' && (
            <SettingsView 
              settings={settings}
              onUpdateSettings={setSettings}
              priceHistory={priceHistory}
              onClearHistory={() => setPriceHistory([])}
              onBack={() => setView('menu')}
            />
          )}

          {view === 'promoSearch' && (
            <PromotionSearchView
              location={settings.location}
              onBack={() => setView('menu')}
              onAddProduct={addToCart}
            />
          )}

          {view === 'marketCompare' && (
            <MarketComparisonView
              cart={cart}
              location={settings.location}
              onBack={() => setView('cart')}
            />
          )}

          {view === 'shoppingList' && (
            <ShoppingListView
              items={shoppingList}
              onBack={() => setView('menu')}
              onAddItem={addShoppingItem}
              onUpdateItem={updateShoppingItem}
              onDeleteItem={deleteShoppingItem}
              onToggleBought={toggleShoppingItem}
              onAddToCart={(item) => {
                // Mark as bought and go to add view to specify price
                if (!item.isBought) toggleShoppingItem(item.id);
                setPrefilledProduct({
                  name: item.name,
                  quantity: item.quantity,
                  unit: item.unit,
                  category: item.category
                });
                setView('add');
              }}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
