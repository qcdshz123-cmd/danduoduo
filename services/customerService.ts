import { supabase } from './supabase';
import type { Customer, PaginatedResponse } from '../types/models';
import { config } from '../constants/config';
import { z } from 'zod';

// ── DTOs ────────────────────────────────────────────────────────
export interface CreateCustomerDto {
  name: string;
  code?: string;
  contact_person?: string | null;
  phone?: string | null;
  wechat?: string | null;
  address?: string | null;
  notes?: string | null;
  credit_limit?: number | null;
  default_price_level?: string;
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {
  is_active?: boolean;
}

export interface CustomerQueryParams {
  search?: string;
  page?: number;
  limit?: number;
}

export const createCustomerSchema = z.object({
  name: z.string().min(1, '客户名称不能为空').max(100),
  code: z.string().max(50).optional(),
  contact_person: z.string().max(50).nullable().optional(),
  phone: z.string().max(20).nullable().optional(),
  wechat: z.string().max(50).nullable().optional(),
  address: z.string().max(200).nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
  credit_limit: z.number().min(0).nullable().optional(),
  default_price_level: z.string().default('retail'),
});

// ── Service ─────────────────────────────────────────────────────
export const customerService = {
  async findAll(params: CustomerQueryParams = {}): Promise<PaginatedResponse<Customer>> {
    const { search, page = 1, limit = config.pageSize } = params;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('customers')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (search) {
      query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
    }

    const { data, error, count } = await query.range(from, to);
    if (error) throw error;

    return {
      data: data ?? [],
      count: count ?? 0,
      hasMore: (count ?? 0) > to + 1,
    };
  },

  async findById(id: string): Promise<Customer | null> {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null;
      throw error;
    }
    return data;
  },

  async create(dto: CreateCustomerDto): Promise<Customer> {
    const validated = createCustomerSchema.parse(dto);
    const code = validated.code || `C${Date.now().toString(36).toUpperCase()}`;

    const { data, error } = await supabase
      .from('customers')
      .insert({
        name: validated.name,
        code,
        contact_person: validated.contact_person ?? null,
        phone: validated.phone ?? null,
        wechat: validated.wechat ?? null,
        address: validated.address ?? null,
        notes: validated.notes ?? null,
        credit_limit: validated.credit_limit ?? null,
        balance: 0,
        default_price_level: validated.default_price_level ?? 'retail',
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async update(id: string, dto: UpdateCustomerDto): Promise<Customer> {
    const updates: Record<string, unknown> = {};
    if (dto.name !== undefined) updates.name = dto.name;
    if (dto.contact_person !== undefined) updates.contact_person = dto.contact_person;
    if (dto.phone !== undefined) updates.phone = dto.phone;
    if (dto.wechat !== undefined) updates.wechat = dto.wechat;
    if (dto.address !== undefined) updates.address = dto.address;
    if (dto.notes !== undefined) updates.notes = dto.notes;
    if (dto.credit_limit !== undefined) updates.credit_limit = dto.credit_limit;
    if (dto.default_price_level !== undefined) updates.default_price_level = dto.default_price_level;
    if (dto.is_active !== undefined) updates.is_active = dto.is_active;

    const { data, error } = await supabase
      .from('customers')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('customers')
      .update({ is_active: false })
      .eq('id', id);

    if (error) throw error;
  },
};
