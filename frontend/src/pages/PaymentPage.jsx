import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader2, CreditCard, CheckCircle, XCircle, ShieldCheck } from 'lucide-react';
import { supabase } from '../supabaseClient';

const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY;

const PaymentPage = () => {
    const { orderId } = useParams();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [error, setError] = useState('');
    const [orderData, setOrderData] = useState(null);
    const [formReady, setFormReady] = useState(false);

    // Use ref to avoid null issues with cardForm
    const cardFormRef = useRef(null);

    // Load order data
    useEffect(() => {
        loadOrder();
    }, [orderId]);

    // Load Mercado Pago SDK
    useEffect(() => {
        const script = document.createElement('script');
        script.src = 'https://sdk.mercadopago.com/js/v2';
        script.async = true;
        script.onload = initializeMercadoPago;
        document.body.appendChild(script);

        return () => {
            if (document.body.contains(script)) {
                document.body.removeChild(script);
            }
        };
    }, []);

    const loadOrder = async () => {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .eq('id', orderId)
                .single();

            if (error) throw error;

            setOrderData(data);
            setLoading(false);
        } catch (err) {
            console.error('Error loading order:', err);
            setError('No se pudo cargar la orden');
            setLoading(false);
        }
    };

    const initializeMercadoPago = () => {
        if (!window.MercadoPago) {
            console.error('MercadoPago SDK not loaded');
            return;
        }

        const mercadoPago = new window.MercadoPago(MP_PUBLIC_KEY);

        // Wait for order data before creating form
        if (orderData) {
            createCardForm(mercadoPago);
        }
    };

    const createCardForm = (mercadoPago) => {
        const totalAmount = orderData.total_amount + (orderData.shipping_cost || 0);

        try {
            const form = mercadoPago.cardForm({
                amount: String(totalAmount),
                iframe: true,
                // Styling for dark theme - white text on dark background
                customization: {
                    paymentMethods: {
                        maxInstallments: 12,
                    },
                    visual: {
                        style: {
                            customVariables: {
                                textPrimaryColor: '#FFFFFF',
                                textSecondaryColor: '#9CA3AF',
                                inputBackgroundColor: '#1F2937',
                                formBackgroundColor: 'transparent',
                                baseColor: '#22c55e'
                            }
                        }
                    }
                },
                form: {
                    id: 'form-checkout',
                    cardNumber: {
                        id: 'form-checkout__cardNumber',
                        placeholder: 'Número de tarjeta',
                    },
                    expirationDate: {
                        id: 'form-checkout__expirationDate',
                        placeholder: 'MM/YY',
                    },
                    securityCode: {
                        id: 'form-checkout__securityCode',
                        placeholder: 'CVV',
                    },
                    cardholderName: {
                        id: 'form-checkout__cardholderName',
                        placeholder: 'Titular de la tarjeta',
                    },
                    issuer: {
                        id: 'form-checkout__issuer',
                        placeholder: 'Banco emisor',
                    },
                    installments: {
                        id: 'form-checkout__installments',
                        placeholder: 'Cuotas',
                    },
                    identificationType: {
                        id: 'form-checkout__identificationType',
                        placeholder: 'Tipo de documento',
                    },
                    identificationNumber: {
                        id: 'form-checkout__identificationNumber',
                        placeholder: 'RUT',
                    },
                    cardholderEmail: {
                        id: 'form-checkout__cardholderEmail',
                        placeholder: 'E-mail',
                    },
                },
                callbacks: {
                    onFormMounted: (error) => {
                        if (error) {
                            console.error('Form mount error:', error);
                            setError('Error al cargar el formulario de pago');
                            return;
                        }
                        console.log('MP Card Form mounted');
                        setFormReady(true);
                    },
                    onSubmit: (event) => {
                        event.preventDefault();
                        handlePayment();
                    },
                    onFetching: (resource) => {
                        console.log('Fetching resource:', resource);
                    }
                },
            });

            cardFormRef.current = form;
        } catch (err) {
            console.error('Error creating card form:', err);
            setError('Error al inicializar el formulario de pago');
        }
    };

    const handlePayment = async () => {
        if (!cardFormRef.current) {
            setError('Formulario de pago no está listo');
            return;
        }

        setProcessing(true);
        setError('');

        try {
            const formData = cardFormRef.current.getCardFormData();

            console.log('Raw form data from MP SDK:', formData);

            if (!formData) {
                throw new Error('No se pudieron obtener los datos de la tarjeta');
            }

            // MP SDK returns camelCase, not snake_case
            const {
                token,
                paymentMethodId,
                issuerId,
                installments
            } = formData;

            console.log('Extracted data:', {
                token,
                paymentMethodId,
                issuerId,
                installments
            });

            // Validate required fields
            if (!token) {
                throw new Error('Token de tarjeta no generado');
            }
            if (!paymentMethodId) {
                throw new Error('Método de pago no seleccionado');
            }

            // Check if user has active session (for debugging)
            const { data: sessionData } = await supabase.auth.getSession();
            console.log('Has active session:', !!sessionData.session);

            // Call Edge Function to process payment (convert to snake_case for backend)
            console.log('Calling Edge Function with orderId:', orderId);
            const { data, error: functionError } = await supabase.functions.invoke('process-mp-payment', {
                body: {
                    orderId,
                    token,
                    payment_method_id: paymentMethodId,
                    issuer_id: issuerId,
                    installments
                }
            });

            console.log('Edge Function response:', data);
            console.log('Edge Function error:', functionError);

            if (functionError) {
                console.error('Function invocation failed:', functionError);
                throw new Error(`Error al procesar el pago: ${functionError.message || 'Error desconocido'}`);
            }

            if (!data.success) {
                throw new Error(data.error || 'Error al procesar el pago');
            }

            // Redirect based on payment status with query params
            console.log('Payment status:', data.status);
            console.log('About to redirect...');

            // Build query params for PaymentStatusPage
            const queryParams = new URLSearchParams({
                external_reference: orderId,
                collection_status: data.status,
                payment_id: data.payment_id || ''
            }).toString();

            if (data.status === 'approved') {
                console.log('Redirecting to success page');
                // Use window.location instead of navigate to force page change
                window.location.href = `/pago/exito?${queryParams}`;
            } else if (data.status === 'rejected') {
                console.log('Redirecting to error page');
                window.location.href = `/pago/error?${queryParams}`;
            } else {
                console.log('Redirecting to pending page');
                window.location.href = `/pago/pendiente?${queryParams}`;
            }

        } catch (err) {
            console.error('Payment error:', err);
            setError(err.message || 'Error al procesar el pago. Por favor intenta nuevamente.');
            setProcessing(false);
        }
    };

    // Re-create form when order data arrives
    useEffect(() => {
        if (window.MercadoPago && orderData && !cardFormRef.current) {
            initializeMercadoPago();
        }
    }, [orderData]);

    if (loading && !orderData) {
        return (
            <div className="min-h-screen bg-brand-dark flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 text-brand-green animate-spin mx-auto mb-4" />
                    <p className="text-white">Cargando información del pedido...</p>
                </div>
            </div>
        );
    }

    if (error && !orderData) {
        return (
            <div className="min-h-screen bg-brand-dark flex items-center justify-center text-white p-4">
                <div className="max-w-md w-full bg-slate-800 rounded-lg p-8 border border-red-500">
                    <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-3 text-center text-red-500">Error</h2>
                    <p className="text-slate-300 mb-6 text-center">{error}</p>
                    <button
                        onClick={() => navigate('/cart')}
                        className="w-full bg-brand-purple text-white px-6 py-3 rounded-lg font-bold hover:bg-purple-600 transition-all"
                    >
                        Volver al Carrito
                    </button>
                </div>
            </div>
        );
    }

    const totalAmount = orderData ? orderData.total_amount + (orderData.shipping_cost || 0) : 0;

    return (
        <div className="min-h-screen bg-brand-dark text-white py-8 px-4">
            <div className="max-w-5xl mx-auto">
                {/* Header */}
                <div className="mb-8 text-center md:text-left">
                    <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-brand-green to-blue-400 bg-clip-text text-transparent">
                        Finalizar Pago
                    </h1>
                    <p className="text-slate-400">Orden #{orderId.slice(0, 8).toUpperCase()}</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8">
                    {/* Payment Form */}
                    <div className="md:col-span-2">
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-8 border border-slate-700 shadow-2xl">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold flex items-center gap-3">
                                    <div className="bg-brand-green/20 p-2 rounded-lg">
                                        <CreditCard className="w-6 h-6 text-brand-green" />
                                    </div>
                                    Datos de Pago
                                </h2>
                                <ShieldCheck className="w-8 h-8 text-brand-green" />
                            </div>

                            {error && (
                                <div className="mb-6 p-4 bg-red-500/10 border-l-4 border-red-500 rounded-lg animate-pulse">
                                    <p className="text-red-400 font-medium">{error}</p>
                                </div>
                            )}

                            {!formReady && !error && (
                                <div className="mb-6 p-4 bg-blue-500/10 border-l-4 border-blue-500 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <Loader2 className="w-5 h-5 text-blue-400 animate-spin" />
                                        <p className="text-blue-400">Preparando formulario seguro...</p>
                                    </div>
                                </div>
                            )}

                            <form id="form-checkout">
                                <div className="space-y-5">
                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-slate-300">
                                            Número de Tarjeta
                                        </label>
                                        <div id="form-checkout__cardNumber" className="mp-input" />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-slate-300">
                                            Nombre del Titular
                                        </label>
                                        <input
                                            id="form-checkout__cardholderName"
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3.5 text-white placeholder-slate-500 focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all"
                                            placeholder="Juan Pérez"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-slate-300">
                                            Email
                                        </label>
                                        <input
                                            id="form-checkout__cardholderEmail"
                                            type="email"
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3.5 text-white placeholder-slate-500 focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all"
                                            defaultValue={orderData?.customer_email}
                                            placeholder="tu@email.com"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold mb-2 text-slate-300">
                                                Vencimiento
                                            </label>
                                            <div id="form-checkout__expirationDate" className="mp-input" />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold mb-2 text-slate-300">
                                                CVV
                                            </label>
                                            <div id="form-checkout__securityCode" className="mp-input" />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-slate-300">
                                            Banco Emisor
                                        </label>
                                        <select
                                            id="form-checkout__issuer"
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3.5 text-white focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold mb-2 text-slate-300">
                                            Cuotas
                                        </label>
                                        <select
                                            id="form-checkout__installments"
                                            className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3.5 text-white focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold mb-2 text-slate-300">
                                                Tipo de Documento
                                            </label>
                                            <select
                                                id="form-checkout__identificationType"
                                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3.5 text-white focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold mb-2 text-slate-300">
                                                RUT
                                            </label>
                                            <input
                                                id="form-checkout__identificationNumber"
                                                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-4 py-3.5 text-white placeholder-slate-500 focus:border-brand-green focus:ring-2 focus:ring-brand-green/20 transition-all"
                                                placeholder="12345678-9"
                                            />
                                        </div>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={processing || !formReady}
                                        className="w-full bg-gradient-to-r from-brand-green to-green-400 text-black font-bold py-4 rounded-xl hover:shadow-lg hover:shadow-brand-green/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none flex items-center justify-center gap-3 text-lg mt-6"
                                    >
                                        {processing ? (
                                            <>
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                                Procesando pago...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle className="w-6 h-6" />
                                                Pagar ${totalAmount.toLocaleString('es-CL')}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    {/* Order Summary */}
                    <div className="md:col-span-1">
                        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 shadow-xl sticky top-4">
                            <h3 className="font-bold text-xl mb-6">Resumen del Pedido</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center py-3 border-b border-slate-700">
                                    <span className="text-slate-400">Subtotal</span>
                                    <span className="font-semibold text-lg">
                                        ${orderData?.total_amount.toLocaleString('es-CL')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-3 border-b border-slate-700">
                                    <span className="text-slate-400">Envío</span>
                                    <span className="font-semibold text-lg">
                                        ${(orderData?.shipping_cost || 0).toLocaleString('es-CL')}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-4 bg-brand-green/10 rounded-lg px-4 mt-4">
                                    <span className="font-bold text-xl">Total</span>
                                    <span className="font-bold text-2xl text-brand-green">
                                        ${totalAmount.toLocaleString('es-CL')}
                                    </span>
                                </div>
                            </div>

                            <div className="mt-8 pt-6 border-t border-slate-700 space-y-3">
                                <div className="flex items-center gap-3 text-sm text-slate-400">
                                    <ShieldCheck className="w-5 h-5 text-brand-green flex-shrink-0" />
                                    <span>Pago 100% seguro con Mercado Pago</span>
                                </div>
                                <div className="flex items-center gap-3 text-sm text-slate-400">
                                    <CheckCircle className="w-5 h-5 text-brand-green flex-shrink-0" />
                                    <span>Datos encriptados SSL</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .mp-input {
                    background: rgb(2, 6, 23);
                    border: 1px solid rgb(51, 65, 85);
                    border-radius: 0.5rem;
                    height: 54px;
                    transition: all 0.2s;
                }
                .mp-input:focus-within {
                    border-color: #00ff88;
                    box-shadow: 0 0 0 3px rgba(0, 255, 136, 0.1);
                }
            `}</style>
        </div>
    );
};

export default PaymentPage;
