import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const { orderId, token, payment_method_id, issuer_id, installments } = await req.json()

        // SECURITY: Validate all required fields
        if (!orderId || !token || !payment_method_id) {
            return new Response(
                JSON.stringify({ success: false, error: 'Missing required fields' }),
                { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        console.log('Processing payment for order:', orderId)

        // Initialize Supabase with SERVICE ROLE (bypasses RLS)
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // SECURITY: Get order and verify it exists and is PENDING
        const { data: order, error: orderError } = await supabaseClient
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .eq('payment_status', 'pending')  // CRITICAL: Only pending orders
            .single()

        if (orderError || !order) {
            console.error('Order not found or already processed:', orderError)
            return new Response(
                JSON.stringify({ success: false, error: 'Order not found or already processed' }),
                { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }

        // Get MP credentials
        const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')
        if (!MP_ACCESS_TOKEN) {
            console.error('MP_ACCESS_TOKEN not found in environment!')
            return new Response(
                JSON.stringify({ success: false, error: 'Mercado Pago credentials not configured. Add MP_ACCESS_TOKEN to Supabase Vault.' }),
                { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
            )
        }
        console.log('MP_ACCESS_TOKEN found, length:', MP_ACCESS_TOKEN.length, 'starts with:', MP_ACCESS_TOKEN.substring(0, 10))

        // Calculate total
        const totalAmount = order.total_amount + (order.shipping_cost || 0)

        // Create payment
        const paymentData = {
            token,
            transaction_amount: totalAmount,
            installments: parseInt(installments) || 1,
            payment_method_id,
            issuer_id,
            payer: {
                email: order.customer_email || 'test@test.com'
            },
            external_reference: orderId,
            description: `Orden #${orderId.slice(0, 8)}`,
            notification_url: `${Deno.env.get('SUPABASE_URL')}/functions/v1/mercadopago-webhook`
        }

        console.log('Creating payment:', JSON.stringify(paymentData, null, 2))

        // Generate idempotency key from order ID to prevent duplicates
        const idempotencyKey = `${orderId}-${Date.now()}`

        // Call Mercado Pago API
        const mpResponse = await fetch('https://api.mercadopago.com/v1/payments', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${MP_ACCESS_TOKEN}`,
                'Content-Type': 'application/json',
                'X-Idempotency-Key': idempotencyKey
            },
            body: JSON.stringify(paymentData)
        })

        if (!mpResponse.ok) {
            const errorData = await mpResponse.json()
            console.error('MP API Error:', errorData)
            throw new Error(`Mercado Pago error: ${errorData.message || 'Unknown error'}`)
        }

        const payment = await mpResponse.json()
        console.log('Payment created:', payment.id, 'Status:', payment.status)

        // Determine order status based on payment result
        let orderStatus = 'pending';
        if (payment.status === 'approved') {
            orderStatus = 'paid';
        } else if (payment.status === 'rejected') {
            orderStatus = 'cancelled';
        }

        // Update order with payment info AND status
        await supabaseClient
            .from('orders')
            .update({
                status: orderStatus,
                payment_id: payment.id,
                payment_status: payment.status,
                payment_details: payment
            })
            .eq('id', orderId)

        // Log payment
        await supabaseClient
            .from('payment_logs')
            .insert({
                order_id: orderId,
                event_type: payment.status === 'approved' ? 'payment_approved' : 'payment_rejected',
                raw_data: payment
            })

        // Send email notification based on payment result
        if (payment.status === 'approved' || payment.status === 'rejected') {
            try {
                const template = payment.status === 'approved' ? 'order_confirmed' : 'payment_rejected'
                const subject = payment.status === 'approved'
                    ? `Pago confirmado - Pedido #${orderId.slice(0, 8).toUpperCase()}`
                    : `Pago no procesado - Pedido #${orderId.slice(0, 8).toUpperCase()}`

                const emailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-notification-email`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
                    },
                    body: JSON.stringify({
                        to: order.customer_email,
                        subject,
                        template,
                        data: {
                            customerName: order.customer_name || 'Cliente',
                            orderId: orderId.slice(0, 8).toUpperCase(),
                            orderIdFull: orderId, // Full UUID for voucher download link
                            orderTotal: totalAmount
                        }
                    })
                })

                const emailResult = await emailResponse.json()
                console.log('Email sent:', emailResult)
            } catch (emailError) {
                console.error('Error sending email:', emailError)
                // Don't fail the payment if email fails
            }
        }

        return new Response(
            JSON.stringify({
                success: true,
                status: payment.status,
                status_detail: payment.status_detail,
                payment_id: payment.id
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        )

    } catch (error) {
        console.error('Error:', error)
        return new Response(
            JSON.stringify({
                success: false,
                error: error.message
            }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 400
            }
        )
    }
})
