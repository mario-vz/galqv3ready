import { useState } from 'react';
import { Users, Calendar, Download, Filter, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { CleaningCalendar } from './CleaningCalendar';
import { CleanerManagement } from './CleanerManagement';

export const CleaningManagement = () => {
  const { language } = useLanguage();
  const [activeView, setActiveView] = useState<'calendar' | 'team'>('calendar');

  const t = language === 'es' ? {
    title: 'Gestión de Limpieza',
    calendar: 'Calendario',
    team: 'Equipo',
    export: 'Exportar CSV'
  } : {
    title: 'Xestión de Limpeza',
    calendar: 'Calendario',
    team: 'Equipo',
    export: 'Exportar CSV'
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-atlantic-blue">{t.title}</h2>
        <div className="flex gap-2">
          <button
            onClick={() => setActiveView('calendar')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeView === 'calendar'
                ? 'bg-atlantic-blue text-white'
                : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-atlantic-blue'
            }`}
          >
            <Calendar size={20} />
            {t.calendar}
          </button>
          <button
            onClick={() => setActiveView('team')}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${
              activeView === 'team'
                ? 'bg-atlantic-blue text-white'
                : 'bg-white border-2 border-gray-300 text-gray-700 hover:border-atlantic-blue'
            }`}
          >
            <Users size={20} />
            {t.team}
          </button>
        </div>
      </div>

      {activeView === 'calendar' ? (
        <CleaningCalendar />
      ) : (
        <CleanerManagement />
      )}
    </div>
  );
};
