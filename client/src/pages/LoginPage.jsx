import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ArrowRight, BookOpen, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const QUICK_ACCOUNTS = [
  { label:'Student', email:'student@test.com', icon:'🎓', color:'rgba(96,165,250,0.15)', border:'rgba(96,165,250,0.25)', text:'#93c5fd' },
  { label:'Faculty', email:'faculty@test.com', icon:'👩‍🏫', color:'rgba(167,139,250,0.15)', border:'rgba(167,139,250,0.25)', text:'#c4b5fd' },
  { label:'Admin',   email:'admin@test.com',   icon:'🛡️', color:'rgba(248,113,113,0.15)', border:'rgba(248,113,113,0.25)', text:'#fca5a5' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email:'', password:'' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(form.email, form.password);
      navigate('/');
    } catch(err) {
      setError(err.response?.data?.error || 'Invalid email or password.');
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
         style={{background:'#0d0d1a'}}>
      {/* Background orbs */}
      <div className="absolute top-[-200px] left-[-200px] w-[600px] h-[600px] rounded-full blur-[120px] opacity-20 pointer-events-none"
           style={{background:'radial-gradient(circle, #7c5cfc, transparent)'}}/>
      <div className="absolute bottom-[-200px] right-[-200px] w-[500px] h-[500px] rounded-full blur-[100px] opacity-15 pointer-events-none"
           style={{background:'radial-gradient(circle, #60a5fa, transparent)'}}/>
      <div className="absolute inset-0 bg-grid-dark pointer-events-none"/>

      <div className="w-full max-w-md relative z-10 animate-fade-in-up">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-16 h-16 rounded-3xl flex items-center justify-center mb-4 animate-float"
               style={{background:'linear-gradient(135deg,#7c5cfc,#6d3ff5)', boxShadow:'0 0 40px rgba(124,92,252,0.5)'}}>
            <BookOpen size={28} className="text-white"/>
          </div>
          <h1 className="text-3xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-muted text-sm">Sign in to access your study hub</p>
        </div>

        <div className="card p-8">
          {/* Quick login */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Zap size={13} style={{color:'#fbbf24'}}/>
              <span className="text-xs font-semibold text-dark-300">Quick login with test accounts</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {QUICK_ACCOUNTS.map(a=>(
                <button key={a.email} type="button"
                  onClick={()=>setForm({email:a.email,password:'password123'})}
                  className="flex flex-col items-center gap-1 p-2.5 rounded-xl transition-all duration-200 hover:scale-105"
                  style={{background:a.color, border:`1px solid ${a.border}`}}>
                  <span className="text-lg">{a.icon}</span>
                  <span className="text-xs font-semibold" style={{color:a.text}}>{a.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative my-5">
            <div className="divider"/>
            <span className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 px-3 text-xs text-dark-400"
                  style={{background:'var(--color-surface)'}}>or enter manually</span>
          </div>

          {error && (
            <div className="flex gap-3 items-start rounded-2xl p-4 mb-5"
                 style={{background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.2)'}}>
              <span className="text-red-400 shrink-0">⚠</span>
              <p className="text-sm font-medium text-red-400">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <input type="email" required value={form.email}
                onChange={e=>setForm(f=>({...f,email:e.target.value}))} className="input"
                placeholder="you@college.edu"/>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input type={showPass?'text':'password'} required value={form.password}
                  onChange={e=>setForm(f=>({...f,password:e.target.value}))} className="input pr-12"
                  placeholder="••••••••"/>
                <button type="button" onClick={()=>setShowPass(v=>!v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-dark-400 hover:text-dark-200 transition-colors">
                  {showPass ? <EyeOff size={17}/> : <Eye size={17}/>}
                </button>
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary btn-lg w-full">
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                    <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>Signing in…
                </span>
              ) : <><span>Sign in</span><ArrowRight size={16}/></>}
            </button>
          </form>

          <p className="text-center text-sm text-muted mt-5">
            New here?{' '}
            <Link to="/register" className="font-semibold hover:text-purple-300 transition-colors" style={{color:'#a78bfa'}}>
              Create a free account
            </Link>
          </p>
        </div>

        {/* Password hint */}
        <p className="text-center text-xs text-dark-500 mt-4">
          All test accounts use password: <span className="font-mono" style={{color:'#6d6d9a'}}>password123</span>
        </p>
      </div>
    </div>
  );
}
