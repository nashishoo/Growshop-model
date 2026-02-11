import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Eye, Filter, Search, Trash2, Archive, ArchiveRestore, Download, FileSpreadsheet, Truck } from 'lucide-react';
import OrderDetailModal from '../../components/Admin/OrderDetailModal';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const OrdersPage = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [statusFilter, setStatusFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [showArchived, setShowArchived] = useState(false);
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showArchiveModal, setShowArchiveModal] = useState(false);
    const [archiveAction, setArchiveAction] = useState(true);

    useEffect(() => {
        fetchOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchOrders = async () => {
        try {
            let query = supabase
                .from('orders')
                .select('*')
                .order('created_at', { ascending: false });

            // Filter archived unless explicitly showing them
            if (!showArchived) {
                query = query.or('archived.eq.false,archived.is.null');
            }

            const { data, error } = await query;

            if (error) throw error;
            setOrders(data);
            setSelectedOrders([]); // Clear selection on refresh
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-brand-yellow/10 text-brand-yellow border-brand-yellow/30',
            paid: 'bg-blue-500/10 text-blue-500 border-blue-500/30',
            preparing: 'bg-orange-500/10 text-orange-500 border-orange-500/30',
            processing: 'bg-brand-purple/10 text-brand-purple border-brand-purple/30',
            shipped: 'bg-cyan-500/10 text-cyan-500 border-cyan-500/30',
            delivered: 'bg-neon-green/10 text-neon-green border-neon-green/30',
            cancelled: 'bg-red-500/10 text-red-500 border-red-500/30',
        };
        return colors[status] || colors.pending;
    };

    const getStatusLabel = (status) => {
        const labels = {
            pending: 'PAGO PENDIENTE',
            paid: 'PAGADO',
            preparing: 'EN PREPARACIÓN',
            processing: 'EN PROCESO',
            shipped: 'ENVIADO',
            delivered: 'ENTREGADO',
            cancelled: 'CANCELADO',
        };
        return labels[status] || status;
    };

    const handleArchiveOrders = async (archive = true) => {
        console.log('handleArchiveOrders called', { selectedCount: selectedOrders.length, archive });
        if (selectedOrders.length === 0) {
            console.log('No orders selected, returning');
            return;
        }
        setArchiveAction(archive);
        setShowArchiveModal(true);
    };

    const confirmArchive = async () => {
        console.log('confirmArchive called', { archiveAction, selectedOrders });
        setShowArchiveModal(false);
        setProcessing(true);
        const action = archiveAction ? 'archivar' : 'desarchivar';
        try {
            const { error } = await supabase
                .from('orders')
                .update({ archived: archiveAction })
                .in('id', selectedOrders);

            if (error) throw error;
            console.log('Orders archived successfully');
            await fetchOrders();
        } catch (error) {
            console.error('Error archiving orders:', error);
            alert('Error al ' + action + ' órdenes');
        } finally {
            setProcessing(false);
        }
    };

    const handleDeleteOrders = async () => {
        console.log('handleDeleteOrders called', { selectedCount: selectedOrders.length });
        if (selectedOrders.length === 0) {
            console.log('No orders selected, returning');
            return;
        }
        console.log('Opening delete modal');
        setShowDeleteModal(true);
    };

    const confirmDelete = async () => {
        console.log('confirmDelete called', { selectedOrders });
        setShowDeleteModal(false);
        setProcessing(true);
        try {
            // Delete order_items first
            const { error: itemsError } = await supabase
                .from('order_items')
                .delete()
                .in('order_id', selectedOrders);

            if (itemsError) throw itemsError;

            // Delete orders
            const { error } = await supabase
                .from('orders')
                .delete()
                .in('id', selectedOrders);

            if (error) throw error;
            await fetchOrders();
        } catch (error) {
            console.error('Error deleting orders:', error);
            alert('Error al eliminar órdenes');
        } finally {
            setProcessing(false);
        }
    };

    const toggleSelectOrder = (orderId) => {
        setSelectedOrders(prev =>
            prev.includes(orderId)
                ? prev.filter(id => id !== orderId)
                : [...prev, orderId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedOrders.length === filteredOrders.length) {
            setSelectedOrders([]);
        } else {
            setSelectedOrders(filteredOrders.map(o => o.id));
        }
    };

    const filteredOrders = orders.filter(order => {
        const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
        const matchesSearch = searchTerm === '' ||
            order.shipping_address?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.shipping_address?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            order.id.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const handleOrderUpdate = async () => {
        await fetchOrders();
        setSelectedOrder(null);
    };

    // Export orders to Excel
    const exportToExcel = () => {
        const exportData = filteredOrders.map(order => ({
            'ID Orden': order.id.slice(0, 8).toUpperCase(),
            'Fecha': new Date(order.created_at).toLocaleDateString('es-CL'),
            'Cliente': order.customer_name || order.shipping_address?.name || 'N/A',
            'Email': order.customer_email || order.shipping_address?.email || 'N/A',
            'Teléfono': order.customer_phone || order.shipping_address?.phone || 'N/A',
            'Dirección': `${order.shipping_address?.street_address || ''} ${order.shipping_address?.street_number || ''}`,
            'Comuna': order.shipping_address?.comuna || 'N/A',
            'Región': order.shipping_address?.region || 'N/A',
            'Subtotal': order.total_amount || 0,
            'Envío': order.shipping_cost || 0,
            'Total': (order.total_amount || 0) + (order.shipping_cost || 0),
            'Estado': getStatusLabel(order.status),
            'Estado Pago': order.payment_status || 'N/A',
            'Método Envío': order.shipping_option || 'N/A'
        }));

        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Pedidos');

        const fileName = `pedidos_${new Date().toISOString().split('T')[0]}.xlsx`;
        XLSX.writeFile(wb, fileName);
    };

    // Export for Blue Express (CSV format for bulk labels)
    const exportBlueExpressCSV = () => {
        // Filter all active orders that need/have shipping (paid, shipped, delivered - not cancelled or pending)
        const shippableOrders = filteredOrders.filter(o =>
            ['paid', 'confirmed', 'shipped', 'delivered'].includes(o.status) && o.shipping_option !== 'pickup'
        );

        if (shippableOrders.length === 0) {
            alert('No hay pedidos para exportar. Los pedidos deben estar en estado Pagado, Enviado o Entregado.');
            return;
        }

        // Blue Express typical format
        const csvData = shippableOrders.map(order => ({
            'REFERENCIA': order.id.slice(0, 8).toUpperCase(),
            'NOMBRE_DESTINATARIO': order.customer_name || order.shipping_address?.name || '',
            'DIRECCION': `${order.shipping_address?.street_address || ''} ${order.shipping_address?.street_number || ''}`.trim(),
            'DEPTO_CASA': order.shipping_address?.apartment || '',
            'COMUNA': order.shipping_address?.comuna || '',
            'REGION': order.shipping_address?.region || '',
            'TELEFONO': (order.customer_phone || order.shipping_address?.phone || '').replace(/[^0-9]/g, ''),
            'EMAIL': order.customer_email || order.shipping_address?.email || '',
            'CONTENIDO': 'Productos Conectados420',
            'PESO_KG': '1',
            'VALOR_DECLARADO': (order.total_amount || 0),
            'TIPO_SERVICIO': order.shipping_option === 'express' ? 'EXPRESS' : 'STANDARD',
            'OBSERVACIONES': order.notes || ''
        }));

        const ws = XLSX.utils.json_to_sheet(csvData);
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        saveAs(blob, `blueexpress_${new Date().toISOString().split('T')[0]}.csv`);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-neon-green font-graffiti text-2xl animate-pulse">CARGANDO PEDIDOS...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-graffiti text-white mb-2 tracking-wide">GESTIÓN DE PEDIDOS</h1>
                <p className="text-gray-400 font-mono text-xs md:text-sm tracking-widest uppercase">ADMINISTRA Y ACTUALIZA EL ESTADO DE LOS PEDIDOS</p>
            </div>

            {/* Filters */}
            <div className="bg-[#111] rounded-2xl p-6 border border-gray-800 mb-8 shadow-xl">
                <div className="flex flex-col md:flex-row gap-4 mb-4">
                    {/* Search */}
                    <div className="flex-grow relative group">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-neon-green transition-colors" />
                        <input
                            type="text"
                            placeholder="BUSCAR POR ID, CLIENTE, EMAIL..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-black/50 border border-gray-800 rounded-xl pl-12 pr-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-neon-green focus:bg-black transition-all uppercase text-sm tracking-wide"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="flex items-center gap-2">
                        <Filter className="text-gray-500 w-5 h-5" />
                        <div className="relative">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="bg-black/50 border border-gray-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-green appearance-none pr-10 uppercase text-sm font-bold tracking-wide"
                            >
                                <option value="all">TODOS LOS ESTADOS</option>
                                <option value="pending">PENDIENTE</option>
                                <option value="paid">PAGADO</option>
                                <option value="shipped">ENVIADO</option>
                                <option value="delivered">ENTREGADO</option>
                                <option value="cancelled">CANCELADO</option>
                            </select>
                        </div>
                    </div>

                    {/* Archive Toggle */}
                    <button
                        onClick={() => { setShowArchived(!showArchived); fetchOrders(); }}
                        className={`flex items-center gap-2 px-6 py-3 rounded-xl font-black uppercase text-xs tracking-wider transition-all shadow-lg ${showArchived
                            ? 'bg-neon-green text-black hover:bg-white hover:scale-105'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
                            }`}
                    >
                        <Archive className="w-4 h-4" />
                        {showArchived ? 'OCULTAR ARCHIVADAS' : 'VER ARCHIVADAS'}
                    </button>

                    {/* Export Buttons */}
                    <div className="flex gap-2">
                        <button
                            onClick={exportToExcel}
                            className="flex items-center gap-2 px-4 py-3 bg-green-600/20 text-green-500 border border-green-600/50 rounded-xl font-bold hover:bg-green-600 hover:text-white transition-all uppercase text-xs tracking-wider"
                            title="Exportar a Excel"
                        >
                            <FileSpreadsheet className="w-5 h-5" />
                            <span className="hidden lg:inline">EXCEL</span>
                        </button>
                        <button
                            onClick={exportBlueExpressCSV}
                            className="flex items-center gap-2 px-4 py-3 bg-blue-600/20 text-blue-500 border border-blue-600/50 rounded-xl font-bold hover:bg-blue-600 hover:text-white transition-all uppercase text-xs tracking-wider"
                            title="Exportar CSV para Blue Express"
                        >
                            <Truck className="w-5 h-5" />
                            <span className="hidden lg:inline">BLUE EXPRESS</span>
                        </button>
                    </div>
                </div>

                {/* Bulk Actions */}
                {selectedOrders.length > 0 && (
                    <div className="flex items-center gap-4 p-4 bg-brand-purple/10 border border-brand-purple/30 rounded-xl animate-in fade-in slide-in-from-top-2">
                        <span className="text-brand-purple font-black uppercase tracking-wider text-xs">{selectedOrders.length} SELECCIONADA(S)</span>
                        <div className="flex gap-2 ml-auto">
                            {!showArchived && (
                                <button
                                    onClick={() => handleArchiveOrders(true)}
                                    disabled={processing}
                                    className="flex items-center gap-2 px-4 py-2 bg-brand-yellow text-black rounded-lg font-black uppercase text-xs tracking-wider hover:bg-white transition-all disabled:opacity-50 hover:scale-105 shadow-lg"
                                >
                                    <Archive className="w-4 h-4" />
                                    ARCHIVAR
                                </button>
                            )}
                            {showArchived && (
                                <button
                                    onClick={() => handleArchiveOrders(false)}
                                    disabled={processing}
                                    className="flex items-center gap-2 px-4 py-2 bg-neon-green text-black rounded-lg font-black uppercase text-xs tracking-wider hover:bg-white transition-all disabled:opacity-50 hover:scale-105 shadow-lg"
                                >
                                    <ArchiveRestore className="w-4 h-4" />
                                    DESARCHIVAR
                                </button>
                            )}
                            <button
                                onClick={() => {
                                    console.log('BOTÓN ELIMINAR CLICKEADO!!!', { selectedOrders, processing });
                                    handleDeleteOrders();
                                }}
                                disabled={processing}
                                type="button"
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-black uppercase text-xs tracking-wider hover:bg-red-500 transition-all disabled:opacity-50 hover:scale-105 shadow-lg"
                            >
                                <Trash2 className="w-4 h-4" />
                                ELIMINAR ({selectedOrders.length})
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Orders Table */}
            <div className="bg-[#111] rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1200px]">
                        <thead className="bg-black/50 border-b border-gray-800">
                            <tr>
                                <th className="px-6 py-4 text-left">
                                    <input
                                        type="checkbox"
                                        checked={selectedOrders.length === filteredOrders.length && filteredOrders.length > 0}
                                        onChange={toggleSelectAll}
                                        className="w-4 h-4 rounded border-gray-600 bg-gray-900 text-neon-green focus:ring-neon-green focus:ring-offset-black"
                                    />
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">
                                    ID Orden
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">
                                    Fecha
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">
                                    Cliente
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">
                                    Total
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">
                                    Estado
                                </th>
                                <th className="px-6 py-4 text-left text-xs font-black text-gray-500 uppercase tracking-widest">
                                    Acción
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan="6" className="px-6 py-12 text-center text-gray-500 font-mono text-sm uppercase">
                                        No se encontraron pedidos
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map((order) => (
                                    <tr
                                        key={order.id}
                                        className={`transition-colors group cursor-pointer ${order.status === 'shipped'
                                            ? 'bg-brand-purple/5 hover:bg-brand-purple/10'
                                            : order.status === 'delivered'
                                                ? 'bg-neon-green/5 hover:bg-neon-green/10'
                                                : 'hover:bg-white/5'
                                            }`}
                                        onClick={() => setSelectedOrder(order)}
                                    >
                                        <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                                            <input
                                                type="checkbox"
                                                checked={selectedOrders.includes(order.id)}
                                                onChange={() => toggleSelectOrder(order.id)}
                                                className="w-4 h-4 rounded border-gray-600 bg-gray-900 text-neon-green focus:ring-neon-green focus:ring-offset-black"
                                            />
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-400 group-hover:text-neon-green transition-colors">
                                            {order.id.slice(0, 8).toUpperCase()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500 font-mono uppercase">
                                            {new Date(order.created_at).toLocaleDateString('es-CL')}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-300">
                                            <div className="font-bold">{order.shipping_address?.name || 'N/A'}</div>
                                            <div className="text-xs text-gray-500 font-mono">{order.shipping_address?.email}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-white">
                                            ${((order.total_amount || 0) + (order.shipping_cost || 0)).toLocaleString('es-CL')}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider border ${getStatusColor(order.status)}`}>
                                                {getStatusLabel(order.status)}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                className="text-gray-500 hover:text-neon-green flex items-center gap-1 transition-colors"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    setSelectedOrder(order);
                                                }}
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination (Placeholder) */}
            <div className="mt-6 text-center text-gray-600 text-xs font-mono uppercase tracking-widest">
                Mostrando {filteredOrders.length} de {orders.length} pedidos
            </div>

            {/* Order Detail Modal */}
            {selectedOrder && (
                <OrderDetailModal
                    order={selectedOrder}
                    onClose={() => setSelectedOrder(null)}
                    onUpdate={handleOrderUpdate}
                />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#111] border-2 border-red-500/50 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-red-500/20 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-full bg-red-500/20 flex items-center justify-center">
                                <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-xl font-graffiti text-white uppercase tracking-wide">ADVERTENCIA</h3>
                                <p className="text-red-500 text-xs font-mono uppercase tracking-wider">Acción Irreversible</p>
                            </div>
                        </div>

                        <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                            ¿Estás seguro de que deseas <span className="text-red-500 font-black">ELIMINAR PERMANENTEMENTE</span> {selectedOrders.length} orden(es)?
                        </p>

                        <p className="text-gray-500 text-xs font-mono mb-8 p-4 bg-red-500/5 border border-red-500/20 rounded-lg">
                            Esta acción NO se puede deshacer. Todas las órdenes y sus datos asociados serán eliminados de la base de datos.
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-xl font-bold uppercase text-sm tracking-wider hover:bg-gray-700 transition-all border border-gray-700"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                disabled={processing}
                                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl font-black uppercase text-sm tracking-wider hover:bg-red-500 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-red-500/30 hover:scale-105"
                            >
                                {processing ? 'ELIMINANDO...' : 'SÍ, ELIMINAR'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Archive Confirmation Modal */}
            {showArchiveModal && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#111] border-2 border-neon-green/50 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-neon-green/20 animate-in zoom-in-95 duration-200">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-14 h-14 rounded-full bg-neon-green/20 flex items-center justify-center">
                                {archiveAction ? (
                                    <Archive className="w-8 h-8 text-neon-green" />
                                ) : (
                                    <ArchiveRestore className="w-8 h-8 text-neon-green" />
                                )}
                            </div>
                            <div>
                                <h3 className="text-xl font-graffiti text-white uppercase tracking-wide">
                                    {archiveAction ? 'ARCHIVAR' : 'DESARCHIVAR'}
                                </h3>
                                <p className="text-neon-green text-xs font-mono uppercase tracking-wider">Confirmación requerida</p>
                            </div>
                        </div>

                        <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                            ¿Estás seguro de que deseas <span className="text-neon-green font-black">{archiveAction ? 'ARCHIVAR' : 'DESARCHIVAR'}</span> {selectedOrders.length} orden(es)?
                        </p>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowArchiveModal(false)}
                                className="flex-1 px-6 py-3 bg-gray-800 text-white rounded-xl font-bold uppercase text-sm tracking-wider hover:bg-gray-700 transition-all border border-gray-700"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmArchive}
                                disabled={processing}
                                className="flex-1 px-6 py-3 bg-neon-green text-black rounded-xl font-black uppercase text-sm tracking-wider hover:bg-white transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-neon-green/30 hover:scale-105"
                            >
                                {processing ? 'PROCESANDO...' : 'SÍ, CONFIRMAR'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrdersPage;
