import { useTranslation } from '../hooks/useTranslation';
import { Lock, Calendar, DollarSign, Star, Link as LinkIcon } from 'lucide-react';

export const PrivateArea = () => {
  const { t } = useTranslation();

  const features = [
    { icon: Calendar, text: 'Calendario de reservas' },
    { icon: DollarSign, text: 'Informes de ingresos' },
    { icon: Star, text: 'Valoraciones de huéspedes' },
    { icon: LinkIcon, text: 'Enlaces a tus anuncios' },
  ];

  return (
    <section id="area-privada" className="py-20 bg-gradient-to-br from-atlantic-blue to-atlantic-blue/80">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="bg-white/10 backdrop-blur-sm rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-6">
          <Lock className="text-white" size={40} />
        </div>

        <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
          {t('privateArea.title')}
        </h2>

        <div className="inline-block bg-soft-mint px-6 py-2 rounded-full mb-8">
          <span className="text-atlantic-blue font-semibold">
            {t('privateArea.comingSoon')}
          </span>
        </div>

        <p className="text-xl text-white/90 mb-12 max-w-2xl mx-auto leading-relaxed">
          {t('privateArea.description')}
        </p>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm p-6 rounded-xl"
              >
                <Icon className="text-soft-mint mx-auto mb-3" size={32} />
                <p className="text-white text-sm font-medium">{feature.text}</p>
              </div>
            );
          })}
        </div>

        <button
          disabled
          className="px-8 py-4 bg-white/20 text-white rounded-lg font-semibold cursor-not-allowed opacity-60"
        >
          {t('privateArea.requestAccess')}
        </button>
      </div>
    </section>
  );
};
