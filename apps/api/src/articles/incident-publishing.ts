import type { IncidentDetailsDto } from './dto/incident-details.dto';

export function incidentPublishError(details?: IncidentDetailsDto, canApproveExceptions = false): string | null {
  if (!details || !details.events?.length) return 'A published incident needs at least one sourced timeline event';
  if (
    !details.organization?.trim() || !details.domain || !details.failureMode || !details.severity ||
    !details.detection?.trim() || !details.recovery?.trim() || !details.lessons?.trim()
  ) return 'Complete the organization, taxonomy, detection, recovery, and lessons fields before publishing';
  if (details.startedAt && details.endedAt && new Date(details.startedAt) > new Date(details.endedAt)) {
    return 'Incident end date must be after its start date';
  }
  const orderValues = new Set<number>();
  for (const event of details.events) {
    if (orderValues.has(event.order)) return 'Timeline event order values must be unique';
    orderValues.add(event.order);
    if (!event.summary?.trim() || !event.dateLabel?.trim()) return 'Every timeline event needs a summary and a date label';
    if (event.timezone) {
      try {
        new Intl.DateTimeFormat('en', { timeZone: event.timezone });
      } catch {
        return 'Timeline event time zones must be valid IANA time zone names';
      }
    }
    if (!event.sources?.length) return 'Every timeline event needs at least one source';
    for (const source of event.sources) {
      if (source.sourceType === 'APPROVED_EXCEPTION' && !canApproveExceptions) {
        return 'Only an editor or administrator can approve historical source exceptions';
      }
      if (source.sourceType === 'APPROVED_EXCEPTION' && !source.exceptionReason?.trim()) {
        return 'Approved source exceptions need an editor review reason';
      }
    }
  }
  return null;
}
