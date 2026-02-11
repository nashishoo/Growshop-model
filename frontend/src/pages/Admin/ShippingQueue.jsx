import { useState, useEffect, useRef } from 'react';
import { supabase } from '../../supabaseClient';
import {
    Truck,
    Package,
    Upload,
    Download,
    CheckCircle,
    Clock,
    Search,
    RefreshCw,
    ExternalLink,
    AlertCircle
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const ShippingQueue = () => {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedOrders, setSelectedOrders] = useState([]);
    const [processing, setProcessing] = useState(false);
    const [importResult, setImportResult] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        fetchReadyOrders();
    }, []);

    const fetchReadyOrders = async () => {
        setLoading(true);
        try {
            // Get all active orders for shipping management (paid, shipped, delivered)
            // Excludes: pending (not paid), cancelled
            const { data, error } = await supabase
                .from('orders')
                .select('*')
                .in('status', ['paid', 'confirmed', 'shipped', 'delivered'])
                .eq('archived', false)
                .neq('shipping_option', 'pickup')
                .order('created_at', { ascending: true });

            if (error) throw error;
            setOrders(data || []);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const toggleSelect = (orderId) => {
        setSelectedOrders(prev =>
            prev.includes(orderId)
                ? prev.filter(id => id !== orderId)
                : [...prev, orderId]
        );
    };

    const selectAll = () => {
        if (selectedOrders.length === orders.length) {
            setSelectedOrders([]);
        } else {
            setSelectedOrders(orders.map(o => o.id));
        }
    };

    // Export selected orders for Blue Express
    const exportForBlueExpress = () => {
        const ordersToExport = orders.filter(o => selectedOrders.includes(o.id));

        if (ordersToExport.length === 0) {
            alert('Selecciona al menos una orden para exportar');
            return;
        }

        const csvData = ordersToExport.map(order => ({
            'REFERENCIA': order.id.slice(0, 8).toUpperCase(),
            'NOMBRE': order.customer_name || order.shipping_address?.recipient_name || '',
            'DIRECCION': `${order.shipping_address?.street_address || ''} ${order.shipping_address?.street_number || ''}`.trim(),
            'DEPTO': order.shipping_address?.apartment || '',
            'COMUNA': order.shipping_address?.comuna || '',
            'REGION': order.shipping_address?.region || '',
            'TELEFONO': (order.customer_phone || order.shipping_address?.phone || '').replace(/[^0-9]/g, ''),
            'EMAIL': order.customer_email || '',
            'CONTENIDO': 'Productos Conectados420',
            'PESO_KG': '1',
            'VALOR': order.total_amount || 0,
            'SERVICIO': order.shipping_option === 'express' ? 'EXPRESS' : 'STANDARD'
        }));

        const ws = XLSX.utils.json_to_sheet(csvData);
        const csv = XLSX.utils.sheet_to_csv(ws);
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
        saveAs(blob, `blueexpress_${new Date().toISOString().split('T')[0]}.csv`);
    };

    // Import tracking numbers from CSV
    const handleImportTracking = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        setProcessing(true);
        setImportResult(null);

        try {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheet = workbook.Sheets[workbook.SheetNames[0]];
                const rows = XLSX.utils.sheet_to_json(sheet);

                let updated = 0;
                let errors = 0;

                for (const row of rows) {
                    // Try to find reference and tracking columns
                    const reference = row['REFERENCIA'] || row['Referencia'] || row['REF'];
                    const tracking = row['TRACKING'] || row['Tracking'] || row['N_SEGUIMIENTO'] || row['NumeroSeguimiento'];

                    if (reference && tracking) {
                        // Find order by reference (first 8 chars of ID uppercase)
                        const order = orders.find(o =>
                            o.id.slice(0, 8).toUpperCase() === reference.toUpperCase()
                        );

                        if (order) {
                            const { error } = await supabase
                                .from('orders')
                                .update({
                                    tracking_number: tracking.toString(),
                                    status: 'shipped'
                                })
                                .eq('id', order.id);

                            if (error) {
                                errors++;
                            } else {
                                updated++;
                            }
                        }
                    }
                }

                setImportResult({ updated, errors, total: rows.length });
                fetchReadyOrders();
            };
            reader.readAsArrayBuffer(file);
        } catch (error) {
            console.error('Error importing tracking:', error);
            setImportResult({ error: 'Error al procesar archivo' });
        } finally {
            setProcessing(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    // Mark selected as shipped manually
    const markAsShipped = async () => {
        if (selectedOrders.length === 0) return;

        setProcessing(true);
        try {
            const { error } = await supabase
                .from('orders')
                .update({ status: 'shipped' })
                .in('id', selectedOrders);

            if (error) throw error;
            setSelectedOrders([]);
            fetchReadyOrders();
        } catch (error) {
            console.error('Error updating orders:', error);
            alert('Error al actualizar órdenes');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-white text-xl">Cargando pedidos...</div>
            </div>
        );
    }

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">Cola de Envíos</h1>
                <p className="text-slate-400 text-sm">Pedidos pagados listos para enviar</p>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center gap-3">
                        <Clock className="w-8 h-8 text-yellow-400" />
                        <div>
                            <div className="text-2xl font-bold text-white">{orders.length}</div>
                            <div className="text-sm text-slate-400">Pendientes de Envío</div>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-8 h-8 text-green-400" />
                        <div>
                            <div className="text-2xl font-bold text-white">{selectedOrders.length}</div>
                            <div className="text-sm text-slate-400">Seleccionados</div>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                    <div className="flex items-center gap-3">
                        <Package className="w-8 h-8 text-blue-400" />
                        <div>
                            <div className="text-2xl font-bold text-white">
                                ${orders.reduce((sum, o) => sum + (o.total_amount || 0), 0).toLocaleString('es-CL')}
                            </div>
                            <div className="text-sm text-slate-400">Valor Total</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="bg-slate-800 rounded-lg p-4 border border-slate-700 mb-6">
                <div className="flex flex-wrap items-center gap-3">
                    <button
                        onClick={fetchReadyOrders}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600"
                    >
                        <RefreshCw className="w-4 h-4" />
                        Actualizar
                    </button>

                    <div className="h-8 w-px bg-slate-600" />

                    <button
                        onClick={exportForBlueExpress}
                        disabled={selectedOrders.length === 0}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                    >
                        <Download className="w-4 h-4" />
                        Exportar Blue Express ({selectedOrders.length})
                    </button>

                    <label className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 cursor-pointer font-bold">
                        <Upload className="w-4 h-4" />
                        Importar Tracking
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv,.xlsx,.xls"
                            onChange={handleImportTracking}
                            className="hidden"
                        />
                    </label>

                    <div className="h-8 w-px bg-slate-600" />

                    <button
                        onClick={markAsShipped}
                        disabled={selectedOrders.length === 0 || processing}
                        className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 disabled:opacity-50 disabled:cursor-not-allowed font-bold"
                    >
                        <Truck className="w-4 h-4" />
                        Marcar como Enviados
                    </button>
                </div>

                {/* Import Result */}
                {importResult && (
                    <div className={`mt-4 p-3 rounded-lg ${importResult.error ? 'bg-red-500/10 text-red-400' : 'bg-green-500/10 text-green-400'}`}>
                        {importResult.error ? (
                            <p className="flex items-center gap-2">
                                <AlertCircle className="w-5 h-5" />
                                {importResult.error}
                            </p>
                        ) : (
                            <p className="flex items-center gap-2">
                                <CheckCircle className="w-5 h-5" />
                                Importado: {importResult.updated} actualizados, {importResult.errors} errores (de {importResult.total} filas)
                            </p>
                        )}
                    </div>
                )}
            </div>

            {/* Orders Table */}
            <div className="bg-slate-800 rounded-lg border border-slate-700 overflow-hidden">
                {orders.length === 0 ? (
                    <div className="text-center py-12 text-slate-400">
                        <Truck className="w-16 h-16 mx-auto mb-4 opacity-50" />
                        <p className="text-lg">¡Todo al día!</p>
                        <p className="text-sm">No hay pedidos pendientes de envío</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[1200px]">
                            <thead className="bg-slate-900/50 border-b border-slate-700">
                                <tr>
                                    <th className="px-4 py-3 text-left">
                                        <input
                                            type="checkbox"
                                            checked={selectedOrders.length === orders.length && orders.length > 0}
                                            onChange={selectAll}
                                            className="w-4 h-4 rounded"
                                        />
                                    </th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-300 uppercase">Ref</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-300 uppercase">Cliente</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-300 uppercase">Dirección</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-300 uppercase">Comuna</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-300 uppercase">Teléfono</th>
                                    <th className="px-4 py-3 text-left text-xs font-bold text-slate-300 uppercase">Tipo</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-300 uppercase">Estado</th>
                                    <th className="px-4 py-3 text-right text-xs font-bold text-slate-300 uppercase">Total</th>
                                    <th className="px-4 py-3 text-center text-xs font-bold text-slate-300 uppercase">Fecha</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700">
                                {orders.map(order => (
                                    <tr
                                        key={order.id}
                                        className={`transition-colors ${order.status === 'shipped'
                                            ? 'bg-green-900/30 hover:bg-green-900/50 border-l-4 border-l-green-500'
                                            : order.status === 'delivered'
                                                ? 'bg-blue-900/20 hover:bg-blue-900/30 border-l-4 border-l-blue-500'
                                                : selectedOrders.includes(order.id)
                                                    ? 'bg-slate-700/30 hover:bg-slate-700/50'
                                                    : 'hover:bg-slate-700/50'
                                            }`}
                                    >
                                        <td className="px-4 py-3">
                                            <input
                                                type="checkbox"
                                                checked={selectedOrders.includes(order.id)}
                                                onChange={() => toggleSelect(order.id)}
                                                className="w-4 h-4 rounded"
                                            />
                                        </td>
                                        <td className="px-4 py-3 font-mono text-brand-green font-bold">
                                            {order.id.slice(0, 8).toUpperCase()}
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="text-white font-medium">
                                                {order.customer_name || order.shipping_address?.recipient_name || 'N/A'}
                                            </div>
                                            <div className="text-xs text-slate-400">{order.customer_email}</div>
                                        </td>
                                        <td className="px-4 py-3 text-slate-300 text-sm">
                                            {order.shipping_address?.street_address} {order.shipping_address?.street_number}
                                            {order.shipping_address?.apartment && `, ${order.shipping_address.apartment}`}
                                        </td>
                                        <td className="px-4 py-3 text-white">{order.shipping_address?.comuna}</td>
                                        <td className="px-4 py-3 text-slate-300">{order.customer_phone || order.shipping_address?.phone}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${order.shipping_option === 'express'
                                                ? 'bg-purple-500/10 text-purple-400'
                                                : 'bg-blue-500/10 text-blue-400'
                                                }`}>
                                                {order.shipping_option === 'express' ? 'EXPRESS' : 'STANDARD'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-1 rounded text-xs font-bold ${order.status === 'shipped'
                                                ? 'bg-green-500/20 text-green-400'
                                                : order.status === 'delivered'
                                                    ? 'bg-blue-500/20 text-blue-400'
                                                    : 'bg-yellow-500/20 text-yellow-400'
                                                }`}>
                                                {order.status === 'shipped' ? 'ENVIADO'
                                                    : order.status === 'delivered' ? 'ENTREGADO'
                                                        : 'PAGADO'}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right text-white font-bold">
                                            ${(order.total_amount || 0).toLocaleString('es-CL')}
                                        </td>
                                        <td className="px-4 py-3 text-center text-slate-400 text-sm">
                                            {new Date(order.created_at).toLocaleDateString('es-CL')}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Instructions */}
            <div className="mt-6 bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                <h3 className="text-white font-bold mb-2">📋 Flujo de Trabajo:</h3>
                <ol className="text-slate-400 text-sm space-y-1 list-decimal list-inside">
                    <li>Selecciona los pedidos a enviar</li>
                    <li>Exporta CSV para Blue Express</li>
                    <li>Sube el CSV a la plataforma de Blue Express</li>
                    <li>Descarga el CSV de respuesta con los tracking</li>
                    <li>Importa el CSV aquí (columnas: REFERENCIA + TRACKING)</li>
                    <li>Los pedidos se marcarán automáticamente como "Enviados"</li>
                </ol>
            </div>
        </div>
    );
};

export default ShippingQueue;
