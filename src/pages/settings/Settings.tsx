import React, { useState } from 'react';
import { Building2, User, Shield } from 'lucide-react';
import { ClinicSettings } from './components/ClinicSettings';
import { UserSettings } from './components/UserSettings';
import { SecuritySettings } from './components/SecuritySettings';
import { useUserProfile } from '@hooks/useUserProfile';

export const Settings: React.FC = () => {
  const { profile } = useUserProfile();
  const role = profile?.role;
  
  const [activeTab, setActiveTab] = useState<'clinic' | 'user' | 'security' | 'user_dentist'>( 
    role === 'dentist' ? 'user_dentist' : 'clinic'
  );
  const tabs =
    role === 'admin'
      ? [
          { id: 'clinic', label: 'Clínica', icon: Building2 },
          { id: 'user', label: 'Usuario Principal', icon: User },
          { id: 'security', label: 'Contraseña', icon: Shield },
        ]
      : [
          { id: 'clinic', label: 'Clínica', icon: Building2 },
          { id: 'user_dentist', label: 'Usuario', icon: User },
        ];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="px-4 sm:px-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Configuración General</h1>
        <p className="text-gray-600 mt-1 text-sm sm:text-base">
          Administra los datos de tu clínica, usuario principal y credenciales
        </p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-6 px-6">
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

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'clinic' && <ClinicSettings />}
          {activeTab === 'user' && <UserSettings />}
          {activeTab === 'security' && <SecuritySettings />}
        </div>
      </div>
    </div>
  );
};
