import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  db: { schema: 'odon' }
});

// Database types
export interface Database {
  public: {
    Tables: {
      patients: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          birth_date: string;
          age: number;
          address: string;
          medical_history: string;
          emergency_contact: string;
          emergency_phone: string;
          status: 'active' | 'inactive';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email: string;
          phone: string;
          birth_date: string;
          address?: string;
          medical_history?: string;
          emergency_contact?: string;
          emergency_phone?: string;
          status?: 'active' | 'inactive';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          phone?: string;
          birth_date?: string;
          address?: string;
          medical_history?: string;
          emergency_contact?: string;
          emergency_phone?: string;
          status?: 'active' | 'inactive';
          updated_at?: string;
        };
      };
      appointments: {
        Row: {
          id: string;
          patient_id: string;
          patient_name: string;
          patient_phone: string;
          date: string;
          time: string;
          duration: number;
          procedure: string;
          status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
          notes: string;
          dentist: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id?: string;
          patient_name: string;
          patient_phone?: string;
          date: string;
          time: string;
          duration: number;
          procedure: string;
          status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
          notes?: string;
          dentist: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          patient_name?: string;
          patient_phone?: string;
          date?: string;
          time?: string;
          duration?: number;
          procedure?: string;
          status?: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
          notes?: string;
          dentist?: string;
          updated_at?: string;
        };
      };
      tooth_conditions: {
        Row: {
          id: string;
          patient_id: string;
          tooth_number: number;
          surface: 'oclusal' | 'vestibular' | 'lingual' | 'mesial' | 'distal' | 'incisal';
          condition: 'caries' | 'restauracion' | 'corona' | 'endodoncia' | 'extraccion' | 'implante' | 'fractura';
          status: 'planificado' | 'en_proceso' | 'completado';
          notes: string;
          date: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          tooth_number: number;
          surface: 'oclusal' | 'vestibular' | 'lingual' | 'mesial' | 'distal' | 'incisal';
          condition: 'caries' | 'restauracion' | 'corona' | 'endodoncia' | 'extraccion' | 'implante' | 'fractura';
          status?: 'planificado' | 'en_proceso' | 'completado';
          notes?: string;
          date: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          tooth_number?: number;
          surface?: 'oclusal' | 'vestibular' | 'lingual' | 'mesial' | 'distal' | 'incisal';
          condition?: 'caries' | 'restauracion' | 'corona' | 'endodoncia' | 'extraccion' | 'implante' | 'fractura';
          status?: 'planificado' | 'en_proceso' | 'completado';
          notes?: string;
          date?: string;
          updated_at?: string;
        };
      };
      treatments: {
        Row: {
          id: string;
          patient_id: string;
          tooth_number: string;
          procedure: string;
          surface: string;
          dentist: string;
          notes: string;
          cost: number;
          date: string;
          status: 'completed' | 'in_progress' | 'planned';
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          tooth_number?: string;
          procedure: string;
          surface?: string;
          dentist: string;
          notes?: string;
          cost?: number;
          date: string;
          status?: 'completed' | 'in_progress' | 'planned';
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          tooth_number?: string;
          procedure?: string;
          surface?: string;
          dentist?: string;
          notes?: string;
          cost?: number;
          date?: string;
          status?: 'completed' | 'in_progress' | 'planned';
          updated_at?: string;
        };
      };
      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          email: string;
          phone: string;
          specialty: string;
          license_number: string;
          clinic_name: string;
          clinic_address: string;
          preferences: any;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          email: string;
          phone?: string;
          specialty?: string;
          license_number?: string;
          clinic_name?: string;
          clinic_address?: string;
          preferences?: any;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          email?: string;
          phone?: string;
          specialty?: string;
          license_number?: string;
          clinic_name?: string;
          clinic_address?: string;
          preferences?: any;
          updated_at?: string;
        };
      };
    };
  };
}