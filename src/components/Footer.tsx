import { useTranslation } from '../hooks/useTranslation';
import { useLanguage } from '../context/LanguageContext';
import { Logo } from './Logo';

export const Footer = () => {
  const { t } = useTranslation();
  const { language, setLanguage } = useLanguage();

  const navLinks = [
    { href: '#inicio', label: t('nav.home') },
    { href: '#servicios', label: t('nav.services') },
    { href: '#propietarios', label: t('nav.owners') },
    { href: '#contacto', label: t('nav.contact') },
  ];

  return (
    <footer className="bg-atlantic-blue text-white py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-8">
          <div>
            <div className="mb-4">
              <Logo size="medium" className="[&>div]:bg-white/10 [&>div]:shadow-none [&_svg]:text-soft-mint [&_span]:text-white" />
            </div>
            <p className="text-white/80 leading-relaxed">
              {t('footer.description')}
            </p>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">{t('footer.quickLinks')}</h4>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-white/80 hover:text-white transition-colors duration-200"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-semibold mb-4">Idioma / Lingua</h4>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => setLanguage('es')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  language === 'es'
                    ? 'bg-soft-mint text-atlantic-blue font-semibold'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                <img
                  src="https://flagcdn.com/w40/es.png"
                  alt="España"
                  className="w-6 h-4 object-cover rounded-sm"
                />
                <span>Español</span>
              </button>
              <button
                onClick={() => setLanguage('gl')}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  language === 'gl'
                    ? 'bg-soft-mint text-atlantic-blue font-semibold'
                    : 'bg-white/10 text-white/80 hover:bg-white/20'
                }`}
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Flag_of_Galicia.svg/40px-Flag_of_Galicia.svg.png"
                  alt="Galicia"
                  className="w-6 h-4 object-cover rounded-sm"
                />
                <span>Galego</span>
              </button>
            </div>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8 text-center">
          <p className="text-white/80">{t('footer.copyright')}</p>
        </div>
      </div>
    </footer>
  );
};
