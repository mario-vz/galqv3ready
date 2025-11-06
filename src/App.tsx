import { useState } from 'react';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { Services } from './components/Services';
import { HowItWorks } from './components/HowItWorks';
import { Owners } from './components/Owners';
import { PrivateArea } from './components/PrivateArea';
import { About } from './components/About';
import { Contact } from './components/Contact';
import { Footer } from './components/Footer';
import { LoginForm } from './components/Auth/LoginForm';
import { Dashboard } from './components/Dashboard/Dashboard';

function AppContent() {
  const { user, loading } = useAuth();
  const [showLogin, setShowLogin] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ivory-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-atlantic-blue"></div>
      </div>
    );
  }

  if (user) {
    return <Dashboard />;
  }

  if (showLogin) {
    return (
      <div className="min-h-screen bg-ivory-white pt-24 pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => setShowLogin(false)}
            className="mb-8 text-atlantic-blue hover:text-atlantic-blue/80 font-medium"
          >
            ← Volver al inicio
          </button>
          <LoginForm onSuccess={() => {}} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ivory-white">
      <Header onLoginClick={() => setShowLogin(true)} />
      <Hero />
      <Services />
      <HowItWorks />
      <Owners />
      <PrivateArea />
      <About />
      <Contact />
      <Footer />
    </div>
  );
}

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
