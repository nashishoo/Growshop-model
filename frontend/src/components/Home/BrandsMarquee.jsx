import React from 'react';

// Real Brand Logos
const BRANDS = [
    { name: 'BioBizz', id: 1, logo: 'https://i.postimg.cc/rFrFd7Xf/biobizz.webp' },
    { name: 'OZeta', id: 2, logo: 'https://i.postimg.cc/fT9T31nH/OZeta-logo-white-no-bg-edited.webp' },
    { name: 'Plagron', id: 3, logo: 'https://i.postimg.cc/HsysJFDZ/plagron.webp' },
    { name: 'Raw', id: 4, logo: 'https://i.postimg.cc/yYZYJ24p/raw.webp' },
    { name: 'Top Crop', id: 5, logo: 'https://i.postimg.cc/65v57FJ1/topcrop.webp' },
    // Duplicate for seamless loop
    { name: 'BioBizz', id: 6, logo: 'https://i.postimg.cc/rFrFd7Xf/biobizz.webp' },
    { name: 'OZeta', id: 7, logo: 'https://i.postimg.cc/fT9T31nH/OZeta-logo-white-no-bg-edited.webp' },
    { name: 'Plagron', id: 8, logo: 'https://i.postimg.cc/HsysJFDZ/plagron.webp' },
    { name: 'Raw', id: 9, logo: 'https://i.postimg.cc/yYZYJ24p/raw.webp' },
    { name: 'Top Crop', id: 10, logo: 'https://i.postimg.cc/65v57FJ1/topcrop.webp' },
];

const BrandsMarquee = () => {
    return (
        <div className="w-full bg-black border-y-2 border-neon-green/50 py-6 overflow-hidden relative z-20">
            {/* Gradient Fade Edges */}
            <div className="absolute top-0 left-0 h-full w-24 bg-gradient-to-r from-black to-transparent z-10"></div>
            <div className="absolute top-0 right-0 h-full w-24 bg-gradient-to-l from-black to-transparent z-10"></div>

            {/* Marquee Track */}
            <div className="flex w-max animate-marquee">
                {/* First Set */}
                {BRANDS.map((brand) => (
                    <div key={`set1-${brand.id}`} className="flex items-center mx-12 md:mx-20">
                        <img
                            src={brand.logo}
                            alt={brand.name}
                            className="h-10 md:h-14 object-contain opacity-70 hover:opacity-100 transition-opacity duration-300 filter grayscale hover:grayscale-0"
                        />
                    </div>
                ))}

                {/* Clone Set for Infinite Loop */}
                {BRANDS.map((brand) => (
                    <div key={`set2-${brand.id}`} className="flex items-center mx-12 md:mx-20">
                        <img
                            src={brand.logo}
                            alt={brand.name}
                            className="h-10 md:h-14 object-contain opacity-70 hover:opacity-100 transition-opacity duration-300 filter grayscale hover:grayscale-0"
                        />
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes marquee {
                    0% { transform: translateX(0); }
                    100% { transform: translateX(-50%); }
                }
                .animate-marquee {
                    animation: marquee 20s linear infinite;
                }
                .animate-marquee:hover {
                    animation-play-state: paused;
                }
            `}</style>
        </div>
    );
};

export default BrandsMarquee;
