import { Link } from 'react-router-dom'
import { HeartPulse, Users, Calendar, FileText, Shield, Zap, ChevronRight, Star, ArrowRight, Sparkles, Activity, Brain } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { DashboardMockup, CollaborationMockup, MeetingsMockup } from '../components/ui/LandingMockups'

/* ── Scroll-triggered fade-in hook ── */
function useReveal() {
  const ref = useRef(null)
  const [visible, setVisible] = useState(false)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect() } }, { threshold: 0.15 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])
  return [ref, visible]
}

function Reveal({ children, className = '', delay = 0 }) {
  const [ref, visible] = useReveal()
  return (
    <div ref={ref} className={`transition-all duration-700 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`} style={{ transitionDelay: `${delay}ms` }}>
      {children}
    </div>
  )
}

/* ── Animated counter ── */
function Counter({ end, suffix = '' }) {
  const [val, setVal] = useState(0)
  const [ref, visible] = useReveal()
  useEffect(() => {
    if (!visible) return
    let start = 0; const step = Math.ceil(end / 40)
    const id = setInterval(() => { start += step; if (start >= end) { setVal(end); clearInterval(id) } else setVal(start) }, 30)
    return () => clearInterval(id)
  }, [visible, end])
  return <span ref={ref}>{val.toLocaleString()}{suffix}</span>
}

/* ── Data ── */
const FEATURES = [
  { icon: FileText, title: 'Co-Create Posts', desc: 'Share research ideas, clinical insights, and AI proposals with the community.' },
  { icon: Calendar, title: 'Schedule Meetings', desc: 'Book one-on-one sessions with experts across disciplines.' },
  { icon: Shield, title: 'Privacy First', desc: 'No patient data, no file uploads — designed for safe academic collaboration.' },
  { icon: Brain, title: 'AI-Powered Matching', desc: 'Smart algorithms connect you with the right collaborators.' },
  { icon: Users, title: 'Role-Based Access', desc: 'Engineers, healthcare pros, and admins — each with tailored views.' },
  { icon: Zap, title: 'Real-Time Updates', desc: 'Instant notifications on meeting requests and new posts.' },
]

const STEPS = [
  { num: '01', title: 'Create Account', desc: 'Sign up with your academic email (.edu / .edu.tr) and pick your role.' },
  { num: '02', title: 'Explore & Connect', desc: 'Browse innovative posts and discover like-minded professionals.' },
  { num: '03', title: 'Collaborate', desc: 'Schedule meetings, share insights, and co-create health AI solutions.' },
]

const REVIEWS = [
  { name: 'Dr. Ayşe Kaya', role: 'Cardiologist, Hacettepe Uni.', text: 'HEALTH AI transformed how I collaborate with engineers. We shipped an ECG anomaly detector in 3 months!', stars: 5, avatar: 'AK' },
  { name: 'Mehmet Çelik', role: 'ML Engineer, METU', text: 'The meeting scheduler alone saved me hours of email back-and-forth. Clean UI, zero learning curve.', stars: 5, avatar: 'MÇ' },
  { name: 'Prof. Sarah Thompson', role: 'Biomedical Eng., Bilkent', text: 'Finally a platform that respects patient privacy while enabling real innovation. Highly recommended!', stars: 5, avatar: 'ST' },
  { name: 'Dr. Emre Yılmaz', role: 'Radiologist, Ankara Uni.', text: 'I found three amazing collaborators within my first week. The matching algorithm is impressively accurate.', stars: 4, avatar: 'EY' },
]

const STATS = [
  { value: 1200, suffix: '+', label: 'Researchers' },
  { value: 340, suffix: '+', label: 'Active Projects' },
  { value: 50, suffix: '+', label: 'Universities' },
  { value: 98, suffix: '%', label: 'Satisfaction' },
]

const MOCKUP_TABS = [
  { label: 'Analytics Dashboard', component: DashboardMockup },
  { label: 'Collaboration Feed',  component: CollaborationMockup },
  { label: 'Meeting Scheduler',   component: MeetingsMockup },
]

