export const INCIDENT_DOMAINS = [
  'SOFTWARE_INFRASTRUCTURE',
  'HARDWARE',
  'CIVIL_STRUCTURAL',
  'AEROSPACE_TRANSPORTATION',
  'INDUSTRIAL_ENERGY',
  'OTHER',
] as const;

export const INCIDENT_FAILURE_MODES = [
  'DESIGN_FLAW',
  'COMPONENT_FAILURE',
  'SOFTWARE_DEFECT',
  'CAPACITY_OVERLOAD',
  'HUMAN_PROCESS',
  'EXTERNAL_DEPENDENCY',
  'ENVIRONMENTAL_EVENT',
  'SECURITY_INCIDENT',
  'OTHER',
] as const;

export const INCIDENT_SEVERITIES = ['LOW', 'MODERATE', 'MAJOR', 'CRITICAL'] as const;
export const INCIDENT_IMPACTS = [
  'SAFETY',
  'AVAILABILITY',
  'FINANCIAL',
  'DATA_INTEGRITY',
  'PRIVACY',
  'ENVIRONMENTAL',
] as const;

export const INCIDENT_DOMAIN_LABELS: Record<(typeof INCIDENT_DOMAINS)[number], string> = {
  SOFTWARE_INFRASTRUCTURE: 'Software & infrastructure',
  HARDWARE: 'Hardware',
  CIVIL_STRUCTURAL: 'Civil & structural',
  AEROSPACE_TRANSPORTATION: 'Aerospace & transportation',
  INDUSTRIAL_ENERGY: 'Industrial & energy',
  OTHER: 'Other engineering',
};

export const INCIDENT_FAILURE_LABELS: Record<(typeof INCIDENT_FAILURE_MODES)[number], string> = {
  DESIGN_FLAW: 'Design flaw',
  COMPONENT_FAILURE: 'Component failure',
  SOFTWARE_DEFECT: 'Software defect',
  CAPACITY_OVERLOAD: 'Capacity overload',
  HUMAN_PROCESS: 'Human or process failure',
  EXTERNAL_DEPENDENCY: 'External dependency',
  ENVIRONMENTAL_EVENT: 'Environmental event',
  SECURITY_INCIDENT: 'Security incident',
  OTHER: 'Other failure mode',
};

export const INCIDENT_SEVERITY_LABELS: Record<(typeof INCIDENT_SEVERITIES)[number], string> = {
  LOW: 'Low',
  MODERATE: 'Moderate',
  MAJOR: 'Major',
  CRITICAL: 'Critical',
};

export const INCIDENT_SEVERITY_DESCRIPTIONS: Record<(typeof INCIDENT_SEVERITIES)[number], string> = {
  LOW: 'Contained or localized issue with limited operational impact.',
  MODERATE: 'Noticeable but bounded service or operational disruption.',
  MAJOR: 'Broad or prolonged outage, or significant impact across systems.',
  CRITICAL: 'Safety risk or severe, widespread harm or operational loss.',
};

export const INCIDENT_IMPACT_LABELS: Record<(typeof INCIDENT_IMPACTS)[number], string> = {
  SAFETY: 'Safety',
  AVAILABILITY: 'Availability',
  FINANCIAL: 'Financial',
  DATA_INTEGRITY: 'Data integrity',
  PRIVACY: 'Privacy',
  ENVIRONMENTAL: 'Environmental',
};

export type IncidentDatePrecision = 'EXACT' | 'DAY' | 'MONTH' | 'YEAR' | 'UNKNOWN';
export type IncidentSourceType = 'PRIMARY' | 'APPROVED_EXCEPTION';

export interface IncidentSourceInput {
  url: string;
  publisher: string;
  publishedAt?: string | null;
  sourceType: IncidentSourceType;
  exceptionReason?: string | null;
}

export interface IncidentEventInput {
  order: number;
  occurredAt?: string | null;
  dateLabel: string;
  timezone?: string | null;
  precision: IncidentDatePrecision;
  summary: string;
  sources: IncidentSourceInput[];
}

export interface IncidentDetailsInput {
  organization: string;
  domain: (typeof INCIDENT_DOMAINS)[number];
  failureMode: (typeof INCIDENT_FAILURE_MODES)[number];
  severity: (typeof INCIDENT_SEVERITIES)[number];
  impacts: (typeof INCIDENT_IMPACTS)[number][];
  startedAt?: string | null;
  endedAt?: string | null;
  datePrecision: IncidentDatePrecision;
  detection: string;
  recovery: string;
  lessons: string;
  events: IncidentEventInput[];
  changeNote?: string;
}
