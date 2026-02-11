import { supabase } from '../supabaseClient';
import { blueExpressService } from './blueExpressService';

/**
 * Shipping Service - Strategy Pattern
 * FIXED: Flexible region matching for O'Higgins variations
 */

// Strategy: Static pricing from database
const staticPricingStrategy = {
    name: 'static',

    async calculateShipping(address, cartTotal, shippingOption = 'standard') {
        try {
            // First try exact match
            let { data, error } = await supabase
                .from('shipping_zones')
                .select('*')
                .eq('comuna', address.comuna)
                .eq('region', address.region)
                .eq('is_active', true)
                .maybeSingle();

            // If not found, try flexible matching by comuna only
            if (!data) {
                const { data: flexData, error: flexError } = await supabase
                    .from('shipping_zones')
                    .select('*')
                    .eq('comuna', address.comuna)
                    .eq('is_active', true)
                    .limit(1)
                    .maybeSingle();

                data = flexData;
                error = flexError;
            }

            if (!data) {
                // Fallback: default price if zone not found
                console.warn(`Zona no encontrada para ${address.comuna}, ${address.region}. Usando precio por defecto`);
                return {
                    cost: 4000,
                    days: 3,
                    option: shippingOption,
                    freeShipping: false,
                    message: 'Precio estimado - zona no configurada'
                };
            }

            // Check free shipping threshold
            const isFreeShipping = cartTotal >= data.free_shipping_threshold;

            // Calculate cost based on option
            const cost = isFreeShipping ? 0 : (
                shippingOption === 'express' ? data.express_price : data.base_price
            );

            const days = shippingOption === 'express' ? data.express_days : data.estimated_days;

            return {
                cost,
                days,
                option: shippingOption,
                freeShipping: isFreeShipping,
                threshold: data.free_shipping_threshold,
                message: isFreeShipping ? '¡Envío gratis!' : null
            };

        } catch (error) {
            console.error('Error calculating static shipping:', error);
            // Return fallback instead of throwing
            return {
                cost: 4000,
                days: 3,
                option: shippingOption,
                freeShipping: false,
                message: 'Precio estimado'
            };
        }
    }
};

// Strategy: Blue Express API (for future use)
const blueExpressStrategy = {
    name: 'bluexpress',

    async calculateShipping(address, cartTotal, shippingOption = 'standard', cartItems = []) {
        try {
            // Calculate total weight from cart items
            const totalWeight = cartItems.reduce((sum, item) => {
                return sum + (item.weight || 1) * item.quantity;
            }, 0);

            // Call Blue Express API for real-time quote
            const quote = await blueExpressService.calculateRate({
                destination: {
                    comuna: address.comuna,
                    region: address.region
                },
                package: {
                    weight: totalWeight,
                }
            });

            if (!quote.success) {
                // Fallback to static pricing if API fails
                console.warn('Blue Express API failed, falling back to static pricing');
                return staticPricingStrategy.calculateShipping(address, cartTotal, shippingOption);
            }

            return {
                cost: quote.cost,
                days: quote.estimatedDays,
                option: shippingOption,
                freeShipping: cartTotal >= 50000,
                carrier: 'Blue Express',
                trackingAvailable: true
            };

        } catch (error) {
            console.error('Error with Blue Express API, falling back:', error);
            return staticPricingStrategy.calculateShipping(address, cartTotal, shippingOption);
        }
    }
};

// Strategy: Chilexpress API (for future use)
const chilexpressStrategy = {
    name: 'chilexpress',

    async calculateShipping(address, cartTotal, shippingOption = 'standard', cartItems = []) {
        return staticPricingStrategy.calculateShipping(address, cartTotal, shippingOption);
    }
};

/**
 * Main Shipping Service
 */
class ShippingService {
    constructor() {
        this.currentStrategy = staticPricingStrategy;
        this.availableStrategies = {
            static: staticPricingStrategy,
            bluexpress: blueExpressStrategy,
            chilexpress: chilexpressStrategy
        };
    }

    setStrategy(strategyName) {
        if (this.availableStrategies[strategyName]) {
            this.currentStrategy = this.availableStrategies[strategyName];
            console.log(`Shipping strategy changed to: ${strategyName}`);
        } else {
            console.warn(`Unknown strategy: ${strategyName}, keeping current`);
        }
    }

    async calculateShipping(address, cartTotal, shippingOption = 'standard', cartItems = []) {
        if (!address || !address.comuna || !address.region) {
            throw new Error('Dirección incompleta: se requiere comuna y región');
        }

        return this.currentStrategy.calculateShipping(
            address,
            cartTotal,
            shippingOption,
            cartItems
        );
    }

    async getAvailableOptions(address, cartTotal, cartItems = []) {
        const standardShipping = await this.calculateShipping(
            address,
            cartTotal,
            'standard',
            cartItems
        );

        const expressShipping = await this.calculateShipping(
            address,
            cartTotal,
            'express',
            cartItems
        );

        const pickupOption = {
            cost: 0,
            days: 0,
            option: 'pickup',
            freeShipping: true,
            message: 'Retiro en tienda - Sin costo'
        };

        return [
            {
                id: 'standard',
                label: 'Envío Estándar',
                ...standardShipping
            },
            {
                id: 'express',
                label: 'Envío Express',
                ...expressShipping
            },
            {
                id: 'pickup',
                label: 'Retiro en Tienda',
                ...pickupOption
            }
        ];
    }

    async loadStrategyFromSettings() {
        try {
            const { data } = await supabase
                .from('store_settings')
                .select('bluexpress_enabled, default_shipping_option')
                .single();

            if (data?.bluexpress_enabled) {
                this.setStrategy('bluexpress');
            } else {
                this.setStrategy('static');
            }
        } catch (error) {
            console.warn('Could not load strategy from settings, using static');
        }
    }
}

export const shippingService = new ShippingService();

export const formatShippingInfo = (shipping) => {
    if (shipping.freeShipping) {
        return {
            display: '¡GRATIS!',
            amount: 0,
            badge: 'success',
            message: shipping.message || `Envío gratis en compras sobre $${shipping.threshold?.toLocaleString('es-CL')}`
        };
    }

    return {
        display: `$${shipping.cost.toLocaleString('es-CL')}`,
        amount: shipping.cost,
        badge: 'default',
        message: `Entrega estimada: ${shipping.days} ${shipping.days === 1 ? 'día' : 'días'} hábiles`
    };
};
