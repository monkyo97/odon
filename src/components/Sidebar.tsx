import React, { memo } from 'react';
import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Calendar,
  Settings,
  ClipboardPlus,
  Stethoscope,
  ChevronLeft,
  ChevronRight,
  Menu
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Pacientes', href: '/patients', icon: Users },
  { name: 'Agenda', href: '/appointments', icon: Calendar },
  { name: 'Dentistas', href: '/dentists', icon: ClipboardPlus },
  { name: 'Configuración', href: '/settings', icon: Settings },
];

export const Sidebar: React.FC = memo(() => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <>
      {/* Mobile menu button */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 rounded-lg bg-white shadow-md border border-gray-200"
        >
          <Menu className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:static inset-y-0 left-0 z-50 bg-white shadow-sm border-r border-gray-200 
        transform transition-all duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        ${isCollapsed ? 'lg:w-20' : 'lg:w-64'}
        w-64
      `}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between h-16">
          <div className={`flex items-center ${isCollapsed ? 'justify-center w-full' : ''}`}>
            <Stethoscope className="h-8 w-8 text-blue-600 flex-shrink-0" />
            {!isCollapsed && (
              <div className="ml-3 overflow-hidden whitespace-nowrap">
                <h1 className="text-xl font-bold text-gray-900">DentalPro</h1>
                <p className="text-xs text-gray-600">Sistema Odontológico</p>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden lg:flex p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 absolute -right-3 top-5 bg-white border border-gray-200 shadow-sm"
          >
            {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        <nav className="p-4">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const isActive = location.pathname === item.href;
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center px-3 py-3 rounded-lg text-sm font-medium transition-colors duration-200 ${isActive
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-100'
                      } ${isCollapsed ? 'justify-center' : ''}`}
                    title={isCollapsed ? item.name : ''}
                  >
                    <item.icon className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-blue-700' : 'text-gray-500'} ${!isCollapsed ? 'mr-3' : ''}`} />
                    {!isCollapsed && <span className="whitespace-nowrap overflow-hidden">{item.name}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
});