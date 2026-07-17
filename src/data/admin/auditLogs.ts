import { AuditLog } from "@/types/admin/audit";

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  {
    id: "log-1",
    action: "Event Created",
    details: "Created draft for National Coding Hackathon 2026",
    timestamp: "2026-06-25T14:30:00Z",
    user: "Demo Organizer"
  }
];

export function logAdminAction(action: string, details: string, user: string = "Demo Organizer") {
  const newLog: AuditLog = {
    id: `log-${Math.random().toString(36).substr(2, 9)}`,
    action,
    details,
    timestamp: new Date().toISOString(),
    user
  };
  MOCK_AUDIT_LOGS.unshift(newLog);
}

export function getAuditLogs() {
  return MOCK_AUDIT_LOGS;
}
