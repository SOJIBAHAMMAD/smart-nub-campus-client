/**
 * Connection module types mirroring server-side Prisma models.
 * Keep in sync with server schema: prisma/schema/connection.prisma
 */

import type { UserReferenceWithEmail } from "./common.types";

// ── Shared references ────────────────────────────────────────────────────────

export interface ConnectionUser extends UserReferenceWithEmail {
  student?: {
    department: string;
    admissionYear: number;
  } | null;
}

// ── Core models ──────────────────────────────────────────────────────────────

export interface Connection {
  id: string;
  requesterId: string;
  requester?: ConnectionUser;
  receiverId: string;
  receiver?: ConnectionUser;
  status: ConnectionStatus;
  isFavorite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConnectionRequest {
  id: string;
  requesterId: string;
  requester?: ConnectionUser;
  receiverId: string;
  receiver?: ConnectionUser;
  status: ConnectionStatus;
  createdAt: string;
}

export interface UserSkill {
  id: string;
  userId: string;
  tagId: string;
  tag?: import("./resource.types").Tag;
  createdAt: string;
}

// ── Other user reference (connection list / pending / sent) ───────────────────

export interface ConnectionOtherUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  student?: {
    department: string;
    admissionYear: number;
    admissionSemester: string;
  } | null;
  profile?: {
    currentSemester: number | null;
    batchYear: number | null;
  } | null;
}

// ── Connection with the "other" participant resolved ─────────────────────────

export interface ConnectionWithUser {
  id: string;
  requesterId: string;
  receiverId: string;
  status: ConnectionStatus;
  isFavorite: boolean;
  note?: string | null;
  connectedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  otherUser: ConnectionOtherUser;
}

// ── Suggested person (People You May Know) ───────────────────────────────────

export interface SuggestedPerson {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  department: string;
  currentSemester: number | null;
  mutualConnections: number;
  score: number;
}

// ── Search people result ─────────────────────────────────────────────────────

export interface SearchPerson extends ConnectionOtherUser {
  userSkills?: { tag: { id: string; name: string; slug: string } }[];
  /** Relationship of the current user to this person, as resolved by the server. */
  connectionStatus?: "NONE" | "CONNECTED" | "PENDING_INCOMING" | "PENDING_OUTGOING";
  /** Connection record id when a pending/established connection exists. */
  connectionId?: string | null;
}

export interface SearchPeopleResponse {
  data: SearchPerson[];
  meta: import("./resource.types").PaginationMeta;
}

// ── Connection overview stats ────────────────────────────────────────────────

export interface ConnectionOverview {
  totalConnections: number;
  pending: number;
  sent: number;
  favorites: number;
  blocked: number;
}

export interface BlockedUser {
  id: string;
  blockerId: string;
  blockedId: string;
  createdAt: string;
}

// ── Enums ────────────────────────────────────────────────────────────────────

export type ConnectionStatus = "PENDING" | "ACCEPTED" | "REJECTED" | "BLOCKED";

// ── API query / list types ───────────────────────────────────────────────────

export interface ListConnectionsParams {
  page?: number;
  limit?: number;
  status?: ConnectionStatus;
  search?: string;
}

export interface ConnectionListResponse {
  connections: ConnectionWithUser[];
  meta: import("./resource.types").PaginationMeta;
}
