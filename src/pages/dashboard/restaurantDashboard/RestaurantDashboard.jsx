import React, { useEffect, useMemo, useState } from 'react';
import { apiFetch, API_HOST } from '../../../api.js';
import AddMenuItemForm from './AddMenuItemForm';

const emptyInventoryForm = null; // Removedconst orderStatusOptions = ['Pending', 'Preparing', 'Completed', 'Cancelled'];

const emptyPosForm = {
  orderType: 'Dine-in',
  tableNumber: '',
  roomNumber: '',
  deliveryAddress: '',
  contactNumber: '',
  discount: '0',
};

const formatCurrency = (value) => `Rs ${Number(value || 0).toFixed(2)}`;

export default function RestaurantDashboard() {
  const [activeTab, setActiveTab] = useState('menu');
  const [menuItems, setMenuItems] = useState([]);
  const [selectedMenuItem, setSelectedMenuItem] = useState(null);
  const [menuLoading, setMenuLoading] = useState(true);
  const [menuSearch, setMenuSearch] = useState('');
  const [menuCategory, setMenuCategory] = useState('All');

  const [orders, setOrders] = useState([]);
  const [orderTrends, setOrderTrends] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);

  // Inventory state moved to InventoryDashboard
  const [posForm, setPosForm] = useState(emptyPosForm);
  const [cart, setCart] = useState([]);
  const [selectedPosMenuItemId, setSelectedPosMenuItemId] = useState('');
  const [selectedPosQuantity, setSelectedPosQuantity] = useState('1');
  const [placingOrder, setPlacingOrder] = useState(false);

  useEffect(() => {
    refreshData();
  }, []);

  // Moved inventory side effects to InventoryDashboard

  const refreshData = async () => {
    await Promise.allSettled([loadMenu(), loadOrders(), loadOrderTrends()]);
  };

  const loadMenu = async () => {
    setMenuLoading(true);
    try {
      const data = await apiFetch('/menu?limit=100');
      setMenuItems(Array.isArray(data?.items) ? data.items : []);
    } finally {
      setMenuLoading(false);
    }
  };

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const data = await apiFetch('/orders');
      setOrders(Array.isArray(data) ? data : []);
    } finally {
      setOrdersLoading(false);
    }
  };

  const loadOrderTrends = async () => {
    try {
      const data = await apiFetch('/orders/trends');
      setOrderTrends(Array.isArray(data) ? data : []);
    } catch {
      setOrderTrends([]);
    }
  };

  // loadInventory moved

  const visibleMenuItems = useMemo(() => {
    return menuItems.filter((item) => {
      const matchesSearch = !menuSearch || item.name?.toLowerCase().includes(menuSearch.toLowerCase());
      const matchesCategory = menuCategory === 'All' || item.category === menuCategory;
      return matchesSearch && matchesCategory;
    });
  }, [menuItems, menuSearch, menuCategory]);

  const menuCategories = useMemo(() => {
    return ['All', ...new Set(menuItems.map((item) => item.category).filter(Boolean))];
  }, [menuItems]);

  const subtotal = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  }, [cart]);

  const discountValue = Number(posForm.discount || 0);
  const taxValue = subtotal * 0.1;
  const grandTotal = Math.max(subtotal + taxValue - discountValue, 0);

  const resetPosForm = () => {
    setPosForm(emptyPosForm);
    setCart([]);
    setSelectedPosMenuItemId('');
    setSelectedPosQuantity('1');
  };

  const handleMenuSaved = async () => {
    setSelectedMenuItem(null);
    await loadMenu();
  };

  const handleMenuDelete = async (id) => {
    if (!window.confirm('Delete this menu item?')) return;
    await apiFetch(`/menu/${id}`, { method: 'DELETE' });
    await loadMenu();
  };

  const handleMenuToggleAvailability = async (item) => {
    await apiFetch(`/menu/${item._id}`, {
      method: 'PUT',
      body: JSON.stringify({ isAvailable: !item.isAvailable }),
    });
    await loadMenu();
  };

  const addPosItem = () => {
    const menuItem = menuItems.find((item) => item._id === selectedPosMenuItemId);
    const quantity = Number(selectedPosQuantity || 1);

    if (!menuItem) return;
    if (quantity < 1) return;

    setCart((previousCart) => {
      const existingItem = previousCart.find((item) => item.menuItemId === menuItem._id);
      if (existingItem) {
        return previousCart.map((item) =>
          item.menuItemId === menuItem._id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }

      return [
        ...previousCart,
        {
          menuItemId: menuItem._id,
          name: menuItem.name,
          price: menuItem.price,
          quantity,
        },
      ];
    });

    setSelectedPosMenuItemId('');
    setSelectedPosQuantity('1');
  };

  const updateCartQuantity = (menuItemId, quantity) => {
    const parsedQuantity = Number(quantity);
    if (!parsedQuantity || parsedQuantity < 1) {
      setCart((previousCart) => previousCart.filter((item) => item.menuItemId !== menuItemId));
      return;
    }

    setCart((previousCart) =>
      previousCart.map((item) =>
        item.menuItemId === menuItemId ? { ...item, quantity: parsedQuantity } : item
      )
    );
  };

  const placePosOrder = async () => {
    if (cart.length === 0) {
      alert('Add at least one item to the cart.');
      return;
    }

    const payload = {
      orderType: posForm.orderType,
      items: cart.map((item) => ({
        menuItemId: item.menuItemId,
        quantity: item.quantity,
      })),
      discount: discountValue,
    };

    if (posForm.orderType === 'Dine-in') {
      payload.tableNumber = posForm.tableNumber;
    }

    if (posForm.orderType === 'Room') {
      payload.roomNumber = posForm.roomNumber;
    }

    if (posForm.orderType === 'Delivery') {
      payload.deliveryAddress = posForm.deliveryAddress;
      payload.contactNumber = posForm.contactNumber;
    }

    try {
      setPlacingOrder(true);
      await apiFetch('/orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      alert(`Order created successfully. Total: ${formatCurrency(grandTotal)}`);
      resetPosForm();
      await Promise.allSettled([loadOrders(), loadOrderTrends()]);
    } catch (error) {
      alert(error.message || 'Failed to create order.');
    } finally {
      setPlacingOrder(false);
    }
  };

  const updateOrderStatus = async (orderId, orderStatus) => {
    await apiFetch(`/orders/${orderId}`, {
      method: 'PUT',
      body: JSON.stringify({ orderStatus }),
    });
    await loadOrders();
  };

  // Inventory handlers moved

  return (
    <div className="space-y-6">
      <div className="rounded-3xl bg-gradient-to-r from-[#0F172A] via-[#111827] to-[#1F2937] text-white p-6 md:p-8 shadow-xl">
        <p className="text-xs uppercase tracking-[0.3em] text-[#D4AF37] mb-2">Restaurant & POS</p>
        <h2 className="text-3xl md:text-4xl font-semibold">Food Ordering, Billing, and Inventory</h2>
        <p className="text-slate-300 mt-3 max-w-3xl">
          Manage menu items, create POS orders, and keep stock under control from one dashboard.
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        {['menu', 'orders'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`rounded-full px-5 py-2 text-sm font-medium border transition-colors ${
              activeTab === tab
                ? 'bg-[#0F172A] text-white border-[#0F172A]'
                : 'bg-white text-slate-600 border-slate-200 hover:border-[#0F172A]'
            }`}
          >
            {tab === 'menu' && 'Menu Management'}
            {tab === 'orders' && 'Orders & POS'}
          </button>
        ))}
      </div>

      {activeTab === 'menu' && (
        <div className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          <AddMenuItemForm
            initialItem={selectedMenuItem}
            onSaved={handleMenuSaved}
            onCancel={() => setSelectedMenuItem(null)}
          />

          <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-4">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">Menu Items</h3>
                <p className="text-sm text-slate-500">Update prices, availability, or remove items.</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <input
                  type="search"
                  value={menuSearch}
                  onChange={(event) => setMenuSearch(event.target.value)}
                  placeholder="Search menu items"
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
                />
                <select
                  value={menuCategory}
                  onChange={(event) => setMenuCategory(event.target.value)}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-sm"
                >
                  {menuCategories.map((category) => (
                    <option key={category} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {menuLoading ? (
              <p className="text-slate-500">Loading menu items...</p>
            ) : visibleMenuItems.length === 0 ? (
              <p className="text-slate-500">No menu items found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 text-left text-slate-500">
                      <th className="py-3 pr-4">Name</th>
                      <th className="py-3 pr-4">Image</th>
                      <th className="py-3 pr-4">Category</th>
                      <th className="py-3 pr-4">Price</th>
                      <th className="py-3 pr-4">Availability</th>
                      <th className="py-3 pr-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visibleMenuItems.map((item) => (
                      <tr key={item._id} className="border-b border-slate-100">
                        <td className="py-3 pr-4 font-medium text-slate-900">{item.name}</td>
                        <td className="py-3 pr-4">
                          {item.image ? (
                            <img 
                              src={item.image.includes('uploads') 
                                ? `${API_HOST}/${item.image.replace(/\\/g, '/')}` 
                                : item.image} 
                              alt={item.name} 
                              className="w-16 h-10 object-cover rounded" 
                            />
                          ) : (
                            <div className="w-16 h-10 bg-slate-50 rounded flex items-center justify-center text-xs text-slate-400">No image</div>
                          )}
                        </td>
                        <td className="py-3 pr-4 text-slate-600">{item.category}</td>
                        <td className="py-3 pr-4 text-slate-600">{formatCurrency(item.price)}</td>
                        <td className="py-3 pr-4">
                          <span className={`rounded-full px-3 py-1 text-xs font-medium ${item.isAvailable ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                            {item.isAvailable ? 'Available' : 'Disabled'}
                          </span>
                        </td>
                        <td className="py-3 pr-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => setSelectedMenuItem(item)}
                              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700"
                            >
                              Edit
                            </button>
                            <button
                              onClick={() => handleMenuToggleAvailability(item)}
                              className="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700"
                            >
                              {item.isAvailable ? 'Disable' : 'Enable'}
                            </button>
                            <button
                              onClick={() => handleMenuDelete(item._id)}
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
      )}

      {activeTab === 'orders' && (
        <div className="grid gap-6 xl:grid-cols-[420px_minmax(0,1fr)]">
          <div className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100 space-y-4">
              <div>
                <h3 className="text-xl font-semibold text-slate-900">POS Bill Builder</h3>
                <p className="text-sm text-slate-500">Select items, apply tax and discount, then generate the bill.</p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-medium text-slate-600">Order Type</label>
                <select
                  value={posForm.orderType}
                  onChange={(event) => setPosForm({ ...posForm, orderType: event.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2"
                >
                  <option value="Dine-in">Dine-in</option>
                  <option value="Room">Room</option>
                  <option value="Delivery">Delivery</option>
                </select>
              </div>

              {posForm.orderType === 'Dine-in' && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-600">Table Number</label>
                  <input
                    value={posForm.tableNumber}
                    onChange={(event) => setPosForm({ ...posForm, tableNumber: event.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2"
                    placeholder="Table 4"
                  />
                </div>
              )}

              {posForm.orderType === 'Room' && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-600">Room Number</label>
                  <input
                    value={posForm.roomNumber}
                    onChange={(event) => setPosForm({ ...posForm, roomNumber: event.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2"
                    placeholder="Room 205"
                  />
                </div>
              )}

              {posForm.orderType === 'Delivery' && (
                <div className="space-y-3">
                  <label className="text-sm font-medium text-slate-600">Delivery Address</label>
                  <input
                    value={posForm.deliveryAddress}
                    onChange={(event) => setPosForm({ ...posForm, deliveryAddress: event.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2"
                    placeholder="Street, city"
                  />
                  <label className="text-sm font-medium text-slate-600">Contact Number</label>
                  <input
                    value={posForm.contactNumber}
                    onChange={(event) => setPosForm({ ...posForm, contactNumber: event.target.value })}
                    className="w-full rounded-lg border border-slate-200 px-4 py-2"
                    placeholder="0771234567"
                  />
                </div>
              )}

              <div className="space-y-3 rounded-xl bg-slate-50 p-4">
                <label className="text-sm font-medium text-slate-600">Add Menu Item</label>
                <select
                  value={selectedPosMenuItemId}
                  onChange={(event) => setSelectedPosMenuItemId(event.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2"
                >
                  <option value="">Select item</option>
                  {menuItems.filter((item) => item.isAvailable).map((item) => (
                    <option key={item._id} value={item._id}>
                      {item.name} - {formatCurrency(item.price)}
                    </option>
                  ))}
                </select>
                <div className="flex gap-3">
                  <input
                    type="number"
                    min="1"
                    value={selectedPosQuantity}
                    onChange={(event) => setSelectedPosQuantity(event.target.value)}
                    className="w-28 rounded-lg border border-slate-200 px-4 py-2"
                  />
                  <button
                    type="button"
                    onClick={addPosItem}
                    className="flex-1 rounded-lg bg-[#0F172A] px-4 py-2 text-white"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-semibold text-slate-900">Cart</h4>
                {cart.length === 0 ? (
                  <p className="text-sm text-slate-500">Cart is empty.</p>
                ) : (
                  <div className="space-y-3">
                    {cart.map((item) => (
                      <div key={item.menuItemId} className="rounded-xl border border-slate-200 p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-medium text-slate-900">{item.name}</p>
                            <p className="text-xs text-slate-500">{formatCurrency(item.price)} each</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => setCart((previousCart) => previousCart.filter((cartItem) => cartItem.menuItemId !== item.menuItemId))}
                            className="text-xs font-medium text-rose-600"
                          >
                            Remove
                          </button>
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                          <span className="text-xs text-slate-500">Qty</span>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(event) => updateCartQuantity(item.menuItemId, event.target.value)}
                            className="w-24 rounded-lg border border-slate-200 px-3 py-1.5"
                          />
                          <span className="ml-auto font-medium text-slate-900">{formatCurrency(item.price * item.quantity)}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-3 border-t border-slate-100 pt-4">
                <label className="text-sm font-medium text-slate-600">Discount</label>
                <input
                  type="number"
                  min="0"
                  value={posForm.discount}
                  onChange={(event) => setPosForm({ ...posForm, discount: event.target.value })}
                  className="w-full rounded-lg border border-slate-200 px-4 py-2"
                  placeholder="0"
                />
                <div className="space-y-1 text-sm text-slate-600">
                  <div className="flex justify-between"><span>Subtotal</span><span>{formatCurrency(subtotal)}</span></div>
                  <div className="flex justify-between"><span>Tax (10%)</span><span>{formatCurrency(taxValue)}</span></div>
                  <div className="flex justify-between font-semibold text-slate-900"><span>Total</span><span>{formatCurrency(grandTotal)}</span></div>
                </div>
                <button
                  type="button"
                  onClick={placePosOrder}
                  disabled={placingOrder}
                  className="w-full rounded-lg bg-emerald-600 px-4 py-3 text-white font-medium disabled:opacity-60"
                >
                  {placingOrder ? 'Generating Bill...' : 'Generate Bill & Save Order'}
                </button>
                <button
                  type="button"
                  onClick={resetPosForm}
                  className="w-full rounded-lg border border-slate-200 px-4 py-3 text-slate-600 font-medium"
                >
                  Clear Cart
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <h3 className="text-xl font-semibold text-slate-900">Live Orders</h3>
                  <p className="text-sm text-slate-500">Track and update order status in real time.</p>
                </div>
              </div>

              {ordersLoading ? (
                <p className="text-slate-500">Loading orders...</p>
              ) : orders.length === 0 ? (
                <p className="text-slate-500">No orders created yet.</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div key={order._id} className="rounded-2xl border border-slate-200 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{order.orderType} Order</p>
                          <p className="text-xs text-slate-500">{new Date(order.createdAt).toLocaleString()}</p>
                          <p className="text-sm text-slate-600 mt-1">
                            {order.tableNumber && `Table ${order.tableNumber}`}
                            {order.roomNumber && `Room ${order.roomNumber}`}
                            {order.deliveryAddress && order.deliveryAddress}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-semibold text-slate-900">{formatCurrency(order.totalAmount)}</p>
                          <select
                            value={order.orderStatus}
                            onChange={(event) => updateOrderStatus(order._id, event.target.value)}
                            className="mt-2 rounded-lg border border-slate-200 px-3 py-2 text-sm"
                          >
                            {orderStatusOptions.map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </div>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs text-slate-600">
                        {order.items?.map((item) => (
                          <span key={item.menuItemId} className="rounded-full bg-slate-100 px-3 py-1">
                            {item.name} x {item.quantity}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-2xl bg-white p-6 shadow-sm border border-slate-100">
              <h3 className="text-xl font-semibold text-slate-900 mb-1">Usage Trends</h3>
              <p className="text-sm text-slate-500 mb-4">Most ordered items from completed POS and restaurant orders.</p>
              {orderTrends.length === 0 ? (
                <p className="text-slate-500">No trend data yet.</p>
              ) : (
                <div className="space-y-3">
                  {orderTrends.map((trend) => (
                    <div key={trend._id} className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3 text-sm">
                      <span className="font-medium text-slate-900">{trend._id}</span>
                      <span className="text-slate-600">{trend.totalQuantity} sold · {formatCurrency(trend.totalRevenue)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Inventory tab moved to separate dashboard */}
    </div>
  );
}