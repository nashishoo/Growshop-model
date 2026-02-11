import React from 'react';
import { Truck, Lock, Leaf, MessageCircle } from 'lucide-react';

const TrustBar = () => {
    const trustItems = [
        {
            icon: Truck,
            title: 'ENVÍOS A TODO CHILE',
            subtitle: '100% Discretos',
        },
        {
            icon: Lock,
            title: 'PAGO SEGURO',
            subtitle: 'MercadoPago & Transferencia',
        },
        {
            icon: Leaf,
            title: 'CALIDAD GARANTIZADA',
            subtitle: 'Las mejores marcas',
        },
        {
            icon: MessageCircle,
            title: 'ASESORÍA EXPERTA',
            subtitle: '¿Dudas? Escríbenos',
            link: 'https://wa.me/56938997228',
        },
    ];

    return (
        <div className="w-full bg-black border-y border-gray-900 py-6">
            <div className="max-w-[1400px] mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-4">
                    {trustItems.map((item, index) => {
                        const IconComponent = item.icon;
                        const content = (
                            <div className="flex flex-col items-center text-center group cursor-pointer">
                                {/* Icon with Glow Effect */}
                                <div className="relative mb-3">
                                    {/* Glow Behind */}
                                    <div className="absolute inset-0 bg-neon-green/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                    <IconComponent
                                        size={36}
                                        className="relative text-neon-green group-hover:scale-110 transition-transform duration-300"
                                        strokeWidth={1.5}
                                    />
                                </div>

                                {/* Text */}
                                <h4 className="text-white font-bold text-xs md:text-sm tracking-wide mb-1 group-hover:text-neon-green transition-colors">
                                    {item.title}
                                </h4>
                                <p className="text-gray-500 text-[10px] md:text-xs">
                                    {item.subtitle}
                                </p>
                            </div>
                        );

                        // If item has a link, wrap in anchor
                        if (item.link) {
                            return (
                                <a
                                    key={index}
                                    href={item.link}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block"
                                >
                                    {content}
                                </a>
                            );
                        }

                        return <div key={index}>{content}</div>;
                    })}
                </div>
            </div>
        </div>
    );
};

export default TrustBar;
