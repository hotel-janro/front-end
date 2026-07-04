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
  Zap,
  Loader2,
  X,
  Filter,
  ChevronDown
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
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8; // Fits 2, 3, or 4 columns nicely

  useEffect(() => {
    if (activeTab === 'menu') {
      loadMenu();
    }
  }, [activeTab]);

  const loadMenu = async () => {
    setMenuLoading(true);
    try {
      const data = await apiFetch('/menu?populate=inventoryItem');
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

  useEffect(() => {
    setCurrentPage(1);
  }, [menuSearch, menuCategory]);

  const totalPages = Math.ceil(visibleMenuItems.length / itemsPerPage);

  const paginatedMenuItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return visibleMenuItems.slice(start, start + itemsPerPage);
  }, [visibleMenuItems, currentPage, itemsPerPage]);

  const menuCategories = useMemo(() => {
    const predefinedOrder = [
      'Rice', 'Koththu', 'Noodles', 'Chicken', 'Fish', 'Prawns', 'Cuttle Fish', 
      'Mutton', 'Pork', 'Omelet', 'Vegetables & Sides', 'Salad', 'Soup', 
      'Starters', 'Outdoor Party', 'Beverages'
    ];
    const cats = new Set(menuItems.map((item) => item.category).filter(Boolean));
    const sortedCats = Array.from(cats).sort((a, b) => {
      const indexA = predefinedOrder.indexOf(a);
      const indexB = predefinedOrder.indexOf(b);
      
      if (indexA !== -1 && indexB !== -1) return indexA - indexB;
      if (indexA === -1 && indexB !== -1) return 1;
      if (indexA !== -1 && indexB === -1) return -1;
      return a.localeCompare(b);
    });
    return ['All', ...sortedCats];
  }, [menuItems]);

  const formatCurrency = (value) => `Rs ${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="space-y-6 animate-in fade-in duration-700">
      {/* Compact Premium Header */}
      <div className="relative rounded-[2rem] bg-[#0F172A] p-4 md:px-8 shadow-xl overflow-hidden border border-white/5">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl -mr-20 -mt-20" />
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div className="flex items-center gap-5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37] to-[#B8962E] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
              <UtensilsCrossed className="w-6 h-6 text-[#0F172A]" />
            </div>
            <div>
              <h2 className="text-2xl text-white font-normal leading-tight" style={{ fontFamily: "DM Serif Display, serif" }}>
                Restaurant <span className="text-[#D4AF37]">Management</span>
              </h2>
              <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-0.5">
                {activeTab === 'menu' ? 'Curate your world-class culinary collection' : 'Luxury Point of Sale Terminal'}
              </p>
            </div>
          </div>

          <div className="flex bg-white/5 backdrop-blur-xl rounded-xl border border-white/10 p-1">
            {[
              { id: 'menu', icon: LayoutGrid, label: 'MENU ITEMS' },
              { id: 'pos', icon: ShoppingCart, label: 'POS' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all duration-300 ${activeTab === tab.id ? 'bg-[#D4AF37] text-[#0F172A] shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
              >
                <tab.icon className="w-3.5 h-3.5" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {activeTab === 'menu' ? (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex gap-3 flex-1 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]" />
                <input
                  type="text"
                  placeholder="Search signature dishes..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 bg-[#0F172A] border border-[#D4AF37]/30 text-white placeholder:text-slate-500 rounded-xl text-xs font-semibold outline-none focus:ring-2 focus:ring-[#D4AF37]/50 focus:border-[#D4AF37] transition-all hover:border-[#D4AF37]/60"
                />
              </div>
              <div className="relative min-w-[200px]">
                <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37]" />
                <select
                  value={menuCategory}
                  onChange={(e) => setMenuCategory(e.target.value)}
                  className="w-full appearance-none bg-[#0F172A] border border-[#D4AF37]/30 text-white rounded-xl pl-11 pr-10 py-3 text-[10px] font-black uppercase tracking-wider outline-none focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/50 transition-all hover:border-[#D4AF37]/60 cursor-pointer"
                >
                  {menuCategories.map((category) => (
                    <option key={category} value={category} className="bg-[#0F172A] text-white font-semibold">
                      {category}
                    </option>
                  ))}
                </select>
                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#D4AF37] pointer-events-none" />
              </div>
            </div>

            <button
              onClick={() => { setSelectedMenuItem(null); setShowAddForm(!showAddForm); }}
              className="flex items-center gap-2.5 px-6 py-3 bg-[#0F172A] text-white rounded-xl font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all active:scale-95 shadow-lg shadow-slate-200"
            >
              {showAddForm ? <X className="w-4 h-4 text-[#D4AF37]" /> : <Plus className="w-4 h-4 text-[#D4AF37]" />}
              {showAddForm ? 'Close Editor' : 'New Creation'}
            </button>
          </div>

          {/* Compact Form Container */}
          {(showAddForm || selectedMenuItem) && (
            <div className="bg-white p-1 rounded-[2.5rem] border border-slate-100 shadow-2xl animate-in slide-in-from-top-10 duration-500 overflow-hidden">
              <div className="bg-slate-50/30 p-6 rounded-[2.2rem]">
                <AddMenuItemForm
                  key={selectedMenuItem ? selectedMenuItem._id : (showAddForm ? 'new' : 'none')}
                  initialItem={selectedMenuItem}
                  existingCategories={menuCategories.filter(c => c !== 'All')}
                  onSaved={handleMenuSaved}
                  onCancel={() => { setSelectedMenuItem(null); setShowAddForm(false); }}
                />
              </div>
            </div>
          )}

          {/* Compact Menu Grid */}
          <div className="relative">
            {menuLoading ? (
              <div className="py-20 text-center">
                <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37] mx-auto mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing with culinary database...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {paginatedMenuItems.map((item) => (
                  <div key={item._id} className="group bg-white rounded-[1.5rem] overflow-hidden border border-slate-100 hover:border-[#D4AF37]/30 transition-all duration-300 hover:shadow-xl">
                    <div className="relative h-40 overflow-hidden">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="px-2 py-1 bg-white/90 backdrop-blur-md rounded-lg text-[8px] font-black uppercase tracking-widest text-slate-900 shadow-sm border border-white/20">
                          {item.category}
                        </span>
                      </div>
                      <div className="absolute bottom-3 right-3">
                        <div className={`w-2.5 h-2.5 rounded-full ring-4 ring-white/20 ${item.isAvailable ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      </div>
                    </div>

                    <div className="p-4 space-y-3">
                      <div>
                        <h3 className="text-md font-normal text-slate-900 truncate" style={{ fontFamily: "DM Serif Display, serif" }}>
                          {item.name}
                        </h3>
                        <div className="flex items-center justify-between mt-1">
                          <p className="text-sm font-black text-[#D4AF37] tracking-tight">{formatCurrency(item.price)}</p>
                          <div className="flex items-center gap-1 text-slate-400 text-[9px] font-bold">
                            <Clock className="w-3 h-3" /> {item.prepTime || 15}m
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 pt-3 border-t border-slate-50">
                        <button
                          onClick={() => { setSelectedMenuItem(item); setShowAddForm(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
                          className="flex-1 py-2 bg-slate-50 text-slate-600 text-[9px] font-black uppercase tracking-widest rounded-lg hover:bg-[#0F172A] hover:text-white transition-all"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleMenuDelete(item._id)}
                          className="w-10 py-2 text-rose-400 bg-rose-50 hover:bg-rose-500 hover:text-white rounded-lg transition-all flex items-center justify-center"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8 bg-white px-5 py-3 rounded-2xl shadow-sm border border-slate-100 w-fit mx-auto animate-in fade-in duration-300">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
                      currentPage === 1 
                        ? "bg-slate-50 text-slate-300 cursor-not-allowed border border-transparent" 
                        : "bg-slate-100 text-slate-700 hover:bg-[#0F172A] hover:text-[#D4AF37] active:scale-95 border border-slate-200"
                    }`}
                  >
                    Previous
                  </button>
                  <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all cursor-pointer ${
                      currentPage === totalPages 
                        ? "bg-slate-50 text-slate-300 cursor-not-allowed border border-transparent" 
                        : "bg-slate-100 text-slate-700 hover:bg-[#0F172A] hover:text-[#D4AF37] active:scale-95 border border-slate-200"
                    }`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
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
