import { useTranslation } from '../hooks/useTranslation';
import { Search, Megaphone, DollarSign } from 'lucide-react';

export const HowItWorks = () => {
  const { t } = useTranslation();

  const steps = [
    {
      icon: Search,
      number: '01',
      title: t('howItWorks.steps.step1.title'),
      description: t('howItWorks.steps.step1.description'),
    },
    {
      icon: Megaphone,
      number: '02',
      title: t('howItWorks.steps.step2.title'),
      description: t('howItWorks.steps.step2.description'),
    },
    {
      icon: DollarSign,
      number: '03',
      title: t('howItWorks.steps.step3.title'),
      description: t('howItWorks.steps.step3.description'),
    },
  ];

  return (
    <section id="como-funciona" className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-atlantic-blue mb-4">
            {t('howItWorks.title')}
          </h2>
          <p className="text-xl text-neutral-gray max-w-3xl mx-auto">
            {t('howItWorks.subtitle')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <div key={index} className="relative">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-atlantic-blue text-white text-2xl font-bold mb-6">
                    {step.number}
                  </div>
                  <div className="bg-soft-mint w-16 h-16 rounded-xl flex items-center justify-center mx-auto mb-6">
                    <Icon className="text-atlantic-blue" size={32} />
                  </div>
                  <h3 className="text-2xl font-semibold text-atlantic-blue mb-4">
                    {step.title}
                  </h3>
                  <p className="text-neutral-gray leading-relaxed">
                    {step.description}
                  </p>
                </div>
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-10 left-1/2 w-full h-0.5 bg-soft-mint -z-10"></div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
