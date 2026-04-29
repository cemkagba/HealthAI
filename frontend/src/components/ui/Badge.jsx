const STATUS = {
  draft:              'bg-zinc-700/80 text-zinc-300 border border-zinc-600',
  active:             'bg-emerald-900/50 text-emerald-300 border border-emerald-700/60',
  meeting_scheduled:  'bg-blue-900/50 text-blue-300 border border-blue-700/60',
  partner_found:      'bg-purple-900/50 text-purple-300 border border-purple-700/60',
  expired:            'bg-slate-800 text-slate-500 border border-slate-600',
}
const ROLE = {
  admin:                   'bg-amber-900/50 text-amber-300 border border-amber-700/60',
  engineer:                'bg-sky-900/50 text-sky-300 border border-sky-700/60',
  healthcare_professional: 'bg-teal-900/50 text-teal-300 border border-teal-700/60',
}

export function StatusBadge({ status }) {
  const label = status.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS[status] || STATUS.draft}`}>{label}</span>
}

export function RoleBadge({ role }) {
  const label = role === 'healthcare_professional' ? 'Healthcare Pro' : role.charAt(0).toUpperCase() + role.slice(1)
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${ROLE[role] || ROLE.engineer}`}>{label}</span>
}

export function DomainBadge({ domain }) {
  return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-900/50 text-indigo-300 border border-indigo-700/60">{domain}</span>
}
