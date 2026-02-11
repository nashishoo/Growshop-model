import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import StandardProductCard from '../Product/StandardProductCard';
import StandardProductModal from '../Product/StandardProductModal';
import { Zap, Leaf, Droplets } from 'lucide-react';

const SECTIONS = [
    {
        id: 'indoor',
        title: 'INDOOR',
        icon: Zap,
        color: 'text-cyan-400',
        borderColor: 'border-cyan-400'
    },
    {
        id: 'sustratos',
        title: 'SUSTRATOS',
        icon: Leaf,
        color: 'text-drip-yellow',
        borderColor: 'border-drip-yellow'
    },
    {
        id: 'nutrientes',
        title: 'NUTRIENTES',
        icon: Droplets,
        color: 'text-electric-purple',
        borderColor: 'border-electric-purple'
    }
];

const CultivationZone = () => {
    const [activeSection, setActiveSection] = useState('indoor');
    const [products, setProducts] = useState({ indoor: [], sustratos: [], nutrientes: [] });
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const [page, setPage] = useState(0);
    const ITEMS_PER_PAGE = 10;

    useEffect(() => {
        fetchZoneProducts();
    }, [page, activeSection]); // Re-fetch on page or section change

    const fetchZoneProducts = async () => {
        setLoading(true);
        try {
            // Map section IDs to category search patterns
            // This allows matching against existing categories
            const categoryMap = {
                indoor: 'indoor,iluminación,control de clima,extracción',
                sustratos: 'sustrato',
                nutrientes: 'nutriente,fertilizante'
            };

            const searchPatterns = categoryMap[activeSection].split(',');

            // Build OR query for multiple category patterns
            let query = supabase
                .from('products')
                .select('*, brands(name), categories!inner(name)');

            // Use .or() with multiple ilike conditions
            const orConditions = searchPatterns.map(p => `name.ilike.%${p.trim()}%`).join(',');

            const { data } = await query
                .or(orConditions, { foreignTable: 'categories' })
                .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1)
                .order('price', { ascending: false });

            setProducts(prev => ({ ...prev, [activeSection]: data || [] }));

        } catch (error) {
            console.error('Error fetching zone products:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (direction) => {
        if (direction === 'next' && products[activeSection].length === ITEMS_PER_PAGE) {
            setPage(p => p + 1);
        } else if (direction === 'prev' && page > 0) {
            setPage(p => p - 1);
        }
    };

    return (
        <div className="w-full py-16 bg-[#090909] relative border-t border-gray-900">
            <div className="max-w-[1600px] mx-auto px-4">

                {/* 1. Header: High Res Logo with Glow Effects */}
                <div className="text-center mb-10 relative flex justify-center items-center py-4">
                    {/* Back Glow - Pulse */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-neon-green/30 blur-[80px] rounded-full animate-pulse -z-10"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-24 bg-electric-purple/20 blur-[50px] rounded-full -z-10 mix-blend-screen"></div>

                    <img
                        src="https://i.postimg.cc/MT0ZPQ5C/zona-cultivo-(1).webp"
                        alt="ZONA DE CULTIVO"
                        className="mx-auto max-h-[160px] md:max-h-[220px] w-auto object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] filter transition-all duration-500 hover:scale-110 hover:drop-shadow-[0_0_30px_rgba(57,255,20,0.6)]"
                    />
                </div>

                {/* 2. Navigation Tabs (Simple Buttons) */}
                <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 mb-12">
                    {SECTIONS.map((section) => (
                        <button
                            key={section.id}
                            onClick={() => { setActiveSection(section.id); setPage(0); }}
                            className={`
                                relative px-8 py-3 rounded-2xl text-xl md:text-2xl font-graffiti tracking-wider transition-all duration-300
                                ${activeSection === section.id
                                    ? `border-2 ${section.borderColor} ${section.color} bg-white/5 shadow-[0_0_15px_rgba(0,0,0,0.3)] scale-105`
                                    : 'text-gray-600 hover:text-gray-300 border-2 border-transparent'
                                }
                            `}
                        >
                            {section.title}
                        </button>
                    ))}
                </div>

                {/* 3. Products Grid Content */}
                <div className="min-h-[400px] animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 md:gap-6">
                        {loading ? (
                            [...Array(ITEMS_PER_PAGE)].map((_, i) => (
                                <div key={i} className="h-[350px] bg-gray-900/50 rounded-xl animate-pulse"></div>
                            ))
                        ) : (
                            products[activeSection]?.map(product => (
                                <StandardProductCard
                                    key={product.id}
                                    product={product}
                                    onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }}
                                />
                            ))
                        )}

                        {/* Empty State */}
                        {!loading && products[activeSection]?.length === 0 && (
                            <div className="col-span-full text-center py-20">
                                <p className="text-gray-500 text-xl font-graffiti">Zona en mantenimiento...</p>
                                <p className="text-gray-700 text-sm mt-2">Pronto más stock de {activeSection}</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* 4. Pagination Controls */}
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
                        disabled={loading || (products[activeSection]?.length < ITEMS_PER_PAGE)}
                        className={`text-gray-400 hover:text-white font-graffiti text-xl transition-colors ${(products[activeSection]?.length < ITEMS_PER_PAGE) ? 'opacity-30 cursor-not-allowed' : ''}`}
                    >
                        SIGUIENTE &gt;
                    </button>
                </div>

            </div>

            {/* Modal for Product Selection */}
            {selectedProduct && <StandardProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
        </div>
    );
};

export default CultivationZone;
