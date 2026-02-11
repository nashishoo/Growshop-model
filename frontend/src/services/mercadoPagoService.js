import { supabase } from '../supabaseClient';

const MP_PUBLIC_KEY = import.meta.env.VITE_MP_PUBLIC_KEY;

/**
 * Mercado Pago Service
 * Handles payment preference creation and status checking
 */

export const mercadoPagoService = {
    /**
     * Create a payment preference and get checkout URL
     * @param {string} orderId - Order UUID
     * @returns {Promise<{success: boolean, initPoint?: string, error?: string}>}
     */
    async createPayment(orderId) {
        try {
            // Get current session
            const { data: { session } } = await supabase.auth.getSession();
            const token = session?.access_token;

            // Call Supabase Edge Function to create preference
            const { data, error } = await supabase.functions.invoke('create-mp-preference', {
                body: { orderId },
                headers: token ? {
                    Authorization: `Bearer ${token}`
                } : {}
            });

            if (error) throw error;

            if (!data.success) {
                throw new Error(data.error || 'Error al crear preferencia de pago');
            }

            return {
                success: true,
                initPoint: data.initPoint,
                preferenceId: data.preferenceId
            };

        } catch (error) {
            console.error('Error creating MP payment:', error);
            return {
                success: false,
                error: error.message || 'Error al procesar el pago'
            };
        }
    },

    /**
     * Check payment status for an order
     * @param {string} orderId - Order UUID
     * @returns {Promise<{status: string, details?: object}>}
     */
    async checkPaymentStatus(orderId) {
        try {
            const { data, error } = await supabase
                .from('orders')
                .select('payment_status, payment_details, payment_id')
                .eq('id', orderId)
                .single();

            if (error) throw error;

            return {
                status: data.payment_status || 'pending',
                details: data.payment_details,
                paymentId: data.payment_id
            };

        } catch (error) {
            console.error('Error checking payment status:', error);
            return {
                status: 'unknown',
                error: error.message
            };
        }
    },

    /**
     * Get public key for MP SDK
     */
    getPublicKey() {
        return MP_PUBLIC_KEY;
    },

    /**
     * Format payment status for display
     */
    formatPaymentStatus(status) {
        const statuses = {
            pending: { label: 'Pendiente', color: 'yellow', icon: '⏳' },
            approved: { label: 'Aprobado', color: 'green', icon: '✅' },
            in_process: { label: 'En proceso', color: 'blue', icon: '🔄' },
            rejected: { label: 'Rechazado', color: 'red', icon: '❌' },
            cancelled: { label: 'Cancelado', color: 'gray', icon: '🚫' },
            refunded: { label: 'Reembolsado', color: 'purple', icon: '↩️' }
        };

        return statuses[status] || statuses.pending;
    }
};

export default mercadoPagoService;
