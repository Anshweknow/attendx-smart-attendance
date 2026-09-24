export const date = (value) => value ? new Intl.DateTimeFormat(undefined, { dateStyle: 'medium' }).format(new Date(value)) : '—';
export const percent = (value) => value === null || value === undefined ? '—' : `${Number(value).toFixed(2)}%`;
export const label = (item, key = 'name') => item?.[key] || 'Unassigned';
