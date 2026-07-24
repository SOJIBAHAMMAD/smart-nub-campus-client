"use server";

import { accountService } from "@/services/account.service";
import type { CreateAccountResponse } from "@/types";
import type { CreateAccountFormValues } from "@/schemas/onboarding/account.schema";

export async function createAccount(
  values: CreateAccountFormValues,
): Promise<CreateAccountResponse> {
  const response = await accountService.createAccount(
    values.password,
    values.gender,
    values.image,
    values.imagePublicId,
  );
  return response;
}
