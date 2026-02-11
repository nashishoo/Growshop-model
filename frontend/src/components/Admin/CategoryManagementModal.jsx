import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { X, Plus, Edit2, Trash2, Check, AlertTriangle, Tag, Briefcase } from 'lucide-react';

const CategoryManagementModal = ({ isOpen, onClose, onUpdate }) => {
    const [activeTab, setActiveTab] = useState('categories'); // 'categories' | 'brands'
    const [categories, setCategories] = useState([]);
    const [brands, setBrands] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ name: '', description: '' });
    const [showAddForm, setShowAddForm] = useState(false);
    const [addForm, setAddForm] = useState({ name: '', description: '' });
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [itemToDelete, setItemToDelete] = useState(null);

    useEffect(() => {
        if (isOpen) {
            fetchData();
        }
    }, [isOpen, activeTab]);

    const fetchData = async () => {
        setLoading(true);
        try {
            if (activeTab === 'categories') {
                const { data, error } = await supabase
                    .from('categories')
                    .select('*')
                    .order('name');
                if (error) throw error;
                setCategories(data || []);
            } else {
                const { data, error } = await supabase
                    .from('brands')
                    .select('*')
                    .order('name');
                if (error) throw error;
                setBrands(data || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAdd = async () => {
        if (!addForm.name.trim()) {
            alert('El nombre es requerido');
            return;
        }

        try {
            const slug = addForm.name.toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9\s-]/g, '')
                .trim()
                .replace(/\s+/g, '-');

            const table = activeTab === 'categories' ? 'categories' : 'brands';
            const { error } = await supabase
                .from(table)
                .insert({
                    name: addForm.name.trim(),
                    slug,
                    description: addForm.description.trim() || null,
                    is_active: true
                });

            if (error) throw error;

            setAddForm({ name: '', description: '' });
            setShowAddForm(false);
            await fetchData();
            onUpdate?.();
        } catch (error) {
            console.error('Error adding:', error);
            alert(error.message.includes('duplicate') ? 'Ya existe un elemento con ese nombre' : 'Error al crear');
        }
    };

    const handleEdit = async (id) => {
        if (!editForm.name.trim()) {
            alert('El nombre es requerido');
            return;
        }

        try {
            const slug = editForm.name.toLowerCase()
                .normalize('NFD')
                .replace(/[\u0300-\u036f]/g, '')
                .replace(/[^a-z0-9\s-]/g, '')
                .trim()
                .replace(/\s+/g, '-');

            const table = activeTab === 'categories' ? 'categories' : 'brands';
            const { error } = await supabase
                .from(table)
                .update({
                    name: editForm.name.trim(),
                    slug,
                    description: editForm.description.trim() || null
                })
                .eq('id', id);

            if (error) throw error;

            setEditingId(null);
            setEditForm({ name: '', description: '' });
            await fetchData();
            onUpdate?.();
        } catch (error) {
            console.error('Error updating:', error);
            alert(error.message.includes('duplicate') ? 'Ya existe un elemento con ese nombre' : 'Error al actualizar');
        }
    };

    const handleDelete = (item) => {
        setItemToDelete(item);
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        try {
            const table = activeTab === 'categories' ? 'categories' : 'brands';
            const { error } = await supabase
                .from(table)
                .update({ is_active: false })
                .eq('id', itemToDelete.id);

            if (error) throw error;

            setShowDeleteModal(false);
            setItemToDelete(null);
            await fetchData();
            onUpdate?.();
        } catch (error) {
            console.error('Error deleting:', error);
            alert('Error al eliminar');
        }
    };

    const toggleActive = async (id, currentStatus) => {
        try {
            const table = activeTab === 'categories' ? 'categories' : 'brands';
            const { error } = await supabase
                .from(table)
                .update({ is_active: !currentStatus })
                .eq('id', id);

            if (error) throw error;
            await fetchData();
            onUpdate?.();
        } catch (error) {
            console.error('Error toggling active:', error);
            alert('Error al cambiar estado');
        }
    };

    const startEditing = (item) => {
        setEditingId(item.id);
        setEditForm({ name: item.name, description: item.description || '' });
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditForm({ name: '', description: '' });
    };

    const data = activeTab === 'categories' ? categories : brands;
    const Icon = activeTab === 'categories' ? Tag : Briefcase;
    const label = activeTab === 'categories' ? 'Categoría' : 'Marca';

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#111] border-2 border-neon-green/50 rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl shadow-neon-green/20">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-800">
                    <h2 className="text-2xl font-graffiti text-white uppercase tracking-wide">
                        GESTIONAR INVENTARIO
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 p-6 pb-0">
                    <button
                        onClick={() => setActiveTab('categories')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase text-sm tracking-wider transition-all ${activeTab === 'categories'
                                ? 'bg-neon-green text-black'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
                            }`}
                    >
                        <Tag className="w-4 h-4" />
                        Categorías
                    </button>
                    <button
                        onClick={() => setActiveTab('brands')}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase text-sm tracking-wider transition-all ${activeTab === 'brands'
                                ? 'bg-neon-green text-black'
                                : 'bg-gray-800 text-gray-400 hover:bg-gray-700 border border-gray-700'
                            }`}
                    >
                        <Briefcase className="w-4 h-4" />
                        Marcas
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    {/* Add Button */}
                    {!showAddForm && (
                        <button
                            onClick={() => setShowAddForm(true)}
                            className="w-full mb-4 bg-gray-800 border-2 border-dashed border-gray-700 hover:border-neon-green/50 text-gray-400 hover:text-neon-green px-6 py-4 rounded-xl font-bold uppercase text-sm tracking-wider transition-all flex items-center justify-center gap-2"
                        >
                            <Plus className="w-5 h-5" />
                            Nueva {label}
                        </button>
                    )}

                    {/* Add Form */}
                    {showAddForm && (
                        <div className="mb-6 bg-gray-800/50 border border-neon-green/30 rounded-xl p-4">
                            <div className="flex items-center gap-3 mb-4">
                                <Icon className="w-5 h-5 text-neon-green" />
                                <h3 className="text-white font-bold uppercase tracking-wider">Nueva {label}</h3>
                            </div>
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    placeholder="Nombre *"
                                    value={addForm.name}
                                    onChange={(e) => setAddForm({ ...addForm, name: e.target.value })}
                                    className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-neon-green"
                                />
                                <input
                                    type="text"
                                    placeholder="Descripción (opcional)"
                                    value={addForm.description}
                                    onChange={(e) => setAddForm({ ...addForm, description: e.target.value })}
                                    className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-neon-green"
                                />
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleAdd}
                                        className="flex-1 bg-neon-green text-black px-4 py-2 rounded-lg font-black uppercase text-xs tracking-wider hover:bg-white transition-all"
                                    >
                                        <Check className="w-4 h-4 inline mr-1" />
                                        Guardar
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowAddForm(false);
                                            setAddForm({ name: '', description: '' });
                                        }}
                                        className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all font-bold uppercase text-xs"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* List */}
                    {loading ? (
                        <div className="text-center py-8 text-gray-500 font-mono">CARGANDO...</div>
                    ) : data.length === 0 ? (
                        <div className="text-center py-8 text-gray-500 font-mono">
                            No hay {activeTab === 'categories' ? 'categorías' : 'marcas'} creadas
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {data.map((item) => (
                                <div
                                    key={item.id}
                                    className={`bg-gray-800/50 border rounded-xl p-4 transition-all ${item.is_active ? 'border-gray-700' : 'border-red-500/30 bg-red-900/10'
                                        }`}
                                >
                                    {editingId === item.id ? (
                                        // Edit Mode
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                value={editForm.name}
                                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                                className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-neon-green"
                                            />
                                            <input
                                                type="text"
                                                value={editForm.description}
                                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                placeholder="Descripción"
                                                className="w-full bg-black/50 border border-gray-700 rounded-lg px-4 py-2 text-white placeholder-gray-600 focus:outline-none focus:border-neon-green"
                                            />
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => handleEdit(item.id)}
                                                    className="flex-1 bg-neon-green text-black px-4 py-2 rounded-lg font-black uppercase text-xs hover:bg-white transition-all"
                                                >
                                                    Guardar
                                                </button>
                                                <button
                                                    onClick={cancelEditing}
                                                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-all font-bold uppercase text-xs"
                                                >
                                                    Cancelar
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        // View Mode
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3 flex-grow">
                                                <Icon className={`w-5 h-5 ${item.is_active ? 'text-neon-green' : 'text-red-500'}`} />
                                                <div>
                                                    <h4 className={`font-bold ${item.is_active ? 'text-white' : 'text-gray-500'}`}>
                                                        {item.name}
                                                    </h4>
                                                    {item.description && (
                                                        <p className="text-xs text-gray-500">{item.description}</p>
                                                    )}
                                                    <p className="text-xs text-gray-600 font-mono mt-1">/{item.slug}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-2">
                                                {/* Toggle Active */}
                                                <button
                                                    onClick={() => toggleActive(item.id, item.is_active)}
                                                    className={`px-3 py-1 rounded-lg text-xs font-bold uppercase transition-all ${item.is_active
                                                            ? 'bg-neon-green/20 text-neon-green border border-neon-green/30 hover:bg-neon-green/30'
                                                            : 'bg-red-500/20 text-red-500 border border-red-500/30 hover:bg-red-500/30'
                                                        }`}
                                                    title={item.is_active ? 'Desactivar' : 'Activar'}
                                                >
                                                    {item.is_active ? 'ACTIVO' : 'INACTIVO'}
                                                </button>

                                                {/* Edit */}
                                                <button
                                                    onClick={() => startEditing(item)}
                                                    className="p-2 bg-blue-500/20 text-blue-500 rounded-lg hover:bg-blue-500/30 transition-all"
                                                    title="Editar"
                                                >
                                                    <Edit2 className="w-4 h-4" />
                                                </button>

                                                {/* Delete */}
                                                <button
                                                    onClick={() => handleDelete(item)}
                                                    className="p-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-all"
                                                    title="Eliminar"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-800">
                    <button
                        onClick={onClose}
                        className="w-full bg-gray-800 text-white px-6 py-3 rounded-xl font-bold uppercase tracking-wider hover:bg-gray-700 transition-all"
                    >
                        Cerrar
                    </button>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {showDeleteModal && itemToDelete && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
                    <div className="bg-[#111] border-2 border-red-500/50 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-red-500/20">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center">
                                <AlertTriangle className="w-8 h-8 text-red-500" />
                            </div>
                            <div>
                                <h3 className="text-xl font-graffiti text-white uppercase">ADVERTENCIA</h3>
                                <p className="text-red-500 text-xs font-mono uppercase tracking-wider">Eliminar {label}</p>
                            </div>
                        </div>

                        <p className="text-gray-300 mb-6 text-sm">
                            ¿Estás seguro de que deseas eliminar <span className="text-red-500 font-black">"{itemToDelete.name}"</span>?
                        </p>

                        <p className="text-gray-500 text-xs font-mono mb-6 p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                            Esta acción marcará el elemento como inactivo. No afectará productos ya asignados.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => {
                                    setShowDeleteModal(false);
                                    setItemToDelete(null);
                                }}
                                className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-xl font-bold uppercase text-sm hover:bg-gray-700 transition-all"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-black uppercase text-sm hover:bg-red-500 transition-all shadow-lg shadow-red-500/30"
                            >
                                Sí, Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default CategoryManagementModal;
