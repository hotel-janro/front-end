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
  Calendar,
  Loader2,
  X
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
  const [showIssueModal, setShowIssueModal] = useState(false);

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
      setShowIssueModal(false);
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
    <div className="flex flex-col h-[calc(100vh-80px)] space-y-4 animate-in fade-in duration-500 pb-4">
      {/* Compact Top Bar */}
      <div className="bg-[#0F172A] rounded-2xl border border-white/5 shadow-md p-4 flex flex-col md:flex-row items-center justify-between gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#D4AF37]/10 text-[#D4AF37] rounded-xl">
            <Boxes className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl text-white font-normal leading-none" style={{ fontFamily: "DM Serif Display, serif" }}>
              Inventory
            </h2>
            <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest mt-1">
              Live Assets & Tracking
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex p-1 bg-slate-950 rounded-xl border border-white/10 shadow-inner">
            <button
              onClick={() => setActiveTab('stock')}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'stock' ? 'bg-[#D4AF37] text-[#0F172A] shadow-md shadow-[#D4AF37]/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Boxes className="w-4 h-4" /> Supplies
            </button>
            <button
              onClick={() => setActiveTab('tracking')}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                activeTab === 'tracking' ? 'bg-[#D4AF37] text-[#0F172A] shadow-md shadow-[#D4AF37]/20' : 'text-slate-400 hover:text-white'
              }`}
            >
              <History className="w-4 h-4" /> Dispatch
            </button>
          </div>
          {activeTab === 'stock' ? (
            <button onClick={() => { setSelectedInventoryItem(null); setShowInventoryForm(true); }} className="flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] text-[#0F172A] rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-[#D4AF37]/20">
              <Plus className="w-4 h-4" /> New Item
            </button>
          ) : (
            <button onClick={() => setShowIssueModal(true)} className="flex items-center gap-2 px-5 py-2.5 bg-[#D4AF37] text-[#0F172A] rounded-xl text-xs font-black uppercase tracking-widest hover:bg-white transition-all shadow-lg shadow-[#D4AF37]/20">
              <ArrowUpRight className="w-4 h-4" /> Issue Stock
            </button>
          )}
        </div>
      </div>

      {/* Main Content Area - Flexible height */}
      <div className="flex-1 overflow-hidden flex flex-col">
        {activeTab === 'stock' ? (
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            {/* Stats Bar - Compact */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 flex-shrink-0">
              <div className="bg-[#0F172A] p-5 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all shadow-sm">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Items</p>
                  <h3 className="text-2xl font-black text-white">{inventoryStats.total}</h3>
                </div>
                <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-400"><Boxes className="w-5 h-5" /></div>
              </div>
              <div className="bg-[#0F172A] p-5 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all shadow-sm">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Low Warning</p>
                  <h3 className="text-2xl font-black text-amber-400">{inventoryStats.low}</h3>
                </div>
                <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400"><AlertTriangle className="w-5 h-5" /></div>
              </div>
              <div className="bg-[#0F172A] p-5 rounded-2xl border border-white/5 flex items-center justify-between group hover:border-white/10 transition-all shadow-sm">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stock Out</p>
                  <h3 className="text-2xl font-black text-rose-400">{inventoryStats.out}</h3>
                </div>
                <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-400"><ArrowDownToLine className="w-5 h-5" /></div>
              </div>
              <div className="bg-[#D4AF37] p-5 rounded-2xl shadow-lg shadow-[#D4AF37]/10 flex items-center justify-between">
                <div>
                  <p className="text-[10px] font-black text-[#0F172A]/70 uppercase tracking-widest mb-1">Total Assets</p>
                  <h3 className="text-2xl font-black text-[#0F172A]">{inventoryStats.totalQty.toLocaleString()} <span className="text-xs opacity-60">Units</span></h3>
                </div>
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center text-[#0F172A]"><TrendingUp className="w-5 h-5" /></div>
              </div>
            </div>

            {/* Inventory Table Container */}
            <div className="flex-1 bg-[#0F172A] rounded-2xl border border-white/5 flex flex-col overflow-hidden shadow-sm">
              <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 flex-shrink-0 bg-slate-900/50">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Supply Catalog</h3>
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="Search items..." value={inventorySearch} onChange={(e) => setInventorySearch(e.target.value)} className="w-full pl-11 pr-4 py-2.5 bg-slate-950 border border-white/10 text-white rounded-xl text-xs font-semibold outline-none focus:border-[#D4AF37] transition-all" />
                </div>
              </div>
              <div className="flex-1 overflow-auto custom-scrollbar relative">
                {inventoryLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" /></div>
                ) : visibleInventoryItems.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500"><Package className="w-12 h-12 mb-3 opacity-20" /><p className="text-xs font-bold uppercase tracking-widest">No Items Found</p></div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-[#0F172A] z-10 shadow-sm border-b border-white/5">
                      <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest bg-slate-900/50">
                        <th className="p-4 pl-6 whitespace-nowrap">Asset Details</th>
                        <th className="p-4 text-center whitespace-nowrap">Status</th>
                        <th className="p-4 text-right whitespace-nowrap">Current Balance</th>
                        <th className="p-4 pr-6 text-right whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {visibleInventoryItems.map((item) => {
                        const isOut = item.quantity <= 0;
                        const isLow = item.quantity > 0 && item.quantity <= item.thresholdLevel;
                        const statusColor = isOut ? 'text-rose-500 bg-rose-500/10 border-rose-500/20' : isLow ? 'text-amber-500 bg-amber-500/10 border-amber-500/20' : 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
                        const statusLabel = isOut ? 'Empty' : isLow ? 'Low Stock' : 'Sufficient';
                        return (
                          <tr key={item._id} className="hover:bg-slate-900/50 transition-colors group">
                            <td className="p-4 pl-6">
                              <p className="text-sm font-bold text-white group-hover:text-[#D4AF37] transition-colors">{item.itemName}</p>
                              <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">Ref ID: {item._id.slice(-8)}</p>
                            </td>
                            <td className="p-4 text-center">
                              <span className={`inline-flex items-center px-3 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border ${statusColor}`}>{statusLabel}</span>
                            </td>
                            <td className="p-4 text-right">
                              <p className={`text-lg font-black ${isOut ? 'text-rose-500' : isLow ? 'text-amber-400' : 'text-white'}`}>{item.quantity} <span className="text-[10px] text-slate-400 ml-1">{item.unit}</span></p>
                              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-0.5">Min Level: {item.thresholdLevel}</p>
                            </td>
                            <td className="p-4 pr-6 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => {
                                  const amount = window.prompt(`How many ${item.unit} of ${item.itemName} are you restocking?`);
                                  if (!amount || isNaN(amount) || amount <= 0) return;
                                  const payload = { ...item, quantity: item.quantity + Number(amount) };
                                  apiFetch(`/inventory/${item._id}`, { method: 'PUT', body: JSON.stringify(payload) }).then(() => { toast.success('Stock replenished'); loadInventory(); }).catch(e => alert(e.message));
                                }} className="p-2.5 bg-slate-950 text-slate-400 rounded-lg hover:bg-emerald-500/20 hover:text-emerald-400 transition-colors border border-white/5" title="Restock">
                                  <ArrowDownToLine className="w-4 h-4" />
                                </button>
                                <button onClick={() => setSelectedInventoryItem(item)} className="p-2.5 bg-slate-950 text-slate-400 rounded-lg hover:bg-[#D4AF37]/20 hover:text-[#D4AF37] transition-colors border border-white/5" title="Edit">
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => deleteInventoryItem(item._id)} className="p-2.5 bg-slate-950 text-slate-400 rounded-lg hover:bg-rose-500/20 hover:text-rose-400 transition-colors border border-white/5" title="Delete">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col gap-4 overflow-hidden">
            {/* Tracking Charts Row (Compact) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 flex-shrink-0">
              <div className="lg:col-span-1 bg-[#0F172A] rounded-2xl border border-white/5 p-5 flex flex-col justify-center shadow-sm">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Department Usage</h4>
                <div className="space-y-4">
                  {analyticsData.usageByDept.map(dept => (
                    <div key={dept.name} className="space-y-1.5">
                      <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-300"><span>{dept.name}</span><span className="text-[#D4AF37]">{dept.value} Units</span></div>
                      <div className="h-1.5 bg-slate-950 rounded-full overflow-hidden border border-white/5"><div className="h-full bg-gradient-to-r from-[#0F172A] to-[#D4AF37] rounded-full" style={{ width: `${(dept.value / analyticsData.maxUsage) * 100}%` }} /></div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="lg:col-span-2 bg-[#0F172A] rounded-2xl border border-white/5 p-5 flex flex-col shadow-sm">
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">7-Day Dispatch Trend</h4>
                <div className="flex-1 min-h-[120px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorIssued" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#D4AF37" stopOpacity={0.4}/><stop offset="95%" stopColor="#D4AF37" stopOpacity={0.0}/></linearGradient>
                        <linearGradient id="colorConsumed" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4}/><stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0}/></linearGradient>
                      </defs>
                      <XAxis dataKey="date" stroke="#64748B" fontSize={9} tickLine={false} axisLine={false} />
                      <YAxis stroke="#64748B" fontSize={9} tickLine={false} axisLine={false} />
                      <Tooltip contentStyle={{ backgroundColor: '#0F172A', border: '1px solid #1E293B', fontSize: '11px', color: '#fff', borderRadius: '8px' }} />
                      <Area type="monotone" dataKey="Qty Issued" stroke="#D4AF37" strokeWidth={2} fillOpacity={1} fill="url(#colorIssued)" />
                      <Area type="monotone" dataKey="Qty Consumed" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorConsumed)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Tracking Logs Table */}
            <div className="flex-1 bg-[#0F172A] rounded-2xl border border-white/5 flex flex-col overflow-hidden shadow-sm">
              <div className="p-4 border-b border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 flex-shrink-0 bg-slate-900/50">
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Dispatch Logs</h3>
                <div className="flex items-center gap-3 bg-slate-950 px-4 py-2.5 rounded-xl border border-white/10">
                  <Calendar className="w-4 h-4 text-[#D4AF37]" />
                  <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="bg-transparent border-none text-xs text-white font-bold uppercase tracking-widest outline-none cursor-pointer" />
                </div>
              </div>
              <div className="flex-1 overflow-auto custom-scrollbar relative">
                {logsLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" /></div>
                ) : stockLogs.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-500"><History className="w-12 h-12 mb-3 opacity-20" /><p className="text-xs font-bold uppercase tracking-widest">No Logs Found for {filterDate}</p></div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead className="sticky top-0 bg-[#0F172A] z-10 shadow-sm border-b border-white/5">
                      <tr className="text-slate-400 text-[10px] font-black uppercase tracking-widest bg-slate-900/50">
                        <th className="p-4 pl-6 whitespace-nowrap">Time & Dept</th>
                        <th className="p-4 whitespace-nowrap">Asset</th>
                        <th className="p-4 text-center whitespace-nowrap">Issued</th>
                        <th className="p-4 text-center whitespace-nowrap">Returned</th>
                        <th className="p-4 text-center whitespace-nowrap">Consumed</th>
                        <th className="p-4 pr-6 text-right whitespace-nowrap">Status/Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-sm font-semibold">
                      {stockLogs.map(log => {
                        const isSettled = log.status === 'Settled';
                        return (
                          <tr key={log._id} className="hover:bg-slate-900/50 transition-colors group">
                            <td className="p-4 pl-6">
                              <p className="text-white text-xs font-bold">{new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                              <span className="inline-block mt-1 text-[9px] font-black text-[#D4AF37] uppercase tracking-widest px-2 py-0.5 rounded-md bg-[#D4AF37]/10 border border-[#D4AF37]/20">{log.department}</span>
                            </td>
                            <td className="p-4">
                              <p className="text-white text-sm font-bold group-hover:text-[#D4AF37] transition-colors">{log.item?.itemName}</p>
                              <p className="text-[9px] text-slate-500 uppercase tracking-widest mt-0.5">Log: #{log._id.slice(-6)}</p>
                            </td>
                            <td className="p-4 text-center">
                              <p className="text-lg font-black text-white">{log.issuedQuantity}</p>
                              <p className="text-[9px] text-slate-500 uppercase tracking-widest">{log.item?.unit}</p>
                            </td>
                            <td className="p-4 text-center">
                              {isSettled ? (
                                <><p className="text-lg font-black text-emerald-400">{log.returnedQuantity}</p><p className="text-[9px] text-slate-500 uppercase tracking-widest">{log.item?.unit}</p></>
                              ) : <span className="text-slate-600">-</span>}
                            </td>
                            <td className="p-4 text-center">
                              {isSettled ? (
                                <><p className="text-lg font-black text-blue-400">{log.usageQuantity}</p><p className="text-[9px] text-slate-500 uppercase tracking-widest">{log.item?.unit}</p></>
                              ) : <span className="text-slate-600">-</span>}
                            </td>
                            <td className="p-4 pr-6 text-right">
                              {isSettled ? (
                                <span className="inline-flex items-center gap-1.5 text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20"><CheckCircle2 className="w-3 h-3"/> Settled</span>
                              ) : (
                                <div className="flex items-center justify-end gap-2">
                                  <input type="number" placeholder="Ret Qty" value={settleQty[log._id] || ''} onChange={(e) => setSettleQty({ ...settleQty, [log._id]: e.target.value })} className="w-20 bg-slate-950 border border-white/10 rounded-lg px-2 py-2 text-xs text-white outline-none focus:border-[#D4AF37] text-center font-bold" />
                                  <button onClick={() => handleSettleSubmit(log._id)} className="bg-[#D4AF37] text-[#0F172A] px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest hover:bg-white transition-colors shadow-lg shadow-[#D4AF37]/20">Settle</button>
                                </div>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Item Modal */}
      {showInventoryForm && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-[#0F172A] rounded-[2rem] border border-white/10 shadow-2xl w-full max-w-md flex flex-col">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-2xl text-white font-normal" style={{ fontFamily: "DM Serif Display, serif" }}>{selectedInventoryItem ? 'Edit Asset' : 'New Supply'}</h3>
              <button onClick={() => { setShowInventoryForm(false); setSelectedInventoryItem(null); }} className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-rose-500/20 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <form onSubmit={handleInventorySubmit} className="space-y-5">
                <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset Name</label><input value={inventoryForm.itemName} onChange={(e) => setInventoryForm({ ...inventoryForm, itemName: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#D4AF37] font-semibold" required placeholder="e.g. Basmathi Rice" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Current Stock</label><input type="number" min="0" value={inventoryForm.quantity} onChange={(e) => setInventoryForm({ ...inventoryForm, quantity: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#D4AF37] font-bold" required /></div>
                  <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Safety Min.</label><input type="number" min="0" value={inventoryForm.thresholdLevel} onChange={(e) => setInventoryForm({ ...inventoryForm, thresholdLevel: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#D4AF37] font-bold" required /></div>
                </div>
                <div className="space-y-1.5"><label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Unit (kg, pcs)</label><input value={inventoryForm.unit} onChange={(e) => setInventoryForm({ ...inventoryForm, unit: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none focus:border-[#D4AF37] font-semibold" placeholder="pcs" /></div>
                <div className="pt-2">
                  <button type="submit" disabled={savingInventory} className="w-full rounded-xl bg-[#D4AF37] px-6 py-4 text-[#0F172A] font-black text-xs uppercase tracking-[0.2em] hover:bg-white disabled:opacity-50 transition-all shadow-xl shadow-[#D4AF37]/20">{savingInventory ? 'Saving...' : 'Save Asset'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-[#0F172A] rounded-[2rem] border border-white/10 shadow-2xl w-full max-w-md flex flex-col">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
              <h3 className="text-2xl text-white font-normal" style={{ fontFamily: "DM Serif Display, serif" }}>Issue Stock</h3>
              <button onClick={() => setShowIssueModal(false)} className="p-2 text-slate-400 hover:text-white bg-slate-900 hover:bg-rose-500/20 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <form onSubmit={handleIssueSubmit} className="space-y-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Asset</label>
                  <select value={issueForm.itemId} onChange={(e) => setIssueForm({ ...issueForm, itemId: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-[#D4AF37] appearance-none cursor-pointer" required>
                    <option value="" disabled className="text-slate-500">Choose Item...</option>
                    {inventoryItems.map(item => (<option key={item._id} value={item._id} className="bg-[#0F172A]">{item.itemName} ({item.quantity} {item.unit})</option>))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Dept</label>
                    <select value={issueForm.department} onChange={(e) => setIssueForm({ ...issueForm, department: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-[#D4AF37] appearance-none cursor-pointer" required>
                      <option value="Restaurant" className="bg-[#0F172A]">Restaurant</option>
                      <option value="Weddings" className="bg-[#0F172A]">Weddings</option>
                      <option value="Pool" className="bg-[#0F172A]">Pool</option>
                      <option value="Other" className="bg-[#0F172A]">Other</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Qty</label>
                    <input type="number" min="1" value={issueForm.quantity} onChange={(e) => setIssueForm({ ...issueForm, quantity: e.target.value })} className="w-full bg-slate-950 border border-white/10 rounded-xl px-4 py-3 text-sm font-bold text-white outline-none focus:border-[#D4AF37]" required />
                  </div>
                </div>
                <div className="pt-2">
                  <button type="submit" disabled={savingIssue} className="w-full bg-[#D4AF37] text-[#0F172A] py-4 rounded-xl font-black text-xs uppercase tracking-[0.2em] hover:bg-white transition-all shadow-xl shadow-[#D4AF37]/20 disabled:opacity-50">{savingIssue ? 'Dispatching...' : 'Dispatch Resources'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
