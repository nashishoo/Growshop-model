import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import {
    Ticket,
    Plus,
    Edit,
    Trash2,
    Copy,
    Check,
    X,
    Percent,
    DollarSign
} from 'lucide-react';

const CouponsPage = () => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingCoupon, setEditingCoupon] = useState(null);
    const [copiedCode, setCopiedCode] = useState(null);

    const [formData, setFormData] = useState({
        code: '',
        description: '',
        discount_type: 'percentage',
        discount_value: '',
        min_purchase_amount: '',
        max_uses: '',
        valid_until: '',
        is_active: true
    });

    useEffect(() => {
        fetchCoupons();
    }, []);

    const fetchCoupons = async () => {
        try {
            const { data, error } = await supabase
                .from('coupons')
                .select('*')
                .order('created_at', { ascending: false });

            if (error) throw error;
            setCoupons(data || []);
        } catch (error) {
            console.error('Error fetching coupons:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const couponData = {
                code: formData.code.toUpperCase(),
                description: formData.description,
                discount_type: formData.discount_type,
                discount_value: parseFloat(formData.discount_value),
                min_purchase_amount: parseFloat(formData.min_purchase_amount) || 0,
                max_uses: formData.max_uses ? parseInt(formData.max_uses) : null,
                valid_until: formData.valid_until || null,
                is_active: formData.is_active
            };

            if (editingCoupon) {
                const { error } = await supabase
                    .from('coupons')
                    .update(couponData)
                    .eq('id', editingCoupon.id);
                if (error) throw error;
            } else {
                const { error } = await supabase
                    .from('coupons')
                    .insert(couponData);
                if (error) throw error;
            }

            setShowModal(false);
            resetForm();
            fetchCoupons();
        } catch (error) {
            console.error('Error saving coupon:', error);
            alert('Error al guardar cupón: ' + error.message);
        }
    };

    const handleEdit = (coupon) => {
        setEditingCoupon(coupon);
        setFormData({
            code: coupon.code,
            description: coupon.description || '',
            discount_type: coupon.discount_type,
            discount_value: coupon.discount_value.toString(),
            min_purchase_amount: coupon.min_purchase_amount?.toString() || '',
            max_uses: coupon.max_uses?.toString() || '',
            valid_until: coupon.valid_until ? coupon.valid_until.split('T')[0] : '',
            is_active: coupon.is_active
        });
        setShowModal(true);
    };

    const handleDelete = async (id) => {
        if (!window.confirm('¿Eliminar este cupón?')) return;

        try {
            const { error } = await supabase
                .from('coupons')
                .delete()
                .eq('id', id);
            if (error) throw error;
            fetchCoupons();
        } catch (error) {
            console.error('Error deleting coupon:', error);
            alert('Error al eliminar cupón');
        }
    };

    const toggleActive = async (coupon) => {
        try {
            const { error } = await supabase
                .from('coupons')
                .update({ is_active: !coupon.is_active })
                .eq('id', coupon.id);
            if (error) throw error;
            fetchCoupons();
        } catch (error) {
            console.error('Error toggling coupon:', error);
        }
    };

    const copyCode = (code) => {
        navigator.clipboard.writeText(code);
        setCopiedCode(code);
        setTimeout(() => setCopiedCode(null), 2000);
    };

    const resetForm = () => {
        setEditingCoupon(null);
        setFormData({
            code: '',
            description: '',
            discount_type: 'percentage',
            discount_value: '',
            min_purchase_amount: '',
            max_uses: '',
            valid_until: '',
            is_active: true
        });
    };

    const generateCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
            code += chars[Math.floor(Math.random() * chars.length)];
        }
        setFormData({ ...formData, code });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-white text-xl">Cargando cupones...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Cupones de Descuento</h1>
                    <p className="text-slate-400 text-sm">Gestiona códigos promocionales</p>
                </div>
                <button
                    onClick={() => { resetForm(); setShowModal(true); }}
                    className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-green text-black px-4 py-3 rounded-lg font-bold hover:bg-green-400 transition-colors"
                >
                    <Plus className="w-5 h-5" />
                    Nuevo Cupón
                </button>
            </div>

            {/* Coupons Table */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                {coupons.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <Ticket className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p>No hay cupones creados</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1000px]">
                            <thead className="bg-slate-900/50 border-b border-slate-700">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-300 uppercase">Código</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-300 uppercase">Descuento</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-300 uppercase">Mín. Compra</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-300 uppercase">Usos</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-300 uppercase">Válido Hasta</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-300 uppercase">Estado</th>
                                    <th className="px-6 py-3 text-left text-xs font-bold text-slate-300 uppercase">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {coupons.map((coupon) => (
                                    <tr key={coupon.id} className="hover:bg-slate-700/50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono font-bold text-brand-green">{coupon.code}</span>
                                                <button
                                                    onClick={() => copyCode(coupon.code)}
                                                    className="text-slate-400 hover:text-white"
                                                    title="Copiar código"
                                                >
                                                    {copiedCode === coupon.code ? (
                                                        <Check className="w-4 h-4 text-green-500" />
                                                    ) : (
                                                        <Copy className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                            {coupon.description && (
                                                <p className="text-xs text-slate-500 mt-1">{coupon.description}</p>
                                            )}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="flex items-center gap-1 text-white font-bold">
                                                {coupon.discount_type === 'percentage' ? (
                                                    <>
                                                        <Percent className="w-4 h-4 text-yellow-500" />
                                                        {coupon.discount_value}%
                                                    </>
                                                ) : (
                                                    <>
                                                        <DollarSign className="w-4 h-4 text-green-500" />
                                                        ${coupon.discount_value.toLocaleString('es-CL')}
                                                    </>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-slate-300">
                                            {coupon.min_purchase_amount > 0
                                                ? `$${coupon.min_purchase_amount.toLocaleString('es-CL')}`
                                                : '-'
                                            }
                                        </td>
                                        <td className="px-6 py-4 text-slate-300">
                                            {coupon.max_uses
                                                ? `${coupon.uses_count} / ${coupon.max_uses}`
                                                : `${coupon.uses_count} / ∞`
                                            }
                                        </td>
                                        <td className="px-6 py-4 text-slate-300">
                                            {coupon.valid_until
                                                ? new Date(coupon.valid_until).toLocaleDateString('es-CL')
                                                : 'Sin límite'
                                            }
                                        </td>
                                        <td className="px-6 py-4">
                                            <button
                                                onClick={() => toggleActive(coupon)}
                                                className={`px-3 py-1 rounded-full text-xs font-bold ${coupon.is_active
                                                    ? 'bg-green-500/10 text-green-500'
                                                    : 'bg-red-500/10 text-red-500'
                                                    }`}
                                            >
                                                {coupon.is_active ? 'Activo' : 'Inactivo'}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleEdit(coupon)}
                                                    className="text-blue-400 hover:text-blue-300"
                                                    title="Editar"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(coupon.id)}
                                                    className="text-red-400 hover:text-red-300"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
                    <div className="bg-slate-800 rounded-lg w-full max-w-md border border-slate-700">
                        <div className="flex items-center justify-between p-4 border-b border-slate-700">
                            <h2 className="text-xl font-bold text-white">
                                {editingCoupon ? 'Editar Cupón' : 'Nuevo Cupón'}
                            </h2>
                            <button
                                onClick={() => setShowModal(false)}
                                className="text-slate-400 hover:text-white"
                            >
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <form onSubmit={handleSubmit} className="p-4 space-y-4">
                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Código</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={formData.code}
                                        onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                                        placeholder="VERANO2024"
                                        required
                                        className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white font-mono uppercase"
                                    />
                                    <button
                                        type="button"
                                        onClick={generateCode}
                                        className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
                                    >
                                        Generar
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Descripción (opcional)</label>
                                <input
                                    type="text"
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Descuento de verano"
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                                />
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Tipo</label>
                                    <select
                                        value={formData.discount_type}
                                        onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                                    >
                                        <option value="percentage">Porcentaje (%)</option>
                                        <option value="fixed">Monto Fijo ($)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Valor</label>
                                    <input
                                        type="number"
                                        value={formData.discount_value}
                                        onChange={(e) => setFormData({ ...formData, discount_value: e.target.value })}
                                        placeholder={formData.discount_type === 'percentage' ? '10' : '5000'}
                                        required
                                        min="0"
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Compra Mínima</label>
                                    <input
                                        type="number"
                                        value={formData.min_purchase_amount}
                                        onChange={(e) => setFormData({ ...formData, min_purchase_amount: e.target.value })}
                                        placeholder="0"
                                        min="0"
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Usos Máximos</label>
                                    <input
                                        type="number"
                                        value={formData.max_uses}
                                        onChange={(e) => setFormData({ ...formData, max_uses: e.target.value })}
                                        placeholder="Sin límite"
                                        min="1"
                                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-bold text-slate-300 mb-2">Válido Hasta</label>
                                <input
                                    type="date"
                                    value={formData.valid_until}
                                    onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
                                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
                                />
                            </div>

                            <div className="flex items-center gap-2">
                                <input
                                    type="checkbox"
                                    id="is_active"
                                    checked={formData.is_active}
                                    onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                    className="w-4 h-4 rounded"
                                />
                                <label htmlFor="is_active" className="text-slate-300">Cupón activo</label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="flex-1 bg-slate-700 text-white py-2 rounded-lg font-bold hover:bg-slate-600"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="submit"
                                    className="flex-1 bg-brand-green text-black py-2 rounded-lg font-bold hover:bg-green-400"
                                >
                                    {editingCoupon ? 'Guardar' : 'Crear'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CouponsPage;
