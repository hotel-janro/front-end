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
  Loader2
} from 'lucide-react';
import { apiFetch, API_HOST, getImageUrl } from '../../../api.js';
import { ImageWithFallback } from '../../../components/common/ImageWithFallback.jsx';

export default function AddMenuItemForm({ initialItem, onSaved, onCancel }) {
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
  }, [initialItem]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Form Validation
      if (!formData.name.trim()) {
        throw new Error('Please provide a name for this dish');
      }
      if (Number(formData.price) <= 0) {
        throw new Error('Price must be a positive investment value');
      }
      if (!formData.category) {
        throw new Error('Please select a cuisine category');
      }

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

      if (imageFile && imageFile.size > 5 * 1024 * 1024) {
        throw new Error('Image size too large. Max 5MB allowed.');
      }

      await apiFetch(url, {
        method,
        body: data
      });

      alert('Successfully saved culinary masterpiece!');
      onSaved();
    } catch (error) {
      alert('Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const updatePortionPrice = (type, price) => {
    setFormData(prev => ({
      ...prev,
      portions: prev.portions.map(p => p.portionType === type ? { ...p, price } : p)
    }));
  };

  return (
    <div className="grid lg:grid-cols-[1fr_400px] gap-10">
      <form onSubmit={handleSubmit} className="space-y-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* Name */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Dish Identity</label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Signature Lobster Thermidor"
                className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/5 transition-all text-slate-700 font-medium"
                required
              />
            </div>
          </div>

          {/* Category */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Cuisine Group</label>
            <select 
              value={formData.category}
              onChange={e => setFormData({...formData, category: e.target.value})}
              className="w-full bg-white border border-slate-200 rounded-2xl px-6 py-4 outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/5 transition-all text-slate-700 font-bold appearance-none cursor-pointer"
            >
              <option value="Main Course">Main Course</option>
              <option value="Bites">Bites</option>
              <option value="Desserts">Desserts</option>
              <option value="Beverages">Beverages</option>
            </select>
          </div>

          {/* Price / Portions */}
          <div className="md:col-span-2 p-8 bg-slate-50 rounded-[2.5rem] border border-slate-100 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-[#D4AF37] shadow-sm">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-slate-900">Portion Pricing</p>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Define cost structure</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={formData.hasPortions} 
                  onChange={e => setFormData({...formData, hasPortions: e.target.checked})} 
                  className="sr-only peer" 
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                <span className="ms-3 text-[10px] font-black text-slate-500 uppercase tracking-widest">Enable Full/Half</span>
              </label>
            </div>

            {formData.hasPortions ? (
              <div className="grid md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-top-4 duration-500">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest ml-1 italic">Full Portion Price</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rs</span>
                    <input 
                      type="number"
                      value={formData.portions.find(p => p.portionType === 'Full')?.price || ''}
                      onChange={e => updatePortionPrice('Full', e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-[#D4AF37] transition-all text-slate-900 font-black"
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-blue-400 uppercase tracking-widest ml-1 italic">Half Portion Price</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rs</span>
                    <input 
                      type="number"
                      value={formData.portions.find(p => p.portionType === 'Half')?.price || ''}
                      onChange={e => updatePortionPrice('Half', e.target.value)}
                      placeholder="0.00"
                      className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-[#D4AF37] transition-all text-slate-900 font-black"
                      required
                    />
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-2 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Standard Investment Value</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">Rs</span>
                  <input 
                    type="number"
                    value={formData.price}
                    onChange={e => setFormData({...formData, price: e.target.value})}
                    placeholder="0.00"
                    className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-[#D4AF37] transition-all text-slate-900 font-black"
                    required
                  />
                </div>
              </div>
            )}
          </div>

          {/* Prep Time */}
          <div className="space-y-2">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">Crafting Duration</label>
            <div className="relative">
              <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
              <input 
                type="number"
                value={formData.prepTime}
                onChange={e => setFormData({...formData, prepTime: e.target.value})}
                placeholder="Minutes"
                className="w-full bg-white border border-slate-200 rounded-2xl pl-12 pr-6 py-4 outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/5 transition-all text-slate-700 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1">The Culinary Story</label>
          <textarea 
            rows="4"
            value={formData.description}
            onChange={e => setFormData({...formData, description: e.target.value})}
            placeholder="Describe the textures, aromas, and heritage of this dish..."
            className="w-full bg-white border border-slate-200 rounded-[2rem] px-6 py-5 outline-none focus:border-[#D4AF37] focus:ring-4 focus:ring-[#D4AF37]/5 transition-all text-slate-600 leading-relaxed resize-none"
          />
        </div>

        {/* Form Actions */}
        <div className="flex items-center gap-4 pt-4">
          <button 
            type="submit" 
            disabled={loading}
            className="flex-1 bg-[#0F172A] text-white py-5 rounded-[2rem] font-black text-sm uppercase tracking-[0.3em] hover:bg-slate-800 shadow-2xl transition-all flex items-center justify-center gap-3 disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5 text-[#D4AF37]" />}
            {initialItem ? 'Confirm Masterpiece Update' : 'Unveil New Culinary Creation'}
          </button>
          <button 
            type="button" 
            onClick={onCancel}
            className="px-8 py-5 text-slate-400 font-bold hover:text-rose-500 transition-colors uppercase text-xs tracking-widest"
          >
            Cancel
          </button>
        </div>
      </form>

      {/* Luxury Preview Card */}
      <div className="space-y-6">
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-1 text-center block">Presentation Preview</label>
        <div className="bg-white rounded-[3rem] p-4 shadow-2xl border border-slate-100 sticky top-10 overflow-hidden group">
          <div className="relative h-[300px] rounded-[2.5rem] overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 flex flex-col items-center justify-center group-hover:border-[#D4AF37]/50 transition-colors">
            {imagePreview ? (
              <>
                <ImageWithFallback src={imagePreview} className="w-full h-full object-cover" alt="Preview" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <label className="cursor-pointer bg-white text-slate-900 px-6 py-3 rounded-full font-bold text-sm shadow-xl flex items-center gap-2">
                    <Camera className="w-4 h-4" /> Change Image
                    <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                  </label>
                </div>
              </>
            ) : (
              <label className="flex flex-col items-center gap-4 cursor-pointer">
                <div className="w-16 h-16 bg-white rounded-full shadow-lg flex items-center justify-center text-slate-300">
                  <UploadCloud className="w-8 h-8" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-bold text-slate-900">Upload Visual Masterpiece</p>
                  <p className="text-[10px] text-slate-400 mt-1 uppercase tracking-tighter">JPG, PNG or WEBP up to 5MB</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
              </label>
            )}
          </div>

          <div className="p-6 space-y-4">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="text-xl font-normal text-slate-900 line-clamp-1" style={{ fontFamily: "DM Serif Display, serif" }}>{formData.name || 'Untitled Masterpiece'}</h4>
                <p className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest">{formData.category}</p>
              </div>
              <p className="text-xl font-black text-slate-900">Rs {Number(formData.price || 0).toLocaleString()}</p>
            </div>
            
            <div className="flex items-center gap-4 py-3 border-y border-slate-50">
               <div className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[10px] font-bold uppercase">{formData.prepTime} Min</span>
               </div>
               <div className="w-1 h-1 rounded-full bg-slate-200" />
               <div className={`px-2 py-1 rounded text-[9px] font-black uppercase ${formData.isAvailable ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                  {formData.isAvailable ? 'Live in Menu' : 'Hidden'}
               </div>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={formData.isAvailable} onChange={e => setFormData({...formData, isAvailable: e.target.checked})} className="sr-only peer" />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#D4AF37]"></div>
                <span className="ms-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Visibility</span>
              </label>
              <div className="flex -space-x-2">
                {[1,2,3].map(i => <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[8px] font-bold">⭐</div>)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
