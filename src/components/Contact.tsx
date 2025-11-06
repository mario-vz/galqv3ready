import { useState, FormEvent } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { Phone, Mail, MessageCircle, MapPin, Send } from 'lucide-react';

export const Contact = () => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    try {
      setStatus('success');
      setFormData({ name: '', email: '', phone: '', message: '' });
      setTimeout(() => setStatus('idle'), 5000);
    } catch (error) {
      setStatus('error');
      setTimeout(() => setStatus('idle'), 5000);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section id="contacto" className="py-20 bg-ivory-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-atlantic-blue mb-4">
            {t('contact.title')}
          </h2>
          <p className="text-xl text-neutral-gray max-w-3xl mx-auto">
            {t('contact.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm">
              <div className="mb-6">
                <label htmlFor="name" className="block text-sm font-medium text-atlantic-blue mb-2">
                  {t('contact.form.name')}
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-atlantic-blue focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="email" className="block text-sm font-medium text-atlantic-blue mb-2">
                  {t('contact.form.email')}
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-atlantic-blue focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="phone" className="block text-sm font-medium text-atlantic-blue mb-2">
                  {t('contact.form.phone')}
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-atlantic-blue focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="mb-6">
                <label htmlFor="message" className="block text-sm font-medium text-atlantic-blue mb-2">
                  {t('contact.form.message')}
                </label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-atlantic-blue focus:border-transparent transition-all duration-200 resize-none"
                ></textarea>
              </div>

              {status === 'success' && (
                <div className="mb-6 p-4 bg-soft-mint rounded-lg">
                  <p className="text-atlantic-blue font-medium">{t('contact.form.success')}</p>
                </div>
              )}

              {status === 'error' && (
                <div className="mb-6 p-4 bg-red-100 rounded-lg">
                  <p className="text-red-600 font-medium">{t('contact.form.error')}</p>
                </div>
              )}

              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-2 px-8 py-4 bg-atlantic-blue text-white rounded-lg font-semibold hover:bg-atlantic-blue/90 transition-all duration-200 transform hover:scale-105"
              >
                <span>{t('contact.form.send')}</span>
                <Send size={20} />
              </button>
            </form>
          </div>

          <div>
            <div className="bg-white p-8 rounded-2xl shadow-sm mb-8">
              <h3 className="text-2xl font-semibold text-atlantic-blue mb-6">
                {t('contact.info.title')}
              </h3>

              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="bg-soft-mint w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Phone className="text-atlantic-blue" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-atlantic-blue mb-1">
                      {t('contact.info.phone')}
                    </p>
                    <p className="text-neutral-gray">+34 609 562 176</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-soft-mint w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Mail className="text-atlantic-blue" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-atlantic-blue mb-1">
                      {t('contact.info.email')}
                    </p>
                    <p className="text-neutral-gray">info@galquiler.es</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-soft-mint w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MessageCircle className="text-atlantic-blue" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-atlantic-blue mb-1">
                      {t('contact.info.whatsapp')}
                    </p>
                    <p className="text-neutral-gray">+34 609 562 176</p>
                  </div>
                </div>

                <div className="flex items-start space-x-4">
                  <div className="bg-soft-mint w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                    <MapPin className="text-atlantic-blue" size={24} />
                  </div>
                  <div>
                    <p className="font-semibold text-atlantic-blue mb-1">
                      {t('contact.info.location')}
                    </p>
                    <p className="text-neutral-gray">{t('contact.info.locationText')}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-4 rounded-2xl shadow-sm overflow-hidden">
              <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden">
                <iframe
                  src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d185987.0682738!2d-8.87!3d42.45!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0xd2f61c7c4f7c9e3%3A0x7c8f7c4f7c4f7c4f!2sR%C3%ADas%20Baixas%2C%20Galicia!5e0!3m2!1sen!2ses!4v1234567890"
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Mapa de Rías Baixas"
                ></iframe>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
