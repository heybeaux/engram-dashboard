/**
 * Entity Profiles API Client
 *
 * Endpoints:
 *   GET    /v1/entity-profiles          — list profiles (search, type, page, limit)
 *   POST   /v1/entity-profiles          — create profile
 *   GET    /v1/entity-profiles/:id      — get single profile
 *   PATCH  /v1/entity-profiles/:id      — update profile
 *   DELETE /v1/entity-profiles/:id      — delete profile
 *   GET    /v1/entity-profiles/:id/memories   — list attached memories
 *   POST   /v1/entity-profiles/:id/attach     — attach a memory
 *   POST   /v1/entity-profiles/:id]/detach    — detach a memory
 */

import { buildAuthHeaders } from '@/lib/api-config';

const PROXY_BASE = '/api/engram';

// ============================================================================
// TYPES
// ============================================================================

export type EntityType =
  | 'PERSON'
  | 'ORGANIZATION'
  | 'PROJECT'
  | 'CONCEPT'
  | 'LOCATION'
  | 'EVENT'
  | 'OTHER';

export type AttributeSource = 'USER' | 'AGENT' | 'IMPORTED';

export interface EntityAttribute {
  id: string;
  key: string;
  value: string;
  valueType: string;
  category: string;
  source: AttributeSource;
  verified: boolean;
  profileId: string;
}

export interface EntityProfile {
  id: string;
  name: string;
  type: EntityType;
  normalizedName: string;
  aliases: string[];
  description?: string;
  attributes: EntityAttribute[];
  embedding?: number[] | null;
  createdAt: string;
  updatedAt: string;
}

export interface EntityMemory {
  id: string;
  content: string;
  raw?: string;
  relevanceScore: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ListProfilesParams {
  search?: string;
  type?: EntityType;
  page?: number;
  limit?: number;
}

export interface ListProfilesResponse {
  profiles: EntityProfile[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateProfileRequest {
  name: string;
  type: EntityType;
  description?: string;
  aliases?: string[];
  attributes?: Array<{
    key: string;
    value: string;
    valueType?: string;
    category?: string;
    source?: AttributeSource;
  }>;
}

export type UpdateProfileRequest = Partial<CreateProfileRequest>;

export interface CreateAttributeRequest {
  key: string;
  value: string;
  valueType?: string;
  category?: string;
  source?: AttributeSource;
}

// ============================================================================
// FETCH HELPER
// ============================================================================

async function entityFetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${PROXY_BASE}${endpoint}`;
  const headers = buildAuthHeaders({
    extraHeaders: options?.headers as Record<string, string>,
  });

  const response = await fetch(url, { ...options, headers });

  if (!response.ok) {
    let msg: string;
    try {
      const body = await response.json();
      msg = body.error || body.message || response.statusText;
    } catch {
      msg = response.statusText;
    }
    throw new Error(msg);
  }

  if (response.status === 204) return undefined as T;
  return response.json();
}

// ============================================================================
// API FUNCTIONS
// ============================================================================

export async function listProfiles(
  params?: ListProfilesParams,
): Promise<ListProfilesResponse> {
  const qs = new URLSearchParams();
  if (params?.search) qs.set('search', params.search);
  if (params?.type) qs.set('type', params.type);
  if (params?.page != null) qs.set('page', String(params.page));
  if (params?.limit != null) qs.set('limit', String(params.limit));
  const query = qs.toString();
  const data = await entityFetch<ListProfilesResponse | EntityProfile[]>(
    `/v1/entity-profiles${query ? `?${query}` : ''}`,
  );
  // Normalise — backend might return array or object
  if (Array.isArray(data)) {
    return { profiles: data, total: data.length, page: 1, limit: data.length || 20 };
  }
  return data;
}

export async function getProfile(id: string): Promise<EntityProfile> {
  return entityFetch<EntityProfile>(`/v1/entity-profiles/${id}`);
}

export async function createProfile(req: CreateProfileRequest): Promise<EntityProfile> {
  return entityFetch<EntityProfile>('/v1/entity-profiles', {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function updateProfile(id: string, req: UpdateProfileRequest): Promise<EntityProfile> {
  return entityFetch<EntityProfile>(`/v1/entity-profiles/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(req),
  });
}

export async function deleteProfile(id: string): Promise<void> {
  return entityFetch<void>(`/v1/entity-profiles/${id}`, { method: 'DELETE' });
}

export async function getProfileMemories(id: string): Promise<EntityMemory[]> {
  const data = await entityFetch<EntityMemory[] | { memories: EntityMemory[] }>(
    `/v1/entity-profiles/${id}/memories`,
  );
  return Array.isArray(data) ? data : data.memories ?? [];
}

export async function attachMemory(profileId: string, memoryId: string): Promise<void> {
  return entityFetch<void>(`/v1/entity-profiles/${profileId}/attach`, {
    method: 'POST',
    body: JSON.stringify({ memoryId }),
  });
}

export async function detachMemory(profileId: string, memoryId: string): Promise<void> {
  return entityFetch<void>(`/v1/entity-profiles/${profileId}/detach`, {
    method: 'POST',
    body: JSON.stringify({ memoryId }),
  });
}

export async function addAttribute(
  profileId: string,
  req: CreateAttributeRequest,
): Promise<EntityAttribute> {
  return entityFetch<EntityAttribute>(`/v1/entity-profiles/${profileId}/attributes`, {
    method: 'POST',
    body: JSON.stringify(req),
  });
}

export async function updateAttribute(
  profileId: string,
  attributeId: string,
  req: Partial<CreateAttributeRequest & { verified: boolean }>,
): Promise<EntityAttribute> {
  return entityFetch<EntityAttribute>(
    `/v1/entity-profiles/${profileId}/attributes/${attributeId}`,
    { method: 'PATCH', body: JSON.stringify(req) },
  );
}

export async function deleteAttribute(profileId: string, attributeId: string): Promise<void> {
  return entityFetch<void>(
    `/v1/entity-profiles/${profileId}/attributes/${attributeId}`,
    { method: 'DELETE' },
  );
}
