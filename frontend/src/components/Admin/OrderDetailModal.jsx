import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { X, MapPin, Mail, Phone, Package, Save, Truck, Send } from 'lucide-react';
import { sendStatusChangeEmail } from '../../services/emailService';

const OrderDetailModal = ({ order, onClose, onUpdate }) => {
    const [orderItems, setOrderItems] = useState([]);
    const [status, setStatus] = useState(order.status);
    const [trackingNumber, setTrackingNumber] = useState(order.tracking_number || '');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [sendingEmail, setSendingEmail] = useState(false);
    const [emailStatus, setEmailStatus] = useState(null);

    useEffect(() => {
        fetchOrderItems();
    }, [order.id]);

    const fetchOrderItems = async () => {
        try {
            const { data, error } = await supabase
                .from('order_items')
                .select('*')
                .eq('order_id', order.id);

            if (error) throw error;
            setOrderItems(data);
        } catch (error) {
            console.error('Error fetching order items:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveStatus = async () => {
        console.log('=== handleSaveStatus called ===');
        console.log('Current status:', order.status, '-> New status:', status);

        setSaving(true);
        setEmailStatus(null);

        try {
            const updateData = { status };
            // Save tracking number if shipped
            if (status === 'shipped' && trackingNumber.trim()) {
                updateData.tracking_number = trackingNumber.trim();
            }

            console.log('Updating order with:', updateData);

            const { error } = await supabase
                .from('orders')
                .update(updateData)
                .eq('id', order.id);

            if (error) {
                console.error('DB Error:', error);
                throw error;
            }
            console.log('Order updated successfully');

            // Show success message and remind to send email if applicable
            if (status !== order.status && ['shipped', 'delivered', 'cancelled', 'preparing'].includes(status)) {
                setEmailStatus({
                    success: true,
                    message: '✅ Estado actualizado. Usa "Enviar Email" para notificar al cliente.'
                });
            }

            onUpdate();
        } catch (error) {
            console.error('Error updating order status:', error);
            setEmailStatus({
                success: false,
                message: `Error al actualizar: ${error.message || 'Error desconocido'}`
            });
        } finally {
            setSaving(false);
        }
    };

    // Manual email send function
    const handleSendEmail = async () => {
        console.log('=== handleSendEmail called ===');
        console.log('Order status:', order.status);
        console.log('Order email:', order.customer_email);

        if (!order.customer_email) {
            setEmailStatus({ success: false, message: 'Este pedido no tiene email de cliente' });
            return;
        }

        setSendingEmail(true);
        setEmailStatus(null);

        try {
            // Map status to email template and DB column
            const templateMap = {
                'preparing': { template: 'order_confirmed', column: 'confirmation_email_sent_at' },
                'shipped': { template: 'order_shipped', column: 'shipping_email_sent_at' },
                'delivered': { template: 'order_delivered', column: 'delivery_email_sent_at' },
                'cancelled': { template: 'payment_rejected', column: null }
            };

            const config = templateMap[order.status];
            if (!config) {
                setEmailStatus({ success: false, message: 'No hay plantilla de email para este estado' });
                return;
            }

            console.log('Sending email with template:', config.template);

            const emailResult = await sendStatusChangeEmail({
                ...order,
                customer_email: order.customer_email
            }, order.status === 'preparing' ? 'paid' : order.status);

            console.log('Email result:', emailResult);

            if (emailResult.success) {
                // Save timestamp to database if column exists
                if (config.column) {
                    const updateData = { [config.column]: new Date().toISOString() };
                    await supabase
                        .from('orders')
                        .update(updateData)
                        .eq('id', order.id);
                }
                setEmailStatus({ success: true, message: 'Email enviado exitosamente' });
                onUpdate(); // Refresh to show the new timestamp
            } else {
                setEmailStatus({ success: false, message: `Error: ${emailResult.error}` });
            }
        } catch (error) {
            console.error('Error sending email:', error);
            setEmailStatus({ success: false, message: `Error: ${error.message}` });
        } finally {
            setSendingEmail(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-yellow-500',
            paid: 'bg-blue-500',
            preparing: 'bg-orange-500',
            shipped: 'bg-purple-500',
            delivered: 'bg-green-500',
            cancelled: 'bg-red-500',
        };
        return colors[status] || colors.pending;
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
            <div className="bg-slate-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-slate-700">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <div>
                        <h2 className="text-2xl font-bold text-white">Detalle del Pedido</h2>
                        <p className="text-slate-400 text-sm mt-1">
                            ID: {order.id.slice(0, 8).toUpperCase()} • {new Date(order.created_at).toLocaleDateString('es-CL')}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-slate-400 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <div className="flex-grow overflow-y-auto p-6 space-y-6">
                    {/* Status */}
                    <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                        <label className="block text-sm font-bold text-slate-300 mb-3">
                            Estado del Pedido
                        </label>
                        <div className="flex items-center gap-4">
                            <select
                                value={status}
                                onChange={(e) => setStatus(e.target.value)}
                                className="flex-grow bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-green transition-colors"
                            >
                                <option value="pending">Pendiente</option>
                                <option value="paid">Pagado</option>
                                <option value="preparing">En Preparación</option>
                                <option value="shipped">Enviado</option>
                                <option value="delivered">Entregado</option>
                                <option value="cancelled">Cancelado</option>
                            </select>
                            <button
                                onClick={handleSaveStatus}
                                disabled={saving || (status === order.status && trackingNumber === (order.tracking_number || ''))}
                                className="bg-brand-green text-black px-6 py-2 rounded-lg font-bold hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                <Save className="w-4 h-4" />
                                Guardar
                            </button>
                            {/* Manual Email Button - Only for shipping/delivery/cancelled notifications */}
                            {['shipped', 'delivered', 'cancelled', 'preparing'].includes(order.status) && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={handleSendEmail}
                                        disabled={sendingEmail}
                                        className={`px-4 py-2 rounded-lg font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 ${(order.status === 'shipped' && order.shipping_email_sent_at) ||
                                                (order.status === 'delivered' && order.delivery_email_sent_at) ||
                                                (order.status === 'preparing' && order.confirmation_email_sent_at)
                                                ? 'bg-green-600 text-white hover:bg-green-500'
                                                : 'bg-blue-600 text-white hover:bg-blue-500'
                                            }`}
                                    >
                                        <Mail className="w-4 h-4" />
                                        {sendingEmail ? 'Enviando...' :
                                            (order.status === 'shipped' && order.shipping_email_sent_at) ? 'Reenviar' :
                                                (order.status === 'delivered' && order.delivery_email_sent_at) ? 'Reenviar' :
                                                    (order.status === 'preparing' && order.confirmation_email_sent_at) ? 'Reenviar' :
                                                        'Enviar Email'}
                                    </button>
                                    {/* Email sent indicator */}
                                    {((order.status === 'shipped' && order.shipping_email_sent_at) ||
                                        (order.status === 'delivered' && order.delivery_email_sent_at) ||
                                        (order.status === 'preparing' && order.confirmation_email_sent_at)) && (
                                            <span className="text-xs text-green-400">
                                                ✓ Enviado
                                            </span>
                                        )}
                                </div>
                            )}
                        </div>

                        {/* Email Status */}
                        {emailStatus && (
                            <div className={`mt-3 p-2 rounded-lg text-sm flex items-center gap-2 ${emailStatus.success
                                ? 'bg-green-500/10 text-green-400'
                                : 'bg-red-500/10 text-red-400'
                                }`}>
                                <Send className="w-4 h-4" />
                                {emailStatus.message}
                            </div>
                        )}

                        {/* Tracking Number - Show when shipped or delivered */}
                        {(status === 'shipped' || status === 'delivered') && (
                            <div className="mt-4 pt-4 border-t border-slate-700">
                                <label className="block text-sm font-bold text-slate-300 mb-2 flex items-center gap-2">
                                    <Truck className="w-4 h-4 text-purple-400" />
                                    Número de Seguimiento (Blue Express)
                                </label>
                                <input
                                    type="text"
                                    value={trackingNumber}
                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                    placeholder="Ej: 1234567890"
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-purple-500 transition-colors"
                                />
                                {order.tracking_number && (
                                    <a
                                        href={`https://www.blue.cl/seguimiento/?n_seguimiento=${order.tracking_number}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-sm text-purple-400 hover:text-purple-300 mt-2 inline-block"
                                    >
                                        Ver en Blue Express →
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Customer Info */}
                    <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                        <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                            <Package className="w-5 h-5 text-brand-green" />
                            Información del Cliente
                        </h3>
                        <div className="space-y-2 text-slate-300">
                            <p className="flex items-center gap-2">
                                <span className="font-bold w-24">Nombre:</span>
                                {order.customer_name || order.shipping_address?.recipient_name || 'N/A'}
                            </p>
                            <p className="flex items-center gap-2">
                                <Mail className="w-4 h-4 text-slate-500" />
                                <span className="font-bold w-24">Email:</span>
                                {order.customer_email || 'N/A'}
                            </p>
                            <p className="flex items-center gap-2">
                                <Phone className="w-4 h-4 text-slate-500" />
                                <span className="font-bold w-24">Teléfono:</span>
                                {order.customer_phone || order.shipping_address?.phone || 'N/A'}
                            </p>
                        </div>
                    </div>

                    {/* Shipping Address */}
                    <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                        <h3 className="font-bold text-white mb-3 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-brand-green" />
                            Dirección de Envío
                        </h3>
                        <div className="text-slate-300 space-y-1">
                            <p>{order.shipping_address?.recipient_name || order.customer_name || 'Sin nombre'}</p>
                            <p>
                                {order.shipping_address?.street_address} {order.shipping_address?.street_number}
                                {order.shipping_address?.apartment && `, ${order.shipping_address.apartment}`}
                            </p>
                            <p>
                                {order.shipping_address?.comuna}, {order.shipping_address?.region}
                            </p>
                        </div>
                        {order.notes && (
                            <div className="mt-3 pt-3 border-t border-slate-700">
                                <p className="text-sm text-slate-400">
                                    <span className="font-bold">Notas:</span> {order.notes}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Order Items */}
                    <div className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                        <h3 className="font-bold text-white mb-3">Productos</h3>
                        {loading ? (
                            <p className="text-slate-400">Cargando productos...</p>
                        ) : (
                            <div className="space-y-3">
                                {orderItems.map((item, index) => (
                                    <div key={index} className="flex gap-3 pb-3 border-b border-slate-700 last:border-0">
                                        <img
                                            src={item.product_snapshot?.image_url || 'https://via.placeholder.com/60'}
                                            alt={item.product_snapshot?.name}
                                            className="w-16 h-16 object-contain bg-black rounded"
                                        />
                                        <div className="flex-grow">
                                            <p className="font-bold text-white">{item.product_snapshot?.name}</p>
                                            <p className="text-sm text-slate-400">
                                                {item.product_snapshot?.brand}
                                            </p>
                                            <p className="text-sm text-slate-400">
                                                Cantidad: {item.quantity} × ${item.unit_price.toLocaleString('es-CL')}
                                            </p>
                                        </div>
                                        <div className="text-right">
                                            <p className="font-bold text-white">
                                                ${(item.unit_price * item.quantity).toLocaleString('es-CL')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Total */}
                    <div className="bg-slate-900 rounded-lg p-4 border border-slate-700 space-y-3">
                        <div className="flex justify-between items-center text-slate-300">
                            <span>Subtotal (Productos)</span>
                            <span className="font-bold">${(order.total_amount || 0).toLocaleString('es-CL')}</span>
                        </div>
                        <div className="flex justify-between items-center text-slate-300">
                            <span>Envío {order.shipping_option && `(${order.shipping_option})`}</span>
                            <span className="font-bold">${(order.shipping_cost || 0).toLocaleString('es-CL')}</span>
                        </div>
                        <div className="border-t border-slate-700 pt-3 flex justify-between items-center">
                            <span className="text-lg font-bold text-white">Total</span>
                            <span className="text-2xl font-bold text-brand-green">
                                ${((order.total_amount || 0) + (order.shipping_cost || 0)).toLocaleString('es-CL')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OrderDetailModal;
