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
          age?: number;
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
          age?: number;
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
          surface: 'oclusal' | 'vestibular' | 'lingual' | 'mesial' | 'distal' | 'incisal' | 'completa';
          condition: 'caries' | 'restauracion' | 'corona' | 'endodoncia' | 'extraccion' | 'implante' | 'fractura' | 'ausente' | 'puente' | 'carilla' | 'infeccion_apical' | 'reconstruccion_defectuosa' | 'amalgama' | 'sellante' | 'corona_provisoria' | 'perno_munon' | 'protesis_removible' | 'corona_mal_estado' | 'restauracion_mal_estado' | 'amalgama_mal_estado' | 'perno_munon_mal_estado' | 'corona_provisoria_mal_estado';
          status: 'planificado' | 'en_proceso' | 'completado';
          notes: string;
          date: string;
          severity?: 'leve' | 'moderado' | 'severo';
          material?: string;
          urgency?: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          tooth_number: number;
          surface: 'oclusal' | 'vestibular' | 'lingual' | 'mesial' | 'distal' | 'incisal' | 'completa';
          condition: 'caries' | 'restauracion' | 'corona' | 'endodoncia' | 'extraccion' | 'implante' | 'fractura' | 'ausente' | 'puente' | 'carilla' | 'infeccion_apical' | 'reconstruccion_defectuosa' | 'amalgama' | 'sellante' | 'corona_provisoria' | 'perno_munon' | 'protesis_removible' | 'corona_mal_estado' | 'restauracion_mal_estado' | 'amalgama_mal_estado' | 'perno_munon_mal_estado' | 'corona_provisoria_mal_estado';
          status?: 'planificado' | 'en_proceso' | 'completado';
          notes?: string;
          date: string;
          severity?: 'leve' | 'moderado' | 'severo';
          material?: string;
          urgency?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          tooth_number?: number;
          surface?: 'oclusal' | 'vestibular' | 'lingual' | 'mesial' | 'distal' | 'incisal' | 'completa';
          condition?: 'caries' | 'restauracion' | 'corona' | 'endodoncia' | 'extraccion' | 'implante' | 'fractura' | 'ausente' | 'puente' | 'carilla' | 'infeccion_apical' | 'reconstruccion_defectuosa' | 'amalgama' | 'sellante' | 'corona_provisoria' | 'perno_munon' | 'protesis_removible' | 'corona_mal_estado' | 'restauracion_mal_estado' | 'amalgama_mal_estado' | 'perno_munon_mal_estado' | 'corona_provisoria_mal_estado';
          status?: 'planificado' | 'en_proceso' | 'completado';
          notes?: string;
          date?: string;
          severity?: 'leve' | 'moderado' | 'severo';
          material?: string;
          urgency?: boolean;
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
          duration?: number;
          materials?: string;
          complications?: string;
          follow_up_date?: string;
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
          duration?: number;
          materials?: string;
          complications?: string;
          follow_up_date?: string;
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
          duration?: number;
          materials?: string;
          complications?: string;
          follow_up_date?: string;
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
          avatar_url?: string;
          bio?: string;
          years_experience?: number;
          education?: string;
          certifications?: string;
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
          avatar_url?: string;
          bio?: string;
          years_experience?: number;
          education?: string;
          certifications?: string;
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
          avatar_url?: string;
          bio?: string;
          years_experience?: number;
          education?: string;
          certifications?: string;
          preferences?: any;
          updated_at?: string;
        };
      };
      patient_notes: {
        Row: {
          id: string;
          patient_id: string;
          soft_tissue_lesions: string;
          medications: string;
          allergies: string;
          medical_conditions: string;
          treatment_plan: string;
          general_observations: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          soft_tissue_lesions?: string;
          medications?: string;
          allergies?: string;
          medical_conditions?: string;
          treatment_plan?: string;
          general_observations?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          soft_tissue_lesions?: string;
          medications?: string;
          allergies?: string;
          medical_conditions?: string;
          treatment_plan?: string;
          general_observations?: string;
          updated_at?: string;
        };
      };
      odontogram_history: {
        Row: {
          id: string;
          patient_id: string;
          version: number;
          description: string;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          version?: number;
          description?: string;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          version?: number;
          description?: string;
          created_by?: string;
        };
      };
      clinical_images: {
        Row: {
          id: string;
          patient_id: string;
          tooth_number?: number;
          image_url: string;
          image_type: 'radiography' | 'clinical_photo' | 'intraoral' | 'extraoral';
          description: string;
          date_taken: string;
          uploaded_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          patient_id: string;
          tooth_number?: number;
          image_url: string;
          image_type: 'radiography' | 'clinical_photo' | 'intraoral' | 'extraoral';
          description?: string;
          date_taken: string;
          uploaded_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          patient_id?: string;
          tooth_number?: number;
          image_url?: string;
          image_type?: 'radiography' | 'clinical_photo' | 'intraoral' | 'extraoral';
          description?: string;
          date_taken?: string;
          uploaded_by?: string;
          updated_at?: string;
        };
      };
    };
  };
}