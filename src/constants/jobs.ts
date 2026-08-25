/**
 * Jobs module constants for the client.
 * Job application forms reuse the same built-in profile fields as teams,
 * so the field keys/meta are re-exported from the team constants to keep a
 * single source of truth.
 */

export {
  APPLICATION_FIELD_KEYS,
  APPLICATION_FIELD_META,
  type ApplicationFieldKey,
} from "@/constants/team";

import type { JobApplicationFormConfig } from "@/types/jobs.types";

/**
 * Default application form for new jobs (and fallback for jobs created before
 * this feature): name + email, both pre-filled from the applicant's account.
 */
export const DEFAULT_JOB_APPLICATION_FORM: JobApplicationFormConfig = {
  fields: [
    { key: "name", required: true },
    { key: "email", required: true },
  ],
  questions: [],
};
