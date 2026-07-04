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

export default function AddMenuItemForm({ initialItem, existingCategories = [], onSaved, onCancel }) {
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
      { portionType: 'Regular', price: '' }
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
        portions: initialItem.hasPortions && initialItem.portions?.length > 0 ? initialItem.portions : [
          { portionType: 'Regular', price: '' }
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
          { portionType: 'Regular', price: '' }
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
      if (!formData.portions || formData.portions.length === 0) {
        newErrors.portions = 'At least one size is required';
      } else {
        formData.portions.forEach((p, index) => {
          if (!p.portionType?.trim()) newErrors[`portionType_${index}`] = 'Size name required';
          if (!p.price || Number(p.price) <= 0) newErrors[`portionPrice_${index}`] = 'Valid price required';
        });
      }
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

  // Helpers to update portions
  const updatePortion = (index, field, value) => {
    setFormData(prev => {
      const newPortions = [...prev.portions];
      newPortions[index] = { ...newPortions[index], [field]: value };
      return { ...prev, portions: newPortions };
    });
  };

  const addPortion = () => {
    setFormData(prev => ({
      ...prev,
      portions: [...prev.portions, { portionType: '', price: '' }]
    }));
  };

  const removePortion = (index) => {
    setFormData(prev => ({
      ...prev,
      portions: prev.portions.filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="bg-[#0F172A] rounded-[2rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.5)] border border-white/10 max-w-4xl w-full mx-auto animate-in zoom-in-95 duration-500">
      {/* Header Section */}
      <div className="px-6 py-4 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
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

      <form onSubmit={handleSubmit} className="p-6">
        <div className="grid lg:grid-cols-2 gap-5">

          {/* Left Column: Details & Description */}
          <div className="space-y-4 flex flex-col">
            <div className="p-4 bg-white/[0.03] rounded-[1.5rem] border border-white/5 space-y-3">
              <h3 className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest flex items-center gap-2">
                <Sparkles className="w-3 h-3" /> Basic Identity
              </h3>

              <div className="space-y-1.5">
                <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest ml-1">Dish Name</label>
                <input
                  value={formData.name}
                  onChange={e => handleInputChange('name', e.target.value)}
                  placeholder="Lobster Thermidor..."
                  className={`w-full bg-white/5 border ${errors.name ? 'border-rose-500' : 'border-white/10'} rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-[#D4AF37] transition-all`}
                />
                {errors.name && <p className="text-[9px] text-rose-500 ml-1">{errors.name}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest ml-1">Cuisine Group</label>
                <input
                  list="cuisine-categories"
                  value={formData.category}
                  onChange={e => handleInputChange('category', e.target.value)}
                  placeholder="Type or select a category..."
                  className={`w-full bg-white/5 border ${errors.category ? 'border-rose-500' : 'border-white/10'} rounded-xl px-4 py-2 text-xs text-white outline-none focus:border-[#D4AF37] transition-all`}
                />
                <datalist id="cuisine-categories">
                  {Array.from(new Set([
                    'Rice', 'Koththu', 'Noodles', 'Chicken', 'Fish', 'Prawns', 'Cuttle Fish', 
                    'Mutton', 'Pork', 'Omelet', 'Vegetables & Sides', 'Salad', 'Soup', 
                    'Starters', 'Outdoor Party', 'Beverages', 'Desserts', 
                    ...existingCategories
                  ])).map(c => <option key={c} value={c} />)}
                </datalist>
                {errors.category && <p className="text-[9px] text-rose-500 ml-1">{errors.category}</p>}
              </div>

                <div className="space-y-1.5">
                  <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest ml-1">Prep Time (Min)</label>
                  <div className="relative">
                    <Clock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-500" />
                    <input
                      type="number"
                      value={formData.prepTime}
                      onChange={e => handleInputChange('prepTime', e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-2 text-xs text-white outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="p-4 bg-white/[0.03] rounded-[1.5rem] border border-white/5 flex items-center justify-between">
              <div>
                <p className="text-[10px] font-black text-white uppercase tracking-widest">Visibility</p>
                <p className="text-[8px] text-slate-500 font-bold uppercase mt-1">Live in Menu</p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={formData.isAvailable} onChange={e => handleInputChange('isAvailable', e.target.checked)} className="sr-only peer" />
                <div className="w-10 h-5 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-400 after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#D4AF37] peer-checked:after:bg-white"></div>
              </label>
            </div>

            <div className="p-6 bg-white/[0.03] rounded-[2rem] border border-white/5 space-y-4 flex-1">
              <h3 className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest flex items-center gap-2">
                <Layers className="w-3 h-3" /> The Story
              </h3>
              <textarea
                rows="4"
                value={formData.description}
                onChange={e => handleInputChange('description', e.target.value)}
                placeholder="Textures, aromas, heritage..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs text-slate-300 outline-none focus:border-[#D4AF37] resize-none flex-1 min-h-[120px]"
              />
            </div>
          </div>

          {/* Right Column: Image & Pricing */}
            <div className="space-y-4 flex flex-col">
              <div className={`p-3 bg-white/[0.03] rounded-[1.5rem] border ${errors.image ? 'border-rose-500' : 'border-white/5'} relative group h-32 md:h-48 flex-shrink-0 flex flex-col`}>
              <div className="relative w-full h-full rounded-[2rem] overflow-hidden bg-white/5 border border-white/10">
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
            </div>

              <div className="p-4 bg-white/[0.03] rounded-[1.5rem] border border-white/5 space-y-4 flex-1 flex flex-col">
                <div className="flex items-center justify-between">
                  <h3 className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest flex items-center gap-2">
                    <DollarSign className="w-3 h-3" /> Cost Structure
                  </h3>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-2xl border border-white/5 mb-3">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-xl ${formData.hasPortions ? 'bg-[#D4AF37]/20 text-[#D4AF37]' : 'bg-white/5 text-slate-500'}`}>
                    <Layers className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-[10px] font-black text-white uppercase tracking-widest">Multi-Portions</h3>
                    <p className="text-[7px] text-slate-500 font-bold uppercase mt-0.5">Custom portion sizes</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={formData.hasPortions} onChange={e => handleInputChange('hasPortions', e.target.checked)} className="sr-only peer" />
                  <div className="w-12 h-6 bg-white/10 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-slate-400 after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37] peer-checked:after:bg-white shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)] peer-checked:shadow-[0_0_15px_rgba(212,175,55,0.3)]"></div>
                </label>
              </div>

              {formData.hasPortions ? (
                <div className="space-y-3 animate-in slide-in-from-top-2 duration-300">
                  {formData.portions.map((portion, index) => (
                    <div key={index} className="grid grid-cols-[1fr_1fr_auto] gap-4 items-end">
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest ml-1">Size (e.g. Full, Half, ml, L)</label>
                        <input
                          value={portion.portionType}
                          onChange={e => updatePortion(index, 'portionType', e.target.value)}
                          className={`w-full bg-white/5 border ${errors[`portionType_${index}`] ? 'border-rose-500' : 'border-white/10'} rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#D4AF37] font-black`}
                          placeholder="Size Name"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest ml-1">Price</label>
                        <input
                          type="number"
                          value={portion.price}
                          onChange={e => updatePortion(index, 'price', e.target.value)}
                          onWheel={(e) => e.target.blur()}
                          className={`w-full bg-white/5 border ${errors[`portionPrice_${index}`] ? 'border-rose-500' : 'border-white/10'} rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#D4AF37] font-black`}
                          placeholder="Rs"
                        />
                      </div>
                      {formData.portions.length > 1 && (
                        <button type="button" onClick={() => removePortion(index)} className="p-3 mb-[1px] bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white rounded-xl transition-colors">
                          <X className="w-5 h-5" />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" onClick={addPortion} className="w-full py-3 mt-2 border-2 border-dashed border-white/10 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:border-[#D4AF37] hover:text-[#D4AF37] transition-colors">
                    + Add Another Size
                  </button>
                </div>
              ) : (
                <div className="space-y-1.5">
                  <label className="text-[8px] font-bold text-slate-500 uppercase tracking-widest ml-1">Standard Price</label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={e => handleInputChange('price', e.target.value)}
                    onWheel={(e) => e.target.blur()}
                    className={`w-full bg-white/5 border ${errors.price ? 'border-rose-500' : 'border-white/10'} rounded-xl px-4 py-3 text-xs text-white outline-none focus:border-[#D4AF37] font-black`}
                    placeholder="Rs 0.00"
                  />
                  {errors.price && <p className="text-[9px] text-rose-500 ml-1">{errors.price}</p>}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex items-center justify-end gap-6 pt-6 border-t border-white/5">
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
