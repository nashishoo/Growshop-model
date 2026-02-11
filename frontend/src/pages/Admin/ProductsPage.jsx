import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Search, Edit, Eye, Package, Plus, List, Layers, ChevronDown, ChevronRight, ChevronLeft, CheckSquare, Square, Trash2, CheckCircle, XCircle, Tag, Briefcase, Settings } from 'lucide-react';
import EditProductModal from '../../components/Admin/EditProductModal';
import AddProductModal from '../../components/Admin/AddProductModal';
import CategoryManagementModal from '../../components/Admin/CategoryManagementModal';

const ProductsPage = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [brandFilter, setBrandFilter] = useState('all');
    const [activeStatusFilter, setActiveStatusFilter] = useState('all');
    const [viewMode, setViewMode] = useState('list');
    const [expandedCategories, setExpandedCategories] = useState({});
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(50);
    const [totalCount, setTotalCount] = useState(0);
    const [activeCount, setActiveCount] = useState(0);
    const [lowStockCount, setLowStockCount] = useState(0);

    const [selectedProducts, setSelectedProducts] = useState([]);
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [bulkActionType, setBulkActionType] = useState(null);
    const [showManagementModal, setShowManagementModal] = useState(false);

    useEffect(() => {
        fetchProducts();
        fetchCategories();
        fetchBrands();
        fetchStatistics();
    }, []);

    const fetchProducts = async () => {
        try {
            let allProducts = [];
            let start = 0;
            const batchSize = 1000;
            let hasMore = true;

            while (hasMore) {
                const { data, error } = await supabase
                    .from('products')
                    .select(`
                        *,
                        brands (name),
                        categories (name)
                    `)
                    .range(start, start + batchSize - 1)
                    .order('name');

                if (error) {
                    console.error('Supabase error:', error);
                    throw error;
                }

                if (data && data.length > 0) {
                    allProducts = [...allProducts, ...data];
                    console.log(`📦 Batch loaded: ${data.length} products (Total so far: ${allProducts.length})`);

                    if (data.length < batchSize) {
                        hasMore = false;
                    } else {
                        start += batchSize;
                    }
                } else {
                    hasMore = false;
                }
            }

            console.log(`✅ Products fetched: ${allProducts.length}`);
            setProducts(allProducts);
        } catch (error) {
            console.error('Error fetching products:', error);
            setProducts([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStatistics = async () => {
        try {
            const { count: total } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true });

            const { count: active } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true })
                .eq('is_active', true);

            const { count: lowStock } = await supabase
                .from('products')
                .select('*', { count: 'exact', head: true })
                .lt('stock_quantity', 5);

            setTotalCount(total || 0);
            setActiveCount(active || 0);
            setLowStockCount(lowStock || 0);

            console.log(`📊 Stats - Total: ${total}, Active: ${active}, Low Stock: ${lowStock}`);
        } catch (error) {
            console.error('Error fetching statistics:', error);
        }
    };

    const fetchCategories = async () => {
        try {
            const { data, error } = await supabase
                .from('categories')
                .select('id, name')
                .eq('is_active', true)
                .order('name');

            if (error) throw error;
            setCategories(data);
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
    };

    const fetchBrands = async () => {
        try {
            const { data, error } = await supabase
                .from('brands')
                .select('id, name')
                .eq('is_active', true)
                .order('name');

            if (error) throw error;
            setBrands(data);
        } catch (error) {
            console.error('Error fetching brands:', error);
        }
    };

    const filteredProducts = products.filter(product => {
        const matchesSearch = searchTerm === '' ||
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.brands?.name?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' ||
            (categoryFilter === 'sin-categoria' && !product.category_id) ||
            product.category_id === categoryFilter;
        const matchesBrand = brandFilter === 'all' || product.brand_id === brandFilter;
        const matchesStatus = activeStatusFilter === 'all' || (activeStatusFilter === 'active' && product.is_active) || (activeStatusFilter === 'inactive' && !product.is_active);
        return matchesSearch && matchesCategory && matchesBrand && matchesStatus;
    });

    // Debug: Log counts by status
    React.useEffect(() => {
        const activeCount = products.filter(p => p.is_active).length;
        const inactiveCount = products.filter(p => !p.is_active).length;
        console.log(`📊 Total: ${products.length}, Active: ${activeCount}, Inactive: ${inactiveCount}`);
        console.log(`🔍 Filter: ${activeStatusFilter}, Showing: ${filteredProducts.length}`);
    }, [products, activeStatusFilter, filteredProducts.length]);

    const paginatedProducts = filteredProducts.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(filteredProducts.length / itemsPerPage);

    const stats = {
        total: filteredProducts.length,
        active: filteredProducts.filter(p => p.is_active).length,
        lowStock: filteredProducts.filter(p => p.stock_quantity < 5).length
    };

    const handleEditProduct = (product) => {
        setSelectedProduct(product);
        setIsEditModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsEditModalOpen(false);
        setSelectedProduct(null);
    };

    const handleProductUpdated = () => {
        fetchProducts(); // Refresh the products list
        fetchStatistics();
    };

    const handleSearchChange = (value) => {
        setSearchTerm(value);
        setCurrentPage(1);
    };

    const handleCategoryFilterChange = (value) => {
        setCategoryFilter(value);
        setCurrentPage(1);
    };

    const handleBrandFilterChange = (value) => {
        setBrandFilter(value);
        setCurrentPage(1);
    };

    const handleStatusFilterChange = (value) => {
        setActiveStatusFilter(value);
        setCurrentPage(1);
    };

    const handleOpenAddModal = () => {
        setIsAddModalOpen(true);
    };

    const handleCloseAddModal = () => {
        setIsAddModalOpen(false);
    };

    const handleProductCreated = () => {
        fetchProducts();
        fetchStatistics();
    };

    // Bulk selection handlers
    const handleSelectAll = () => {
        if (selectedProducts.length === paginatedProducts.length) {
            setSelectedProducts([]);
        } else {
            setSelectedProducts(paginatedProducts.map(p => p.id));
        }
    };

    const handleToggleProduct = (productId) => {
        if (selectedProducts.includes(productId)) {
            setSelectedProducts(selectedProducts.filter(id => id !== productId));
        } else {
            setSelectedProducts([...selectedProducts, productId]);
        }
    };

    const handleBulkMarkActive = async () => {
        if (!window.confirm(`¿Marcar ${selectedProducts.length} productos como ACTIVOS?`)) return;

        try {
            const { error } = await supabase
                .from('products')
                .update({ is_active: true })
                .in('id', selectedProducts);

            if (error) throw error;

            await fetchProducts();
            await fetchStatistics();
            setSelectedProducts([]);
            alert('Productos marcados como activos correctamente');
        } catch (error) {
            console.error('Error marking products active:', error);
            alert('Error al marcar productos activos');
        }
    };

    const handleBulkMarkInactive = async () => {
        if (!window.confirm(`¿Marcar ${selectedProducts.length} productos como INACTIVOS?`)) return;

        try {
            const { error } = await supabase
                .from('products')
                .update({ is_active: false })
                .in('id', selectedProducts);

            if (error) throw error;

            await fetchProducts();
            await fetchStatistics();
            setSelectedProducts([]);
            alert('Productos marcados como inactivos correctamente');
        } catch (error) {
            console.error('Error marking products inactive:', error);
            alert('Error al marcar productos inactivos');
        }
    };

    const handleBulkDelete = async () => {
        if (!window.confirm(`⚠️ ¿ELIMINAR ${selectedProducts.length} productos? Esta acción NO se puede deshacer.`)) return;

        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .in('id', selectedProducts);

            if (error) throw error;

            await fetchProducts();
            await fetchStatistics();
            setSelectedProducts([]);
            alert('Productos eliminados correctamente');
        } catch (error) {
            console.error('Error deleting products:', error);
            alert('Error al eliminar productos');
        }
    };

    const toggleCategory = (categoryName) => {
        setExpandedCategories(prev => ({
            ...prev,
            [categoryName]: !prev[categoryName]
        }));
    };

    const groupedProducts = filteredProducts.reduce((groups, product) => {
        const categoryName = product.categories?.name || 'Sin Categoría';
        if (!groups[categoryName]) {
            groups[categoryName] = [];
        }
        groups[categoryName].push(product);
        return groups;
    }, {});

    const sortedCategories = Object.keys(groupedProducts).sort((a, b) => {
        if (a === 'Sin Categoría') return 1;
        if (b === 'Sin Categoría') return -1;
        return a.localeCompare(b);
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-neon-green font-graffiti text-2xl animate-pulse">CARGANDO PRODUCTOS...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8 flex flex-col md:flex-row md:items-start justify-between gap-4">
                <div>
                    <h1 className="text-3xl md:text-4xl font-graffiti text-white mb-2 tracking-wide">GESTIÓN DE PRODUCTOS</h1>
                    <p className="text-gray-400 font-mono text-xs md:text-sm tracking-widest uppercase">Administra el catálogo completo</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                    <button
                        onClick={() => setShowManagementModal(true)}
                        className="bg-brand-purple text-white px-6 py-3 rounded-xl font-black hover:bg-purple-600 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-purple/30 hover:scale-105 uppercase text-sm tracking-wider w-full sm:w-auto"
                    >
                        <Settings className="w-5 h-5" />
                        Gestionar
                    </button>
                    <button
                        onClick={handleOpenAddModal}
                        className="bg-neon-green text-black px-6 py-3 rounded-xl font-black hover:bg-white transition-all flex items-center justify-center gap-2 shadow-lg shadow-neon-green/30 hover:scale-105 uppercase text-sm tracking-wider w-full sm:w-auto"
                    >
                        <Plus className="w-5 h-5" />
                        Nuevo Producto
                    </button>
                </div>
            </div>

            {/* Status Tabs - Underground Style */}
            {/* Status Tabs - Underground Style */}
            <div className="mb-6 flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                <button
                    onClick={() => setActiveStatusFilter('all')}
                    className={`px-8 py-3 rounded-xl font-black uppercase text-sm tracking-wider transition-all whitespace-nowrap ${activeStatusFilter === 'all'
                        ? 'bg-neon-green text-black shadow-lg shadow-neon-green/30'
                        : 'bg-[#111] text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-800'
                        }`}
                >
                    📦 Todos
                </button>
                <button
                    onClick={() => setActiveStatusFilter('active')}
                    className={`px-8 py-3 rounded-xl font-black uppercase text-sm tracking-wider transition-all whitespace-nowrap ${activeStatusFilter === 'active'
                        ? 'bg-neon-green text-black shadow-lg shadow-neon-green/30'
                        : 'bg-[#111] text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-800'
                        }`}
                >
                    ✅ Activos
                </button>
                <button
                    onClick={() => setActiveStatusFilter('inactive')}
                    className={`px-8 py-3 rounded-xl font-black uppercase text-sm tracking-wider transition-all whitespace-nowrap ${activeStatusFilter === 'inactive'
                        ? 'bg-red-600 text-white shadow-lg shadow-red-500/30'
                        : 'bg-[#111] text-gray-400 hover:bg-gray-800 hover:text-white border border-gray-800'
                        }`}
                >
                    ❌ Inactivos
                </button>
            </div>

            {/* Category Tabs - Quick Filter by Main Categories */}
            {/* Category Tabs - Quick Filter by Main Categories */}
            <div className="mb-6 flex gap-2 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
                <button
                    onClick={() => handleCategoryFilterChange('all')}
                    className={`px-6 py-2.5 rounded-xl font-bold uppercase text-xs tracking-wider transition-all whitespace-nowrap ${categoryFilter === 'all'
                        ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/30'
                        : 'bg-[#111] text-gray-500 hover:bg-gray-800 hover:text-gray-300 border border-gray-800'
                        }`}
                >
                    📦 Todas
                </button>
                {categories.slice(0, 8).map((cat) => (
                    <button
                        key={cat.id}
                        onClick={() => handleCategoryFilterChange(cat.id)}
                        className={`px-6 py-2.5 rounded-xl font-bold uppercase text-xs tracking-wider transition-all whitespace-nowrap ${categoryFilter === cat.id
                            ? 'bg-brand-purple text-white shadow-lg shadow-brand-purple/30'
                            : 'bg-[#111] text-gray-500 hover:bg-gray-800 hover:text-gray-300 border border-gray-800'
                            }`}
                    >
                        {cat.name}
                    </button>
                ))}
                <button
                    onClick={() => handleCategoryFilterChange('sin-categoria')}
                    className={`px-6 py-2.5 rounded-xl font-bold uppercase text-xs tracking-wider transition-all whitespace-nowrap ${categoryFilter === 'sin-categoria'
                        ? 'bg-brand-yellow text-black shadow-lg shadow-brand-yellow/30'
                        : 'bg-[#111] text-gray-500 hover:bg-gray-800 hover:text-gray-300 border border-gray-800'
                        }`}
                >
                    🏷️ Sin Categoría
                </button>
            </div>

            {/* Filters - Underground Style */}
            <div className="bg-[#111] rounded-2xl p-6 border border-gray-800 mb-8">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    {/* Search - Takes more space */}
                    <div className="md:col-span-6 relative">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="BUSCAR PRODUCTO O MARCA..."
                            value={searchTerm}
                            onChange={(e) => handleSearchChange(e.target.value)}
                            className="w-full bg-black/50 border border-gray-800 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-neon-green transition-all uppercase text-sm tracking-wide font-bold"
                        />
                    </div>

                    {/* Brand Filter */}
                    <div className="md:col-span-3">
                        <select
                            value={brandFilter}
                            onChange={(e) => handleBrandFilterChange(e.target.value)}
                            className="w-full bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-green transition-all uppercase text-xs font-bold tracking-wider"
                        >
                            <option value="all">🏷️ TODAS LAS MARCAS</option>
                            {brands.map(brand => (
                                <option key={brand.id} value={brand.id}>{brand.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="md:col-span-3 flex items-center gap-3 justify-between md:justify-end">
                        <span className="text-gray-500 text-xs font-mono uppercase tracking-widest">Vista:</span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`p-3 rounded-xl transition-all ${viewMode === 'list'
                                    ? 'bg-neon-green text-black shadow-lg shadow-neon-green/30'
                                    : 'bg-black/50 text-gray-500 hover:text-white border border-gray-800 hover:border-gray-700'
                                    }`}
                                title="Vista Lista"
                            >
                                <List className="w-5 h-5" />
                            </button>
                            <button
                                onClick={() => setViewMode('grouped')}
                                className={`p-3 rounded-xl transition-all ${viewMode === 'grouped'
                                    ? 'bg-neon-green text-black shadow-lg shadow-neon-green/30'
                                    : 'bg-black/50 text-gray-500 hover:text-white border border-gray-800 hover:border-gray-700'
                                    }`}
                                title="Vista por Categoría"
                            >
                                <Layers className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Summary - Underground Style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="bg-[#111] rounded-2xl p-6 border border-gray-800 hover:border-neon-green/30 transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-neon-green/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Package className="w-8 h-8 text-neon-green" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs font-mono uppercase tracking-widest mb-1">Total en DB</p>
                            <p className="text-3xl font-black text-white">{totalCount.toLocaleString('es-CL')}</p>
                            <p className="text-gray-600 text-xs font-mono mt-1">Mostrando: {filteredProducts.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#111] rounded-2xl p-6 border border-gray-800 hover:border-neon-green/30 transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-neon-green/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <CheckCircle className="w-8 h-8 text-neon-green" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs font-mono uppercase tracking-widest mb-1">Activos</p>
                            <p className="text-3xl font-black text-white">{activeCount.toLocaleString('es-CL')}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#111] rounded-2xl p-6 border border-gray-800 hover:border-red-500/30 transition-all group">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-xl bg-red-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Package className="w-8 h-8 text-red-500" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs font-mono uppercase tracking-widest mb-1">Stock Bajo</p>
                            <p className="text-3xl font-black text-white">{lowStockCount.toLocaleString('es-CL')}</p>
                            <p className="text-gray-600 text-xs font-mono mt-1">Menos de 5 unidades</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Bulk Actions Toolbar - Underground Style */}
            {selectedProducts.length > 0 && (
                <div className="bg-neon-green/10 border-2 border-neon-green/50 rounded-2xl p-5 mb-6 animate-in slide-in-from-top duration-300">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-neon-green/20 flex items-center justify-center">
                                <CheckSquare className="w-6 h-6 text-neon-green" />
                            </div>
                            <div>
                                <span className="text-white font-black text-lg">
                                    {selectedProducts.length}
                                </span>
                                <span className="text-gray-400 ml-2 font-mono text-sm uppercase tracking-wider">
                                    producto(s) seleccionado(s)
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                            <button
                                onClick={handleBulkMarkActive}
                                className="bg-neon-green text-black px-5 py-2.5 rounded-xl font-black uppercase text-xs tracking-wider hover:bg-white transition-all flex items-center gap-2 shadow-lg shadow-neon-green/30"
                            >
                                <CheckCircle className="w-4 h-4" />
                                Activar
                            </button>
                            <button
                                onClick={handleBulkMarkInactive}
                                className="bg-brand-yellow text-black px-5 py-2.5 rounded-xl font-black uppercase text-xs tracking-wider hover:bg-white transition-all flex items-center gap-2 shadow-lg shadow-brand-yellow/30"
                            >
                                <XCircle className="w-4 h-4" />
                                Desactivar
                            </button>
                            <button
                                onClick={handleBulkDelete}
                                className="bg-red-600 text-white px-5 py-2.5 rounded-xl font-black uppercase text-xs tracking-wider hover:bg-red-500 transition-all flex items-center gap-2 shadow-lg shadow-red-500/30"
                            >
                                <Trash2 className="w-4 h-4" />
                                Eliminar
                            </button>
                            <button
                                onClick={() => setSelectedProducts([])}
                                className="bg-gray-800 text-gray-400 px-5 py-2.5 rounded-xl font-bold uppercase text-xs tracking-wider hover:bg-gray-700 hover:text-white transition-all border border-gray-700"
                            >
                                Cancelar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Products Table or Grouped View - Underground Style */}
            <div className="bg-[#111] rounded-2xl border border-gray-800 overflow-hidden">
                {viewMode === 'list' ? (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px]">
                            <thead className="bg-black/50 border-b border-gray-800">
                                <tr>
                                    <th className="px-4 py-4 text-left">
                                        <button
                                            onClick={handleSelectAll}
                                            className="text-gray-500 hover:text-neon-green transition-colors"
                                        >
                                            {selectedProducts.length === paginatedProducts.length && paginatedProducts.length > 0 ? (
                                                <CheckSquare className="w-5 h-5 text-neon-green" />
                                            ) : (
                                                <Square className="w-5 h-5" />
                                            )}
                                        </button>
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-mono text-gray-500 uppercase tracking-widest">
                                        Producto
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-mono text-gray-500 uppercase tracking-widest">
                                        Marca
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-mono text-gray-500 uppercase tracking-widest">
                                        Categoría
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-mono text-gray-500 uppercase tracking-widest">
                                        Precio
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-mono text-gray-500 uppercase tracking-widest">
                                        Stock
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-mono text-gray-500 uppercase tracking-widest">
                                        Estado
                                    </th>
                                    <th className="px-6 py-4 text-left text-xs font-mono text-gray-500 uppercase tracking-widest">
                                        Acción
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-slate-800/50 divide-y divide-slate-700">
                                {paginatedProducts.length === 0 ? (
                                    <tr>
                                        <td colSpan="8" className="px-6 py-8 text-center text-slate-400">
                                            No se encontraron productos
                                        </td>
                                    </tr>
                                ) : (
                                    paginatedProducts.map((product) => (
                                        <tr
                                            key={product.id}
                                            className="hover:bg-slate-700/50 transition-colors cursor-pointer"
                                        >
                                            <td className="px-4 py-4" onClick={(e) => e.stopPropagation()}>
                                                <button
                                                    onClick={() => handleToggleProduct(product.id)}
                                                    className="text-slate-300 hover:text-white transition-colors"
                                                >
                                                    {selectedProducts.includes(product.id) ? (
                                                        <CheckSquare className="w-5 h-5 text-brand-green" />
                                                    ) : (
                                                        <Square className="w-5 h-5" />
                                                    )}
                                                </button>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-300" onClick={() => handleEditProduct(product)}>
                                                <div className="flex items-center gap-3">
                                                    <img
                                                        src={product.image_url || 'https://via.placeholder.com/40'}
                                                        alt={product.name}
                                                        className="w-10 h-10 object-contain bg-black rounded"
                                                    />
                                                    <span className="line-clamp-2">{product.name}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-300">
                                                {product.brands?.name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-slate-300">
                                                {product.categories?.name || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-white">
                                                ${(product.sale_price || product.price).toLocaleString('es-CL')}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <span className={`${product.stock_quantity < 5
                                                    ? 'text-red-500 font-bold'
                                                    : 'text-slate-300'
                                                    }`}>
                                                    {product.stock_quantity || 0}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${product.is_active
                                                    ? 'bg-green-500/10 text-green-500'
                                                    : 'bg-red-500/10 text-red-500'
                                                    }`}>
                                                    {product.is_active ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                <div className="flex items-center gap-3">
                                                    <button
                                                        className="text-blue-500 hover:text-blue-400 flex items-center gap-1 transition-colors"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleEditProduct(product);
                                                        }}
                                                    >
                                                        <Edit className="w-4 h-4" />
                                                        Editar
                                                    </button>
                                                    <button
                                                        className="text-brand-green hover:text-green-400 flex items-center gap-1 transition-colors"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            window.open(`/producto/${product.slug}`, '_blank');
                                                        }}
                                                    >
                                                        <Eye className="w-4 h-4" />
                                                        Ver
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                ) : (
                    // Grouped by Category View
                    <div className="p-4 space-y-4">
                        {sortedCategories.map((categoryName) => {
                            const categoryProducts = groupedProducts[categoryName];
                            const isExpanded = expandedCategories[categoryName] !== false;

                            return (
                                <div key={categoryName} className="border border-slate-700 rounded-lg overflow-hidden">
                                    {/* Category Header */}
                                    <button
                                        onClick={() => toggleCategory(categoryName)}
                                        className="w-full flex items-center justify-between p-4 bg-slate-900 hover:bg-slate-750 transition-colors"
                                    >
                                        <div className="flex items-center gap-3">
                                            {isExpanded ? (
                                                <ChevronDown className="w-5 h-5 text-brand-green" />
                                            ) : (
                                                <ChevronRight className="w-5 h-5 text-slate-500" />
                                            )}
                                            <h3 className="text-lg font-bold text-white">
                                                {categoryName}
                                            </h3>
                                            <span className="text-slate-400 text-sm">
                                                ({categoryProducts.length})
                                            </span>
                                        </div>
                                    </button>

                                    {/* Category Products */}
                                    {isExpanded && (
                                        <div className="divide-y divide-slate-700">
                                            {categoryProducts.map((product) => (
                                                <div
                                                    key={product.id}
                                                    onClick={() => handleEditProduct(product)}
                                                    className="p-4 hover:bg-slate-700/50 transition-colors cursor-pointer flex items-center justify-between"
                                                >
                                                    <div className="flex items-center gap-4 flex-grow">
                                                        <img
                                                            src={product.image_url || 'https://via.placeholder.com/60'}
                                                            alt={product.name}
                                                            className="w-16 h-16 object-contain bg-black rounded"
                                                        />
                                                        <div className="flex-grow">
                                                            <h4 className="text-white font-bold">{product.name}</h4>
                                                            <p className="text-slate-400 text-sm">
                                                                {product.brands?.name || 'Sin marca'}
                                                            </p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-6">
                                                        <div className="text-right">
                                                            <p className="text-white font-bold">
                                                                ${(product.sale_price || product.price).toLocaleString('es-CL')}
                                                            </p>
                                                            <p className={`text-sm ${product.stock_quantity < 5 ? 'text-red-500 font-bold' : 'text-slate-400'
                                                                }`}>
                                                                Stock: {product.stock_quantity}
                                                            </p>
                                                        </div>
                                                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${product.is_active
                                                            ? 'bg-green-500/10 text-green-500'
                                                            : 'bg-red-500/10 text-red-500'
                                                            }`}>
                                                            {product.is_active ? 'Activo' : 'Inactivo'}
                                                        </span>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                        {sortedCategories.length === 0 && (
                            <div className="text-center text-slate-400 py-8">
                                No se encontraron productos
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Pagination Controls */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-800 rounded-lg p-4 border border-slate-700">
                <div className="text-slate-400 text-sm">
                    Mostrando <span className="text-white font-bold">{((currentPage - 1) * itemsPerPage) + 1}</span> - <span className="text-white font-bold">{Math.min(currentPage * itemsPerPage, filteredProducts.length)}</span> de <span className="text-white font-bold">{filteredProducts.length}</span> productos filtrados
                </div>

                <div className="flex items-center gap-2">
                    <button
                        onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                        disabled={currentPage === 1}
                        className={`p-2 rounded transition-colors ${currentPage === 1
                            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            : 'bg-slate-700 text-white hover:bg-brand-green hover:text-black'
                            }`}
                    >
                        <ChevronLeft className="w-5 h-5" />
                    </button>

                    <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                            let pageNum;
                            if (totalPages <= 5) {
                                pageNum = i + 1;
                            } else if (currentPage <= 3) {
                                pageNum = i + 1;
                            } else if (currentPage >= totalPages - 2) {
                                pageNum = totalPages - 4 + i;
                            } else {
                                pageNum = currentPage - 2 + i;
                            }

                            return (
                                <button
                                    key={pageNum}
                                    onClick={() => setCurrentPage(pageNum)}
                                    className={`px-3 py-1 rounded transition-colors ${currentPage === pageNum
                                        ? 'bg-brand-green text-black font-bold'
                                        : 'bg-slate-700 text-white hover:bg-slate-600'
                                        }`}
                                >
                                    {pageNum}
                                </button>
                            );
                        })}
                    </div>

                    <button
                        onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                        disabled={currentPage === totalPages}
                        className={`p-2 rounded transition-colors ${currentPage === totalPages
                            ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                            : 'bg-slate-700 text-white hover:bg-brand-green hover:text-black'
                            }`}
                    >
                        <ChevronRight className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Edit Product Modal */}
            {isEditModalOpen && selectedProduct && (
                <EditProductModal
                    product={selectedProduct}
                    onClose={handleCloseModal}
                    onUpdate={handleProductUpdated}
                />
            )}

            {/* Add Product Modal */}
            {isAddModalOpen && (
                <AddProductModal
                    onClose={handleCloseAddModal}
                    onProductCreated={handleProductCreated}
                />
            )}

            {/* Category Management Modal */}
            <CategoryManagementModal
                isOpen={showManagementModal}
                onClose={() => setShowManagementModal(false)}
                onUpdate={() => {
                    fetchCategories();
                    fetchBrands();
                    fetchProducts();
                }}
            />
        </div>
    );
};

export default ProductsPage;
