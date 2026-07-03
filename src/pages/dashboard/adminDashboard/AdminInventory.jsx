import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../../api.js';
import { toast } from 'sonner';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  Boxes,
  AlertTriangle,
  ArrowDownToLine,
  Search,
  Plus,
  Edit2,
  Trash2,
  Package,
  History,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  TrendingUp,
  BarChart3,
  Calendar
} from 'lucide-react';

const emptyInventoryForm = {
  itemName: '',
  quantity: '',
  thresholdLevel: '10',
  unit: 'pcs',
};

const emptyIssueForm = {
  itemId: '',
  department: 'Restaurant',
  quantity: '',
  notes: ''
};

export function AdminInventory() {
  const [activeTab, setActiveTab] = useState('stock'); // 'stock' or 'tracking'
  
  // Stock Management State
  const [inventoryItems, setInventoryItems] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState(null);
  const [inventoryForm, setInventoryForm] = useState(emptyInventoryForm);
  const [savingInventory, setSavingInventory] = useState(false);
  const [inventorySearch, setInventorySearch] = useState('');
  const [showInventoryForm, setShowInventoryForm] = useState(false);

  // Daily Tracking State
  const [stockLogs, setStockLogs] = useState([]);
  const [allStockLogs, setAllStockLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(false);
  const [issueForm, setIssueForm] = useState(emptyIssueForm);
  const [savingIssue, setSavingIssue] = useState(false);
  const [settleQty, setSettleQty] = useState({}); // logId -> quantity
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadInventory();
    loadAllLogs();
  }, []);

  useEffect(() => {
    if (activeTab === 'tracking') {
      loadLogs();
    }
  }, [activeTab, filterDate]);

  const loadAllLogs = async () => {
    try {
      const data = await apiFetch('/inventory/logs');
      setAllStockLogs(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error("Failed to load all logs:", e);
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

  const loadLogs = async () => {
    setLogsLoading(true);
    try {
      const data = await apiFetch(`/inventory/logs?date=${filterDate}`);
      setStockLogs(Array.isArray(data) ? data : []);
    } finally {
      setLogsLoading(false);
    }
  };

  // Analytics Calculation
  const analyticsData = useMemo(() => {
    const departments = ["Restaurant", "Weddings", "Pool", "Other"];
    const usageByDept = departments.map(dept => {
      const usage = stockLogs
        .filter(log => log.department === dept && log.status === 'Settled')
        .reduce((sum, log) => sum + (log.usageQuantity || 0), 0);
      return { name: dept, value: usage };
    });
    
    const maxUsage = Math.max(...usageByDept.map(d => d.value), 1);
    return { usageByDept, maxUsage };
  }, [stockLogs]);

  const chartData = useMemo(() => {
    const dailyMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateStr = d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      dailyMap[dateStr] = { issued: 0, consumed: 0 };
    }

    allStockLogs.forEach(log => {
      if (!log.date) return;
      const logDate = new Date(log.date);
      const dateStr = logDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short' });
      if (dailyMap[dateStr]) {
        dailyMap[dateStr].issued += log.issuedQuantity || 0;
        dailyMap[dateStr].consumed += log.usageQuantity || 0;
      }
    });

    return Object.keys(dailyMap).map(date => ({
      date,
      "Qty Issued": dailyMap[date].issued,
      "Qty Consumed": dailyMap[date].consumed,
    }));
  }, [allStockLogs]);

  // Stock Handlers
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

    // Validation
    if (!inventoryForm.itemName.trim()) {
      return alert('Please provide a name for this inventory asset');
    }
    const qty = Number(inventoryForm.quantity);
    const threshold = Number(inventoryForm.thresholdLevel);
    
    if (isNaN(qty) || qty < 0) {
      return alert('Quantity must be a valid non-negative number');
    }
    if (isNaN(threshold) || threshold < 0) {
      return alert('Threshold level must be a valid non-negative number');
    }

    const payload = {
      itemName: inventoryForm.itemName,
      quantity: qty,
      thresholdLevel: threshold,
      unit: inventoryForm.unit || 'pcs',
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

  const handleIssueSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!issueForm.itemId) return alert('Please select an item to issue');
    const issueQty = Number(issueForm.quantity);
    if (isNaN(issueQty) || issueQty <= 0) return alert('Please enter a valid quantity to issue');

    const selectedItem = inventoryItems.find(i => i._id === issueForm.itemId);
    if (selectedItem && selectedItem.quantity < issueQty) {
      return alert(`Insufficient Stock: Only ${selectedItem.quantity} ${selectedItem.unit} available.`);
    }

    try {
      setSavingIssue(true);
      await apiFetch('/inventory/issue', {
        method: 'POST',
        body: JSON.stringify(issueForm)
      });
      setIssueForm(emptyIssueForm);
      await Promise.all([loadInventory(), loadLogs(), loadAllLogs()]);
      toast.success('Stock issued successfully!');
    } catch (error) {
      alert(error.message);
    } finally {
      setSavingIssue(false);
    }
  };

  const handleSettleSubmit = async (logId) => {
    const qty = settleQty[logId];
    if (qty === undefined || qty === '') return alert('Please enter returned quantity');

    try {
      await apiFetch('/inventory/settle', {
        method: 'POST',
        body: JSON.stringify({ logId, returnedQuantity: Number(qty) })
      });
      await Promise.all([loadInventory(), loadLogs(), loadAllLogs()]);
    } catch (error) {
      alert(error.message);
    }
  };

  const visibleInventoryItems = useMemo(() => {
    return inventoryItems.filter(item => 
      item.itemName.toLowerCase().includes(inventorySearch.toLowerCase())
    );
  }, [inventoryItems, inventorySearch]);

  const inventoryStats = useMemo(() => {
    const low = inventoryItems.filter(i => i.quantity <= i.thresholdLevel && i.quantity > 0).length;
    const out = inventoryItems.filter(i => i.quantity <= 0).length;
    const totalQty = inventoryItems.reduce((s, i) => s + i.quantity, 0);
    return { total: inventoryItems.length, low, out, totalQty };
  }, [inventoryItems]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Premium Header Banner */}
      <div className="relative rounded-2xl bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] p-6 py-8 md:px-8 shadow-2xl overflow-hidden border border-white/5 mb-8">
        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-[#D4AF37]/5 rounded-full blur-[80px] -mr-24 -mt-24" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 text-[#D4AF37] text-[9px] font-black uppercase tracking-[0.3em] mb-3">
              <TrendingUp className="w-3 h-3" /> Supply Excellence
            </div>
            <h2 className="text-3xl md:text-4xl text-white font-normal leading-tight" style={{ fontFamily: "DM Serif Display, serif" }}>
              Inventory <span className="text-[#D4AF37]">Intelligence</span>
            </h2>
            <p className="text-slate-400 mt-3 max-w-xl text-sm leading-relaxed">
              Precision tracking for your luxury establishment. Monitor, allocate, and analyze stock usage with real-time accuracy.
            </p>
          </div>

          <div className="flex flex-col gap-4">
             <div className="flex p-1.5 bg-slate-950 rounded-2xl border border-white/10 shadow-2xl">
              <button
                onClick={() => setActiveTab('stock')}
                className={`flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold transition-all duration-500 ${
                  activeTab === 'stock' ? 'bg-[#D4AF37] text-[#0F172A] shadow-lg shadow-[#D4AF37]/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                <Boxes className="w-4 h-4" />
                Supplies
              </button>
              <button
                onClick={() => setActiveTab('tracking')}
                className={`flex items-center gap-2 px-8 py-3.5 rounded-xl text-sm font-bold transition-all duration-500 ${
                  activeTab === 'tracking' ? 'bg-[#D4AF37] text-[#0F172A] shadow-lg shadow-[#D4AF37]/20' : 'text-slate-400 hover:text-white'
                }`}
              >
                <History className="w-4 h-4" />
                Allocation
              </button>
            </div>
          </div>
        </div>
      </div>

      {activeTab === 'stock' ? (
        <>
          {/* Stats Bar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
             <div className="bg-[#0F172A] p-8 rounded-[2.5rem] shadow-sm border border-white/5 flex flex-col justify-between group hover:shadow-xl hover:border-white/10 transition-all duration-500">
              <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 mb-6 group-hover:scale-110 transition-transform"><Boxes className="w-6 h-6" /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Items</p>
                <h3 className="text-3xl font-black text-white">{inventoryStats.total}</h3>
              </div>
            </div>
             <div className="bg-[#0F172A] p-8 rounded-[2.5rem] shadow-sm border border-white/5 flex flex-col justify-between group hover:shadow-xl hover:border-white/10 transition-all duration-500">
              <div className="w-12 h-12 bg-amber-500/10 rounded-2xl flex items-center justify-center text-amber-400 mb-6 group-hover:scale-110 transition-transform"><AlertTriangle className="w-6 h-6" /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Low Warning</p>
                <h3 className="text-3xl font-black text-amber-400">{inventoryStats.low}</h3>
              </div>
            </div>
             <div className="bg-[#0F172A] p-8 rounded-[2.5rem] shadow-sm border border-white/5 flex flex-col justify-between group hover:shadow-xl hover:border-white/10 transition-all duration-500">
              <div className="w-12 h-12 bg-rose-500/10 rounded-2xl flex items-center justify-center text-rose-400 mb-6 group-hover:scale-110 transition-transform"><ArrowDownToLine className="w-6 h-6" /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stock Out</p>
                <h3 className="text-3xl font-black text-rose-400">{inventoryStats.out}</h3>
              </div>
            </div>
            <div className="bg-[#D4AF37] p-8 rounded-[2.5rem] shadow-xl shadow-[#D4AF37]/10 flex flex-col justify-between group hover:scale-[1.02] transition-all duration-500">
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white mb-6"><TrendingUp className="w-6 h-6" /></div>
              <div>
                <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-1">Total Assets</p>
                <h3 className="text-3xl font-black text-[#0F172A]">{inventoryStats.totalQty.toLocaleString()} <span className="text-sm font-bold opacity-40 uppercase">Units</span></h3>
              </div>
            </div>
          </div>

          {/* Low Stock Alerts & Quick Restock Panel */}
          {inventoryItems.some(item => item.quantity <= item.thresholdLevel) && (
            <div className="bg-amber-50/60 border border-amber-200/60 p-6 rounded-[2.5rem] shadow-sm animate-in fade-in slide-in-from-top-4 duration-500">
              <div className="flex items-center gap-3 mb-4">
                <div className="p-2.5 bg-amber-500 text-white rounded-xl">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-amber-800 uppercase tracking-wider">Critical Stock Warnings</h4>
                  <p className="text-xs text-amber-600/80">The following supplies are running low. Take immediate action to replenish inventory.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {inventoryItems
                  .filter(item => item.quantity <= item.thresholdLevel)
                  .map(item => (
                    <div key={item._id} className="bg-white p-4 rounded-2xl border border-amber-100/50 flex items-center justify-between shadow-xs hover:shadow-md transition-all duration-300">
                      <div>
                        <p className="font-bold text-slate-800 text-xs">{item.itemName}</p>
                        <p className="text-[9px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
                          Stock: <span className={item.quantity === 0 ? "text-rose-500 font-black" : "text-amber-600 font-black"}>{item.quantity}</span> / {item.thresholdLevel} {item.unit}
                        </p>
                      </div>
                      <button
                        onClick={async () => {
                          const amount = window.prompt(`How many ${item.unit} of ${item.itemName} would you like to add to stock?`);
                          if (amount === null) return;
                          const restockQty = Number(amount);
                          if (isNaN(restockQty) || restockQty <= 0) {
                            return alert("Please enter a valid positive number.");
                          }
                          try {
                            const updatedQty = item.quantity + restockQty;
                            const payload = {
                              itemName: item.itemName,
                              quantity: updatedQty,
                              thresholdLevel: item.thresholdLevel,
                              unit: item.unit
                            };
                            await apiFetch(`/inventory/${item._id}`, {
                              method: 'PUT',
                              body: JSON.stringify(payload)
                            });
                            toast.success(`Successfully restocked ${restockQty} ${item.unit} for ${item.itemName}`);
                            await loadInventory();
                          } catch (err) {
                            alert(err.message || "Restock failed");
                          }
                        }}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-[#0F172A] hover:bg-[#D4AF37] hover:text-[#0F172A] text-white rounded-xl text-[9px] font-black uppercase tracking-wider transition-all duration-300 shadow-sm"
                      >
                        <Plus className="w-3 h-3" /> Restock
                      </button>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="grid gap-10 xl:grid-cols-[400px_1fr]">
            {/* Form Side */}
             <div className="bg-[#0F172A] p-10 rounded-[3rem] shadow-sm border border-white/5 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-normal text-white" style={{ fontFamily: "DM Serif Display, serif" }}>{selectedInventoryItem ? 'Refine Item' : 'New Supply'}</h3>
                <button onClick={() => { setSelectedInventoryItem(null); setShowInventoryForm(!showInventoryForm); }} className={`p-3 rounded-full transition-all ${showInventoryForm ? 'bg-rose-500/10 text-rose-400 rotate-45' : 'bg-blue-500/10 text-blue-400 shadow-lg'}`}><Plus className="w-6 h-6" /></button>
              </div>
              
              {showInventoryForm ? (
                <form onSubmit={handleInventorySubmit} className="space-y-6 animate-in fade-in slide-in-from-top-6 duration-500">
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Name</label><input value={inventoryForm.itemName} onChange={(e) => setInventoryForm({ ...inventoryForm, itemName: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/5 transition-all font-medium" required /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantity</label><input type="number" min="0" value={inventoryForm.quantity} onChange={(e) => setInventoryForm({ ...inventoryForm, quantity: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-[#D4AF37] font-semibold" required /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Safety Level</label><input type="number" min="0" value={inventoryForm.thresholdLevel} onChange={(e) => setInventoryForm({ ...inventoryForm, thresholdLevel: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-[#D4AF37] font-semibold" required /></div>
                  </div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Measurement Unit</label><input value={inventoryForm.unit} onChange={(e) => setInventoryForm({ ...inventoryForm, unit: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-white outline-none focus:border-[#D4AF37] font-medium" placeholder="kg, pcs, litres..." /></div>
                  <button type="submit" disabled={savingInventory} className="w-full rounded-[2rem] bg-[#D4AF37] px-6 py-5 text-[#0F172A] font-black text-sm uppercase tracking-[0.3em] hover:bg-white disabled:opacity-50 shadow-2xl transition-all">{savingInventory ? 'Syncing...' : selectedInventoryItem ? 'Confirm Changes' : 'Add to Catalog'}</button>
                </form>
              ) : (
                <div className="py-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-slate-900/60 rounded-full flex items-center justify-center mx-auto text-slate-500 border-2 border-dashed border-slate-700"><Package className="w-10 h-10" /></div>
                  <p className="text-sm text-slate-400 font-medium">Capture a new supply asset by <br/> tapping the <Plus className="w-3 h-3 inline mx-1" /> button above.</p>
                </div>
              )}
            </div>

            {/* Table Side */}
            <div className="bg-[#0F172A] rounded-[3.5rem] shadow-sm border border-white/5 flex flex-col overflow-hidden">
              <div className="p-10 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div><h3 className="text-2xl font-normal text-white" style={{ fontFamily: "DM Serif Display, serif" }}>Supply <span className="text-[#D4AF37]">Catalog</span></h3><p className="text-sm text-slate-400 mt-1">Live digital record of all physical assets</p></div>
                <div className="relative max-w-xs w-full"><Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" /><input type="text" placeholder="Search for items..." value={inventorySearch} onChange={(e) => setInventorySearch(e.target.value)} className="w-full pl-14 pr-6 py-4 rounded-[2rem] bg-slate-950 border border-white/10 text-white outline-none text-sm font-medium focus:ring-4 focus:ring-[#D4AF37]/5 transition-all" /></div>
              </div>
              <div className="flex-1 p-10 overflow-x-auto">
                {inventoryLoading ? <div className="py-20 text-center"><div className="w-16 h-16 border-4 border-slate-700 border-t-[#D4AF37] rounded-full animate-spin mx-auto"></div></div> : (
                  <table className="w-full text-left border-separate border-spacing-y-4">
                    <thead><tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]"><th className="px-8 pb-2">Asset Details</th><th className="px-8 pb-2 text-center">Status</th><th className="px-8 pb-2">Balance</th><th className="px-8 pb-2 text-right">Actions</th></tr></thead>
                    <tbody>
                      {visibleInventoryItems.map((item) => {
                        const status = item.quantity <= 0 ? { l: 'Empty', c: 'text-rose-500', b: 'bg-rose-950/20' } : item.quantity <= item.thresholdLevel ? { l: 'Low', c: 'text-amber-500', b: 'bg-amber-950/20' } : { l: 'Sufficient', c: 'text-emerald-500', b: 'bg-emerald-950/20' };
                        const statusBg = item.quantity <= 0 ? 'bg-[#241217]' : item.quantity <= item.thresholdLevel ? 'bg-[#241d12]' : 'bg-slate-900';
                        const alertBorder = item.quantity <= 0 ? 'border-l-rose-500/80 border-l-[3px]' : item.quantity <= item.thresholdLevel ? 'border-l-amber-500/80 border-l-[3px]' : 'border-l-slate-800';
                        return (
                          <tr key={item._id} className="group hover:bg-slate-950 transition-all duration-300">
                            <td className={`px-8 py-6 rounded-l-[2rem] border-y border-l border-white/5 ${statusBg} ${alertBorder}`}><p className="font-bold text-white text-lg group-hover:text-[#D4AF37] transition-colors">{item.itemName}</p><p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Ref ID: {item._id.slice(-8)}</p></td>
                            <td className={`px-8 py-6 border-y border-white/5 text-center ${statusBg}`}><span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] ${status.b} ${status.c} border border-current/10`}>{status.l}</span></td>
                            <td className={`px-8 py-6 border-y border-white/5 ${statusBg}`}><span className="text-2xl font-black text-white tracking-tighter">{item.quantity}</span> <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{item.unit}</span></td>
                            <td className={`px-8 py-6 rounded-r-[2rem] border-y border-r border-white/5 text-right ${statusBg}`}><div className="flex items-center justify-end gap-3"><button onClick={() => setSelectedInventoryItem(item)} className="p-3 bg-slate-950 text-slate-400 rounded-xl hover:bg-[#D4AF37] hover:text-[#0F172A] transition-all"><Edit2 className="w-4 h-4" /></button><button onClick={() => deleteInventoryItem(item._id)} className="p-3 bg-rose-500/10 text-rose-400 rounded-xl hover:bg-rose-600 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button></div></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="grid gap-10 xl:grid-cols-[450px_1fr]">
            <div className="space-y-8">
              {/* Issue Form */}
              <div className="bg-[#0F172A] p-10 rounded-[3rem] shadow-2xl relative overflow-hidden text-white">
                <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/20 rounded-full blur-[80px] -mr-32 -mt-32" />
                <h3 className="relative z-10 text-2xl font-normal mb-8" style={{ fontFamily: "DM Serif Display, serif" }}>Issue <span className="text-[#D4AF37]">Resources</span></h3>
                <form onSubmit={handleIssueSubmit} className="relative z-10 space-y-6">
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Selection</label><select value={issueForm.itemId} onChange={(e) => setIssueForm({ ...issueForm, itemId: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#D4AF37] appearance-none cursor-pointer" required><option value="" className="text-slate-900">Choose Master Stock...</option>{inventoryItems.map(item => (<option key={item._id} value={item._id} className="text-slate-900">{item.itemName} ({item.quantity} available)</option>))}</select></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Dept</label><select value={issueForm.department} onChange={(e) => setIssueForm({ ...issueForm, department: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#D4AF37] appearance-none cursor-pointer" required><option value="Restaurant" className="text-slate-900">Restaurant</option><option value="Weddings" className="text-slate-900">Weddings</option><option value="Pool" className="text-slate-900">Pool</option><option value="Other" className="text-slate-900">Other</option></select></div>
                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantity</label><input type="number" min="1" value={issueForm.quantity} onChange={(e) => setIssueForm({ ...issueForm, quantity: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#D4AF37]" required /></div>
                  </div>
                  <button type="submit" disabled={savingIssue} className="w-full bg-[#D4AF37] text-[#0F172A] py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#D4AF37]/10 disabled:opacity-50">{savingIssue ? 'Authorizing...' : 'Execute Dispatch'}</button>
                </form>
              </div>

              {/* Visual Analytics */}
              <div className="bg-[#0F172A] p-10 rounded-[3rem] shadow-sm border border-white/5">
                <h3 className="text-xl font-normal text-white mb-8" style={{ fontFamily: "DM Serif Display, serif" }}>Consumption <span className="text-[#D4AF37]">Analytics</span></h3>
                <div className="space-y-6">
                  {analyticsData.usageByDept.map(dept => (
                    <div key={dept.name} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400"><span>{dept.name}</span><span>{dept.value} Units Used</span></div>
                      <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-white/5">
                        <div className="h-full bg-gradient-to-r from-[#0F172A] to-[#D4AF37] rounded-full transition-all duration-1000" style={{ width: `${(dept.value / analyticsData.maxUsage) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Area Chart for Stock Trends */}
                <div className="mt-8 pt-8 border-t border-white/5">
                  <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">7-Day Dispatch Trend</h4>
                  <div className="w-full h-48">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorIssued" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#D4AF37" stopOpacity={0.0}/>
                          </linearGradient>
                          <linearGradient id="colorConsumed" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#0F172A" stopOpacity={0.4}/>
                            <stop offset="95%" stopColor="#0F172A" stopOpacity={0.0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1E293B" />
                        <XAxis dataKey="date" stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94A3B8" fontSize={9} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '10px' }}
                          labelClassName="text-slate-400 font-bold"
                        />
                        <Area type="monotone" dataKey="Qty Issued" stroke="#D4AF37" strokeWidth={2} fillOpacity={1} fill="url(#colorIssued)" />
                        <Area type="monotone" dataKey="Qty Consumed" stroke="#0F172A" strokeWidth={2} fillOpacity={1} fill="url(#colorConsumed)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="mt-10 pt-8 border-t border-white/5 flex items-center gap-4">
                  <div className="p-4 bg-emerald-500/10 text-emerald-400 rounded-2xl"><BarChart3 className="w-6 h-6" /></div>
                  <div><p className="text-xs font-bold text-slate-400 uppercase">Usage Efficiency</p><p className="text-lg font-black text-white">Optimized Performance</p></div>
                </div>
              </div>
            </div>

            {/* Activity Log Side */}
            <div className="bg-[#0F172A] rounded-[3.5rem] shadow-sm border border-white/5 overflow-hidden flex flex-col">
              <div className="p-10 border-b border-white/5 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div><h3 className="text-2xl font-normal text-white" style={{ fontFamily: "DM Serif Display, serif" }}>Dispatch <span className="text-[#D4AF37]">Logs</span></h3><p className="text-sm text-slate-400 mt-1">Comprehensive record of daily stock flow</p></div>
                <div className="flex items-center gap-3 bg-slate-950 p-2 rounded-2xl border border-white/10 text-white"><Calendar className="w-4 h-4 text-slate-400 ml-2" /><input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="bg-transparent border-none outline-none text-xs font-bold uppercase tracking-widest cursor-pointer text-white" /></div>
              </div>
              <div className="flex-1 p-10 overflow-y-auto max-h-[800px] custom-scrollbar">
                {logsLoading ? <div className="py-20 text-center"><div className="w-16 h-16 border-4 border-slate-700 border-t-[#D4AF37] rounded-full animate-spin mx-auto"></div></div> : (
                  <div className="space-y-6">
                    {stockLogs.length === 0 ? (
                      <div className="py-32 text-center opacity-30 text-slate-400"><History className="w-20 h-20 mx-auto mb-6" /><h4 className="text-xl font-bold uppercase tracking-widest">No Flow Recorded</h4></div>
                    ) : (
                      stockLogs.map(log => (
                        <div key={log._id} className="group bg-slate-900 rounded-[2.5rem] p-8 border border-white/5 hover:bg-slate-950 transition-all duration-500">
                          <div className="flex flex-col lg:flex-row justify-between gap-8">
                            <div className="flex items-start gap-6">
                              <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-transform group-hover:scale-110 duration-500 ${log.status === 'Settled' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-[#D4AF37]/10 text-[#D4AF37]'}`}>
                                {log.status === 'Settled' ? <CheckCircle2 className="w-8 h-8" /> : <ArrowUpRight className="w-8 h-8" />}
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Log ID: #{log._id.slice(-8)}</p>
                                <h4 className="text-2xl font-bold text-white group-hover:text-[#D4AF37] transition-colors">{log.item?.itemName}</h4>
                                <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><span className="px-2 py-1 bg-slate-950 rounded-md border border-white/10">{log.department}</span><span>{new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-8 lg:border-l lg:border-white/5 lg:pl-8">
                              <div className="text-center min-w-[80px]">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Issued</p>
                                <p className="text-2xl font-black text-white">{log.issuedQuantity} <span className="text-[10px] font-bold opacity-30">{log.item?.unit}</span></p>
                              </div>
                              
                              {log.status === 'Settled' ? (
                                <>
                                  <div className="text-center min-w-[80px]">
                                    <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1 italic">Returned</p>
                                    <p className="text-2xl font-black text-emerald-400">{log.returnedQuantity} <span className="text-[10px] font-bold opacity-30">{log.item?.unit}</span></p>
                                  </div>
                                  <div className="text-center min-w-[80px]">
                                    <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1 italic">Consumed</p>
                                    <p className="text-2xl font-black text-blue-600">{log.usageQuantity} <span className="text-[10px] font-bold opacity-30">{log.item?.unit}</span></p>
                                  </div>
                                </>
                              ) : (
                                <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-white/10">
                                  <input type="number" placeholder="Return" value={settleQty[log._id] || ''} onChange={(e) => setSettleQty({ ...settleQty, [log._id]: e.target.value })} className="w-24 bg-slate-900 border border-white/10 text-white rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-[#D4AF37] shadow-sm" />
                                  <button onClick={() => handleSettleSubmit(log._id)} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-900/30">Settle</button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
