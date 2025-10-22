// lib/supabase.js

import { createClient } from '@supabase/supabase-js';

// O Next.js requer o prefixo NEXT_PUBLIC_ para variáveis acessíveis no frontend.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Validação (Opcional, mas útil)
if (!supabaseUrl || !supabaseAnonKey) {
  console.error("ERRO: As variáveis de ambiente do Supabase (URL ou ANON_KEY) não estão definidas no .env.local.");
}

// Inicialização do Cliente Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);