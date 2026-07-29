import { Gender, UserRole, UserStatus } from "@/constants/enums";

export interface AuthUser {
  createdAt: Date;
  deletedAt: Date | null;
  email: string;
  emailVerified: boolean;
  gender: Gender | null;
  id: string;
  image: string | null;
  isDeleted: boolean;
  name: string;
  role: UserRole;
  status: UserStatus;
  updatedAt: Date;
}
