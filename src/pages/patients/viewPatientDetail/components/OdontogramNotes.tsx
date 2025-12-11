import React, { useState, useEffect } from 'react';
import { Save, Trash2, Plus, StickyNote, AlertTriangle, Pill, User, FileText } from 'lucide-react';
import { formatDate } from '@/utils/formatDate';
import { supabase } from '../../../../lib/supabase';
import { useAuth } from '../../../../contexts/AuthContext';

interface OdontogramNotesProps {
  patientId: string;
}

interface PatientNotes {
  id?: string;
  patient_id: string;
  soft_tissue_lesions: string;
  medications: string;
  allergies: string;
  medical_conditions: string;
  treatment_plan: string;
  general_observations: string;
  updated_at?: string;
}

export const OdontogramNotes: React.FC<OdontogramNotesProps> = ({ patientId }) => {
  const { user } = useAuth();
  const [notes, setNotes] = useState<PatientNotes>({
    patient_id: patientId,
    soft_tissue_lesions: '',
    medications: '',
    allergies: '',
    medical_conditions: '',
    treatment_plan: '',
    general_observations: ''
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    fetchNotes();
  }, [patientId]);

  const fetchNotes = async () => {
    if (!user || !patientId) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('patient_notes')
        .select('*')
        .eq('patient_id', patientId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error;
      }

      if (data) {
        setNotes(data);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveNotes = async () => {
    if (!user || !patientId) return;

    try {
      setSaving(true);

      const { data, error } = await supabase
        .from('patient_notes')
        .upsert({
          ...notes,
          patient_id: patientId,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setNotes(data);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Error saving notes:', error);
      alert('Error al guardar las observaciones');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-900">Observaciones y Notas Clínicas</h4>
        <div className="flex items-center space-x-3">
          {lastSaved && (
            <span className="text-sm text-gray-500">
              Guardado: {formatDate(lastSaved)} {/* Aqui hay fecha mostrar formato 'dd/MM/yyyy'*/}
            </span>
          )}
          <button
            onClick={saveNotes}
            disabled={saving}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Save className="h-4 w-4 mr-2" />
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lesiones de Tejido Blando */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <AlertTriangle className="h-5 w-5 text-orange-500 mr-2" />
            <h5 className="font-medium text-gray-900">Lesiones de Tejido Blando</h5>
          </div>
          <textarea
            value={notes.soft_tissue_lesions}
            onChange={(e) => setNotes({ ...notes, soft_tissue_lesions: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Describe lesiones en encías, lengua, mejillas, paladar, etc..."
          />
        </div>

        {/* Medicamentos */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <Pill className="h-5 w-5 text-green-500 mr-2" />
            <h5 className="font-medium text-gray-900">Medicamentos Actuales</h5>
          </div>
          <textarea
            value={notes.medications}
            onChange={(e) => setNotes({ ...notes, medications: e.target.value })}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Lista de medicamentos que toma el paciente, dosis y frecuencia..."
          />
        </div>

        {/* Alergias */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <AlertTriangle className="h-5 w-5 text-red-500 mr-2" />
            <h5 className="font-medium text-gray-900">Alergias</h5>
          </div>
          <textarea
            value={notes.allergies}
            onChange={(e) => setNotes({ ...notes, allergies: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Alergias a medicamentos, materiales dentales, alimentos, etc..."
          />
        </div>

        {/* Condiciones Médicas */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <div className="flex items-center mb-3">
            <User className="h-5 w-5 text-purple-500 mr-2" />
            <h5 className="font-medium text-gray-900">Condiciones Médicas</h5>
          </div>
          <textarea
            value={notes.medical_conditions}
            onChange={(e) => setNotes({ ...notes, medical_conditions: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            placeholder="Diabetes, hipertensión, problemas cardíacos, etc..."
          />
        </div>
      </div>

      {/* Plan de Tratamiento */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center mb-3">
          <FileText className="h-5 w-5 text-blue-500 mr-2" />
          <h5 className="font-medium text-gray-900">Plan de Tratamiento</h5>
        </div>
        <textarea
          value={notes.treatment_plan}
          onChange={(e) => setNotes({ ...notes, treatment_plan: e.target.value })}
          rows={5}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Describe el plan de tratamiento propuesto, prioridades, secuencia de procedimientos..."
        />
      </div>

      {/* Observaciones Generales */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="flex items-center mb-3">
          <FileText className="h-5 w-5 text-gray-500 mr-2" />
          <h5 className="font-medium text-gray-900">Observaciones Generales</h5>
        </div>
        <textarea
          value={notes.general_observations}
          onChange={(e) => setNotes({ ...notes, general_observations: e.target.value })}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          placeholder="Notas adicionales, comportamiento del paciente, recomendaciones especiales..."
        />
      </div>

      {/* Auto-save notice */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
        <p className="text-sm text-blue-800">
          💡 <strong>Consejo:</strong> Guarda regularmente tus observaciones para no perder información importante.
          Estas notas son fundamentales para el seguimiento del paciente y la continuidad del tratamiento.
        </p>
      </div>
    </div>
  );
};