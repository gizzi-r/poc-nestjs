import Audit from "../utils/audit";


export interface Auditable {
  getAudit(): Audit;
  setAudit(audit: Audit): void;
}

export function isAuditable(object: any): object is Auditable {
  return "getAudit" in object;
}
