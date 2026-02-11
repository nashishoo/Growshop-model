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
        const body = await req.json()
        console.log('Webhook received:', body)

        // Initialize Supabase client
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const MP_ACCESS_TOKEN = Deno.env.get('MP_ACCESS_TOKEN')

        // Handle payment notification
        if (body.type === 'payment') {
            const paymentId = body.data.id

            // Get payment details from MP
            const mpResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
                headers: {
                    'Authorization': `Bearer ${MP_ACCESS_TOKEN}`
                }
            })

            if (!mpResponse.ok) {
                throw new Error('Failed to fetch payment from MP')
            }

            const payment = await mpResponse.json()
            const orderId = payment.external_reference

            if (!orderId) {
                console.error('No external_reference in payment')
                throw new Error('Invalid payment data')
            }

            // Update order with payment info
            const updateData = {
                payment_id: payment.id.toString(),
                mp_payment_id: payment.id,
                payment_status: payment.status,
                payment_method: payment.payment_method_id,
                payment_details: {
                    status: payment.status,
                    status_detail: payment.status_detail,
                    payment_type: payment.payment_type_id,
                    payment_method: payment.payment_method_id,
                    transaction_amount: payment.transaction_amount,
                    date_approved: payment.date_approved,
                    payer: {
                        email: payment.payer.email,
                        identification: payment.payer.identification
                    }
                }
            }

            // Update order status based on payment status
            if (payment.status === 'approved') {
                updateData.status = 'paid' // Payment confirmed, ready for processing
            } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
                updateData.status = 'cancelled'
            }

            await supabaseClient
                .from('orders')
                .update(updateData)
                .eq('id', orderId)

            // Log the webhook event
            await supabaseClient
                .from('payment_logs')
                .insert({
                    order_id: orderId,
                    event_type: 'payment_notification',
                    payment_id: payment.id,
                    status: payment.status,
                    raw_data: payment
                })

            console.log(`Order ${orderId} updated with payment status: ${payment.status}`)

            // Send email notification based on payment status
            if (payment.status === 'approved' || payment.status === 'rejected' || payment.status === 'cancelled') {
                try {
                    // Fetch order data for email
                    const { data: orderData } = await supabaseClient
                        .from('orders')
                        .select('*')
                        .eq('id', orderId)
                        .single()

                    if (orderData && orderData.customer_email) {
                        const template = payment.status === 'approved' ? 'order_confirmed' : 'payment_rejected'
                        const subject = payment.status === 'approved'
                            ? `Pago confirmado - Pedido #${orderId.slice(0, 8).toUpperCase()}`
                            : `Pago no procesado - Pedido #${orderId.slice(0, 8).toUpperCase()}`

                        // Call the email Edge Function
                        const emailResponse = await fetch(`${Deno.env.get('SUPABASE_URL')}/functions/v1/send-notification-email`, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                                'Authorization': `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`
                            },
                            body: JSON.stringify({
                                to: orderData.customer_email,
                                subject,
                                template,
                                data: {
                                    customerName: orderData.customer_name || 'Cliente',
                                    orderId: orderId.slice(0, 8).toUpperCase(),
                                    orderTotal: orderData.total_amount
                                }
                            })
                        })

                        const emailResult = await emailResponse.json()
                        console.log('Email sent:', emailResult)
                    }
                } catch (emailError) {
                    console.error('Error sending email:', emailError)
                    // Don't fail the webhook if email fails
                }
            }
        }

        return new Response(
            JSON.stringify({ received: true }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 200
            }
        )

    } catch (error) {
        console.error('Webhook error:', error)
        return new Response(
            JSON.stringify({ error: error.message }),
            {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                status: 500
            }
        )
    }
})
