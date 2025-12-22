import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';

const STEPS = ['Cart', 'Shipping', 'Payment', 'Review'] as const;

type CheckoutStepsProps = {
  currentStep: 1 | 2 | 3 | 4;
};

export default function CheckoutSteps({ currentStep }: CheckoutStepsProps) {
  return (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-2 md:space-x-4">
        {STEPS.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;
          const isFuture = stepNumber > currentStep;

          return (
            <div key={step} className="flex items-center">
              {/* Step indicator */}
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                    isCompleted && 'bg-green-600 text-white',
                    isCurrent && 'bg-primary text-primary-foreground',
                    isFuture && 'bg-muted text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    stepNumber
                  )}
                </div>
                <span
                  className={cn(
                    'mt-1 text-xs font-medium hidden sm:block',
                    isCompleted && 'text-green-600',
                    isCurrent && 'text-primary font-bold',
                    isFuture && 'text-muted-foreground'
                  )}
                >
                  {step}
                </span>
              </div>

              {/* Connector line */}
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    'h-0.5 w-8 md:w-16 mx-2',
                    stepNumber < currentStep ? 'bg-green-600' : 'bg-muted'
                  )}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
