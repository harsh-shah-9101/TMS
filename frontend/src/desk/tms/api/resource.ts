import { http } from './http';

export interface Paged<T> {
  rows: T[];
  count: number;
}

export interface ListParams {
  q?: string;
  limit?: number;
  offset?: number;
  /** Column key; `alias.field` sorts on an included record. */
  sort?: string;
  dir?: 'ASC' | 'DESC';
  /** Grid filter row: column key to text. */
  filters?: Record<string, string>;
  /** Module filters such as `subtype` or `status`. */
  [extra: string]: unknown;
}

function toQuery(params: ListParams): Record<string, string | number> {
  const out: Record<string, string | number> = {};

  // 1. Pagination: map offset/limit to 1-based page & limit
  const limit = params.limit ?? 20;
  out.limit = limit;
  if (params.page !== undefined && params.page !== null) {
    out.page = Number(params.page);
  } else if (params.offset !== undefined) {
    out.page = Math.floor(params.offset / limit) + 1;
  } else {
    out.page = 1;
  }

  // 2. Global search: q -> search
  if (params.q) {
    out.search = params.q;
  }

  // 3. Grid column filters
  if (params.filters) {
    const entries = Object.entries(params.filters).filter(([, v]) => typeof v === 'string' && v.trim() !== '');
    for (const [col, val] of entries) {
      const v = val.trim();
      if (col === 'status') out.status = v;
      else if (col === 'type') out.type = v;
      else if (col === 'ownershipType') out.ownershipType = v;
      else if (col === 'vehicleTypeId') out.vehicleTypeId = v;
      else if (!out.search) {
        out.search = v;
      }
    }
  }

  // 4. Any direct custom module filters passed in
  for (const [key, value] of Object.entries(params)) {
    if (['offset', 'sort', 'dir', 'filters', 'q', 'limit', 'page'].includes(key)) continue;
    if (value !== undefined && value !== null && value !== '') {
      out[key] = typeof value === 'number' || typeof value === 'string' ? value : String(value);
    }
  }

  return out;
}

/** An input an action asks for, such as a reason. */
export interface ActionInput {
  id: string;
  label: string;
  kind?: 'text' | 'textarea' | 'date';
  required?: boolean;
}

/** A named operation on one row (activate, deactivate, approve…). */
export interface ActionInfo {
  name: string;
  label: string;
  from: Record<string, readonly string[]> | null;
  confirm: string | null;
  kind: 'row' | 'bulk' | 'collection';
  danger: boolean;
  inputs: readonly ActionInput[];
}

/** List, read, create, update and delete for one REST collection. */
export interface ResourceApi<T, TSave> {
  path: string;
  list(params?: ListParams): Promise<Paged<T>>;
  get(id: number | string): Promise<T>;
  create(body: TSave): Promise<T>;
  update(id: number | string, body: Partial<TSave>): Promise<T>;
  remove(id: number | string): Promise<void>;
  actions(): Promise<ActionInfo[]>;
  perform(id: number | string, name: string, input?: Record<string, unknown>): Promise<T>;
}

export function resource<T, TSave = Partial<T>>(path: string): ResourceApi<T, TSave> {
  return {
    path,
    list: async (params = {}) => {
      const res = await http.get<{ data: T[]; meta?: { total?: number; count?: number } } | Paged<T>>(path, { params: toQuery(params) });
      // Support both {rows, count} and {data, meta} response shapes
      const d = res.data as any;
      if (Array.isArray(d.rows)) return { rows: d.rows, count: d.count ?? d.rows.length };
      if (Array.isArray(d.data)) return { rows: d.data, count: d.meta?.total ?? d.meta?.count ?? d.data.length };
      if (Array.isArray(d)) return { rows: d, count: d.length };
      return { rows: [], count: 0 };
    },
    get: async (id) => (await http.get<T>(`${path}/${id}`)).data,
    create: async (body) => (await http.post<T>(path, body)).data,
    update: async (id, body) => (await http.patch<T>(`${path}/${id}`, body)).data,
    remove: async (id) => { await http.delete(`${path}/${id}`); },
    actions: async () => {
      try { return (await http.get<ActionInfo[]>(`${path}/actions`)).data; } catch { return []; }
    },
    perform: async (id, name, input = {}) => (await http.post<T>(`${path}/${id}/actions/${name}`, input)).data,
  };
}
