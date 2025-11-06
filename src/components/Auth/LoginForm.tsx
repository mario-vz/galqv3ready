import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Lock, Mail, AlertCircle, Loader2 } from 'lucide-react';

interface LoginFormProps {
  onSuccess?: () => void;
}

export const LoginForm = ({ onSuccess }: LoginFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const { language } = useLanguage();

  const translations = {
    es: {
      title: 'Iniciar Sesión',
      email: 'Correo electrónico',
      password: 'Contraseña',
      submit: 'Entrar',
      submitting: 'Entrando...',
      invalidCredentials: 'Correo o contraseña incorrectos',
      errorOccurred: 'Ha ocurrido un error. Inténtalo de nuevo.',
    },
    gl: {
      title: 'Iniciar Sesión',
      email: 'Correo electrónico',
      password: 'Contrasinal',
      submit: 'Entrar',
      submitting: 'Entrando...',
      invalidCredentials: 'Correo ou contrasinal incorrectos',
      errorOccurred: 'Ocorreu un erro. Téntao de novo.',
    },
  };

  const t = translations[language];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        setError(t.invalidCredentials);
      } else {
        setError(t.errorOccurred);
      }
      setLoading(false);
    } else {
      if (onSuccess) onSuccess();
    }
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-2xl shadow-xl p-8">
      <div className="flex items-center justify-center mb-6">
        <div className="bg-atlantic-blue w-16 h-16 rounded-full flex items-center justify-center">
          <Lock className="text-white" size={32} />
        </div>
      </div>

      <h2 className="text-3xl font-bold text-atlantic-blue text-center mb-8">{t.title}</h2>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
          <p className="text-red-700 text-sm">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-neutral-gray mb-2">
            {t.email}
          </label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-gray" size={20} />
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-atlantic-blue focus:border-transparent outline-none transition-all"
              placeholder="tu@email.com"
            />
          </div>
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-neutral-gray mb-2">
            {t.password}
          </label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-gray" size={20} />
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-atlantic-blue focus:border-transparent outline-none transition-all"
              placeholder="••••••••"
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-atlantic-blue text-white py-3 rounded-lg font-semibold hover:bg-atlantic-blue/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin" size={20} />
              {t.submitting}
            </>
          ) : (
            t.submit
          )}
        </button>
      </form>
    </div>
  );
};
