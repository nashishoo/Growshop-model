import { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import StandardProductCard from './StandardProductCard';
import StandardProductModal from './StandardProductModal';

const ProductGrid = ({ limit = 8 }) => {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedProduct, setSelectedProduct] = useState(null);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchProducts = async () => {
        try {
            const { data, error } = await supabase
                .from('products')
                .select(`
            *,
            brands (name),
            categories (name)
        `)
                .eq('is_active', true)
                .order('updated_at', { ascending: false }) // Show recently updated (fixed items) first
                .limit(limit);

            if (error) throw error;
            setProducts(data);
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-gray-900 h-64 md:h-96 rounded-xl animate-pulse border border-gray-800"></div>
                ))}
            </div>
        );
    }

    return (
        <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-6">
                {products.map((product) => (
                    <StandardProductCard
                        key={product.id}
                        product={product}
                        onClick={() => setSelectedProduct(product)}
                    />
                ))}
            </div>

            {/* Modal */}
            {selectedProduct && (
                <StandardProductModal
                    product={selectedProduct}
                    onClose={() => setSelectedProduct(null)}
                />
            )}
        </>
    );
};

export default ProductGrid;
