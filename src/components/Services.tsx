import { useTranslation } from '../hooks/useTranslation';
import { Home, Globe, MessageCircle, Sparkles, KeyRound, TrendingUp } from 'lucide-react';

export const Services = () => {
  const { t } = useTranslation();

  const services = [
    {
      icon: Home,
      title: t('services.items.management.title'),
      description: t('services.items.management.description'),
    },
    {
      icon: Globe,
      title: t('services.items.publishing.title'),
      description: t('services.items.publishing.description'),
    },
    {
      icon: MessageCircle,
      title: t('services.items.communication.title'),
      description: t('services.items.communication.description'),
    },
    {
      icon: Sparkles,
      title: t('services.items.cleaning.title'),
      description: t('services.items.cleaning.description'),
    },
    {
      icon: KeyRound,
      title: t('services.items.checkin.title'),
      description: t('services.items.checkin.description'),
    },
    {
      icon: TrendingUp,
      title: t('services.items.pricing.title'),
      description: t('services.items.pricing.description'),
    },
  ];

  return (
    <section id="servicios" className="py-20 bg-ivory-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-atlantic-blue mb-4">
            {t('services.title')}
          </h2>
          <p className="text-xl text-neutral-gray max-w-3xl mx-auto">
            {t('services.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => {
            const Icon = service.icon;
            return (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="bg-soft-mint w-16 h-16 rounded-xl flex items-center justify-center mb-6">
                  <Icon className="text-atlantic-blue" size={32} />
                </div>
                <h3 className="text-xl font-semibold text-atlantic-blue mb-3">
                  {service.title}
                </h3>
                <p className="text-neutral-gray leading-relaxed">
                  {service.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
