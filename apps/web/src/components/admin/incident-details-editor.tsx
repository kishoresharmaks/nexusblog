'use client';

import { IncidentDetailsInput, INCIDENT_DOMAINS, INCIDENT_DOMAIN_LABELS, INCIDENT_FAILURE_MODES, INCIDENT_FAILURE_LABELS, INCIDENT_IMPACTS, INCIDENT_IMPACT_LABELS, INCIDENT_SEVERITIES, INCIDENT_SEVERITY_LABELS, INCIDENT_SEVERITY_DESCRIPTIONS } from '@nexus/types';

export function emptyIncidentDetails(): IncidentDetailsInput {
  return {
    organization: '',
    domain: 'SOFTWARE_INFRASTRUCTURE',
    failureMode: 'SOFTWARE_DEFECT',
    severity: 'MODERATE',
    impacts: [],
    datePrecision: 'UNKNOWN',
    detection: '',
    recovery: '',
    lessons: '',
    events: [],
  };
}

const inputClass = 'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground';
const labelClass = 'mb-1 block text-xs font-semibold text-muted-foreground';

export function IncidentDetailsEditor({
  value,
  onChange,
  isPublished,
}: {
  value: IncidentDetailsInput;
  onChange: (value: IncidentDetailsInput) => void;
  isPublished: boolean;
}) {
  const update = (changes: Partial<IncidentDetailsInput>) => onChange({ ...value, ...changes });
  const updateEvent = (index: number, changes: Partial<IncidentDetailsInput['events'][number]>) => {
    update({ events: value.events.map((event, i) => i === index ? { ...event, ...changes } : event) });
  };

  return (
    <section className="space-y-5 rounded-xl border border-rose-500/30 bg-rose-500/5 p-4">
      <div>
        <h3 className="font-semibold text-foreground">Production incident details</h3>
        <p className="mt-1 text-xs text-muted-foreground">Timeline entries are factual claims and need sources before publication. Use official postmortems, regulator reports, court filings, or official status pages. Historical exceptions require editor approval and a reason. Put interpretation in the separately labeled Analysis body.</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <label><span className={labelClass}>Organization / system</span><input className={inputClass} value={value.organization} onChange={(e) => update({ organization: e.target.value })} /></label>
        <label><span className={labelClass}>Engineering domain</span><select className={inputClass} value={value.domain} onChange={(e) => update({ domain: e.target.value as IncidentDetailsInput['domain'] })}>{INCIDENT_DOMAINS.map((item) => <option key={item} value={item}>{INCIDENT_DOMAIN_LABELS[item]}</option>)}</select></label>
        <label><span className={labelClass}>Failure mode</span><select className={inputClass} value={value.failureMode} onChange={(e) => update({ failureMode: e.target.value as IncidentDetailsInput['failureMode'] })}>{INCIDENT_FAILURE_MODES.map((item) => <option key={item} value={item}>{INCIDENT_FAILURE_LABELS[item]}</option>)}</select></label>
        <label><span className={labelClass}>Severity</span><select className={inputClass} value={value.severity} onChange={(e) => update({ severity: e.target.value as IncidentDetailsInput['severity'] })}>{INCIDENT_SEVERITIES.map((item) => <option key={item} value={item}>{INCIDENT_SEVERITY_LABELS[item]}</option>)}</select><span className="mt-1 block text-xs text-muted-foreground">{INCIDENT_SEVERITY_DESCRIPTIONS[value.severity]}</span></label>
      </div>

      <fieldset>
        <legend className={labelClass}>Impacts (select all that apply)</legend>
        <div className="flex flex-wrap gap-x-4 gap-y-2">{INCIDENT_IMPACTS.map((item) => <label key={item} className="flex items-center gap-2 text-xs text-foreground"><input type="checkbox" checked={value.impacts.includes(item)} onChange={(e) => update({ impacts: e.target.checked ? [...value.impacts, item] : value.impacts.filter((impact) => impact !== item) })} />{INCIDENT_IMPACT_LABELS[item]}</label>)}</div>
      </fieldset>

      <div className="grid gap-3 sm:grid-cols-2">
        <label><span className={labelClass}>Incident began (date, if known)</span><input type="date" className={inputClass} value={value.startedAt?.slice(0, 10) || ''} onChange={(e) => update({ startedAt: e.target.value ? `${e.target.value}T00:00:00.000Z` : null })} /></label>
        <label><span className={labelClass}>Incident ended (date, if known)</span><input type="date" className={inputClass} value={value.endedAt?.slice(0, 10) || ''} onChange={(e) => update({ endedAt: e.target.value ? `${e.target.value}T00:00:00.000Z` : null })} /></label>
      </div>
      <label><span className={labelClass}>Incident date precision</span><select className={inputClass} value={value.datePrecision} onChange={(e) => update({ datePrecision: e.target.value as IncidentDetailsInput['datePrecision'] })}><option value="EXACT">Exact time known</option><option value="DAY">Day known</option><option value="MONTH">Month known</option><option value="YEAR">Year known</option><option value="UNKNOWN">Unknown</option></select></label>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="sm:col-span-1"><span className={labelClass}>Detection</span><textarea rows={3} className={inputClass} value={value.detection} onChange={(e) => update({ detection: e.target.value })} /></label>
        <label className="sm:col-span-1"><span className={labelClass}>Recovery</span><textarea rows={3} className={inputClass} value={value.recovery} onChange={(e) => update({ recovery: e.target.value })} /></label>
        <label className="sm:col-span-1"><span className={labelClass}>Lessons afterward</span><textarea rows={3} className={inputClass} value={value.lessons} onChange={(e) => update({ lessons: e.target.value })} /></label>
      </div>

      {isPublished && <label><span className={labelClass}>What changed in this published revision? (required)</span><input className={inputClass} value={value.changeNote || ''} onChange={(e) => update({ changeNote: e.target.value })} /></label>}

      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3"><h4 className="text-sm font-semibold text-foreground">Sourced timeline</h4><button type="button" onClick={() => update({ events: [...value.events, { order: value.events.length, dateLabel: '', precision: 'UNKNOWN', summary: '', sources: [] }] })} className="rounded-md border border-border px-3 py-1.5 text-xs font-semibold">Add event</button></div>
        {value.events.map((event, index) => (
          <div key={index} className="space-y-3 rounded-lg border border-border bg-background/60 p-3">
            <div className="flex items-center justify-between"><span className="text-xs font-semibold text-foreground">Event {index + 1}</span><button type="button" onClick={() => update({ events: value.events.filter((_, i) => i !== index).map((item, i) => ({ ...item, order: i })) })} className="text-xs text-destructive">Remove</button></div>
            <div className="grid gap-3 sm:grid-cols-2">
              <label><span className={labelClass}>Date label shown to readers</span><input className={inputClass} placeholder="e.g. 14:32 UTC, 12 May 2024, or Date unknown" value={event.dateLabel} onChange={(e) => updateEvent(index, { dateLabel: e.target.value })} /></label>
              <label><span className={labelClass}>ISO timestamp with offset (for sorting)</span><input className={inputClass} placeholder="2024-05-12T14:32:00Z" value={event.occurredAt || ''} onChange={(e) => updateEvent(index, { occurredAt: e.target.value || null })} /></label>
              <label><span className={labelClass}>Time zone label</span><input className={inputClass} placeholder="UTC or America/Los_Angeles" value={event.timezone || ''} onChange={(e) => updateEvent(index, { timezone: e.target.value })} /></label>
              <label><span className={labelClass}>Date precision</span><select className={inputClass} value={event.precision} onChange={(e) => updateEvent(index, { precision: e.target.value as IncidentDetailsInput['events'][number]['precision'] })}><option value="EXACT">Exact timestamp</option><option value="DAY">Day</option><option value="MONTH">Month</option><option value="YEAR">Year</option><option value="UNKNOWN">Unknown</option></select></label>
            </div>
            <label><span className={labelClass}>Factual event</span><textarea rows={2} className={inputClass} value={event.summary} onChange={(e) => updateEvent(index, { summary: e.target.value })} /></label>
            <div className="space-y-2">
              {event.sources.map((source, sourceIndex) => (
                <div key={sourceIndex} className="grid gap-2 rounded-md bg-muted/30 p-2 sm:grid-cols-2">
                  <label><span className={labelClass}>Source URL (HTTPS)</span><input className={inputClass} value={source.url} onChange={(e) => updateEvent(index, { sources: event.sources.map((item, i) => i === sourceIndex ? { ...item, url: e.target.value } : item) })} /></label>
                  <label><span className={labelClass}>Publisher</span><input className={inputClass} value={source.publisher} onChange={(e) => updateEvent(index, { sources: event.sources.map((item, i) => i === sourceIndex ? { ...item, publisher: e.target.value } : item) })} /></label>
                  <label><span className={labelClass}>Publication date</span><input type="date" className={inputClass} value={source.publishedAt?.slice(0, 10) || ''} onChange={(e) => updateEvent(index, { sources: event.sources.map((item, i) => i === sourceIndex ? { ...item, publishedAt: e.target.value || null } : item) })} /></label>
                  <label><span className={labelClass}>Evidence type</span><select className={inputClass} value={source.sourceType} onChange={(e) => updateEvent(index, { sources: event.sources.map((item, i) => i === sourceIndex ? { ...item, sourceType: e.target.value as 'PRIMARY' | 'APPROVED_EXCEPTION' } : item) })}><option value="PRIMARY">Primary source</option><option value="APPROVED_EXCEPTION">Approved historical exception</option></select></label>
                  {source.sourceType === 'APPROVED_EXCEPTION' && <label className="sm:col-span-2"><span className={labelClass}>Editor approval rationale</span><textarea rows={2} className={inputClass} value={source.exceptionReason || ''} onChange={(e) => updateEvent(index, { sources: event.sources.map((item, i) => i === sourceIndex ? { ...item, exceptionReason: e.target.value } : item) })} /></label>}
                  <button type="button" onClick={() => updateEvent(index, { sources: event.sources.filter((_, i) => i !== sourceIndex) })} className="text-left text-xs text-destructive">Remove source</button>
                </div>
              ))}
              <button type="button" onClick={() => updateEvent(index, { sources: [...event.sources, { url: '', publisher: '', sourceType: 'PRIMARY' }] })} className="text-xs font-semibold text-primary">Add source</button>
            </div>
          </div>
        ))}
        {!value.events.length && <p className="rounded-lg border border-dashed border-border p-4 text-xs text-muted-foreground">Add timeline events as research progresses. Publication requires at least one fully sourced event.</p>}
      </div>
    </section>
  );
}
