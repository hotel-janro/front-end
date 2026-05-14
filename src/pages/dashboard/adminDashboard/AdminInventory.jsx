import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../../api.js';
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
  const [logsLoading, setLogsLoading] = useState(false);
  const [issueForm, setIssueForm] = useState(emptyIssueForm);
  const [savingIssue, setSavingIssue] = useState(false);
  const [settleQty, setSettleQty] = useState({}); // logId -> quantity
  const [filterDate, setFilterDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    loadInventory();
  }, []);

  useEffect(() => {
    if (activeTab === 'tracking') {
      loadLogs();
    }
  }, [activeTab, filterDate]);

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
      await Promise.all([loadInventory(), loadLogs()]);
      alert('Stock issued successfully!');
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
      await Promise.all([loadInventory(), loadLogs()]);
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
             <div className="flex p-1.5 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl">
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
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-xl transition-all duration-500">
              <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-6 group-hover:scale-110 transition-transform"><Boxes className="w-6 h-6" /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Items</p>
                <h3 className="text-3xl font-black text-slate-900">{inventoryStats.total}</h3>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-xl transition-all duration-500">
              <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-6 group-hover:scale-110 transition-transform"><AlertTriangle className="w-6 h-6" /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Low Warning</p>
                <h3 className="text-3xl font-black text-amber-600">{inventoryStats.low}</h3>
              </div>
            </div>
            <div className="bg-white p-8 rounded-[2.5rem] shadow-sm border border-slate-100 flex flex-col justify-between group hover:shadow-xl transition-all duration-500">
              <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600 mb-6 group-hover:scale-110 transition-transform"><ArrowDownToLine className="w-6 h-6" /></div>
              <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stock Out</p>
                <h3 className="text-3xl font-black text-rose-600">{inventoryStats.out}</h3>
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

          <div className="grid gap-10 xl:grid-cols-[400px_1fr]">
            {/* Form Side */}
            <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100 space-y-8">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-normal text-slate-900" style={{ fontFamily: "DM Serif Display, serif" }}>{selectedInventoryItem ? 'Refine Item' : 'New Supply'}</h3>
                <button onClick={() => { setSelectedInventoryItem(null); setShowInventoryForm(!showInventoryForm); }} className={`p-3 rounded-full transition-all ${showInventoryForm ? 'bg-rose-50 text-rose-500 rotate-45' : 'bg-blue-50 text-blue-600 shadow-lg shadow-blue-100'}`}><Plus className="w-6 h-6" /></button>
              </div>
              
              {showInventoryForm ? (
                <form onSubmit={handleInventorySubmit} className="space-y-6 animate-in fade-in slide-in-from-top-6 duration-500">
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Name</label><input value={inventoryForm.itemName} onChange={(e) => setInventoryForm({ ...inventoryForm, itemName: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-6 py-4 outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/5 transition-all font-medium" required /></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantity</label><input type="number" min="0" value={inventoryForm.quantity} onChange={(e) => setInventoryForm({ ...inventoryForm, quantity: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-6 py-4 outline-none focus:border-[#D4AF37] font-black" required /></div>
                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Safety Level</label><input type="number" min="0" value={inventoryForm.thresholdLevel} onChange={(e) => setInventoryForm({ ...inventoryForm, thresholdLevel: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-6 py-4 outline-none focus:border-[#D4AF37] font-black" required /></div>
                  </div>
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Measurement Unit</label><input value={inventoryForm.unit} onChange={(e) => setInventoryForm({ ...inventoryForm, unit: e.target.value })} className="w-full rounded-2xl border border-slate-200 px-6 py-4 outline-none focus:border-[#D4AF37] font-medium" placeholder="kg, pcs, litres..." /></div>
                  <button type="submit" disabled={savingInventory} className="w-full rounded-[2rem] bg-[#0F172A] px-6 py-5 text-white font-black text-sm uppercase tracking-[0.3em] hover:bg-slate-800 disabled:opacity-50 shadow-2xl shadow-slate-200 transition-all">{savingInventory ? 'Syncing...' : selectedInventoryItem ? 'Confirm Changes' : 'Add to Catalog'}</button>
                </form>
              ) : (
                <div className="py-20 text-center space-y-4">
                  <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200 border-2 border-dashed border-slate-200"><Package className="w-10 h-10" /></div>
                  <p className="text-sm text-slate-400 font-medium">Capture a new supply asset by <br/> tapping the <Plus className="w-3 h-3 inline mx-1" /> button above.</p>
                </div>
              )}
            </div>

            {/* Table Side */}
            <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 flex flex-col overflow-hidden">
              <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div><h3 className="text-2xl font-normal text-slate-900" style={{ fontFamily: "DM Serif Display, serif" }}>Supply <span className="text-[#D4AF37]">Catalog</span></h3><p className="text-sm text-slate-400 mt-1">Live digital record of all physical assets</p></div>
                <div className="relative max-w-xs w-full"><Search className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" /><input type="text" placeholder="Search for items..." value={inventorySearch} onChange={(e) => setInventorySearch(e.target.value)} className="w-full pl-14 pr-6 py-4 rounded-[2rem] bg-slate-50 border-none outline-none text-sm font-medium focus:ring-4 focus:ring-[#D4AF37]/5 transition-all" /></div>
              </div>
              <div className="flex-1 p-10 overflow-x-auto">
                {inventoryLoading ? <div className="py-20 text-center"><div className="w-16 h-16 border-4 border-slate-100 border-t-[#D4AF37] rounded-full animate-spin mx-auto"></div></div> : (
                  <table className="w-full text-left border-separate border-spacing-y-4">
                    <thead><tr className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]"><th className="px-8 pb-2">Asset Details</th><th className="px-8 pb-2 text-center">Status</th><th className="px-8 pb-2">Balance</th><th className="px-8 pb-2 text-right">Actions</th></tr></thead>
                    <tbody>
                      {visibleInventoryItems.map((item) => {
                        const status = item.quantity <= 0 ? { l: 'Empty', c: 'text-rose-500', b: 'bg-rose-50' } : item.quantity <= item.thresholdLevel ? { l: 'Low', c: 'text-amber-500', b: 'bg-amber-50' } : { l: 'Sufficient', c: 'text-emerald-500', b: 'bg-emerald-50' };
                        return (
                          <tr key={item._id} className="group bg-white hover:bg-slate-50/50 transition-all duration-300">
                            <td className="px-8 py-6 rounded-l-[2rem] border-y border-l border-slate-100"><p className="font-bold text-slate-900 text-lg group-hover:text-[#D4AF37] transition-colors">{item.itemName}</p><p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Ref ID: {item._id.slice(-8)}</p></td>
                            <td className="px-8 py-6 border-y border-slate-100 text-center"><span className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.2em] ${status.b} ${status.c} border border-current/10`}>{status.l}</span></td>
                            <td className="px-8 py-6 border-y border-slate-100"><span className="text-2xl font-black text-slate-900 tracking-tighter">{item.quantity}</span> <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">{item.unit}</span></td>
                            <td className="px-8 py-6 rounded-r-[2rem] border-y border-r border-slate-100 text-right"><div className="flex items-center justify-end gap-3"><button onClick={() => setSelectedInventoryItem(item)} className="p-3 bg-slate-50 text-slate-400 rounded-xl hover:bg-[#0F172A] hover:text-white transition-all"><Edit2 className="w-4 h-4" /></button><button onClick={() => deleteInventoryItem(item._id)} className="p-3 bg-rose-50 text-rose-400 rounded-xl hover:bg-rose-500 hover:text-white transition-all"><Trash2 className="w-4 h-4" /></button></div></td>
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
                  <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Selection</label><select value={issueForm.itemId} onChange={(e) => setIssueForm({ ...issueForm, itemId: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#D4AF37] appearance-none cursor-pointer" required><option value="" className="text-slate-900">Choose Master Stock...</option>{inventoryItems.map(item => (<option key={item._id} value={item._id} className="text-slate-900">{item.itemName} ({item.quantity} available)</option>))}</select></div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Target Dept</label><select value={issueForm.department} onChange={(e) => setIssueForm({ ...issueForm, department: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#D4AF37] appearance-none cursor-pointer" required><option value="Restaurant" className="text-slate-900">Restaurant</option><option value="Weddings" className="text-slate-900">Weddings</option><option value="Pool" className="text-slate-900">Pool</option><option value="Other" className="text-slate-900">Other</option></select></div>
                    <div className="space-y-2"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Quantity</label><input type="number" min="1" value={issueForm.quantity} onChange={(e) => setIssueForm({ ...issueForm, quantity: e.target.value })} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm font-bold outline-none focus:border-[#D4AF37]" required /></div>
                  </div>
                  <button type="submit" disabled={savingIssue} className="w-full bg-[#D4AF37] text-[#0F172A] py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] hover:scale-[1.02] active:scale-95 transition-all shadow-xl shadow-[#D4AF37]/10 disabled:opacity-50">{savingIssue ? 'Authorizing...' : 'Execute Dispatch'}</button>
                </form>
              </div>

              {/* Visual Analytics */}
              <div className="bg-white p-10 rounded-[3rem] shadow-sm border border-slate-100">
                <h3 className="text-xl font-normal text-slate-900 mb-8" style={{ fontFamily: "DM Serif Display, serif" }}>Consumption <span className="text-blue-600">Analytics</span></h3>
                <div className="space-y-6">
                  {analyticsData.usageByDept.map(dept => (
                    <div key={dept.name} className="space-y-2">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-400"><span>{dept.name}</span><span>{dept.value} Units Used</span></div>
                      <div className="h-3 bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                        <div className="h-full bg-gradient-to-r from-blue-500 to-teal-400 rounded-full transition-all duration-1000" style={{ width: `${(dept.value / analyticsData.maxUsage) * 100}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-10 pt-8 border-t border-slate-50 flex items-center gap-4">
                  <div className="p-4 bg-emerald-50 text-emerald-600 rounded-2xl"><BarChart3 className="w-6 h-6" /></div>
                  <div><p className="text-xs font-bold text-slate-400 uppercase">Usage Efficiency</p><p className="text-lg font-black text-slate-900">Optimized Performance</p></div>
                </div>
              </div>
            </div>

            {/* Activity Log Side */}
            <div className="bg-white rounded-[3.5rem] shadow-sm border border-slate-100 overflow-hidden flex flex-col">
              <div className="p-10 border-b border-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div><h3 className="text-2xl font-normal text-slate-900" style={{ fontFamily: "DM Serif Display, serif" }}>Dispatch <span className="text-[#D4AF37]">Logs</span></h3><p className="text-sm text-slate-400 mt-1">Comprehensive record of daily stock flow</p></div>
                <div className="flex items-center gap-3 bg-slate-50 p-2 rounded-2xl border border-slate-100"><Calendar className="w-4 h-4 text-slate-400 ml-2" /><input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="bg-transparent border-none outline-none text-xs font-bold uppercase tracking-widest cursor-pointer" /></div>
              </div>
              <div className="flex-1 p-10 overflow-y-auto max-h-[800px] custom-scrollbar">
                {logsLoading ? <div className="py-20 text-center"><div className="w-16 h-16 border-4 border-slate-100 border-t-[#D4AF37] rounded-full animate-spin mx-auto"></div></div> : (
                  <div className="space-y-6">
                    {stockLogs.length === 0 ? (
                      <div className="py-32 text-center opacity-30"><History className="w-20 h-20 mx-auto mb-6" /><h4 className="text-xl font-bold uppercase tracking-widest">No Flow Recorded</h4></div>
                    ) : (
                      stockLogs.map(log => (
                        <div key={log._id} className="group bg-white rounded-[2.5rem] p-8 border border-slate-100 hover:shadow-2xl hover:shadow-slate-200/50 transition-all duration-500">
                          <div className="flex flex-col lg:flex-row justify-between gap-8">
                            <div className="flex items-start gap-6">
                              <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center transition-transform group-hover:scale-110 duration-500 ${log.status === 'Settled' ? 'bg-emerald-50 text-emerald-600' : 'bg-[#D4AF37]/10 text-[#D4AF37]'}`}>
                                {log.status === 'Settled' ? <CheckCircle2 className="w-8 h-8" /> : <ArrowUpRight className="w-8 h-8" />}
                              </div>
                              <div>
                                <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Log ID: #{log._id.slice(-8)}</p>
                                <h4 className="text-2xl font-bold text-slate-900 group-hover:text-[#D4AF37] transition-colors">{log.item?.itemName}</h4>
                                <div className="flex items-center gap-3 mt-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest"><span className="px-2 py-1 bg-slate-50 rounded-md border border-slate-100">{log.department}</span><span>{new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
                              </div>
                            </div>
                            
                            <div className="flex flex-wrap items-center gap-8 lg:border-l lg:border-slate-50 lg:pl-8">
                              <div className="text-center min-w-[80px]">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">Issued</p>
                                <p className="text-2xl font-black text-slate-900">{log.issuedQuantity} <span className="text-[10px] font-bold opacity-30">{log.item?.unit}</span></p>
                              </div>
                              
                              {log.status === 'Settled' ? (
                                <>
                                  <div className="text-center min-w-[80px]">
                                    <p className="text-[9px] font-black text-emerald-400 uppercase tracking-widest mb-1 italic">Returned</p>
                                    <p className="text-2xl font-black text-emerald-600">{log.returnedQuantity} <span className="text-[10px] font-bold opacity-30">{log.item?.unit}</span></p>
                                  </div>
                                  <div className="text-center min-w-[80px]">
                                    <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest mb-1 italic">Consumed</p>
                                    <p className="text-2xl font-black text-blue-600">{log.usageQuantity} <span className="text-[10px] font-bold opacity-30">{log.item?.unit}</span></p>
                                  </div>
                                </>
                              ) : (
                                <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                                  <input type="number" placeholder="Return" value={settleQty[log._id] || ''} onChange={(e) => setSettleQty({ ...settleQty, [log._id]: e.target.value })} className="w-24 bg-white border border-slate-200 rounded-xl px-4 py-2 text-sm font-bold outline-none focus:border-[#D4AF37] shadow-sm" />
                                  <button onClick={() => handleSettleSubmit(log._id)} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100">Settle</button>
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
