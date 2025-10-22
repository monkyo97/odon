import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Patient {
  id: string;
  clinic_id?: string;
  name: string;
  email?: string;
  phone?: string;
  birth_date: string;
  age?: number;
  address?: string;
  medical_history?: string;
  emergency_contact?: string;
  emergency_phone?: string;
  status: '1' | '0';
  created_by_user?: string;
  created_date: string;
  created_by_ip?: string;
  updated_by_user?: string;
  updated_date?: string;
  updated_by_ip?: string;
}

const PAGE_SIZE = 20;

// 🔹 Calcular edad
const calculateAge = (birthDate?: string): number | null => {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const m = today.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
  return age;
};

export const usePatients = () => {
  const { user, clinicId } = useAuth();

  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);

  // 🧠 IMPORTANTE: no incluir user en dependencias, solo clinicId
  const fetchPatients = useCallback(async (pageNumber: number = 1) => {
    if (!clinicId) return;
    setLoading(true);
    try {
      const from = (pageNumber - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error, count } = await supabase
        .from('patients')
        .select('*', { count: 'exact' })
        .eq('clinic_id', clinicId)
        .eq('status', '1')
        .order('created_date', { ascending: false })
        .range(from, to);

      if (error) throw error;

      setPatients(data || []);
      setTotalPatients(count || 0);
      setTotalPages(Math.max(1, Math.ceil((count || 0) / PAGE_SIZE)));
      setPage(pageNumber);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);


  // 🚀 Ejecutar solo una vez al tener clinicId
  useEffect(() => {
    if (!clinicId) return;
    // no llames setState aquí basado en algo que cambie en cada render
    fetchPatients(1); // OK: fetchPatients es estable porque solo depende de clinicId
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clinicId]);

  // 🧮 Crear paciente
  const createPatient = async (patientData: any) => {
    if (!clinicId || !user) return;

    try {
      const ip = await fetch('https://api.ipify.org?format=json')
        .then((res) => res.json())
        .then((data) => data.ip)
        .catch(() => '0.0.0.0');

      const age = calculateAge(patientData.birthDate);

      const { data, error } = await supabase
        .from('patients')
        .insert([
          {
            clinic_id: clinicId,
            name: patientData.name.trim(),
            email: patientData.email?.trim() || '',
            phone: patientData.phone?.trim() || '',
            birth_date: patientData.birthDate || null,
            age,
            address: patientData.address?.trim() || '',
            medical_history: patientData.medicalHistory?.trim() || '',
            emergency_contact: patientData.emergencyContact?.trim() || '',
            emergency_phone: patientData.emergencyPhone?.trim() || '',
            status: '1',
            created_by_user: user.id,
            created_by_ip: ip,
            created_date: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) throw error;

      if (page === 1) {
        setPatients((prev) => [data, ...prev].slice(0, PAGE_SIZE));
      }

      setTotalPatients((prev) => prev + 1);
      setTotalPages((prev) => Math.ceil((prev * PAGE_SIZE + 1) / PAGE_SIZE));
      return data;
    } catch (error) {
      console.error('Error creating patient:', error);
      throw error;
    }
  };

  // 🔹 Actualizar
  const updatePatient = async (id: string, updates: Partial<Patient>) => {
    if (!user || !clinicId) return;

    try {
      const ip = await fetch('https://api.ipify.org?format=json')
        .then((res) => res.json())
        .then((data) => data.ip)
        .catch(() => '0.0.0.0');

      let age: number | null | undefined = updates.age;
      if (updates.birth_date) {
        age = calculateAge(updates.birth_date);
      }

      const updatePayload = {
        ...updates,
        ...(age !== undefined ? { age } : {}),
        updated_by_user: user.id,
        updated_date: new Date().toISOString(),
        updated_by_ip: ip,
      };

      const { data, error } = await supabase
        .from('patients')
        .update(updatePayload)
        .eq('id', id)
        .eq('clinic_id', clinicId)
        .select()
        .single();

      if (error) throw error;

      setPatients((prev) =>
        prev.map((p) => (p.id === id ? { ...p, ...data } : p))
      );

      return data;
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  };

  // 🔹 Inactivar
  const deletePatient = async (id: string) => {
    if (!user || !clinicId) return;

    try {
      const ip = await fetch('https://api.ipify.org?format=json')
        .then((res) => res.json())
        .then((data) => data.ip)
        .catch(() => '0.0.0.0');

      const { error } = await supabase
        .from('patients')
        .update({
          status: '0',
          updated_by_user: user.id,
          updated_by_ip: ip,
          updated_date: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('clinic_id', clinicId);

      if (error) throw error;
      setPatients((prev) => prev.filter((p) => p.id !== id));
      setTotalPatients((prev) => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error deleting patient:', error);
    }
  };

  return {
    patients,
    loading,
    page,
    totalPages,
    totalPatients,
    fetchPatients,
    createPatient,
    updatePatient,
    deletePatient,
  };
};
