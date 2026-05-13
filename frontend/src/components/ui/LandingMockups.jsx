/* ── Inline UI Mockups for Landing page ── */

/** Dashboard Mockup */
export function DashboardMockup() {
  const posts = [
    { title: 'AI-Powered ECG Anomaly Detection', domain: 'Cardiology', exp: 'Machine Learning', city: 'Ankara', days: 28, color: 'emerald' },
    { title: 'NLP-Based Clinical Note Summarization', domain: 'Health Informatics', exp: 'NLP', city: 'Istanbul', days: 42, color: 'emerald' },
    { title: 'Federated Learning for MRI Segmentation', domain: 'Radiology', exp: 'Federated Learning', city: 'Izmir', days: 4, color: 'rose' },
  ]
  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden text-[10px] select-none pointer-events-none">
      {/* Top bar */}
      <div className="bg-slate-800/80 border-b border-white/5 px-3 py-2 flex items-center justify-between">
        <span className="text-slate-300 font-semibold text-[11px]">Dashboard</span>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 rounded-full bg-slate-700 flex items-center justify-center">
            <div className="w-1.5 h-1.5 rounded-full bg-rose-500" />
          </div>
          <div className="w-5 h-5 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600" />
        </div>
      </div>
      {/* Hero banner */}
      <div className="mx-3 mt-3 bg-gradient-to-r from-sky-900/60 to-indigo-900/40 border border-sky-500/20 rounded-xl px-4 py-3">
        <div className="text-slate-200 font-bold text-[11px]">Welcome back, Cem 👋</div>
        <div className="text-sky-300/70 text-[9px] mt-0.5">Discover active research collaborations</div>
      </div>
      {/* Filter bar */}
      <div className="mx-3 mt-2 bg-slate-800/40 border border-white/5 rounded-xl px-3 py-2 flex gap-2">
        {['All Domains','All Expertise','City'].map((p,i) => (
          <div key={i} className="flex-1 h-5 bg-slate-800 rounded-lg border border-white/5 px-2 flex items-center">
            <span className="text-slate-600">{p}</span>
          </div>
        ))}
        <div className="h-5 w-10 bg-sky-600/80 rounded-lg flex items-center justify-center">
          <span className="text-white text-[9px] font-semibold">Go</span>
        </div>
      </div>
      {/* Post cards */}
      <div className="px-3 py-2 space-y-2 pb-3">
        {posts.map((p, i) => (
          <div key={i} className="bg-slate-800/50 border border-white/5 rounded-xl p-3 hover:border-sky-500/30 transition-colors">
            <div className="flex items-start justify-between">
              <span className="text-slate-200 font-semibold leading-tight" style={{fontSize:'10px'}}>{p.title}</span>
              <span className="ml-2 px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[8px] font-bold whitespace-nowrap">Active</span>
            </div>
            <div className="flex gap-1 mt-1.5 flex-wrap">
              <span className="px-1.5 py-0.5 bg-sky-500/15 text-sky-400 rounded text-[8px] border border-sky-500/20">{p.domain}</span>
              <span className="px-1.5 py-0.5 bg-slate-700 text-slate-300 rounded text-[8px] border border-slate-600">{p.exp}</span>
            </div>
            {/* Expiry bar */}
            <div className={`mt-2 flex items-center gap-1.5 px-2 py-1 rounded-lg ${p.color === 'rose' ? 'bg-rose-500/10' : 'bg-emerald-500/10'}`}>
              <div className={`w-1.5 h-1.5 rounded-full ${p.color === 'rose' ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
              <span className={`text-[8px] font-semibold ${p.color === 'rose' ? 'text-rose-400' : 'text-emerald-400'}`}>{p.days}d left</span>
              <div className="flex-1 h-0.5 bg-slate-700 rounded-full overflow-hidden ml-1">
                <div className={`h-full rounded-full ${p.color === 'rose' ? 'bg-rose-500' : 'bg-emerald-500'}`} style={{width: `${(p.days/90)*100}%`}} />
              </div>
            </div>
            <div className="flex justify-between mt-1.5 text-[8px] text-slate-600">
              <span>📍 {p.city}</span><span>Dr. Selin Samray · Çankaya Uni.</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

/** Collaboration Feed Mockup */
export function CollaborationMockup() {
  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden text-[10px] select-none pointer-events-none">
      <div className="bg-slate-800/80 border-b border-white/5 px-3 py-2">
        <span className="text-slate-300 font-semibold text-[11px]">Post Detail</span>
      </div>
      <div className="p-3 space-y-3">
        {/* Post header */}
        <div className="bg-slate-800/50 border border-white/5 rounded-xl p-3">
          <div className="flex items-start justify-between gap-2">
            <span className="text-slate-100 font-bold" style={{fontSize:'11px'}}>AI-Powered ECG Anomaly Detection</span>
            <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[8px] font-bold whitespace-nowrap">Active</span>
          </div>
          <div className="flex gap-1.5 mt-2 flex-wrap">
            <span className="px-2 py-0.5 bg-sky-500/15 text-sky-400 rounded-full text-[8px] border border-sky-500/20">Cardiology</span>
            <span className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded-full text-[8px]">Machine Learning</span>
            <span className="px-2 py-0.5 bg-slate-700 text-slate-300 rounded-full text-[8px]">📍 Ankara</span>
          </div>
          <div className="mt-2 flex items-center gap-2 px-2 py-1.5 bg-emerald-500/10 rounded-lg">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-emerald-400 text-[8px] font-semibold">28 days left</span>
            <div className="flex-1 h-0.5 bg-slate-700 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{width:'31%'}} />
            </div>
          </div>
          <p className="text-slate-400 mt-2 leading-relaxed" style={{fontSize:'8.5px'}}>
            We are developing an AI model capable of detecting rare cardiac arrhythmias from 12-lead ECG data. Looking for an ML engineer with time-series experience...
          </p>
          <div className="flex items-center gap-2 mt-2 pt-2 border-t border-white/5">
            <div className="w-5 h-5 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-[7px] font-bold text-white">S</div>
            <span className="text-slate-500 text-[8px]">Dr. Selin Samray · Çankaya University</span>
          </div>
        </div>
        {/* NDA + Request */}
        <div className="bg-slate-800/50 border border-sky-500/20 rounded-xl p-3">
          <span className="text-sky-400 font-semibold" style={{fontSize:'10px'}}>Send Meeting Request</span>
          <div className="mt-2 space-y-2">
            <div className="h-5 bg-slate-800 rounded-lg border border-white/5" />
            <div className="h-5 bg-slate-800 rounded-lg border border-white/5" />
            <div className="flex items-center gap-2 mt-1">
              <div className="w-3.5 h-3.5 rounded bg-sky-600 flex items-center justify-center">
                <span className="text-white" style={{fontSize:'8px'}}>✓</span>
              </div>
              <span className="text-slate-400" style={{fontSize:'8px'}}>I accept the NDA terms</span>
            </div>
            <div className="h-6 bg-gradient-to-r from-sky-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-semibold" style={{fontSize:'9px'}}>Send Request →</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** Meeting Scheduler Mockup */
export function MeetingsMockup() {
  const meetings = [
    { title: 'ECG Anomaly Detection', requester: 'Cem Kağba', status: 'pending', slot: '15 May 2026, 14:00', color: 'amber' },
    { title: 'NLP Note Summarization', requester: 'Ahmet Yıldız', status: 'accepted', slot: '20 May 2026, 10:00', color: 'emerald' },
    { title: 'MRI Segmentation', requester: 'Zeynep Demir', status: 'pending', slot: '18 May 2026, 16:00', color: 'amber' },
  ]
  const statusColors = { pending: 'bg-amber-500/20 text-amber-400', accepted: 'bg-emerald-500/20 text-emerald-400', rejected: 'bg-rose-500/20 text-rose-400' }
  return (
    <div className="bg-slate-900 rounded-xl overflow-hidden text-[10px] select-none pointer-events-none">
      <div className="bg-slate-800/80 border-b border-white/5 px-3 py-2">
        <span className="text-slate-300 font-semibold text-[11px]">Meeting Requests</span>
      </div>
      <div className="p-3 space-y-2">
        {meetings.map((m,i) => (
          <div key={i} className="bg-slate-800/50 border border-white/5 rounded-xl p-3">
            <div className="flex items-start justify-between gap-2">
              <span className="text-slate-200 font-semibold leading-tight" style={{fontSize:'10px'}}>{m.title}</span>
              <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold whitespace-nowrap ${statusColors[m.status]}`}>
                {m.status}
              </span>
            </div>
            <div className="flex items-center gap-2 mt-1.5 text-[8px] text-slate-500">
              <div className="w-4 h-4 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-[6px] font-bold text-white">
                {m.requester[0]}
              </div>
              <span>{m.requester}</span>
            </div>
            <div className="mt-1.5 flex items-center gap-1.5 text-[8px] text-slate-400">
              <span>🗓</span><span>{m.slot}</span>
            </div>
            {m.status === 'pending' && (
              <div className="flex gap-1.5 mt-2">
                <div className="flex-1 h-5 bg-emerald-600/70 rounded-lg flex items-center justify-center">
                  <span className="text-white text-[8px] font-semibold">Accept</span>
                </div>
                <div className="flex-1 h-5 bg-slate-700 rounded-lg flex items-center justify-center">
                  <span className="text-slate-400 text-[8px]">Decline</span>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
