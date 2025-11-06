import { useTranslation } from '../hooks/useTranslation';
import { ArrowRight } from 'lucide-react';

export const Hero = () => {
  const { t } = useTranslation();

  return (
    <section id="inicio" className="relative min-h-screen flex items-center justify-center">
      <div
        className="absolute inset-0 z-0"
        style={{
          backgroundImage: 'url(https://images.pexels.com/photos/1268871/pexels-photo-1268871.jpeg?auto=compress&cs=tinysrgb&w=1920)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-atlantic-blue/80 to-atlantic-blue/60"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
          {t('hero.title')}
        </h1>
        <p className="text-xl md:text-2xl text-white/90 mb-10 max-w-3xl mx-auto font-light">
          {t('hero.subtitle')}
        </p>
        <a
          href="#contacto"
          className="inline-flex items-center space-x-2 px-8 py-4 bg-soft-mint text-atlantic-blue rounded-lg font-semibold text-lg hover:bg-white hover:shadow-xl transition-all duration-300 transform hover:scale-105"
        >
          <span>{t('hero.cta')}</span>
          <ArrowRight size={20} />
        </a>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-ivory-white to-transparent"></div>
    </section>
  );
};
