import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Edit, Calendar, FileText, Bluetooth as Tooth } from 'lucide-react';
import { Odontogram } from '../components/Odontogram';
import { PatientInfo } from '../components/PatientInfo';
import { TreatmentHistory } from '../components/TreatmentHistory';
import { usePatients } from '../hooks/usePatients';
import { PatientAppointments } from '../components/PatientAppointments';

export const PatientDetail: React.FC = () => {
  const { id } = useParams();
  const { patients, loading } = usePatients();
  const [activeTab, setActiveTab] = useState<'odontogram' | 'history' | 'appointments'>('odontogram');

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
            <p className="text-gray-600">{patient.age} años • Registrado: {new Date(patient.created_at).toLocaleDateString('es-ES')}</p>
          </div>
        </div>
        
        <button className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
          <Edit className="h-4 w-4 mr-2" />
          Editar Paciente
        </button>
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
    </div>
  );
};