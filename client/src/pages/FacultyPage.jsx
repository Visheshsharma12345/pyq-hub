import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, Users, BookOpen, ChevronRight, Loader2, X, Star } from 'lucide-react';
import api from '../lib/api';
import Avatar from '../components/Avatar';

export default function FacultyPage() {
  const [faculty, setFaculty] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = { role: 'faculty' };
      if (q) params.q = q;
      const { data } = await api.get('/profile/users', { params });
      setFaculty(data.data);
    } catch(_){}
    finally { setLoading(false); }
  }, [q]);

  useEffect(() => {
    const t = setTimeout(fetch, 300);
    return () => clearTimeout(t);
  }, [fetch]);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl p-7"
           style={{background:'linear-gradient(135deg,#1a0d3d,#130d2e)',
                   border:'1px solid rgba(167,139,250,0.2)'}}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-25 pointer-events-none"
             style={{background:'radial-gradient(circle,#a78bfa,transparent)'}}/>
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 text-xs font-semibold"
                 style={{background:'rgba(167,139,250,0.15)', border:'1px solid rgba(167,139,250,0.25)', color:'#c4b5fd'}}>
              <Users size={12}/> Department Faculty
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Faculty Directory</h1>
            <p className="text-dark-300 text-sm">
              {loading ? 'Loading…' : `${faculty.length} faculty member${faculty.length!==1?'s':''}`}
            </p>
          </div>
          <div className="hidden sm:flex w-16 h-16 rounded-2xl items-center justify-center"
               style={{background:'rgba(167,139,250,0.15)', border:'1px solid rgba(167,139,250,0.2)'}}>
            <Users size={28} style={{color:'#c4b5fd'}}/>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500"/>
            <input type="text" value={q} onChange={e=>setQ(e.target.value)}
              className="input pl-10" placeholder="Search by name, department, subject…"/>
          </div>
          {q && (
            <button onClick={()=>setQ('')} className="btn-secondary text-dark-400 hover:text-red-400 px-3">
              <X size={15}/>
            </button>
          )}
        </div>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_,i)=>(
            <div key={i} className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="skeleton w-12 h-12 rounded-2xl shrink-0"/>
                <div className="flex-1"><div className="skeleton h-4 w-3/4 mb-2"/><div className="skeleton h-3 w-1/2"/></div>
              </div>
              <div className="skeleton h-3 w-full mb-2"/><div className="skeleton h-3 w-2/3"/>
            </div>
          ))}
        </div>
      ) : faculty.length === 0 ? (
        <div className="card p-16 text-center">
          <div className="text-5xl mb-4">👩‍🏫</div>
          <p className="text-white font-bold text-lg mb-2">No faculty found</p>
          <p className="text-dark-400 text-sm">Try a different search term.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {faculty.map((f,i)=>(
            <Link key={f.id} to={`/users/${f.id}`}
              className="card-hover p-5 group animate-fade-in-up"
              style={{animationDelay:`${Math.min(i*50,400)}ms`}}>
              <div className="flex items-start gap-3 mb-4">
                <Avatar user={f} profile={f.profile} size="md"/>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white group-hover:text-purple-300 transition-colors truncate">{f.name}</p>
                  {f.profile?.designation && (
                    <p className="text-xs font-semibold mt-0.5" style={{color:'#a78bfa'}}>{f.profile.designation}</p>
                  )}
                  {f.profile?.department && (
                    <p className="text-xs text-dark-400 mt-0.5 truncate">{f.profile.department}</p>
                  )}
                </div>
                <ChevronRight size={15} className="text-dark-600 group-hover:text-purple-400 transition-colors shrink-0 mt-1"/>
              </div>

              {f.profile?.subjects?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {f.profile.subjects.slice(0,3).map(s=>(
                    <span key={s} className="badge-purple text-[10px]">{s}</span>
                  ))}
                  {f.profile.subjects.length > 3 && (
                    <span className="badge-gray text-[10px]">+{f.profile.subjects.length-3}</span>
                  )}
                </div>
              )}

              {f.profile?.qualifications?.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-3">
                  {f.profile.qualifications.slice(0,2).map(q=>(
                    <span key={q} className="badge-yellow text-[10px]">{q}</span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-2 text-xs text-dark-500 pt-3"
                   style={{borderTop:'1px solid rgba(255,255,255,0.05)'}}>
                <BookOpen size={11}/>{f._count?.resources||0} resources
                <span className="ml-auto">
                  {new Date(f.createdAt).toLocaleDateString('en-IN',{month:'short',year:'numeric'})}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
