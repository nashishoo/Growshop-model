import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { X, Save, AlertCircle, Plus, Trash2, Image as ImageIcon } from 'lucide-react';

const EditProductModal = ({ product, onClose, onProductUpdated }) => {
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        sale_price: '',
        stock_quantity: 0,
        brand_id: '',
        category_id: '',
        is_active: true,
        image_url: '',
        gallery_images: [],
        featured_detail_image: ''
    });

    const [brands, setBrands] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('success');

    // New entity creation states
    const [showCreateBrand, setShowCreateBrand] = useState(false);
    const [newBrandName, setNewBrandName] = useState('');
    const [showCreateCategory, setShowCreateCategory] = useState(false);
    const [newCategoryName, setNewCategoryName] = useState('');

    useEffect(() => {
        fetchBrandsAndCategories();
        if (product) {
            initializeForm();
        }
    }, [product]);

    const initializeForm = () => {
        setFormData({
            name: product.name || '',
            description: product.description || '',
            price: product.price || 0,
            sale_price: product.sale_price || '',
            stock_quantity: product.stock_quantity || 0,
            brand_id: product.brand_id || '',
            category_id: product.category_id || '',
            is_active: product.is_active ?? true,
            image_url: product.image_url || '',
            gallery_images: tryParseGallery(product.gallery_images),
            featured_detail_image: product.featured_detail_image || ''
        });
    };

    const tryParseGallery = (images) => {
        if (!images) return [];
        if (Array.isArray(images)) return images;
        try {
            const parsed = JSON.parse(images);
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error("Error parsing gallery images", e);
            return [];
        }
    };

    const fetchBrandsAndCategories = async () => {
        try {
            const [brandsRes, categoriesRes] = await Promise.all([
                supabase.from('brands').select('id, name').eq('is_active', true).order('name'),
                supabase.from('categories').select('id, name').eq('is_active', true).order('name')
            ]);

            if (brandsRes.error) throw brandsRes.error;
            if (categoriesRes.error) throw categoriesRes.error;

            setBrands(brandsRes.data);
            setCategories(categoriesRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
            showToastNotification('Error al cargar datos', 'error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const addGalleryImage = () => {
        setFormData(prev => ({
            ...prev,
            gallery_images: [...prev.gallery_images, '']
        }));
    };

    const updateGalleryImage = (index, url) => {
        const updated = [...formData.gallery_images];
        updated[index] = url;
        setFormData(prev => ({ ...prev, gallery_images: updated }));
    };

    const removeGalleryImage = (index) => {
        setFormData(prev => ({
            ...prev,
            gallery_images: prev.gallery_images.filter((_, i) => i !== index)
        }));
    };

    const handleCreateBrand = async () => {
        if (!newBrandName.trim()) return;

        try {
            const slug = generateSlug(newBrandName);
            const { data, error } = await supabase
                .from('brands')
                .insert([{
                    name: newBrandName.trim(),
                    slug: slug,
                    is_active: true
                }])
                .select();

            if (error) throw error;

            setBrands([...brands, data[0]]);
            setFormData(prev => ({ ...prev, brand_id: data[0].id }));
            setShowCreateBrand(false);
            setNewBrandName('');
            showToastNotification('Marca creada correctamente', 'success');
        } catch (error) {
            console.error('Error creating brand:', error);
            showToastNotification('Error al crear marca', 'error');
        }
    };

    const handleCreateCategory = async () => {
        if (!newCategoryName.trim()) return;

        try {
            const slug = generateSlug(newCategoryName);
            const { data, error } = await supabase
                .from('categories')
                .insert([{
                    name: newCategoryName.trim(),
                    slug: slug,
                    is_active: true
                }])
                .select();

            if (error) throw error;

            setCategories([...categories, data[0]]);
            setFormData(prev => ({ ...prev, category_id: data[0].id }));
            setShowCreateCategory(false);
            setNewCategoryName('');
            showToastNotification('Categoría creada correctamente', 'success');
        } catch (error) {
            console.error('Error creating category:', error);
            showToastNotification('Error al crear categoría', 'error');
        }
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'El nombre es requerido';
        }
        if (formData.price < 0) {
            newErrors.price = 'El precio no puede ser negativo';
        }
        if (formData.sale_price && parseFloat(formData.sale_price) >= parseFloat(formData.price)) {
            newErrors.sale_price = 'El precio de oferta debe ser menor al precio normal';
        }
        if (formData.stock_quantity < 0) {
            newErrors.stock_quantity = 'El stock no puede ser negativo';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const generateSlug = (name) => {
        return name
            .toLowerCase()
            .trim()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z0-9\s-]/g, '')
            .replace(/\s+/g, '-')
            .replace(/-+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const showToastNotification = (message, type = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleSave = async () => {
        if (!validateForm()) return;

        setSaving(true);
        try {
            const slug = generateSlug(formData.name);
            const galleryImagesFiltered = formData.gallery_images.filter(url => url.trim() !== '');

            const { error } = await supabase
                .from('products')
                .update({
                    name: formData.name.trim(),
                    slug: slug,
                    description: formData.description.trim() || null,
                    price: parseFloat(formData.price),
                    sale_price: formData.sale_price ? parseFloat(formData.sale_price) : null,
                    stock_quantity: parseInt(formData.stock_quantity),
                    brand_id: formData.brand_id || null,
                    category_id: formData.category_id || null,
                    is_active: formData.is_active,
                    image_url: formData.image_url.trim() || null,
                    gallery_images: JSON.stringify(galleryImagesFiltered),
                    featured_detail_image: formData.featured_detail_image.trim() || null
                })
                .eq('id', product.id);

            if (error) throw error;

            showToastNotification('¡Producto actualizado correctamente!', 'success');
            setTimeout(() => {
                onProductUpdated?.();
                onClose();
            }, 500);
        } catch (error) {
            console.error('Error updating product:', error);
            showToastNotification(`Error: ${error.message}`, 'error');
        } finally {
            setSaving(false);
        }
    };

    const selectedBrand = brands.find(b => b.id === formData.brand_id);
    const discountPercent = formData.sale_price && formData.price
        ? Math.round(((formData.price - formData.sale_price) / formData.price) * 100)
        : 0;

    if (loading) {
        return (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                <div className="bg-slate-800 rounded-lg p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-green"></div>
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
                    {/* Header */}
                    <div className="flex items-center justify-between p-6 border-b border-slate-700">
                        <h2 className="text-2xl font-bold text-white">Editar Producto</h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Two-Column Layout */}
                    <div className="flex-1 overflow-y-auto p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                            {/* LEFT COLUMN - PREVIEW */}
                            <div className="lg:col-span-1">
                                <div className="bg-slate-900 border border-slate-700 rounded-lg p-4 sticky top-0">
                                    <h3 className="text-white font-bold mb-4">Vista Previa</h3>

                                    {/* Image */}
                                    <div className="bg-black rounded-lg mb-4 h-48 flex items-center justify-center overflow-hidden">
                                        {formData.image_url ? (
                                            <img
                                                src={formData.image_url}
                                                alt="Preview"
                                                className="w-full h-full object-contain"
                                            />
                                        ) : (
                                            <ImageIcon className="w-16 h-16 text-slate-600" />
                                        )}
                                    </div>

                                    {/* Name */}
                                    <h4 className="text-white font-bold text-lg mb-2 line-clamp-2">
                                        {formData.name || 'Nombre del producto'}
                                    </h4>

                                    {/* Brand */}
                                    {selectedBrand && (
                                        <p className="text-slate-400 text-sm mb-3">{selectedBrand.name}</p>
                                    )}

                                    {/* Prices */}
                                    <div className="mb-3">
                                        {formData.sale_price ? (
                                            <>
                                                <span className="text-slate-400 line-through text-sm block">
                                                    ${parseFloat(formData.price || 0).toLocaleString('es-CL')}
                                                </span>
                                                <div className="flex items-baseline gap-2">
                                                    <span className="text-brand-green font-bold text-2xl">
                                                        ${parseFloat(formData.sale_price).toLocaleString('es-CL')}
                                                    </span>
                                                    <span className="bg-red-500 text-white text-xs px-2 py-1 rounded">
                                                        -{discountPercent}%
                                                    </span>
                                                </div>
                                            </>
                                        ) : (
                                            <span className="text-white font-bold text-2xl">
                                                ${parseFloat(formData.price || 0).toLocaleString('es-CL')}
                                            </span>
                                        )}
                                    </div>

                                    {/* Stock */}
                                    <div className={`text-sm font-bold mb-3 ${formData.stock_quantity < 5 ? 'text-red-500' : 'text-green-500'}`}>
                                        Stock: {formData.stock_quantity || 0} unidades
                                    </div>

                                    {/* Status Badge */}
                                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${formData.is_active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                                        {formData.is_active ? 'ACTIVO' : 'INACTIVO'}
                                    </span>
                                </div>
                            </div>

                            {/* RIGHT COLUMN - FORM */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Basic Info */}
                                <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                                    <h3 className="text-white font-bold mb-4">Información Básica</h3>

                                    <div className="space-y-4">
                                        {/* Name */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-300 mb-2">
                                                Nombre del Producto *
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.name}
                                                onChange={(e) => handleInputChange('name', e.target.value)}
                                                className={`w-full bg-slate-800 border ${errors.name ? 'border-red-500' : 'border-slate-700'} rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-green transition-colors`}
                                                placeholder="Ej: Fertilizante Orgánico 1L"
                                            />
                                            {errors.name && (
                                                <p className="mt-1 text-red-500 text-sm flex items-center gap-1">
                                                    <AlertCircle className="w-4 h-4" />
                                                    {errors.name}
                                                </p>
                                            )}
                                        </div>

                                        {/* Description */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-300 mb-2">
                                                Descripción
                                            </label>
                                            <textarea
                                                value={formData.description}
                                                onChange={(e) => handleInputChange('description', e.target.value)}
                                                rows={4}
                                                maxLength={500}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-green transition-colors resize-none"
                                                placeholder="Descripción del producto..."
                                            />
                                            <p className="text-slate-500 text-xs mt-1">
                                                {formData.description.length}/500 caracteres
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Pricing */}
                                <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                                    <h3 className="text-white font-bold mb-4">Precios</h3>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold text-slate-300 mb-2">
                                                Precio Normal ($) *
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={formData.price}
                                                onChange={(e) => handleInputChange('price', e.target.value)}
                                                className={`w-full bg-slate-800 border ${errors.price ? 'border-red-500' : 'border-slate-700'} rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-green transition-colors`}
                                            />
                                            {errors.price && (
                                                <p className="mt-1 text-red-500 text-sm">{errors.price}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-bold text-slate-300 mb-2">
                                                Precio Oferta ($)
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                step="0.01"
                                                value={formData.sale_price}
                                                onChange={(e) => handleInputChange('sale_price', e.target.value)}
                                                className={`w-full bg-slate-800 border ${errors.sale_price ? 'border-red-500' : 'border-slate-700'} rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-green transition-colors`}
                                                placeholder="Opcional"
                                            />
                                            {errors.sale_price && (
                                                <p className="mt-1 text-red-500 text-sm">{errors.sale_price}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Images */}
                                <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                                    <h3 className="text-white font-bold mb-4">Imágenes</h3>

                                    <div className="space-y-4">
                                        {/* Main Image */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-300 mb-2">
                                                Imagen Principal (Card/Miniatura)
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.image_url}
                                                onChange={(e) => handleInputChange('image_url', e.target.value)}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-green transition-colors"
                                                placeholder="https://ejemplo.com/imagen.png"
                                            />
                                        </div>

                                        {/* Gallery Images */}
                                        <div>
                                            <div className="flex items-center justify-between mb-2">
                                                <label className="block text-sm font-bold text-slate-300">
                                                    Galería de Imágenes
                                                </label>
                                                <button
                                                    type="button"
                                                    onClick={addGalleryImage}
                                                    className="text-brand-green text-sm flex items-center gap-1 hover:text-green-400"
                                                >
                                                    <Plus className="w-4 h-4" />
                                                    Agregar
                                                </button>
                                            </div>
                                            {formData.gallery_images.map((url, index) => (
                                                <div key={index} className="flex gap-2 mb-2">
                                                    <input
                                                        type="text"
                                                        value={url}
                                                        onChange={(e) => updateGalleryImage(index, e.target.value)}
                                                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-green transition-colors"
                                                        placeholder="https://ejemplo.com/galeria.png"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeGalleryImage(index)}
                                                        className="text-red-500 hover:text-red-400 p-2"
                                                    >
                                                        <Trash2 className="w-5 h-5" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>

                                        {/* Featured Image */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-300 mb-2">
                                                Imagen Destacada (Modal Especial)
                                            </label>
                                            <input
                                                type="text"
                                                value={formData.featured_detail_image}
                                                onChange={(e) => handleInputChange('featured_detail_image', e.target.value)}
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-green transition-colors"
                                                placeholder="https://ejemplo.com/destacada.png"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Classification */}
                                <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
                                    <h3 className="text-white font-bold mb-4">Clasificación</h3>

                                    <div className="space-y-4">
                                        {/* Brand */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-300 mb-2">
                                                Marca
                                            </label>
                                            {!showCreateBrand ? (
                                                <div className="flex gap-2">
                                                    <select
                                                        value={formData.brand_id}
                                                        onChange={(e) => handleInputChange('brand_id', e.target.value)}
                                                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-green transition-colors"
                                                    >
                                                        <option value="">Sin marca</option>
                                                        {brands.map(brand => (
                                                            <option key={brand.id} value={brand.id}>
                                                                {brand.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowCreateBrand(true)}
                                                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap"
                                                    >
                                                        + Nueva
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                                                    <p className="text-slate-300 text-sm mb-2">Crear Nueva Marca</p>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={newBrandName}
                                                            onChange={(e) => setNewBrandName(e.target.value)}
                                                            className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-brand-green"
                                                            placeholder="Nombre de la marca"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={handleCreateBrand}
                                                            className="bg-brand-green text-black px-4 py-2 rounded font-bold hover:bg-green-400"
                                                        >
                                                            Crear
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setShowCreateBrand(false);
                                                                setNewBrandName('');
                                                            }}
                                                            className="bg-slate-700 text-white px-4 py-2 rounded hover:bg-slate-600"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Category */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-300 mb-2">
                                                Categoría
                                            </label>
                                            {!showCreateCategory ? (
                                                <div className="flex gap-2">
                                                    <select
                                                        value={formData.category_id}
                                                        onChange={(e) => handleInputChange('category_id', e.target.value)}
                                                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-green transition-colors"
                                                    >
                                                        <option value="">Sin categoría</option>
                                                        {categories.map(cat => (
                                                            <option key={cat.id} value={cat.id}>
                                                                {cat.name}
                                                            </option>
                                                        ))}
                                                    </select>
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowCreateCategory(true)}
                                                        className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors whitespace-nowrap"
                                                    >
                                                        + Nueva
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="bg-slate-800 border border-slate-700 rounded-lg p-3">
                                                    <p className="text-slate-300 text-sm mb-2">Crear Nueva Categoría</p>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={newCategoryName}
                                                            onChange={(e) => setNewCategoryName(e.target.value)}
                                                            className="flex-1 bg-slate-900 border border-slate-700 rounded px-3 py-2 text-white focus:outline-none focus:border-brand-green"
                                                            placeholder="Nombre de la categoría"
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={handleCreateCategory}
                                                            className="bg-brand-green text-black px-4 py-2 rounded font-bold hover:bg-green-400"
                                                        >
                                                            Crear
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setShowCreateCategory(false);
                                                                setNewCategoryName('');
                                                            }}
                                                            className="bg-slate-700 text-white px-4 py-2 rounded hover:bg-slate-600"
                                                        >
                                                            Cancelar
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>

                                        {/* Stock */}
                                        <div>
                                            <label className="block text-sm font-bold text-slate-300 mb-2">
                                                Stock Inicial
                                            </label>
                                            <input
                                                type="number"
                                                min="0"
                                                value={formData.stock_quantity}
                                                onChange={(e) => handleInputChange('stock_quantity', e.target.value)}
                                                className={`w-full bg-slate-800 border ${errors.stock_quantity ? 'border-red-500' : 'border-slate-700'} rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-green transition-colors`}
                                            />
                                            {parseInt(formData.stock_quantity) < 5 && (
                                                <span className="text-red-500 text-xs">⚠ STOCK BAJO</span>
                                            )}
                                        </div>

                                        {/* Active Status */}
                                        <div className="flex items-center justify-between">
                                            <label className="text-sm font-bold text-slate-300">
                                                Estado del Producto
                                            </label>
                                            <button
                                                type="button"
                                                onClick={() => handleInputChange('is_active', !formData.is_active)}
                                                className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors ${formData.is_active ? 'bg-brand-green' : 'bg-red-500'}`}
                                            >
                                                <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${formData.is_active ? 'translate-x-7' : 'translate-x-1'}`} />
                                            </button>
                                            <span className={`text-sm font-bold ${formData.is_active ? 'text-brand-green' : 'text-red-500'}`}>
                                                {formData.is_active ? 'ACTIVO' : 'INACTIVO'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors"
                        >
                            Cancelar
                        </button>
                        <button
                            onClick={handleSave}
                            disabled={saving || !formData.name.trim()}
                            className="px-6 py-2 bg-brand-green text-black font-bold rounded-lg hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Toast */}
            {showToast && (
                <div className={`fixed top-4 right-4 z-[60] px-6 py-3 rounded-lg shadow-lg animate-slide-in ${toastType === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white font-bold`}>
                    {toastMessage}
                </div>
            )}
        </>
    );
};

export default EditProductModal;
