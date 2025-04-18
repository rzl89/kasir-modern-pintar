
import { createClient } from '@supabase/supabase-js';
import { Database } from './database.types';

// Use the existing values from the project
const supabaseUrl = "https://jnzzxglceldyummkwqbo.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impuenp4Z2xjZWxkeXVtbWt3cWJvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ5ODEwMzIsImV4cCI6MjA2MDU1NzAzMn0.AmM7_eOpQflJEKZBUx9iWeTD5pjvxH1y9ziSEXpLb7E";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

export const STORAGE_URL = `${supabaseUrl}/storage/v1/object/public`;
