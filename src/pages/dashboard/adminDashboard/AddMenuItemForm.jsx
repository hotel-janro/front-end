import React, { useState, useEffect } from 'react';
import {
  Camera,
  ChevronRight,
  DollarSign,
  Clock,
  Tag,
  Info,
  CheckCircle2,
  X,
  UploadCloud,
  Loader2,
  UtensilsCrossed,
  Layers,
  Sparkles
} from 'lucide-react';
import { apiFetch, API_HOST, getImageUrl } from '../../../api.js';
import { ImageWithFallback } from '../../../components/common/ImageWithFallback.jsx';
import { toast } from 'sonner';

export default function AddMenuItemForm({ initialItem, onSaved, onCancel }) {
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    category: 'Main Course',
    isAvailable: true,
    prepTime: '15',
    hasPortions: false,
    portions: [
      { portionType: 'Full', price: '' },
      { portionType: 'Half', price: '' }
    ]
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  // Sync with initial data when editing
  useEffect(() => {
    if (initialItem) {
      setFormData({
        name: initialItem.name || '',
        description: initialItem.description || '',
        price: initialItem.price || '',
        category: initialItem.category || 'Main Course',
        isAvailable: initialItem.isAvailable !== undefined ? initialItem.isAvailable : true,
        prepTime: initialItem.prepTime || '15',
        hasPortions: initialItem.hasPortions || false,
        portions: initialItem.hasPortions ? initialItem.portions : [
          { portionType: 'Full', price: '' },
          { portionType: 'Half', price: '' }
        ]
      });
      if (initialItem.image) {
        setImagePreview(getImageUrl(initialItem.image));
      }
    } else {
      setFormData({
        name: '',
        description: '',
        price: '',
        category: 'Main Course',
        isAvailable: true,
        prepTime: '15',
        hasPortions: false,
        portions: [
          { portionType: 'Full', price: '' },
          { portionType: 'Half', price: '' }
        ]
      });
      setImagePreview(null);
      setImageFile(null);
    }
    setErrors({});
  }, [initialItem]);

  // Update form fields
  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  // Handle image selection
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      if (errors.image) setErrors(prev => ({ ...prev, image: null }));
    }
  };

  // Check for required fields
  const validate = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Dish name is required';

    if (formData.hasPortions) {
      const fullPortion = formData.portions.find(p => p.portionType === 'Full');
      const halfPortion = formData.portions.find(p => p.portionType === 'Half');
      if (!fullPortion?.price || Number(fullPortion.price) <= 0) newErrors.fullPrice = 'Full price required';
      if (!halfPortion?.price || Number(halfPortion.price) <= 0) newErrors.halfPrice = 'Half price required';
    } else {
      if (!formData.price || Number(formData.price) <= 0) newErrors.price = 'Valid price required';
    }

    if (!imagePreview && !initialItem) newErrors.image = 'Image is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submit to backend
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) {
      toast.error('Please refine the mandatory fields');
      return;
    }

    setLoading(true);
    try {
      const data = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'portions') {
          data.append(key, JSON.stringify(formData[key]));
        } else {
          data.append(key, formData[key]);
        }
      });
      if (imageFile) data.append('image', imageFile);

      const url = initialItem ? `/menu/${initialItem._id}` : '/menu';
      const method = initialItem ? 'PUT' : 'POST';

      await apiFetch(url, { method, body: data });
      toast.success('Culinary masterpiece saved!');
      onSaved();
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Helper to update specific portion price
  const updatePortionPrice = (type, price) => {
    setFormData(prev => ({
      ...prev,
      portions: prev.portions.map(p => p.portionType === type ? { ...p, price } : p)
    }));
    if (errors.fullPrice || errors.halfPrice) {
      setErrors(prev => ({ ...prev, fullPrice: null, halfPrice: null }));
    }
  };

  return (
    <div className="bg-[#0F172A] rounded-[2.5rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/10 max-w-6xl w-full mx-auto animate-in zoom-in-95 duration-500">
      {/* Header Section */}
      <div className="px-8 py-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#D4AF37] flex items-center justify-center shadow-lg shadow-[#D4AF37]/20">
            <UtensilsCrossed className="w-6 h-6 text-[#0F172A]" />
          </div>
          <div>
            <h2 className="text-2xl text-white font-normal" style={{ fontFamily: "DM Serif Display, serif" }}>
              {initialItem ? 'Refine' : 'Create'} <span className="italic text-[#D4AF37]">Masterpiece</span>
            </h2>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-[0.3em] mt-0.5">Culinary Control Center</p>
          </div>
        </div>
        <button type="button" onClick={onCancel} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-rose-500/20 transition-all">
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="p-8">
        <div className="grid lg:grid-cols-3 gap-8">

          {/* Form Content - Name, Category, Prep Time */}
          <div className="space-y-6">
            <div className="p-6 bg-white/[0.03] rounded-[2rem] border border-white/5 space-y-4">
              <h3 className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> Basic Identity
              </h3>

              <div className="space-y-1.5">
                <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest ml-1">Dish Name</label>
                <input
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  placeholder="Lobster Thermidor..."
                  className={`w-full bg-white/5 border ${errors.name ? 'border-rose-500' : 'border-white/10'} rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#D4AF37] transition-all`}
                />
                {errors.name && <p className="text-[9px] text-rose-500 ml-1">{errors.name}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest ml-1">Cuisine Group</label>
                <select
                  value={formData.category}
                  onChange={e => handleInputChange('category', e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#D4AF37]"
                >
                  {['Main Course', 'Bites', 'Desserts', 'Beverages'].map(c => <option key={c} value={c} className="text-black">{c}</option>)}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest ml-1">Prep Time (Min)</label>
                <div className="relative">
                  <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                  <input
                    type="number"
                    value={formData.prepTime}
                    onChange={e => handleInputChange('prepTime', e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-xs text-white outline-none focus:border-[#D4AF37]"
                  />
                </div>
              </div>
            </div>

            {/* Visibility Settings */}
            <div className="p-6 bg-white/[0.03] rounded-[2rem] border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-white uppercase tracking-widest">Visibility</p>
                <p className="text-[8px] text-slate-500 font-bold uppercase mt-1">Live in Menu</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={formData.isAvailable} onChange={e => handleInputChange('isAvailable', e.target.checked)} className="sr-only peer" />
                <div className="w-10 h-5 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#D4AF37] peer-checked:after:bg-white"></div>
              </label>
            </div>
          </div>

          {/* Pricing and Portion Logic */}
          <div className="space-y-6">
            <div className="p-6 bg-white/[0.03] rounded-[2rem] border border-white/5 space-y-5">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest flex items-center gap-2">
                  <DollarSign className="w-3 h-3" /> Cost Structure
                </h3>
              </div>
              <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5 mb-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${formData.hasPortions ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-white/5 text-slate-500'}`}>
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Multi-Portions</h3>
                    <p className="text-[7px] text-slate-500 font-bold uppercase mt-0.5">Enable Full/Half pricing</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={formData.hasPortions} onChange={e => handleInputChange('hasPortions', e.target.checked)} className="sr-only peer" />
                  <div className="w-12 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37] peer-checked:after:bg-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] peer-checked:shadow-[0_0_15px_rgba(212,175,55,0.3)]"></div>
                </label>
              </div>

              {formData.hasPortions ? (
                <div className="grid grid-cols-2 gap-4 animate-in slide-in-from-top-2 duration-300">
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest ml-1">Full Portion</label>
                    <input
                      type="number"
                      value={formData.portions.find(p => p.portionType === 'Full')?.price || ''}
                      onChange={e => updatePortionPrice('Full', e.target.value)}
                      className={`w-full bg-white/5 border ${errors.fullPrice ? 'border-rose-500' : 'border-white/10'} rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#D4AF37] font-black`}
                      placeholder="Rs"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest ml-1">Half Portion</label>
                    <input
                      type="number"
                      value={formData.portions.find(p => p.portionType === 'Half')?.price || ''}
                      onChange={e => updatePortionPrice('Half', e.target.value)}
                      className={`w-full bg-white/5 border ${errors.halfPrice ? 'border-rose-500' : 'border-white/10'} rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#D4AF37] font-black`}
                      placeholder="Rs"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest ml-1">Standard Price</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={e => handleInputChange('price', e.target.value)}
                    className={`w-full bg-white/5 border ${errors.price ? 'border-rose-500' : 'border-white/10'} rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#D4AF37] font-black`}
                    placeholder="Rs 0.00"
                  />
                  {errors.price && <p className="text-[9px] text-rose-500 ml-1">{errors.price}</p>}
                </div>
              )}
            </div>

            {/* Description Textarea */}
            <div className="p-6 bg-white/[0.03] rounded-[2rem] border border-white/5 space-y-4 flex-1">
              <h3 className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest flex items-center gap-2">
                <Layers className="w-3 h-3" /> The Story
              </h3>
              <textarea
                rows="4"
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
                placeholder="Textures, aromas, heritage..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-300 outline-none focus:border-[#D4AF37] resize-none h-[110px]"
              />
            </div>
          </div>

          {/* Image Upload and Preview */}
          <div className="space-y-6">
            <div className={`p-4 bg-white/[0.03] rounded-[2.5rem] border ${errors.image ? 'border-rose-500' : 'border-white/5'} relative group h-full flex flex-col`}>
              <div className="relative aspect-square lg:aspect-auto lg:flex-1 rounded-[2rem] overflow-hidden bg-white/5 border border-white/10">
                {imagePreview ? (
                  <>
                    <ImageWithFallback src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                    <div className="absolute inset-0 bg-[#0F172A]/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-3">
                      <label className="cursor-pointer bg-[#D4AF37] text-[#0F172A] px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest shadow-xl flex items-center gap-2">
                        <Camera className="w-3.5 h-3.5" /> Replace
                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                      </label>
                    </div>
                  </>
                ) : (
                  <label className="w-full h-full flex flex-col items-center justify-center gap-3 cursor-pointer group/upload">
                    <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-slate-500 group-hover/upload:text-[#D4AF37] transition-colors">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Upload Image</p>
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                )}
              </div>

              <div className="mt-4 px-2">
                <div className="flex justify-between items-start gap-4">
                  <h4 className="text-lg text-white font-normal truncate" style={{ fontFamily: "DM Serif Display, serif" }}>{formData.name || 'New Dish'}</h4>
                  <p className="text-md font-black text-[#D4AF37] whitespace-nowrap">
                    {formData.hasPortions ? 'Varied' : `Rs ${Number(formData.price || 0).toLocaleString()}`}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-10 flex items-center justify-end gap-6 pt-6 border-t border-white/5">
          <button
            type="button"
            onClick={onCancel}
            className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] hover:text-white transition-colors"
          >
            Abandon
          </button>
          <button
            type="submit"
            disabled={loading}
            className="bg-[#D4AF37] text-[#0F172A] px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-[0.3em] hover:scale-105 active:scale-95 transition-all flex items-center gap-3 shadow-xl disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {initialItem ? 'Refine Creation' : 'Unveil Masterpiece'}
          </button>
        </div>
      </form>
    </div>
  );
}
