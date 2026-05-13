
export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-white/10 rounded-3xl bg-slate-900/30">
      <div className="w-16 h-16 rounded-2xl bg-sky-500/10 flex items-center justify-center mb-4 text-sky-400">
        {Icon && <Icon size={32} strokeWidth={1.5} />}
      </div>
      <h3 className="text-lg font-bold text-slate-100 mb-2">{title}</h3>
      <p className="text-sm text-slate-400 max-w-sm mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  )
}
