import React, { useState } from 'react';
import { X, ShoppingCart, Truck, Check } from 'lucide-react';
import { useCart } from '../../context/CartContext';

const StandardProductModal = ({ product, onClose }) => {
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
            {/* Increased max-width from 3xl to 5xl for a larger modal */}
            <div className="relative w-full max-w-5xl bg-[#111] border border-gray-700 rounded-2xl shadow-2xl overflow-hidden flex flex-col md:flex-row animate-in zoom-in-95 duration-200" onClick={(e) => e.stopPropagation()}>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 text-gray-400 hover:text-white bg-black/50 hover:bg-black/80 p-2 rounded-full transition-all"
                >
                    <X size={24} />
                </button>

                {/* Image Section */}
                <div className="w-full md:w-1/2 bg-[#0a0a0a] p-8 flex items-center justify-center relative">
                    <img
                        src={imageUrl}
                        alt={product.name}
                        className="w-full max-h-[400px] object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.1)] transition-transform duration-500 hover:scale-105"
                    />
                </div>

                {/* Details Section */}
                <div className="w-full md:w-1/2 p-6 md:p-10 flex flex-col bg-[#111]">
                    {/* Brand Badge */}
                    {product.brands?.name && (
                        <span className="inline-block px-3 py-1 bg-gray-900 border border-gray-700 rounded-full text-xs font-bold text-gray-300 uppercase tracking-widest mb-4 w-fit">
                            {product.brands.name}
                        </span>
                    )}

                    <h2 className="text-4xl font-graffiti text-white leading-none mb-4">
                        {product.name}
                    </h2>

                    <div className="text-3xl font-bold text-drip-yellow mb-6">
                        ${product.price?.toLocaleString('es-CL')}
                    </div>

                    <p className="text-gray-400 text-sm leading-relaxed mb-8 border-l-2 border-neon-green/30 pl-4 h-[120px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-700">
                        {product.description || "Descripción no disponible para este producto."}
                    </p>

                    <div className="mt-auto space-y-4">
                        {/* Quantity & Add Row */}
                        <div className="flex gap-4 h-12">
                            {/* Quantity Selector */}
                            <div className="flex items-center bg-gray-900 rounded-xl border border-gray-700 overflow-hidden shrink-0">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-12 h-full flex items-center justify-center text-white hover:bg-gray-800 transition-colors text-xl font-bold"
                                >
                                    -
                                </button>
                                <span className="w-12 text-center text-white font-bold text-lg border-x border-gray-800 flex items-center justify-center h-full">
                                    {quantity}
                                </span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-12 h-full flex items-center justify-center text-white hover:bg-gray-800 transition-colors text-xl font-bold"
                                >
                                    +
                                </button>
                            </div>

                            {/* Add Cart Button */}
                            <button
                                onClick={handleAddToCart}
                                disabled={isAdded}
                                className={`flex-1 rounded-xl font-bold uppercase tracking-wide transition-all duration-300 flex items-center justify-center gap-2
                                    ${isAdded
                                        ? 'bg-green-600 text-white border border-green-500'
                                        : 'bg-neon-green text-black hover:bg-white border border-neon-green hover:border-white'
                                    }`}
                            >
                                {isAdded ? (<> <Check size={20} /> Agregado </>) : (<> <ShoppingCart size={20} /> Agregar </>)}
                            </button>
                        </div>

                        <div className="flex items-center justify-center gap-2 text-gray-500 text-xs uppercase tracking-wider pt-2">
                            <Truck size={14} />
                            <span>Envío calculado en checkout</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Backdrop click to close */}
            <div className="absolute inset-0 -z-10" onClick={onClose}></div>
        </div>
    );
};

export default StandardProductModal;
