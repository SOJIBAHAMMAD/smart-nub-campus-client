import { OnboardingFlow } from "./_components/OnboardingFlow";
import { onboardingService } from "@/services/onboarding.service";
import ROUTES from "@/constants/routes";
import type { VerificationRequestData } from "@/types";
import { Hyperlink } from "@/components/ui/hyperlink";

export default async function OnboardingPage() {
  let step;
  let verificationRequest: VerificationRequestData | null = null;
  let error = false;

  try {
    const onboarding = await onboardingService.getCurrentStep();
    step = onboarding.currentStep;
    verificationRequest = onboarding.verificationRequest ?? null;
  } catch {
    error = true;
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="text-sm text-destructive">
            Failed to load onboarding data. Please try again.
          </p>
          <Hyperlink href={ROUTES.ONBOARDING} className="text-sm text-brand">
            Retry
          </Hyperlink>
        </div>
      </div>
    );
  }

  return (
    <OnboardingFlow
      initialStep={step!}
      initialVerificationRequest={verificationRequest}
    />
  );
}
