import serverApi from "@/lib/server-api";

export const authService = {
  async getEmailByStudentId(studentId: string): Promise<string> {
    const response = await serverApi.get<{ email: string }>(
      `/account/email-by-student-id/${studentId}`,
    );

    if (!response.data || !response.data.email) {
      throw new Error("Invalid student ID or Password. Please try again.");
    }
    return response.data.email;
  },

  /**
   * Request password reset via identifier (email or student ID)
   */
  async forgotPasswordWithIdentifier(identifier: string): Promise<string> {
    const response = await serverApi.post<{ message: string }>(
      "/auth/forgot-password",
      { identifier },
    );
    return response.message ?? "If an account exists with that identifier, a password reset code has been sent.";
  },

  /**
   * Reset password with OTP
   */
  async resetPasswordByIdentifier(
    identifier: string,
    otp: string,
    password: string,
  ): Promise<string> {
    const response = await serverApi.post<{ message: string }>(
      "/auth/reset-password",
      { identifier, otp, password },
    );
    return response.message ?? "Password has been reset successfully.";
  },
};
