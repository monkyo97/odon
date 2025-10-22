// src/hooks/useDentists.ts
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Dentist {
  id: string;
  clinic_id?: string;
  name: string;
  email: string;
  phone?: string;
  specialty?: string;
  license_number?: string;
  status: '1' | '0';
  created_by_user?: string;
  created_date?: string;
  created_by_ip?: string;
  updated_by_user?: string;
  updated_date?: string;
  updated_by_ip?: string;
}

const PAGE_SIZE = 20;

export const useDentists = () => {
  const { user, clinicId } = useAuth();
  const [dentists, setDentists] = useState<Dentist[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalDentists, setTotalDentists] = useState(0);

  // Obtener odontólogos
  const fetchDentists = useCallback(async (pageNumber: number = 1) => {
    if (!clinicId) return;
    setLoading(true);
    try {
      const from = (pageNumber - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE - 1;

      const { data, error, count } = await supabase
        .from('dentists')
        .select('*', { count: 'exact' })
        .eq('clinic_id', clinicId)
        .eq('status', '1')
        .order('created_date', { ascending: false })
        .range(from, to);

      if (error) throw error;

      setDentists(data || []);
      setTotalDentists(count || 0);
      setTotalPages(Math.max(1, Math.ceil((count || 0) / PAGE_SIZE)));
      setPage(pageNumber);
    } catch (err) {
      console.error('Error fetching dentists:', err);
    } finally {
      setLoading(false);
    }
  }, [clinicId]);

  useEffect(() => {
    if (!clinicId) return;
    fetchDentists(1);
  }, [clinicId, fetchDentists]);

  // Crear odontólogo
  const createDentist = async (dentistData: Omit<Dentist, 'id'>) => {
    if (!user || !clinicId) return;
    try {
      const ip = await fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => data.ip)
        .catch(() => '0.0.0.0');

      const { data, error } = await supabase
        .from('dentists')
        .insert([{
          ...dentistData,
          clinic_id: clinicId,
          status: '1',
          created_by_user: user.id,
          created_by_ip: ip,
          created_date: new Date().toISOString(),
        }])
        .select()
        .single();

      if (error) throw error;

      if (page === 1) {
        setDentists(prev => [data, ...prev].slice(0, PAGE_SIZE));
      }

      setTotalDentists(prev => prev + 1);
      return data;
    } catch (error) {
      console.error('Error creating dentist:', error);
      throw error;
    }
  };

  // Actualizar odontólogo
  const updateDentist = async (id: string, updates: Partial<Dentist>) => {
    if (!user || !clinicId) return;
    try {
      const ip = await fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => data.ip)
        .catch(() => '0.0.0.0');

      const payload = {
        ...updates,
        updated_by_user: user.id,
        updated_by_ip: ip,
        updated_date: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('dentists')
        .update(payload)
        .eq('id', id)
        .eq('clinic_id', clinicId)
        .select()
        .single();

      if (error) throw error;

      setDentists(prev =>
        prev.map(d => (d.id === id ? { ...d, ...data } : d))
      );
      return data;
    } catch (error) {
      console.error('Error updating dentist:', error);
      throw error;
    }
  };

  // Inactivar odontólogo (borrado lógico)
  const deleteDentist = async (id: string) => {
    if (!user || !clinicId) return;
    try {
      const ip = await fetch('https://api.ipify.org?format=json')
        .then(res => res.json())
        .then(data => data.ip)
        .catch(() => '0.0.0.0');

      const { error } = await supabase
        .from('dentists')
        .update({
          status: '0',
          updated_by_user: user.id,
          updated_by_ip: ip,
          updated_date: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('clinic_id', clinicId);

      if (error) throw error;

      setDentists(prev => prev.filter(d => d.id !== id));
      setTotalDentists(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error deleting dentist:', error);
    }
  };

  return {
    dentists,
    loading,
    page,
    totalPages,
    totalDentists,
    fetchDentists,
    createDentist,
    updateDentist,
    deleteDentist,
  };
};
