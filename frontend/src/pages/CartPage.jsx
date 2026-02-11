import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';
import { useCart } from '../context/CartContext';

const CartPage = () => {
    const { cart, removeFromCart, updateQuantity, getCartTotal, clearCart } = useCart();

    if (cart.length === 0) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-brand-dark text-white">
                <div className="text-center">
                    <ShoppingBag className="w-24 h-24 mx-auto mb-6 text-gray-600" />
                    <h2 className="text-3xl font-graffiti text-brand-green mb-4">Tu carrito está vacío</h2>
                    <p className="text-gray-400 mb-8">¡Agrega algunos productos para comenzar!</p>
                    <Link
                        to="/"
                        className="bg-brand-purple text-white px-8 py-3 rounded-lg font-bold hover:bg-purple-600 transition-all inline-block"
                    >
                        Ir a la tienda
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-dark text-white py-12">
            <div className="max-w-6xl mx-auto px-4">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-graffiti text-brand-green">Carrito de Compras</h1>
                    <button
                        onClick={clearCart}
                        className="text-red-500 hover:text-red-400 text-sm font-bold transition-colors"
                    >
                        Vaciar Carrito
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-4">
                        {cart.map((item) => (
                            <div
                                key={item.id}
                                className="bg-brand-gray rounded-lg p-4 flex gap-4 border border-gray-800 hover:border-brand-green/30 transition-colors"
                            >
                                {/* Image */}
                                <div className="w-24 h-24 flex-shrink-0 bg-black rounded-lg overflow-hidden">
                                    <img
                                        src={item.image_url || 'https://via.placeholder.com/100'}
                                        alt={item.name}
                                        className="w-full h-full object-contain"
                                    />
                                </div>

                                {/* Details */}
                                <div className="flex-grow">
                                    <h3 className="font-bold text-lg mb-1">{item.name}</h3>
                                    <p className="text-sm text-gray-400 mb-2">
                                        {item.brands?.name || 'Sin marca'}
                                    </p>
                                    <p className="text-brand-yellow font-graffiti text-xl">
                                        ${(item.sale_price || item.price).toLocaleString('es-CL')}
                                    </p>
                                </div>

                                {/* Quantity Controls */}
                                <div className="flex flex-col items-end justify-between">
                                    <button
                                        onClick={() => removeFromCart(item.id)}
                                        className="text-red-500 hover:text-red-400 transition-colors"
                                        title="Eliminar"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>

                                    <div className="flex items-center gap-2 bg-black rounded-lg px-3 py-1">
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                            className="text-brand-green hover:text-green-400 transition-colors"
                                        >
                                            <Minus className="w-4 h-4" />
                                        </button>
                                        <span className="font-bold w-8 text-center">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                            className="text-brand-green hover:text-green-400 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <p className="text-sm text-gray-400 mt-2">
                                        Subtotal: <span className="text-white font-bold">
                                            ${((item.sale_price || item.price) * item.quantity).toLocaleString('es-CL')}
                                        </span>
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-brand-gray rounded-lg p-6 border border-gray-800 sticky top-24">
                            <h2 className="text-2xl font-graffiti text-brand-green mb-6">Resumen</h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between text-gray-400">
                                    <span>Subtotal</span>
                                    <span className="text-white font-bold">${getCartTotal().toLocaleString('es-CL')}</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Envío</span>
                                    <span className="text-sm">Calculado en checkout</span>
                                </div>
                                <div className="border-t border-gray-700 pt-3 flex justify-between text-xl font-bold">
                                    <span>Total</span>
                                    <span className="text-brand-yellow font-graffiti">${getCartTotal().toLocaleString('es-CL')}</span>
                                </div>
                            </div>

                            <Link
                                to="/checkout"
                                className="w-full bg-brand-purple text-white py-4 rounded-lg font-bold text-center block hover:bg-purple-600 transition-all shadow-lg hover:shadow-neon-purple mb-3"
                            >
                                Proceder al Pago
                            </Link>

                            <Link
                                to="/"
                                className="w-full bg-transparent border-2 border-brand-green text-brand-green py-3 rounded-lg font-bold text-center block hover:bg-brand-green hover:text-black transition-all"
                            >
                                Continuar Comprando
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CartPage;
