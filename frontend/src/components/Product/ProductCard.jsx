import { ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';

const ProductCard = ({ product }) => {
    const { addToCart } = useCart();
    const image = product.image_url || 'https://via.placeholder.com/300x300?text=No+Image';

    return (
        <div className="bg-card-gray rounded-xl overflow-hidden shadow-lg border border-gray-800 hover:border-neon-green hover:shadow-[0_0_15px_rgba(57,255,20,0.3)] transition-all duration-300 group flex flex-col h-full hover:scale-105">
            {/* Image Container */}
            <Link to={`/producto/${product.slug}`} className="relative h-64 overflow-hidden bg-black flex items-center justify-center p-4">
                <img
                    src={image}
                    alt={product.name}
                    className="h-full w-full object-contain group-hover:scale-110 transition-transform duration-500"
                />
            </Link>

            {/* Content */}
            <div className="p-4 flex flex-col flex-grow text-center">
                <span className="text-neon-green text-xs font-bold uppercase tracking-wider mb-2">
                    {(product.brands?.name || 'GENERICO').replace('Generico', 'General')}
                </span>

                <h3 className="text-white font-body font-bold text-lg leading-tight mb-4 line-clamp-2 h-12 flex items-center justify-center">
                    {product.name}
                </h3>

                <div className="mt-auto flex flex-col items-center w-full">
                    <div className="mb-4">
                        {product.sale_price && (
                            <span className="text-gray-500 line-through text-sm block mb-1">
                                ${product.price.toLocaleString('es-CL')}
                            </span>
                        )}
                        <span className="text-drip-yellow font-graffiti text-4xl tracking-wide drop-shadow-sm block">
                            ${(product.sale_price || product.price).toLocaleString('es-CL')}
                        </span>
                    </div>

                    <button
                        onClick={() => addToCart(product, 1)}
                        className="w-full bg-electric-purple text-white font-bold uppercase py-2 px-4 rounded-full shadow-[0_0_10px_rgba(147,51,234,0.5)] hover:shadow-[0_0_15px_rgba(147,51,234,0.8)] hover:bg-purple-600 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                        <ShoppingCart className="w-5 h-5" />
                        AÑADIR AL CARRITO
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
