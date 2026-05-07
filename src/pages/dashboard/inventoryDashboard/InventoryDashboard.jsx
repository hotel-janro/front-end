import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../../api.js';

const emptyInventoryForm = {
  itemName: '',
  quantity: '',
  thresholdLevel: '10',
  unit: 'pcs',
};

export default function InventoryDashboard() {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [inventoryLoading, setInventoryLoading] = useState(true);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState(null);
  const [inventoryForm, setInventoryForm] = useState(emptyInventoryForm);
  const [savingInventory, setSavingInventory] = useState(false);

  useEffect(() => {
    loadInventory();
  }, []);

  useEffect(() => {
    if (selectedInventoryItem) {
      setInventoryForm({
        itemName: selectedInventoryItem.itemName || '',
        quantity: selectedInventoryItem.quantity?.toString?.() || '',
        thresholdLevel: selectedInventoryItem.thresholdLevel?.toString?.() || '10',
        unit: selectedInventoryItem.unit || 'pcs',
      });
    } else {
      setInventoryForm(emptyInventoryForm);
    }
  }, [selectedInventoryItem]);

  const loadInventory = async () => {
    setInventoryLoading(true);
    try {
      const [inventoryData, lowStockData] = await Promise.all([
        apiFetch('/inventory'),
        apiFetch('/inventory/low-stock'),
      ]);
      setInventoryItems(Array.isArray(inventoryData) ? inventoryData : []);
      setLowStockItems(Array.isArray(lowStockData) ? lowStockData : []);
    } finally {
      setInventoryLoading(false);
    }
  };

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
      setInventoryForm(emptyInventoryForm);
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

  const stockStatus = (item) => {
    if (item.quantity <= item.thresholdLevel) return 'Low stock';
    if (item.quantity <= item.thresholdLevel * 2) return 'Watch';
    return 'Healthy';
  };

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#111827] to-[#1F2937] text-white p-6 md:p-8 shadow-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] mb-2">Inventory Management</p>
        <h2 className="text-3xl md:text-4xl font-semibold">Stock Control & Alerts</h2>
        <p className="text-slate-300 mt-3 max-w-3xl">
          Track supply levels, manage thresholds, and monitor low stock alerts for the entire hotel.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <div className="space-y-6">
          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
            <h3 className="text-xl font-semibold text-slate-900 mb-1">
              {selectedInventoryItem ? 'Edit Inventory Item' : 'Add Inventory Item'}
            </h3>
            <p className="text-sm text-slate-500 mb-4">Track stock, thresholds, and units for daily operations.</p>
            <form onSubmit={handleInventorySubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium text-slate-600">Item Name</label>
                <input
                  value={inventoryForm.itemName}
                  onChange={(event) => setInventoryForm({ ...inventoryForm, itemName: event.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-slate-600">Quantity</label>
                  <input
                    type="number"
                    min="0"
                    value={inventoryForm.quantity}
                    onChange={(event) => setInventoryForm({ ...inventoryForm, quantity: event.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2"
                    required
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-slate-600">Threshold</label>
                  <input
                    type="number"
                    min="0"
                    value={inventoryForm.thresholdLevel}
                    onChange={(event) => setInventoryForm({ ...inventoryForm, thresholdLevel: event.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium text-slate-600">Unit</label>
                <input
                  value={inventoryForm.unit}
                  onChange={(event) => setInventoryForm({ ...inventoryForm, unit: event.target.value })}
                  className="mt-1 w-full rounded-lg border border-slate-200 px-4 py-2"
                  placeholder="kg, pcs, litres"
                />
              </div>
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={savingInventory}
                  className="flex-1 rounded-lg bg-[#0F172A] px-4 py-3 text-white font-medium disabled:opacity-60"
                >
                  {savingInventory ? 'Saving...' : selectedInventoryItem ? 'Update Item' : 'Add Item'}
                </button>
                {selectedInventoryItem && (
                  <button
                    type="button"
                    onClick={() => setSelectedInventoryItem(null)}
                    className="rounded-lg border border-slate-200 px-4 py-3 text-slate-600 font-medium"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
            <h3 className="text-xl font-semibold text-slate-900 mb-1">Low Stock Alerts</h3>
            <p className="text-sm text-slate-500 mb-4">Items at or below threshold need attention.</p>
            {lowStockItems.length === 0 ? (
              <p className="text-slate-500">No low stock items right now.</p>
            ) : (
              <div className="space-y-3">
                {lowStockItems.map((item) => (
                  <div key={item._id} className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-medium text-slate-900">{item.itemName}</p>
                        <p className="text-xs text-slate-600">Threshold {item.thresholdLevel}</p>
                      </div>
                      <span className="text-sm font-semibold text-amber-700">{item.quantity} {item.unit}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-semibold text-slate-900">Inventory Stock</h3>
              <p className="text-sm text-slate-500">Maintain accurate counts for food and beverage supplies.</p>
            </div>
            <div className="text-sm text-slate-500">
              {inventoryItems.length} item{inventoryItems.length === 1 ? '' : 's'} total
            </div>
          </div>

          {inventoryLoading ? (
            <p className="text-slate-500">Loading inventory...</p>
          ) : inventoryItems.length === 0 ? (
            <p className="text-slate-500">No inventory items yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 text-left text-slate-500">
                    <th className="py-3 pr-4">Item</th>
                    <th className="py-3 pr-4">Qty</th>
                    <th className="py-3 pr-4">Threshold</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3 pr-4">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {inventoryItems.map((item) => (
                    <tr key={item._id} className="border-b border-slate-100">
                      <td className="py-3 pr-4 font-medium text-slate-900">{item.itemName}</td>
                      <td className="py-3 pr-4 text-slate-600">{item.quantity} {item.unit}</td>
                      <td className="py-3 pr-4 text-slate-600">{item.thresholdLevel} {item.unit}</td>
                      <td className="py-3 pr-4">
                        <span className={`rounded-full px-3 py-1 text-xs font-medium ${
                          stockStatus(item) === 'Healthy' ? 'bg-emerald-50 text-emerald-700' :
                          stockStatus(item) === 'Watch' ? 'bg-blue-50 text-blue-700' :
                          'bg-amber-50 text-amber-700'
                        }`}>
                          {stockStatus(item)}
                        </span>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => setSelectedInventoryItem(item)}
                            className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700"
                          >
                            Edit
                          </button>
                          <button
                            onClick={() => deleteInventoryItem(item._id)}
                            className="rounded-lg border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-600"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
