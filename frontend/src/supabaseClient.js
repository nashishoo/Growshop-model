import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
    throw new Error(
        '❌ Missing Supabase configuration!\n' +
        'Please check your .env file in the frontend folder.\n' +
        'Copy .env.example to .env and fill in your credentials.\n' +
        'Get your keys from: Supabase Dashboard → Project Settings → API'
    )
}


export const supabase = createClient(supabaseUrl, supabaseKey)
