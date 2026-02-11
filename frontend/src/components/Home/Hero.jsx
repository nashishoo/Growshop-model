import React from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
    // Defines the background image. 
    // User can replace this URL with their generated image later.
    const bgImage = "https://i.postimg.cc/zBpxbDwY/Gemini-Generated-Image-yq2ybryq2ybryq2y.png";

    // The overlay graphic provided by the user
    const overlayImage = "https://i.postimg.cc/TTrr91vv/Banner-Tempora-Outdor.png";

    return (
        <section className="relative w-full h-[500px] md:h-[600px] bg-black overflow-hidden">
            {/* Background Image */}
            <div
                className="absolute inset-0 w-full h-full bg-cover bg-center opacity-80"
                style={{ backgroundImage: `url(${bgImage})` }}
            >
                {/* Optional: Dark gradient overlay to make text pop if needed */}
                <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/60" />
            </div>

            {/* Content Overlay */}
            <div className="absolute inset-0 flex items-center justify-center p-4">
                {/* The entire overlay image acts as the specific "Temporada Outdoor + Button" graphic */}
                <Link
                    to="/catalogo"
                    className="relative block w-full max-w-4xl transition-transform hover:scale-105 duration-300 group"
                >
                    <img
                        src={overlayImage}
                        alt="Temporada Outdoor - Ver Colección"
                        className="w-full h-auto object-contain drop-shadow-[0_10px_20px_rgba(0,0,0,0.5)]"
                    />
                    {/* Glow effect on hover */}
                    <div className="absolute inset-0 bg-yellow-400/0 group-hover:bg-yellow-400/5 rounded-3xl transition-all duration-300 blur-xl" />
                </Link>
            </div>
        </section>
    );
};

export default Hero;
