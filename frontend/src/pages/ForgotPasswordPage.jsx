import { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

const ForgotPasswordPage = () => {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const { error } = await supabase.auth.resetPasswordForEmail(email, {
                redirectTo: `${window.location.origin}/reset-password`
            });

            if (error) throw error;

            setSent(true);
        } catch (error) {
            console.error('Reset password error:', error);
            setError(error.message || 'Error al enviar el email');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-brand-dark flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full">
                {/* Logo */}
                <div className="text-center mb-8">
                    <Link to="/">
                        <h1 className="text-4xl font-bold text-brand-green mb-2">Conectados 420</h1>
                        <p className="text-slate-400">Growshop Online</p>
                    </Link>
                </div>

                {/* Card */}
                <div className="bg-slate-800 border border-slate-700 rounded-lg shadow-xl p-8">
                    {!sent ? (
                        <>
                            <h2 className="text-2xl font-bold text-white mb-2 text-center">
                                Recuperar Contraseña
                            </h2>
                            <p className="text-slate-400 text-sm text-center mb-6">
                                Ingresa tu email y te enviaremos un link para restablecer tu contraseña
                            </p>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 bg-red-500/10 border border-red-500 rounded-lg p-4 flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                    <p className="text-red-500 text-sm">{error}</p>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-6">
                                {/* Email */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-bold text-slate-300 mb-2">
                                        Email
                                    </label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400" />
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            required
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-10 pr-4 py-3 text-white focus:outline-none focus:border-brand-green transition-colors"
                                            placeholder="tu@email.com"
                                        />
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full bg-brand-green text-black font-bold py-3 rounded-lg hover:bg-green-400 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Enviando...' : 'Enviar Link de Recuperación'}
                                </button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center">
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <CheckCircle className="w-10 h-10 text-green-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">
                                Email Enviado
                            </h2>
                            <p className="text-slate-400 mb-6">
                                Revisa tu bandeja de entrada en{' '}
                                <span className="text-white font-medium">{email}</span>
                                {' '}y sigue las instrucciones para restablecer tu contraseña.
                            </p>
                            <p className="text-slate-500 text-sm mb-6">
                                Si no recibes el email en unos minutos, revisa tu carpeta de spam.
                            </p>
                            <Link
                                to="/login"
                                className="inline-block bg-brand-green text-black font-bold py-3 px-6 rounded-lg hover:bg-green-400 transition-colors"
                            >
                                Volver al Login
                            </Link>
                        </div>
                    )}

                    {/* Back to Login Link */}
                    {!sent && (
                        <div className="mt-6 text-center">
                            <Link
                                to="/login"
                                className="text-slate-400 hover:text-white text-sm transition-colors inline-flex items-center gap-2"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Volver al login
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
