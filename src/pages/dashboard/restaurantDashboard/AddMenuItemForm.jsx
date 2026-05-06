import React, { useEffect, useState } from 'react';
import { apiFetch, API_HOST } from '../../../api.js';

const emptyForm = {
  name: '',
  category: '',
  price: '',
  description: '',
  isAvailable: true,
};

export default function AddMenuItemForm({ initialItem, onSaved, onCancel }) {
  const [formData, setFormData] = useState(emptyForm);
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
    if (initialItem) {
      setFormData({
        name: initialItem.name || '',
        category: initialItem.category || '',
        price: initialItem.price?.toString?.() || '',
        description: initialItem.description || '',
        isAvailable: initialItem.isAvailable ?? true,
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

      // If a file is selected, send multipart/form-data
      if (selectedFile) {
        const fd = new FormData();
        fd.append('name', formData.name);
        fd.append('category', formData.category);
        fd.append('price', String(Number(formData.price)));
        fd.append('description', formData.description || '');
        fd.append('isAvailable', String(formData.isAvailable));
        fd.append('image', selectedFile);

        const method = initialItem ? 'PUT' : 'POST';
        const endpoint = initialItem ? `/menu/${initialItem._id}` : '/menu';

        await apiFetch(endpoint, { method, body: fd });
      } else {
        // No file - send JSON and include image URL if sample selected
        const payload = {
          ...formData,
          price: Number(formData.price),
        };
        if (selectedSample) payload.image = selectedSample;
        const method = initialItem ? 'PUT' : 'POST';
        const endpoint = initialItem ? `/menu/${initialItem._id}` : '/menu';

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
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-xl font-bold mb-4">
        {initialItem ? 'Edit Menu Item' : 'Add New Menu Item'}
      </h3>
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div>
          <label className="text-sm text-slate-500">Item Name</label>
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleChange} 
            required
            className="w-full border p-2 rounded mt-1"
            placeholder="e.g., Sprite"
          />
        </div>

        <div>
          <label className="text-sm text-slate-500">Category</label>
          <select 
            name="category" 
            value={formData.category} 
            onChange={handleChange} 
            required
            className="w-full mt-1 p-2 border rounded-lg focus:outline-none focus:border-[#0F172A]"
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

        <div>
          <label className="text-sm text-slate-500">Price (Rs)</label>
          <input 
            type="number" 
            name="price" 
            value={formData.price} 
            onChange={handleChange} 
            required 
            min="1"
            className="w-full border p-2 rounded mt-1"
            placeholder="200"
          />
        </div>

        <div>
          <label className="text-sm text-slate-500">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="3"
            className="w-full border p-2 rounded mt-1"
            placeholder="Optional item description"
          />
        </div>

        <label className="flex items-center gap-3 text-sm text-slate-600">
          <input
            type="checkbox"
            name="isAvailable"
            checked={formData.isAvailable}
            onChange={handleChange}
            className="h-4 w-4"
          />
          Available for ordering
        </label>

        <div>
          <label className="text-sm text-slate-500">Image</label>
          <div className="flex gap-3 items-center mt-2">
            <input type="file" accept="image/*" onChange={handleFileChange} />
            <div className="flex gap-2">
              {sampleImages.map((s) => (
                <button
                  type="button"
                  key={s}
                  onClick={() => handleSelectSample(s)}
                  className={`border rounded p-1 ${selectedSample === s ? 'ring-2 ring-blue-400' : ''}`}
                >
                  <img src={s} alt="sample" className="w-12 h-12 object-cover" />
                </button>
              ))}
            </div>
          </div>

          {previewUrl && (
            <div className="mt-3 flex items-start gap-3">
              <img src={previewUrl} alt="preview" className="w-28 h-20 object-cover rounded" />
              <div>
                <p className="text-sm text-slate-700">Preview</p>
                <button type="button" onClick={handleRemoveImage} className="text-sm text-red-600 mt-1">Remove</button>
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-red-600">{error}</p>}

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="bg-blue-600 text-white p-2 rounded mt-2 hover:bg-blue-700"
            disabled={saving}
          >
            {saving ? 'Saving...' : 'Save Menu Item'}
          </button>
          {initialItem && (
            <button
              type="button"
              onClick={onCancel}
              className="bg-slate-100 text-slate-700 p-2 rounded mt-2 hover:bg-slate-200"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}