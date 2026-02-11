import ProductGrid from '../components/Product/ProductGrid';
import CategoryCarousel from '../components/Home/CategoryCarousel';
import TrustBar from '../components/Home/TrustBar';
import FeaturedCarousel from '../components/Home/FeaturedCarousel';
import BrandsMarquee from '../components/Home/BrandsMarquee';
import CultivationZone from '../components/Home/CultivationZone';
import SeedsCatalog from '../components/Home/SeedsCatalog';
import ContactSection from '../components/Home/ContactSection';
import ToolsZone from '../components/Home/ToolsZone';

const HomePage = () => {
    return (
        <div className="text-white bg-dark-bg min-h-screen font-body selection:bg-neon-green selection:text-black">
            {/* Category Carousel - New Implementation */}
            <CategoryCarousel />

            {/* Trust Bar - Confidence Indicators */}
            <TrustBar />

            {/* New Promo Stickers Section - Mimicking Wall */}
            <div className="relative w-full py-16 md:py-24 overflow-hidden flex justify-center items-center bg-zinc-900">
                {/* Concrete Background from assets */}
                <div className="absolute inset-0 z-0 flex items-center justify-center">
                    <img src="https://i.postimg.cc/fWPsZCFw/concreto-hd-background.webp" alt="Background" className="w-full h-full object-cover" />
                </div>

                <div className="relative z-10 max-w-7xl mx-auto px-4 w-full grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-24 items-center">
                    {/* Mystery Box Sticker */}
                    <div className="group cursor-pointer transform hover:scale-105 hover:rotate-2 transition-all duration-300 relative filter drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)]">
                        <img
                            src="https://i.postimg.cc/hSf0QjQR/cartel-compra-regalo.png"
                            alt="Mystery Box - Sorpresa Garantizada"
                            className="w-full object-contain transform -rotate-1 group-hover:rotate-0 transition-transform"
                        />
                    </div>

                    {/* Flash Sale Sticker */}
                    <div className="group cursor-pointer transform hover:scale-105 hover:-rotate-2 transition-all duration-300 relative filter drop-shadow-[0_15px_15px_rgba(0,0,0,0.6)]">
                        <img
                            src="https://i.postimg.cc/LHnVgXgp/cartel-oferta.png"
                            alt="Flash Sale - 50% OFF"
                            className="w-full object-contain transform rotate-1 group-hover:rotate-0 transition-transform"
                        />
                    </div>
                </div>
            </div>

            {/* --- BRAND MARQUEE --- */}
            <BrandsMarquee />

            {/* Featured Items Carousel - Moved to Full Width below */}
            <div className="bg-black py-12 border-y border-gray-800 relative">
                <div className="max-w-[1920px] mx-auto px-4">
                    <FeaturedCarousel />
                </div>
            </div>

            {/* --- CULTIVATION ZONE (Accordion) --- */}
            <CultivationZone />

            <BrandsMarquee />

            {/* --- SPECIAL: SEEDS CATALOG --- */}
            <SeedsCatalog />

            {/* --- CONTACT & MAP --- */}
            <ContactSection />

            {/* --- TOOLS ZONE --- */}
            <ToolsZone />

            {/* --- FINAL BRAND TICKER --- */}
            <BrandsMarquee />
        </div >
    );
};

export default HomePage;
