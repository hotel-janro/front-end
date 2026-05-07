import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch, API_HOST, getImageUrl } from '../../../api.js';
import { 
  UtensilsCrossed, 
  Clock, 
  Edit2, 
  Trash2, 
  Search, 
  Plus,
  ShoppingCart,
  LayoutGrid,
  ChevronRight,
  Star,
  Zap
} from 'lucide-react';
import { ImageWithFallback } from '../../../components/common/ImageWithFallback.jsx';
import AddMenuItemForm from './AddMenuItemForm';
import { AdminPOS } from './AdminPos';

export function AdminRestaurant() {
  const [activeTab, setActiveTab] = useState('menu'); // 'menu', 'pos'
  
  // Menu State
  const [menuItems, setMenuItems] = useState([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuSearch, setMenuSearch] = useState('');
  const [menuCategory, setMenuCategory] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);

  useEffect(() => {
    if (activeTab === 'menu') {
      loadMenu();
    }
  }, [activeTab]);

  const loadMenu = async () => {
    setMenuLoading(true);
    try {
      const data = await apiFetch('/menu?populate=inventoryItem');
      console.log('DEBUG: Menu Data:', data);
      setMenuItems(Array.isArray(data) ? data : []);
    } finally {
      setMenuLoading(false);
    }
  };

  const handleMenuSaved = async () => {
    setSelectedMenuItem(null);
    setShowAddForm(false);
    await loadMenu();
  };

  const handleMenuDelete = async (id) => {
    if (!window.confirm('Delete this menu item?')) return;
    try {
      await apiFetch(`/menu/${id}`, { method: 'DELETE' });
      await loadMenu();
    } catch (error) {
      alert('Error deleting item: ' + error.message);
    }
  };

  const visibleMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesSearch = !menuSearch || (item.name || '').toLowerCase().includes(menuSearch.toLowerCase());
      const matchesCategory = menuCategory === 'All' || item.category === menuCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, menuSearch, menuCategory]);

  const menuCategories = useMemo(() => {
    return ['All', ...new Set(menuItems.map((item) => item.category).filter(Boolean))];
  }, [menuItems]);

  const formatCurrency = (value) => `Rs ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Premium Header Banner */}
      <div className="relative rounded-[2.5rem] bg-[#0F172A] p-10 md:p-14 shadow-2xl overflow-hidden border border-white/5">
        {/* Abstract background elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#D4AF37]/10 rounded-full blur-[120px] -mr-48 -mt-48" />
        <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/10 rounded-full blur-[80px] -ml-24 -mb-24" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/20 text-[#D4AF37] text-[10px] font-bold uppercase tracking-[0.3em] mb-6">
              <Star className="w-3 h-3" /> Exclusive Culinary
            </div>
            <h2 className="text-4xl md:text-6xl text-white font-normal leading-tight mb-6" style={{ fontFamily: "DM Serif Display, serif" }}>
              {activeTab === 'menu' ? 'Fine Dining ' : 'Point of '} 
              <span className="text-[#D4AF37]">Management</span>
            </h2>
            <p className="text-slate-400 text-lg md:text-xl leading-relaxed font-light">
              {activeTab === 'menu' 
                ? 'Curate your world-class menu, set premium pricing, and manage dish availability with precision.'
                : 'Experience the fastest checkout system for your luxury dining patrons.'}
            </p>
          </div>
          
          <div className="flex flex-col gap-4">
             <div className="flex p-1.5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
              <button
                onClick={() => setActiveTab('menu')}
                className={`flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold transition-all duration-500 ${
                  activeTab === 'menu' ? 'bg-[#D4AF37] text-[#0F172A] shadow-lg shadow-[#D4AF37]/20 scale-105' : 'text-slate-400 hover:text-white'
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                Cuisine
              </button>
              <button
                onClick={() => setActiveTab('pos')}
                className={`flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold transition-all duration-500 ${
                  activeTab === 'pos' ? 'bg-[#D4AF37] text-[#0F172A] shadow-lg shadow-[#D4AF37]/20 scale-105' : 'text-slate-400 hover:text-white'
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                POS
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'menu' ? (
        <div className="space-y-10">
          {/* Controls Bar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row gap-4 flex-1 max-w-3xl">
              <div className="relative flex-1 group">
                <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-[#D4AF37] transition-colors" />
                <input
                  type="text"
                  placeholder="Search exotic dishes..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  className="w-full pl-14 pr-6 py-4 rounded-2xl bg-white border border-slate-200 focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/5 transition-all outline-none text-slate-700 shadow-sm"
                />
              </div>
              <div className="relative min-w-[200px]">
                <select
                  value={menuCategory}
                  onChange={(e) => setMenuCategory(e.target.value)}
                  className="w-full appearance-none rounded-2xl border border-slate-200 px-6 py-4 text-sm font-bold bg-white outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/5 transition-all shadow-sm cursor-pointer"
                >
                  {menuCategories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
                <ChevronRight className="absolute right-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 rotate-90 pointer-events-none" />
              </div>
            </div>
            
            <button 
              onClick={() => { setSelectedMenuItem(null); setShowAddForm(!showAddForm); }}
              className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-[#0F172A] text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-95"
            >
              {showAddForm ? <Trash2 className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              {showAddForm ? 'Discard Editor' : 'Create New Dish'}
            </button>
          </div>

          {/* Form Container */}
          {(showAddForm || selectedMenuItem) && (
            <div className="bg-white p-2 rounded-[2.5rem] border border-slate-100 shadow-2xl animate-in slide-in-from-top-10 duration-500">
              <div className="bg-slate-50/50 p-8 rounded-[2.2rem]">
                <AddMenuItemForm
                  initialItem={selectedMenuItem}
                  onSaved={handleMenuSaved}
                  onCancel={() => { setSelectedMenuItem(null); setShowAddForm(false); }}
                />
              </div>
            </div>
          )}

          {/* Menu Grid */}
          <div className="relative">
            {menuLoading ? (
              <div className="py-32 text-center">
                <div className="w-16 h-16 border-4 border-slate-100 border-t-[#D4AF37] rounded-full animate-spin mx-auto mb-4" />
                <p className="text-slate-400 font-medium">Authenticating cuisine database...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {visibleMenuItems.map((item) => (
                  <div key={item._id} className="group bg-white rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-[#D4AF37]/10 border border-slate-100 transition-all duration-500 hover:-translate-y-2">
                    {/* Image Area */}
                    <div className="relative h-64 overflow-hidden bg-slate-100">
                      <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors duration-500 z-10" />
                      <ImageWithFallback 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" 
                      />
                      
                      {/* Floating Badges */}
                      <div className="absolute top-6 left-6 z-20">
                        <span className="px-4 py-2 bg-white/90 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 shadow-xl border border-white/20">
                          {item.category}
                        </span>
                      </div>
                      <div className="absolute top-6 right-6 z-20">
                        <div className={`w-3 h-3 rounded-full shadow-[0_0_15px_rgba(0,0,0,0.1)] ${item.isAvailable ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      </div>
                    </div>

                    {/* Info Area */}
                    <div className="p-8 space-y-6">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h3 className="text-2xl font-normal text-slate-900 group-hover:text-[#D4AF37] transition-colors line-clamp-1" style={{ fontFamily: "DM Serif Display, serif" }}>
                            {item.name}
                          </h3>
                          <div className="flex items-center gap-3 mt-2">
                            <div className="flex items-center gap-1.5 text-slate-400">
                              <Clock className="w-3.5 h-3.5" />
                              <span className="text-[11px] font-bold uppercase tracking-tight">{item.prepTime || 15} min prep</span>
                            </div>
                            {item.inventoryItem && (
                              <div className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${item.inventoryItem.quantity <= item.inventoryItem.thresholdLevel ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                                {item.inventoryItem.quantity} {item.inventoryItem.unit}
                              </div>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-2xl font-black text-slate-900 tracking-tighter">
                            {formatCurrency(item.price)}
                          </p>
                        </div>
                      </div>

                      <p className="text-slate-500 text-sm leading-relaxed line-clamp-2 h-10 italic">
                        {item.description || "A masterfully crafted selection for the refined palate."}
                      </p>

                      <div className="flex items-center gap-3 pt-6 border-t border-slate-50">
                        <button 
                          onClick={() => { setSelectedMenuItem(item); setShowAddForm(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} 
                          className="flex-1 inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-slate-50 text-slate-700 text-sm font-bold rounded-2xl hover:bg-[#0F172A] hover:text-white transition-all duration-300"
                        >
                          <Edit2 className="w-4 h-4" /> Edit
                        </button>
                        <button 
                          onClick={() => handleMenuDelete(item._id)} 
                          className="px-4 py-3.5 text-rose-500 bg-rose-50 hover:bg-rose-500 hover:text-white rounded-2xl transition-all duration-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
            
            {!menuLoading && visibleMenuItems.length === 0 && (
              <div className="py-32 text-center bg-white rounded-[3rem] border-2 border-dashed border-slate-100">
                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Zap className="w-10 h-10 text-slate-300" />
                </div>
                <h4 className="text-xl font-bold text-slate-900 mb-2">No masterpieces found</h4>
                <p className="text-slate-400">Refine your search or create a new signature dish.</p>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="animate-in zoom-in-95 duration-500">
          <AdminPOS />
        </div>
      )}
    </div>
  );
}
