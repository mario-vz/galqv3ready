import { useState } from 'react';
import { useTranslation } from '../hooks/useTranslation';
import { TrendingUp, Users, BarChart3, Shield, ChevronDown, ChevronUp, Star } from 'lucide-react';

export const Owners = () => {
  const { t, tArray } = useTranslation();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const benefits = [
    {
      icon: TrendingUp,
      title: t('owners.benefits.items.0.title'),
      description: t('owners.benefits.items.0.description'),
    },
    {
      icon: Users,
      title: t('owners.benefits.items.1.title'),
      description: t('owners.benefits.items.1.description'),
    },
    {
      icon: BarChart3,
      title: t('owners.benefits.items.2.title'),
      description: t('owners.benefits.items.2.description'),
    },
    {
      icon: Shield,
      title: t('owners.benefits.items.3.title'),
      description: t('owners.benefits.items.3.description'),
    },
  ];

  const faqItems = tArray('owners.faq.items');
  const testimonials = tArray('owners.testimonials.items');

  return (
    <section id="propietarios" className="py-20 bg-ivory-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-atlantic-blue mb-4">
            {t('owners.title')}
          </h2>
          <p className="text-xl text-neutral-gray max-w-3xl mx-auto">
            {t('owners.subtitle')}
          </p>
        </div>

        <div className="mb-20">
          <h3 className="text-3xl font-semibold text-atlantic-blue text-center mb-12">
            {t('owners.benefits.title')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {benefits.map((benefit, index) => {
              const Icon = benefit.icon;
              return (
                <div
                  key={index}
                  className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
                >
                  <div className="flex items-start space-x-4">
                    <div className="bg-soft-mint w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0">
                      <Icon className="text-atlantic-blue" size={24} />
                    </div>
                    <div>
                      <h4 className="text-xl font-semibold text-atlantic-blue mb-2">
                        {benefit.title}
                      </h4>
                      <p className="text-neutral-gray leading-relaxed">
                        {benefit.description}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mb-20">
          <h3 className="text-3xl font-semibold text-atlantic-blue text-center mb-12">
            {t('owners.testimonials.title')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial: any, index: number) => (
              <div
                key={index}
                className="bg-white p-8 rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300"
              >
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 fill-current" size={20} />
                  ))}
                </div>
                <p className="text-neutral-gray italic mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>
                <div>
                  <p className="font-semibold text-atlantic-blue">{testimonial.name}</p>
                  <p className="text-sm text-neutral-gray">{testimonial.location}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-3xl font-semibold text-atlantic-blue text-center mb-12">
            {t('owners.faq.title')}
          </h3>
          <div className="max-w-3xl mx-auto space-y-4">
            {faqItems.map((item: any, index: number) => (
              <div
                key={index}
                className="bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full px-8 py-6 flex items-center justify-between text-left hover:bg-ivory-white transition-colors duration-200"
                >
                  <span className="text-lg font-semibold text-atlantic-blue pr-4">
                    {item.question}
                  </span>
                  {openFaq === index ? (
                    <ChevronUp className="text-atlantic-blue flex-shrink-0" size={24} />
                  ) : (
                    <ChevronDown className="text-atlantic-blue flex-shrink-0" size={24} />
                  )}
                </button>
                {openFaq === index && (
                  <div className="px-8 pb-6">
                    <p className="text-neutral-gray leading-relaxed">
                      {item.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
