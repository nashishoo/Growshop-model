import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
    LayoutDashboard,
    ShoppingBag,
    Package,
    Users,
    Settings,
    LogOut,
    Menu,
    X,
    Truck,
    Ticket,
    ExternalLink,
    MapPin
} from 'lucide-react';
import { useState } from 'react';

const AdminLayout = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, profile, signOut } = useAuth();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await signOut();
        navigate('/admin/login');
    };

    const navItems = [
        { path: '/admin', label: 'DASHBOARD', icon: LayoutDashboard },
        { path: '/admin/pedidos', label: 'PEDIDOS', icon: ShoppingBag },
        { path: '/admin/productos', label: 'PRODUCTOS', icon: Package },
        { path: '/admin/cupones', label: 'CUPONES', icon: Ticket },
        { path: '/admin/envios', label: 'GESTIÓN DE ENVÍOS', icon: MapPin },
        { path: '/admin/cola-envios', label: 'COLA ENVÍOS', icon: Truck },
        { path: '/admin/clientes', label: 'CLIENTES', icon: Users },
        { path: '/admin/configuracion', label: 'CONFIGURACIÓN', icon: Settings },
    ];

    return (
        <div className="min-h-screen bg-[#050505] flex relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none fixed"></div>

            {/* Gradient Overlay */}
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-black via-black/95 to-[#111] pointer-events-none fixed"></div>

            {/* Sidebar */}
            <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-72 bg-[#111] border-r border-gray-800
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                <div className="flex flex-col h-full relative z-10">
                    {/* Logo */}
                    <div className="h-20 flex items-center justify-between px-6 border-b border-gray-800 bg-black/50">
                        <Link to="/admin" className="flex flex-col">
                            <span className="text-2xl font-graffiti text-white leading-none">ADMIN</span>
                            <span className="text-neon-green text-xs tracking-[0.3em]">CONECTADOS420</span>
                        </Link>
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden text-gray-400 hover:text-white"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-grow py-6 px-4 space-y-2 overflow-y-auto custom-scrollbar">
                        {navItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = location.pathname === item.path;

                            return (
                                <Link
                                    key={item.path}
                                    to={item.path}
                                    onClick={() => setSidebarOpen(false)}
                                    className={`
                    flex items-center gap-3 px-4 py-4 rounded-xl transition-all duration-300 group
                    ${isActive
                                            ? 'bg-neon-green text-black font-black shadow-[0_0_15px_rgba(57,255,20,0.3)]'
                                            : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                        }
                  `}
                                >
                                    <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? 'text-black' : 'group-hover:text-neon-green'}`} />
                                    <span className="tracking-wide text-sm">{item.label}</span>
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User Info & Logout */}
                    <div className="p-4 border-t border-gray-800 bg-black/20">
                        {/* View Store Button */}
                        <button
                            onClick={() => window.open('/', '_blank')}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 mb-3 bg-neon-green/10 text-neon-green hover:bg-neon-green hover:text-black rounded-xl transition-all font-bold border border-neon-green/30 hover:border-neon-green"
                        >
                            <ExternalLink className="w-5 h-5" />
                            VER TIENDA
                        </button>

                        <div className="mb-4 px-2 flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-neon-green/20 border border-neon-green flex items-center justify-center">
                                <span className="text-neon-green font-graffiti text-xl">A</span>
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-sm font-bold text-white truncate">{user?.email}</p>
                                <p className="text-xs text-neon-green uppercase tracking-wider">{profile?.role}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center justify-center gap-2 px-4 py-3 text-red-500 hover:bg-red-500/10 hover:text-red-400 rounded-xl transition-colors font-bold border border-transparent hover:border-red-500/30"
                        >
                            <LogOut className="w-5 h-5" />
                            CERRAR SESIÓN
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/80 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-h-screen relative z-10 overflow-x-hidden">
                {/* Header */}
                <header className="h-16 md:h-20 bg-[#111]/80 backdrop-blur-md border-b border-gray-800 flex items-center justify-between px-4 md:px-6 sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setSidebarOpen(true)}
                            className="lg:hidden text-white hover:text-neon-green transition-colors"
                        >
                            <Menu className="w-6 h-6" />
                        </button>
                        <h2 className="text-white text-lg md:text-2xl font-graffiti block">
                            PANEL DE CONTROL
                        </h2>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-grow p-6 text-gray-200">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default AdminLayout;
