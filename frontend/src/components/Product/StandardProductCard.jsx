import React from 'react';
import { ShoppingCart } from 'lucide-react';

const StandardProductCard = ({ product, onClick }) => {
    // Determine image URL with null check
    const imageUrl = product.image_url
        ? (product.image_url.startsWith('http')
            ? product.image_url
            : `${import.meta.env.VITE_SUPABASE_URL}/storage/v1/object/public/products/${product.image_url}`)
        : 'https://placehold.co/400x400/111/333?text=Sin+Imagen';

    return (
        <div
            onClick={onClick}
            className="group relative bg-[#111] border border-gray-800 rounded-xl overflow-hidden cursor-pointer transition-all duration-500 transform hover:-translate-y-2 hover:border-neon-green hover:shadow-[0_0_30px_rgba(57,255,20,0.3)] flex flex-col h-full"
        >
            {/* Image Container with Inner Glow */}
            <div className="relative h-[250px] p-4 flex items-center justify-center bg-[#050505] overflow-hidden">

                {/* Background Glow Effect - Visible on Hover */}
                <div className="absolute inset-0 bg-gradient-radial from-neon-green/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl scale-150"></div>

                {/* Product Image */}
                <img
                    src={imageUrl}
                    alt={product.name}
                    className="w-full h-full object-contain drop-shadow-lg transform transition-transform duration-500 group-hover:scale-110 relative z-10"
                />

                {/* Brand Badge */}
                {product.brands?.name && (
                    <span className="absolute top-3 right-3 bg-black/80 backdrop-blur-sm border border-gray-700 text-gray-300 text-[10px] font-bold px-2 py-1 rounded uppercase tracking-wider z-20 group-hover:border-neon-green/50 transition-colors">
                        {product.brands.name}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="p-4 flex flex-col flex-1 border-t border-gray-800 group-hover:border-neon-green/30 transition-colors bg-[#111] relative z-20">
                <h3 className="text-white font-graffiti text-lg leading-tight mb-2 group-hover:text-neon-green transition-colors line-clamp-2">
                    {product.name}
                </h3>

                <div className="mt-auto flex items-end justify-between">
                    <div className="text-drip-yellow font-bold text-xl drop-shadow-[0_2px_2px_rgba(0,0,0,0.8)]">
                        ${product.price?.toLocaleString('es-CL')}
                    </div>

                    {/* Add Button - Transitions from Grey to Neon */}
                    <button className="w-10 h-10 rounded-lg bg-gray-900 text-white border border-gray-700 flex items-center justify-center group-hover:bg-neon-green group-hover:text-black group-hover:border-neon-green group-hover:shadow-[0_0_15px_rgba(57,255,20,0.5)] transition-all duration-300">
                        <ShoppingCart size={18} />
                    </button>
                </div>
            </div>

            {/* Outer Glow Overlay (Subtle) */}
            <div className="absolute inset-0 border-2 border-transparent group-hover:border-neon-green/20 rounded-xl pointer-events-none transition-all duration-500"></div>
        </div>
    );
};

export default StandardProductCard;
