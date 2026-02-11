import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import StandardProductCard from '../Product/StandardProductCard';
import StandardProductModal from '../Product/StandardProductModal';
import { ChevronDown, SlidersHorizontal, Sparkles } from 'lucide-react';

const ToolsZone = () => {
    const [activeCategory, setActiveCategory] = useState('Parafernalia');
    const [products, setProducts] = useState({});
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [page, setPage] = useState(0);
    const ITEMS_PER_PAGE = 10;

    // Categories configuration
    const categories = [
        { id: 'Parafernalia', label: 'PARAFERNALIA', color: 'text-drip-yellow', border: 'border-drip-yellow' },
        { id: 'Bongs', label: 'BONGS', color: 'text-cyan-400', border: 'border-cyan-400' },
        { id: 'Vapos', label: 'VAPOS', color: 'text-blue-400', border: 'border-blue-400' },
        { id: 'Merch420', label: 'MERCH 420', color: 'text-pink-500', border: 'border-pink-500' }
    ];

    useEffect(() => {
        fetchProducts();
    }, [page, activeCategory]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            // Map UI categories to search patterns (searches in PRODUCT NAME)
            const categoryMap = {
                'Parafernalia': 'grinder,moledor,papel,filtro,cenicero,bandeja,encendedor',
                'Bongs': 'bong,pipa,bubbler,vidrio,metal',
                'Vapos': 'vaporiz,vapo,vape',
                'Merch420': 'merch,gorra,polera,sticker'
            };

            const searchPatterns = categoryMap[activeCategory].split(',');

            // Build OR conditions for product name search
            const orConditions = searchPatterns.map(p => `name.ilike.%${p.trim()}%`).join(',');

            const { data, error } = await supabase
                .from('products')
                .select('*, brands(name), categories(name)')
                .or(orConditions)
                .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1)
                .order('price', { ascending: false });

            if (error) {
                console.error('Query error:', error);
            }

            setProducts(prev => ({ ...prev, [activeCategory]: data || [] }));

        } catch (error) {
            console.error('Error fetching tools:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (direction) => {
        if (direction === 'next' && products[activeCategory].length === ITEMS_PER_PAGE) {
            setPage(p => p + 1);
        } else if (direction === 'prev' && page > 0) {
            setPage(p => p - 1);
        }
    };

    return (
        <div className="w-full py-20 bg-[#080808] relative border-t border-gray-900 mt-20">
            {/* Background Effects */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5 pointer-events-none"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none"></div>

            <div className="max-w-[1600px] mx-auto px-4 relative z-10">

                {/* Header with Logo */}
                <div className="text-center mb-12">
                    <div className="inline-block relative group cursor-pointer">
                        {/* Glow Behind Logo */}
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-blue-500/20 blur-[60px] rounded-full animate-pulse group-hover:bg-blue-500/40 transition-all duration-700"></div>

                        <img
                            src="https://i.postimg.cc/QsNj94pw/tools.webp"
                            alt="TOOLS ERROR 420"
                            className="max-h-[180px] md:max-h-[220px] w-auto object-contain drop-shadow-[0_0_15px_rgba(59,130,246,0.5)] transition-transform duration-500 hover:scale-105"
                        />
                    </div>
                </div>

                {/* Category Navigation (Tabs) */}
                <div className="flex flex-wrap justify-center gap-4 mb-12">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => { setActiveCategory(cat.id); setPage(0); }}
                            className={`
                                relative px-6 py-3 rounded-full font-graffiti text-xl tracking-wide transition-all duration-300
                                ${activeCategory === cat.id
                                    ? `bg-gray-900 text-white shadow-[0_0_20px_rgba(255,255,255,0.1)] border border-gray-700 scale-110`
                                    : 'bg-transparent text-gray-500 border border-transparent hover:text-white hover:border-gray-800'
                                }
                            `}
                        >
                            {/* Active Indicator Dot */}
                            {activeCategory === cat.id && (
                                <span className={`absolute -top-1 -right-1 flex h-3 w-3`}>
                                    <span className={`animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75`}></span>
                                    <span className={`relative inline-flex rounded-full h-3 w-3 bg-blue-500`}></span>
                                </span>
                            )}
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* Content Area */}
                <div className="min-h-[400px]">
                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                            {[...Array(ITEMS_PER_PAGE)].map((_, i) => (
                                <div key={i} className="h-[400px] bg-gray-900/50 rounded-2xl animate-pulse"></div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {products[activeCategory]?.length > 0 ? (
                                products[activeCategory].map(product => (
                                    <StandardProductCard
                                        key={product.id}
                                        product={product}
                                        onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }}
                                    />
                                ))
                            ) : (
                                <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-500">
                                    <SlidersHorizontal size={48} className="mb-4 opacity-50" />
                                    <p className="font-graffiti text-2xl">Próximamente...</p>
                                    <p className="font-mono text-sm mt-2">Estamos restockeando esta sección</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Pagination Controls */}
                <div className="flex justify-center items-center gap-8 mt-12">
                    <button
                        onClick={() => handlePageChange('prev')}
                        disabled={page === 0 || loading}
                        className={`text-gray-400 hover:text-white font-graffiti text-xl transition-colors ${page === 0 ? 'opacity-30 cursor-not-allowed' : ''}`}
                    >
                        &lt; ANTERIOR
                    </button>

                    <span className="text-gray-600 font-mono text-sm">PÁGINA {page + 1}</span>

                    <button
                        onClick={() => handlePageChange('next')}
                        disabled={loading || (products[activeCategory]?.length < ITEMS_PER_PAGE)}
                        className={`text-gray-400 hover:text-white font-graffiti text-xl transition-colors ${(products[activeCategory]?.length < ITEMS_PER_PAGE) ? 'opacity-30 cursor-not-allowed' : ''}`}
                    >
                        SIGUIENTE &gt;
                    </button>
                </div>

            </div>

            {/* Product Modal */}
            {selectedProduct && (
                <StandardProductModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}
        </div>
    );
};

export default ToolsZone;
