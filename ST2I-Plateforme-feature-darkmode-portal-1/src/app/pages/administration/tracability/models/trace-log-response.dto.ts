export interface TraceLogResponseDTO {
  id: number;
  userId: string;
  username: string;
  serviceName: string;
  method: string;
  endpoint: string;
  ipAddress: string;
  statusCode: number;
  result: string;
  latency: number;
  timestamp: string;
}