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
  odon: {
    Tables: {
      clinics: {
        Row: {
          id: string;
          name: string;
          ruc?: string;
          address?: string;
          phone?: string;
          email?: string;
          logo_url?: string;
          website?: string;
          status: '1' | '0';
          created_by_user?: string;
          created_date?: string;
          created_by_ip?: string;
          updated_by_user?: string;
          updated_date?: string;
          updated_by_ip?: string;
        };
        Insert: {
          id?: string;
          name: string;
          ruc?: string;
          address?: string;
          phone?: string;
          email?: string;
          logo_url?: string;
          website?: string;
          status?: '1' | '0';
          created_by_user?: string;
          created_date?: string;
          created_by_ip?: string;
          updated_by_user?: string;
          updated_date?: string;
          updated_by_ip?: string;
        };
        Update: Partial<Omit<Database['odon']['Tables']['clinics']['Row'], 'id'>>;
      };

      branches: {
        Row: {
          id: string;
          clinic_id: string;
          name: string;
          address?: string;
          phone?: string;
          email?: string;
          manager_name?: string;
          status: '1' | '0';
          created_by_user?: string;
          created_date?: string;
          created_by_ip?: string;
          updated_by_user?: string;
          updated_date?: string;
          updated_by_ip?: string;
        };
        Insert: Partial<Omit<Database['odon']['Tables']['branches']['Row'], 'id' | 'status'>>;
        Update: Partial<Omit<Database['odon']['Tables']['branches']['Row'], 'id'>>;
      };

      user_profiles: {
        Row: {
          id: string;
          user_id: string;
          branch_id?: string;
          clinic_id?: string;
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
          role: 'admin' | 'dentist' | 'assistant' | 'reception';
          status: '1' | '0';
          created_by_user?: string;
          created_date?: string;
          created_by_ip?: string;
          updated_by_user?: string;
          updated_date?: string;
          updated_by_ip?: string;
        };
        Insert: Partial<Omit<Database['odon']['Tables']['user_profiles']['Row'], 'id'>>;
        Update: Partial<Omit<Database['odon']['Tables']['user_profiles']['Row'], 'id'>>;
      };

      patients: {
        Row: {
          id: string;
          branch_id?: string;
          name: string;
          email?: string;
          phone?: string;
          birth_date?: string;
          age?: number;
          address?: string;
          medical_history?: string;
          emergency_contact?: string;
          emergency_phone?: string;
          status: '1' | '0';
          created_by_user?: string;
          created_date?: string;
          created_by_ip?: string;
          updated_by_user?: string;
          updated_date?: string;
          updated_by_ip?: string;
        };
        Insert: Partial<Omit<Database['odon']['Tables']['patients']['Row'], 'id' | 'status'>>;
        Update: Partial<Omit<Database['odon']['Tables']['patients']['Row'], 'id'>>;
      };

      appointments: {
        Row: {
          id: string;
          patient_id: string;
          branch_id?: string;
          patient_name?: string;
          patient_phone?: string;
          dentist_id?: string;
          date: string;
          time: string;
          duration?: number;
          procedure?: string;
          status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled';
          notes?: string;
          created_by_user?: string;
          created_date?: string;
          created_by_ip?: string;
          updated_by_user?: string;
          updated_date?: string;
          updated_by_ip?: string;
        };
        Insert: Partial<Omit<Database['odon']['Tables']['appointments']['Row'], 'id' | 'status'>>;
        Update: Partial<Omit<Database['odon']['Tables']['appointments']['Row'], 'id'>>;
      };

      tooth_conditions: {
        Row: {
          id: string;
          patient_id: string;
          tooth_number: number;
          surface: 'oclusal' | 'vestibular' | 'lingual' | 'mesial' | 'distal' | 'incisal' | 'completa';
          condition: string;
          status: 'planificado' | 'en_proceso' | 'completado';
          severity?: 'leve' | 'moderado' | 'severo';
          material?: string;
          urgency?: boolean;
          notes?: string;
          date?: string;
          created_by_user?: string;
          created_date?: string;
          created_by_ip?: string;
          updated_by_user?: string;
          updated_date?: string;
          updated_by_ip?: string;
        };
        Insert: Partial<Omit<Database['odon']['Tables']['tooth_conditions']['Row'], 'id' | 'status'>>;
        Update: Partial<Omit<Database['odon']['Tables']['tooth_conditions']['Row'], 'id'>>;
      };

      treatments: {
        Row: {
          id: string;
          patient_id: string;
          tooth_number?: string;
          procedure: string;
          surface?: string;
          dentist_id?: string;
          notes?: string;
          cost?: number;
          date: string;
          status: 'planned' | 'in_progress' | 'completed';
          duration?: number;
          materials?: string;
          complications?: string;
          follow_up_date?: string;
          created_by_user?: string;
          created_date?: string;
          created_by_ip?: string;
          updated_by_user?: string;
          updated_date?: string;
          updated_by_ip?: string;
        };
        Insert: Partial<Omit<Database['odon']['Tables']['treatments']['Row'], 'id' | 'status'>>;
        Update: Partial<Omit<Database['odon']['Tables']['treatments']['Row'], 'id'>>;
      };

      patient_notes: {
        Row: {
          id: string;
          patient_id: string;
          soft_tissue_lesions?: string;
          medications?: string;
          allergies?: string;
          medical_conditions?: string;
          treatment_plan?: string;
          general_observations?: string;
          status: '1' | '0';
          created_by_user?: string;
          created_date?: string;
          created_by_ip?: string;
          updated_by_user?: string;
          updated_date?: string;
          updated_by_ip?: string;
        };
        Insert: Partial<Omit<Database['odon']['Tables']['patient_notes']['Row'], 'id' | 'status'>>;
        Update: Partial<Omit<Database['odon']['Tables']['patient_notes']['Row'], 'id'>>;
      };

      odontogram_history: {
        Row: {
          id: string;
          patient_id: string;
          version: number;
          description?: string;
          created_by?: string;
          status: '1' | '0';
          created_by_user?: string;
          created_date?: string;
          created_by_ip?: string;
          updated_by_user?: string;
          updated_date?: string;
          updated_by_ip?: string;
        };
        Insert: Partial<Omit<Database['odon']['Tables']['odontogram_history']['Row'], 'id' | 'status'>>;
        Update: Partial<Omit<Database['odon']['Tables']['odontogram_history']['Row'], 'id'>>;
      };

      clinical_images: {
        Row: {
          id: string;
          patient_id: string;
          tooth_number?: number;
          image_url: string;
          image_type: 'radiography' | 'clinical_photo' | 'intraoral' | 'extraoral';
          description?: string;
          date_taken?: string;
          uploaded_by?: string;
          status: '1' | '0';
          created_by_user?: string;
          created_date?: string;
          created_by_ip?: string;
          updated_by_user?: string;
          updated_date?: string;
          updated_by_ip?: string;
        };
        Insert: Partial<Omit<Database['odon']['Tables']['clinical_images']['Row'], 'id' | 'status'>>;
        Update: Partial<Omit<Database['odon']['Tables']['clinical_images']['Row'], 'id'>>;
      };

      catalog_type: {
        Row: {
          id: string;
          code: string;
          name: string;
          description?: string;
          status: '1' | '0';
          created_by_user?: string;
          created_date?: string;
          created_by_ip?: string;
          updated_by_user?: string;
          updated_date?: string;
          updated_by_ip?: string;
        };
        Insert: Partial<Omit<Database['odon']['Tables']['catalog_type']['Row'], 'id' | 'status'>>;
        Update: Partial<Omit<Database['odon']['Tables']['catalog_type']['Row'], 'id'>>;
      };

      catalog_value: {
        Row: {
          id: string;
          type_id: string;
          code: string;
          name: string;
          description?: string;
          status: '1' | '0';
          created_by_user?: string;
          created_date?: string;
          created_by_ip?: string;
          updated_by_user?: string;
          updated_date?: string;
          updated_by_ip?: string;
        };
        Insert: Partial<Omit<Database['odon']['Tables']['catalog_value']['Row'], 'id' | 'status'>>;
        Update: Partial<Omit<Database['odon']['Tables']['catalog_value']['Row'], 'id'>>;
      };

      clinic_treatment: {
        Row: {
          id: string;
          clinic_id: string;
          treatment_id: string;
          status: '1' | '0';
          created_by_user?: string;
          created_date?: string;
          created_by_ip?: string;
          updated_by_user?: string;
          updated_date?: string;
          updated_by_ip?: string;
        };
        Insert: Partial<Omit<Database['odon']['Tables']['clinic_treatment']['Row'], 'id' | 'status'>>;
        Update: Partial<Omit<Database['odon']['Tables']['clinic_treatment']['Row'], 'id'>>;
      };
    };
  };
  susc: {
    Tables: {
      subscriptions: {
        Row: {
          id: string;
          clinic_id: string;
          plan_name: string;
          plan_code: string;
          start_date: string;
          end_date?: string;
          status: 'active' | 'inactive' | 'cancelled';
          price: number;
          interval: 'monthly' | 'yearly';
          created_by_user?: string;
          created_date?: string;
          created_by_ip?: string;
          updated_by_user?: string;
          updated_date?: string;
          updated_by_ip?: string;
        };
        Insert: Partial<Omit<Database['susc']['Tables']['subscriptions']['Row'], 'id' | 'status'>>;
        Update: Partial<Omit<Database['susc']['Tables']['subscriptions']['Row'], 'id'>>;
      };

      subscription_payments: {
        Row: {
          id: string;
          subscription_id: string;
          payment_date: string;
          amount: number;
          payment_method: string;
          status: 'paid' | 'pending' | 'failed';
          created_by_user?: string;
          created_date?: string;
          created_by_ip?: string;
          updated_by_user?: string;
          updated_date?: string;
          updated_by_ip?: string;
        };
        Insert: Partial<Omit<Database['susc']['Tables']['subscription_payments']['Row'], 'id' | 'status'>>;
        Update: Partial<Omit<Database['susc']['Tables']['subscription_payments']['Row'], 'id'>>;
      };
    };
  };
}
