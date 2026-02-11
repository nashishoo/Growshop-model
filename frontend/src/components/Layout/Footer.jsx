import React from 'react';
import { Link } from 'react-router-dom';
import { Instagram, Facebook, Twitter, CreditCard, Truck, ShieldCheck, Mail } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-black border-t border-gray-900 pt-16 pb-8 font-body text-gray-400">
            <div className="max-w-7xl mx-auto px-4">

                {/* Main Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">

                    {/* Column 1: Brand & Social */}
                    <div>
                        <h2 className="font-graffiti text-3xl text-white mb-6 tracking-wide">
                            CONECTADOS<span className="text-neon-green">420</span>
                        </h2>
                        <p className="mb-6 text-sm leading-relaxed">
                            Tu growshop de confianza. Calidad premium, asesoría experta y los mejores precios del mercado.
                        </p>
                        <div className="flex gap-4">
                            <a
                                href="https://www.instagram.com/conectados420growshop/?hl=es"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center hover:bg-gradient-to-br hover:from-pink-500 hover:via-red-500 hover:to-yellow-500 hover:text-white transition-all"
                            >
                                <Instagram size={20} />
                            </a>
                        </div>
                    </div>

                    {/* Column 2: Quick Links */}
                    <div>
                        <h3 className="text-white font-bold uppercase tracking-widest mb-6 border-l-4 border-neon-green pl-3">
                            Navegación
                        </h3>
                        <ul className="space-y-3 text-sm">
                            <li><Link to="/catalogo" className="hover:text-neon-green transition-colors">Catálogo Completo</Link></li>
                            <li><Link to="/mi-cuenta" className="hover:text-neon-green transition-colors">Mi Cuenta</Link></li>
                            <li><Link to="/cart" className="hover:text-neon-green transition-colors">Carrito de Compras</Link></li>
                            <li><Link to="/admin/login" className="hover:text-neon-green transition-colors">Acceso Admin</Link></li>
                        </ul>
                    </div>

                    {/* Column 3: Legal & Support */}
                    <div>
                        <h3 className="text-white font-bold uppercase tracking-widest mb-6 border-l-4 border-electric-purple pl-3">
                            Ayuda
                        </h3>
                        <ul className="space-y-3 text-sm">
                            <li><a href="#" className="hover:text-electric-purple transition-colors">Términos y Condiciones</a></li>
                            <li><a href="#" className="hover:text-electric-purple transition-colors">Política de Envíos</a></li>
                            <li><a href="#" className="hover:text-electric-purple transition-colors">Devoluciones</a></li>
                            <li><a href="#" className="hover:text-electric-purple transition-colors">Preguntas Frecuentes</a></li>
                        </ul>
                    </div>

                    {/* Column 4: Trust & Payment */}
                    <div>
                        <h3 className="text-white font-bold uppercase tracking-widest mb-6 border-l-4 border-drip-yellow pl-3">
                            Compra Segura
                        </h3>
                        <div className="space-y-4 mb-6">
                            <div className="flex items-center gap-3 text-sm">
                                <Truck className="text-drip-yellow" size={18} />
                                <span>Envíos a todo Chile</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <ShieldCheck className="text-drip-yellow" size={18} />
                                <span>Garantía de Calidad</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="text-drip-yellow" size={18} />
                                <span>soporte@conectados420.cl</span>
                            </div>
                        </div>

                        <p className="text-xs uppercase tracking-wider mb-3 font-bold text-gray-500">Pagos vía</p>
                        <div className="flex gap-2 opacity-70 grayscale hover:grayscale-0 transition-all">
                            {/* Simple placeholders for payment icons or text */}
                            <div className="bg-white px-2 py-1 rounded text-black text-xs font-bold font-mono">VISA</div>
                            <div className="bg-white px-2 py-1 rounded text-black text-xs font-bold font-mono">MC</div>
                            <div className="bg-blue-500 px-2 py-1 rounded text-white text-xs font-bold italic">MercadoPago</div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
                    <p>© 2026 Conectados 420. Todos los derechos reservados.</p>
                    <p className="mt-4 md:mt-0 flex items-center gap-1 flex-wrap justify-center">
                        Desarrollado con <span className="text-red-500 animate-pulse">❤️</span> y <span className="text-neon-green">🌿</span> por{' '}
                        <a
                            href="https://catapaz.site"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold bg-gradient-to-r from-pink-400 via-purple-500 to-fuchsia-500 bg-clip-text text-transparent hover:from-fuchsia-400 hover:via-pink-500 hover:to-purple-400 transition-all duration-500 mx-1 animate-pulse hover:animate-none"
                            style={{ textShadow: '0 0 10px rgba(236, 72, 153, 0.5)' }}
                        >
                            <span className="text-pink-400">🐱</span> Catapaz <span className="text-pink-300">👧</span>
                        </a>
                        <span className="text-gray-700">&</span>
                        <a
                            href="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent hover:from-indigo-400 hover:via-cyan-500 hover:to-blue-400 transition-all duration-500 mx-1 group"
                        >
                            <span className="group-hover:animate-bounce inline-block">🚀</span> Antigravity <span className="group-hover:animate-spin inline-block">⚛️</span>
                        </a>
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
