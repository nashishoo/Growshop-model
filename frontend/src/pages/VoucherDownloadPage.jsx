import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { downloadVoucher } from '../services/voucherService';
import { Download, FileText, AlertCircle, Loader2, CheckCircle } from 'lucide-react';

/**
 * Public page to download order voucher
 * Accessible via /voucher/:orderId - no login required
 */
const VoucherDownloadPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [order, setOrder] = useState(null);
    const [downloading, setDownloading] = useState(false);
    const [downloadSuccess, setDownloadSuccess] = useState(false);

    useEffect(() => {
        const fetchOrder = async () => {
            if (!orderId) {
                setError('ID de pedido no proporcionado');
                setLoading(false);
                return;
            }

            try {
                const { data: orderData, error: orderError } = await supabase
                    .from('orders')
                    .select(`
                        *,
                        order_items (
                            id,
                            product_id,
                            quantity,
                            unit_price,
                            product_snapshot
                        )
                    `)
                    .eq('id', orderId)
                    .single();

                if (orderError) {
                    console.error('Order fetch error:', orderError);
                    setError(`Pedido no encontrado`);
                    setLoading(false);
                    return;
                }

                if (!['paid', 'preparing', 'shipped', 'delivered'].includes(orderData.status)) {
                    setError('El voucher solo está disponible para pedidos pagados');
                    setLoading(false);
                    return;
                }

                setOrder(orderData);
            } catch (err) {
                console.error('Error:', err);
                setError('Error al cargar el pedido');
            } finally {
                setLoading(false);
            }
        };

        fetchOrder();
    }, [orderId]);

    const handleDownload = async () => {
        if (!order) return;

        setDownloading(true);
        setDownloadSuccess(false);

        try {
            console.log('Downloading voucher for order:', order.id);
            await downloadVoucher(order, order.order_items || []);
            setDownloadSuccess(true);
            console.log('Voucher download completed');
        } catch (err) {
            console.error('Error generating voucher:', err);
            setError('Error al generar el voucher: ' + err.message);
        } finally {
            setDownloading(false);
        }
    };

    const getStatusLabel = (status) => {
        const labels = {
            'paid': 'Pagado',
            'preparing': 'En Preparación',
            'shipped': 'Enviado',
            'delivered': 'Entregado'
        };
        return labels[status] || status;
    };

    const getStatusColor = (status) => {
        const colors = {
            'paid': 'bg-blue-500',
            'preparing': 'bg-orange-500',
            'shipped': 'bg-purple-500',
            'delivered': 'bg-green-500'
        };
        return colors[status] || 'bg-gray-500';
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-green-500 animate-spin mx-auto mb-4" />
                    <p className="text-gray-300 text-lg">Cargando pedido...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
                <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 max-w-md w-full text-center shadow-2xl">
                    <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-white mb-2">Error</h1>
                    <p className="text-gray-400 mb-6">{error}</p>
                    <button
                        onClick={() => navigate('/')}
                        className="bg-green-500 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-400 transition-colors"
                    >
                        Volver al inicio
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl p-8 max-w-lg w-full shadow-2xl">
                {/* Header */}
                <div className="text-center mb-8">
                    <img
                        src="https://i.postimg.cc/DSHPn1Br/420gro-720p.png"
                        alt="Conectados 420"
                        className="w-24 h-24 mx-auto mb-4 object-contain"
                    />
                    <h1 className="text-3xl font-bold text-white mb-2">
                        Voucher de Compra
                    </h1>
                    <p className="text-green-400 font-mono text-lg">
                        Pedido #{orderId?.slice(0, 8).toUpperCase()}
                    </p>
                </div>

                {/* Order Info */}
                {order && (
                    <div className="bg-gray-900 rounded-xl p-6 mb-6 border border-gray-700">
                        <div className="grid grid-cols-2 gap-6">
                            <div>
                                <span className="text-gray-500 text-sm uppercase tracking-wide">Cliente</span>
                                <p className="text-white font-semibold text-lg mt-1">{order.customer_name}</p>
                            </div>
                            <div>
                                <span className="text-gray-500 text-sm uppercase tracking-wide">Total</span>
                                <p className="text-green-400 font-bold text-xl mt-1">
                                    ${order.total_amount?.toLocaleString('es-CL')}
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-500 text-sm uppercase tracking-wide">Fecha</span>
                                <p className="text-white font-medium mt-1">
                                    {new Date(order.created_at).toLocaleDateString('es-CL', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric'
                                    })}
                                </p>
                            </div>
                            <div>
                                <span className="text-gray-500 text-sm uppercase tracking-wide">Estado</span>
                                <p className="mt-1">
                                    <span className={`${getStatusColor(order.status)} text-white px-3 py-1 rounded-full text-sm font-medium`}>
                                        {getStatusLabel(order.status)}
                                    </span>
                                </p>
                            </div>
                        </div>

                        {/* Products count */}
                        <div className="mt-4 pt-4 border-t border-gray-700">
                            <span className="text-gray-500 text-sm">
                                {order.order_items?.length || 0} producto(s) en este pedido
                            </span>
                        </div>
                    </div>
                )}

                {/* Download Button */}
                <button
                    onClick={handleDownload}
                    disabled={downloading}
                    className={`w-full py-4 rounded-xl font-bold text-lg transition-all flex items-center justify-center gap-3 ${downloadSuccess
                        ? 'bg-green-600 text-white'
                        : 'bg-green-500 hover:bg-green-400 text-black'
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                    {downloading ? (
                        <>
                            <Loader2 className="w-6 h-6 animate-spin" />
                            Generando PDF...
                        </>
                    ) : downloadSuccess ? (
                        <>
                            <CheckCircle className="w-6 h-6" />
                            ¡Descargado!
                        </>
                    ) : (
                        <>
                            <Download className="w-6 h-6" />
                            Descargar Voucher PDF
                        </>
                    )}
                </button>

                {downloadSuccess && (
                    <p className="text-center text-green-400 text-sm mt-3">
                        Si no se descargó automáticamente, revisa tu carpeta de descargas
                    </p>
                )}

                <p className="text-center text-gray-500 text-sm mt-6">
                    Este documento es un comprobante válido de tu compra en Conectados 420
                </p>
            </div>
        </div>
    );
};

export default VoucherDownloadPage;