export default function Landing() {
  const [activeShot, setActiveShot] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setActiveShot(p => (p + 1) % MOCKUP_TABS.length), 4000)
    return () => clearInterval(id)
  }, [])

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 overflow-x-hidden">
      {/* ─── NAVBAR ─── */}
      <nav className="fixed top-0 inset-x-0 z-50 bg-slate-950/70 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto flex items-center justify-between px-6 py-4">
          <Link to="/" className="flex items-center gap-3 group" id="landing-logo">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-400 to-indigo-600 flex items-center justify-center shadow-lg shadow-sky-500/20 border border-white/10 group-hover:scale-105 transition-transform">
              <HeartPulse size={22} className="text-white" />
            </div>
            <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">HEALTH AI</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link to="/login" className="px-5 py-2.5 text-sm font-semibold text-slate-300 hover:text-white transition-colors rounded-xl hover:bg-white/5" id="landing-login-btn">
              Sign In
            </Link>
            <Link to="/register" className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-sky-500 to-indigo-600 rounded-xl shadow-lg shadow-sky-500/20 hover:shadow-sky-500/40 hover:from-sky-400 hover:to-indigo-500 transition-all active:scale-95 border border-sky-400/20" id="landing-signup-btn">
              Sign Up Free
            </Link>
          </div>
        </div>
      </nav>

      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-20 lg:pt-44 lg:pb-32 px-6">
        {/* BG glows */}
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[60%] bg-sky-600/15 rounded-full blur-[160px] animate-pulse-glow pointer-events-none" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[60%] bg-indigo-600/15 rounded-full blur-[160px] animate-pulse-glow pointer-events-none" style={{ animationDelay: '1s' }} />
        <div className="absolute top-[30%] left-[50%] w-[30%] h-[30%] bg-violet-600/10 rounded-full blur-[120px] animate-pulse-glow pointer-events-none" style={{ animationDelay: '2s' }} />

        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            {/* Left text */}
            <div className="flex-1 text-center lg:text-left">
              <Reveal>
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-semibold tracking-wide uppercase mb-6">
                  <Sparkles size={14} /> Now in Beta — Join Free
                </div>
              </Reveal>
              <Reveal delay={100}>
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tight">
                  Where <span className="bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-500 bg-clip-text text-transparent">Healthcare</span> Meets{' '}
                  <span className="bg-gradient-to-r from-indigo-400 via-violet-500 to-purple-500 bg-clip-text text-transparent">Innovation</span>
                </h1>
              </Reveal>
              <Reveal delay={200}>
                <p className="mt-6 text-lg text-slate-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                  The co-creation platform for healthcare professionals and engineers to collaborate on AI-powered medical solutions — securely and privately.
                </p>
              </Reveal>
              <Reveal delay={300}>
                <div className="mt-8 flex flex-wrap items-center gap-4 justify-center lg:justify-start">
                  <Link to="/register" className="group inline-flex items-center gap-2 px-7 py-3.5 text-base font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 rounded-2xl shadow-xl shadow-sky-500/25 hover:shadow-sky-500/40 hover:from-sky-400 hover:to-indigo-500 transition-all active:scale-95 border border-sky-400/20" id="hero-cta">
                    Get Started Free <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                  </Link>
                  <a href="#how-it-works" className="inline-flex items-center gap-2 px-7 py-3.5 text-base font-semibold text-slate-300 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/10 backdrop-blur-sm transition-all">
                    Learn More <ChevronRight size={16} />
                  </a>
                </div>
              </Reveal>
            </div>

            {/* Right — floating dashboard card */}
            <Reveal delay={400} className="flex-1 w-full max-w-xl">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-sky-500 via-indigo-500 to-violet-500 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity" />
                <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/40">
                  <DashboardMockup />
                </div>
                {/* floating badge */}
                <div className="absolute -bottom-4 -left-4 bg-slate-900/90 backdrop-blur-xl border border-white/10 rounded-2xl px-4 py-3 shadow-xl flex items-center gap-3 animate-float" style={{ animationDelay: '1s' }}>
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center"><Activity size={20} className="text-emerald-400" /></div>
                  <div><div className="text-xs text-slate-400">Active Collaborations</div><div className="text-lg font-bold text-emerald-400">+27%</div></div>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ─── STATS BAR ─── */}
      <section className="border-y border-white/5 bg-slate-900/30">
        <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 divide-x divide-white/5">
          {STATS.map((s, i) => (
            <div key={i} className="py-10 px-6 text-center">
              <div className="text-3xl lg:text-4xl font-extrabold bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">
                <Counter end={s.value} suffix={s.suffix} />
              </div>
              <div className="text-sm text-slate-500 mt-1 font-medium">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section className="py-24 px-6" id="features">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-sky-400 text-xs font-bold tracking-widest uppercase">Features</span>
              <h2 className="text-3xl lg:text-4xl font-extrabold mt-3 tracking-tight">Everything You Need to <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">Innovate</span></h2>
              <p className="mt-4 text-slate-400 max-w-2xl mx-auto">Built for researchers, doctors, and engineers who want to push the boundaries of healthcare technology together.</p>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className="group p-6 rounded-2xl bg-slate-900/40 border border-white/5 hover:border-sky-500/30 transition-all duration-300 hover:bg-slate-900/60 hover:shadow-xl hover:shadow-sky-500/5 h-full">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500/20 to-indigo-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform border border-sky-500/10">
                    <f.icon size={22} className="text-sky-400" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-100 mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-400 leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-24 px-6 bg-gradient-to-b from-slate-950 via-slate-900/50 to-slate-950" id="how-it-works">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-indigo-400 text-xs font-bold tracking-widest uppercase">How It Works</span>
              <h2 className="text-3xl lg:text-4xl font-extrabold mt-3 tracking-tight">Get Started in <span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">3 Simple Steps</span></h2>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* connector line */}
            <div className="hidden md:block absolute top-16 left-[16.6%] right-[16.6%] h-0.5 bg-gradient-to-r from-sky-500/30 via-indigo-500/30 to-violet-500/30" />
            {STEPS.map((s, i) => (
              <Reveal key={i} delay={i * 150}>
                <div className="relative text-center">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center mx-auto text-white font-extrabold text-lg shadow-xl shadow-sky-500/20 border border-white/10 relative z-10">{s.num}</div>
                  <h3 className="text-xl font-bold mt-6 mb-3 text-slate-100">{s.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed max-w-xs mx-auto">{s.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SCREENSHOTS ─── */}
      <section className="py-24 px-6" id="screenshots">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center mb-12">
              <span className="text-sky-400 text-xs font-bold tracking-widest uppercase">Platform Preview</span>
              <h2 className="text-3xl lg:text-4xl font-extrabold mt-3 tracking-tight">See It in <span className="bg-gradient-to-r from-sky-400 to-indigo-400 bg-clip-text text-transparent">Action</span></h2>
            </div>
          </Reveal>
          {/* Tabs */}
          <div className="flex justify-center gap-3 mb-10 flex-wrap">
            {MOCKUP_TABS.map((tab, i) => (
              <button key={i} onClick={() => setActiveShot(i)} className={`px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${i === activeShot ? 'bg-gradient-to-r from-sky-500 to-indigo-600 text-white shadow-lg shadow-sky-500/20' : 'bg-white/5 text-slate-400 hover:text-white hover:bg-white/10 border border-white/5'}`}>
                {tab.label}
              </button>
            ))}
          </div>
          <Reveal>
            <div className="relative max-w-3xl mx-auto group">
              <div className="absolute -inset-2 bg-gradient-to-r from-sky-500/20 via-indigo-500/20 to-violet-500/20 rounded-3xl blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/50">
                {MOCKUP_TABS.map((tab, i) => {
                  const C = tab.component
                  return (
                    <div key={i} className={`transition-all duration-700 ${i === activeShot ? 'opacity-100 scale-100' : 'opacity-0 scale-95 absolute inset-0 pointer-events-none'}`}>
                      <C />
                    </div>
                  )
                })}
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ─── REVIEWS ─── */}
      <section className="py-24 px-6 bg-gradient-to-b from-slate-950 via-slate-900/40 to-slate-950" id="reviews">
        <div className="max-w-7xl mx-auto">
          <Reveal>
            <div className="text-center mb-16">
              <span className="text-amber-400 text-xs font-bold tracking-widest uppercase">Testimonials</span>
              <h2 className="text-3xl lg:text-4xl font-extrabold mt-3 tracking-tight">Loved by <span className="bg-gradient-to-r from-amber-400 to-orange-400 bg-clip-text text-transparent">Professionals</span></h2>
            </div>
          </Reveal>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {REVIEWS.map((r, i) => (
              <Reveal key={i} delay={i * 100}>
                <div className="p-6 rounded-2xl bg-slate-900/50 border border-white/5 hover:border-amber-500/20 transition-all hover:shadow-xl hover:shadow-amber-500/5 h-full flex flex-col">
                  <div className="flex gap-1 mb-4">
                    {[...Array(5)].map((_, j) => <Star key={j} size={16} className={j < r.stars ? 'text-amber-400 fill-amber-400' : 'text-slate-700'} />)}
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed flex-1 italic">"{r.text}"</p>
                  <div className="flex items-center gap-3 mt-5 pt-5 border-t border-white/5">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-xs font-bold text-white">{r.avatar}</div>
                    <div>
                      <div className="text-sm font-semibold text-slate-100">{r.name}</div>
                      <div className="text-xs text-slate-500">{r.role}</div>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-24 px-6">
        <Reveal>
          <div className="max-w-4xl mx-auto relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-sky-500/20 via-indigo-500/20 to-violet-500/20 rounded-[2rem] blur-3xl opacity-50" />
            <div className="relative p-12 lg:p-16 rounded-3xl bg-slate-900/60 border border-white/5 backdrop-blur-xl text-center shadow-2xl">
              <div className="inline-flex w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-400 to-indigo-600 items-center justify-center text-white shadow-xl shadow-sky-500/20 mb-6 border border-white/10 animate-float">
                <HeartPulse size={32} />
              </div>
              <h2 className="text-3xl lg:text-4xl font-extrabold tracking-tight mb-4">Ready to Transform Healthcare?</h2>
              <p className="text-slate-400 max-w-xl mx-auto mb-8 text-lg">Join a growing network of researchers and professionals building the future of medicine with AI.</p>
              <Link to="/register" className="group inline-flex items-center gap-2 px-8 py-4 text-base font-bold text-white bg-gradient-to-r from-sky-500 to-indigo-600 rounded-2xl shadow-xl shadow-sky-500/25 hover:shadow-sky-500/40 hover:from-sky-400 hover:to-indigo-500 transition-all active:scale-95 border border-sky-400/20" id="cta-signup">
                Create Free Account <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </Reveal>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <HeartPulse size={16} className="text-sky-500" />
            <span>© 2026 HEALTH AI. All rights reserved.</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-600">
            <span className="hover:text-slate-400 cursor-pointer transition-colors">Privacy</span>
            <span className="hover:text-slate-400 cursor-pointer transition-colors">Terms</span>
            <span className="hover:text-slate-400 cursor-pointer transition-colors">Contact</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
