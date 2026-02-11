import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import {
    MapPin,
    Plus,
    Edit,
    Trash2,
    Search,
    Filter,
    DollarSign,
    Clock,
    Download,
    Upload
} from 'lucide-react';

const ShippingManagement = () => {
    const [zones, setZones] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRegion, setFilterRegion] = useState('all');
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingZone, setEditingZone] = useState(null);

    useEffect(() => {
        loadZones();
    }, []);

    const loadZones = async () => {
        try {
            const { data, error } = await supabase
                .from('shipping_zones')
                .select('*')
                .order('region', { ascending: true })
                .order('comuna', { ascending: true });

            if (error) throw error;
            setZones(data || []);
        } catch (error) {
            console.error('Error loading zones:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar esta zona de envío?')) return;

        try {
            const { error } = await supabase
                .from('shipping_zones')
                .delete()
                .eq('id', id);

            if (error) throw error;
            loadZones();
        } catch (error) {
            console.error('Error deleting zone:', error);
            alert('Error al eliminar zona');
        }
    };

    const handleEdit = (zone) => {
        setEditingZone(zone);
        setShowAddModal(true);
    };

    const handleCloseModal = () => {
        setShowAddModal(false);
        setEditingZone(null);
    };

    const handleSave = () => {
        loadZones();
        handleCloseModal();
    };

    // Get unique regions for filter
    const regions = [...new Set(zones.map(z => z.region))];

    // Filter zones
    const filteredZones = zones.filter(zone => {
        const matchesSearch = zone.comuna.toLowerCase().includes(searchTerm.toLowerCase()) ||
            zone.region.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRegion = filterRegion === 'all' || zone.region === filterRegion;
        return matchesSearch && matchesRegion;
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-white text-xl">Cargando zonas...</div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Gestión de Envíos</h1>
                <p className="text-slate-400 text-sm">Administra las zonas y precios de envío</p>
            </div>

            {/* Actions Bar */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-4 mb-6">
                <div className="flex flex-wrap items-center gap-4">
                    {/* Search */}
                    <div className="flex-1 min-w-[200px]">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Buscar por comuna o región..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-brand-green"
                            />
                        </div>
                    </div>

                    {/* Region Filter */}
                    <div className="min-w-[200px]">
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <select
                                value={filterRegion}
                                onChange={(e) => setFilterRegion(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-2 text-white focus:outline-none focus:border-brand-green appearance-none"
                            >
                                <option value="all">Todas las regiones</option>
                                {regions.map(region => (
                                    <option key={region} value={region}>{region}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Add Button */}
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="bg-brand-green text-black px-4 py-2 rounded-lg font-bold hover:bg-green-400 transition-colors flex items-center gap-2 whitespace-nowrap"
                    >
                        <Plus className="w-5 h-5" />
                        Nueva Zona
                    </button>

                    {/* Import/Export */}
                    <button className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2">
                        <Upload className="w-5 h-5" />
                        Importar CSV
                    </button>
                    <button className="bg-slate-700 text-white px-4 py-2 rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2">
                        <Download className="w-5 h-5" />
                        Exportar
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <MapPin className="w-8 h-8 text-brand-green" />
                        <div>
                            <div className="text-2xl font-bold text-white">{zones.length}</div>
                            <div className="text-sm text-slate-400">Zonas Activas</div>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <DollarSign className="w-8 h-8 text-blue-400" />
                        <div>
                            <div className="text-2xl font-bold text-white">
                                ${zones.length > 0 ? Math.min(...zones.map(z => z.base_price)).toLocaleString() : 0}
                            </div>
                            <div className="text-sm text-slate-400">Precio Mínimo</div>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <DollarSign className="w-8 h-8 text-green-400" />
                        <div>
                            <div className="text-2xl font-bold text-white">
                                ${zones.length > 0 ? Math.max(...zones.map(z => z.base_price)).toLocaleString() : 0}
                            </div>
                            <div className="text-sm text-slate-400">Precio Máximo</div>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-800 border border-slate-700 rounded-lg p-4">
                    <div className="flex items-center gap-3">
                        <Clock className="w-8 h-8 text-yellow-400" />
                        <div>
                            <div className="text-2xl font-bold text-white">
                                {zones.length > 0 ? Math.round(zones.reduce((acc, z) => acc + z.estimated_days, 0) / zones.length) : 0} días
                            </div>
                            <div className="text-sm text-slate-400">Promedio Entrega</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Zones Table - Desktop / Cards - Mobile */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden lg:block overflow-x-auto">
                    <table className="w-full min-w-[1000px]">
                        <thead className="bg-slate-900 border-b border-slate-700">
                            <tr>
                                <th className="text-left px-6 py-4 text-slate-300 font-bold">Región</th>
                                <th className="text-left px-6 py-4 text-slate-300 font-bold">Comuna</th>
                                <th className="text-right px-6 py-4 text-slate-300 font-bold">Estándar</th>
                                <th className="text-right px-6 py-4 text-slate-300 font-bold">Express</th>
                                <th className="text-center px-6 py-4 text-slate-300 font-bold">Días Est.</th>
                                <th className="text-center px-6 py-4 text-slate-300 font-bold">Días Exp.</th>
                                <th className="text-right px-6 py-4 text-slate-300 font-bold">Envío Gratis</th>
                                <th className="text-center px-6 py-4 text-slate-300 font-bold">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredZones.length === 0 ? (
                                <tr>
                                    <td colSpan="8" className="px-6 py-12 text-center text-slate-400">
                                        No se encontraron zonas de envío
                                    </td>
                                </tr>
                            ) : (
                                filteredZones.map((zone) => (
                                    <tr key={zone.id} className="border-b border-slate-700 hover:bg-slate-750 transition-colors">
                                        <td className="px-6 py-4 text-slate-300">{zone.region}</td>
                                        <td className="px-6 py-4 text-white font-medium">{zone.comuna}</td>
                                        <td className="px-6 py-4 text-right text-white">${zone.base_price.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right text-white">${zone.express_price?.toLocaleString() || '-'}</td>
                                        <td className="px-6 py-4 text-center text-slate-300">{zone.estimated_days}</td>
                                        <td className="px-6 py-4 text-center text-slate-300">{zone.express_days || '-'}</td>
                                        <td className="px-6 py-4 text-right text-green-400">${zone.free_shipping_threshold?.toLocaleString() || '-'}</td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(zone)}
                                                    className="p-2 hover:bg-slate-700 rounded transition-colors text-blue-400 hover:text-blue-300"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(zone.id)}
                                                    className="p-2 hover:bg-slate-700 rounded transition-colors text-red-400 hover:text-red-300"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card View */}
                <div className="lg:hidden p-4 space-y-4">
                    {filteredZones.length === 0 ? (
                        <div className="py-12 text-center text-slate-400">
                            No se encontraron zonas de envío
                        </div>
                    ) : (
                        filteredZones.map((zone) => (
                            <div key={zone.id} className="bg-slate-900 rounded-lg p-4 border border-slate-700">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <h3 className="text-white font-bold text-lg">{zone.comuna}</h3>
                                        <p className="text-slate-400 text-sm">{zone.region}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => handleEdit(zone)}
                                            className="p-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                                        >
                                            <Edit className="w-4 h-4" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(zone.id)}
                                            className="p-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>

                                {/* Pricing Grid */}
                                <div className="grid grid-cols-2 gap-3 mb-3">
                                    <div className="bg-slate-800 rounded-lg p-3">
                                        <p className="text-slate-400 text-xs mb-1">Estándar</p>
                                        <p className="text-white font-bold">${zone.base_price.toLocaleString()}</p>
                                        <p className="text-slate-500 text-xs">{zone.estimated_days} días</p>
                                    </div>
                                    <div className="bg-slate-800 rounded-lg p-3">
                                        <p className="text-slate-400 text-xs mb-1">Express</p>
                                        <p className="text-white font-bold">${zone.express_price?.toLocaleString() || '-'}</p>
                                        <p className="text-slate-500 text-xs">{zone.express_days || '-'} días</p>
                                    </div>
                                </div>

                                {/* Free Shipping */}
                                {zone.free_shipping_threshold && (
                                    <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                                        <p className="text-green-400 text-sm font-bold">
                                            Envío gratis sobre ${zone.free_shipping_threshold.toLocaleString()}
                                        </p>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <ZoneFormModal
                    zone={editingZone}
                    onClose={handleCloseModal}
                    onSave={handleSave}
                />
            )}
        </div>
    );
};

// Zone Form Modal Component
const ZoneFormModal = ({ zone, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        region: zone?.region || '',
        comuna: zone?.comuna || '',
        base_price: zone?.base_price || 4000,
        express_price: zone?.express_price || 6000,
        estimated_days: zone?.estimated_days || 3,
        express_days: zone?.express_days || 1,
        free_shipping_threshold: zone?.free_shipping_threshold || 50000,
        is_active: zone?.is_active ?? true
    });
    const [saving, setSaving] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);

        try {
            if (zone) {
                // Update
                const { error } = await supabase
                    .from('shipping_zones')
                    .update(formData)
                    .eq('id', zone.id);

                if (error) throw error;
            } else {
                // Create
                const { error } = await supabase
                    .from('shipping_zones')
                    .insert([formData]);

                if (error) throw error;
            }

            onSave();
        } catch (error) {
            console.error('Error saving zone:', error);
            alert('Error al guardar zona: ' + error.message);
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-2xl">
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <h3 className="text-2xl font-bold text-white">
                        {zone ? 'Editar Zona' : 'Nueva Zona de Envío'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white">×</button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Región *</label>
                            <input
                                type="text"
                                required
                                value={formData.region}
                                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Comuna *</label>
                            <input
                                type="text"
                                required
                                value={formData.comuna}
                                onChange={(e) => setFormData({ ...formData, comuna: e.target.value })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Precio Estándar *</label>
                            <input
                                type="number"
                                required
                                value={formData.base_price}
                                onChange={(e) => setFormData({ ...formData, base_price: parseFloat(e.target.value) })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Precio Express</label>
                            <input
                                type="number"
                                value={formData.express_price}
                                onChange={(e) => setFormData({ ...formData, express_price: parseFloat(e.target.value) })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Días Estándar</label>
                            <input
                                type="number"
                                value={formData.estimated_days}
                                onChange={(e) => setFormData({ ...formData, estimated_days: parseInt(e.target.value) })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Días Express</label>
                            <input
                                type="number"
                                value={formData.express_days}
                                onChange={(e) => setFormData({ ...formData, express_days: parseInt(e.target.value) })}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-slate-300 mb-2">Umbral Envío Gratis</label>
                        <input
                            type="number"
                            value={formData.free_shipping_threshold}
                            onChange={(e) => setFormData({ ...formData, free_shipping_threshold: parseFloat(e.target.value) })}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white"
                        />
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            checked={formData.is_active}
                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                            className="w-4 h-4"
                        />
                        <label className="text-slate-300">Zona activa</label>
                    </div>

                    <div className="flex gap-3 justify-end pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="px-6 py-3 bg-brand-green text-black font-bold rounded-lg hover:bg-green-400 disabled:opacity-50"
                        >
                            {saving ? 'Guardando...' : 'Guardar'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ShippingManagement;
