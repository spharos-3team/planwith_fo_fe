import { Plane } from "lucide-react";

interface SignupStepperProps {
  currentStep: 1 | 2 | 3;
}

export function SignupStepper({ currentStep }: SignupStepperProps) {
  const steps = [1, 2, 3] as const;

  return (
    <div
      aria-label="회원가입 단계"
      className="flex items-center justify-center"
    >
      {steps.map((step, index) => {
        const reached = step <= currentStep;

        return (
          <div className="flex items-center" key={step}>
            <Plane
              aria-current={step === currentStep ? "step" : undefined}
              aria-hidden="true"
              className={`size-5 ${
                reached ? "text-brand-primary" : "text-line-light"
              }`}
            />
            {index < steps.length - 1 ? (
              <span
                aria-hidden="true"
                className={`mx-2 h-px w-[134px] ${
                  step < currentStep ? "bg-brand-primary" : "bg-line-light"
                }`}
              />
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
