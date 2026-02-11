import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { CheckCircle, Package, MapPin, Phone, Mail } from 'lucide-react';

const OrderConfirmationPage = () => {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchOrder();
    }, [orderId]);

    const fetchOrder = async () => {
        try {
            // Fetch order
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .select('*')
                .eq('id', orderId)
                .single();

            if (orderError) throw orderError;
            setOrder(orderData);

            // Fetch order items
            const { data: itemsData, error: itemsError } = await supabase
                .from('order_items')
                .select('*')
                .eq('order_id', orderId);

            if (itemsError) throw itemsError;
            setOrderItems(itemsData);

        } catch (error) {
            console.error('Error fetching order:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-dark flex items-center justify-center">
                <div className="text-white text-2xl font-graffiti">Cargando pedido...</div>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-brand-dark flex items-center justify-center text-white">
                <div className="text-center">
                    <h2 className="text-3xl font-graffiti text-brand-green mb-4">Pedido no encontrado</h2>
                    <Link to="/" className="text-brand-purple hover:text-purple-400 underline">
                        Volver al inicio
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-brand-dark text-white py-12">
            <div className="max-w-4xl mx-auto px-4">
                {/* Success Header */}
                <div className="text-center mb-12">
                    <div className="inline-block bg-brand-green/20 rounded-full p-6 mb-6">
                        <CheckCircle className="w-20 h-20 text-brand-green" />
                    </div>
                    <h1 className="text-4xl font-graffiti text-brand-green mb-4">¡Pedido Confirmado!</h1>
                    <p className="text-xl text-gray-300">Gracias por tu compra</p>
                    <p className="text-gray-400 mt-2">
                        Número de pedido: <span className="text-brand-yellow font-bold">#{order.id.slice(0, 8).toUpperCase()}</span>
                    </p>
                </div>

                {/* Order Details */}
                <div className="bg-brand-gray rounded-lg p-6 border border-gray-800 mb-6">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <Package className="w-6 h-6 text-brand-green" />
                        Detalles del Pedido
                    </h2>

                    <div className="space-y-4">
                        {orderItems.map((item, index) => (
                            <div key={index} className="flex gap-4 pb-4 border-b border-gray-700 last:border-0">
                                <img
                                    src={item.product_snapshot?.image_url || 'https://via.placeholder.com/80'}
                                    alt={item.product_snapshot?.name}
                                    className="w-20 h-20 object-contain bg-black rounded"
                                />
                                <div className="flex-grow">
                                    <p className="font-bold">{item.product_snapshot?.name}</p>
                                    <p className="text-sm text-gray-400">
                                        {item.product_snapshot?.brand && `Marca: ${item.product_snapshot.brand}`}
                                    </p>
                                    <p className="text-sm text-gray-400">Cantidad: {item.quantity}</p>
                                    <p className="text-brand-yellow font-bold mt-1">
                                        ${(item.unit_price * item.quantity).toLocaleString('es-CL')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-6 pt-6 border-t border-gray-700">
                        <div className="flex justify-between text-xl font-bold">
                            <span>Total Pagado</span>
                            <span className="text-brand-yellow font-graffiti">
                                ${order.total_amount.toLocaleString('es-CL')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Shipping Info */}
                <div className="bg-brand-gray rounded-lg p-6 border border-gray-800 mb-6">
                    <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                        <MapPin className="w-6 h-6 text-brand-green" />
                        Información de Envío
                    </h2>

                    {order.shipping_option === 'pickup' ? (
                        <div className="text-gray-300">
                            <p className="text-brand-green font-bold mb-2">Retiro en Tienda</p>
                            <p>Dirección: [Dirección de la tienda]</p>
                            <p>Horario: Lunes a Viernes 9:00 - 18:00</p>
                        </div>
                    ) : order.shipping_address ? (
                        <div className="space-y-3 text-gray-300">
                            <p><span className="font-bold text-white">Nombre:</span> {order.shipping_address.name || 'N/A'}</p>
                            <p><span className="font-bold text-white">Dirección:</span> {order.shipping_address.street || 'N/A'}</p>
                            <p>
                                <span className="font-bold text-white">Ciudad:</span> {order.shipping_address.city || 'N/A'}, {order.shipping_address.region || 'N/A'}
                                {order.shipping_address.postalCode && ` - ${order.shipping_address.postalCode}`}
                            </p>
                            {order.shipping_address.phone && (
                                <p className="flex items-center gap-2">
                                    <Phone className="w-4 h-4" />
                                    {order.shipping_address.phone}
                                </p>
                            )}
                        </div>
                    ) : (
                        <div className="text-gray-400">
                            <p>Dirección guardada del usuario</p>
                            <p className="text-sm mt-2">Puedes ver los detalles completos en "Mi Cuenta"</p>
                        </div>
                    )}

                    {order.notes && (
                        <div className="mt-4 pt-4 border-t border-gray-700">
                            <p className="text-sm text-gray-400">
                                <span className="font-bold text-white">Notas:</span> {order.notes}
                            </p>
                        </div>
                    )}
                </div>

                {/* Next Steps */}
                <div className="bg-brand-purple/10 border border-brand-purple rounded-lg p-6 mb-6">
                    <h3 className="font-bold text-lg mb-3">¿Qué sigue?</h3>
                    <ul className="space-y-2 text-gray-300">
                        <li className="flex items-start gap-2">
                            <span className="text-brand-green mt-1">✓</span>
                            <span>Recibirás un email de confirmación en breve</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-brand-green mt-1">✓</span>
                            <span>Procesaremos tu pedido en las próximas 24-48 horas</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <span className="text-brand-green mt-1">✓</span>
                            <span>Te contactaremos para coordinar el envío</span>
                        </li>
                    </ul>
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/"
                        className="bg-brand-purple text-white px-8 py-3 rounded-lg font-bold text-center hover:bg-purple-600 transition-all"
                    >
                        Volver al Inicio
                    </Link>
                    <Link
                        to="/catalogo"
                        className="bg-transparent border-2 border-brand-green text-brand-green px-8 py-3 rounded-lg font-bold text-center hover:bg-brand-green hover:text-black transition-all"
                    >
                        Seguir Comprando
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default OrderConfirmationPage;
