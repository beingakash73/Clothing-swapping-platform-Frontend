import React, { useState, useMemo } from 'react';
import { useApp } from '../../context/AppContext';
import { BrandTier, Category, ClothingCondition, GenderFit } from '../../types';
import { calculateSwapValue, BRAND_TIER_LABELS, CONDITION_LABELS } from '../../utils/calculator';
import { X, Sparkles, Plus, Check } from 'lucide-react';

interface CreateListingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreated?: (itemId: string) => void;
}

const SAMPLE_PHOTO_PRESETS = [
  { label: 'Denim / Pants', url: 'https://images.unsplash.com/photo-1542272604-780c96856592?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Wool Scarf / Accessory', url: 'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Fleece / Outerwear', url: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Linen Dress', url: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Knit Cardigan', url: 'https://images.unsplash.com/photo-1434389677669-e08b4cac3105?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Sneakers / Footwear', url: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Vintage Leather Boots', url: 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?auto=format&fit=crop&w=1000&q=80' },
  { label: 'Canvas Work Jacket', url: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=1000&q=80' },
];

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { addClothingItem } = useApp();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [brand, setBrand] = useState('');
  const [brandTier, setBrandTier] = useState<BrandTier>('premium');
  const [category, setCategory] = useState<Category>('Jackets & Coats');
  const [size, setSize] = useState('M');
  const [gender, setGender] = useState<GenderFit>('Unisex');
  const [condition, setCondition] = useState<ClothingCondition>('like_new');
  const [conditionNotes, setConditionNotes] = useState('');
  const [material, setMaterial] = useState('100% Cotton');
  const [color, setColor] = useState('Natural');
  const [originalPrice, setOriginalPrice] = useState(180);
  const [imageUrl, setImageUrl] = useState(SAMPLE_PHOTO_PRESETS[0].url);
  const [tagsInput, setTagsInput] = useState('Sustainable, Minimalist');

  // Real-time calculated swap value
  const estimatedValue = useMemo(() => {
    const res = calculateSwapValue({
      category,
      brandTier,
      condition,
      originalPrice: Number(originalPrice) || 50,
      ageYears: 1,
    });
    return res.estimatedSwapValue;
  }, [category, brandTier, condition, originalPrice]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !brand.trim()) return;

    const tags = tagsInput.split(',').map(t => t.trim()).filter(Boolean);

    const newItem = addClothingItem({
      title: title.trim(),
      description: description.trim() || 'A high-quality wearable garment ready for circular exchange.',
      brand: brand.trim(),
      brandTier,
      category,
      size,
      gender,
      condition,
      conditionNotes: conditionNotes.trim() || 'Well-maintained and clean.',
      material: material.trim(),
      color: color.trim(),
      originalPrice: Number(originalPrice) || 100,
      estimatedSwapValue: estimatedValue,
      images: [imageUrl],
      tags: tags.length > 0 ? tags : ['Pre-Loved', 'Sustainable'],
    });

    if (onCreated) onCreated(newItem.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              List a Garment for Swap
            </h2>
            <p className="text-xs text-stone-500">
              Add a wearable piece to your digital closet and join the circular exchange
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Garment Title & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
                Garment Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Classic Trench Coat"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-forest-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
                Brand Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Patagonia, COS, Levi's"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-forest-500"
              />
            </div>
          </div>

          {/* Category & Brand Tier */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
                Category *
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-forest-500"
              >
                <option value="Jackets & Coats">Jackets & Coats</option>
                <option value="Sweaters & Knitwear">Sweaters & Knitwear</option>
                <option value="Dresses & Jumpsuits">Dresses & Jumpsuits</option>
                <option value="Pants & Denim">Pants & Denim</option>
                <option value="Tops & Shirts">Tops & Shirts</option>
                <option value="Footwear">Footwear</option>
                <option value="Bags & Accessories">Bags & Accessories</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
                Brand Tier *
              </label>
              <select
                value={brandTier}
                onChange={(e) => setBrandTier(e.target.value as BrandTier)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-forest-500"
              >
                {Object.entries(BRAND_TIER_LABELS).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.name} ({val.description})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Size, Gender & Condition */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
                Size
              </label>
              <input
                type="text"
                placeholder="M, 32x32, 38..."
                value={size}
                onChange={(e) => setSize(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-forest-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
                Gender / Fit
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as GenderFit)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-forest-500"
              >
                <option value="Unisex">Unisex</option>
                <option value="Women">Women</option>
                <option value="Men">Men</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
                Condition
              </label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as ClothingCondition)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-forest-500"
              >
                {Object.entries(CONDITION_LABELS).map(([key, val]) => (
                  <option key={key} value={key}>
                    {val.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Original Retail Price & Dynamic Swap Value Banner */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
                Original Retail Price ($)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                <input
                  type="number"
                  min={10}
                  max={5000}
                  value={originalPrice}
                  onChange={(e) => setOriginalPrice(Number(e.target.value))}
                  className="w-full pl-8 pr-3 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:bg-white focus:outline-none focus:border-forest-500"
                />
              </div>
            </div>

            {/* Real-time Calculated Value Banner */}
            <div className="p-3.5 bg-gradient-to-br from-forest-50 to-emerald-50 rounded-2xl border border-forest-200/80">
              <span className="text-[11px] font-bold uppercase tracking-wider text-forest-700 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5 text-forest-600" />
                Algorithmic Swap Value
              </span>
              <div className="flex items-baseline gap-1.5 mt-0.5">
                <span className="text-2xl font-extrabold text-forest-900">
                  {estimatedValue} pts
                </span>
                <span className="text-xs text-forest-600 font-medium">
                  (~${estimatedValue} fair exchange power)
                </span>
              </div>
            </div>
          </div>

          {/* Photo Selection / Presets */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1.5">
              Garment Photography:
            </label>

            <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 mb-3">
              {SAMPLE_PHOTO_PRESETS.map((preset) => {
                const isSelected = imageUrl === preset.url;
                return (
                  <button
                    key={preset.url}
                    type="button"
                    onClick={() => setImageUrl(preset.url)}
                    className={`relative aspect-square rounded-xl overflow-hidden border-2 transition-all ${
                      isSelected
                        ? 'border-forest-600 ring-2 ring-forest-600/30 scale-105'
                        : 'border-stone-200 hover:border-stone-400 opacity-80 hover:opacity-100'
                    }`}
                  >
                    <img src={preset.url} alt={preset.label} className="w-full h-full object-cover" />
                    {isSelected && (
                      <div className="absolute inset-0 bg-forest-900/30 flex items-center justify-center">
                        <Check className="w-4 h-4 text-white drop-shadow" />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Custom Image URL */}
            <input
              type="url"
              placeholder="Or paste custom image URL..."
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-600 focus:bg-white focus:outline-none focus:border-forest-500"
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
              Garment Story / Description
            </label>
            <input
              type="text"
              placeholder="e.g. Vintage oversized fit, lightly worn during autumn seasons"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-forest-500"
            />
          </div>

          {/* Condition Notes, Material & Color */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
                Condition Notes
              </label>
              <input
                type="text"
                placeholder="e.g. No stains, pristine"
                value={conditionNotes}
                onChange={(e) => setConditionNotes(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-forest-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
                Material
              </label>
              <input
                type="text"
                placeholder="e.g. 100% Wool"
                value={material}
                onChange={(e) => setMaterial(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-forest-500"
              />
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
                Color
              </label>
              <input
                type="text"
                placeholder="e.g. Oatmeal / Natural"
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-forest-500"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
              Style Tags (comma-separated)
            </label>
            <input
              type="text"
              placeholder="e.g. Vintage, Gorpcore, Minimalist, Winter"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-forest-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 rounded-xl"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl text-xs font-bold bg-forest-800 text-white hover:bg-forest-900 active:scale-95 transition-all shadow-md flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Listing to Marketplace</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
