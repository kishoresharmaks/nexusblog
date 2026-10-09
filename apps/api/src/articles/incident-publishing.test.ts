import { describe, expect, it } from 'vitest';
import { incidentPublishError } from './incident-publishing';

const valid = {
  organization: 'Example Cloud',
  domain: 'SOFTWARE_INFRASTRUCTURE',
  failureMode: 'SOFTWARE_DEFECT',
  severity: 'MAJOR',
  impacts: ['AVAILABILITY'],
  datePrecision: 'DAY',
  detection: 'Monitoring alerts fired.',
  recovery: 'Traffic was rolled back.',
  lessons: 'Added a staged rollout guard.',
  events: [{
    order: 0,
    dateLabel: '12 May 2024',
    precision: 'DAY',
    summary: 'A deployment caused elevated errors.',
    sources: [{ url: 'https://status.example.com/postmortem', publisher: 'Example Cloud', sourceType: 'PRIMARY' }],
  }],
};

describe('incident publication evidence', () => {
  it('requires complete context, ordered dated claims, and a source for every event', () => {
    expect(incidentPublishError(valid as any)).toBeNull();
    expect(incidentPublishError()).toMatch(/at least one sourced timeline event/);
    expect(incidentPublishError({ ...valid, events: [{ ...valid.events[0], sources: [] }] } as any)).toMatch(/needs at least one source/);
    expect(incidentPublishError({ ...valid, events: [valid.events[0], valid.events[0]] } as any)).toMatch(/order values must be unique/);
    expect(incidentPublishError({ ...valid, events: [{ ...valid.events[0], timezone: 'not-a-time-zone' }] } as any)).toMatch(/valid IANA time zone/);
    const exception = { ...valid, events: [{ ...valid.events[0], sources: [{ url: 'https://old.example', publisher: 'Archive', sourceType: 'APPROVED_EXCEPTION', exceptionReason: 'No primary report survives.' }] }] };
    expect(incidentPublishError(exception as any)).toMatch(/Only an editor/);
    expect(incidentPublishError(exception as any, true)).toBeNull();
    expect(incidentPublishError({ ...exception, events: [{ ...exception.events[0], sources: [{ ...exception.events[0].sources[0], exceptionReason: '' }] }] } as any, true)).toMatch(/review reason/);
  });
});
