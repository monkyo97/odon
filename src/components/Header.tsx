import React from 'react';
import { Bell, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
console.log('user?.name')
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 fixed lg:static top-0 left-0 right-0 z-30 lg:z-auto">
      <div className="flex items-center justify-between px-4 sm:px-6 py-4 lg:ml-0">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center ml-12">
          <h2 className="text-lg font-semibold text-gray-900">DentalPro</h2>
        </div>
        
        {/* Desktop welcome message */}
        <div>
          <h2 className="hidden lg:block text-lg font-semibold text-gray-900">
            Bienvenido, {user?.user_metadata?.name}
          </h2>
          <p className="hidden lg:block text-sm text-gray-600">
            {new Date().toLocaleDateString('es-ES', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        
        <div className="flex items-center space-x-4">
          <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200 hidden sm:block">
            <Bell className="h-5 w-5" />
          </button>
          
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
              <span className="text-white text-sm font-medium">
                {user?.user_metadata?.name?.charAt(0)}
              </span>
            </div>
            
            <button 
              onClick={logout}
              className="hidden sm:flex items-center text-sm text-gray-700 hover:text-gray-900 transition-colors duration-200"
            >
              <LogOut className="h-4 w-4 mr-1" />
              Cerrar Sesión
            </button>
            
            {/* Mobile logout button */}
            <button 
              onClick={logout}
              className="sm:hidden p-2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};