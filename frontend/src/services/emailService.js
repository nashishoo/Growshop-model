// Email notification service utility
import { supabase } from '../supabaseClient';

// Get Supabase URL from environment
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_KEY;

export const sendOrderEmail = async (order, template) => {
    if (!order.customer_email) {
        console.log('No customer email available for order:', order.id);
        return { success: false, error: 'No email address' };
    }

    const subjects = {
        order_shipped: `Tu pedido #${order.id.slice(0, 8).toUpperCase()} esta en camino`,
        order_confirmed: `Pago confirmado - Pedido #${order.id.slice(0, 8).toUpperCase()}`,
        order_delivered: `Tu pedido #${order.id.slice(0, 8).toUpperCase()} fue entregado`,
        payment_rejected: `Pago no procesado - Pedido #${order.id.slice(0, 8).toUpperCase()}`
    };

    console.log('=== sendOrderEmail called ===');
    console.log('Sending email:', { to: order.customer_email, template, orderId: order.id.slice(0, 8) });

    try {
        // Get current session for auth
        const { data: { session } } = await supabase.auth.getSession();

        if (!session?.access_token) {
            console.error('No auth session found - user not logged in');
            return { success: false, error: 'Usuario no autenticado' };
        }

        console.log('Auth token present:', !!session.access_token);
        console.log('Token preview:', session.access_token.substring(0, 20) + '...');

        // Build the Edge Function URL
        const functionUrl = `${SUPABASE_URL}/functions/v1/send-notification-email`;
        console.log('Calling Edge Function:', functionUrl);

        // Make direct fetch call with proper headers
        const response = await fetch(functionUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session.access_token}`,
                'apikey': SUPABASE_ANON_KEY
            },
            body: JSON.stringify({
                to: order.customer_email,
                subject: subjects[template],
                template,
                data: {
                    customerName: order.customer_name || 'Cliente',
                    orderId: order.id.slice(0, 8).toUpperCase(),
                    orderIdFull: order.id, // Full UUID for voucher link
                    trackingNumber: order.tracking_number,
                    orderTotal: order.total_amount
                }
            })
        });

        console.log('Response status:', response.status);

        const data = await response.json();
        console.log('Response data:', data);

        if (!response.ok) {
            console.error('Edge Function error:', data);
            return { success: false, error: data.error || `HTTP ${response.status}` };
        }

        if (data.error) {
            console.error('Email service error:', data.error);
            return { success: false, error: data.error };
        }

        console.log('Email sent successfully:', data);
        return { success: true, data };
    } catch (error) {
        console.error('Error sending email (catch):', error);
        return { success: false, error: error.message || 'Error desconocido' };
    }
};

// Helper to send email on status change (manual admin actions only)
// Note: order_confirmed and payment_rejected emails are sent automatically by MP payment processing
// Only shipped/delivered/preparing are manual admin actions that trigger emails
export const sendStatusChangeEmail = async (order, newStatus) => {
    const templateMap = {
        'preparing': 'order_confirmed',  // Same template as paid for now
        'shipped': 'order_shipped',
        'delivered': 'order_delivered',
        'cancelled': 'payment_rejected'
    };

    const template = templateMap[newStatus];
    if (!template) {
        return { success: false, error: 'No email template for status' };
    }

    return sendOrderEmail(order, template);
};
