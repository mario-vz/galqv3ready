import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../hooks/useTranslation';
import { Logo } from './Logo';

interface HeaderProps {
  onLoginClick?: () => void;
}

export const Header = ({ onLoginClick }: HeaderProps = {}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { href: '#inicio', label: t('nav.home') },
    { href: '#servicios', label: t('nav.services') },
    { href: '#como-funciona', label: t('nav.howItWorks') },
    { href: '#propietarios', label: t('nav.owners') },
    { href: '#sobre-nosotros', label: t('nav.about') },
    { href: '#contacto', label: t('nav.contact') },
  ];

  const toggleLanguage = () => {
    setLanguage(language === 'es' ? 'gl' : 'es');
  };

  return (
    <header
      className={`fixed w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white shadow-md' : 'bg-white/95 backdrop-blur-sm'
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 md:h-20">
          <a href="#inicio" className="flex items-center">
            <Logo size="medium" />
          </a>

          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <a
                key={link.href}
                href={link.href}
                className="text-neutral-gray hover:text-atlantic-blue transition-colors duration-200 font-medium"
              >
                {link.label}
              </a>
            ))}
            <button
              onClick={onLoginClick}
              className="px-4 py-2 bg-soft-mint text-atlantic-blue rounded-lg font-medium hover:bg-atlantic-blue hover:text-white transition-all duration-200"
            >
              {t('nav.privateArea')}
            </button>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setLanguage('es')}
                className={`transition-all duration-200 hover:scale-110 ${language === 'es' ? 'ring-2 ring-atlantic-blue rounded-sm' : 'opacity-60 hover:opacity-100'}`}
                title="Español"
              >
                <img
                  src="https://flagcdn.com/w40/es.png"
                  alt="Español"
                  className="w-8 h-6 object-cover rounded-sm"
                />
              </button>
              <button
                onClick={() => setLanguage('gl')}
                className={`transition-all duration-200 hover:scale-110 ${language === 'gl' ? 'ring-2 ring-atlantic-blue rounded-sm' : 'opacity-60 hover:opacity-100'}`}
                title="Galego"
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Flag_of_Galicia.svg/40px-Flag_of_Galicia.svg.png"
                  alt="Galego"
                  className="w-8 h-6 object-cover rounded-sm"
                />
              </button>
            </div>
          </div>

          <div className="md:hidden flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setLanguage('es')}
                className={`transition-all duration-200 ${language === 'es' ? 'ring-2 ring-atlantic-blue rounded-sm' : 'opacity-60'}`}
              >
                <img
                  src="https://flagcdn.com/w40/es.png"
                  alt="Español"
                  className="w-7 h-5 object-cover rounded-sm"
                />
              </button>
              <button
                onClick={() => setLanguage('gl')}
                className={`transition-all duration-200 ${language === 'gl' ? 'ring-2 ring-atlantic-blue rounded-sm' : 'opacity-60'}`}
              >
                <img
                  src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/64/Flag_of_Galicia.svg/40px-Flag_of_Galicia.svg.png"
                  alt="Galego"
                  className="w-7 h-5 object-cover rounded-sm"
                />
              </button>
            </div>
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-neutral-gray hover:text-atlantic-blue"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              {navLinks.map((link) => (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="text-neutral-gray hover:text-atlantic-blue transition-colors duration-200 font-medium py-2"
                >
                  {link.label}
                </a>
              ))}
              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  if (onLoginClick) onLoginClick();
                }}
                className="px-4 py-2 bg-soft-mint text-atlantic-blue rounded-lg font-medium hover:bg-atlantic-blue hover:text-white transition-all duration-200 text-center w-full"
              >
                {t('nav.privateArea')}
              </button>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
