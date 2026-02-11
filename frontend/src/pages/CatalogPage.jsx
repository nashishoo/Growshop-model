import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';
import StandardProductCard from '../components/Product/StandardProductCard';
import StandardProductModal from '../components/Product/StandardProductModal';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';

const CatalogPage = () => {
    const [products, setProducts] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [selectedBrands, setSelectedBrands] = useState([]);
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        fetchData();

        // Check for category query param
        const params = new URLSearchParams(window.location.search);
        const categoryParam = params.get('category');
        if (categoryParam) {
            // We'll handle this mapping logic if needed, or rely on categories loading
            // logic to pre-select. For now simple fetch.
        }
    }, []);

    useEffect(() => {
        applyFilters();
    }, [products, searchTerm, selectedCategories, selectedBrands]);

    const fetchData = async () => {
        try {
            // Fetch products
            const { data: productsData, error: productsError } = await supabase
                .from('products')
                .select(`
                  *,
                  brands (id, name),
                  categories (id, name)
                `)
                .eq('is_active', true)
                .order('name');

            if (productsError) throw productsError;
            setProducts(productsData);

            // Fetch categories
            const { data: categoriesData, error: categoriesError } = await supabase
                .from('categories')
                .select('id, name')
                .eq('is_active', true)
                .order('name');

            if (categoriesError) throw categoriesError;
            setCategories(categoriesData);

            // Fetch brands
            const { data: brandsData, error: brandsError } = await supabase
                .from('brands')
                .select('id, name')
                .eq('is_active', true)
                .order('name');

            if (brandsError) throw brandsError;
            setBrands(brandsData);

        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...products];

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        // Category filter
        if (selectedCategories.length > 0) {
            filtered = filtered.filter(p =>
                p.categories && selectedCategories.includes(p.categories.id)
            );
        }

        // Brand filter
        if (selectedBrands.length > 0) {
            filtered = filtered.filter(p =>
                p.brands && selectedBrands.includes(p.brands.id)
            );
        }

        setFilteredProducts(filtered);
    };

    const toggleCategory = (categoryId) => {
        setSelectedCategories(prev =>
            prev.includes(categoryId)
                ? prev.filter(id => id !== categoryId)
                : [...prev, categoryId]
        );
    };

    const toggleBrand = (brandId) => {
        setSelectedBrands(prev =>
            prev.includes(brandId)
                ? prev.filter(id => id !== brandId)
                : [...prev, brandId]
        );
    };

    const clearFilters = () => {
        setSearchTerm('');
        setSelectedCategories([]);
        setSelectedBrands([]);
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white pt-24 pb-20 font-body relative overflow-hidden">

            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none fixed"></div>

            <div className="max-w-[1600px] mx-auto px-4 relative z-10">

                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-end mb-12 border-b border-gray-900 pb-8">
                    <div>
                        <h1 className="text-3xl md:text-6xl font-graffiti text-white mb-2">
                            CATÁLOGO <span className="text-neon-green">420</span>
                        </h1>
                        <p className="text-gray-400 font-mono text-sm md:text-base">
                            Explora nuestra selección premium de productos
                        </p>
                    </div>
                </div>

                {/* Search Bar & Mobile Filter Toggle */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="flex-grow relative group">
                        <div className="absolute inset-0 bg-neon-green/20 blur-md rounded-lg opacity-0 group-focus-within:opacity-100 transition-opacity duration-300"></div>
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 group-focus-within:text-neon-green transition-colors w-5 h-5 z-10" />
                        <input
                            type="text"
                            placeholder="Buscar productos..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-[#111] border border-gray-800 rounded-lg pl-12 pr-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-neon-green focus:bg-black/80 transition-all relative z-10"
                        />
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`
                            px-6 py-4 rounded-lg border flex items-center gap-2 font-bold transition-all relative overflow-hidden group
                            ${showFilters ? 'bg-neon-green text-black border-neon-green' : 'bg-[#111] text-gray-300 border-gray-800 hover:border-gray-600'}
                        `}
                    >
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <Filter className="w-5 h-5 relative z-10" />
                        <span className="relative z-10">FILTROS</span>
                    </button>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar / Drawer */}
                    <div className={`
                         fixed inset-0 z-50 bg-[#050505] p-6 overflow-y-auto transition-transform duration-300 ease-in-out lg:static lg:bg-transparent lg:p-0 lg:w-72 lg:block lg:transform-none lg:overflow-visible
                        ${showFilters ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                    `}>
                        <div className="bg-[#111]/80 backdrop-blur-sm rounded-xl p-6 border border-gray-800 sticky top-0 lg:top-32 shadow-2xl min-h-screen lg:min-h-0">
                            <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
                                <h2 className="text-xl font-bold font-graffiti text-white tracking-wide">FILTRAR POR</h2>
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={clearFilters}
                                        className="text-xs text-neon-green hover:text-white transition-colors uppercase tracking-wider font-bold"
                                    >
                                        Limpiar
                                    </button>
                                    {/* Mobile Close Button */}
                                    <button
                                        onClick={() => setShowFilters(false)}
                                        className="lg:hidden text-white hover:text-red-500"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* Categories */}
                            <div className="mb-8">
                                <h3 className="font-bold mb-4 text-drip-yellow text-sm uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-1 h-4 bg-drip-yellow rounded-full"></span>
                                    Categorías
                                </h3>
                                <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent pr-2">
                                    {categories.map(cat => (
                                        <label key={cat.id} className="flex items-center gap-3 cursor-pointer group">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedCategories.includes(cat.id)}
                                                    onChange={() => toggleCategory(cat.id)}
                                                    className="peer sr-only"
                                                />
                                                <div className="w-5 h-5 border-2 border-gray-700 rounded transition-colors peer-checked:bg-neon-green peer-checked:border-neon-green"></div>
                                                <X size={12} className="absolute inset-0 m-auto text-black opacity-0 peer-checked:opacity-100 pointer-events-none" strokeWidth={4} />
                                            </div>
                                            <span className={`text-sm transition-colors ${selectedCategories.includes(cat.id) ? 'text-white font-bold' : 'text-gray-400 group-hover:text-gray-200'}`}>
                                                {cat.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Brands */}
                            <div>
                                <h3 className="font-bold mb-4 text-electric-purple text-sm uppercase tracking-widest flex items-center gap-2">
                                    <span className="w-1 h-4 bg-electric-purple rounded-full"></span>
                                    Marcas
                                </h3>
                                <div className="space-y-2 max-h-64 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent pr-2">
                                    {brands.map(brand => (
                                        <label key={brand.id} className="flex items-center gap-3 cursor-pointer group">
                                            <div className="relative">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedBrands.includes(brand.id)}
                                                    onChange={() => toggleBrand(brand.id)}
                                                    className="peer sr-only"
                                                />
                                                <div className="w-5 h-5 border-2 border-gray-700 rounded transition-colors peer-checked:bg-electric-purple peer-checked:border-electric-purple"></div>
                                                <X size={12} className="absolute inset-0 m-auto text-white opacity-0 peer-checked:opacity-100 pointer-events-none" strokeWidth={4} />
                                            </div>
                                            <span className={`text-sm transition-colors ${selectedBrands.includes(brand.id) ? 'text-white font-bold' : 'text-gray-400 group-hover:text-gray-200'}`}>
                                                {brand.name}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Mobile Apply Button (Optional, but good for UX) */}
                            <button
                                onClick={() => setShowFilters(false)}
                                className="mt-8 w-full lg:hidden bg-neon-green text-black font-bold py-3 rounded-lg uppercase tracking-wider"
                            >
                                Ver Resultados
                            </button>
                        </div>
                    </div>

                    {/* Products Grid */}
                    <div className="flex-grow">
                        {loading ? (
                            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {[...Array(8)].map((_, i) => (
                                    <div key={i} className="bg-gray-900/50 h-[400px] rounded-2xl animate-pulse"></div>
                                ))}
                            </div>
                        ) : (
                            <>
                                <div className="mb-6 flex justify-between items-center bg-[#111] p-4 rounded-xl border border-gray-800">
                                    <span className="text-gray-400 font-mono text-sm">
                                        Mostrando <span className="text-white font-bold">{filteredProducts.length}</span> resultados
                                    </span>
                                </div>

                                {filteredProducts.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center py-32 text-center bg-[#111]/30 rounded-3xl border border-gray-900 border-dashed">
                                        <div className="w-20 h-20 bg-gray-800 rounded-full flex items-center justify-center mb-6">
                                            <SlidersHorizontal className="text-gray-500" size={40} />
                                        </div>
                                        <h3 className="text-2xl font-graffiti text-white mb-2">No se encontraron productos</h3>
                                        <p className="text-gray-500 mb-6 max-w-md">
                                            Intenta ajustar tus filtros o buscar con otros términos.
                                        </p>
                                        <button
                                            onClick={clearFilters}
                                            className="px-6 py-2 bg-neon-green text-black font-bold rounded-lg hover:bg-white transition-colors"
                                        >
                                            Limpiar Filtros
                                        </button>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {filteredProducts.map(product => (
                                            <StandardProductCard
                                                key={product.id}
                                                product={product}
                                                onClick={(e) => {
                                                    // StandardProductCard handles click internally or we can pass onClick
                                                    // StandardProductCard usually takes onClick to open modal
                                                    setSelectedProduct(product);
                                                }}
                                            />
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Modal */}
            {selectedProduct && (
                <StandardProductModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}
        </div>
    );
};

export default CatalogPage;
