import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Menu, X, Search, User, LogIn, LogOut, Loader2 } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../supabaseClient';
import StandardProductModal from '../Product/StandardProductModal';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { getCartCount } = useCart();
    const { user, signOut } = useAuth();
    const cartCount = getCartCount();
    const navigate = useNavigate();

    // Live Search State
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState(null);
    const searchRef = useRef(null);

    // Close dropdown on outside click
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (searchRef.current && !searchRef.current.contains(e.target)) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Debounced Search
    useEffect(() => {
        if (searchQuery.trim().length < 2) {
            setSearchResults([]);
            setShowResults(false);
            return;
        }

        const debounce = setTimeout(async () => {
            setIsSearching(true);
            try {
                // Note: PostgREST doesn't allow filtering on related table columns in .or()
                // So we only search by product name for now
                const { data, error } = await supabase
                    .from('products')
                    .select('id, name, price, image_url, slug, brands(name)')
                    .ilike('name', `%${searchQuery}%`)
                    .limit(6);

                if (!error && data) {
                    setSearchResults(data);
                    setShowResults(true);
                } else if (error) {
                    console.error('Supabase search error:', error);
                }
            } catch (err) {
                console.error('Search error:', err);
            } finally {
                setIsSearching(false);
            }
        }, 300);

        return () => clearTimeout(debounce);
    }, [searchQuery]);

    const handleResultClick = (product) => {
        setSelectedProduct(product);
        setShowResults(false);
        setSearchQuery('');
    };

    const handleSignOut = async () => {
        try {
            await signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        }
    };

    // Scroll to section helper
    const scrollToSection = (sectionId) => {
        // Navigate home first if not there
        navigate('/');
        setTimeout(() => {
            const el = document.getElementById(sectionId);
            if (el) el.scrollIntoView({ behavior: 'smooth' });
        }, 100);
        setIsOpen(false);
    };

    return (
        <>
            <nav className="bg-black border-b-[1px] border-[#5bc500] shadow-[0_0_15px_rgba(91,197,0,0.3)] sticky top-0 z-50 text-white font-body">
                <div className="max-w-[1600px] mx-auto px-4 sm:px-8 lg:px-12">
                    <div className="flex items-center justify-between h-20 md:h-24">

                        {/* Left Section: Logo */}
                        <div className="flex-shrink-0 flex items-center">
                            <Link to="/" className="flex items-center">
                                <img
                                    src="https://i.postimg.cc/jSJy0qLN/cogollin-logo.png"
                                    alt="Conectados 420 Logo"
                                    className="h-12 md:h-20 w-auto object-contain transition-transform hover:scale-105"
                                />
                            </Link>
                        </div>

                        {/* Center Section: Navigation Links */}
                        <div className="hidden lg:flex items-center justify-center space-x-10 xl:space-x-14">
                            <Link to="/" className="text-[#5bc500] border-b-2 border-[#5bc500] px-1 font-bold text-base tracking-wide hover:text-[#5bc500] transition-colors">
                                INICIO
                            </Link>
                            <Link to="/catalogo" className="text-white hover:text-[#5bc500] px-1 font-bold text-base tracking-wide transition-colors">
                                CATÁLOGO
                            </Link>
                            <button
                                onClick={() => scrollToSection('semillas-section')}
                                className="text-white hover:text-[#5bc500] px-1 font-bold text-base tracking-wide transition-colors"
                            >
                                BANCO GENÉTICO
                            </button>
                            <button
                                onClick={() => scrollToSection('contacto-section')}
                                className="text-white hover:text-[#5bc500] px-1 font-bold text-base tracking-wide transition-colors"
                            >
                                CONTACTO
                            </button>
                        </div>

                        {/* Right Section: Search & Cart & Auth (Desktop) */}
                        <div className="hidden lg:flex items-center gap-6">
                            {/* Live Search Bar */}
                            <div className="relative group" ref={searchRef}>
                                <div className="flex items-center bg-[#1a1a1a] rounded-md border border-gray-800 focus-within:border-[#5bc500] transition-all duration-300 w-72">
                                    <input
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        onFocus={() => searchResults.length > 0 && setShowResults(true)}
                                        placeholder="Buscar productos..."
                                        className="bg-transparent border-none text-white text-sm w-full py-2.5 px-4 focus:ring-0 focus:outline-none placeholder-gray-500"
                                    />
                                    <span className="pr-4 text-gray-400">
                                        {isSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                                    </span>
                                </div>

                                {/* Search Results Desktop */}
                                {showResults && searchResults.length > 0 && (
                                    <div className="absolute top-full left-0 w-full mt-2 bg-zinc-900 border border-gray-800 rounded-lg shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                                        {searchResults.map((product) => (
                                            <button
                                                key={product.id}
                                                onClick={() => handleResultClick(product)}
                                                className="w-full flex items-center gap-4 p-3 hover:bg-[#5bc500]/10 transition-colors text-left border-b border-gray-800/50 last:border-b-0"
                                            >
                                                <img
                                                    src={product.image_url || 'https://via.placeholder.com/50'}
                                                    alt={product.name}
                                                    className="w-12 h-12 object-cover rounded-md bg-gray-800"
                                                />
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-white text-sm font-medium truncate">{product.name}</p>
                                                    <p className="text-gray-500 text-xs">{product.brands?.name || 'Sin marca'}</p>
                                                </div>
                                                <span className="text-[#5bc500] font-bold text-sm whitespace-nowrap">
                                                    ${product.price?.toLocaleString('es-CL')}
                                                </span>
                                            </button>
                                        ))}
                                        <Link
                                            to={`/catalogo?q=${encodeURIComponent(searchQuery)}`}
                                            className="block text-center py-3 text-xs text-gray-400 hover:text-[#5bc500] border-t border-gray-800 bg-black/50"
                                            onClick={() => setShowResults(false)}
                                        >
                                            Ver todos los resultados →
                                        </Link>
                                    </div>
                                )}
                            </div>

                            {/* Cart Button */}
                            <Link to="/cart" className="flex items-center gap-2 group">
                                <span className="text-[#5bc500] font-bold text-sm tracking-wide group-hover:text-white transition-colors">
                                    CARRITO ({cartCount})
                                </span>
                            </Link>

                            {/* Auth Buttons */}
                            <div className="flex items-center gap-4 border-l border-gray-700 pl-6 ml-2">
                                {user ? (
                                    <>
                                        <Link to="/mi-cuenta" className="text-gray-400 hover:text-[#5bc500] transition-colors" title="Mi Cuenta">
                                            <User className="h-5 w-5" />
                                        </Link>
                                        <button onClick={handleSignOut} className="text-gray-400 hover:text-red-500 transition-colors" title="Cerrar Sesión">
                                            <LogOut className="h-5 w-5" />
                                        </button>
                                    </>
                                ) : (
                                    <Link to="/login" className="text-gray-400 hover:text-[#5bc500] transition-colors" title="Iniciar Sesión">
                                        <User className="h-5 w-5" />
                                    </Link>
                                )}
                            </div>
                        </div>

                        {/* Mobile Header Controls (Search, Cart, Menu) */}
                        <div className="flex lg:hidden items-center gap-3">
                            {/* Mobile Search Toggle */}
                            <button
                                onClick={() => {
                                    setIsOpen(true);
                                    // Focus search input after a small delay to allow render
                                    setTimeout(() => document.getElementById('mobile-search-input')?.focus(), 100);
                                }}
                                className="text-white p-2"
                            >
                                <Search className="w-6 h-6" />
                            </button>

                            {/* Mobile Cart Icon */}
                            <Link to="/cart" className="relative text-white p-2">
                                <ShoppingCart className="w-6 h-6" />
                                {cartCount > 0 && (
                                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-black bg-[#5bc500] rounded-full transform translate-x-1/4 -translate-y-1/4">
                                        {cartCount}
                                    </span>
                                )}
                            </Link>

                            {/* Hamburger Menu */}
                            <button
                                onClick={() => setIsOpen(!isOpen)}
                                className="text-[#5bc500] p-2 hover:text-white focus:outline-none"
                            >
                                {isOpen ? <X className="w-7 h-7" /> : <Menu className="w-7 h-7" />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Overlay */}
                {isOpen && (
                    <div className="lg:hidden bg-black border-t border-[#5bc500]/30 absolute w-full left-0 top-full h-[calc(100vh-80px)] overflow-y-auto z-40">
                        {/* Mobile Search Bar inside Menu */}
                        <div className="p-4 border-b border-gray-800 sticky top-0 bg-black z-50">
                            <div className="relative" ref={searchRef}>
                                <div className="flex items-center bg-[#1a1a1a] rounded-full px-4 py-2 border border-gray-800 focus-within:border-[#5bc500] transition-colors">
                                    <Search className="h-5 w-5 text-gray-400 mr-2" />
                                    <input
                                        id="mobile-search-input"
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        placeholder="Buscar..."
                                        className="bg-transparent border-none text-white text-base w-full focus:ring-0 focus:outline-none placeholder-gray-500"
                                        autoComplete="off"
                                    />
                                    {isSearching && <Loader2 className="h-4 w-4 animate-spin text-[#5bc500]" />}
                                </div>
                                {/* Mobile Results */}
                                {showResults && searchResults.length > 0 && (
                                    <div className="absolute left-0 right-0 top-full mt-2 bg-zinc-900 border border-gray-800 rounded-xl shadow-2xl z-50 overflow-hidden">
                                        {searchResults.map((product) => (
                                            <button
                                                key={product.id}
                                                onClick={() => { handleResultClick(product); setIsOpen(false); }}
                                                className="w-full flex items-center gap-3 p-4 hover:bg-[#5bc500]/10 transition-colors text-left border-b border-gray-800/50"
                                            >
                                                <img src={product.image_url || 'https://via.placeholder.com/40'} alt="" className="w-12 h-12 object-cover rounded bg-gray-800" />
                                                <div className="flex-1">
                                                    <p className="text-white text-sm font-bold truncate">{product.name}</p>
                                                    <p className="text-[#5bc500] text-xs">${product.price?.toLocaleString('es-CL')}</p>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="px-6 py-8 space-y-6 text-center">
                            <Link to="/" className="block text-2xl font-graffiti text-white hover:text-[#5bc500] transition-colors" onClick={() => setIsOpen(false)}>INICIO</Link>
                            <Link to="/catalogo" className="block text-2xl font-graffiti text-white hover:text-[#5bc500] transition-colors" onClick={() => setIsOpen(false)}>CATÁLOGO</Link>
                            <button onClick={() => { scrollToSection('semillas-section'); setIsOpen(false); }} className="block w-full text-2xl font-graffiti text-white hover:text-[#5bc500] transition-colors">BANCO GENÉTICO</button>
                            <button onClick={() => { scrollToSection('contacto-section'); setIsOpen(false); }} className="block w-full text-2xl font-graffiti text-white hover:text-[#5bc500] transition-colors">CONTACTO</button>

                            <div className="pt-8 border-t border-gray-800 grid grid-cols-2 gap-4">
                                {user ? (
                                    <>
                                        <Link to="/mi-cuenta" className="flex flex-col items-center justify-center bg-[#111] p-4 rounded-xl text-gray-400 hover:text-[#5bc500] hover:bg-[#1a1a1a]" onClick={() => setIsOpen(false)}>
                                            <User className="h-6 w-6 mb-2" />
                                            <span className="text-xs font-bold tracking-widest">MI CUENTA</span>
                                        </Link>
                                        <button onClick={() => { handleSignOut(); setIsOpen(false); }} className="flex flex-col items-center justify-center bg-[#111] p-4 rounded-xl text-gray-400 hover:text-red-500 hover:bg-[#1a1a1a]">
                                            <LogOut className="h-6 w-6 mb-2" />
                                            <span className="text-xs font-bold tracking-widest">SALIR</span>
                                        </button>
                                    </>
                                ) : (
                                    <Link to="/login" className="col-span-2 flex flex-col items-center justify-center bg-[#111] p-4 rounded-xl text-gray-400 hover:text-[#5bc500] hover:bg-[#1a1a1a]" onClick={() => setIsOpen(false)}>
                                        <LogIn className="h-6 w-6 mb-2" />
                                        <span className="text-xs font-bold tracking-widest">INICIAR SESIÓN</span>
                                    </Link>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Product Modal (Opened from Search) */}
            {selectedProduct && (
                <StandardProductModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}
        </>
    );
};

export default Navbar;
