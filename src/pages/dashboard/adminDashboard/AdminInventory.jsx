import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '../../../api.js';
import { toast } from 'sonner';

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
  department: 'Restaurant Kitchen',
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
  const [alertShown, setAlertShown] = useState(false);

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



  // Daily Summary Grouped by Ingredient
  const dailySummary = useMemo(() => {
    const itemsMap = {};
    stockLogs.forEach(log => {
      const itemId = log.item?._id;
      if (!itemId) return;
      if (!itemsMap[itemId]) {
        itemsMap[itemId] = {
          itemName: log.item.itemName,
          unit: log.item.unit,
          restocked: 0,
          issued: 0,
          returned: 0,
          consumed: 0,
          logs: []
        };
      }
      
      if (log.logType === 'Restock') {
        itemsMap[itemId].restocked += log.restockQuantity || 0;
      } else {
        itemsMap[itemId].issued += log.issuedQuantity || 0;
        itemsMap[itemId].returned += log.returnedQuantity || 0;
        itemsMap[itemId].consumed += log.usageQuantity || 0;
      }
      itemsMap[itemId].logs.push(log);
    });
    return Object.values(itemsMap);
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
      return toast.warning('Please provide a name for this inventory asset');
    }
    const qty = Number(inventoryForm.quantity);
    const threshold = Number(inventoryForm.thresholdLevel);
    
    if (isNaN(qty) || qty < 0) {
      return toast.warning('Quantity must be a valid non-negative number');
    }
    if (isNaN(threshold) || threshold < 0) {
      return toast.warning('Threshold level must be a valid non-negative number');
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
      toast.error(error.message || 'Failed to save inventory item.');
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
    if (!issueForm.itemId) return toast.warning('Please select an item to issue');
    const issueQty = Number(issueForm.quantity);
    if (isNaN(issueQty) || issueQty <= 0) return toast.warning('Please enter a valid quantity to issue');

    const selectedItem = inventoryItems.find(i => i._id === issueForm.itemId);
    if (selectedItem && selectedItem.quantity < issueQty) {
      return toast.error(`Insufficient Stock: Only ${selectedItem.quantity} ${selectedItem.unit} available.`);
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
      toast.error(error.message);
    } finally {
      setSavingIssue(false);
    }
  };

  const handleSettleSubmit = async (logId) => {
    const qty = settleQty[logId];
    if (qty === undefined || qty === '') return toast.warning('Please enter returned quantity');

    try {
      await apiFetch('/inventory/settle', {
        method: 'POST',
        body: JSON.stringify({ logId, returnedQuantity: Number(qty) })
      });
      await Promise.all([loadInventory(), loadLogs(), loadAllLogs()]);
    } catch (error) {
      toast.error(error.message);
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

  useEffect(() => {
    if (inventoryStats.low > 0 && !alertShown && !inventoryLoading) {
      const lowItems = inventoryItems.filter(i => i.quantity <= i.thresholdLevel && i.quantity > 0);
      const itemNames = lowItems.map(i => i.itemName).join(', ');
      
      toast.error(`⚠️ Attention: Low Stock! (${itemNames})`, {
        duration: 8000,
        position: 'top-center',
        style: { background: '#f59e0b', color: '#000', border: 'none', fontWeight: 'bold' }
      });
      setAlertShown(true);
    }
  }, [inventoryStats.low, alertShown, inventoryLoading, inventoryItems]);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-4">
      {/* Header Banner */}
      <div className="rounded-2xl border border-[#0F172A]/10 bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#0F172A] px-6 py-8 md:px-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 shadow-xl">
        <div>
          <p className="text-[#D4AF37] tracking-[0.22em] uppercase text-xs mb-3 font-semibold">Janro Hotel</p>
          <h1 className="text-3xl md:text-4xl text-white" style={{ fontFamily: "DM Serif Display, serif" }}>
            Inventory Panel
          </h1>
          <p className="text-slate-300 mt-2">
            Manage live assets, track stock levels, and monitor daily dispatch
          </p>
        </div>
        
        <div className="flex gap-3">
          {activeTab === 'stock' ? (
            <button 
              onClick={() => { setSelectedInventoryItem(null); setShowInventoryForm(true); }} 
              className="flex items-center gap-2 px-6 py-3 bg-[#D4AF37] hover:bg-[#b5952f] text-slate-900 rounded-xl font-bold transition-all transform hover:-translate-y-0.5 shadow-lg shadow-[#D4AF37]/20 whitespace-nowrap"
            >
              <Plus className="w-5 h-5" />
              New Asset
            </button>
          ) : (
            <button 
              onClick={() => setShowIssueModal(true)} 
              className="flex items-center gap-2 px-6 py-3 bg-[#D4AF37] hover:bg-[#b5952f] text-slate-900 rounded-xl font-bold transition-all transform hover:-translate-y-0.5 shadow-lg shadow-[#D4AF37]/20 whitespace-nowrap"
            >
              <ArrowUpRight className="w-5 h-5" />
              Issue Stock
            </button>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab('stock')}
          className={`pb-4 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'stock' 
              ? 'border-[#0F172A] text-[#0F172A]' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <Boxes className="w-5 h-5" />
          Supplies Catalog
        </button>
        
        <button
          onClick={() => setActiveTab('tracking')}
          className={`pb-4 px-2 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
            activeTab === 'tracking' 
              ? 'border-[#0F172A] text-[#0F172A]' 
              : 'border-transparent text-slate-400 hover:text-slate-600'
          }`}
        >
          <History className="w-5 h-5" />
          Dispatch & Tracking
        </button>
      </div>

      {/* Main Content Area */}
      <div>
        {activeTab === 'stock' ? (
          <div className="space-y-6">
            {/* Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                  <Boxes className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Total Items</p>
                  <h3 className="text-2xl font-bold text-slate-800">{inventoryStats.total}</h3>
                </div>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Low Warning</p>
                  <h3 className="text-2xl font-bold text-slate-800">{inventoryStats.low}</h3>
                </div>
              </div>
              <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm flex items-center gap-4">
                <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-xl flex items-center justify-center">
                  <ArrowDownToLine className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm text-slate-500 font-medium">Stock Out</p>
                  <h3 className="text-2xl font-bold text-slate-800">{inventoryStats.out}</h3>
                </div>
              </div>
            </div>

            {/* Inventory Table Container */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 p-6 flex flex-col gap-4 lg:flex-row lg:items-center justify-between">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Supply Catalog</h3>
                <div className="relative w-full sm:max-w-xs">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input type="text" placeholder="Search items..." value={inventorySearch} onChange={(e) => setInventorySearch(e.target.value)} className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 text-slate-800 rounded-xl text-sm focus:ring-2 focus:ring-[#0F172A] outline-none transition-all" />
                </div>
              </div>
              <div className="overflow-x-auto relative min-h-[300px]">
                {inventoryLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#0F172A] animate-spin" /></div>
                ) : visibleInventoryItems.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400"><Package className="w-12 h-12 mb-3 opacity-50" /><p className="text-sm font-semibold uppercase tracking-widest">No Items Found</p></div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/70 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Asset Details</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Status</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Current Balance</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white">
                      {visibleInventoryItems.map((item) => {
                        const isOut = item.quantity <= 0;
                        const isLow = item.quantity > 0 && item.quantity <= item.thresholdLevel;
                        const statusColor = isOut ? 'text-rose-700 bg-rose-50 border-rose-200' : isLow ? 'text-amber-700 bg-amber-50 border-amber-200' : 'text-emerald-700 bg-emerald-50 border-emerald-200';
                        const statusLabel = isOut ? 'Empty' : isLow ? 'Low Stock' : 'Sufficient';
                        return (
                          <tr key={item._id} className="hover:bg-slate-50 transition-colors group">
                            <td className="px-6 py-4">
                              <p className="text-sm font-bold text-slate-800">{item.itemName}</p>
                              <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Ref ID: {item._id.slice(-8)}</p>
                            </td>
                            <td className="px-6 py-4 text-center">
                              <span className={`inline-flex items-center px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${statusColor}`}>{statusLabel}</span>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <p className={`text-lg font-black ${isOut ? 'text-rose-600' : isLow ? 'text-amber-500' : 'text-slate-800'}`}>{item.quantity} <span className="text-xs text-slate-500 ml-1 font-semibold">{item.unit}</span></p>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Min Level: {item.thresholdLevel}</p>
                            </td>
                            <td className="px-6 py-4 text-right">
                              <div className="flex items-center justify-end gap-2">
                                <button onClick={() => {
                                  const amount = window.prompt(`How many ${item.unit} of ${item.itemName} are you restocking?`);
                                  if (!amount || isNaN(amount) || amount <= 0) return;
                                  const payload = { itemId: item._id, quantity: Number(amount), notes: "Restocked from Supplier" };
                                  apiFetch('/inventory/restock', { method: 'POST', body: JSON.stringify(payload) }).then(() => { toast.success('Stock replenished'); loadInventory(); loadAllLogs(); }).catch(e => toast.error(e.message));
                                }} className="p-2 text-slate-400 hover:bg-emerald-50 hover:text-emerald-600 rounded-lg transition-colors border border-transparent hover:border-emerald-100" title="Restock">
                                  <ArrowDownToLine className="w-4 h-4" />
                                </button>
                                <button onClick={() => setSelectedInventoryItem(item)} className="p-2 text-slate-400 hover:bg-blue-50 hover:text-blue-600 rounded-lg transition-colors border border-transparent hover:border-blue-100" title="Edit">
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => deleteInventoryItem(item._id)} className="p-2 text-slate-400 hover:bg-rose-50 hover:text-rose-600 rounded-lg transition-colors border border-transparent hover:border-rose-100" title="Delete">
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
          <div className="space-y-6">
            {/* Tracking Logs Table */}
            <div className="bg-white border border-slate-100 rounded-2xl shadow-sm overflow-hidden">
              <div className="border-b border-slate-100 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">Daily Summary Report</h3>
                <div className="flex items-center gap-3 bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-200">
                  <Calendar className="w-5 h-5 text-slate-400" />
                  <input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="bg-transparent border-none text-sm text-slate-800 font-semibold outline-none cursor-pointer" />
                </div>
              </div>
              <div className="overflow-x-auto relative min-h-[300px]">
                {logsLoading ? (
                  <div className="absolute inset-0 flex items-center justify-center"><Loader2 className="w-8 h-8 text-[#0F172A] animate-spin" /></div>
                ) : dailySummary.length === 0 ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400"><History className="w-12 h-12 mb-3 opacity-50" /><p className="text-sm font-semibold uppercase tracking-widest">No Logs Found</p></div>
                ) : (
                  <table className="w-full text-left border-collapse">
                    <thead className="bg-slate-50/70 border-b border-slate-100">
                      <tr>
                        <th className="px-6 py-4 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Ingredient</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Restocked</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Issued</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Returned</th>
                        <th className="px-6 py-4 text-center text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Consumed</th>
                        <th className="px-6 py-4 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 bg-white text-sm">
                      {dailySummary.map(summary => {
                        const unsettledLogs = summary.logs.filter(log => log.logType === 'Issue' && log.status === 'Issued');
                        const allSettled = unsettledLogs.length === 0;

                        return (
                          <React.Fragment key={summary.itemName}>
                            <tr className="hover:bg-slate-50 transition-colors group">
                              <td className="px-6 py-4">
                                <p className="text-slate-800 font-bold">{summary.itemName}</p>
                                <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-0.5">{summary.unit}</p>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <p className="text-lg font-black text-emerald-600">{summary.restocked > 0 ? `+${summary.restocked}` : '-'}</p>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <p className="text-lg font-black text-rose-600">{summary.issued > 0 ? `-${summary.issued}` : '-'}</p>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <p className="text-lg font-black text-emerald-600">{summary.returned > 0 ? `+${summary.returned}` : '-'}</p>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <p className="text-lg font-black text-blue-600">{summary.consumed > 0 ? summary.consumed : '-'}</p>
                              </td>
                              <td className="px-6 py-4 text-right">
                                {allSettled ? (
                                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200"><CheckCircle2 className="w-3 h-3"/> Settled</span>
                                ) : (
                                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-amber-600 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200">{unsettledLogs.length} Pending</span>
                                )}
                              </td>
                            </tr>
                            {summary.logs.map(log => {
                              const isSettled = log.status === 'Settled';
                              const isRestock = log.logType === 'Restock';
                              return (
                                <tr key={log._id} className="bg-slate-50/50 text-xs">
                                  <td className="px-6 py-3 pl-12 text-slate-500" colSpan={2}>
                                    {new Date(log.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {' '}
                                    <span className="font-semibold text-slate-700">
                                      {isRestock ? 'Restocked (Main Store)' : `Issued to ${log.department}`}
                                    </span>
                                    {log.notes && <span className="text-[10px] text-slate-400 italic ml-2">({log.notes})</span>}
                                  </td>
                                  <td className="px-6 py-3 text-center text-slate-500">
                                    {isRestock ? `+${log.restockQuantity}` : '-'}
                                  </td>
                                  <td className="px-6 py-3 text-center text-slate-500">
                                    {!isRestock ? `-${log.issuedQuantity}` : '-'}
                                  </td>
                                  <td className="px-6 py-3 text-center text-slate-500">
                                    {!isRestock && isSettled ? `+${log.returnedQuantity}` : '-'}
                                  </td>
                                  <td className="px-6 py-3 pr-6 text-right">
                                    {isRestock ? (
                                      <span className="text-[10px] font-bold text-emerald-600">Completed</span>
                                    ) : isSettled ? (
                                      <span className="text-[10px] font-bold text-slate-500">Settled (Used: {log.usageQuantity})</span>
                                    ) : (
                                      <div className="flex items-center justify-end gap-2">
                                        <input type="number" step="any" placeholder="Ret Qty" value={settleQty[log._id] || ''} onChange={(e) => setSettleQty({ ...settleQty, [log._id]: e.target.value })} className="w-20 bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-800 outline-none focus:border-[#0F172A] text-center font-bold" />
                                        <button onClick={() => handleSettleSubmit(log._id)} className="bg-[#0F172A] text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider hover:bg-slate-800 transition-colors">Settle</button>
                                      </div>
                                    )}
                                  </td>
                                </tr>
                              );
                            })}
                          </React.Fragment>
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
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md flex flex-col overflow-hidden relative">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">{selectedInventoryItem ? 'Edit Asset' : 'New Supply'}</h3>
              <button onClick={() => { setShowInventoryForm(false); setSelectedInventoryItem(null); }} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <form onSubmit={handleInventorySubmit} className="space-y-4">
                <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-600">Asset Name</label><input value={inventoryForm.itemName} onChange={(e) => setInventoryForm({ ...inventoryForm, itemName: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-all" required placeholder="e.g. Basmathi Rice" /></div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-600">Current Stock</label><input type="number" step="any" min="0" value={inventoryForm.quantity} onChange={(e) => setInventoryForm({ ...inventoryForm, quantity: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-all" required /></div>
                  <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-600">Safety Min.</label><input type="number" step="any" min="0" value={inventoryForm.thresholdLevel} onChange={(e) => setInventoryForm({ ...inventoryForm, thresholdLevel: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-all" required /></div>
                </div>
                <div className="space-y-1.5"><label className="text-xs font-semibold text-slate-600">Unit (kg, pcs)</label><input value={inventoryForm.unit} onChange={(e) => setInventoryForm({ ...inventoryForm, unit: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-all" placeholder="pcs" /></div>
                <div className="pt-4">
                  <button type="submit" disabled={savingInventory} className="w-full rounded-xl bg-[#0F172A] px-6 py-3 text-white font-bold text-sm hover:bg-slate-800 disabled:opacity-50 transition-all shadow-md">{savingInventory ? 'Saving...' : 'Save Asset'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Issue Modal */}
      {showIssueModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4 animate-in fade-in duration-300">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-md flex flex-col overflow-hidden relative">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xl font-bold text-slate-800">Issue Stock</h3>
              <button onClick={() => setShowIssueModal(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6">
              <form onSubmit={handleIssueSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-600">Asset</label>
                  <select value={issueForm.itemId} onChange={(e) => setIssueForm({ ...issueForm, itemId: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-all" required>
                    <option value="" disabled>Choose Item...</option>
                    {inventoryItems.map(item => (<option key={item._id} value={item._id}>{item.itemName} ({item.quantity} {item.unit})</option>))}
                  </select>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Department</label>
                    <select value={issueForm.department} onChange={(e) => setIssueForm({ ...issueForm, department: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-all" required>
                      <option value="Restaurant Kitchen">Restaurant Kitchen</option>
                      <option value="Wedding Kitchen">Wedding Kitchen</option>
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-600">Quantity</label>
                    <input type="number" step="any" min="0" value={issueForm.quantity} onChange={(e) => setIssueForm({ ...issueForm, quantity: e.target.value })} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 outline-none focus:border-[#0F172A] focus:ring-1 focus:ring-[#0F172A] transition-all" required />
                  </div>
                </div>
                <div className="pt-4">
                  <button type="submit" disabled={savingIssue} className="w-full bg-[#0F172A] text-white py-3 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all shadow-md disabled:opacity-50">{savingIssue ? 'Dispatching...' : 'Dispatch Resources'}</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
