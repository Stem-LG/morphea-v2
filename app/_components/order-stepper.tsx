"use client";

import { useLanguage } from "@/hooks/useLanguage";
import { Check } from "lucide-react";

interface Step {
  id: string;
  title: string;
  description: string;
}

interface OrderStepperProps {
  currentStep: number;
  steps: Step[];
}

export function OrderStepper({ currentStep, steps }: OrderStepperProps) {
  const { t } = useLanguage();

  return (
    <div className="w-full py-8">
      <div className="flex items-center justify-between">
        <div className="flex-1 -mr-28"/>
        {steps.map((step, index) => {
          const stepNumber = index + 1;
          const isCompleted = stepNumber < currentStep;
          const isCurrent = stepNumber === currentStep;

          return (
            <div key={step.id} className="flex items-center flex-1">
              {/* Step Circle */}
              <div className="flex flex-col items-center">
                <div
                  className={`
                    w-10 h-10 rounded-full flex items-center justify-center font-supreme font-semibold text-sm
                    ${
                      isCompleted
                        ? "bg-[#053340] text-white"
                        : isCurrent
                        ? "bg-[#053340] text-white"
                        : "bg-gray-200 text-gray-500"
                    }
                  `}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5" />
                  ) : (
                    stepNumber
                  )}
                </div>
                
                {/* Step Info */}
                <div className="mt-3 text-center">
                  <div
                    className={`
                      font-supreme font-semibold text-sm
                      ${
                        isCompleted || isCurrent
                          ? "text-[#053340]"
                          : "text-gray-500"
                      }
                    `}
                  >
                    {step.title}
                  </div>
                  
                </div>
              </div>

              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div
                  className={`
                    flex-1 h-0.5 mx-4 mt-[-2rem]
                    ${
                      stepNumber < currentStep
                        ? "bg-[#053340]"
                        : "bg-gray-200"
                    }
                  `}
                />
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
