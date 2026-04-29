export function Spinner({ size = 'md' }) {
  const s = { sm: 'h-4 w-4', md: 'h-6 w-6', lg: 'h-10 w-10' }[size]
  return (
    <div className={`${s} animate-spin rounded-full border-2 border-slate-600 border-t-sky-500`} />
  )
}

export default Spinner
