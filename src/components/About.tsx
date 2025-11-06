import { useTranslation } from '../hooks/useTranslation';
import { Heart, MapPin, Eye } from 'lucide-react';

export const About = () => {
  const { t } = useTranslation();

  const values = [
    {
      icon: Heart,
      title: t('about.values.trust.title'),
      description: t('about.values.trust.description'),
    },
    {
      icon: MapPin,
      title: t('about.values.proximity.title'),
      description: t('about.values.proximity.description'),
    },
    {
      icon: Eye,
      title: t('about.values.transparency.title'),
      description: t('about.values.transparency.description'),
    },
  ];

  return (
    <section id="sobre-nosotros" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-atlantic-blue mb-4">
            {t('about.title')}
          </h2>
          <p className="text-xl text-neutral-gray max-w-3xl mx-auto">
            {t('about.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
          <div>
            <p className="text-lg text-neutral-gray leading-relaxed mb-6">
              {t('about.description')}
            </p>
          </div>
          <div className="rounded-2xl overflow-hidden shadow-xl">
            <img
              src="https://images.pexels.com/photos/1660995/pexels-photo-1660995.jpeg?auto=compress&cs=tinysrgb&w=800"
              alt="Rías Baixas"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        <div>
          <h3 className="text-3xl font-semibold text-atlantic-blue text-center mb-12">
            {t('about.values.title')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div
                  key={index}
                  className="text-center p-8 rounded-2xl bg-ivory-white hover:shadow-lg transition-all duration-300"
                >
                  <div className="bg-soft-mint w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Icon className="text-atlantic-blue" size={32} />
                  </div>
                  <h4 className="text-2xl font-semibold text-atlantic-blue mb-4">
                    {value.title}
                  </h4>
                  <p className="text-neutral-gray leading-relaxed">
                    {value.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
