import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { User, Phone, Mail, Calendar } from 'lucide-react';
import { formatDate } from '@/utils/formatDate';
import { Patient } from '@/hooks/usePatients';

interface PatientCardProps {
  patient: Patient;
}

export const PatientCard: React.FC<PatientCardProps> = ({ patient }) => {
  const location = useLocation();

  return (
    <Link
      to={`/patients/${patient.id}`}
      state={{ from: location.pathname + location.search }}
      className="bg-white border border-gray-200 rounded-lg p-4 transition-all duration-200 hover:border-blue-300 group hover:bg-blue-50"
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
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${patient.status === '1'
          ? 'bg-green-100 text-green-800'
          : 'bg-gray-100 text-gray-800'
          }`}>
          {patient.status === '1' ? 'Activo' : 'Inactivo'}
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
          Registrado: {formatDate(patient.created_date)} {/* Aqui hay fecha mostrar formato 'dd/MM/yyyy'*/}
        </div>
      </div>
    </Link>
  );
};