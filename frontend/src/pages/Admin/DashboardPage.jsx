import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Link } from 'react-router-dom';
import {
    DollarSign,
    Clock,
    Package,
    AlertTriangle,
    TrendingUp,
    TrendingDown,
    ShoppingCart,
    Eye,
    BarChart3
} from 'lucide-react';
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

const DashboardPage = () => {
    const [kpis, setKpis] = useState({
        totalSales: 0,
        pendingOrders: 0,
        totalProducts: 0,
        lowStockProducts: 0,
        lastMonthSales: 0,
    });
    const [recentOrders, setRecentOrders] = useState([]);
    const [topProducts, setTopProducts] = useState([]);
    const [salesData, setSalesData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAllData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const fetchAllData = async () => {
        try {
            await Promise.all([
                fetchKPIs(),
                fetchRecentOrders(),
                fetchTopProducts(),
                fetchSalesChart()
            ]);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchKPIs = async () => {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();

        // Current month sales
        const { data: currentSales } = await supabase
            .from('orders')
            .select('total_amount, shipping_cost')
            .gte('created_at', startOfMonth)
            .eq('archived', false)
            .in('status', ['paid', 'shipped', 'delivered']);

        const totalSales = currentSales?.reduce((sum, o) => sum + (o.total_amount || 0) + (o.shipping_cost || 0), 0) || 0;

        // Last month sales
        const { data: lastMonthData } = await supabase
            .from('orders')
            .select('total_amount, shipping_cost')
            .gte('created_at', startOfLastMonth)
            .lte('created_at', endOfLastMonth)
            .eq('archived', false)
            .in('status', ['paid', 'shipped', 'delivered']);

        const lastMonthSales = lastMonthData?.reduce((sum, o) => sum + (o.total_amount || 0) + (o.shipping_cost || 0), 0) || 0;

        // Pending orders
        const { count: pendingCount } = await supabase
            .from('orders')
            .select('*', { count: 'exact', head: true })
            .eq('status', 'pending')
            .eq('archived', false);

        // Products
        const { count: productsCount } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true);

        // Low stock
        const { count: lowStockCount } = await supabase
            .from('products')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true)
            .lt('stock_quantity', 5);

        setKpis({
            totalSales,
            lastMonthSales,
            pendingOrders: pendingCount || 0,
            totalProducts: productsCount || 0,
            lowStockProducts: lowStockCount || 0,
        });
    };

    const fetchRecentOrders = async () => {
        const { data } = await supabase
            .from('orders')
            .select('id, created_at, status, total_amount, shipping_cost, customer_name, shipping_address')
            .eq('archived', false)
            .order('created_at', { ascending: false })
            .limit(5);

        setRecentOrders(data || []);
    };

    const fetchTopProducts = async () => {
        // Get order items with product info
        const { data } = await supabase
            .from('order_items')
            .select('product_id, quantity, product_snapshot, products(name, image_url)')
            .order('quantity', { ascending: false });

        if (data) {
            // Aggregate by product
            const productMap = new Map();
            data.forEach(item => {
                const id = item.product_id;
                const name = item.products?.name || item.product_snapshot?.name || 'Producto';
                const image = item.products?.image_url || item.product_snapshot?.image_url;

                if (productMap.has(id)) {
                    productMap.get(id).quantity += item.quantity;
                } else {
                    productMap.set(id, { id, name, image, quantity: item.quantity });
                }
            });

            const sorted = Array.from(productMap.values())
                .sort((a, b) => b.quantity - a.quantity)
                .slice(0, 5);

            setTopProducts(sorted);
        }
    };

    const fetchSalesChart = async () => {
        const days = 7;
        const chartData = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const dayStart = new Date(date.setHours(0, 0, 0, 0)).toISOString();
            const dayEnd = new Date(date.setHours(23, 59, 59, 999)).toISOString();

            const { data } = await supabase
                .from('orders')
                .select('total_amount, shipping_cost')
                .gte('created_at', dayStart)
                .lte('created_at', dayEnd)
                .eq('archived', false)
                .in('status', ['paid', 'shipped', 'delivered']);

            const total = data?.reduce((sum, o) => sum + (o.total_amount || 0) + (o.shipping_cost || 0), 0) || 0;

            chartData.push({
                day: date.toLocaleDateString('es-CL', { weekday: 'short' }),
                ventas: total
            });
        }

        setSalesData(chartData);
    };

    const getGrowthPercentage = () => {
        if (kpis.lastMonthSales === 0) return kpis.totalSales > 0 ? 100 : 0;
        return Math.round(((kpis.totalSales - kpis.lastMonthSales) / kpis.lastMonthSales) * 100);
    };

    const getStatusColor = (status) => {
        const colors = {
            pending: 'bg-brand-yellow/10 text-brand-yellow border border-brand-yellow/30',
            paid: 'bg-blue-500/10 text-blue-500 border border-blue-500/30',
            shipped: 'bg-brand-purple/10 text-brand-purple border border-brand-purple/30',
            delivered: 'bg-neon-green/10 text-neon-green border border-neon-green/30',
            cancelled: 'bg-red-500/10 text-red-500 border border-red-500/30',
        };
        return colors[status] || colors.pending;
    };

    const getStatusLabel = (status) => {
        const labels = {
            pending: 'PENDIENTE',
            paid: 'PAGADO',
            shipped: 'ENVIADO',
            delivered: 'ENTREGADO',
            cancelled: 'CANCELADO',
        };
        return labels[status] || status;
    };

    const StatCard = ({ title, value, icon: Icon, color, trend, formatCurrency = false }) => {
        const growth = getGrowthPercentage();
        return (
            <div className="bg-[#111] rounded-2xl p-6 border border-gray-800 hover:border-neon-green/30 transition-all hover:scale-[1.02] shadow-lg group">
                <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-xl ${color} bg-opacity-20 backdrop-blur-sm group-hover:bg-opacity-30 transition-all`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    {trend !== undefined && (
                        <div className={`flex items-center gap-1 text-xs font-black px-2 py-1 rounded-full ${growth >= 0 ? 'bg-neon-green/10 text-neon-green' : 'bg-red-500/10 text-red-500'}`}>
                            {growth >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                            {Math.abs(growth)}%
                        </div>
                    )}
                </div>
                <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider font-bold mb-2">{title}</p>
                    <p className="text-3xl font-black text-white tracking-tight">
                        {formatCurrency && '$'}
                        {formatCurrency ? value.toLocaleString('es-CL') : value}
                    </p>
                </div>
            </div>
        );
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-neon-green font-graffiti text-2xl animate-pulse">CARGANDO DASHBOARD...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-graffiti text-white mb-2 tracking-wide">DASHBOARD</h1>
                <p className="text-gray-400 font-mono text-xs md:text-sm tracking-widest uppercase">Resumen del negocio - Mes actual</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard
                    title="Ventas del Mes"
                    value={kpis.totalSales}
                    icon={DollarSign}
                    color="text-neon-green"
                    formatCurrency
                    trend={getGrowthPercentage()}
                />
                <StatCard
                    title="Pedidos Pendientes"
                    value={kpis.pendingOrders}
                    icon={Clock}
                    color="text-brand-yellow"
                />
                <StatCard
                    title="Total Productos"
                    value={kpis.totalProducts}
                    icon={Package}
                    color="text-brand-purple"
                />
                <StatCard
                    title="Stock Bajo"
                    value={kpis.lowStockProducts}
                    icon={AlertTriangle}
                    color="text-red-500"
                />
            </div>

            {/* Charts and Widgets Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                {/* Sales Chart */}
                <div className="lg:col-span-2 bg-[#111] rounded-2xl p-8 border border-gray-800 shadow-xl">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-black text-white flex items-center gap-3 uppercase tracking-wider">
                            <BarChart3 className="w-5 h-5 text-neon-green" />
                            Ventas Últimos 7 Días
                        </h2>
                    </div>
                    <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={salesData}>
                                <XAxis dataKey="day" stroke="#4b5563" tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                <YAxis stroke="#4b5563" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fill: '#9ca3af', fontSize: 12, fontWeight: 'bold' }} axisLine={false} tickLine={false} />
                                <Tooltip
                                    formatter={(value) => [`$${value.toLocaleString('es-CL')}`, 'Ventas']}
                                    contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.5)' }}
                                    itemStyle={{ color: '#22c55e', fontWeight: 'bold' }}
                                    labelStyle={{ color: '#fff', marginBottom: '8px', fontWeight: 'bold' }}
                                    cursor={{ fill: 'rgba(34, 197, 94, 0.1)' }}
                                />
                                <Bar dataKey="ventas" fill="#22c55e" radius={[6, 6, 0, 0]} barSize={40} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Products */}
                <div className="bg-[#111] rounded-2xl p-8 border border-gray-800 shadow-xl">
                    <h2 className="text-xl font-black text-white mb-6 flex items-center gap-3 uppercase tracking-wider">
                        <ShoppingCart className="w-5 h-5 text-brand-purple" />
                        Top Productos
                    </h2>
                    <div className="space-y-4">
                        {topProducts.length === 0 ? (
                            <p className="text-gray-500 text-sm font-mono uppercase">Sin datos de ventas</p>
                        ) : (
                            topProducts.map((product, idx) => (
                                <div key={product.id} className="flex items-center gap-4 group">
                                    <div className="w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 font-bold text-sm border border-gray-700">
                                        {idx + 1}
                                    </div>
                                    <img
                                        src={product.image || 'https://via.placeholder.com/40'}
                                        alt={product.name}
                                        className="w-12 h-12 rounded-lg object-cover bg-gray-900 border border-gray-800 group-hover:border-brand-purple/50 transition-colors"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-white text-sm font-bold truncate group-hover:text-brand-purple transition-colors">{product.name}</p>
                                        <p className="text-gray-500 text-xs font-mono uppercase">{product.quantity} VENDIDOS</p>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>

            {/* Recent Orders */}
            <div className="bg-[#111] rounded-2xl p-8 border border-gray-800 shadow-xl">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-black text-white uppercase tracking-wider">Últimos Pedidos</h2>
                    <Link
                        to="/admin/pedidos"
                        className="text-neon-green hover:text-white text-xs font-black uppercase tracking-widest border border-neon-green/30 px-4 py-2 rounded-lg hover:bg-neon-green/10 transition-all"
                    >
                        VER TODOS →
                    </Link>
                </div>
                {recentOrders.length === 0 ? (
                    <p className="text-gray-500 font-mono uppercase text-sm">No hay pedidos recientes</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-[800px]">
                            <thead className="border-b border-gray-800">
                                <tr>
                                    <th className="text-left py-4 text-gray-500 text-xs font-black uppercase tracking-widest">ID</th>
                                    <th className="text-left py-4 text-gray-500 text-xs font-black uppercase tracking-widest">Cliente</th>
                                    <th className="text-left py-4 text-gray-500 text-xs font-black uppercase tracking-widest">Total</th>
                                    <th className="text-left py-4 text-gray-500 text-xs font-black uppercase tracking-widest">Estado</th>
                                    <th className="text-left py-4 text-gray-500 text-xs font-black uppercase tracking-widest">Fecha</th>
                                    <th className="text-left py-4 text-gray-500 text-xs font-black uppercase tracking-widest"></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-800/50">
                                {recentOrders.map((order) => (
                                    <tr key={order.id} className="hover:bg-white/5 transition-colors group">
                                        <td className="py-4 text-sm font-mono text-gray-400 group-hover:text-neon-green transition-colors">
                                            {order.id.slice(0, 8).toUpperCase()}
                                        </td>
                                        <td className="py-4 text-sm text-white font-bold">
                                            {order.customer_name || order.shipping_address?.name || 'N/A'}
                                        </td>
                                        <td className="py-4 text-sm font-black text-white">
                                            ${((order.total_amount || 0) + (order.shipping_cost || 0)).toLocaleString('es-CL')}
                                        </td>
                                        <td className="py-4">
                                            <span className={`px-3 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${getStatusColor(order.status)}`}>
                                                {getStatusLabel(order.status)}
                                            </span>
                                        </td>
                                        <td className="py-4 text-xs text-gray-500 font-mono uppercase">
                                            {new Date(order.created_at).toLocaleDateString('es-CL')}
                                        </td>
                                        <td className="py-4 text-right">
                                            <Link
                                                to="/admin/pedidos"
                                                className="text-gray-500 hover:text-neon-green transition-colors"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DashboardPage;
