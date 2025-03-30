import 'react-native-url-polyfill/auto';
import { createClient } from "@supabase/supabase-js";
import { SUPABASE_PROJECT_URI, SUPABASE_API_KEY } from "./constants";
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = SUPABASE_PROJECT_URI;
const supabaseKey = SUPABASE_API_KEY;

console.log("supabaseUrl: ",supabaseUrl);
console.log("supabaseKey: ",supabaseKey);

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Supabase project URI or API key is not set");
}

export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})