import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = 'https://aditzjurfwlmcjmbaxcp.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFkaXR6anVyZndsbWNqbWJheGNwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk3MTY5NjYsImV4cCI6MjA5NTI5Mjk2Nn0.V5mLZseeV0R8_hIgPLy7PsFDmKl0w38GkiRUaysvWxY';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
