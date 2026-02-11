import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import { ChevronRight, ChevronLeft, Sparkles, Flame } from 'lucide-react';
import FeaturedProductModal from './FeaturedProductModal';

const FeaturedCarousel = () => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const scrollRef = useRef(null);

    useEffect(() => {
        fetchFeaturedProducts();
    }, []);

    const fetchFeaturedProducts = async () => {
        try {
            // Fetching products from a category likely to have good images, e.g., 'Semillas' or just active ones
            // As per user request: "anexar los productos de la categoria Semillas"

            // First find the category ID for 'Semillas' if needed, or just fetch generic
            // For now, let's fetch products that are active. Ideally filter by category 'Semillas' if we knew the ID,
            // but fetching 'is_active' rows is safer to get data quickly.
            // Let's try to join with category if possible, or just fetch 10 items.

            // To be specific to "Semillas" as requested:
            const { data: categoryData } = await supabase
                .from('categories')
                .select('id')
                .ilike('name', '%Semillas%')
                .maybeSingle();

            let query = supabase.from('products').select('*, brand:brands(name), category:categories(name)').eq('is_active', true);

            if (categoryData) {
                query = query.eq('category_id', categoryData.id);
            }

            const { data, error } = await query.limit(8);

            if (error) throw error;
            setProducts(data || []);
        } catch (error) {
            console.error('Error fetching featured products:', error);
        } finally {
            setLoading(false);
        }
    };

    const scroll = (direction) => {
        const { current } = scrollRef;
        if (current) {
            const scrollAmount = current.clientWidth / 2;
            current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    if (loading) return <div className="h-64 flex items-center justify-center text-neon-green font-graffiti animate-pulse">Cargando Hits...</div>;
    if (products.length === 0) return null;

    return (
        <div className="w-full relative pt-2 pb-12">

            {/* Section Title - VIP Graffiti Style */}
            <div className="text-center mb-10 relative flex justify-center items-center py-4">
                {/* Back Glow - Pulse */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-neon-green/40 blur-[80px] rounded-full animate-pulse -z-10"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-24 bg-electric-purple/30 blur-[50px] rounded-full -z-10 mix-blend-screen"></div>

                <img
                    src="https://i.postimg.cc/9Q7Z1x30/destacados-section.webp"
                    alt="DESTACADOS VIP"
                    className="max-h-[220px] w-auto drop-shadow-[0_0_15px_rgba(255,255,255,0.2)] filter transition-all duration-500 hover:scale-110 hover:drop-shadow-[0_0_30px_rgba(91,197,0,0.6)]"
                />
            </div>

            {/* Carousel Container */}
            <div className="relative max-w-[1600px] mx-auto group/carousel">

                {/* Cards Scroll Area */}
                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto gap-8 pb-4 pt-8 scrollbar-hide snap-x snap-mandatory px-4 md:px-8"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {products.map((product) => (
                        <div key={product.id} className="flex-shrink-0 w-full md:w-[400px] snap-center">
                            <div
                                onClick={() => setSelectedProduct(product)}
                                className="block h-full group perspective-1000 cursor-pointer"
                            >
                                {/* Card Body - "Marijuana World" Aesthetics */}
                                <div className="relative bg-[#111] h-[550px] rounded-[30px] border-4 border-gray-800 group-hover:border-neon-green transition-all duration-500 transform group-hover:-translate-y-4 group-hover:rotate-1 shadow-[0_10px_30px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_50px_rgba(57,255,20,0.4)] overflow-hidden flex flex-col">

                                    {/* Smoke/Haze Background Effect */}
                                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-20 mix-blend-overlay"></div>
                                    <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-neon-green/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                                    {/* Badge (Dynamic if stock < 5 or Random) */}
                                    <div className="absolute top-4 right-4 z-20 bg-drip-yellow text-black font-graffiti text-xl px-4 py-1 rotate-3 shadow-[5px_5px_0_rgba(0,0,0,0.5)] border-2 border-black">
                                        LO MEJOR
                                    </div>

                                    {/* Image Area with "Holy Light" Glow */}
                                    <div className="h-[60%] flex items-center justify-center p-8 relative">
                                        <div className="absolute inset-0 bg-neon-green/10 rounded-full filter blur-[60px] transform scale-50 group-hover:scale-110 transition-transform duration-700 ease-in-out"></div>
                                        <img
                                            src={product.image_url || 'https://via.placeholder.com/150'}
                                            alt={product.name}
                                            className="w-full h-full object-contain relative z-10 drop-shadow-[0_10px_20px_rgba(0,0,0,0.8)] transform group-hover:scale-110 transition-transform duration-500"
                                        />
                                    </div>

                                    {/* Info Area */}
                                    <div className="h-[40%] bg-zinc-900/90 backdrop-blur-sm border-t-2 border-gray-800 group-hover:border-neon-green/50 p-6 flex flex-col justify-between relative z-20">

                                        <div>
                                            <div className="flex items-center gap-2 mb-2 text-gray-400 text-sm font-bold uppercase tracking-wider">
                                                <Sparkles size={16} className="text-electric-purple" />
                                                <span className="text-electric-purple">{product.category?.name || 'GENÉTICA'}</span>
                                            </div>
                                            <h3 className="text-3xl font-graffiti text-white leading-none tracking-wide text-stroke-thin mb-2 group-hover:text-neon-green transition-colors line-clamp-2">
                                                {product.name}
                                            </h3>
                                        </div>

                                        <div className="flex items-center justify-between mt-4">
                                            <div className="text-drip-yellow font-graffiti text-4xl drop-shadow-md">
                                                ${parseInt(product.price).toLocaleString('es-CL')}
                                            </div>
                                            <div className="bg-black p-3 rounded-full border-2 border-gray-700 group-hover:border-neon-green group-hover:bg-neon-green group-hover:text-black transition-all duration-300">
                                                <Flame size={24} />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Modern Bottom Controls */}
                <div className="flex items-center justify-center gap-8 mt-10 px-4">

                    {/* Retro 'PREV' Button */}
                    <button
                        onClick={() => scroll('left')}
                        className="group flex items-center gap-2 text-gray-500 hover:text-white transition-colors"
                    >
                        <div className="w-12 h-12 rounded-full border-2 border-gray-700 group-hover:border-neon-green flex items-center justify-center transition-all group-hover:bg-neon-green group-hover:text-black">
                            <ChevronLeft size={24} strokeWidth={3} />
                        </div>
                        <span className="font-graffiti text-xl hidden md:block">ANT.</span>
                    </button>

                    {/* Progress Bar / Decor */}
                    <div className="h-1 w-32 md:w-64 bg-gray-800 rounded-full overflow-hidden relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-neon-green to-transparent w-1/2 animate-[shimmer_2s_infinite]"></div>
                    </div>

                    {/* Retro 'NEXT' Button */}
                    <button
                        onClick={() => scroll('right')}
                        className="group flex items-center gap-2 text-gray-500 hover:text-white transition-colors flex-row-reverse"
                    >
                        <div className="w-12 h-12 rounded-full border-2 border-gray-700 group-hover:border-neon-green flex items-center justify-center transition-all group-hover:bg-neon-green group-hover:text-black">
                            <ChevronRight size={24} strokeWidth={3} />
                        </div>
                        <span className="font-graffiti text-xl hidden md:block">SIG.</span>
                    </button>

                </div>
            </div>

            {/* CSS to hide scrollbar */}
            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .text-stroke-thin {
                     -webkit-text-stroke: 1px black;
                }
            `}</style>

            {/* Featured Product Modal */}
            {selectedProduct && (
                <FeaturedProductModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}
        </div>
    );
};

export default FeaturedCarousel;
