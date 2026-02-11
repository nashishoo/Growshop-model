import React, { useState } from 'react';
import { X, ShoppingCart, Sparkles, Truck, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const FeaturedProductModal = ({ product, onClose }) => {
    const { addToCart } = useCart();
    const [isAdded, setIsAdded] = useState(false);
    const [quantity, setQuantity] = useState(1);

    if (!product) return null;

    const handleAddToCart = (e) => {
        e.stopPropagation();
        addToCart(product, quantity);
        setIsAdded(true);
        setTimeout(() => setIsAdded(false), 2000);
    };

    const imageUrl = product.image_url.startsWith('http')
        ? product.image_url
        : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/products/${product.image_url}`;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
            <div className="relative w-full max-w-6xl bg-[#111] rounded-[30px] border-4 border-neon-green/50 shadow-[0_0_50px_rgba(57,255,20,0.3)] overflow-hidden flex flex-col md:flex-row animate-in fade-in zoom-in duration-300">

                {/* Close Button - Optimized for mobile */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 text-white hover:text-neon-green bg-black/50 hover:bg-black p-2 rounded-full transition-all border border-transparent hover:border-neon-green"
                >
                    <X size={32} />
                </button>

                {/* Left Side - Image & Visuals */}
                <div className="w-full md:w-1/2 bg-[#050505] relative overflow-hidden group">
                    {/* Background Effects */}
                    <div className="absolute inset-0 bg-[url('/assets/smoke-overlay.png')] opacity-30 mix-blend-screen animate-pulse"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-gradient-radial from-neon-green/10 to-transparent opacity-50 blur-[100px]"></div>

                    <div className="relative h-full w-full flex items-center justify-center p-8 md:p-12">
                        <img
                            src={imageUrl}
                            alt={product.name}
                            className="w-full max-h-[400px] md:max-h-[500px] object-contain drop-shadow-[0_0_30px_rgba(57,255,20,0.4)] transition-transform duration-700 hover:scale-110 hover:rotate-3"
                        />
                    </div>

                    {/* Badge */}
                    <div className="absolute top-6 left-6">
                        <span className="bg-neon-green text-black font-graffiti text-xl px-4 py-1 -skew-x-12 inline-block border-2 border-white shadow-[0_0_15px_rgba(57,255,20,0.6)]">
                            VIP SELECTION
                        </span>
                    </div>
                </div>

                {/* Right Side - Info */}
                <div className="w-full md:w-1/2 p-6 md:p-12 flex flex-col relative bg-[#111]">

                    <div className="mb-2">
                        <span className="text-gray-400 uppercase tracking-[0.2em] text-sm font-bold">{product.brands?.name || 'GENERIC'}</span>
                    </div>

                    <h2 className="text-4xl md:text-5xl font-graffiti text-white leading-none text-stroke-thin mb-2">
                        {product.name}
                    </h2>

                    <div className="flex items-center gap-4 mb-6">
                        <span className="text-3xl font-bold text-drip-yellow drop-shadow-[0_2px_4px_rgba(0,0,0,1)]">
                            ${product.price?.toLocaleString('es-CL')}
                        </span>
                        {product.oldPrice && (
                            <span className="text-xl text-gray-600 line-through decoration-red-500 decoration-2">
                                ${product.oldPrice}
                            </span>
                        )}
                    </div>

                    {/* Description Scrollable */}
                    <div className="flex-1 overflow-y-auto pr-2 max-h-[200px] mb-8 scrollbar-thin scrollbar-thumb-neon-green scrollbar-track-gray-900">
                        <p className="text-gray-300 leading-relaxed font-body">
                            {product.description || "Producto de alta calidad seleccionado especialmente para cultivadores exigentes. Potencia, sabor y rendimiento garantizados."}
                        </p>
                    </div>

                    {/* Actions Area */}
                    <div className="mt-auto flex flex-col gap-4">

                        {/* Quantity & Add Button Row */}
                        <div className="flex gap-4 h-14">
                            {/* Quantity Selector */}
                            <div className="flex items-center bg-gray-900 rounded-xl border border-gray-700 overflow-hidden shrink-0">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-12 h-full flex items-center justify-center text-white hover:bg-gray-800 transition-colors text-2xl font-bold"
                                >
                                    -
                                </button>
                                <span className="w-12 text-center text-white font-bold text-xl flex items-center justify-center h-full border-x border-gray-800">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-12 h-full flex items-center justify-center text-white hover:bg-gray-800 transition-colors text-2xl font-bold"
                                >
                                    +
                                </button>
                            </div>

                            {/* Add to Cart Button */}
                            <button
                                onClick={handleAddToCart}
                                disabled={isAdded}
                                className={`flex-1 rounded-xl font-bold text-lg uppercase tracking-wide transition-all duration-300 flex items-center justify-center gap-2
                                    ${isAdded
                                        ? 'bg-green-600 text-white border-2 border-green-500 shadow-[0_0_20px_rgba(0,255,0,0.5)]'
                                        : 'bg-neon-green text-black border-2 border-neon-green hover:bg-black hover:text-neon-green hover:shadow-[0_0_20px_rgba(57,255,20,0.4)]'
                                    }`}
                            >
                                {isAdded ? (<> <Check size={24} /> Agregado </>) : (<> <ShoppingCart size={24} /> Agregar </>)}
                            </button>
                        </div>
                    </div>

                    {/* Security Badges */}
                    <div className="mt-6 pt-6 border-t border-gray-800 flex justify-between text-gray-500 text-xs text-center">
                        <div className="flex items-center gap-2">
                            <Truck size={16} /> Envío Discreto
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div> Stock Disponible
                        </div>
                    </div>

                </div>
            </div>

            {/* Backdrop click to close */}
            <div className="absolute inset-0 -z-10" onClick={onClose}></div>
        </div>
    );
};

export default FeaturedProductModal;
