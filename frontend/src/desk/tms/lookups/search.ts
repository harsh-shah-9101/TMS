import { http } from '../api/http';
import type { Paged } from '../api/resource';
import { lookupParams, type DeskLookup } from '../ui';

/** `GET /{endpoint}?q=…&limit=…` plus the lookup's fixed params. */
export async function searchLookup(lookup: DeskLookup, query: string): Promise<Record<string, unknown>[]> {
  const params: Record<string, unknown> = { limit: lookup.limit ?? 20, ...lookupParams(lookup) };
  const text = query.trim();
  if (text) params.q = text;
  const endpoint = lookup.endpoint || (lookup as any).model;
  const { data } = await http.get<Paged<Record<string, unknown>> | Record<string, unknown>[] | { data: Record<string, unknown>[] }>(`/${endpoint}`, { params });
  if (Array.isArray(data)) return data;
  if ('rows' in data && Array.isArray(data.rows)) return data.rows;
  if ('data' in data && Array.isArray((data as any).data)) return (data as any).data;
  return [];
}
