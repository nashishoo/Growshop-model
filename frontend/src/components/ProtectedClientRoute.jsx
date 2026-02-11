import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedClientRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-brand-dark flex items-center justify-center">
                <div className="text-white text-xl">Cargando...</div>
            </div>
        );
    }

    if (!user) {
        // Save the current location to redirect back after login
        sessionStorage.setItem('returnUrl', window.location.pathname);
        return <Navigate to="/login" replace />;
    }

    return children;
};

export default ProtectedClientRoute;
