// Supabase Edge Function: send-notification-email
// Uses Resend API for transactional emails

import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
const FROM_EMAIL = Deno.env.get('FROM_EMAIL') || 'Conectados 420 <no-reply@conectados420.cl>'

interface EmailRequest {
  to: string
  subject: string
  template: 'order_shipped' | 'order_confirmed' | 'order_delivered' | 'payment_rejected'
  data: {
    customerName: string
    orderId: string
    orderIdFull?: string // Full UUID for voucher link
    trackingNumber?: string
    orderTotal?: number
    items?: Array<{ name: string; quantity: number }>
  }
}

// Shared styles for all emails - High contrast design
const baseStyles = `
  body { 
    font-family: 'Segoe UI', Arial, sans-serif; 
    background: #0f0f0f; 
    color: #ffffff; 
    padding: 20px; 
    margin: 0;
    line-height: 1.6;
  }
  .container { 
    max-width: 600px; 
    margin: 0 auto; 
    background: #1a1a1a; 
    border-radius: 16px; 
    overflow: hidden;
    border: 1px solid #333;
  }
  .header { 
    background: linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%);
    text-align: center; 
    padding: 30px 20px;
    border-bottom: 3px solid #22c55e;
  }
  .logo { 
    color: #22c55e; 
    font-size: 24px; 
    font-weight: bold;
    margin-bottom: 10px;
  }
  h1 { 
    color: #ffffff; 
    margin: 10px 0 0 0;
    font-size: 28px;
    font-weight: 600;
  }
  .content {
    padding: 30px;
  }
  p { 
    color: #e0e0e0; 
    margin: 15px 0;
    font-size: 16px;
  }
  strong { 
    color: #ffffff; 
  }
  .highlight-box { 
    background: #252525; 
    border-radius: 12px; 
    padding: 25px; 
    text-align: center; 
    margin: 25px 0;
    border: 1px solid #333;
  }
  .big-number { 
    font-size: 32px; 
    color: #22c55e; 
    font-weight: bold; 
    letter-spacing: 1px;
    margin: 10px 0;
  }
  .label { 
    color: #888; 
    font-size: 14px; 
    margin-bottom: 5px;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .btn { 
    display: inline-block; 
    background: #22c55e; 
    color: #000000; 
    padding: 14px 28px; 
    text-decoration: none; 
    border-radius: 8px; 
    font-weight: bold; 
    margin-top: 15px;
    font-size: 14px;
  }
  .btn:hover { 
    background: #1ea34b; 
  }
  .btn-secondary {
    background: #333;
    color: #ffffff;
  }
  .footer { 
    background: #0f0f0f;
    text-align: center; 
    padding: 25px;
    border-top: 1px solid #333;
  }
  .footer p { 
    color: #666; 
    font-size: 12px; 
    margin: 5px 0;
  }
  .footer .brand {
    color: #22c55e;
    font-weight: bold;
  }
  .status-badge {
    display: inline-block;
    padding: 8px 16px;
    border-radius: 20px;
    font-size: 14px;
    font-weight: bold;
    margin: 10px 0;
  }
  .status-success { background: #22c55e20; color: #22c55e; border: 1px solid #22c55e; }
  .status-shipping { background: #8b5cf620; color: #a78bfa; border: 1px solid #8b5cf6; }
  .status-delivered { background: #3b82f620; color: #60a5fa; border: 1px solid #3b82f6; }
  .status-error { background: #ef444420; color: #f87171; border: 1px solid #ef4444; }
`

