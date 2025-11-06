import { Home } from 'lucide-react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
  className?: string;
}

export const Logo = ({ size = 'medium', className = '' }: LogoProps) => {
  const sizes = {
    small: {
      container: 'h-8',
      icon: 24,
      text: 'text-xl',
      iconPadding: 'p-1',
    },
    medium: {
      container: 'h-10',
      icon: 28,
      text: 'text-2xl md:text-3xl',
      iconPadding: 'p-1.5',
    },
    large: {
      container: 'h-14',
      icon: 36,
      text: 'text-4xl md:text-5xl',
      iconPadding: 'p-2',
    },
  };

  const config = sizes[size];

  return (
    <div className={`flex items-center gap-2 ${config.container} ${className}`}>
      <div className={`bg-gradient-to-br from-atlantic-blue to-soft-mint ${config.iconPadding} rounded-lg shadow-md`}>
        <Home className="text-white" size={config.icon} strokeWidth={2.5} />
      </div>
      <span className={`${config.text} font-bold text-atlantic-blue tracking-tight`}>
        Gal<span className="text-soft-mint">quiler</span>
      </span>
    </div>
  );
};
