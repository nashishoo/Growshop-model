import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Save, AlertCircle, Trash2, AlertTriangle, LogOut, User, Building2, Settings as SettingsIcon, Code } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SettingsPage = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [user, setUser] = useState(null);
    const [profile, setProfile] = useState(null);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState('');
    const [toastType, setToastType] = useState('success');
    const [showInactiveModal, setShowInactiveModal] = useState(false);
    const [showDeleteInactiveModal, setShowDeleteInactiveModal] = useState(false);
    const [showDeleteAllOrdersModal, setShowDeleteAllOrdersModal] = useState(false);

    const [businessInfo, setBusinessInfo] = useState({
        company_name: '',
        tax_id: '',
        address_street: '',
        address_city: '',
        address_region: '',
        address_postal_code: '',
        phone: '',
        email: '',
        website: ''
    });

    const [ecommerceSettings, setEcommerceSettings] = useState({
        currency: 'CLP',
        tax_rate: 19.00,
        enable_cart: true,
        enable_checkout: true,
        enable_reviews: false
    });

    const [profileImage, setProfileImage] = useState('');

    useEffect(() => {
        loadUserAndSettings();
    }, []);

    const loadUserAndSettings = async () => {
        try {
            // Get current user
            const { data: { user } } = await supabase.auth.getUser();
            setUser(user);

            // Get profile
            const { data: profileData } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', user.id)
                .single();

            setProfile(profileData);
            setProfileImage(profileData?.profile_image_url || '');

            // Get store settings
            const { data: settings } = await supabase
                .from('store_settings')
                .select('*')
                .limit(1)
                .single();

            if (settings) {
                setBusinessInfo({
                    company_name: settings.company_name || '',
                    tax_id: settings.tax_id || '',
                    address_street: settings.address_street || '',
                    address_city: settings.address_city || '',
                    address_region: settings.address_region || '',
                    address_postal_code: settings.address_postal_code || '',
                    phone: settings.phone || '',
                    email: settings.email || '',
                    website: settings.website || ''
                });

                setEcommerceSettings({
                    currency: settings.currency || 'CLP',
                    tax_rate: settings.tax_rate || 19.00,
                    enable_cart: settings.enable_cart ?? true,
                    enable_checkout: settings.enable_checkout ?? true,
                    enable_reviews: settings.enable_reviews ?? false
                });
            }
        } catch (error) {
            console.error('Error loading settings:', error);
            showToastNotification('Error al cargar configuración', 'error');
        } finally {
            setLoading(false);
        }
    };

    const showToastNotification = (message, type = 'success') => {
        setToastMessage(message);
        setToastType(type);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleSaveBusinessInfo = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('store_settings')
                .upsert({
                    id: (await supabase.from('store_settings').select('id').limit(1).single()).data?.id,
                    ...businessInfo,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            showToastNotification('Información del negocio guardada', 'success');
        } catch (error) {
            console.error('Error saving business info:', error);
            showToastNotification('Error al guardar', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveEcommerceSettings = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('store_settings')
                .upsert({
                    id: (await supabase.from('store_settings').select('id').limit(1).single()).data?.id,
                    ...ecommerceSettings,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
            showToastNotification('Configuración de eCommerce guardada', 'success');
        } catch (error) {
            console.error('Error saving ecommerce settings:', error);
            showToastNotification('Error al guardar', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleSaveProfileImage = async () => {
        setSaving(true);
        try {
            const { error } = await supabase
                .from('profiles')
                .update({ profile_image_url: profileImage.trim() || null })
                .eq('id', user.id);

            if (error) throw error;
            showToastNotification('Imagen de perfil actualizada', 'success');
        } catch (error) {
            console.error('Error saving profile image:', error);
            showToastNotification('Error al guardar imagen', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleMarkAllInactive = () => {
        setShowInactiveModal(true);
    };

    const confirmMarkAllInactive = async () => {
        setShowInactiveModal(false);
        setSaving(true);
        try {
            const { error } = await supabase
                .from('products')
                .update({ is_active: false })
                .neq('id', '00000000-0000-0000-0000-000000000000');

            if (error) throw error;
            showToastNotification('Todo el inventario marcado como inactivo', 'success');
        } catch (error) {
            console.error('Error marking all inactive:', error);
            showToastNotification('Error al marcar inactivos', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAllInactive = () => {
        setShowDeleteInactiveModal(true);
    };

    const confirmDeleteAllInactive = async () => {
        setShowDeleteInactiveModal(false);
        setSaving(true);
        try {
            const { error } = await supabase
                .from('products')
                .delete()
                .eq('is_active', false);

            if (error) throw error;
            showToastNotification('Productos inactivos eliminados', 'success');
        } catch (error) {
            console.error('Error deleting inactive products:', error);
            showToastNotification('Error al eliminar', 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleDeleteAllOrders = () => {
        setShowDeleteAllOrdersModal(true);
    };

    const confirmDeleteAllOrders = async () => {
        setShowDeleteAllOrdersModal(false);
        setSaving(true);
        try {
            // Delete payment logs (RLS allows admin)
            const { error: logsError } = await supabase
                .from('payment_logs')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000');

            if (logsError) {
                console.warn('Error deleting payment logs:', logsError);
            }

            // Delete order_items first (child records, RLS allows admin)
            const { error: itemsError } = await supabase
                .from('order_items')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000');

            if (itemsError) throw itemsError;

            // Delete orders (RLS allows admin)
            const { error: ordersError } = await supabase
                .from('orders')
                .delete()
                .neq('id', '00000000-0000-0000-0000-000000000000');

            if (ordersError) throw ordersError;

            showToastNotification('✅ Todas las órdenes eliminadas exitosamente', 'success');

            // Refresh page after 1 second
            setTimeout(() => window.location.reload(), 1000);
        } catch (error) {
            console.error('Error deleting all orders:', error);
            showToastNotification('Error: ' + error.message, 'error');
        } finally {
            setSaving(false);
        }
    };

    const handleLogout = async () => {
        try {
            await supabase.auth.signOut();
            navigate('/login');
        } catch (error) {
            console.error('Error logging out:', error);
            showToastNotification('Error al cerrar sesión', 'error');
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-white text-xl">Cargando configuración...</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Configuración</h1>
                <p className="text-slate-400 text-sm">Gestiona la configuración de tu tienda y perfil</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* User Profile Section */}
                <div className="lg:col-span-1">
                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <User className="w-6 h-6 text-brand-green" />
                            <h2 className="text-xl font-bold text-white">Perfil</h2>
                        </div>

                        {/* Profile Image */}
                        <div className="mb-6">
                            <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden bg-slate-700 flex items-center justify-center">
                                {profileImage ? (
                                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    <User className="w-16 h-16 text-slate-500" />
                                )}
                            </div>
                            <input
                                type="text"
                                value={profileImage}
                                onChange={(e) => setProfileImage(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-green transition-colors mb-2"
                                placeholder="URL de imagen de perfil"
                            />
                            <button
                                onClick={handleSaveProfileImage}
                                disabled={saving}
                                className="w-full bg-brand-green text-black px-4 py-2 rounded-lg font-bold hover:bg-green-400 transition-colors disabled:opacity-50"
                            >
                                Guardar Imagen
                            </button>
                        </div>

                        {/* User Info */}
                        <div className="space-y-3 mb-6">
                            <div>
                                <p className="text-slate-400 text-sm">Email</p>
                                <p className="text-white font-medium">{user?.email}</p>
                            </div>
                            <div>
                                <p className="text-slate-400 text-sm">Rol</p>
                                <p className="text-white font-medium">{profile?.role || 'admin'}</p>
                            </div>
                        </div>

                        {/* Logout Button */}
                        <button
                            onClick={handleLogout}
                            className="w-full bg-red-500 text-white px-4 py-3 rounded-lg font-bold hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                        >
                            <LogOut className="w-5 h-5" />
                            Cerrar Sesión
                        </button>
                    </div>
                </div>

                {/* Main Settings */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Business Information */}
                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Building2 className="w-6 h-6 text-brand-green" />
                            <h2 className="text-xl font-bold text-white">Información del Negocio</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Nombre de la Empresa</label>
                                <input
                                    type="text"
                                    value={businessInfo.company_name}
                                    onChange={(e) => setBusinessInfo({ ...businessInfo, company_name: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-green"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">RUT Empresa</label>
                                <input
                                    type="text"
                                    value={businessInfo.tax_id}
                                    onChange={(e) => {
                                        // Auto-format RUT: XX.XXX.XXX-X
                                        let value = e.target.value.replace(/[^0-9kK]/g, '').toUpperCase();
                                        if (value.length > 1) {
                                            const dv = value.slice(-1);
                                            let body = value.slice(0, -1);
                                            body = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
                                            value = body + '-' + dv;
                                        }
                                        setBusinessInfo({ ...businessInfo, tax_id: value });
                                    }}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-green"
                                    placeholder="Ej: 76.XXX.XXX-X"
                                    maxLength={12}
                                />
                                <p className="text-slate-500 text-xs mt-1">Formato: XX.XXX.XXX-X</p>
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-bold text-slate-300 mb-2">Dirección</label>
                                <input
                                    type="text"
                                    value={businessInfo.address_street}
                                    onChange={(e) => setBusinessInfo({ ...businessInfo, address_street: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-green"
                                    placeholder="Calle y número"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Ciudad</label>
                                <input
                                    type="text"
                                    value={businessInfo.address_city}
                                    onChange={(e) => setBusinessInfo({ ...businessInfo, address_city: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-green"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Región</label>
                                <input
                                    type="text"
                                    value={businessInfo.address_region}
                                    onChange={(e) => setBusinessInfo({ ...businessInfo, address_region: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-green"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Código Postal</label>
                                <input
                                    type="text"
                                    value={businessInfo.address_postal_code}
                                    onChange={(e) => setBusinessInfo({ ...businessInfo, address_postal_code: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-green"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Teléfono</label>
                                <input
                                    type="text"
                                    value={businessInfo.phone}
                                    onChange={(e) => setBusinessInfo({ ...businessInfo, phone: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-green"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Email</label>
                                <input
                                    type="email"
                                    value={businessInfo.email}
                                    onChange={(e) => setBusinessInfo({ ...businessInfo, email: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-green"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Sitio Web</label>
                                <input
                                    type="text"
                                    value={businessInfo.website}
                                    onChange={(e) => setBusinessInfo({ ...businessInfo, website: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-green"
                                    placeholder="https://..."
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSaveBusinessInfo}
                            disabled={saving}
                            className="bg-brand-green text-black px-6 py-2 rounded-lg font-bold hover:bg-green-400 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            Guardar Información
                        </button>
                    </div>

                    {/* E-commerce Settings */}
                    <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <SettingsIcon className="w-6 h-6 text-brand-green" />
                            <h2 className="text-xl font-bold text-white">Configuración eCommerce</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Moneda</label>
                                <select
                                    value={ecommerceSettings.currency}
                                    onChange={(e) => setEcommerceSettings({ ...ecommerceSettings, currency: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-green"
                                >
                                    <option value="CLP">CLP (Peso Chileno)</option>
                                    <option value="USD">USD (Dólar)</option>
                                    <option value="EUR">EUR (Euro)</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">IVA (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    value={ecommerceSettings.tax_rate}
                                    onChange={(e) => setEcommerceSettings({ ...ecommerceSettings, tax_rate: parseFloat(e.target.value) })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-brand-green"
                                />
                            </div>
                        </div>

                        <button
                            onClick={handleSaveEcommerceSettings}
                            disabled={saving}
                            className="bg-brand-green text-black px-6 py-2 rounded-lg font-bold hover:bg-green-400 transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            Guardar Configuración
                        </button>
                    </div>

                    {/* Dev Tools - Danger Zone */}
                    <div className="bg-red-900/20 border border-red-700 rounded-lg p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <Code className="w-6 h-6 text-red-500" />
                            <h2 className="text-xl font-bold text-white">Dev Tools - Zona Peligrosa</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-4 bg-slate-800 border border-slate-700 rounded-lg">
                                <AlertTriangle className="w-6 h-6 text-yellow-500 flex-shrink-0 mt-1" />
                                <div className="flex-1">
                                    <h3 className="text-white font-bold mb-1">Marcar Todo Inactivo</h3>
                                    <p className="text-slate-400 text-sm mb-3">Marca todos los productos del inventario como inactivos</p>
                                    <button
                                        onClick={handleMarkAllInactive}
                                        disabled={saving}
                                        className="bg-yellow-500 text-black px-4 py-2 rounded-lg font-bold hover:bg-yellow-400 transition-colors disabled:opacity-50"
                                    >
                                        Marcar Todo Inactivo
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-slate-800 border border-red-700 rounded-lg">
                                <Trash2 className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                                <div className="flex-1">
                                    <h3 className="text-white font-bold mb-1">Eliminar Todos los Inactivos</h3>
                                    <p className="text-slate-400 text-sm mb-3">⚠️ Elimina permanentemente todos los productos marcados como inactivos</p>
                                    <button
                                        onClick={handleDeleteAllInactive}
                                        disabled={saving}
                                        className="bg-red-500 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-600 transition-colors disabled:opacity-50"
                                    >
                                        Eliminar Inactivos
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-start gap-3 p-4 bg-slate-800 border border-red-700 rounded-lg">
                                <Trash2 className="w-6 h-6 text-red-500 flex-shrink-0 mt-1" />
                                <div className="flex-1">
                                    <h3 className="text-white font-bold mb-1">Eliminar Todas las Órdenes</h3>
                                    <p className="text-slate-400 text-sm mb-3">🗑️ Elimina TODAS las órdenes de prueba (admin y clientes). NO se puede deshacer.</p>
                                    <button
                                        onClick={handleDeleteAllOrders}
                                        disabled={saving}
                                        className="bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
                                    >
                                        Eliminar Todas las Órdenes
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Toast */}
            {showToast && (
                <div className={`fixed top-4 right-4 z-[60] px-6 py-3 rounded-lg shadow-lg animate-slide-in ${toastType === 'success' ? 'bg-green-500' : 'bg-red-500'} text-white font-bold`}>
                    {toastMessage}
                </div>
            )}

            {/* Mark All Inactive Modal */}
            {showInactiveModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#111] border-2 border-brand-yellow/50 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-brand-yellow/20">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-full bg-brand-yellow/20 flex items-center justify-center">
                                <AlertTriangle className="w-8 h-8 text-brand-yellow" />
                            </div>
                            <div>
                                <h3 className="text-xl font-graffiti text-white uppercase tracking-wide">ADVERTENCIA</h3>
                                <p className="text-brand-yellow text-xs font-mono uppercase tracking-wider">Acción masiva</p>
                            </div>
                        </div>

                        <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                            ¿Estás seguro de que deseas <span className="text-brand-yellow font-black">MARCAR TODO EL INVENTARIO</span> como inactivo?
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowInactiveModal(false)}
                                className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-xl font-bold uppercase text-sm tracking-wider hover:bg-gray-700 transition-all border border-gray-700"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmMarkAllInactive}
                                disabled={saving}
                                className="flex-1 px-6 py-3 bg-brand-yellow text-black rounded-xl font-black uppercase text-sm tracking-wider hover:bg-white transition-all disabled:opacity-50 shadow-lg shadow-brand-yellow/30"
                            >
                                {saving ? 'PROCESANDO...' : 'SÍ, MARCAR'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Inactive Products Modal */}
            {showDeleteInactiveModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#111] border-2 border-red-500/50 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-red-500/20">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center">
                                <Trash2 className="w-8 h-8 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-graffiti text-white uppercase tracking-wide">ELIMINAR INACTIVOS</h3>
                                <p className="text-red-500 text-xs font-mono uppercase tracking-wider">Acción irreversible</p>
                            </div>
                        </div>

                        <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                            ¿Estás seguro de que deseas <span className="text-red-500 font-black">ELIMINAR TODOS LOS PRODUCTOS INACTIVOS</span>?
                        </p>

                        <p className="text-gray-500 text-xs font-mono mb-8 p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                            Esta acción NO se puede deshacer.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteInactiveModal(false)}
                                className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-xl font-bold uppercase text-sm tracking-wider hover:bg-gray-700 transition-all border border-gray-700"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDeleteAllInactive}
                                disabled={saving}
                                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-black uppercase text-sm tracking-wider hover:bg-red-500 transition-all disabled:opacity-50 shadow-lg shadow-red-500/30"
                            >
                                {saving ? 'ELIMINANDO...' : 'SÍ, ELIMINAR'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete All Orders Modal */}
            {showDeleteAllOrdersModal && (
                <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#111] border-2 border-red-600/70 rounded-2xl p-8 max-w-lg w-full shadow-2xl shadow-red-600/30 animate-in zoom-in-95">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-16 h-16 rounded-full bg-red-600/30 flex items-center justify-center animate-pulse">
                                <Trash2 className="w-10 h-10 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-graffiti text-white uppercase tracking-wide">⚠️ PELIGRO EXTREMO</h3>
                                <p className="text-red-500 text-xs font-mono uppercase tracking-wider font-black">Eliminar TODAS las órdenes</p>
                            </div>
                        </div>

                        <div className="bg-red-500/10 border-2 border-red-500/50 rounded-xl p-6 mb-6">
                            <p className="text-white mb-3 text-base leading-relaxed font-bold">
                                Estás a punto de <span className="text-red-500 font-black text-lg">ELIMINAR PERMANENTEMENTE</span> TODAS las órdenes:
                            </p>
                            <ul className="text-gray-300 text-sm space-y-2 ml-4 list-disc">
                                <li>Órdenes de todos los clientes</li>
                                <li>Órdenes de prueba y reales</li>
                                <li>Todo el historial de ventas</li>
                                <li>Registros de pagos asociados</li>
                            </ul>
                        </div>

                        <div className="bg-black/50 border border-red-500/30 rounded-lg p-4 mb-8">
                            <p className="text-red-400 text-xs font-mono uppercase tracking-wider text-center font-black">
                                🚨 ESTA ACCIÓN NO SE PUEDE DESHACER 🚨
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteAllOrdersModal(false)}
                                className="flex-1 px-6 py-4 bg-gray-800 text-white rounded-xl font-bold uppercase text-sm tracking-wider hover:bg-gray-700 transition-all border border-gray-700"
                            >
                                ✓ Cancelar (Recomendado)
                            </button>
                            <button
                                onClick={confirmDeleteAllOrders}
                                disabled={saving}
                                className="flex-1 px-6 py-4 bg-red-600 text-white rounded-xl font-black uppercase text-sm tracking-wider hover:bg-red-700 transition-all disabled:opacity-50 shadow-lg shadow-red-600/50 hover:scale-105"
                            >
                                {saving ? 'ELIMINANDO...' : '⚠️ SÍ, ELIMINAR TODO'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SettingsPage;
