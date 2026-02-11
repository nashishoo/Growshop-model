import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import StandardProductCard from '../Product/StandardProductCard';
import StandardProductModal from '../Product/StandardProductModal';
import { Dna, Timer } from 'lucide-react';

const SeedsCatalog = () => {
    // Independent pagination states
    const [pageAuto, setPageAuto] = useState(0);
    const [pageFem, setPageFem] = useState(0);
    const [products, setProducts] = useState({ auto: [], fem: [] });
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);

    // Limits
    const ITEMS_PER_COL = 6; // Keeping it slightly compact but navigable, as 10 per col is huge.
    // User asked for "10 por fila" (row) which implies width. Since this is 2-col layout, 6-8 is reasonable per side.

    useEffect(() => {
        fetchSeedProducts();
    }, [pageAuto, pageFem]); // Refetch when pages change

    const fetchSeedProducts = async () => {
        setLoading(true);
        try {
            // 1. Fetch Automaticas - search in product name OR category
            const { data: autoData } = await supabase
                .from('products')
                .select('*, brands(name), categories!inner(name)')
                .or('name.ilike.%auto%,name.ilike.%automatica%,categories.name.ilike.%auto%')
                .range(pageAuto * ITEMS_PER_COL, (pageAuto + 1) * ITEMS_PER_COL - 1)
                .order('price', { ascending: false });

            // 1b. Fetch Fillers (General Semillas)
            const { data: autoFillers } = await supabase
                .from('products')
                .select('*, brands(name), categories!inner(name)')
                .ilike('categories.name', '%semilla%')
                .range(pageAuto * ITEMS_PER_COL, (pageAuto + 1) * ITEMS_PER_COL + ITEMS_PER_COL)
                .order('price', { ascending: false });

            // 2. Fetch Feminizadas - search in product name OR category
            const { data: femData } = await supabase
                .from('products')
                .select('*, brands(name), categories!inner(name)')
                .or('name.ilike.%fem%,name.ilike.%feminiz%,name.ilike.%feminizada%,categories.name.ilike.%fem%,categories.name.ilike.%regular%,categories.name.ilike.%feminizada%')
                .range(pageFem * ITEMS_PER_COL, (pageFem + 1) * ITEMS_PER_COL - 1)
                .order('price', { ascending: false });

            // 2b. Fetch Fillers for Fem
            const { data: femFillers } = await supabase
                .from('products')
                .select('*, brands(name), categories!inner(name)')
                .ilike('categories.name', '%semilla%')
                .range(pageFem * ITEMS_PER_COL, (pageFem + 1) * ITEMS_PER_COL + ITEMS_PER_COL)
                .order('price', { ascending: false });

            // MERGE LOGIC: Prioritize Specific -> Fill with Generic -> Deduplicate -> Slice to Limit
            const processColumn = (specific, filler) => {
                const combined = [...(specific || []), ...(filler || [])];
                // Deduplicate by ID
                const unique = Array.from(new Map(combined.map(item => [item.id, item])).values());
                return unique.slice(0, ITEMS_PER_COL);
            };

            setProducts({
                auto: processColumn(autoData, autoFillers),
                fem: processColumn(femData, femFillers)
            });

        } catch (error) {
            console.error('Error fetching seeds:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAutoPage = (direction) => {
        if (direction === 'next' && products.auto.length === ITEMS_PER_COL) setPageAuto(p => p + 1);
        if (direction === 'prev' && pageAuto > 0) setPageAuto(p => p - 1);
    };

    const handleFemPage = (direction) => {
        if (direction === 'next' && products.fem.length === ITEMS_PER_COL) setPageFem(p => p + 1);
        if (direction === 'prev' && pageFem > 0) setPageFem(p => p - 1);
    };

    return (
        <div id="semillas-section" className="w-full pt-20 pb-0 bg-[#050505] relative overflow-hidden border-t border-gray-900">

            {/* Background "Lab" Texture */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>
            <div className="absolute inset-0 bg-gradient-to-b from-black via-transparent to-black pointer-events-none"></div>

            <div className="relative z-10 max-w-[1600px] mx-auto px-4">

                {/* Section Header */}
                <div className="text-center mb-16 relative">
                    <div className="inline-block relative group">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3/4 h-3/4 bg-violet-500/20 blur-[60px] rounded-full animate-pulse group-hover:bg-violet-500/40 transition-all duration-700"></div>
                        <img
                            src="https://i.postimg.cc/gm42j9Xq/zona-genetica.webp"
                            alt="ZONA GENETICA"
                            className="relative mx-auto max-h-[180px] md:max-h-[250px] w-auto object-contain drop-shadow-[0_0_20px_rgba(139,92,246,0.3)] hover:scale-105 transition-transform duration-500"
                        />
                    </div>
                </div>

                {/* Split Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">

                    {/* === Column 1: AUTOMATICAS === */}
                    <div className="relative flex flex-col">
                        <div className="flex items-center gap-4 mb-8 border-b-2 border-violet-500/30 pb-4">
                            <div className="bg-violet-900/20 p-4 rounded-xl border border-violet-500/50 text-violet-400">
                                <Timer size={40} />
                            </div>
                            <div>
                                <h3 className="text-4xl font-graffiti text-white">AUTOMATICAS</h3>
                                <p className="text-violet-400 font-mono text-xs uppercase tracking-widest">RAPIDA FLORACION - CICLO CORTO</p>
                            </div>
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
                            {loading ? (
                                [...Array(4)].map((_, i) => <div key={i} className="h-64 bg-gray-900/50 rounded-xl animate-pulse"></div>)
                            ) : (
                                products.auto.map(product => (
                                    <StandardProductCard
                                        key={product.id}
                                        product={product}
                                        onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }}
                                    />
                                ))
                            )}
                        </div>

                        {/* Auto Controls */}
                        <div className="flex justify-center gap-6 mt-8 py-4 bg-black/20 rounded-xl">
                            <button onClick={() => handleAutoPage('prev')} disabled={pageAuto === 0} className="text-gray-400 hover:text-white disabled:opacity-20 font-graffiti">&lt; ANTERIOR</button>
                            <span className="text-gray-600 font-mono text-sm">{pageAuto + 1}</span>
                            <button onClick={() => handleAutoPage('next')} disabled={products.auto.length < ITEMS_PER_COL} className="text-gray-400 hover:text-white disabled:opacity-20 font-graffiti">SIGUIENTE &gt;</button>
                        </div>
                    </div>

                    {/* === Column 2: FEMINIZADAS === */}
                    <div className="relative flex flex-col">
                        <div className="flex items-center gap-4 mb-8 border-b-2 border-indigo-500/30 pb-4 justify-end lg:flex-row-reverse text-right">
                            <div className="bg-indigo-900/20 p-4 rounded-xl border border-indigo-500/50 text-indigo-400">
                                <Dna size={40} />
                            </div>
                            <div>
                                <h3 className="text-4xl font-graffiti text-white">FEMINIZADAS</h3>
                                <p className="text-indigo-400 font-mono text-xs uppercase tracking-widest">GENETICA ESTABLE - MAYOR ALCANCE</p>
                            </div>
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 flex-1">
                            {loading ? (
                                [...Array(4)].map((_, i) => <div key={i} className="h-64 bg-gray-900/50 rounded-xl animate-pulse"></div>)
                            ) : (
                                products.fem.map(product => (
                                    <StandardProductCard
                                        key={product.id}
                                        product={product}
                                        onClick={(e) => { e.stopPropagation(); setSelectedProduct(product); }}
                                    />
                                ))
                            )}
                        </div>

                        {/* Fem Controls */}
                        <div className="flex justify-center gap-6 mt-8 py-4 bg-black/20 rounded-xl">
                            <button onClick={() => handleFemPage('prev')} disabled={pageFem === 0} className="text-gray-400 hover:text-white disabled:opacity-20 font-graffiti">&lt; ANTERIOR</button>
                            <span className="text-gray-600 font-mono text-sm">{pageFem + 1}</span>
                            <button onClick={() => handleFemPage('next')} disabled={products.fem.length < ITEMS_PER_COL} className="text-gray-400 hover:text-white disabled:opacity-20 font-graffiti">SIGUIENTE &gt;</button>
                        </div>
                    </div>
                </div>

                {/* Center Connector (Desktop Only visual) - Absolute to avoid layout gaps */}
                <div className="hidden lg:flex absolute top-0 left-1/2 -translate-x-1/2 h-full w-px bg-gradient-to-b from-transparent via-violet-900/50 to-transparent pointer-events-none z-0"></div>

            </div>

            {/* Modal */}
            {selectedProduct && <StandardProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />}
        </div>
    );
};

export default SeedsCatalog;
