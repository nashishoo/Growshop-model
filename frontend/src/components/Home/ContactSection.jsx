import React from 'react';
import { MapPin, Phone, Instagram, Clock, Mail } from 'lucide-react';

const ContactSection = () => {
    return (
        <div id="contacto-section" className="w-full relative bg-[#090909] border-t border-gray-800 mt-20">
            {/* Split Layout */}
            <div className="flex flex-col md:flex-row h-auto md:h-[600px]">

                {/* 1. Map Section (Half Width) - Left */}
                <div className="w-full md:w-1/2 h-[400px] md:h-full relative overflow-hidden border-b md:border-b-0 md:border-r border-gray-800">
                    {/* Overlay Filter for "Urban" Map look */}
                    <div className="absolute inset-0 bg-black/10 pointer-events-none z-10 mix-blend-overlay"></div>

                    <iframe
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3305.8286940843256!2d-71.3092798!3d-34.2924319!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x9663859406aedc3d%3A0x11c4e0d0dd474763!2sConectados420%20growshop!5e0!3m2!1ses!2scl!4v1705880000000!5m2!1ses!2scl"
                        width="100%"
                        height="100%"
                        style={{ border: 0, filter: 'grayscale(100%) invert(90%) contrast(1.2) hue-rotate(180deg)' }}
                        allowFullScreen=""
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                        className="w-full h-full"
                    ></iframe>
                </div>

                {/* 2. Contact Flip Section (Half Width) - RIGHT */}
                {/* Removed padding to allow full bleed image occupancy */}
                <div className="w-full md:w-1/2 h-[500px] md:h-full relative group perspective-1000 cursor-pointer">

                    {/* Inner Flipper Container */}
                    <div className="relative w-full h-full transition-all duration-700 transform-style-3d group-hover:rotate-y-180">

                        {/* === FRONT SIDE: Local Image + Logo === */}
                        <div className="absolute inset-0 w-full h-full backface-hidden bg-[#050505] overflow-hidden">
                            {/* Full Bleed Local Image */}
                            <img
                                src="https://i.postimg.cc/63Y6xG48/Local-mejorado.webp"
                                alt="Local Conectados 420"
                                className="w-full h-full object-cover filter brightness-[0.7] group-hover:brightness-100 transition-all duration-500"
                            />

                            {/* Overlay Gradient */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/40"></div>

                            {/* Center Content: Logo */}
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-8">
                                <div className="relative">
                                    {/* Glow behind logo */}
                                    <div className="absolute inset-0 bg-neon-green/20 blur-[50px] animate-pulse rounded-full"></div>
                                    <img
                                        src="https://i.postimg.cc/QdG3PqY0/contacto.webp"
                                        alt="CONTACTO"
                                        className="relative w-[250px] md:w-[350px] object-contain drop-shadow-[0_0_15px_rgba(255,255,255,0.3)] transform transition-transform group-hover:scale-110"
                                    />
                                </div>

                                <div className="mt-8 flex items-center gap-2 text-white/80 font-graffiti tracking-wider animate-bounce">
                                    <span className="text-xl">CONOCE MÁS</span>
                                    <div className="w-2 h-2 bg-neon-green rounded-full"></div>
                                </div>
                            </div>

                            {/* Decorative Borders */}
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-green to-transparent"></div>
                            <div className="absolute bottom-0 right-0 w-full h-1 bg-gradient-to-l from-electric-purple to-transparent"></div>
                        </div>


                        {/* === BACK SIDE: Contact Info === */}
                        <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180 bg-zinc-900 border-l border-gray-800">
                            {/* Background Texture */}
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10"></div>

                            {/* Matrix Scanline */}
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-neon-green/5 to-transparent h-[10px] w-full animate-[scan_3s_linear_infinite] pointer-events-none"></div>

                            <div className="h-full w-full p-12 flex flex-col justify-center relative z-10">

                                <h3 className="text-4xl md:text-5xl font-graffiti text-white mb-12 border-b-2 border-neon-green/30 pb-4 inline-block">
                                    INFO <span className="text-drip-yellow">VIP</span>
                                </h3>

                                <div className="space-y-8">
                                    {/* Location */}
                                    <div className="flex items-start gap-6 group/item">
                                        <div className="bg-gray-800/80 p-4 rounded-xl text-neon-green group-hover/item:bg-neon-green group-hover/item:text-black transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                                            <MapPin size={32} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-bold uppercase tracking-[0.2em] mb-1">Ubicación</p>
                                            <p className="text-xl text-white font-bold leading-tight">Costado Unimarc - Carrera 299</p>
                                            <p className="text-gray-400">Las Cabras, O'Higgins</p>
                                        </div>
                                    </div>

                                    {/* Hours */}
                                    <div className="flex items-start gap-6 group/item">
                                        <div className="bg-gray-800/80 p-4 rounded-xl text-electric-purple group-hover/item:bg-electric-purple group-hover/item:text-white transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                                            <Clock size={32} />
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 font-bold uppercase tracking-[0.2em] mb-1">Horario</p>
                                            <p className="text-lg text-white font-bold">Lun - Sáb: 10:00 - 13:00 / 15:00 - 20:00</p>
                                            <p className="text-sm text-red-400">Domingo: Cerrado</p>
                                        </div>
                                    </div>

                                    {/* Phone */}
                                    <div className="flex items-start gap-6 group/item">
                                        <div className="bg-gray-800/80 p-4 rounded-xl text-drip-yellow group-hover/item:bg-drip-yellow group-hover/item:text-black transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                                            <Phone size={32} />
                                        </div>
                                        <a href="tel:+56938997228" className="block">
                                            <p className="text-sm text-gray-500 font-bold uppercase tracking-[0.2em] mb-1">Teléfono</p>
                                            <p className="text-xl text-white font-bold hover:text-drip-yellow transition-colors font-mono">+56 9 3899 7228</p>
                                            <p className="text-gray-400 text-sm">WhatsApp disponible</p>
                                        </a>
                                    </div>

                                    {/* Instagram */}
                                    <div className="flex items-start gap-6 group/item">
                                        <div className="bg-gray-800/80 p-4 rounded-xl text-pink-500 group-hover/item:bg-pink-500 group-hover/item:text-white transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]">
                                            <Instagram size={32} />
                                        </div>
                                        <a href="https://www.instagram.com/conectados420growshop/?hl=es" target="_blank" rel="noopener noreferrer" className="block">
                                            <p className="text-sm text-gray-500 font-bold uppercase tracking-[0.2em] mb-1">Instagram</p>
                                            <p className="text-xl text-white font-bold hover:text-pink-500 transition-colors">@conectados420growshop</p>
                                            <p className="text-neon-green text-sm flex items-center gap-1">
                                                <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse"></span> Síguenos
                                            </p>
                                        </a>
                                    </div>
                                </div>

                                <div className="mt-12">
                                    <button className="flex items-center gap-3 text-gray-400 hover:text-white transition-colors group/btn">
                                        <div className="h-[1px] w-12 bg-gray-600 group-hover/btn:w-24 transition-all"></div>
                                        <span className="text-xs uppercase tracking-widest">Volver al Mapa</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Styles */}
            <style>{`
                .perspective-1000 { perspective: 1000px; }
                .transform-style-3d { transform-style: preserve-3d; }
                .backface-hidden { backface-visibility: hidden; }
                .rotate-y-180 { transform: rotateY(180deg); }
                .group:hover .group-hover\\:rotate-y-180 { transform: rotateY(180deg); }
                @keyframes scan {
                    0% { top: 0%; opacity: 0; }
                    10% { opacity: 1; }
                    90% { opacity: 1; }
                    100% { top: 100%; opacity: 0; }
                }
            `}</style>
        </div>
    );
};

export default ContactSection;
