import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { CheckCircle, AlertCircle, Clock, Home, ShoppingCart, Package, Mail, Truck, CreditCard, Download, FileText } from 'lucide-react';
import { supabase } from '../supabaseClient';
import { sendOrderEmail } from '../services/emailService';
import { downloadVoucher } from '../services/voucherService';

const PaymentStatusPage = () => {
    const [searchParams] = useSearchParams();
    const [status, setStatus] = useState('loading');
    const [orderDetails, setOrderDetails] = useState(null);
    const [orderItems, setOrderItems] = useState([]);
    const [emailSent, setEmailSent] = useState(false);
    const [downloadingVoucher, setDownloadingVoucher] = useState(false);

    const collection_status = searchParams.get('collection_status');
    const payment_id = searchParams.get('payment_id');
    const external_reference = searchParams.get('external_reference'); // order ID

    useEffect(() => {
        determineStatus();
    }, [collection_status]);

    // Fetch order and send confirmation email when payment approved
    useEffect(() => {
        if (status === 'approved' && external_reference && !emailSent) {
            fetchOrderAndSendEmail();
        }
    }, [status, external_reference]);

    const fetchOrderAndSendEmail = async () => {
        try {
            // Fetch order
            const { data: order, error } = await supabase
                .from('orders')
                .select('*')
                .eq('id', external_reference)
                .single();

            if (error) throw error;
            setOrderDetails(order);

            // Fetch order items
            const { data: items } = await supabase
                .from('order_items')
                .select('*')
                .eq('order_id', external_reference);

            if (items) setOrderItems(items);

            // Send confirmation email
            if (order.customer_email) {
                const result = await sendOrderEmail(order, 'order_confirmed');
                if (result.success) {
                    setEmailSent(true);
                }
            }
        } catch (error) {
            console.error('Error fetching order:', error);
        }
    };

    const handleDownloadVoucher = async () => {
        if (!orderDetails) return;
        setDownloadingVoucher(true);
        try {
            await downloadVoucher(orderDetails, orderItems);
        } catch (error) {
            console.error('Error downloading voucher:', error);
        } finally {
            setDownloadingVoucher(false);
        }
    };

    const determineStatus = () => {
        if (collection_status) {
            setStatus(collection_status);
            return;
        }

        const path = window.location.pathname;
        if (path.includes('/pago/exito')) {
            setStatus('approved');
        } else if (path.includes('/pago/error')) {
            setStatus('rejected');
        } else if (path.includes('/pago/pendiente')) {
            setStatus('pending');
        } else {
            setStatus('unknown');
        }
    };

    const getStatusConfig = () => {
        const configs = {
            approved: {
                icon: CheckCircle,
                gradient: 'from-green-500/20 to-emerald-600/10',
                borderColor: 'border-green-500/50',
                iconColor: 'text-green-400',
                title: '¡Pago Exitoso!',
                subtitle: 'Tu pago ha sido aprobado correctamente'
            },
            pending: {
                icon: Clock,
                gradient: 'from-yellow-500/20 to-amber-600/10',
                borderColor: 'border-yellow-500/50',
                iconColor: 'text-yellow-400',
                title: 'Pago Pendiente',
                subtitle: 'Tu pago está siendo procesado'
            },
            in_process: {
                icon: Clock,
                gradient: 'from-blue-500/20 to-cyan-600/10',
                borderColor: 'border-blue-500/50',
                iconColor: 'text-blue-400',
                title: 'Pago en Proceso',
                subtitle: 'Verificando tu pago...'
            },
            rejected: {
                icon: AlertCircle,
                gradient: 'from-red-500/20 to-rose-600/10',
                borderColor: 'border-red-500/50',
                iconColor: 'text-red-400',
                title: 'Pago Rechazado',
                subtitle: 'No pudimos procesar tu pago'
            },
            cancelled: {
                icon: AlertCircle,
                gradient: 'from-gray-500/20 to-slate-600/10',
                borderColor: 'border-gray-500/50',
                iconColor: 'text-gray-400',
                title: 'Pago Cancelado',
                subtitle: 'El proceso de pago fue cancelado'
            },
            unknown: {
                icon: AlertCircle,
                gradient: 'from-gray-500/20 to-slate-600/10',
                borderColor: 'border-gray-500/50',
                iconColor: 'text-gray-400',
                title: 'Estado Desconocido',
                subtitle: 'No pudimos determinar el estado'
            }
        };

        return configs[status] || configs.unknown;
    };

    const config = getStatusConfig();
    const Icon = config.icon;

    return (
        <div className="min-h-screen bg-brand-dark text-white py-12 px-4">
            <div className="max-w-2xl mx-auto">
                {/* Main Status Card */}
                <div className={`relative overflow-hidden rounded-2xl border-2 ${config.borderColor} bg-gradient-to-br ${config.gradient} backdrop-blur-sm p-8 mb-8`}>
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-radial from-white/5 to-transparent rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />

                    <div className="relative text-center">
                        {/* Animated Icon */}
                        <div className="mb-6 flex justify-center">
                            <div className={`p-4 rounded-full bg-black/30 ${config.iconColor}`}>
                                <Icon className="w-20 h-20" strokeWidth={1.5} />
                            </div>
                        </div>

                        <h1 className={`text-4xl font-bold mb-2 ${config.iconColor}`}>{config.title}</h1>
                        <p className="text-xl text-white/80 mb-8">{config.subtitle}</p>

                        {/* Order Info Card */}
                        {(payment_id || external_reference) && (
                            <div className="bg-black/40 backdrop-blur-sm rounded-xl p-6 border border-white/10 inline-block">
                                <div className="flex items-center justify-center gap-6 text-sm">
                                    {external_reference && (
                                        <div className="flex items-center gap-2">
                                            <Package className="w-5 h-5 text-brand-green" />
                                            <div className="text-left">
                                                <p className="text-white/60 text-xs">Pedido</p>
                                                <p className="font-mono font-bold text-white text-lg">#{external_reference.slice(0, 8).toUpperCase()}</p>
                                            </div>
                                        </div>
                                    )}
                                    {payment_id && (
                                        <div className="flex items-center gap-2">
                                            <CreditCard className="w-5 h-5 text-blue-400" />
                                            <div className="text-left">
                                                <p className="text-white/60 text-xs">ID Pago</p>
                                                <p className="font-mono font-bold text-white">{payment_id}</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Next Steps Card */}
                <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-6 mb-8">
                    <h3 className="font-bold text-xl mb-5 flex items-center gap-2 text-white">
                        <span className="text-2xl">📋</span> ¿Qué sigue?
                    </h3>

                    {status === 'approved' && (
                        <div className="space-y-4">
                            <div className="flex items-start gap-4 p-4 bg-green-500/5 rounded-xl border border-green-500/20">
                                <div className="p-2 bg-green-500/20 rounded-lg">
                                    <Mail className="w-5 h-5 text-green-400" />
                                </div>
                                <div>
                                    <p className="font-semibold text-white">Email de confirmación</p>
                                    <p className="text-sm text-slate-400">Recibirás un email con los detalles de tu pedido</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 bg-brand-purple/5 rounded-xl border border-brand-purple/20">
                                <div className="p-2 bg-brand-purple/20 rounded-lg">
                                    <Package className="w-5 h-5 text-brand-purple" />
                                </div>
                                <div>
                                    <p className="font-semibold text-white">Preparamos tu pedido</p>
                                    <p className="text-sm text-slate-400">En las próximas 24-48 horas hábiles</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 bg-blue-500/5 rounded-xl border border-blue-500/20">
                                <div className="p-2 bg-blue-500/20 rounded-lg">
                                    <Truck className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <p className="font-semibold text-white">Envío a tu domicilio</p>
                                    <p className="text-sm text-slate-400">Te notificaremos cuando despachemos con número de seguimiento</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {status === 'pending' && (
                        <div className="space-y-4">
                            <div className="flex items-start gap-4 p-4 bg-yellow-500/5 rounded-xl border border-yellow-500/20">
                                <div className="p-2 bg-yellow-500/20 rounded-lg">
                                    <Clock className="w-5 h-5 text-yellow-400" />
                                </div>
                                <div>
                                    <p className="font-semibold text-white">Verificando pago</p>
                                    <p className="text-sm text-slate-400">Mercado Pago está procesando tu pago</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 bg-slate-500/5 rounded-xl border border-slate-500/20">
                                <div className="p-2 bg-slate-500/20 rounded-lg">
                                    <Mail className="w-5 h-5 text-slate-400" />
                                </div>
                                <div>
                                    <p className="font-semibold text-white">Te avisaremos</p>
                                    <p className="text-sm text-slate-400">Recibirás un email cuando se confirme</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {(status === 'rejected' || status === 'cancelled') && (
                        <div className="space-y-4">
                            <div className="flex items-start gap-4 p-4 bg-red-500/5 rounded-xl border border-red-500/20">
                                <div className="p-2 bg-red-500/20 rounded-lg">
                                    <CreditCard className="w-5 h-5 text-red-400" />
                                </div>
                                <div>
                                    <p className="font-semibold text-white">Verifica tu método de pago</p>
                                    <p className="text-sm text-slate-400">Asegúrate de tener fondos suficientes</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-4 p-4 bg-slate-500/5 rounded-xl border border-slate-500/20">
                                <div className="p-2 bg-slate-500/20 rounded-lg">
                                    <AlertCircle className="w-5 h-5 text-slate-400" />
                                </div>
                                <div>
                                    <p className="font-semibold text-white">Intenta nuevamente</p>
                                    <p className="text-sm text-slate-400">Puedes probar con otro método de pago</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link
                        to="/"
                        className="flex items-center justify-center gap-2 px-8 py-4 bg-slate-700/80 backdrop-blur-sm text-white rounded-xl font-semibold hover:bg-slate-600 transition-all border border-slate-600/50"
                    >
                        <Home className="w-5 h-5" />
                        Volver al Inicio
                    </Link>

                    {status === 'approved' && (
                        <>
                            <button
                                onClick={handleDownloadVoucher}
                                disabled={downloadingVoucher || !orderDetails}
                                className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-cyan-600 text-white font-bold rounded-xl hover:from-blue-400 hover:to-cyan-500 transition-all shadow-lg shadow-blue-500/25 disabled:opacity-50"
                            >
                                {downloadingVoucher ? (
                                    <><Clock className="w-5 h-5 animate-spin" /> Generando...</>
                                ) : (
                                    <><Download className="w-5 h-5" /> Descargar Comprobante</>
                                )}
                            </button>
                            <Link
                                to="/mi-cuenta"
                                className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-400 hover:to-emerald-500 transition-all shadow-lg shadow-green-500/25"
                            >
                                <Package className="w-5 h-5" />
                                Ver Mis Pedidos
                            </Link>
                        </>
                    )}

                    {(status === 'rejected' || status === 'cancelled') && (
                        <Link
                            to="/carrito"
                            className="flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-brand-purple to-purple-600 text-white font-bold rounded-xl hover:from-purple-500 hover:to-purple-500 transition-all shadow-lg shadow-purple-500/25"
                        >
                            <ShoppingCart className="w-5 h-5" />
                            Volver al Carrito
                        </Link>
                    )}
                </div>

                {/* Support Footer */}
                <div className="mt-10 text-center">
                    <div className="inline-block bg-slate-800/50 backdrop-blur-sm rounded-xl px-6 py-4 border border-slate-700/50">
                        <p className="text-slate-400 text-sm">¿Problemas con tu pago?</p>
                        <a
                            href="mailto:contacto@conectados420.cl"
                            className="text-brand-green hover:text-green-400 font-semibold transition-colors"
                        >
                            contacto@conectados420.cl
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentStatusPage;
