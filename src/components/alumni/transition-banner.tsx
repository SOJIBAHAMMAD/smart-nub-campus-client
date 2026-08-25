import { alumniService } from "@/services/alumni.service";
import { TransitionDialog } from "./transition-dialog";

/**
 * Server component wrapper for the alumni transition banner.
 * Fetches the student's transition status and only renders the interactive
 * banner when the student has been marked as graduated (eligible).
 * Non-students / fetch errors render nothing.
 */
export async function TransitionBanner() {
  let data;
  try {
    data = await alumniService.getTransitionStatus();
  } catch {
    return null;
  }

  if (!data.eligible || !data.graduation) {
    return null;
  }

  return <TransitionDialog graduation={data.graduation} />;
}
