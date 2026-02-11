import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Mail, Lock, Eye, EyeOff, AlertCircle, ArrowLeft } from 'lucide-react';

const ClientLoginPage = () => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password
            });

            if (error) throw error;

            // Get user profile to check role
            const { data: profile } = await supabase
                .from('profiles')
                .select('role')
                .eq('id', data.user.id)
                .single();

            // Redirect based on role
            if (profile?.role === 'admin') {
                navigate('/admin');
            } else {
                // Check if there's a returnUrl in sessionStorage
                const returnUrl = sessionStorage.getItem('returnUrl');
                if (returnUrl) {
                    sessionStorage.removeItem('returnUrl');
                    navigate(returnUrl);
                } else {
                    navigate('/mi-cuenta');
                }
            }
        } catch (error) {
            console.error('Login error:', error);
            setError(error.message || 'Error al iniciar sesión');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    redirectTo: `${window.location.origin}/mi-cuenta`,
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    }
                }
            });

            if (error) throw error;
        } catch (error) {
            console.error('Google login error:', error);
            setError('Error al iniciar sesión con Google');
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

            {/* Background Texture */}
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10 pointer-events-none"></div>

            {/* Background Gradient Blurs */}
            <div className="absolute top-0 left-1/4 w-96 h-96 bg-neon-green/10 rounded-full blur-[120px] pointer-events-none"></div>
            <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-brand-purple/10 rounded-full blur-[120px] pointer-events-none"></div>

            <div className="max-w-md w-full relative z-10">
                {/* Logo */}
                <div className="text-center mb-10">
                    <Link to="/" className="inline-block group">
                        <h1 className="text-5xl font-graffiti text-white mb-2 group-hover:scale-110 transition-transform duration-300">
                            Conectados <span className="text-neon-green">420</span>
                        </h1>
                        <div className="h-1 w-24 bg-neon-green mx-auto rounded-full shadow-[0_0_10px_#39FF14] group-hover:w-full transition-all duration-500"></div>
                    </Link>
                </div>

                {/* Card */}
                <div className="bg-[#111]/80 backdrop-blur-md border border-gray-800 rounded-2xl shadow-2xl p-8 relative group hover:border-neon-green/50 transition-colors duration-500">
                    {/* Animated Border Glow */}
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-neon-green to-transparent opacity-0 group-hover:opacity-20 rounded-2xl blur transition-opacity duration-500 pointer-events-none"></div>

                    <h2 className="text-3xl font-graffiti text-white mb-8 text-center tracking-wide">Iniciar Sesión</h2>

                    {/* Error Message */}
                    {error && (
                        <div className="mb-6 bg-red-500/10 border border-red-500 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <p className="text-red-500 text-sm font-bold">{error}</p>
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
                                Email
                            </label>
                            <div className="relative group/input">
                                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/input:text-neon-green transition-colors" />
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                    className="w-full bg-black/50 border border-gray-800 rounded-xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-neon-green focus:bg-black transition-all"
                                    placeholder="tu@email.com"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="password" className="block text-sm font-bold text-gray-400 mb-2 uppercase tracking-wider">
                                Contraseña
                            </label>
                            <div className="relative group/input">
                                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within/input:text-neon-green transition-colors" />
                                <input
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full bg-black/50 border border-gray-800 rounded-xl pl-12 pr-12 py-4 text-white focus:outline-none focus:border-neon-green focus:bg-black transition-all"
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Forgot Password Link */}
                        <div className="flex items-center justify-end">
                            <Link
                                to="/recuperar-password"
                                className="text-sm text-gray-400 hover:text-neon-green transition-colors font-medium"
                            >
                                ¿Olvidaste tu contraseña?
                            </Link>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-neon-green text-black font-black py-4 rounded-xl hover:bg-white hover:scale-[1.02] transform transition-all duration-300 shadow-[0_0_20px_rgba(57,255,20,0.3)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                        >
                            {loading ? 'CONECTANDO...' : 'ENTRAR AL CLUB'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative my-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-800"></div>
                        </div>
                        <div className="relative flex justify-center text-xs uppercase tracking-widest">
                            <span className="px-4 bg-[#111] text-gray-500">o continúa con</span>
                        </div>
                    </div>

                    {/* Social Login */}
                    <button
                        type="button"
                        onClick={handleGoogleLogin}
                        className="w-full bg-white text-black font-bold py-4 rounded-xl hover:bg-gray-200 transition-colors flex items-center justify-center gap-3"
                    >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                            <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                            <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                            <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                            <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                        </svg>
                        Google
                    </button>

                    {/* Register Link */}
                    <div className="mt-8 text-center">
                        <p className="text-gray-400 text-sm">
                            ¿No tienes cuenta?{' '}
                            <Link to="/registro" className="text-neon-green hover:text-white font-bold transition-colors uppercase ml-1">
                                Regístrate aquí
                            </Link>
                        </p>
                    </div>
                </div>

                {/* Back to Home */}
                <div className="mt-8 text-center h-10">
                    <Link to="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-neon-green transition-colors font-medium group">
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Volver a la tienda
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ClientLoginPage;
