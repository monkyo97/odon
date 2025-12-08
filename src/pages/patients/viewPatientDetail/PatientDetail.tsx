import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Calendar, FileText, Bluetooth as Tooth, Trash2 } from 'lucide-react';
import { Odontogram } from './components/odontogram/Odontogram';
import { PatientInfo } from './components/PatientInfo';
import { TreatmentHistory } from './components/TreatmentHistory';
import { EditPatientModal } from './components/EditPatientModal';
import { usePatients } from '@/hooks/usePatients';
import { PatientAppointments } from './components/PatientAppointments';
import { ConfirmModal } from '@/components/ConfirmModal';
import { Notifications } from '@/components/Notifications';


export const PatientDetail: React.FC = () => {
  const { id } = useParams();
  const { patients, loading, updatePatient, deletePatient } = usePatients();
  const [activeTab, setActiveTab] = useState<'odontogram' | 'history' | 'appointments'>('odontogram');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const patient = patients.find(p => p.id === id);

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Paciente no encontrado</p>
        <Link to="/patients" className="text-blue-600 hover:text-blue-800 mt-2 inline-block">
          Volver a pacientes
        </Link>
      </div>
    );
  }

  const handleUpdatePatient = async (updates: any) => {
    if (!patient) return;
    try {
      await updatePatient(patient.id, updates);
    } catch (error) {
      console.error('Error updating patient:', error);
      throw error;
    }
  };

  const handleDeletePatient = async () => {
    if (!patient) return;
    setIsConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!patient) return;
    try {
      setIsDeleting(true);
      await deletePatient(patient.id);
      Notifications.success('Paciente eliminado correctamente.');
      window.location.href = '/patients';
    } catch (error) {
      console.error('Error deleting patient:', error);
      Notifications.error('Error al eliminar el paciente. Inténtalo de nuevo.');
    } finally {
      setIsDeleting(false);
      setIsConfirmOpen(false);
    }
  };


  const tabs = [
    { id: 'odontogram', label: 'Odontograma', icon: Tooth },
    { id: 'history', label: 'Historial', icon: FileText },
    { id: 'appointments', label: 'Citas', icon: Calendar }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link 
            to="/patients"
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{patient.name}</h1>
            <p className="text-gray-600">{patient.age} años • Registrado: {new Date(patient.created_date).toLocaleDateString('es-ES')}</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3">
          <button 
            onClick={() => setIsEditModalOpen(true)}
            className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </button>
          <button
            onClick={handleDeletePatient}
            className="flex items-center bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </button>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="lg:col-span-1">
          <PatientInfo patient={patient} />
        </div>
        
        <div className="lg:col-span-3">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200">
            <div className="border-b border-gray-200">
              <nav className="flex space-x-8 px-6">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as typeof activeTab)}
                    className={`flex items-center py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <tab.icon className="h-4 w-4 mr-2" />
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
            
            <div className="p-6">
              {activeTab === 'odontogram' && <Odontogram patientId={patient.id} />}
              {activeTab === 'history' && <TreatmentHistory patientId={patient.id} />}
              {activeTab === 'appointments' && <PatientAppointments patientId={patient.id} />}
            </div>
          </div>
        </div>
      </div>

      <EditPatientModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        patient={patient}
        onSave={handleUpdatePatient}
      />

      <ConfirmModal
        isOpen={isConfirmOpen}
        title="Eliminar paciente"
        message={`¿Estás seguro de que deseas eliminar al paciente ${patient.name}? 
        Esta acción no se puede deshacer y eliminará todos los datos asociados (citas, tratamientos, odontograma).`}
        confirmText="Eliminar paciente"
        cancelText="Cancelar"
        onConfirm={confirmDelete}
        onCancel={() => setIsConfirmOpen(false)}
        loading={isDeleting}
      />


    </div>
  );
};