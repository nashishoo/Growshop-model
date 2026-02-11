import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import { shippingService, formatShippingInfo } from '../services/shippingService';
import { REGIONES_COMUNAS, getRegionForComuna } from '../data/chileanAddresses';
import {
    ShoppingBag,
    AlertCircle,
    MapPin,
    Truck,
    Package,
    Clock,
    Plus,
    Ticket,
    Check,
    X
} from 'lucide-react';

const CheckoutPage = () => {
    const navigate = useNavigate();
    const { cart, getCartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    // User addresses
    const [addresses, setAddresses] = useState([]);
    const [selectedAddressId, setSelectedAddressId] = useState(null);
    const [loadingAddresses, setLoadingAddresses] = useState(true);

    // User profile info
    const [userProfile, setUserProfile] = useState(null);

    // Shipping
    const [shippingOptions, setShippingOptions] = useState([]);
    const [selectedShipping, setSelectedShipping] = useState('standard');
    const [shippingCost, setShippingCost] = useState(null);
    const [calculatingShipping, setCalculatingShipping] = useState(false);

    // Guest checkout form
    const [guestForm, setGuestForm] = useState({
        name: '',
        email: '',
        phone: '',
        rut: '',
        street: '',
        number: '',
        apartment: '',
        comuna: '',
        region: '',
        notes: ''
    });

    const isGuestCheckout = !user;
    const cartTotal = getCartTotal();

    // Coupon state
    const [couponCode, setCouponCode] = useState('');
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponError, setCouponError] = useState('');
    const [validatingCoupon, setValidatingCoupon] = useState(false);

    // Load user addresses and profile if logged in
    useEffect(() => {
        if (user) {
            loadUserData();
        } else {
            setLoadingAddresses(false);
        }
    }, [user]);

    const loadUserData = async () => {
        try {
            // Load addresses
            const { data: addressData, error: addrError } = await supabase
                .from('addresses')
                .select('*')
                .eq('user_id', user.id)
                .order('is_default', { ascending: false });

            if (addrError) throw addrError;
            setAddresses(addressData || []);

            // Auto-select default address
            const defaultAddr = addressData?.find(a => a.is_default);
            if (defaultAddr) {
                setSelectedAddressId(defaultAddr.id);
            }

            // Load user profile
            const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('full_name, phone')
                .eq('id', user.id)
                .single();

            if (!profileError && profileData) {
                setUserProfile(profileData);
                // Pre-fill guest form with profile data if no address 
                if (addressData.length === 0) {
                    setGuestForm(prev => ({
                        ...prev,
                        name: profileData.full_name || '',
                        phone: profileData.phone || '',
                        email: user.email || ''
                    }));
                }
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setLoadingAddresses(false);
        }
    };


    // Calculate shipping when address or cart changes
    useEffect(() => {
        const selectedAddress = addresses.find(a => a.id === selectedAddressId);
        if (selectedAddress && cartTotal > 0) {
            calculateShipping(selectedAddress);
        }
    }, [selectedAddressId, cartTotal, addresses]);

    // Calculate shipping for guest checkout OR logged-in users with no addresses
    useEffect(() => {
        const shouldUseGuestForm = isGuestCheckout || addresses.length === 0;
        if (shouldUseGuestForm && guestForm.comuna && guestForm.region && cartTotal > 0) {
            calculateShipping({
                comuna: guestForm.comuna,
                region: guestForm.region
            });
        }
    }, [isGuestCheckout, addresses.length, guestForm.comuna, guestForm.region, cartTotal]);

    const calculateShipping = async (address) => {
        setCalculatingShipping(true);
        try {
            const options = await shippingService.getAvailableOptions(
                { comuna: address.comuna, region: address.region },
                cartTotal,
                cart
            );

            setShippingOptions(options);

            // Auto-select standard or first available
            const defaultOption = options.find(o => o.id === 'standard') || options[0];
            setSelectedShipping(defaultOption.id);
            setShippingCost(defaultOption.cost);
        } catch (error) {
            console.error('Error calculating shipping:', error);
            setError('Error al calcular el envío');
        } finally {
            setCalculatingShipping(false);
        }
    };

    const handleShippingOptionChange = (optionId) => {
        setSelectedShipping(optionId);
        const option = shippingOptions.find(o => o.id === optionId);
        if (option) {
            setShippingCost(option.cost);
        }
    };

    // Coupon validation
    const validateCoupon = async () => {
        if (!couponCode.trim()) return;

        setValidatingCoupon(true);
        setCouponError('');

        try {
            const { data: coupon, error } = await supabase
                .from('coupons')
                .select('*')
                .eq('code', couponCode.toUpperCase())
                .eq('is_active', true)
                .single();

            if (error || !coupon) {
                setCouponError('Cupón no válido');
                setAppliedCoupon(null);
                return;
            }

            // Check expiration
            if (coupon.valid_until && new Date(coupon.valid_until) < new Date()) {
                setCouponError('Este cupón ha expirado');
                setAppliedCoupon(null);
                return;
            }

            // Check usage limit
            if (coupon.max_uses && coupon.uses_count >= coupon.max_uses) {
                setCouponError('Este cupón ya alcanzó su límite de usos');
                setAppliedCoupon(null);
                return;
            }

            // Check minimum purchase
            if (coupon.min_purchase_amount && cartTotal < coupon.min_purchase_amount) {
                setCouponError(`Compra mínima: $${coupon.min_purchase_amount.toLocaleString('es-CL')}`);
                setAppliedCoupon(null);
                return;
            }

            setAppliedCoupon(coupon);
            setCouponError('');
        } catch (err) {
            console.error('Error validating coupon:', err);
            setCouponError('Error al validar cupón');
        } finally {
            setValidatingCoupon(false);
        }
    };

    const removeCoupon = () => {
        setAppliedCoupon(null);
        setCouponCode('');
        setCouponError('');
    };

    const getDiscountAmount = () => {
        if (!appliedCoupon) return 0;
        if (appliedCoupon.discount_type === 'percentage') {
            return Math.round(cartTotal * (appliedCoupon.discount_value / 100));
        }
        return appliedCoupon.discount_value;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            let addressToUse;
            let customerName, customerEmail, customerPhone, customerRut;

            if (isGuestCheckout) {
                // Use guest form data
                addressToUse = {
                    recipient_name: guestForm.name,
                    street_address: guestForm.street,
                    street_number: guestForm.number,
                    apartment: guestForm.apartment,
                    comuna: guestForm.comuna,
                    region: guestForm.region,
                    phone: guestForm.phone
                };
                customerName = guestForm.name;
                customerEmail = guestForm.email;
                customerPhone = guestForm.phone;
                customerRut = guestForm.rut;
            } else {
                // Registered user - ALWAYS validate contact info
                if (!userProfile?.full_name && !guestForm.name) {
                    throw new Error('Por favor completa tu nombre');
                }
                if (!userProfile?.phone && !guestForm.phone) {
                    throw new Error('Por favor completa tu teléfono');
                }

                // If user filled the form, update their profile
                if (guestForm.name || guestForm.phone) {
                    const updateData = {};
                    if (guestForm.name) updateData.full_name = guestForm.name;
                    if (guestForm.phone) updateData.phone = guestForm.phone;

                    await supabase
                        .from('profiles')
                        .update(updateData)
                        .eq('id', user.id);
                }

                // Use selected address
                addressToUse = addresses.find(a => a.id === selectedAddressId);

                // If no saved address, use form data
                if (!addressToUse && addresses.length === 0) {
                    addressToUse = {
                        recipient_name: guestForm.name || userProfile?.full_name,
                        street_address: guestForm.street || '',
                        street_number: guestForm.number || '',
                        apartment: guestForm.apartment || '',
                        comuna: guestForm.comuna || '',
                        region: guestForm.region || '',
                        phone: guestForm.phone || userProfile?.phone
                    };
                } else if (!addressToUse) {
                    throw new Error('Debe seleccionar una dirección de envío');
                }

                // Get customer info (prioritize form, then profile, then address)
                customerName = guestForm.name || userProfile?.full_name || addressToUse.recipient_name || 'N/A';
                customerEmail = user.email || 'N/A';
                customerPhone = guestForm.phone || userProfile?.phone || addressToUse.phone || 'N/A';
                customerRut = guestForm.rut || userProfile?.rut || 'N/A';
            }

            const selectedOption = shippingOptions.find(o => o.id === selectedShipping);

            // Create order with customer information
            const discountAmt = getDiscountAmount();
            const { data: order, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: user?.id || null,
                    status: 'pending',
                    payment_status: 'pending',
                    total_amount: cartTotal - discountAmt,
                    shipping_cost: shippingCost || 0,
                    shipping_option: selectedShipping,
                    shipping_days_estimate: selectedOption?.days,
                    notes: isGuestCheckout ? guestForm.notes : null,
                    // Coupon info
                    coupon_id: appliedCoupon?.id || null,
                    discount_amount: discountAmt,
                    // Customer information (always captured)
                    customer_name: customerName,
                    customer_email: customerEmail,
                    customer_phone: customerPhone,
                    customer_rut: customerRut,
                    // Store address
                    shipping_address: addressToUse,
                    shipping_address_id: (isGuestCheckout || addresses.length === 0) ? null : selectedAddressId
                })
                .select()
                .single();

            if (orderError) throw orderError;

            // Create order items
            const orderItems = cart.map(item => ({
                order_id: order.id,
                product_id: item.id,
                quantity: item.quantity,
                unit_price: item.sale_price || item.price,
                product_snapshot: {
                    name: item.name,
                    brand: item.brands?.name,
                    image_url: item.image_url
                }
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(orderItems);

            if (itemsError) throw itemsError;

            // Success - clear cart and go to payment
            clearCart();
            navigate(`/pago/${order.id}`);

        } catch (err) {
            console.error('Error creating order:', err);
            console.error('Full error details:', JSON.stringify(err, null, 2));
            if (err.message) console.error('Error message:', err.message);
            if (err.details) console.error('Error details:', err.details);
            if (err.hint) console.error('Error hint:', err.hint);
            if (err.code) console.error('Error code:', err.code);
            setError(err.message || 'Hubo un error al procesar tu pedido. Por favor intenta nuevamente.');
            // Don't clear cart on error - user can try again
        } finally {
            setLoading(false);
        }
    };

    if (cart.length === 0) {
        return (
            <div className="min-h-screen bg-brand-dark flex items-center justify-center text-white">
                <div className="text-center">
                    <ShoppingBag className="w-24 h-24 mx-auto mb-6 text-gray-600" />
                    <h2 className="text-3xl font-graffiti text-brand-green mb-4">Tu carrito está vacío</h2>
                    <p className="text-gray-400 mb-8">Agrega productos antes de proceder al checkout</p>
                    <button
                        onClick={() => navigate('/catalogo')}
                        className="bg-brand-purple text-white px-8 py-3 rounded-lg font-bold hover:bg-purple-600 transition-all"
                    >
                        Ir al Catálogo
                    </button>
                </div>
            </div>
        );
    }

    const discountAmount = getDiscountAmount();
    const finalTotal = cartTotal + (shippingCost || 0) - discountAmount;

    return (
        <div className="min-h-screen bg-brand-dark text-white py-12">
            <div className="max-w-6xl mx-auto px-4">
                <h1 className="text-4xl font-graffiti text-brand-green mb-8">Finalizar Compra</h1>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Checkout Form */}
                    <div className="lg:col-span-2">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Error Message */}
                            {error && (
                                <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-red-400">{error}</p>
                                </div>
                            )}

                            {/* User Contact Information - ALWAYS required for logged users */}
                            {!isGuestCheckout && (!userProfile?.full_name || !userProfile?.phone) && (
                                <div className="bg-yellow-500/10 border-2 border-yellow-500 rounded-lg p-6">
                                    <div className="flex items-start gap-3 mb-4">
                                        <AlertCircle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                                        <div>
                                            <h3 className="text-xl font-bold text-yellow-500 mb-2">
                                                Completa tu Información de Contacto
                                            </h3>
                                            <p className="text-yellow-200 text-sm">
                                                Necesitamos estos datos para coordinar la entrega de tu pedido
                                            </p>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-white">
                                                Nombre Completo *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={guestForm.name}
                                                onChange={(e) => setGuestForm({ ...guestForm, name: e.target.value })}
                                                placeholder="Juan Pérez"
                                                className="w-full bg-black border border-yellow-500/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 placeholder-gray-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-2 text-white">
                                                Teléfono *
                                            </label>
                                            <input
                                                type="tel"
                                                required
                                                value={guestForm.phone}
                                                onChange={(e) => setGuestForm({ ...guestForm, phone: e.target.value })}
                                                onInput={(e) => e.target.value = e.target.value.replace(/[^0-9+\s()\-]/g, '')}
                                                placeholder="+56 9 1234 5678"
                                                title="Solo números, +, espacios, guiones y paréntesis"
                                                className="w-full bg-black border border-yellow-500/50 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-yellow-500 placeholder-gray-500"
                                            />
                                        </div>
                                    </div>
                                    <p className="text-xs text-yellow-300 mt-3">
                                        💡 Esta información se guardará en tu perfil para futuras compras
                                    </p>
                                </div>
                            )}

                            {/* Delivery Address */}
                            <div className="bg-brand-gray rounded-lg p-6 border border-gray-800">
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                    <MapPin className="w-6 h-6 text-brand-green" />
                                    Dirección de Envío
                                </h2>

                                {!isGuestCheckout && loadingAddresses ? (
                                    <div className="text-center py-8 text-gray-400">Cargando direcciones...</div>
                                ) : !isGuestCheckout && addresses.length > 0 ? (
                                    // Registered user with addresses
                                    <div className="space-y-3">
                                        {addresses.map((addr) => (
                                            <label
                                                key={addr.id}
                                                className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedAddressId === addr.id
                                                    ? 'border-brand-green bg-brand-green/10'
                                                    : 'border-gray-700 hover:border-gray-600'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="address"
                                                    value={addr.id}
                                                    checked={selectedAddressId === addr.id}
                                                    onChange={() => setSelectedAddressId(addr.id)}
                                                    className="sr-only"
                                                />
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="font-bold text-white">{addr.label || 'Dirección'}</p>
                                                        <p className="text-sm text-gray-300">{addr.recipient_name}</p>
                                                        <p className="text-sm text-gray-400">
                                                            {addr.street_address} {addr.street_number}
                                                            {addr.apartment && `, ${addr.apartment}`}
                                                        </p>
                                                        <p className="text-sm text-gray-400">{addr.comuna}, {addr.region}</p>
                                                    </div>
                                                    {addr.is_default && (
                                                        <span className="bg-brand-green/20 text-brand-green text-xs px-2 py-1 rounded">
                                                            Principal
                                                        </span>
                                                    )}
                                                </div>
                                            </label>
                                        ))}
                                        <button
                                            type="button"
                                            onClick={() => navigate('/mi-cuenta?tab=direcciones')}
                                            className="w-full border-2 border-dashed border-gray-700 rounded-lg p-4 text-gray-400 hover:border-brand-green hover:text-brand-green transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Plus className="w-5 h-5" />
                                            Agregar nueva dirección
                                        </button>
                                    </div>
                                ) : (
                                    // Guest checkout or user with no addresses
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-bold mb-2">Nombre *</label>
                                                <input
                                                    type="text"
                                                    required
                                                    value={guestForm.name}
                                                    onChange={(e) => setGuestForm({ ...guestForm, name: e.target.value })}
                                                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-green"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-sm font-bold mb-2">Teléfono *</label>
                                                <input
                                                    type="tel"
                                                    required
                                                    value={guestForm.phone}
                                                    onChange={(e) => setGuestForm({ ...guestForm, phone: e.target.value })}
                                                    onInput={(e) => e.target.value = e.target.value.replace(/[^0-9+\s()\-]/g, '')}
                                                    placeholder="+56 9 1234 5678"
                                                    title="Solo números, +, espacios, guiones y paréntesis"
                                                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-green"
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-bold mb-2">RUT *</label>
                                            <input
                                                type="text"
                                                required
                                                value={guestForm.rut}
                                                onChange={(e) => setGuestForm({ ...guestForm, rut: e.target.value })}
                                                placeholder="12.345.678-9"
                                                className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-green"
                                            />
                                        </div>
                                        {isGuestCheckout && (
                                            <div>
                                                <label className="block text-sm font-bold mb-2">Email *</label>
                                                <input
                                                    type="email"
                                                    required
                                                    value={guestForm.email}
                                                    onChange={(e) => setGuestForm({ ...guestForm, email: e.target.value })}
                                                    placeholder="ejemplo@correo.com"
                                                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-green"
                                                />
                                            </div>
                                        )}

                                        {/* Address Fields */}
                                        <div className="grid grid-cols-1 gap-4">
                                            <div className="grid grid-cols-3 gap-4">
                                                <div className="col-span-2">
                                                    <label className="block text-sm font-bold mb-2">Calle *</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={guestForm.street}
                                                        onChange={(e) => setGuestForm({ ...guestForm, street: e.target.value })}
                                                        placeholder="Av. Libertador Bernardo O'Higgins"
                                                        className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-green"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold mb-2">Número *</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={guestForm.number}
                                                        onChange={(e) => setGuestForm({ ...guestForm, number: e.target.value })}
                                                        placeholder="123"
                                                        className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-green"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-bold mb-2">Depto/Casa (opcional)</label>
                                                <input
                                                    type="text"
                                                    value={guestForm.apartment}
                                                    onChange={(e) => setGuestForm({ ...guestForm, apartment: e.target.value })}
                                                    placeholder="Depto 402, Casa 5B"
                                                    className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-green"
                                                />
                                            </div>

                                            <div className="grid grid-cols-2 gap-4">
                                                <div>
                                                    <label className="block text-sm font-bold mb-2">Comuna *</label>
                                                    <select
                                                        required
                                                        value={guestForm.comuna}
                                                        onChange={(e) => {
                                                            const comuna = e.target.value;
                                                            const region = getRegionForComuna(comuna);
                                                            setGuestForm({ ...guestForm, comuna, region: region || '' });
                                                        }}
                                                        className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-green"
                                                    >
                                                        <option value="">Seleccionar comuna</option>
                                                        {Object.entries(REGIONES_COMUNAS).map(([region, comunas]) => (
                                                            <optgroup key={region} label={region}>
                                                                {comunas.map(comuna => (
                                                                    <option key={comuna} value={comuna}>{comuna}</option>
                                                                ))}
                                                            </optgroup>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-bold mb-2">Región *</label>
                                                    <input
                                                        type="text"
                                                        required
                                                        value={guestForm.region}
                                                        readOnly
                                                        placeholder="Se completa automáticamente"
                                                        className="w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-gray-400 cursor-not-allowed"
                                                    />
                                                </div>
                                            </div>

                                            {isGuestCheckout && (
                                                <div>
                                                    <label className="block text-sm font-bold mb-2">Notas de entrega (opcional)</label>
                                                    <textarea
                                                        value={guestForm.notes}
                                                        onChange={(e) => setGuestForm({ ...guestForm, notes: e.target.value })}
                                                        placeholder="Ej: Dejar con conserje, tocar timbre 2 veces"
                                                        rows="2"
                                                        className="w-full bg-black border border-gray-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-green"
                                                    />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Shipping Options */}
                            {(
                                (selectedAddressId && !isGuestCheckout && addresses.length > 0) ||
                                ((isGuestCheckout || addresses.length === 0) && guestForm.comuna && guestForm.region)
                            ) && shippingOptions.length > 0 && (
                                    <div className="bg-brand-gray rounded-lg p-6 border border-gray-800">
                                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                            <Truck className="w-6 h-6 text-brand-green" />
                                            Método de Envío
                                        </h2>

                                        {calculatingShipping ? (
                                            <div className="text-center py-8 text-gray-400">Calculando costos de envío...</div>
                                        ) : (
                                            <div className="space-y-3">
                                                {shippingOptions.map((option) => {
                                                    const info = formatShippingInfo(option);
                                                    return (
                                                        <label
                                                            key={option.id}
                                                            className={`block p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedShipping === option.id
                                                                ? 'border-brand-green bg-brand-green/10'
                                                                : 'border-gray-700 hover:border-gray-600'
                                                                }`}
                                                        >
                                                            <input
                                                                type="radio"
                                                                name="shipping"
                                                                value={option.id}
                                                                checked={selectedShipping === option.id}
                                                                onChange={() => handleShippingOptionChange(option.id)}
                                                                className="sr-only"
                                                            />
                                                            <div className="flex items-center justify-between">
                                                                <div className="flex items-center gap-3">
                                                                    {option.id === 'express' && <Package className="w-5 h-5 text-brand-purple" />}
                                                                    {option.id === 'standard' && <Truck className="w-5 h-5 text-blue-400" />}
                                                                    {option.id === 'pickup' && <MapPin className="w-5 h-5 text-brand-green" />}
                                                                    <div>
                                                                        <p className="font-bold text-white">{option.label}</p>
                                                                        <p className="text-sm text-gray-400 flex items-center gap-1">
                                                                            <Clock className="w-4 h-4" />
                                                                            {info.message}
                                                                        </p>
                                                                    </div>
                                                                </div>
                                                                <div className="text-right">
                                                                    <p className={`text-xl font-bold ${option.freeShipping ? 'text-brand-green' : 'text-white'}`}>
                                                                        {info.display}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </label>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                )}

                            <button
                                type="submit"
                                disabled={loading || calculatingShipping || !selectedShipping || (
                                    (isGuestCheckout || addresses.length === 0)
                                        ? !guestForm.name || !guestForm.email || !guestForm.phone || !guestForm.street || !guestForm.number || !guestForm.comuna || !guestForm.region
                                        : !selectedAddressId
                                )}
                                className="w-full bg-brand-purple text-white py-4 rounded-lg font-bold text-lg hover:bg-purple-600 transition-all shadow-lg hover:shadow-neon-purple disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Procesando...' : 'Continuar al Pago'}
                            </button>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div className="lg:col-span-1">
                        <div className="bg-brand-gray rounded-lg p-6 border border-gray-800 sticky top-24">
                            <h2 className="text-2xl font-bold mb-6">Resumen del Pedido</h2>

                            <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                                {cart.map(item => (
                                    <div key={item.id} className="flex gap-3 pb-4 border-b border-gray-700">
                                        <img
                                            src={item.image_url || 'https://via.placeholder.com/60'}
                                            alt={item.name}
                                            className="w-16 h-16 object-contain bg-black rounded"
                                        />
                                        <div className="flex-grow">
                                            <p className="font-bold text-sm line-clamp-2">{item.name}</p>
                                            <p className="text-gray-400 text-sm">Cantidad: {item.quantity}</p>
                                            <p className="text-brand-yellow font-bold">
                                                ${((item.sale_price || item.price) * item.quantity).toLocaleString('es-CL')}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="space-y-3 pt-4 border-t border-gray-700">
                                <div className="flex justify-between text-gray-400">
                                    <span>Subtotal</span>
                                    <span className="text-white font-bold">${cartTotal.toLocaleString('es-CL')}</span>
                                </div>
                                <div className="flex justify-between text-gray-400">
                                    <span>Envío</span>
                                    {calculatingShipping ? (
                                        <span className="text-sm">Calculando...</span>
                                    ) : shippingCost !== null ? (
                                        <span className={`font-bold ${shippingCost === 0 ? 'text-brand-green' : 'text-white'}`}>
                                            {shippingCost === 0 ? '¡GRATIS!' : `$${shippingCost.toLocaleString('es-CL')}`}
                                        </span>
                                    ) : (
                                        <span className="text-sm">Seleccionar dirección</span>
                                    )}
                                </div>

                                {/* Coupon Input */}
                                <div className="pt-3 border-t border-gray-700">
                                    <label className="block text-sm font-bold text-white mb-2 flex items-center gap-2">
                                        <Ticket className="w-4 h-4 text-brand-green" />
                                        Código de Descuento
                                    </label>
                                    {appliedCoupon ? (
                                        <div className="flex items-center justify-between bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                                            <div>
                                                <span className="text-green-400 font-bold">{appliedCoupon.code}</span>
                                                <span className="text-green-300 text-sm ml-2">
                                                    (-{appliedCoupon.discount_type === 'percentage'
                                                        ? `${appliedCoupon.discount_value}%`
                                                        : `$${appliedCoupon.discount_value.toLocaleString('es-CL')}`})
                                                </span>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={removeCoupon}
                                                className="text-red-400 hover:text-red-300"
                                            >
                                                <X className="w-5 h-5" />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <input
                                                type="text"
                                                value={couponCode}
                                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                                placeholder="Ej: VERANO20"
                                                className="flex-1 bg-black border border-gray-700 rounded-lg px-3 py-2 text-white uppercase text-sm focus:border-brand-green focus:outline-none"
                                            />
                                            <button
                                                type="button"
                                                onClick={validateCoupon}
                                                disabled={validatingCoupon || !couponCode.trim()}
                                                className="bg-brand-green text-black px-4 py-2 rounded-lg font-bold hover:bg-green-400 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                                            >
                                                {validatingCoupon ? '...' : 'Aplicar'}
                                            </button>
                                        </div>
                                    )}
                                    {couponError && (
                                        <p className="text-red-400 text-xs mt-2">{couponError}</p>
                                    )}
                                </div>

                                {/* Discount Line */}
                                {discountAmount > 0 && (
                                    <div className="flex justify-between text-green-400">
                                        <span>Descuento</span>
                                        <span className="font-bold">-${discountAmount.toLocaleString('es-CL')}</span>
                                    </div>
                                )}

                                <div className="border-t border-gray-700 pt-3 flex justify-between text-xl font-bold">
                                    <span>Total</span>
                                    <span className="text-brand-yellow font-graffiti">${finalTotal.toLocaleString('es-CL')}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CheckoutPage;
