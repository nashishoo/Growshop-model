import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { MapPin, X, Save, Home, Briefcase, Building, Search } from 'lucide-react';
import { REGIONES_COMUNAS, ALL_COMUNAS, getRegionForComuna } from '../data/chileanAddresses';

const AddressFormModal = ({ address = null, userId, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        type: address?.type || 'shipping',
        label: address?.label || '',
        recipient_name: address?.recipient_name || '',
        phone: address?.phone || '',
        street_address: address?.street_address || '',
        street_number: address?.street_number || '',
        apartment: address?.apartment || '',
        region: address?.region || '',
        comuna: address?.comuna || '',
        postal_code: address?.postal_code || '',
        reference: address?.reference || '',
        is_default: address?.is_default || false
    });
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState({});

    // Autocomplete states
    const [comunaSearch, setComunaSearch] = useState(address?.comuna || '');
    const [showComunaSuggestions, setShowComunaSuggestions] = useState(false);
    const [filteredComunas, setFilteredComunas] = useState([]);

    const handleChange = (e) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setFormData({
            ...formData,
            [e.target.name]: value
        });
        if (errors[e.target.name]) {
            setErrors({ ...errors, [e.target.name]: '' });
        }
    };

    const handleComunaSearch = (value) => {
        setComunaSearch(value);

        if (value.length >= 2) {
            const filtered = ALL_COMUNAS.filter(comuna =>
                comuna.toLowerCase().includes(value.toLowerCase())
            ).slice(0, 10); // Mostrar max 10 resultados

            setFilteredComunas(filtered);
            setShowComunaSuggestions(filtered.length > 0);
        } else {
            setShowComunaSuggestions(false);
            setFilteredComunas([]);
        }
    };

    const selectComuna = (comuna) => {
        setComunaSearch(comuna);
        setFormData({
            ...formData,
            comuna: comuna,
            region: getRegionForComuna(comuna) || formData.region
        });
        setShowComunaSuggestions(false);
        setFilteredComunas([]);
        // Clear error
        if (errors.comuna) {
            setErrors({ ...errors, comuna: '' });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        if (!formData.recipient_name.trim()) newErrors.recipient_name = 'Nombre requerido';
        if (!formData.phone.trim()) newErrors.phone = 'Teléfono requerido';
        if (!formData.street_address.trim()) newErrors.street_address = 'Dirección requerida';
        if (!formData.region) newErrors.region = 'Región requerida';
        if (!formData.comuna) newErrors.comuna = 'Comuna requerida';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setSaving(true);
        try {
            if (address) {
                const { error } = await supabase
                    .from('addresses')
                    .update({ ...formData, updated_at: new Date().toISOString() })
                    .eq('id', address.id);

                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('addresses')
                    .insert([{ ...formData, user_id: userId }]);

                if (error) throw error;
            }

            onSave();
            onClose();
        } catch (error) {
            console.error('Error saving address:', error);
            alert('Error al guardar dirección');
        } finally {
            setSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-slate-700">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                        <MapPin className="w-6 h-6 text-brand-green" />
                        {address ? 'Editar Dirección' : 'Nueva Dirección'}
                    </h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                    <div className="space-y-6">
                        {/* Type & Label */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Tipo</label>
                                <select
                                    name="type"
                                    value={formData.type}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-green"
                                >
                                    <option value="shipping">Envío</option>
                                    <option value="billing">Facturación</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Etiqueta</label>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, label: 'Casa' })}
                                        className={`flex-1 px-3 py-2 rounded-lg border ${formData.label === 'Casa' ? 'bg-brand-green text-black border-brand-green' : 'bg-slate-900 text-white border-slate-700'} transition-colors`}
                                    >
                                        <Home className="w-4 h-4 mx-auto" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, label: 'Trabajo' })}
                                        className={`flex-1 px-3 py-2 rounded-lg border ${formData.label === 'Trabajo' ? 'bg-brand-green text-black border-brand-green' : 'bg-slate-900 text-white border-slate-700'} transition-colors`}
                                    >
                                        <Briefcase className="w-4 h-4 mx-auto" />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, label: 'Otro' })}
                                        className={`flex-1 px-3 py-2 rounded-lg border ${formData.label === 'Otro' ? 'bg-brand-green text-black border-brand-green' : 'bg-slate-900 text-white border-slate-700'} transition-colors`}
                                    >
                                        <Building className="w-4 h-4 mx-auto" />
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Recipient & Phone */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Nombre Destinatario *</label>
                                <input
                                    type="text"
                                    name="recipient_name"
                                    value={formData.recipient_name}
                                    onChange={handleChange}
                                    className={`w-full bg-slate-900 border ${errors.recipient_name ? 'border-red-500' : 'border-slate-700'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-green`}
                                    placeholder="Juan Pérez"
                                />
                                {errors.recipient_name && <p className="text-red-500 text-xs mt-1">{errors.recipient_name}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Teléfono *</label>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={formData.phone}
                                    onChange={handleChange}
                                    className={`w-full bg-slate-900 border ${errors.phone ? 'border-red-500' : 'border-slate-700'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-green`}
                                    placeholder="+56 9 1234 5678"
                                />
                                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
                            </div>
                        </div>

                        {/* Comuna with Autocomplete */}
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">
                                Comuna * <span className="text-slate-500 text-xs font-normal">(Empieza a escribir para buscar)</span>
                            </label>
                            <div className="relative">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                    <input
                                        type="text"
                                        value={comunaSearch}
                                        onChange={(e) => handleComunaSearch(e.target.value)}
                                        onFocus={() => {
                                            if (filteredComunas.length > 0) {
                                                setShowComunaSuggestions(true);
                                            }
                                        }}
                                        className={`w-full bg-slate-900 border ${errors.comuna ? 'border-red-500' : 'border-slate-700'} rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-brand-green`}
                                        placeholder="Ej: Santiago, Providencia, Maipú..."
                                    />
                                </div>

                                {/* Suggestions Dropdown */}
                                {showComunaSuggestions && filteredComunas.length > 0 && (
                                    <div className="absolute z-10 w-full mt-1 bg-slate-900 border border-slate-700 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                                        {filteredComunas.map((comuna, index) => (
                                            <button
                                                key={index}
                                                type="button"
                                                onClick={() => selectComuna(comuna)}
                                                className="w-full text-left px-4 py-3 hover:bg-slate-800 transition-colors border-b border-slate-700 last:border-b-0"
                                            >
                                                <div className="text-white font-medium">{comuna}</div>
                                                <div className="text-slate-400 text-xs">{getRegionForComuna(comuna)}</div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {errors.comuna && <p className="text-red-500 text-xs mt-1">{errors.comuna}</p>}
                            </div>
                        </div>

                        {/* Region (Auto-filled) */}
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">
                                Región * <span className="text-slate-500 text-xs font-normal">(Se completa automáticamente)</span>
                            </label>
                            <input
                                type="text"
                                value={formData.region}
                                readOnly
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-slate-400 cursor-not-allowed"
                                placeholder="Selecciona una comuna primero"
                            />
                        </div>

                        {/* Street Address */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2">
                                <label className="block text-sm font-bold text-slate-300 mb-2">Calle *</label>
                                <input
                                    type="text"
                                    name="street_address"
                                    value={formData.street_address}
                                    onChange={handleChange}
                                    className={`w-full bg-slate-900 border ${errors.street_address ? 'border-red-500' : 'border-slate-700'} rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-green`}
                                    placeholder="Av. Providencia"
                                />
                                {errors.street_address && <p className="text-red-500 text-xs mt-1">{errors.street_address}</p>}
                            </div>
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Número</label>
                                <input
                                    type="text"
                                    name="street_number"
                                    value={formData.street_number}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-green"
                                    placeholder="1234"
                                />
                            </div>
                        </div>

                        {/* Apartment */}
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Depto/Oficina (opcional)</label>
                            <input
                                type="text"
                                name="apartment"
                                value={formData.apartment}
                                onChange={handleChange}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-green"
                                placeholder="Depto 101"
                            />
                        </div>

                        {/* Postal Code */}
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Código Postal (opcional)</label>
                            <input
                                type="text"
                                name="postal_code"
                                value={formData.postal_code}
                                onChange={handleChange}
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-green"
                                placeholder="8320000"
                            />
                        </div>

                        {/* Reference */}
                        <div>
                            <label className="block text-sm font-bold text-slate-300 mb-2">Referencias de Entrega</label>
                            <textarea
                                name="reference"
                                value={formData.reference}
                                onChange={handleChange}
                                rows="3"
                                className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-brand-green resize-none"
                                placeholder="Ej: Casa con portón rojo, timbre 2do piso"
                            />
                        </div>

                        {/* Default Checkbox */}
                        <div>
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    name="is_default"
                                    checked={formData.is_default}
                                    onChange={handleChange}
                                    className="w-4 h-4 rounded border-slate-700 bg-slate-900 text-brand-green focus:ring-brand-green"
                                />
                                <span className="text-slate-300">Marcar como dirección principal</span>
                            </label>
                        </div>
                    </div>
                </form>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 p-6 border-t border-slate-700">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-6 py-3 rounded-lg bg-slate-700 text-white hover:bg-slate-600 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={saving}
                        className="px-6 py-3 rounded-lg bg-brand-green text-black font-bold hover:bg-green-400 transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        <Save className="w-5 h-5" />
                        {saving ? 'Guardando...' : 'Guardar Dirección'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AddressFormModal;
