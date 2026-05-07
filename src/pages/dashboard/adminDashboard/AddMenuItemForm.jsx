import React, { useEffect, useState } from 'react';
import { apiFetch, API_HOST } from '../../../api.js';

const emptyForm = {
  name: '',
  category: '',
  price: '',
  description: '',
  isAvailable: true,
  inventoryItem: '',
};

export default function AddMenuItemForm({ initialItem, onSaved, onCancel }) {
  const [formData, setFormData] = useState(emptyForm);
  const [inventoryList, setInventoryList] = useState([]);
  const [saving, setSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [selectedSample, setSelectedSample] = useState('');
  const [error, setError] = useState('');

  const sampleImages = [
    '/images/nasi.svg',
    '/images/beverage.svg',
    '/images/dessert.svg',
  ];

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      const data = await apiFetch('/inventory');
      setInventoryList(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load inventory', err);
    }
  };

  useEffect(() => {
    if (initialItem) {
      setFormData({
        name: initialItem.name || '',
        category: initialItem.category || '',
        price: initialItem.price?.toString?.() || '',
        description: initialItem.description || '',
        isAvailable: initialItem.isAvailable ?? true,
        inventoryItem: initialItem.inventoryItem || '',
        prepTime: initialItem.prepTime?.toString?.() || '15',
      });
      if (initialItem.image) {
        const imageUrl = initialItem.image.includes('uploads') 
          ? `${API_HOST}/${initialItem.image.replace(/\\/g, '/')}` 
          : initialItem.image;
        setPreviewUrl(imageUrl);
        setSelectedSample(initialItem.image);
      }
    } else {
      setFormData(emptyForm);
      setPreviewUrl('');
      setSelectedFile(null);
      setSelectedSample('');
    }
  }, [initialItem]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    setError('');
    const file = e.target.files && e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setSelectedSample('');
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    }
  };

  const handleSelectSample = (src) => {
    setError('');
    setSelectedSample(src);
    setSelectedFile(null);
    setPreviewUrl(src);
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    setSelectedSample('');
    setPreviewUrl('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Require image for new items
    if (!initialItem && !selectedFile && !selectedSample) {
      setError('Please add or select an image for the menu item.');
      return;
    }

    try {
      setSaving(true);

      const commonPayload = {
        name: formData.name,
        category: formData.category,
        price: String(Number(formData.price)),
        description: formData.description || '',
        isAvailable: String(formData.isAvailable),
        inventoryItem: formData.inventoryItem || '',
        prepTime: String(formData.prepTime || '15'),
      };

      const method = initialItem ? 'PUT' : 'POST';
      const endpoint = initialItem ? `/menu/${initialItem._id}` : '/menu';

      // If a file is selected, send multipart/form-data
      if (selectedFile) {
        const fd = new FormData();
        Object.entries(commonPayload).forEach(([key, val]) => fd.append(key, val));
        fd.append('image', selectedFile);
        await apiFetch(endpoint, { method, body: fd });
      } else {
        // No file - send JSON
        const payload = {
          ...formData,
          price: Number(formData.price),
        };
        if (selectedSample) payload.image = selectedSample;
        
        await apiFetch(endpoint, {
          method,
          body: JSON.stringify(payload),
          headers: { 'Content-Type': 'application/json' },
        });
      }

      alert(initialItem ? 'Menu item updated successfully.' : 'Menu item added successfully.');
      setFormData(emptyForm);
      setSelectedFile(null);
      setPreviewUrl('');
      setSelectedSample('');
      if (onSaved) onSaved();
    } catch (error) {
      console.error('Error connecting to backend:', error);
      setError(error.message || 'Could not save the menu item.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow max-h-[85vh] overflow-y-auto">
      <h3 className="text-xl font-bold mb-4 text-slate-900">
        {initialItem ? 'Edit Menu Item' : 'Add New Menu Item'}
      </h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-600">Item Name</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required
              className="w-full border border-slate-200 p-2.5 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              placeholder="e.g., Sprite"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-slate-600">Category</label>
            <select 
              name="category" 
              value={formData.category} 
              onChange={handleChange} 
              required
              className="w-full mt-1 p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
            >
              <option value="">Select Category</option>
              <option value="Main Course">Main Course</option>
              <option value="Appetizers">Appetizers</option>
              <option value="Desserts">Desserts</option>
              <option value="Beverages">Beverages</option>
              <option value="Breakfast">Breakfast</option>
              <option value="Snacks">Snacks</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-600">Price (Rs)</label>
            <input 
              type="number" 
              name="price" 
              value={formData.price} 
              onChange={handleChange} 
              required 
              min="1"
              className="w-full border border-slate-200 p-2.5 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              placeholder="200"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium text-slate-600">Link to Inventory Stock</label>
            <select 
              name="inventoryItem" 
              value={formData.inventoryItem} 
              onChange={handleChange}
              className="w-full mt-1 p-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
            >
              <option value="">Not linked (Infinite stock)</option>
              {inventoryList.map(inv => (
                <option key={inv._id} value={inv._id}>
                  {inv.itemName} ({inv.quantity} {inv.unit} available)
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-sm font-medium text-slate-600">Prep Time (min)</label>
            <input 
              type="number" 
              name="prepTime" 
              value={formData.prepTime || '15'} 
              onChange={handleChange} 
              required 
              min="1"
              className="w-full border border-slate-200 p-2.5 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
              placeholder="15"
            />
          </div>
        </div>
        <p className="text-[10px] text-slate-400 mt-[-8px]">If linked, stock will auto-deduct upon order.</p>

        <div>
          <label className="text-sm font-medium text-slate-600">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="2"
            className="w-full border border-slate-200 p-2.5 rounded-lg mt-1 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
            placeholder="Optional item description"
          />
        </div>

        <label className="flex items-center gap-3 text-sm text-slate-600 cursor-pointer hover:text-slate-900 transition-colors">
          <input
            type="checkbox"
            name="isAvailable"
            checked={formData.isAvailable}
            onChange={handleChange}
            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
          />
          Available for ordering
        </label>

        <div className="border-t border-slate-100 pt-4">
          <label className="text-sm font-medium text-slate-600 block mb-2">Image Setup</label>
          <div className="flex flex-wrap gap-4 items-start">
            <div className="flex-1 min-w-[200px]">
              <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                className="text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
            </div>
            <div className="flex gap-2">
              {sampleImages.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => handleSelectSample(s)}
                  className={`border-2 rounded-lg p-0.5 transition-all ${selectedSample === s ? 'border-blue-500 shadow-md' : 'border-slate-100'}`}
                >
                  <img src={s} alt="sample" className="w-12 h-12 object-cover rounded" />
                </button>
              ))}
            </div>
          </div>

          {previewUrl && (
            <div className="mt-4 flex items-center gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <img src={previewUrl} alt="preview" className="w-20 h-16 object-cover rounded-lg shadow-sm" />
              <div className="flex-1">
                <p className="text-xs font-semibold text-slate-900">Image Preview</p>
                <button type="button" onClick={handleRemoveImage} className="text-xs text-rose-600 hover:text-rose-700 font-medium mt-0.5 transition-colors">Remove Image</button>
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-lg text-rose-600 text-sm">
            {error}
          </div>
        )}

        <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
          <button
            type="submit"
            className="flex-1 bg-[#0F172A] text-white p-3 rounded-xl font-semibold hover:bg-slate-800 disabled:opacity-50 transition-all shadow-lg shadow-slate-200"
            disabled={saving}
          >
            {saving ? 'Saving...' : initialItem ? 'Update Menu Item' : 'Create Menu Item'}
          </button>
          {initialItem && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-slate-100 text-slate-600 p-3 rounded-xl font-semibold hover:bg-slate-200 transition-all"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}