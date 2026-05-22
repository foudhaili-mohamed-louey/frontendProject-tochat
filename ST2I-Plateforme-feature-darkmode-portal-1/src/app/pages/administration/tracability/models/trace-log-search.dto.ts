export interface TraceLogSearchDTO {
  username?: string;
  serviceName?: string;
  method?: string;
  endpoint?: string;
  ipAddress?: string;
  statusCode?: number;
  from?: string;
  to?: string;
  page: number;
  size: number;
}