import { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import FilterBar from '../components/FilterBar';
import ResourceCard from '../components/ResourceCard';
import {
  Upload, TrendingUp, BookMarked, ShieldCheck, FileText,
  Sparkles, ArrowRight, Star, Flame
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const DEFAULT_FILTERS = { type:'', semester:'', subject_code:'', unit:'', exam_year:'', q:'' };

function AnimatedNumber({ value }) {
  const [display, setDisplay] = useState(0);
  const rafRef = useRef(null);
  useEffect(() => {
    const start = Date.now();
    const duration = 1000;
    const target = Number(value) || 0;
    function tick() {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const ease = 1 - Math.pow(1 - progress, 3);
      setDisplay(Math.round(ease * target));
      if (progress < 1) rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [value]);
  return <span>{display}</span>;
}

function SkeletonCard() {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex gap-2">
        <div className="skeleton h-5 w-14 rounded-full"/>
        <div className="skeleton h-5 w-20 rounded-full"/>
      </div>
      <div className="skeleton h-5 w-full"/>
      <div className="skeleton h-4 w-3/4"/>
      <div className="skeleton h-4 w-1/2"/>
      <div className="divider"/>
      <div className="flex gap-2">
        <div className="skeleton h-7 w-20 rounded-xl"/>
        <div className="skeleton h-7 w-20 rounded-xl"/>
      </div>
    </div>
  );
}

export default function HomePage() {
  const { user } = useAuth();
  const [resources, setResources] = useState([]);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // all | trending | verified

  const fetchResources = useCallback(async () => {
    setLoading(true); setError('');
    try {
      const params = {};
      Object.entries(filters).forEach(([k,v]) => { if(v) params[k]=v; });
      const { data } = await api.get('/resources', { params });
      setResources(data.data);
    } catch { setError('Failed to load resources. Is the server running?'); }
    finally { setLoading(false); }
  }, [filters]);

  useEffect(() => {
    const t = setTimeout(fetchResources, 300);
    return () => clearTimeout(t);
  }, [fetchResources]);

  function handleCardUpdate(updated) {
    setResources(prev => prev.map(r => r.id===updated.id ? updated : r));
  }

  // Apply tab filter
  const displayed = resources.filter(r => {
    if(activeTab === 'trending') return r.upvotesCount >= 2;
    if(activeTab === 'verified') return r.isVerified;
    return true;
  });

  const stats = [
    { icon:FileText,    label:'Total',    value:resources.length,                        color:'from-blue-500 to-cyan-400',    glow:'rgba(96,165,250,0.3)' },
    { icon:ShieldCheck, label:'Verified', value:resources.filter(r=>r.isVerified).length,  color:'from-emerald-500 to-teal-400', glow:'rgba(52,211,153,0.3)' },
    { icon:TrendingUp,  label:'PYQs',     value:resources.filter(r=>r.type==='pyq').length, color:'from-amber-500 to-orange-400', glow:'rgba(251,191,36,0.3)' },
    { icon:BookMarked,  label:'Notes',    value:resources.filter(r=>r.type==='notes').length,color:'from-violet-500 to-purple-400',glow:'rgba(167,139,250,0.3)'},
  ];

  return (
    <div className="space-y-7 animate-fade-in">

      {/* ── Hero ────────────────────────────────────────────── */}
      <div className="relative overflow-hidden rounded-3xl p-7 sm:p-10"
           style={{
             background:'linear-gradient(135deg, #1a0d3d 0%, #130d2e 50%, #0f1535 100%)',
             border:'1px solid rgba(124,92,252,0.2)',
             boxShadow:'0 20px 60px rgba(0,0,0,0.5), 0 0 0 1px rgba(124,92,252,0.1)',
           }}>
        {/* BG orbs */}
        <div className="absolute top-0 right-0 w-[400px] h-[400px] rounded-full blur-[80px] opacity-30 pointer-events-none"
             style={{background:'radial-gradient(circle, #7c5cfc, transparent)'}}/>
        <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] rounded-full blur-[60px] opacity-20 pointer-events-none"
             style={{background:'radial-gradient(circle, #60a5fa, transparent)'}}/>
        <div className="absolute inset-0 bg-grid-dark pointer-events-none opacity-50"/>

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-xs font-semibold animate-pulse-glow"
                 style={{background:'rgba(124,92,252,0.2)', border:'1px solid rgba(124,92,252,0.4)', color:'#c4b5fd'}}>
              <Sparkles size={12}/> Hello, {user?.name?.split(' ')[0]} 👋
            </div>
            <h1 className="text-3xl sm:text-4xl font-bold leading-tight mb-3 text-white">
              Your smart{' '}
              <span className="text-gradient">study companion</span>
            </h1>
            <p className="text-dark-300 text-sm sm:text-base leading-relaxed">
              Browse verified notes and PYQs for all semesters. Upload your own and help your peers.
            </p>
          </div>
          <Link to="/upload"
            className="shrink-0 flex items-center gap-2.5 font-bold text-sm px-5 py-3 rounded-2xl transition-all duration-200 hover:scale-105"
            style={{background:'rgba(124,92,252,0.2)', border:'1px solid rgba(124,92,252,0.4)', color:'#c4b5fd',
                    boxShadow:'0 0 20px rgba(124,92,252,0.2)'}}>
            <Upload size={16}/> Upload Resource <ArrowRight size={14}/>
          </Link>
        </div>

        {/* Stats row */}
        <div className="relative z-10 grid grid-cols-2 sm:grid-cols-4 gap-3 mt-8">
          {stats.map((s,i) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="glass rounded-2xl p-4 flex items-center gap-3 animate-fade-in-up"
                   style={{animationDelay:`${i*100}ms`}}>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-gradient-to-br ${s.color}`}
                     style={{boxShadow:`0 0 16px ${s.glow}`}}>
                  <Icon size={18} className="text-white"/>
                </div>
                <div>
                  <p className="text-xl font-bold text-white leading-tight">
                    {loading ? '…' : <AnimatedNumber value={s.value}/>}
                  </p>
                  <p className="text-xs text-dark-400 font-medium">{s.label}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Filter bar ──────────────────────────────────────── */}
      <FilterBar filters={filters} onChange={setFilters}/>

      {/* ── Tabs ────────────────────────────────────────────── */}
      {!loading && resources.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {[
            { key:'all',      label:'All Resources', icon:null },
            { key:'trending', label:'🔥 Trending',   icon:Flame },
            { key:'verified', label:'✅ Verified',   icon:Star  },
          ].map(t => (
            <button key={t.key} onClick={()=>setActiveTab(t.key)}
              className="px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 border"
              style={{
                background: activeTab===t.key ? 'rgba(124,92,252,0.2)' : 'rgba(255,255,255,0.03)',
                borderColor: activeTab===t.key ? 'rgba(124,92,252,0.5)' : 'rgba(255,255,255,0.08)',
                color: activeTab===t.key ? '#c4b5fd' : '#6a6a88',
                boxShadow: activeTab===t.key ? '0 0 16px rgba(124,92,252,0.2)' : 'none',
              }}>
              {t.label}
            </button>
          ))}
          <span className="ml-auto text-xs text-dark-500 self-center">
            {displayed.length} resource{displayed.length!==1?'s':''}
          </span>
        </div>
      )}

      {/* ── Results ─────────────────────────────────────────── */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_,i)=><SkeletonCard key={i}/>)}
        </div>
      ) : error ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">🚫</div>
          <p className="font-semibold text-red-400 mb-2">{error}</p>
          <p className="text-sm text-dark-400">Make sure the server is running on port 5000.</p>
        </div>
      ) : displayed.length === 0 ? (
        <div className="card p-16 text-center animate-fade-in">
          <div className="text-6xl mb-4 animate-bounce-soft">📭</div>
          <p className="text-white font-bold text-lg mb-2">Nothing here yet</p>
          <p className="text-sm text-dark-400 mb-6 max-w-xs mx-auto">
            Try different filters or upload the first resource for this category!
          </p>
          <Link to="/upload" className="btn-primary btn-sm inline-flex">
            <Upload size={14}/> Be the first to upload
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {displayed.map((r,i) => (
            <div key={r.id} className="animate-fade-in-up" style={{animationDelay:`${Math.min(i*50,400)}ms`}}>
              <ResourceCard resource={r} onUpdate={handleCardUpdate}/>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
