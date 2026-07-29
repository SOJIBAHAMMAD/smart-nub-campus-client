import serverApi from "@/lib/server-api";
import type { CreateAccountResponse } from "@/types";

export const accountService = {
  /**
   * Create account after verification approval.
   * Only password is sent — email and name come from the verification request on the backend.
   * Matches backend POST /account/create response
   */
  createAccount: async (
    password: string,
    gender?: string,
    image?: string,
    imagePublicId?: string,
  ): Promise<CreateAccountResponse> => {
    const response = await serverApi.post<CreateAccountResponse>(
      "/account/create",
      {
        password,
        gender,
        image,
        imagePublicId,
      },
    );

    return response.data!;
  },

  getEmailByStudentId: async (studentId: string): Promise<string> => {
    const response = await serverApi.get<{ email: string }>(
      `/account/email-by-student-id/${studentId}`,
    );

    if (!response.data || !response.data.email) {
      throw new Error("Invalid student ID or Password. Please try again.");
    }
    return response.data.email;
  },
};
