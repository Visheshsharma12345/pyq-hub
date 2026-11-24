import { useEffect, useState } from 'react';
import { Flag, Trash2, ExternalLink, ShieldCheck, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/api';

export default function FlagsPage() {
  const [flags, setFlags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/flags').then(({data})=>setFlags(data.data)).finally(()=>setLoading(false));
  },[]);

  async function dismissFlag(id) {
    try { await api.delete(`/flags/${id}`); setFlags(p=>p.filter(f=>f.id!==id)); }
    catch(err){ alert(err.response?.data?.error||'Failed'); }
  }

  async function verifyResource(resourceId) {
    try {
      await api.patch(`/resources/${resourceId}/verify`);
      setFlags(p=>p.map(f=>f.resourceId===resourceId?{...f,resource:{...f.resource,isVerified:true}}:f));
    } catch(err){ alert(err.response?.data?.error||'Failed'); }
  }

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl p-7"
           style={{background:'linear-gradient(135deg,#2a0d1a,#1a0d0d)',
                   border:'1px solid rgba(239,68,68,0.2)'}}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-20 pointer-events-none"
             style={{background:'radial-gradient(circle,#ef4444,transparent)'}}/>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 text-xs font-semibold"
                 style={{background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.25)', color:'#fca5a5'}}>
              <Flag size={12}/> Review Queue
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Flagged Resources</h1>
            <p className="text-dark-300 text-sm">
              {loading ? 'Loading…' : `${flags.length} open report${flags.length!==1?'s':''} to review`}
            </p>
          </div>
          {!loading && flags.length > 0 && (
            <div className="hidden sm:flex w-16 h-16 rounded-2xl items-center justify-center animate-pulse-glow"
                 style={{background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.25)'}}>
              <span className="text-2xl font-bold" style={{color:'#fca5a5'}}>{flags.length}</span>
            </div>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(2)].map((_,i)=>(
            <div key={i} className="card p-6"><div className="skeleton h-5 w-2/3 mb-3"/><div className="skeleton h-4 w-full"/><div className="skeleton h-4 w-3/4 mt-2"/></div>
          ))}
        </div>
      ) : flags.length === 0 ? (
        <div className="card p-16 text-center animate-fade-in">
          <div className="text-6xl mb-4 animate-bounce-soft">🎉</div>
          <p className="text-white font-bold text-xl mb-2">All clear!</p>
          <p className="text-dark-400 text-sm">No flagged resources to review. Great work!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {flags.map((flag,i)=>(
            <div key={flag.id} className="card overflow-hidden animate-fade-in-up"
                 style={{animationDelay:`${i*80}ms`}}>
              {/* Red top bar */}
              <div className="h-[3px] bg-gradient-to-r from-red-500 to-rose-400"/>
              <div className="p-6">
                <div className="flex flex-col sm:flex-row sm:items-start gap-5">
                  <div className="flex-1 min-w-0">
                    {/* Resource title */}
                    <Link to={`/resources/${flag.resource.id}`}
                      className="inline-flex items-center gap-2 font-bold text-white hover:text-purple-300 transition-colors mb-2 group">
                      <span>{flag.resource.title}</span>
                      <ExternalLink size={12} className="text-dark-500 group-hover:text-purple-400 transition-colors shrink-0"/>
                    </Link>

                    <div className="flex flex-wrap gap-1.5 mb-4">
                      <span className="badge-gray capitalize">{flag.resource.type}</span>
                      <span className="badge-gray">Sem {flag.resource.semester}</span>
                      <span className="badge-gray">{flag.resource.subjectCode}</span>
                      {flag.resource.isVerified && <span className="badge-green"><ShieldCheck size={10}/>Verified</span>}
                    </div>

                    {/* Flag reason */}
                    <div className="rounded-2xl p-4"
                         style={{background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.15)'}}>
                      <div className="flex items-center gap-2 mb-2">
                        <AlertTriangle size={12} style={{color:'#fca5a5'}}/>
                        <span className="text-xs font-semibold" style={{color:'#fca5a5'}}>
                          Reported by {flag.user?.name}
                        </span>
                        <span className="text-xs text-dark-500 ml-auto">
                          {new Date(flag.createdAt).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'})}
                        </span>
                      </div>
                      <p className="text-sm" style={{color:'rgba(252,165,165,0.9)'}}>{flag.reason}</p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex sm:flex-col gap-2 shrink-0">
                    {!flag.resource.isVerified && (
                      <button onClick={()=>verifyResource(flag.resource.id)} className="btn-success btn-sm flex-1 sm:flex-none">
                        <ShieldCheck size={13}/> Verify
                      </button>
                    )}
                    <button onClick={()=>dismissFlag(flag.id)}
                      className="btn-secondary btn-sm flex-1 sm:flex-none"
                      style={{color:'#fca5a5', borderColor:'rgba(239,68,68,0.2)'}}>
                      <Trash2 size={13}/> Dismiss
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
