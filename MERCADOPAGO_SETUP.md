# Mercado Pago Integration - Configuration Guide

## 🔧 Required Configuration Steps

### 1. Configure Supabase Edge Function Secrets

Your Edge Functions need access to Mercado Pago credentials and your frontend URL. Configure these in Supabase:

**Steps:**
1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `lzougpcpkbwppzviuyzz`
3. Navigate to **Edge Functions** → **Secrets** (or **Project Settings** → **Edge Functions**)
4. Add the following secrets:

| Secret Name | Value |
|------------|-------|
| `MP_ACCESS_TOKEN` | `APP_USR-2894799811896719-011511-a94b151cfd0bf6f8fa1227b33de6487a-3136804678` |
| `FRONTEND_URL` | `http://localhost:5173` *(for dev)* or your production URL |

> **Important:** For production, update `FRONTEND_URL` to your live domain (e.g., `https://conectados420.com`)

---

### 2. Verify Database Schema

The Edge Function requires a `payment_logs` table. Run this SQL in Supabase SQL Editor if the table doesn't exist:

```sql
-- Create payment_logs table for debugging
CREATE TABLE IF NOT EXISTS payment_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID REFERENCES orders(id),
    payment_id TEXT,
    event_type TEXT NOT NULL,
    raw_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_payment_logs_order ON payment_logs(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_logs_payment ON payment_logs(payment_id);

-- Enable RLS
ALTER TABLE payment_logs ENABLE ROW LEVEL SECURITY;

-- Admin can see all logs
CREATE POLICY "Service role can view payment logs"
ON payment_logs FOR SELECT
USING (auth.role() = 'service_role');
```

---

### 3. Update Orders Table (if needed)

Ensure your `orders` table has the following columns for Mercado Pago integration:

```sql
-- Add missing columns if needed
ALTER TABLE orders 
ADD COLUMN IF NOT EXISTS mp_preference_id TEXT,
ADD COLUMN IF NOT EXISTS payment_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS payment_details JSONB,
ADD COLUMN IF NOT EXISTS shipping_cost DECIMAL(10, 2) DEFAULT 0;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_orders_mp_preference ON orders(mp_preference_id);
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status);
```

---

### 4. Deploy/Redeploy Edge Functions

After configuring secrets, you may need to redeploy your Edge Functions:

```bash
# If using Supabase CLI
supabase functions deploy create-mp-preference
supabase functions deploy mercadopago-webhook
```

Or simply wait a few moments for Supabase to pick up the secret changes.

---

### 5. Test the Integration

1. **Start your dev server** (if not running):
   ```bash
   cd frontend
   npm run dev
   ```

2. **Create a test order** and proceed to payment

3. **Check console** - you should see:
   - ✅ No 400 errors
   - ✅ Successful redirect to Mercado Pago sandbox
   - ✅ `initPoint` URL in network response

4. **Use Mercado Pago test cards** for sandbox testing:
   - **Approved**: `4509 9535 6623 3704` | CVV: `123` | Exp: any future date
   - **Rejected**: `4013 5406 8274 6260`
   - See more: https://www.mercadopago.com.ar/developers/es/docs/checkout-api/testing

---

## ✅ Verification Checklist

- [ ] Supabase secrets configured (`MP_ACCESS_TOKEN`, `FRONTEND_URL`)
- [ ] `payment_logs` table exists in database
- [ ] `orders` table has MP-related columns
- [ ] Edge Functions deployed/redeployed
- [ ] Frontend `.env` has `VITE_MP_PUBLIC_KEY`
- [ ] Test payment successfully redirects to Mercado Pago
- [ ] Webhook URL configured in Mercado Pago dashboard (for production)

---

## 🔗 Useful Links

- **Mercado Pago Developer Dashboard**: https://www.mercadopago.com.ar/developers
- **Test Credentials**: Dashboard → "Tus integraciones" → "Credenciales de prueba"
- **Test Cards**: https://www.mercadopago.com.ar/developers/es/docs/checkout-api/testing
- **Supabase Dashboard**: https://supabase.com/dashboard/project/lzougpcpkbwppzviuyzz