const templates = {
  order_confirmed: (data: EmailRequest['data']) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">CONECTADOS 420</div>
      <h1>Pago Confirmado</h1>
      <span class="status-badge status-success">APROBADO</span>
    </div>
    
    <div class="content">
      <p>Hola <strong>${data.customerName}</strong>,</p>
      
      <p>Hemos recibido tu pago correctamente. Tu pedido <strong>#${data.orderId}</strong> esta siendo preparado para envio.</p>
      
      <div class="highlight-box">
        <div class="label">Total Pagado</div>
        <div class="big-number">$${data.orderTotal?.toLocaleString('es-CL') || '0'}</div>
        <div class="label">Pedido #${data.orderId}</div>
      </div>
      
      <p>Te enviaremos otro email cuando tu pedido sea despachado con el numero de seguimiento para que puedas rastrearlo.</p>
      
      ${data.orderIdFull ? `
      <div style="text-align: center; margin: 25px 0;">
        <a href="https://conectados420.cl/voucher/${data.orderIdFull}" class="btn" target="_blank">
          Descargar Comprobante PDF
        </a>
      </div>
      ` : ''}
      
      <p style="color: #22c55e; font-weight: 500;">Gracias por tu compra!</p>
    </div>
    
    <div class="footer">
      <p class="brand">Conectados 420</p>
      <p>Growshop & Cultivo Indoor</p>
      <p>Este email fue enviado automaticamente.</p>
    </div>
  </div>
</body>
</html>
  `,

  order_shipped: (data: EmailRequest['data']) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">CONECTADOS 420</div>
      <h1>Pedido Enviado</h1>
      <span class="status-badge status-shipping">EN CAMINO</span>
    </div>
    
    <div class="content">
      <p>Hola <strong>${data.customerName}</strong>,</p>
      
      <p>Tu pedido <strong>#${data.orderId}</strong> ha sido enviado y esta en camino a tu direccion.</p>
      
      ${data.trackingNumber ? `
      <div class="highlight-box">
        <div class="label">Numero de Seguimiento</div>
        <div class="big-number">${data.trackingNumber}</div>
        <a href="https://www.blue.cl/seguimiento/?n_seguimiento=${data.trackingNumber}" class="btn" target="_blank">
          Rastrear Envio
        </a>
      </div>
      ` : `
      <div class="highlight-box">
        <div class="label">Estado</div>
        <div style="color: #a78bfa; font-size: 18px;">Pedido despachado</div>
      </div>
      `}
      
      <p>Te notificaremos cuando tu pedido sea entregado.</p>
      
      <p style="color: #22c55e; font-weight: 500;">Gracias por tu compra!</p>
    </div>
    
    <div class="footer">
      <p class="brand">Conectados 420</p>
      <p>Growshop & Cultivo Indoor</p>
      <p>Este email fue enviado automaticamente.</p>
    </div>
  </div>
</body>
</html>
  `,

  order_delivered: (data: EmailRequest['data']) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="logo">CONECTADOS 420</div>
      <h1>Pedido Entregado</h1>
      <span class="status-badge status-delivered">ENTREGADO</span>
    </div>
    
    <div class="content">
      <p>Hola <strong>${data.customerName}</strong>,</p>
      
      <p>Tu pedido <strong>#${data.orderId}</strong> ha sido entregado exitosamente.</p>
      
      <div class="highlight-box">
        <div style="font-size: 48px; margin-bottom: 10px;">&#10004;</div>
        <div style="color: #60a5fa; font-size: 18px; font-weight: bold;">Entrega Completada</div>
      </div>
      
      <p>Esperamos que disfrutes tus productos. Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
      
      <p style="color: #22c55e; font-weight: 500;">Gracias por elegirnos!</p>
    </div>
    
    <div class="footer">
      <p class="brand">Conectados 420</p>
      <p>Growshop & Cultivo Indoor</p>
      <p>Este email fue enviado automaticamente.</p>
    </div>
  </div>
</body>
</html>
  `,

  payment_rejected: (data: EmailRequest['data']) => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>${baseStyles}</style>
</head>
<body>
  <div class="container">
    <div class="header" style="border-bottom-color: #ef4444;">
      <div class="logo">CONECTADOS 420</div>
      <h1>Pago No Procesado</h1>
      <span class="status-badge status-error">RECHAZADO</span>
    </div>
    
    <div class="content">
      <p>Hola <strong>${data.customerName}</strong>,</p>
      
      <p>Lamentamos informarte que el pago para tu pedido <strong>#${data.orderId}</strong> no pudo ser procesado.</p>
      
      <div class="highlight-box" style="border-color: #ef4444;">
        <div class="label">Posibles razones</div>
        <ul style="text-align: left; color: #e0e0e0; margin: 15px 0; padding-left: 20px;">
          <li>Fondos insuficientes</li>
          <li>Tarjeta vencida o bloqueada</li>
          <li>Limite de compra excedido</li>
          <li>Datos incorrectos</li>
        </ul>
      </div>
      
      <p>Te invitamos a intentar nuevamente con otro metodo de pago o verificar los datos de tu tarjeta.</p>
      
      <div style="text-align: center; margin: 25px 0;">
        <a href="https://conectados420.cl/catalogo" class="btn" style="background: #ef4444;">
          Volver a la Tienda
        </a>
      </div>
      
      <p style="color: #888;">Si crees que esto es un error, contacta a tu banco o intenta con otra tarjeta.</p>
    </div>
    
    <div class="footer">
      <p class="brand">Conectados 420</p>
      <p>Growshop & Cultivo Indoor</p>
      <p>Este email fue enviado automaticamente.</p>
    </div>
  </div>
</body>
</html>
  `
}

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

serve(async (req) => {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  }

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Parse request body first to check template type
    const body: EmailRequest = await req.json()
    const { to, subject, template, data } = body

    if (!to || !template || !data) {
      throw new Error('Missing required fields: to, template, data')
    }

    console.log('Email request:', { to, template, subject })

    // Auth bypassed for now
    console.log('Processing email...')

    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY missing!')
      throw new Error('RESEND_API_KEY not configured')
    }

    console.log('Using FROM_EMAIL:', FROM_EMAIL)

    const templateFn = templates[template]
    if (!templateFn) {
      throw new Error(`Unknown template: ${template}`)
    }

    const html = templateFn(data)

    // Send via Resend API
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: FROM_EMAIL,
        to: [to],
        subject,
        html
      })
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Failed to send email')
    }

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error: unknown) {
    console.error('Email error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})
