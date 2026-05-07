import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch, API_HOST } from '../../../api.js';
import { 
  ShoppingCart, 
  Search, 
  Clock, 
  DollarSign, 
  TrendingUp, 
  Plus,
  Trash2,
  CheckCircle,
  XCircle,
  CreditCard
} from 'lucide-react';

export function AdminPOS() {
  const [menuItems, setMenuItems] = useState([]);
  const [orders, setOrders] = useState([]);
  const [orderTrends, setOrderTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [posForm, setPosForm] = useState({
    orderType: 'Dine-in',
    tableNumber: '',
    roomNumber: '',
    deliveryAddress: '',
    contactNumber: '',
    discount: '0',
  });
  const [cart, setCart] = useState([]);
  const [selectedPosMenuItemId, setSelectedPosMenuItemId] = useState('');
  const [selectedPosQuantity, setSelectedPosQuantity] = useState('1');
  const [savingPosOrder, setSavingPosOrder] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  const refreshData = async () => {
    setLoading(true);
    await Promise.allSettled([loadMenu(), loadOrders(), loadOrderTrends()]);
    setLoading(false);
  };

  const loadMenu = async () => {
    const data = await apiFetch('/menu?populate=inventoryItem');
    setMenuItems(Array.isArray(data) ? data : []);
  };

  const loadOrders = async () => {
    const data = await apiFetch('/orders');
    setOrders(Array.isArray(data) ? data : []);
  };

  const loadOrderTrends = async () => {
    try {
      const data = await apiFetch('/orders/trends');
      setOrderTrends(Array.isArray(data) ? data : []);
    } catch {
      setOrderTrends([]);
    }
  };

  const formatCurrency = (value) => `Rs ${Number(value || 0).toFixed(2)}`;

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const discountValue = Number(posForm.discount || 0);
  const taxValue = subtotal * 0.1;
  const grandTotal = Math.max(subtotal + taxValue - discountValue, 0);

  const addPosItem = () => {
    const menuItem = menuItems.find((item) => item._id === selectedPosMenuItemId);
    const quantity = Number(selectedPosQuantity || 1);
    if (!menuItem || quantity < 1) return;

    if (menuItem.inventoryItem && menuItem.inventoryItem.quantity < quantity) {
      if (!window.confirm(`Low stock: Only ${menuItem.inventoryItem.quantity} left. Continue?`)) return;
    }

    setCart((prev) => {
      const existing = prev.find((i) => i.menuItemId === menuItem._id);
      if (existing) {
        return prev.map((i) => i.menuItemId === menuItem._id ? { ...i, quantity: i.quantity + quantity } : i);
      }
      return [...prev, { menuItemId: menuItem._id, name: menuItem.name, price: menuItem.price, quantity }];
    });
    setSelectedPosMenuItemId('');
    setSelectedPosQuantity('1');
  };

  const handlePlaceOrder = async () => {
    if (cart.length === 0) return;
    const payload = {
      orderType: posForm.orderType,
      items: cart.map(i => ({ menuItemId: i.menuItemId, quantity: i.quantity })),
      discount: discountValue,
      ...(posForm.orderType === 'Dine-in' && { tableNumber: posForm.tableNumber }),
      ...(posForm.orderType === 'Room' && { roomNumber: posForm.roomNumber }),
      ...(posForm.orderType === 'Delivery' && { deliveryAddress: posForm.deliveryAddress, contactNumber: posForm.contactNumber }),
    };

    try {
      setSavingPosOrder(true);
      await apiFetch('/orders', { method: 'POST', body: JSON.stringify(payload) });
      alert('Order placed successfully!');
      setCart([]);
      setPosForm({ ...posForm, discount: '0', tableNumber: '', roomNumber: '', deliveryAddress: '', contactNumber: '' });
      await refreshData();
    } catch (e) {
      alert(e.message);
    } finally {
      setSavingPosOrder(false);
    }
  };

  const updateOrderStatus = async (orderId, orderStatus) => {
    await apiFetch(`/orders/${orderId}`, { method: 'PUT', body: JSON.stringify({ orderStatus }) });
    await loadOrders();
  };

  return (
    <div className="space-y-6">
      {/* Stats Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600"><ShoppingCart className="w-6 h-6" /></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase">Total Orders</p><h3 className="text-2xl font-black">{orders.length}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600"><Clock className="w-6 h-6" /></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase">Active</p><h3 className="text-2xl font-black">{orders.filter(o => o.orderStatus === 'Pending' || o.orderStatus === 'Preparing').length}</h3></div>
        </div>
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600"><DollarSign className="w-6 h-6" /></div>
          <div><p className="text-xs font-bold text-slate-400 uppercase">Revenue</p><h3 className="text-2xl font-black">{formatCurrency(orders.reduce((s, o) => s + (o.totalAmount || 0), 0))}</h3></div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
        {/* POS Panel */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 space-y-4">
          <h3 className="text-xl font-bold">POS Bill Builder</h3>
          <div className="space-y-3">
            <label className="text-sm font-medium">Order Type</label>
            <select value={posForm.orderType} onChange={e => setPosForm({...posForm, orderType: e.target.value})} className="w-full rounded-lg border p-2">
              <option value="Dine-in">Dine-in</option><option value="Room">Room</option><option value="Delivery">Delivery</option>
            </select>
          </div>
          
          <div className="space-y-3 pt-4 border-t">
            <label className="text-sm font-medium">Add Item</label>
            <select value={selectedPosMenuItemId} onChange={e => setSelectedPosMenuItemId(e.target.value)} className="w-full rounded-lg border p-2">
              <option value="">Select an item...</option>
              {menuItems.map(item => (
                <option key={item._id} value={item._id} disabled={!item.isAvailable}>
                  {item.name} ({formatCurrency(item.price)}) {item.inventoryItem ? `- ${item.inventoryItem.quantity} left` : ''}
                </option>
              ))}
            </select>
            <div className="flex gap-2">
              <input type="number" min="1" value={selectedPosQuantity} onChange={e => setSelectedPosQuantity(e.target.value)} className="w-20 rounded-lg border p-2" />
              <button onClick={addPosItem} className="flex-1 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700">Add to Cart</button>
            </div>
          </div>

          <div className="pt-4 border-t min-h-[200px]">
            {cart.length === 0 ? <p className="text-center text-slate-400 py-10">Cart is empty</p> : (
              <div className="space-y-3">
                {cart.map(item => (
                  <div key={item.menuItemId} className="flex justify-between items-center bg-slate-50 p-3 rounded-xl">
                    <div><p className="font-bold">{item.name}</p><p className="text-xs text-slate-500">{item.quantity} x {formatCurrency(item.price)}</p></div>
                    <button onClick={() => setCart(c => c.filter(i => i.menuItemId !== item.menuItemId))} className="text-rose-500"><Trash2 className="w-4 h-4"/></button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t space-y-2">
            <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between text-sm"><span>Tax (10%)</span><span>{formatCurrency(taxValue)}</span></div>
            <div className="flex justify-between font-black text-lg pt-2 border-t"><span>Total</span><span>{formatCurrency(grandTotal)}</span></div>
            <button onClick={handlePlaceOrder} disabled={cart.length === 0 || savingPosOrder} className="w-full bg-[#0F172A] text-white py-3 rounded-xl font-bold mt-4 shadow-lg">
              {savingPosOrder ? 'Processing...' : 'Complete Order'}
            </button>
          </div>
        </div>

        {/* Live Orders Panel */}
        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
          <h3 className="text-xl font-bold mb-6">Live Orders</h3>
          {loading ? <p>Loading...</p> : (
            <div className="space-y-4">
              {orders.map(order => (
                <div key={order._id} className="p-4 rounded-2xl border border-slate-100 hover:border-blue-100 transition-colors bg-slate-50/30">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-bold text-slate-900">{order.orderType} Order <span className="text-xs font-normal text-slate-400 ml-2">#{order._id.slice(-5)}</span></p>
                      <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleString()}</p>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {order.items.map((i,idx) => <span key={idx} className="bg-white px-2 py-1 rounded-md text-xs border border-slate-100">{i.quantity}x {i.name}</span>)}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-black text-slate-900">{formatCurrency(order.totalAmount)}</p>
                      <select value={order.orderStatus} onChange={e => updateOrderStatus(order._id, e.target.value)} className="mt-2 rounded-lg border text-xs p-1">
                        {['Pending', 'Preparing', 'Completed', 'Cancelled'].map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}