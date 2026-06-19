export function dispenseBadge(mode) {
  const m = (mode || '').toLowerCase();
  if (m.includes('controlled') || m.includes('narcotic'))
    return { label: 'Controlled', cls: 'badge-controlled' };
  if (m.includes('counter') || m.includes('otc'))
    return { label: 'OTC', cls: 'badge-otc' };
  if (m.includes('prescription'))
    return { label: 'Rx Only', cls: 'badge-rx' };
  return { label: mode || '—', cls: 'badge-default' };
}
