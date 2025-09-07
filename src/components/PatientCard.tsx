import React from 'react';
import { Link } from 'react-router-dom';
import { User, Phone, Mail, Calendar } from 'lucide-react';

interface PatientCardProps {
  patient: any;
}

export const PatientCard: React.FC<PatientCardProps> = ({ patient }) => {
  return (
    <Link 
      to={`/patients/${patient.id}`}
      className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-all duration-200 hover:border-blue-300 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center">
          <div className="bg-blue-100 p-2 rounded-full mr-3 group-hover:bg-blue-200 transition-colors">
            <User className="h-4 w-4 text-blue-600" />
          </div>
          <div>
            <h3 className="font-medium text-gray-900">{patient.name}</h3>
            <p className="text-sm text-gray-600">{patient.age} años</p>
          </div>
        </div>
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          patient.status === 'active' 
            ? 'bg-green-100 text-green-800' 
            : 'bg-gray-100 text-gray-800'
        }`}>
          {patient.status === 'active' ? 'Activo' : 'Inactivo'}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center text-sm text-gray-600">
          <Mail className="h-3 w-3 mr-2" />
          {patient.email}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Phone className="h-3 w-3 mr-2" />
          {patient.phone}
        </div>
        <div className="flex items-center text-sm text-gray-600">
          <Calendar className="h-3 w-3 mr-2" />
          Registrado: {new Date(patient.created_at).toLocaleDateString('es-ES')}
        </div>
      </div>

      {patient.next_appointment && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm text-blue-600 font-medium">
            Próxima cita: {new Date(patient.next_appointment).toLocaleDateString('es-ES')}
          </p>
        </div>
      )}
    </Link>
  );
};