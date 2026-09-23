import React, { useState, useMemo, useRef, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { BrandTier, Category, ClothingCondition, GenderFit } from '../../types';
import { calculateSwapValue, BRAND_TIER_LABELS, CONDITION_LABELS } from '../../utils/calculator';
import { 
  X, 
  Sparkles, 
  Plus, 
  Check, 
  UploadCloud, 
  Image as ImageIcon, 
  Trash2, 
  Cloud, 
  Loader2, 
  AlertCircle,
  FileCheck2
} from 'lucide-react';

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

interface FilePreviewItem {
  file: File;
  previewUrl: string;
  sizeFormatted: string;
}

export const CreateListingModal: React.FC<CreateListingModalProps> = ({
  isOpen,
  onClose,
  onCreated,
}) => {
  const { addClothingItem, isApiConnected } = useApp();

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

  // Cloudinary Upload Mode: 'upload' (real photos to Cloudinary) or 'presets' (Unsplash demo/URL)
  const [photoSourceMode, setPhotoSourceMode] = useState<'upload' | 'presets'>('upload');
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<FilePreviewItem[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Generate previews when files change
  useEffect(() => {
    const previews = selectedFiles.map((file) => {
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      const sizeFormatted = file.size > 1024 * 1024 ? `${sizeMb} MB` : `${Math.round(file.size / 1024)} KB`;
      return {
        file,
        previewUrl: URL.createObjectURL(file),
        sizeFormatted,
      };
    });
    setFilePreviews(previews);

    return () => {
      previews.forEach((p) => URL.revokeObjectURL(p.previewUrl));
    };
  }, [selectedFiles]);

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

  const handleFileSelection = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setUploadError(null);

    const validFiles: File[] = [];
    const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/jpg', 'image/avif'];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      if (!validTypes.includes(file.type)) {
        setUploadError(`File "${file.name}" has an unsupported format. Please upload JPG, PNG, or WEBP.`);
        continue;
      }
      if (file.size > 10 * 1024 * 1024) {
        setUploadError(`File "${file.name}" is over 10MB limit.`);
        continue;
      }
      validFiles.push(file);
    }

    if (validFiles.length > 0) {
      setSelectedFiles((prev) => [...prev, ...validFiles]);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFileSelection(e.dataTransfer.files);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !brand.trim()) return;

    if (photoSourceMode === 'upload' && selectedFiles.length === 0) {
      setUploadError('Please select at least one garment photo to upload to Cloudinary, or switch to Sample Presets.');
      return;
    }

    setIsUploading(true);
    setUploadError(null);

    try {
      const tags = tagsInput.split(',').map((t) => t.trim()).filter(Boolean);

      const newItem = await addClothingItem(
        {
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
          images: photoSourceMode === 'presets' ? [imageUrl] : [],
          tags: tags.length > 0 ? tags : ['Pre-Loved', 'Sustainable'],
        },
        photoSourceMode === 'upload' ? selectedFiles : undefined
      );

      if (onCreated) onCreated(newItem.id);
      onClose();
    } catch (err: any) {
      console.error('Submission failed:', err);
      setUploadError(err.message || 'Failed to upload and list garment. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-stone-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-stone-200 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-stone-100 flex items-center justify-between bg-stone-50/80">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-forest-100 text-forest-700 flex items-center justify-center">
              <Cloud className="w-5 h-5 text-forest-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-slate-900 leading-tight">
                  List a Garment for Swap
                </h2>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-forest-100 text-forest-800 border border-forest-200 flex items-center gap-1">
                  <Cloud className="w-2.5 h-2.5" />
                  Cloudinary
                </span>
              </div>
              <p className="text-xs text-stone-500">
                Upload real photos to Cloudinary CDN & join circular trading
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="p-1.5 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-200/50 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-5 flex-1">
          {uploadError && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-rose-800 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <div>
                <span className="font-semibold">Upload Notice: </span>
                {uploadError}
              </div>
            </div>
          )}

          {/* Garment Title & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
                Garment Title *
              </label>
              <input
                type="text"
                required
                disabled={isUploading}
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
                disabled={isUploading}
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
                disabled={isUploading}
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
                disabled={isUploading}
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
                disabled={isUploading}
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
                disabled={isUploading}
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
                disabled={isUploading}
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

          {/* Original Retail Price & Algorithmic Swap Value Banner */}
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
                  disabled={isUploading}
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

          {/* PHOTO UPLOAD SECTION WITH CLOUDINARY INTEGRATION */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                <Cloud className="w-3.5 h-3.5 text-forest-600" />
                Garment Photography
              </label>

              {/* Mode Toggle Pills */}
              <div className="flex p-0.5 bg-stone-100 rounded-xl border border-stone-200 text-xs">
                <button
                  type="button"
                  onClick={() => setPhotoSourceMode('upload')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    photoSourceMode === 'upload'
                      ? 'bg-white text-forest-900 shadow-xs font-bold'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Upload Photos
                </button>
                <button
                  type="button"
                  onClick={() => setPhotoSourceMode('presets')}
                  className={`px-3 py-1 rounded-lg font-medium transition-all ${
                    photoSourceMode === 'presets'
                      ? 'bg-white text-forest-900 shadow-xs font-bold'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  Sample Presets / URL
                </button>
              </div>
            </div>

            {/* TAB 1: Real Cloudinary File Upload Dropzone */}
            {photoSourceMode === 'upload' && (
              <div className="space-y-3">
                {/* Drag & Drop Box */}
                <div
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-forest-600 bg-forest-50/70 scale-[1.01]'
                      : 'border-stone-300 hover:border-forest-400 bg-stone-50/60 hover:bg-white'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept="image/png, image/jpeg, image/webp, image/jpg"
                    className="hidden"
                    onChange={(e) => handleFileSelection(e.target.files)}
                  />

                  <div className="flex flex-col items-center gap-2">
                    <div className="w-12 h-12 rounded-2xl bg-forest-100/80 text-forest-700 flex items-center justify-center shadow-xs">
                      <UploadCloud className="w-6 h-6 text-forest-700" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-stone-800">
                        Click or drag & drop garment photos
                      </p>
                      <p className="text-xs text-stone-500 mt-0.5">
                        High-resolution PNG, JPG, or WEBP up to 10MB (Multiple photos supported)
                      </p>
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-[11px] text-forest-700 font-medium bg-forest-50 px-3 py-1 rounded-full border border-forest-200">
                      <FileCheck2 className="w-3.5 h-3.5" />
                      <span>Direct upload to Cloudinary &bull; Stored in MongoDB</span>
                    </div>
                  </div>
                </div>

                {/* Previews Grid */}
                {filePreviews.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-stone-600">
                        Selected Photos ({filePreviews.length}):
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedFiles([])}
                        className="text-[11px] text-rose-600 hover:text-rose-800 font-medium"
                      >
                        Clear All
                      </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {filePreviews.map((item, idx) => (
                        <div
                          key={idx}
                          className="group relative rounded-2xl overflow-hidden border border-stone-200 bg-white shadow-xs aspect-square"
                        >
                          <img
                            src={item.previewUrl}
                            alt={`Upload ${idx + 1}`}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-2">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFile(idx);
                              }}
                              className="self-end p-1.5 rounded-full bg-rose-600 text-white hover:bg-rose-700 shadow-md transition-colors"
                              title="Remove photo"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                            <div className="text-white text-[10px] leading-tight truncate">
                              <p className="font-semibold truncate">{item.file.name}</p>
                              <p className="text-white/80">{item.sizeFormatted}</p>
                            </div>
                          </div>
                          {idx === 0 && (
                            <span className="absolute top-2 left-2 px-1.5 py-0.5 rounded-md bg-forest-800/90 text-white text-[9px] font-bold tracking-wide">
                              PRIMARY
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: Sample Presets / Custom URL */}
            {photoSourceMode === 'presets' && (
              <div className="space-y-3">
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
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

                <input
                  type="url"
                  placeholder="Or paste custom image URL..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs text-stone-600 focus:bg-white focus:outline-none focus:border-forest-500"
                />
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-stone-700 block mb-1">
              Garment Story / Description
            </label>
            <input
              type="text"
              disabled={isUploading}
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
                disabled={isUploading}
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
                disabled={isUploading}
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
                disabled={isUploading}
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
              disabled={isUploading}
              placeholder="e.g. Vintage, Gorpcore, Minimalist, Winter"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              className="w-full p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-forest-500"
            />
          </div>

          {/* Footer Actions */}
          <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[11px] text-stone-500">
              <span className={`w-2 h-2 rounded-full ${isApiConnected ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              <span>{isApiConnected ? 'Connected to Cloudinary & Mongo' : 'Local Demo Mode'}</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isUploading}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 rounded-xl disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="submit"
                disabled={isUploading}
                className="px-6 py-2.5 rounded-xl text-xs font-bold bg-forest-800 text-white hover:bg-forest-900 active:scale-95 transition-all shadow-md flex items-center gap-1.5 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Uploading to Cloudinary...</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>Publish Listing to Marketplace</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
