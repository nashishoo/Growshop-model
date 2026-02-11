import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    // Handle CORS
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        // Get authorization header to verify admin (optional but recommended)
        const authHeader = req.headers.get('Authorization')

        // Initialize Supabase with SERVICE ROLE KEY (bypasses RLS)
        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        // Optional: Verify caller is admin (if auth header present)
        if (authHeader) {
            const token = authHeader.replace('Bearer ', '')
            const { data: { user }, error } = await supabaseAdmin.auth.getUser(token)

            if (user) {
                // Check if user is admin
                const { data: profile } = await supabaseAdmin
                    .from('profiles')
                    .select('role')
                    .eq('id', user.id)
                    .single()

                if (profile?.role !== 'admin') {
                    return new Response(
                        JSON.stringify({ success: false, error: 'Unauthorized: Admin access required' }),
                        { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
                    )
                }
            }
        }

        console.log('Starting deletion of all test orders...')

        // Delete payment logs first
        const { error: logsError } = await supabaseAdmin
            .from('payment_logs')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000')

        if (logsError) {
            console.error('Error deleting payment logs:', logsError)
        }

        // Delete order items
        const { error: itemsError } = await supabaseAdmin
            .from('order_items')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000')

        if (itemsError) throw itemsError

        // Delete orders
        const { error: ordersError } = await supabaseAdmin
            .from('orders')
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000')

        if (ordersError) throw ordersError

        console.log('All test orders deleted successfully')

        return new Response(
            JSON.stringify({ success: true, message: 'All orders deleted' }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )

    } catch (error) {
        console.error('Error:', error)
        return new Response(
            JSON.stringify({ success: false, error: error.message }),
            { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
    }
})
