import React, { useRef } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const categories = [
    { name: 'Semillas', icon: 'https://i.postimg.cc/50cYMDXj/Semillas-boton.png', link: '/catalogo?category=semillas' },
    { name: 'Indoor', icon: 'https://i.postimg.cc/VN0rpzkm/Indoor-boton.png', link: '/catalogo?category=indoor' },
    { name: 'Nutrientes', icon: 'https://i.postimg.cc/3RM4HzkR/nutrientes-boton.png', link: '/catalogo?category=nutrientes' },
    { name: 'Merch 420', icon: 'https://i.postimg.cc/G208164p/merch-boton.png', link: '/catalogo?category=merch' },
    { name: 'Parafernalia', icon: 'https://i.postimg.cc/Wbf4vxyX/parafernalia-boton.png', link: '/catalogo?category=parafernalia' },
    { name: 'Vapos', icon: 'https://i.postimg.cc/wMpBkVpH/vapo-boton.png', link: '/catalogo?category=vapos' },
    { name: 'Sustratos', icon: 'https://i.postimg.cc/GhSCLQ5G/sustrato-boton.png', link: '/catalogo?category=sustratos' },
];

const CategoryCarousel = () => {
    const scrollRef = useRef(null);

    const scroll = (direction) => {
        const { current } = scrollRef;
        if (current) {
            // Determine scroll amount based on screen size approximation or fixed value
            const scrollAmount = current.offsetWidth / 2; // Scroll by half screen width
            current.scrollBy({
                left: direction === 'left' ? -scrollAmount : scrollAmount,
                behavior: 'smooth'
            });
        }
    };

    return (
        <div className="w-full bg-black py-4 relative z-40">
            <div className="max-w-[1600px] mx-auto px-4 relative flex items-center">

                {/* Left Arrow - Consistent Visibility */}
                <button
                    onClick={() => scroll('left')}
                    className="absolute left-2 top-1/2 -translate-y-1/2 z-30 p-2 group transition-all duration-300"
                >
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-black/80 backdrop-blur-sm border-2 border-gray-600 group-hover:border-neon-green rounded-full flex items-center justify-center transition-colors shadow-lg">
                        <ChevronLeft className="text-white group-hover:text-neon-green transition-colors" size={24} />
                    </div>
                </button>

                {/* Scrollable Container */}
                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto scrollbar-hide items-center w-full snap-x snap-mandatory gap-0 px-12"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {categories.map((cat, index) => (
                        <div key={index} className="flex-shrink-0 w-1/2 md:w-1/3 lg:w-1/5 flex justify-center snap-center px-2">
                            <Link
                                to={cat.link}
                                className="group relative transition-all duration-300 w-full flex flex-col items-center"
                            >
                                {/* Pulsing Glow Behind on Hover */}
                                <div className="absolute inset-0 bg-neon-green/0 group-hover:bg-neon-green/20 blur-xl rounded-full transition-all duration-500 scale-75 group-hover:scale-100"></div>

                                {/* Image Container with Effects */}
                                <div className="relative transform group-hover:scale-110 group-hover:-translate-y-2 transition-all duration-300">
                                    <img
                                        src={cat.icon}
                                        alt={cat.name}
                                        className="w-full max-w-[280px] object-contain drop-shadow-[0_4px_8px_rgba(0,0,0,0.5)] group-hover:drop-shadow-[0_8px_25px_rgba(57,255,20,0.5)] filter brightness-90 group-hover:brightness-125 transition-all duration-300"
                                    />

                                    {/* Animated Ring on Hover */}
                                    <div className="absolute -inset-2 border-2 border-transparent group-hover:border-neon-green/50 rounded-2xl transition-all duration-300 animate-pulse opacity-0 group-hover:opacity-100"></div>
                                </div>

                                {/* "Click Me" Subtle Hint */}
                                <div className="mt-2 text-[10px] uppercase tracking-[0.2em] text-gray-600 group-hover:text-neon-green transition-colors opacity-0 group-hover:opacity-100 font-bold">
                                    Ver Categoría →
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>

                {/* Right Arrow - Consistent Visibility */}
                <button
                    onClick={() => scroll('right')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 z-30 p-2 group transition-all duration-300"
                >
                    <div className="w-10 h-10 md:w-12 md:h-12 bg-black/80 backdrop-blur-sm border-2 border-gray-600 group-hover:border-neon-green rounded-full flex items-center justify-center transition-colors shadow-lg">
                        <ChevronRight className="text-white group-hover:text-neon-green transition-colors" size={24} />
                    </div>
                </button>
            </div>

            {/* CSS to hide scrollbar for Webkit */}
            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
            `}</style>
        </div>
    );
};

export default CategoryCarousel;
