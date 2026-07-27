const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

let supabase = null;

if (supabaseUrl && supabaseKey) {
    try {
        supabase = createClient(supabaseUrl, supabaseKey);
        console.log('⚡ Conectado exitosamente a Supabase PostgreSQL Cloud');
    } catch (e) {
        console.error('Error inicializando cliente de Supabase:', e);
    }
} else {
    console.log('ℹ️ Supabase: Esperando credenciales SUPABASE_URL y SUPABASE_ANON_KEY en .env');
}

module.exports = { supabase };
