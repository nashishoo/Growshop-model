import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, AlertCircle, ArrowLeft } from 'lucide-react';

const LoginPage = () => {
    const navigate = useNavigate();
    const { signIn } = useAuth();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await signIn(email, password);
            // Use window.location.href instead of navigate to force page reload
            // This ensures proper auth state is established before accessing admin
            window.location.href = '/admin';
        } catch (err) {
            console.error('Login error:', err);
            setError('Email o contraseña incorrectos');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center px-4 relative overflow-hidden">
            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>

            {/* Background Gradient Blurs */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-green/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-purple/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-md w-full relative z-10">
                {/* Logo/Title */}
                <div className="text-center mb-10">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-[#111] rounded-2xl border-2 border-neon-green shadow-[0_0_20px_rgba(57,255,20,0.3)] mb-6 rotate-3 hover:rotate-0 transition-transform duration-300">
                        <Lock className="w-10 h-10 text-neon-green" />
                    </div>
                    <h1 className="text-4xl font-graffiti text-white mb-2 tracking-wide">ADMIN PANEL</h1>
                    <p className="text-gray-500 font-mono text-sm tracking-widest uppercase">Conectados 420</p>
                </div>

                {/* Login Form */}
                <div className="bg-[#111]/80 backdrop-blur-md rounded-2xl p-8 shadow-2xl border border-gray-800 relative group hover:border-neon-green/50 transition-colors duration-500">
                    {/* Animated Border Glow */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-green to-transparent opacity-0 group-hover:opacity-20 rounded-2xl blur transition-opacity duration-500 pointer-events-none"></div>

                    <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500 rounded-lg p-4 flex items-start gap-3">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                <p className="text-red-500 text-sm font-bold">{error}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
                                Email
                            </label>
                            <div className="relative group/input">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within/input:text-neon-green transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    className="w-full bg-black/50 border border-gray-800 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-neon-green focus:bg-black transition-all"
                                    placeholder="admin@ejemplo.com"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
                                Contraseña
                            </label>
                            <div className="relative group/input">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5 group-focus-within/input:text-neon-green transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    className="w-full bg-black/50 border border-gray-800 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-neon-green focus:bg-black transition-all"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-neon-green text-black font-black py-4 rounded-xl hover:bg-white hover:scale-[1.02] transform transition-all duration-300 shadow-[0_0_20px_rgba(57,255,20,0.3)] disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider"
                        >
                            {loading ? 'ACCEDIENDO...' : 'INGRESAR AL SISTEMA'}
                        </button>
                    </form>
                </div>

                <div className="text-center mt-8">
                    <button
                        onClick={() => navigate('/')}
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-neon-green transition-colors font-medium group"
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Volver a la tienda
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
