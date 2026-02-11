import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../supabaseClient';
import AddressFormModal from '../components/AddressFormModal';
import { downloadVoucher } from '../services/voucherService';
import {
    User,
    MapPin,
    Package,
    Lock,
    LogOut,
    Mail,
    Phone,
    Calendar,
    Plus,
    Trash2,
    Edit,
    Home,
    ShoppingCart,
    CheckCircle,
    Download,
    FileText,
    Eye,
    ChevronDown,
    ChevronUp,
    Truck,
    Clock
} from 'lucide-react';

const MyAccountPage = () => {
    const { user, signOut } = useAuth();
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const activeTab = searchParams.get('tab') || 'pedidos';

    const [profile, setProfile] = useState(null);
    const [orders, setOrders] = useState([]);
    const [addresses, setAddresses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUserData();
    }, [user]);

    const loadUserData = async () => {
        if (!user) return;

        try {
            // Load profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();
            setProfile(profileData);

            // Load orders
            const { data: ordersData } = await supabase
                .from('orders')
                .select('*')
                .eq('user_id', user.id)
                .order('created_at', { ascending: false });
            setOrders(ordersData || []);

            // Load addresses
            const { data: addressesData } = await supabase
                .from('addresses')
                .select('*')
                .eq('user_id', user.id)
                .order('is_default', { ascending: false });
            setAddresses(addressesData || []);
        } catch (error) {
            console.error('Error loading user data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    const setTab = (tab) => {
        setSearchParams({ tab });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-[#22c55e] text-xl animate-pulse">Cargando...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#050505] py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none fixed"></div>

            <div className="max-w-6xl mx-auto relative z-10">
                {/* Header con logo y estilo neón */}
                <div className="relative overflow-hidden rounded-2xl mb-8 bg-[#111] border border-gray-800 p-8 shadow-2xl">
                    {/* Efecto de brillo */}
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-neon-green to-transparent"></div>

                    <div className="flex items-center justify-between flex-wrap gap-6">
                        <div className="flex items-center gap-5">
                            {/* Avatar - usa avatar_url del perfil o logo por defecto */}
                            <div className="relative">
                                <div className="absolute inset-0 bg-neon-green rounded-full blur opacity-20"></div>
                                <img
                                    src={profile?.avatar_url || "https://i.postimg.cc/PvxrxX1d/420grow-480p.png"}
                                    alt="Perfil"
                                    className="w-16 h-16 rounded-full object-cover border-2 border-neon-green relative z-10"
                                />
                            </div>
                            <div>
                                <h1 className="text-4xl font-graffiti text-white tracking-wide">MI CUENTA</h1>
                                <p className="text-neon-green font-mono">{profile?.full_name || profile?.email || user?.email}</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Link
                                to="/"
                                className="bg-black border-2 border-white/20 text-white px-5 py-3 rounded-xl hover:border-[#22c55e] hover:text-[#22c55e] transition-all flex items-center gap-2 font-bold"
                            >
                                <Home className="w-5 h-5" />
                                <span className="hidden sm:inline">Inicio</span>
                            </Link>
                            <Link
                                to="/carrito"
                                className="bg-black border-2 border-white/20 text-white px-5 py-3 rounded-xl hover:border-[#22c55e] hover:text-[#22c55e] transition-all flex items-center gap-2 font-bold"
                            >
                                <ShoppingCart className="w-5 h-5" />
                                <span className="hidden sm:inline">Carrito</span>
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="bg-red-600 border-2 border-red-500 text-white px-5 py-3 rounded-xl font-black hover:bg-red-700 transition-all flex items-center gap-2"
                            >
                                <LogOut className="w-5 h-5" />
                                <span className="hidden sm:inline">Salir</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Tabs con estilo neón - texto visible siempre */}
                <div className="rounded-2xl overflow-hidden border-2 border-[#22c55e]/30 bg-black">
                    {/* Tab Headers */}
                    <div className="border-b-2 border-[#22c55e]/30 flex overflow-x-auto bg-gradient-to-r from-green-950/20 via-black to-green-950/20">
                        <button
                            onClick={() => setTab('pedidos')}
                            className={`px-8 py-5 font-black flex items-center gap-3 whitespace-nowrap transition-all ${activeTab === 'pedidos'
                                ? 'bg-[#22c55e] text-black'
                                : 'text-white hover:text-[#22c55e] hover:bg-green-950/30'
                                }`}
                        >
                            <Package className="w-5 h-5" />
                            MIS PEDIDOS
                        </button>
                        <button
                            onClick={() => setTab('direcciones')}
                            className={`px-8 py-5 font-black flex items-center gap-3 whitespace-nowrap transition-all ${activeTab === 'direcciones'
                                ? 'bg-[#22c55e] text-black'
                                : 'text-white hover:text-[#22c55e] hover:bg-green-950/30'
                                }`}
                        >
                            <MapPin className="w-5 h-5" />
                            DIRECCIONES
                        </button>
                        <button
                            onClick={() => setTab('perfil')}
                            className={`px-8 py-5 font-black flex items-center gap-3 whitespace-nowrap transition-all ${activeTab === 'perfil'
                                ? 'bg-[#22c55e] text-black'
                                : 'text-white hover:text-[#22c55e] hover:bg-green-950/30'
                                }`}
                        >
                            <User className="w-5 h-5" />
                            PERFIL
                        </button>
                        <button
                            onClick={() => setTab('password')}
                            className={`px-8 py-5 font-black flex items-center gap-3 whitespace-nowrap transition-all ${activeTab === 'password'
                                ? 'bg-[#22c55e] text-black'
                                : 'text-white hover:text-[#22c55e] hover:bg-green-950/30'
                                }`}
                        >
                            <Lock className="w-5 h-5" />
                            SEGURIDAD
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="p-8">
                        {activeTab === 'pedidos' && <OrdersTab orders={orders} />}
                        {activeTab === 'direcciones' && <AddressesTab addresses={addresses} onUpdate={loadUserData} />}
                        {activeTab === 'perfil' && <ProfileTab profile={profile} user={user} onUpdate={loadUserData} />}
                        {activeTab === 'password' && <PasswordTab />}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Orders Tab Component
const OrdersTab = ({ orders }) => {
    const [expandedOrder, setExpandedOrder] = useState(null);
    const [orderItems, setOrderItems] = useState({});
    const [downloadingId, setDownloadingId] = useState(null);

    const loadOrderItems = async (orderId) => {
        if (orderItems[orderId]) return;
        const { data } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', orderId);
        if (data) {
            setOrderItems(prev => ({ ...prev, [orderId]: data }));
        }
    };

    const toggleExpand = (orderId) => {
        if (expandedOrder === orderId) {
            setExpandedOrder(null);
        } else {
            setExpandedOrder(orderId);
            loadOrderItems(orderId);
        }
    };

    const handleDownload = async (order) => {
        setDownloadingId(order.id);
        try {
            await loadOrderItems(order.id);
            const items = orderItems[order.id] || [];
            await downloadVoucher(order, items);
        } catch (error) {
            console.error('Error downloading:', error);
        } finally {
            setDownloadingId(null);
        }
    };

    const getStatusConfig = (status) => {
        const configs = {
            pending: { color: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', icon: Clock, label: 'Pago Pendiente' },
            paid: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: CheckCircle, label: 'Pagado' },
            confirmed: { color: 'bg-blue-500/20 text-blue-400 border-blue-500/30', icon: CheckCircle, label: 'Confirmado' },
            processing: { color: 'bg-purple-500/20 text-purple-400 border-purple-500/30', icon: Package, label: 'En Preparación' },
            shipped: { color: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30', icon: Truck, label: 'Enviado' },
            delivered: { color: 'bg-green-500/20 text-green-400 border-green-500/30', icon: CheckCircle, label: 'Entregado' },
            cancelled: { color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: Clock, label: 'Cancelado' }
        };
        return configs[status] || configs.pending;
    };

    if (orders.length === 0) {
        return (
            <div className="text-center py-16">
                <div className="bg-black rounded-2xl border-2 border-[#22c55e]/50 p-12 max-w-md mx-auto relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-green to-transparent"></div>
                    <Package className="w-20 h-20 text-[#22c55e]/50 mx-auto mb-6" />
                    <h3 className="text-2xl font-graffiti text-white mb-3">AÚN NO TIENES PEDIDOS</h3>
                    <p className="text-white/60 mb-8">¡Explora nuestro catálogo y realiza tu primer pedido!</p>
                    <Link
                        to="/catalogo"
                        className="inline-flex items-center gap-2 bg-[#22c55e] text-black px-8 py-4 rounded-xl font-black hover:bg-green-400 transition-all"
                    >
                        <ShoppingCart className="w-5 h-5" />
                        IR AL CATÁLOGO
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {orders.map((order) => {
                const statusConfig = getStatusConfig(order.status);
                const StatusIcon = statusConfig.icon;
                const isExpanded = expandedOrder === order.id;
                const items = orderItems[order.id] || [];
                const canDownload = ['paid', 'processing', 'shipped', 'delivered', 'confirmed'].includes(order.status);

                return (
                    <div
                        key={order.id}
                        className="bg-black border-2 border-[#22c55e]/40 rounded-2xl overflow-hidden transition-all hover:border-[#22c55e] hover:shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                    >
                        {/* Header con gradiente */}
                        <div className="bg-gradient-to-r from-green-950/40 via-black to-green-950/40 p-6">
                            <div className="flex items-start justify-between flex-wrap gap-4">
                                <div className="flex items-start gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-[#22c55e]/20 border border-[#22c55e]/50 flex items-center justify-center">
                                        <Package className="w-7 h-7 text-[#22c55e]" />
                                    </div>
                                    <div>
                                        <h3 className="text-white font-graffiti text-xl">
                                            PEDIDO #{order.id.slice(0, 8).toUpperCase()}
                                        </h3>
                                        <p className="text-white/50 text-sm flex items-center gap-2 mt-1">
                                            <Calendar className="w-4 h-4" />
                                            {new Date(order.created_at).toLocaleDateString('es-CL', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            })}
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-black text-[#22c55e]">
                                        ${((order.total_amount || 0) + (order.shipping_cost || 0)).toLocaleString('es-CL')}
                                    </p>
                                    <span className={`inline-flex items-center gap-1.5 mt-2 px-4 py-2 rounded-lg text-xs font-black uppercase border ${statusConfig.color}`}>
                                        <StatusIcon className="w-4 h-4" />
                                        {statusConfig.label}
                                    </span>
                                </div>
                            </div>

                            {/* Tracking info */}
                            {order.tracking_number && (
                                <div className="mt-5 p-4 bg-cyan-950/30 border-2 border-cyan-500/40 rounded-xl flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-lg bg-cyan-500/20 flex items-center justify-center">
                                        <Truck className="w-6 h-6 text-cyan-400" />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-cyan-400 font-bold uppercase">Número de Seguimiento</p>
                                        <p className="font-mono font-black text-white text-lg">{order.tracking_number}</p>
                                    </div>
                                    <a
                                        href={`https://www.blue.cl/seguimiento/?n_seguimiento=${order.tracking_number}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="bg-cyan-500 text-black font-black px-4 py-2 rounded-lg hover:bg-cyan-400 transition-colors"
                                    >
                                        RASTREAR →
                                    </a>
                                </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-center gap-4 mt-5 pt-5 border-t border-[#22c55e]/20">
                                <button
                                    onClick={() => toggleExpand(order.id)}
                                    className="flex items-center gap-2 text-sm font-bold text-white/70 hover:text-[#22c55e] transition-colors"
                                >
                                    <Eye className="w-5 h-5" />
                                    {isExpanded ? 'OCULTAR DETALLES' : 'VER DETALLES'}
                                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                </button>

                                {canDownload && (
                                    <button
                                        onClick={() => handleDownload(order)}
                                        disabled={downloadingId === order.id}
                                        className="flex items-center gap-2 text-sm font-bold text-[#22c55e] hover:text-green-400 transition-colors disabled:opacity-50"
                                    >
                                        <Download className="w-5 h-5" />
                                        {downloadingId === order.id ? 'GENERANDO...' : 'DESCARGAR COMPROBANTE'}
                                    </button>
                                )}
                            </div>
                        </div>

                        {/* Expanded Details */}
                        {isExpanded && (
                            <div className="border-t-2 border-[#22c55e]/30 p-6 bg-green-950/20">
                                <h4 className="font-black text-white mb-5 flex items-center gap-2 uppercase">
                                    <FileText className="w-5 h-5 text-[#22c55e]" />
                                    Productos del Pedido
                                </h4>
                                {items && items.length > 0 ? (
                                    <div className="space-y-3">
                                        {items.map((item, idx) => {
                                            const productName = item.product_snapshot?.name || item.product_name || 'Producto sin nombre';
                                            const productBrand = item.product_snapshot?.brand || '';
                                            return (
                                                <div key={idx} className="flex items-center justify-between p-4 bg-black border border-[#22c55e]/20 rounded-xl">
                                                    <div>
                                                        <p className="text-white font-bold">{productName}</p>
                                                        {productBrand && <p className="text-[#22c55e] text-sm">{productBrand}</p>}
                                                        <p className="text-sm text-white/50">Cantidad: {item.quantity || 1} × ${(item.unit_price || 0).toLocaleString('es-CL')}</p>
                                                    </div>
                                                    <p className="text-[#22c55e] font-black text-lg">
                                                        ${((item.unit_price || 0) * (item.quantity || 1)).toLocaleString('es-CL')}
                                                    </p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="text-center py-6">
                                        <div className="animate-pulse text-[#22c55e]">Cargando productos...</div>
                                    </div>
                                )}

                                {/* Order Summary */}
                                <div className="mt-6 pt-6 border-t-2 border-[#22c55e]/30 space-y-3">
                                    {order.shipping_address && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-white/50 flex items-center gap-2">
                                                <MapPin className="w-4 h-4" /> Dirección
                                            </span>
                                            <span className="text-white text-right max-w-xs">
                                                {typeof order.shipping_address === 'object'
                                                    ? `${order.shipping_address.street_address || ''} ${order.shipping_address.street_number || ''}, ${order.shipping_address.comuna || ''}`
                                                    : order.shipping_address}
                                            </span>
                                        </div>
                                    )}
                                    {order.discount_amount > 0 && (
                                        <div className="flex justify-between text-sm">
                                            <span className="text-white/50">Descuento</span>
                                            <span className="text-[#22c55e] font-bold">-${order.discount_amount?.toLocaleString('es-CL')}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between text-sm">
                                        <span className="text-white/50">Envío</span>
                                        <span className="text-white font-bold">${order.shipping_cost?.toLocaleString('es-CL') || '0'}</span>
                                    </div>
                                    <div className="flex justify-between font-black text-xl pt-3 border-t border-[#22c55e]/20">
                                        <span className="text-white">TOTAL</span>
                                        <span className="text-[#22c55e]">${order.total_amount?.toLocaleString('es-CL')}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

// Addresses Tab Component
const AddressesTab = ({ addresses, onUpdate }) => {
    const { user } = useAuth();
    const [showModal, setShowModal] = useState(false);
    const [editingAddress, setEditingAddress] = useState(null);
    const [deletingAddressId, setDeletingAddressId] = useState(null);

    const handleAddNew = () => {
        setEditingAddress(null);
        setShowModal(true);
    };

    const handleEdit = (address) => {
        setEditingAddress(address);
        setShowModal(true);
    };

    const confirmDelete = async () => {
        if (!deletingAddressId) return;

        try {
            const { error } = await supabase
                .from('addresses')
                .delete()
                .eq('id', deletingAddressId)
                .eq('user_id', user.id);

            if (error) {
                console.error('Error deleting address:', error);
                alert(`Error: ${error.message}`);
                return;
            }

            onUpdate();
        } catch (error) {
            console.error('Error deleting address:', error);
            alert(`Error al eliminar dirección: ${error.message}`);
        } finally {
            setDeletingAddressId(null);
        }
    };

    const handleSave = () => {
        onUpdate();
    };

    return (
        <div>
            {/* Delete Confirmation Modal */}
            {deletingAddressId && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50">
                    <div className="bg-[#111] border border-red-500/50 rounded-2xl p-8 max-w-md mx-4 text-center">
                        <Trash2 className="w-16 h-16 text-red-500 mx-auto mb-4" />
                        <h3 className="text-2xl font-graffiti text-white mb-2">¿ELIMINAR DIRECCIÓN?</h3>
                        <p className="text-gray-400 mb-6">Esta acción no se puede deshacer.</p>
                        <div className="flex gap-4">
                            <button
                                type="button"
                                onClick={() => setDeletingAddressId(null)}
                                className="flex-1 bg-gray-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-gray-700 transition-colors"
                            >
                                CANCELAR
                            </button>
                            <button
                                type="button"
                                onClick={confirmDelete}
                                className="flex-1 bg-red-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-red-500 transition-colors"
                            >
                                ELIMINAR
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-black text-white uppercase flex items-center gap-2">
                    <MapPin className="w-6 h-6 text-[#22c55e]" />
                    Mis Direcciones
                </h3>
                <button
                    onClick={handleAddNew}
                    className="bg-[#22c55e] text-black px-5 py-3 rounded-xl font-black hover:bg-green-400 transition-colors flex items-center gap-2"
                >
                    <Plus className="w-5 h-5" />
                    NUEVA DIRECCIÓN
                </button>
            </div>

            {addresses.length === 0 ? (
                <div className="text-center py-16">
                    <div className="bg-black rounded-2xl border-2 border-[#22c55e]/50 p-12 max-w-md mx-auto relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-brand-green to-transparent"></div>
                        <MapPin className="w-20 h-20 text-[#22c55e]/50 mx-auto mb-6" />
                        <h3 className="text-2xl font-graffiti text-white mb-3">SIN DIRECCIONES</h3>
                        <p className="text-white/60 mb-8">Agrega una dirección para tus envíos</p>
                        <button
                            onClick={handleAddNew}
                            className="inline-flex items-center gap-2 bg-[#22c55e] text-black px-8 py-4 rounded-xl font-black hover:bg-green-400 transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            AGREGAR DIRECCIÓN
                        </button>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {addresses.map((address) => (
                        <div key={address.id} className="bg-black border-2 border-[#22c55e]/40 rounded-2xl p-5 hover:border-[#22c55e] transition-all hover:shadow-[0_0_15px_rgba(34,197,94,0.15)]">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-[#22c55e]/20 flex items-center justify-center">
                                        <Home className="w-5 h-5 text-[#22c55e]" />
                                    </div>
                                    <h4 className="text-white font-black">{address.label || 'Dirección'}</h4>
                                </div>
                                {address.is_default && (
                                    <span className="bg-[#22c55e] text-black text-xs px-3 py-1 rounded-lg font-black uppercase">
                                        Principal
                                    </span>
                                )}
                            </div>
                            <div className="space-y-1 text-sm mb-4">
                                <p className="text-white font-medium">{address.recipient_name}</p>
                                <p className="text-white/60">{address.street_address} {address.street_number}</p>
                                {address.apartment && <p className="text-white/60">{address.apartment}</p>}
                                <p className="text-white/60">{address.comuna}, {address.region}</p>
                                <p className="text-[#22c55e] font-medium">{address.phone}</p>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-[#22c55e]/20">
                                <button
                                    type="button"
                                    onClick={() => handleEdit(address)}
                                    className="flex-1 bg-green-950/30 text-[#22c55e] px-4 py-2 rounded-xl font-bold hover:bg-green-950/50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Edit className="w-4 h-4" />
                                    EDITAR
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setDeletingAddressId(address.id)}
                                    className="flex-1 bg-red-950/30 text-red-500 px-4 py-2 rounded-xl font-bold hover:bg-red-950/50 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    ELIMINAR
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {showModal && (
                <AddressFormModal
                    address={editingAddress}
                    userId={user.id}
                    onClose={() => setShowModal(false)}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

// Profile Tab Component
const ProfileTab = ({ profile, user, onUpdate }) => {
    const [formData, setFormData] = useState({
        name: profile?.name || '',
        phone: profile?.phone || '',
        birthdate: profile?.birthdate || '',
        avatar_url: profile?.avatar_url || '',
        newsletter_subscribed: profile?.newsletter_subscribed || false
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            const { error } = await supabase
                .from('profiles')
                .update(formData)
                .eq('id', user.id);

            if (error) throw error;

            alert('Perfil actualizado correctamente');
            onUpdate();
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Error al actualizar perfil');
        } finally {
            setSaving(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
            {/* Avatar URL con preview */}
            <div>
                <label className="block text-sm font-bold text-white mb-2">Foto de Perfil (URL)</label>
                <div className="flex items-center gap-4">
                    <img
                        src={formData.avatar_url || "https://i.postimg.cc/PvxrxX1d/420grow-480p.png"}
                        alt="Preview"
                        className="w-16 h-16 rounded-full object-cover border-2 border-[#22c55e]"
                    />
                    <input
                        type="url"
                        placeholder="https://ejemplo.com/tu-imagen.png"
                        value={formData.avatar_url}
                        onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
                        className="flex-1 bg-black border-2 border-[#22c55e]/30 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-[#22c55e] placeholder:text-white/30"
                    />
                </div>
                <p className="text-white/50 text-xs mt-1">Pega el link de una imagen de tu perfil</p>
            </div>

            <div>
                <label className="block text-sm font-bold text-white mb-2">Nombre Completo</label>
                <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-[#22c55e]" />
                    <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="w-full bg-black border-2 border-[#22c55e]/30 rounded-xl pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#22c55e]"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Email</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="email"
                        value={user?.email}
                        disabled
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-slate-500 cursor-not-allowed"
                    />
                </div>
                <p className="text-slate-500 text-xs mt-1">El email no se puede cambiar</p>
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Teléfono</label>
                <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#22c55e]"
                    />
                </div>
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Fecha de Nacimiento</label>
                <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        type="date"
                        value={formData.birthdate}
                        onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-[#22c55e]"
                    />
                </div>
            </div>

            <div>
                <label className="flex items-center gap-2 cursor-pointer">
                    <input
                        type="checkbox"
                        checked={formData.newsletter_subscribed}
                        onChange={(e) => setFormData({ ...formData, newsletter_subscribed: e.target.checked })}
                        className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-[#22c55e] focus:ring-brand-green"
                    />
                    <span className="text-slate-300">Suscribirme al newsletter</span>
                </label>
            </div>

            <button
                type="submit"
                disabled={saving}
                className="bg-[#22c55e] text-black px-6 py-3 rounded-lg font-bold hover:bg-green-400 transition-colors disabled:opacity-50"
            >
                {saving ? 'Guardando...' : 'Guardar Cambios'}
            </button>
        </form>
    );
};

// Password Tab Component
const PasswordTab = () => {
    const [formData, setFormData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (formData.newPassword !== formData.confirmPassword) {
            setMessage('Las contraseñas no coinciden');
            return;
        }

        if (formData.newPassword.length < 6) {
            setMessage('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const { error } = await supabase.auth.updateUser({
                password: formData.newPassword
            });

            if (error) throw error;

            setMessage('Contraseña actualizada correctamente');
            setFormData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error) {
            console.error('Error updating password:', error);
            setMessage('Error al actualizar contraseña');
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
            <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Nueva Contraseña</label>
                <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#22c55e]"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-slate-300 mb-2">Confirmar Nueva Contraseña</label>
                <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[#22c55e]"
                    required
                />
            </div>

            {message && (
                <div className={`p-4 rounded-lg ${message.includes('correctamente') ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                    {message}
                </div>
            )}

            <button
                type="submit"
                disabled={loading}
                className="bg-[#22c55e] text-black px-6 py-3 rounded-lg font-bold hover:bg-green-400 transition-colors disabled:opacity-50"
            >
                {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
            </button>
        </form>
    );
};

export default MyAccountPage;
