import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";

extendZodWithOpenApi(z);

export default class Logs {
  id?: string;
  tenant_id?: number | null;
  user_id?: string | null;
  method: string;
  url: string;
  status: number;
  response_time_ms?: number | null;
  message?: string | null;
  created_at?: Date;

  constructor(data: any) {
    this.id = data?.id;
    this.tenant_id = data?.tenant_id;
    this.user_id = data?.user_id;
    this.method = data?.method;
    this.url = data?.url;
    this.status = data?.status;
    this.response_time_ms = data?.response_time_ms;
    this.message = data?.message;
    this.created_at = data?.created_at;
  }

  static schema = z.object({
    id: z.string().uuid().optional(),
    tenant_id: z.number().nullable().optional(),
    user_id: z.string().uuid().nullable().optional(),
    method: z.string(),
    url: z.string(),
    status: z.number(),
    response_time_ms: z.number().nullable().optional(),
    message: z.string().nullable().optional(),
    created_at: z.date().optional(),
  }).openapi("Logs");

  static responseSchema = Logs.schema.openapi("LogsResponse");
  
  static listResponseSchema = z.object({
    data: z.array(Logs.schema),
    total: z.number(),
    page: z.number(),
    limit: z.number(),
  }).openapi("LogsListResponse");
}
