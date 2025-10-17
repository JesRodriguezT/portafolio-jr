// supabase-client.js

import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// --- Configuración Completa y Lista para Usar ---
const SUPABASE_URL = 'https://ppyflcwibvjmfghfsxnm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBweWZsY3dpYnZqbWZnaGZzeG5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2MzgxOTksImV4cCI6MjA3NjIxNDE5OX0.nE1n9CKDc59kevIhRfbZj5imrpfvVryIn9YyxZNPWK8';

// Exporta el cliente para usarlo en otros archivos
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);