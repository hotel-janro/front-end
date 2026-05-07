import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch, API_HOST } from '../../../api.js';
import { 
  UtensilsCrossed, 
  Clock, 
  Edit2, 
  Trash2, 
  Search, 
  Plus,
  Boxes,
  AlertTriangle,
  ArrowDownToLine,
  Package
} from 'lucide-react';
import AddMenuItemForm from './AddMenuItemForm';

const emptyInventoryForm = {
  itemName: '',
  quantity: '',
  thresholdLevel: '10',
  unit: 'pcs',
};

export function AdminRestaurant() {
  const [activeTab, setActiveTab] = useState('menu'); // 'menu' or 'inventory'
  
  // Menu State
  const [menuItems, setMenuItems] = useState([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuSearch, setMenuSearch] = useState('');
  const [menuCategory, setMenuCategory] = useState('All');
  const [showAddForm, setShowAddForm] = useState(false);

  // Inventory State
  const [inventoryItems, setInventoryItems] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState(null);
  const [inventoryForm, setInventoryForm] = useState(emptyInventoryForm);
  const [savingInventory, setSavingInventory] = useState(false);
  const [inventorySearch, setInventorySearch] = useState('');
  const [showInventoryForm, setShowInventoryForm] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    await Promise.allSettled([loadMenu(), loadInventory()]);
  };

  const loadMenu = async () => {
    setMenuLoading(true);
    try {
      const data = await apiFetch('/menu?populate=inventoryItem');
      setMenuItems(Array.isArray(data) ? data : []);
    } finally {
      setMenuLoading(false);
    }
  };

  const loadInventory = async () => {
    setInventoryLoading(true);
    try {
      const data = await apiFetch('/inventory');
      setInventoryItems(Array.isArray(data) ? data : []);
    } finally {
      setInventoryLoading(false);
    }
  };

  // Menu Handlers
  const handleMenuSaved = async () => {
    setSelectedMenuItem(null);
    setShowAddForm(false);
    await loadMenu();
  };

  const handleMenuDelete = async (id) => {
    if (!window.confirm('Delete this menu item?')) return;
    await apiFetch(`/menu/${id}`, { method: 'DELETE' });
    await loadMenu();
  };

  // Inventory Handlers
  useEffect(() => {
    if (selectedInventoryItem) {
      setInventoryForm({
        itemName: selectedInventoryItem.itemName || '',
        quantity: selectedInventoryItem.quantity?.toString?.() || '',
        thresholdLevel: selectedInventoryItem.thresholdLevel?.toString?.() || '10',
        unit: selectedInventoryItem.unit || 'pcs',
      });
      setShowInventoryForm(true);
    } else {
      setInventoryForm(emptyInventoryForm);
    }
  }, [selectedInventoryItem]);

  const handleInventorySubmit = async (event) => {
    event.preventDefault();
    const payload = {
      itemName: inventoryForm.itemName,
      quantity: Number(inventoryForm.quantity),
      thresholdLevel: Number(inventoryForm.thresholdLevel),
      unit: inventoryForm.unit,
    };

    try {
      setSavingInventory(true);
      if (selectedInventoryItem) {
        await apiFetch(`/inventory/${selectedInventoryItem._id}`, {
          method: 'PUT',
          body: JSON.stringify(payload),
        });
      } else {
        await apiFetch('/inventory', {
          method: 'POST',
          body: JSON.stringify(payload),
        });
      }
      setSelectedInventoryItem(null);
      setShowInventoryForm(false);
      await loadInventory();
    } catch (error) {
      alert(error.message || 'Failed to save inventory item.');
    } finally {
      setSavingInventory(false);
    }
  };

  const deleteInventoryItem = async (id) => {
    if (!window.confirm('Delete this inventory item?')) return;
    await apiFetch(`/inventory/${id}`, { method: 'DELETE' });
    await loadInventory();
  };

  // Memoized Filters
  const visibleMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesSearch = !menuSearch || item.name?.toLowerCase().includes(menuSearch.toLowerCase());
      const matchesCategory = menuCategory === 'All' || item.category === menuCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, menuSearch, menuCategory]);

  const visibleInventoryItems = useMemo(() => {
    return inventoryItems.filter(item => 
      item.itemName.toLowerCase().includes(inventorySearch.toLowerCase())
    );
  }, [inventoryItems, inventorySearch]);

  const menuCategories = useMemo(() => {
    return ['All', ...new Set(menuItems.map((item) => item.category).filter(Boolean))];
  }, [menuItems]);

  const inventoryStats = useMemo(() => {
    const low = inventoryItems.filter(i => i.quantity <= i.thresholdLevel && i.quantity > 0).length;
    const out = inventoryItems.filter(i => i.quantity <= 0).length;
    return { total: inventoryItems.length, low, out };
  }, [inventoryItems]);

  const formatCurrency = (value) => `Rs ${Number(value || 0).toFixed(2)}`;

  const getStockStatus = (item) => {
    if (item.quantity <= 0) return { label: 'Out of Stock', color: 'bg-rose-500', text: 'text-rose-500', bg: 'bg-rose-50' };
    if (item.quantity <= item.thresholdLevel) return { label: 'Low Stock', color: 'bg-amber-500', text: 'text-amber-500', bg: 'bg-amber-50' };
    return { label: 'Healthy', color: 'bg-emerald-500', text: 'text-emerald-500', bg: 'bg-emerald-50' };
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="rounded-3xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#334155] text-white p-8 md:p-10 shadow-2xl relative overflow-hidden">
        <div className="relative z-10">
          <p className="text-xs uppercase tracking-[0.4em] text-[#D4AF37] font-bold mb-3">Restaurant Management</p>
          <h2 className="text-4xl md:text-5xl font-black tracking-tight">
            {activeTab === 'menu' ? 'Menu & Cuisine' : 'Inventory & Supplies'}
          </h2>
          <p className="text-slate-300 mt-4 max-w-2xl text-lg leading-relaxed">
            {activeTab === 'menu' 
              ? 'Craft your menu, manage pricing, and track dish availability effortlessly.'
              : 'Monitor stock levels, manage thresholds, and ensure supplies are always available.'}
          </p>
        </div>
        <UtensilsCrossed className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 rotate-12" />
      </div>

      {/* Tabs Navigation */}
      <div className="flex p-1.5 bg-slate-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('menu')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'menu' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <UtensilsCrossed className="w-4 h-4" />
          Menu Items
        </button>
        <button
          onClick={() => setActiveTab('inventory')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all ${
            activeTab === 'inventory' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Boxes className="w-4 h-4" />
          Inventory Stock
        </button>
      </div>

      {/* Content Section */}
      {activeTab === 'menu' ? (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h3 className="text-2xl font-bold text-slate-900">Catalogue Management</h3>
            <button 
              onClick={() => { setSelectedMenuItem(null); setShowAddForm(!showAddForm); }}
              className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-100"
            >
              <Plus className="w-5 h-5" />
              {showAddForm ? 'Close Editor' : 'New Menu Item'}
            </button>
          </div>

          {(showAddForm || selectedMenuItem) && (
            <div className="bg-slate-50 p-6 rounded-3xl border border-slate-200 animate-in fade-in slide-in-from-top-4">
              <AddMenuItemForm
                initialItem={selectedMenuItem}
                onSaved={handleMenuSaved}
                onCancel={() => { setSelectedMenuItem(null); setShowAddForm(false); }}
              />
            </div>
          )}

          <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search dishes..."
                  value={menuSearch}
                  onChange={(e) => setMenuSearch(e.target.value)}
                  className="w-full pl-12 pr-5 py-3 rounded-2xl bg-slate-50 border-none focus:ring-4 focus:ring-blue-500/10 transition-all outline-none"
                />
              </div>
              <select
                value={menuCategory}
                onChange={(e) => setMenuCategory(e.target.value)}
                className="rounded-2xl border border-slate-100 px-6 py-3 text-sm font-bold bg-slate-50 outline-none focus:ring-4 focus:ring-blue-500/10"
              >
                {menuCategories.map((category) => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>

            {menuLoading ? (
              <div className="py-20 text-center"><div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mx-auto"></div></div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {visibleMenuItems.map((item) => (
                  <div key={item._id} className="group relative bg-white rounded-3xl p-4 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-300">
                    <div className="relative h-48 mb-4 rounded-2xl overflow-hidden bg-slate-100">
                      {item.image ? (
                        <img src={item.image.includes('uploads') ? `${API_HOST}/${item.image.replace(/\\/g, '/')}` : item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-300"><UtensilsCrossed className="w-12 h-12 opacity-20" /></div>
                      )}
                      <div className="absolute top-3 right-3">
                        <span className={`px-3 py-1 text-[10px] font-black uppercase tracking-widest rounded-full shadow-sm ${item.isAvailable ? 'bg-emerald-500 text-white' : 'bg-rose-500 text-white'}`}>
                          {item.isAvailable ? 'Available' : 'Unavailable'}
                        </span>
                      </div>
                    </div>
                    <div className="px-1">
                      <div className="flex justify-between items-start mb-1">
                        <div>
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{item.name}</h3>
                          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">{item.category}</p>
                        </div>
                        <span className="text-xl font-black text-slate-900">{formatCurrency(item.price)}</span>
                      </div>
                      <p className="text-sm text-slate-500 line-clamp-2 min-h-[40px] mb-4">{item.description || "No description available."}</p>
                      <div className="flex items-center justify-between mb-6 border-t border-slate-50 pt-4">
                        <div className="flex items-center gap-2 text-slate-400"><Clock className="w-4 h-4" /><span className="text-xs font-bold">{item.prepTime || 15} min</span></div>
                        {item.inventoryItem && (
                          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border ${item.inventoryItem.quantity <= item.inventoryItem.thresholdLevel ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-400 border-slate-100'}`}>
                            <span className="text-[10px] font-black uppercase">{item.inventoryItem.quantity} {item.inventoryItem.unit} Left</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setSelectedMenuItem(item); setShowAddForm(false); window.scrollTo({ top: 0, behavior: 'smooth' }); }} className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-slate-50 text-slate-700 text-sm font-bold rounded-2xl hover:bg-slate-100 transition-colors"><Edit2 className="w-4 h-4" />Edit</button>
                        <button onClick={() => handleMenuDelete(item._id)} className="px-4 py-3 bg-rose-50 text-rose-600 rounded-2xl hover:bg-rose-100 transition-colors"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5">
              <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><Boxes className="w-7 h-7" /></div>
              <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Stock</p><h3 className="text-3xl font-black text-slate-900">{inventoryStats.total}</h3></div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5">
              <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600"><AlertTriangle className="w-7 h-7" /></div>
              <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Low Stock</p><h3 className="text-3xl font-black text-amber-600">{inventoryStats.low}</h3></div>
            </div>
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-5">
              <div className="w-14 h-14 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600"><ArrowDownToLine className="w-7 h-7" /></div>
              <div><p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Out of Stock</p><h3 className="text-3xl font-black text-rose-600">{inventoryStats.out}</h3></div>
            </div>
          </div>

          <div className="grid gap-8 xl:grid-cols-[400px_1fr]">
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-900">{selectedInventoryItem ? 'Update Item' : 'New Supply'}</h3>
                <button onClick={() => { setSelectedInventoryItem(null); setShowInventoryForm(!showInventoryForm); }} className={`p-2 rounded-full transition-all ${showInventoryForm ? 'bg-rose-50 text-rose-500 rotate-45' : 'bg-blue-50 text-blue-600'}`}><Plus className="w-6 h-6" /></button>
              </div>
              {showInventoryForm ? (
                <form onSubmit={handleInventorySubmit} className="space-y-5 animate-in fade-in slide-in-from-top-4">
                  <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase ml-1">Item Name</label><input value={inventoryForm.itemName} onChange={(e) => setInventoryForm({ ...inventoryForm, itemName: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-5 py-3 outline-none focus:border-blue-500" required /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase ml-1">Qty</label><input type="number" min="0" value={inventoryForm.quantity} onChange={(e) => setInventoryForm({ ...inventoryForm, quantity: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-5 py-3 outline-none focus:border-blue-500" required /></div>
                    <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase ml-1">Threshold</label><input type="number" min="0" value={inventoryForm.thresholdLevel} onChange={(e) => setInventoryForm({ ...inventoryForm, thresholdLevel: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-5 py-3 outline-none focus:border-blue-500" required /></div>
                  </div>
                  <div className="space-y-2"><label className="text-xs font-bold text-slate-500 uppercase ml-1">Unit</label><input value={inventoryForm.unit} onChange={(e) => setInventoryForm({ ...inventoryForm, unit: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-5 py-3 outline-none focus:border-blue-500" placeholder="kg, pcs, litres" /></div>
                  <button type="submit" disabled={savingInventory} className="w-full rounded-2xl bg-[#0F172A] px-6 py-4 text-white font-bold hover:bg-slate-800 disabled:opacity-50 shadow-xl transition-all">{savingInventory ? 'Saving...' : selectedInventoryItem ? 'Update Database' : 'Add Stock Item'}</button>
                </form>
              ) : <div className="py-10 text-center"><div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto text-blue-600 mb-4"><Package className="w-8 h-8" /></div><p className="text-sm text-slate-400">Tap the plus to manage supplies.</p></div>}
            </div>

            <div className="bg-white rounded-[2.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
              <div className="p-8 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div><h3 className="text-2xl font-bold text-slate-900">Current Supplies</h3><p className="text-sm text-slate-500">Live inventory status</p></div>
                <div className="relative max-w-xs w-full"><Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" /><input type="text" placeholder="Search supplies..." value={inventorySearch} onChange={(e) => setInventorySearch(e.target.value)} className="w-full pl-11 pr-5 py-3 rounded-2xl bg-slate-50 border-none outline-none text-sm" /></div>
              </div>
              <div className="flex-1 overflow-x-auto p-8">
                {inventoryLoading ? <div className="py-20 text-center"><div className="w-10 h-10 border-4 border-slate-100 border-t-blue-600 rounded-full animate-spin mx-auto"></div></div> : (
                  <table className="w-full text-left border-separate border-spacing-y-4">
                    <thead><tr className="text-slate-400 text-xs font-bold uppercase tracking-widest"><th className="px-6 pb-2">Item</th><th className="px-6 pb-2 text-center">Status</th><th className="px-6 pb-2">Quantity</th><th className="px-6 pb-2 text-right">Actions</th></tr></thead>
                    <tbody>
                      {visibleInventoryItems.map((item) => {
                        const status = getStockStatus(item);
                        return (
                          <tr key={item._id} className="group bg-white hover:bg-slate-50/50 transition-colors">
                            <td className="px-6 py-5 rounded-l-2xl border-y border-l border-slate-50"><p className="font-bold text-slate-900">{item.itemName}</p><p className="text-[10px] text-slate-400 uppercase tracking-tighter">Threshold: {item.thresholdLevel}</p></td>
                            <td className="px-6 py-5 border-y border-slate-50 text-center"><span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${status.bg} ${status.text} border border-current/20`}><span className={`w-1.5 h-1.5 rounded-full ${status.color}`}></span>{status.label}</span></td>
                            <td className="px-6 py-5 border-y border-slate-50"><span className="text-lg font-black text-slate-900">{item.quantity}</span> <span className="text-[10px] font-bold text-slate-400 uppercase">{item.unit}</span></td>
                            <td className="px-6 py-5 rounded-r-2xl border-y border-r border-slate-50 text-right"><div className="flex items-center justify-end gap-2"><button onClick={() => setSelectedInventoryItem(item)} className="p-2.5 bg-slate-50 text-slate-600 rounded-xl hover:bg-blue-600 hover:text-white transition-all"><Edit2 className="w-4 h-4" /></button><button onClick={() => deleteInventoryItem(item._id)} className="p-2.5 bg-rose-50 text-rose-600 rounded-xl hover:bg-rose-600 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button></div></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}