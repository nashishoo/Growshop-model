import React from 'react';

const Loader = () => {
    return (
        <div className="fixed inset-0 bg-brand-dark flex items-center justify-center z-50">
            <div className="relative w-48 h-48 md:w-64 md:h-64">
                <img
                    src="https://i.postimg.cc/V6JsSvnY/loader-grow420.webp"
                    alt="Cargando..."
                    className="w-full h-full object-contain animate-spin-slow"
                />
            </div>
        </div>
    );
};

export default Loader;
