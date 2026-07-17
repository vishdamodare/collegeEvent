export interface AuditLog {
  id: string;
  action: string;
  details: string;
  timestamp: string;
  user: string;
  ipAddress?: string;
}
