import { AlertTriangle, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  propertyName: string;
  isDeleting: boolean;
}

export const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  propertyName,
  isDeleting
}: DeleteConfirmationModalProps) => {
  const { language } = useLanguage();

  const translations = {
    es: {
      title: 'Confirmar Eliminación',
      message: '¿Estás seguro de que quieres eliminar esta propiedad?',
      propertyLabel: 'Propiedad:',
      warning: 'Esta acción no se puede deshacer. Se eliminarán todas las reservas, integraciones y datos relacionados con esta propiedad.',
      cancel: 'Cancelar',
      confirm: 'Eliminar Propiedad',
      deleting: 'Eliminando...',
    },
    gl: {
      title: 'Confirmar Eliminación',
      message: 'Estás seguro de que queres eliminar esta propiedade?',
      propertyLabel: 'Propiedade:',
      warning: 'Esta acción non se pode desfacer. Eliminaranse todas as reservas, integracións e datos relacionados con esta propiedade.',
      cancel: 'Cancelar',
      confirm: 'Eliminar Propiedade',
      deleting: 'Eliminando...',
    },
  };

  const t = translations[language];

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full">
        <div className="bg-red-50 border-b border-red-100 px-6 py-4 flex items-center justify-between rounded-t-2xl">
          <div className="flex items-center gap-3">
            <div className="bg-red-100 p-2 rounded-full">
              <AlertTriangle size={24} className="text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-red-900">{t.title}</h2>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
          >
            <X size={24} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-neutral-gray text-base">{t.message}</p>

          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-neutral-gray font-medium mb-1">{t.propertyLabel}</p>
            <p className="text-lg font-bold text-atlantic-blue">{propertyName}</p>
          </div>

          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-sm text-red-800">
              <span className="font-semibold">⚠️ {t.warning}</span>
            </p>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 flex gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 border border-gray-300 text-neutral-gray rounded-lg hover:bg-white transition-colors font-medium disabled:opacity-50"
          >
            {t.cancel}
          </button>
          <button
            onClick={onConfirm}
            disabled={isDeleting}
            className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting ? t.deleting : t.confirm}
          </button>
        </div>
      </div>
    </div>
  );
};
