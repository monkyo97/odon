import React from 'react';
import { User, Mail, Phone, MapPin, Heart, Calendar } from 'lucide-react';
import { Patient } from '../../../../hooks/usePatients';

interface PatientInfoProps {
  patient: Patient;
}

export const PatientInfo: React.FC<PatientInfoProps> = ({ patient }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <div className="flex items-center mb-6">
        <div className="bg-blue-100 p-3 rounded-full mr-4">
          <User className="h-8 w-8 text-blue-600" />
        </div>
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Información Personal</h2>
          <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-1 ${
            patient.status === '1' 
              ? 'bg-green-100 text-green-800' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {patient.status === '1' ? 'Activo' : 'Inactivo'}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center">
          <Mail className="h-4 w-4 text-gray-400 mr-3" />
          <span className="text-sm text-gray-900">{patient.email}</span>
        </div>
        
        <div className="flex items-center">
          <Phone className="h-4 w-4 text-gray-400 mr-3" />
          <span className="text-sm text-gray-900">{patient.phone}</span>
        </div>
        
        <div className="flex items-center">
          <Calendar className="h-4 w-4 text-gray-400 mr-3" />
          <span className="text-sm text-gray-900">
            {new Date(patient.birth_date).toLocaleDateString('es-ES')} ({patient.age} años)
          </span>
        </div>
        
        <div className="flex items-start">
          <MapPin className="h-4 w-4 text-gray-400 mr-3 mt-0.5" />
          <span className="text-sm text-gray-900">{patient.address}</span>
        </div>
      </div>

      <div className="border-t border-gray-200 mt-6 pt-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
          <Heart className="h-4 w-4 text-red-500 mr-2" />
          Contacto de Emergencia
        </h3>
        <div className="space-y-2">
          <div className="flex items-center">
            <User className="h-3 w-3 text-gray-400 mr-2" />
            <span className="text-sm text-gray-900">{patient.emergency_contact}</span>
          </div>
          <div className="flex items-center">
            <Phone className="h-3 w-3 text-gray-400 mr-2" />
            <span className="text-sm text-gray-900">{patient.emergency_phone}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-gray-200 mt-6 pt-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">Historia Médica</h3>
        <p className="text-sm text-gray-600 leading-relaxed">
          {patient.medical_history || 'No hay información médica registrada'}
        </p>
      </div>
    </div>
  );
};