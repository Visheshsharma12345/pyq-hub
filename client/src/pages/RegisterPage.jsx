import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GraduationCap, Users, Shield, Eye, EyeOff, Sparkles, ArrowRight, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const ROLES = [
  { value:'student', label:'Student',  icon:GraduationCap, color:'from-blue-500 to-cyan-500',    desc:'Upload, browse & upvote' },
  { value:'faculty', label:'Faculty',  icon:Users,          color:'from-violet-500 to-purple-600', desc:'Verify & review flags' },
  { value:'admin',   label:'Admin',    icon:Shield,         color:'from-rose-500 to-pink-600',    desc:'Full access & admin' },
];

const FEATURES = [
  { emoji:'📚', text:'10,000+ notes and question papers' },
  { emoji:'🔍', text:'Smart filters by semester & subject' },
  { emoji:'✅', text:'Faculty-verified resources only' },
  { emoji:'🔒', text:'SHA-256 duplicate detection' },
  { emoji:'📱', text:'Works seamlessly on mobile' },
];

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name:'', email:'', password:'', role:'student' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState(0); // 0 = form, 1 = success

  function set(k,v){ setForm(f=>({...f,[k]:v})); }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if(form.password.length < 6){ setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      await register(form.name, form.email, form.password, form.role);
      setStep(1);
      setTimeout(()=> navigate('/'), 1200);
    } catch(err) {
      setError(err.response?.data?.error || 'Registration failed. Try again.');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex" style={{background:'#0d0d1a'}}>
      {/* ── Left panel ── */}
      <div className="hidden lg:flex lg:w-[55%] relative overflow-hidden flex-col justify-between p-12">
        {/* BG gradients */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#0d0d1a] via-[#130d2e] to-[#0a0a1f]" />
        <div className="absolute top-0 left-0 w-[500px] h-[500px] rounded-full blur-[120px] opacity-30"
             style={{background:'radial-gradient(circle, #7c5cfc, transparent)'}} />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full blur-[100px] opacity-20"
             style={{background:'radial-gradient(circle, #60a5fa, transparent)'}} />
        {/* Grid overlay */}
        <div className="absolute inset-0 bg-grid-dark opacity-100" />

        {/* Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
               style={{background:'linear-gradient(135deg,#7c5cfc,#6d3ff5)', boxShadow:'0 0 20px rgba(124,92,252,0.4)'}}>
            <BookOpen size={20} className="text-white" />
          </div>
          <span className="text-white font-bold text-lg">PYQ Hub</span>
        </div>

        {/* Hero content */}
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-6 text-xs font-semibold"
               style={{background:'rgba(124,92,252,0.15)', border:'1px solid rgba(124,92,252,0.3)', color:'#c4b5fd'}}>
            <Sparkles size={12} /> Department Study Hub
          </div>
          <h1 className="text-5xl font-bold leading-tight mb-4">
            <span className="text-white">Ace every</span><br/>
            <span className="text-gradient">semester exam</span>
          </h1>
          <p className="text-dark-300 text-lg mb-10 leading-relaxed max-w-sm">
            All your notes and previous year papers, organized, verified, and ready to access in seconds.
          </p>

          <div className="space-y-3">
            {FEATURES.map((f,i) => (
              <div key={i} className="flex items-center gap-3 glass rounded-2xl px-4 py-3 animate-fade-in-up"
                   style={{animationDelay:`${i*80}ms`}}>
                <span className="text-xl">{f.emoji}</span>
                <span className="text-sm font-medium" style={{color:'rgba(232,232,244,0.8)'}}>{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom quote */}
        <div className="relative z-10">
          <div className="glass rounded-2xl p-4">
            <p className="text-sm italic" style={{color:'rgba(232,232,244,0.6)'}}>
              "The best students don't just study harder — they study smarter with the right resources."
            </p>
          </div>
        </div>
      </div>

      {/* ── Right panel — form ── */}
      <div className="flex-1 flex items-center justify-center p-6"
           style={{background:'#0d0d1a'}}>
        <div className="w-full max-w-md animate-fade-in-up">
          {/* Mobile logo */}
          <div className="flex lg:hidden items-center justify-center gap-2 mb-8">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                 style={{background:'linear-gradient(135deg,#7c5cfc,#6d3ff5)'}}>
              <BookOpen size={20} className="text-white" />
            </div>
            <span className="text-white font-bold text-xl">PYQ Hub</span>
          </div>

          {step === 1 ? (
            /* Success state */
            <div className="card p-10 text-center animate-scale-in">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4"
                   style={{background:'linear-gradient(135deg,#10b981,#059669)', boxShadow:'0 0 30px rgba(16,185,129,0.4)'}}>
                <span className="text-3xl">✓</span>
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">Welcome to PYQ Hub!</h2>
              <p className="text-muted text-sm">Redirecting you to the dashboard…</p>
            </div>
          ) : (
            <div className="card p-8">
              <div className="mb-7">
                <h2 className="text-2xl font-bold text-white mb-1">Create your account</h2>
                <p className="text-muted text-sm">Join your department's knowledge hub</p>
              </div>

              {error && (
                <div className="flex gap-3 items-start rounded-2xl p-4 mb-5 animate-shake"
                     style={{background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)'}}>
                  <span className="text-red-400 text-lg shrink-0">⚠</span>
                  <p className="text-sm font-medium text-red-400">{error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Name */}
                <div>
                  <label className="label">Full Name</label>
                  <input type="text" required autoFocus value={form.name}
                    onChange={e=>set('name',e.target.value)} className="input" placeholder="Rahul Sharma" />
                </div>

                {/* Email */}
                <div>
                  <label className="label">College Email</label>
                  <input type="email" required value={form.email}
                    onChange={e=>set('email',e.target.value)} className="input" placeholder="rahul@college.edu" />
                </div>

                {/* Password */}
                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <input type={showPass?'text':'password'} required value={form.password}
                      onChange={e=>set('password',e.target.value)} className="input pr-12"
                      placeholder="Min. 6 characters" />
                    <button type="button" onClick={()=>setShowPass(v=>!v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-dark-400 hover:text-dark-200 transition-colors">
                      {showPass ? <EyeOff size={17}/> : <Eye size={17}/>}
                    </button>
                  </div>
                  {/* Password strength bar */}
                  {form.password.length > 0 && (
                    <div className="mt-2 h-1 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,0.08)'}}>
                      <div className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100,(form.password.length/12)*100)}%`,
                          background: form.password.length < 6 ? '#ef4444' : form.password.length < 10 ? '#f59e0b' : '#10b981',
                          boxShadow: form.password.length >= 10 ? '0 0 8px rgba(16,185,129,0.6)' : 'none',
                        }}/>
                    </div>
                  )}
                </div>

                {/* Role cards */}
                <div>
                  <label className="label">I am a…</label>
                  <div className="grid grid-cols-3 gap-2">
                    {ROLES.map(r=>{
                      const Icon = r.icon;
                      const sel = form.role === r.value;
                      return (
                        <button type="button" key={r.value} onClick={()=>set('role',r.value)}
                          className="flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all duration-200"
                          style={{
                            borderColor: sel ? '#7c5cfc' : 'rgba(255,255,255,0.08)',
                            background: sel ? 'rgba(124,92,252,0.15)' : 'rgba(255,255,255,0.03)',
                            boxShadow: sel ? '0 0 16px rgba(124,92,252,0.25)' : 'none',
                          }}>
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center bg-gradient-to-br ${r.color}`}>
                            <Icon size={16} className="text-white" />
                          </div>
                          <span className={`text-xs font-bold ${sel?'text-purple-300':'text-dark-300'}`}>{r.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button type="submit" disabled={loading} className="btn-primary btn-lg w-full mt-2">
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                        <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z"/>
                      </svg>Creating account…
                    </span>
                  ) : <><span>Create account</span><ArrowRight size={16}/></>}
                </button>
              </form>

              <div className="relative my-6">
                <div className="divider" />
                <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-xs text-dark-400"
                      style={{background:'var(--color-surface)'}}>or</span>
              </div>

              <p className="text-center text-sm text-muted">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold hover:text-purple-300 transition-colors" style={{color:'#a78bfa'}}>
                  Sign in
                </Link>
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
