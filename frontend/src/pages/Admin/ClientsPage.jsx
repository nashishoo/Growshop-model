import { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Search, Users, Mail, Phone, MapPin } from 'lucide-react';

const ClientsPage = () => {
    const [clients, setClients] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchClients();
    }, []);

    const fetchClients = async () => {
        try {
            // Get unique customers from orders
            const { data: orders, error } = await supabase
                .from('orders')
                .select('shipping_address, created_at')
                .order('created_at', { ascending: false });

            if (error) throw error;

            // Extract unique clients by email
            const clientsMap = new Map();
            orders.forEach(order => {
                const email = order.shipping_address?.email;
                if (email && !clientsMap.has(email)) {
                    clientsMap.set(email, {
                        email,
                        name: order.shipping_address?.name || 'N/A',
                        phone: order.shipping_address?.phone || 'N/A',
                        city: order.shipping_address?.city || 'N/A',
                        region: order.shipping_address?.region || 'N/A',
                        firstOrderDate: order.created_at,
                    });
                }
            });

            // Count orders per client
            const clientsWithStats = Array.from(clientsMap.values()).map(client => {
                const orderCount = orders.filter(o => o.shipping_address?.email === client.email).length;
                return { ...client, orderCount };
            });

            setClients(clientsWithStats);
        } catch (error) {
            console.error('Error fetching clients:', error);
        } finally {
            setLoading(false);
        }
    };

    const filteredClients = clients.filter(client => {
        return searchTerm === '' ||
            client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            client.city.toLowerCase().includes(searchTerm.toLowerCase());
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-neon-green font-graffiti text-2xl animate-pulse">CARGANDO CLIENTES...</div>
            </div>
        );
    }

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl md:text-4xl font-graffiti text-white mb-2 tracking-wide">GESTIÓN DE CLIENTES</h1>
                <p className="text-gray-400 font-mono text-xs md:text-sm tracking-wider uppercase">Base de datos de clientes (extraída de pedidos)</p>
            </div>

            {/* Search */}
            <div className="bg-[#111] rounded-2xl p-6 border border-gray-800 mb-8 shadow-lg">
                <div className="relative group">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within:text-neon-green transition-colors" />
                    <input
                        type="text"
                        placeholder="BUSCAR POR NOMBRE, EMAIL O CIUDAD..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-black/50 border border-gray-800 rounded-xl pl-12 pr-4 py-4 text-white placeholder-gray-600 focus:outline-none focus:border-neon-green focus:bg-black transition-all uppercase text-sm tracking-wide"
                    />
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-[#111] rounded-2xl p-6 border border-gray-800 hover:border-brand-purple/50 transition-colors group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-brand-purple/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Users className="w-6 h-6 text-brand-purple" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs uppercase tracking-wider font-bold mb-1">Total Clientes</p>
                            <p className="text-3xl font-black text-white">{clients.length}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#111] rounded-2xl p-6 border border-gray-800 hover:border-neon-green/50 transition-colors group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-neon-green/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Users className="w-6 h-6 text-neon-green" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs uppercase tracking-wider font-bold mb-1">Clientes Recurrentes</p>
                            <p className="text-3xl font-black text-white">
                                {clients.filter(c => c.orderCount > 1).length}
                            </p>
                        </div>
                    </div>
                </div>
                <div className="bg-[#111] rounded-2xl p-6 border border-gray-800 hover:border-brand-yellow/50 transition-colors group">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-brand-yellow/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Users className="w-6 h-6 text-brand-yellow" />
                        </div>
                        <div>
                            <p className="text-gray-500 text-xs uppercase tracking-wider font-bold mb-1">Nuevos (1 pedido)</p>
                            <p className="text-3xl font-black text-white">
                                {clients.filter(c => c.orderCount === 1).length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Clients Table */}
            <div className="bg-[#111] rounded-2xl border border-gray-800 overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full min-w-[1000px]">
                        <thead className="bg-black/50 border-b border-gray-800">
                            <tr>
                                <th className="px-6 py-5 text-left text-xs font-black text-gray-500 uppercase tracking-widest">
                                    Cliente
                                </th>
                                <th className="px-6 py-5 text-left text-xs font-black text-gray-500 uppercase tracking-widest">
                                    Contacto
                                </th>
                                <th className="px-6 py-5 text-left text-xs font-black text-gray-500 uppercase tracking-widest">
                                    Ubicación
                                </th>
                                <th className="px-6 py-5 text-left text-xs font-black text-gray-500 uppercase tracking-widest">
                                    Pedidos
                                </th>
                                <th className="px-6 py-5 text-left text-xs font-black text-gray-500 uppercase tracking-widest">
                                    Primer Pedido
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {filteredClients.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500 font-mono text-sm uppercase">
                                        No se encontraron clientes
                                    </td>
                                </tr>
                            ) : (
                                filteredClients.map((client, index) => (
                                    <tr
                                        key={index}
                                        className="hover:bg-white/5 transition-colors group"
                                    >
                                        <td className="px-6 py-4 text-sm">
                                            <div className="font-bold text-white group-hover:text-neon-green transition-colors">{client.name}</div>
                                            <div className="text-xs text-gray-500 font-mono">{client.email}</div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <Phone className="w-3 h-3 text-gray-600" />
                                                <span className="font-mono text-xs">{client.phone}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-400">
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-3 h-3 text-gray-600" />
                                                <span className="capitalize">{client.city}, {client.region}</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`px-3 py-1 rounded-md text-xs font-black uppercase tracking-wider ${client.orderCount > 1
                                                ? 'bg-neon-green/10 text-neon-green border border-neon-green/20'
                                                : 'bg-brand-purple/10 text-brand-purple border border-brand-purple/20'
                                                }`}>
                                                {client.orderCount} {client.orderCount === 1 ? 'PEDIDO' : 'PEDIDOS'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono text-xs">
                                            {new Date(client.firstOrderDate).toLocaleDateString('es-CL')}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Info */}
            <div className="mt-6 text-center text-gray-600 text-xs font-mono uppercase tracking-widest">
                Mostrando {filteredClients.length} de {clients.length} clientes
            </div>
        </div>
    );
};

export default ClientsPage;
