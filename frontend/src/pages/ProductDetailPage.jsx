import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, ArrowLeft, Flame } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { useCart } from '../context/CartContext';

const ProductDetailPage = () => {
    const { slug } = useParams();
    const navigate = useNavigate();
    const { addToCart } = useCart();
    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState('descripcion');

    useEffect(() => {
        fetchProduct();
    }, [slug]);

    const fetchProduct = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select(`
          *,
          brands (name),
          categories (name)
        `)
                .eq('slug', slug)
                .eq('is_active', true)
                .single();

            if (error) throw error;
            setProduct(data);
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (product) {
            addToCart(product, quantity);
            // Optional: Show success message or redirect
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-dark flex items-center justify-center">
                <div className="text-white text-2xl font-graffiti">Cargando producto...</div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-brand-dark flex items-center justify-center text-white">
                <div className="text-center">
                    <h2 className="text-3xl font-graffiti text-brand-green mb-4">Producto no encontrado</h2>
                    <Link to="/catalogo" className="text-brand-purple hover:text-purple-400 underline">
                        Volver al catálogo
                    </Link>
                </div>
            </div>
        );
    }

    const price = product.sale_price || product.price;

    return (
        <div className="min-h-screen bg-brand-dark text-white py-8">
            <div className="max-w-7xl mx-auto px-4">
                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-gray-400 hover:text-brand-green transition-colors mb-6"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Volver
                </button>

                {/* Main Product Container - Mockup Style */}
                <div className="relative bg-gradient-to-br from-brand-gray via-black to-brand-gray rounded-3xl p-1 shadow-[0_0_50px_rgba(57,255,20,0.3),0_0_100px_rgba(191,0,255,0.2)]">
                    <div className="bg-black rounded-3xl overflow-hidden">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 p-8 lg:p-12">

                            {/* Left Side - Product Image */}
                            <div className="relative flex items-center justify-center">
                                {/* Smoke/Dark Background Effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900 opacity-50 rounded-2xl"></div>
                                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZmlsdGVyIGlkPSJub2lzZSI+PGZlVHVyYnVsZW5jZSB0eXBlPSJmcmFjdGFsTm9pc2UiIGJhc2VGcmVxdWVuY3k9IjAuOCIgbnVtT2N0YXZlcz0iNCIvPjwvZmlsdGVyPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbHRlcj0idXJsKCNub2lzZSkiIG9wYWNpdHk9IjAuMSIvPjwvc3ZnPg==')] opacity-30"></div>

                                <img
                                    src={product.image_url || 'https://via.placeholder.com/500x500?text=Sin+Imagen'}
                                    alt={product.name}
                                    className="relative z-10 max-h-[500px] w-auto object-contain drop-shadow-2xl"
                                />
                            </div>

                            {/* Right Side - Product Info */}
                            <div className="flex flex-col justify-center space-y-6">
                                {/* Product Name - Graffiti Style */}
                                <h1 className="text-5xl md:text-6xl font-graffiti leading-tight text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.3)]">
                                    {product.name}
                                </h1>

                                {/* Brand Badge */}
                                {product.brands && (
                                    <div className="inline-block">
                                        <span className="bg-brand-gray border border-brand-green text-brand-green px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider">
                                            {product.brands.name}
                                        </span>
                                    </div>
                                )}

                                {/* Price - Yellow Drip Effect */}
                                <div className="relative inline-block">
                                    <div className="text-5xl md:text-8xl font-graffiti text-brand-yellow drop-shadow-[0_5px_15px_rgba(255,240,31,0.5)]">
                                        ${price.toLocaleString('es-CL')}
                                    </div>
                                    {/* Drip SVG Effect */}
                                    <svg className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 w-32 h-8" viewBox="0 0 100 30" fill="none">
                                        <path d="M20 0 Q20 15, 15 25 L25 25 Q20 15, 20 0" fill="#fff01f" opacity="0.8" />
                                        <path d="M50 0 Q50 20, 45 30 L55 30 Q50 20, 50 0" fill="#fff01f" opacity="0.8" />
                                        <path d="M80 0 Q80 15, 75 25 L85 25 Q80 15, 80 0" fill="#fff01f" opacity="0.8" />
                                    </svg>
                                </div>

                                {/* Quantity Selector */}
                                <div className="flex items-center gap-4">
                                    <span className="text-gray-400">Cantidad:</span>
                                    <div className="flex items-center gap-3 bg-brand-gray rounded-lg px-4 py-2 border border-gray-700">
                                        <button
                                            onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                            className="text-brand-green hover:text-green-400 font-bold text-xl w-8"
                                        >
                                            -
                                        </button>
                                        <span className="font-bold text-xl w-12 text-center">{quantity}</span>
                                        <button
                                            onClick={() => setQuantity(quantity + 1)}
                                            className="text-brand-green hover:text-green-400 font-bold text-xl w-8"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>

                                {/* Add to Cart Button - Purple Neon */}
                                <button
                                    onClick={handleAddToCart}
                                    className="group relative bg-brand-purple hover:bg-purple-600 text-white font-graffiti text-2xl md:text-3xl py-6 px-8 rounded-2xl transition-all duration-300 shadow-[0_0_30px_rgba(191,0,255,0.6)] hover:shadow-[0_0_50px_rgba(191,0,255,0.9)] transform hover:scale-105 active:scale-95"
                                >
                                    <span className="flex items-center justify-center gap-3">
                                        AÑADIR AL CARRO
                                        <Flame className="w-8 h-8 group-hover:animate-pulse" />
                                    </span>
                                </button>

                                {/* Tabs - Description & Specs */}
                                <div className="mt-8">
                                    <div className="flex gap-4 mb-4">
                                        <button
                                            onClick={() => setActiveTab('descripcion')}
                                            className={`px-6 py-3 rounded-lg font-bold transition-all ${activeTab === 'descripcion'
                                                ? 'bg-transparent border-2 border-brand-green text-brand-green shadow-[0_0_15px_rgba(57,255,20,0.5)]'
                                                : 'bg-brand-gray border-2 border-gray-700 text-gray-400 hover:border-brand-green/50'
                                                }`}
                                        >
                                            DESCRIPCIÓN
                                        </button>
                                        <button
                                            onClick={() => setActiveTab('ficha')}
                                            className={`px-6 py-3 rounded-lg font-bold transition-all ${activeTab === 'ficha'
                                                ? 'bg-transparent border-2 border-brand-green text-brand-green shadow-[0_0_15px_rgba(57,255,20,0.5)]'
                                                : 'bg-brand-gray border-2 border-gray-700 text-gray-400 hover:border-brand-green/50'
                                                }`}
                                        >
                                            FICHA TÉCNICA
                                        </button>
                                    </div>

                                    {/* Tab Content */}
                                    <div className="bg-brand-gray/50 rounded-lg p-6 border border-gray-800 min-h-[150px]">
                                        {activeTab === 'descripcion' ? (
                                            <div className="text-gray-300 leading-relaxed">
                                                {product.description || (
                                                    <p className="text-gray-500 italic">
                                                        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                                                    </p>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="space-y-2 text-gray-300">
                                                <div className="flex justify-between border-b border-gray-700 pb-2">
                                                    <span className="text-gray-400">Categoría:</span>
                                                    <span className="font-bold">{product.categories?.name || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-gray-700 pb-2">
                                                    <span className="text-gray-400">Marca:</span>
                                                    <span className="font-bold">{product.brands?.name || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between border-b border-gray-700 pb-2">
                                                    <span className="text-gray-400">SKU:</span>
                                                    <span className="font-bold">{product.sku || 'N/A'}</span>
                                                </div>
                                                <div className="flex justify-between">
                                                    <span className="text-gray-400">Stock:</span>
                                                    <span className="font-bold text-brand-green">Disponible</span>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductDetailPage;
