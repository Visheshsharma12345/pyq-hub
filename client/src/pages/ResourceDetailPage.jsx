import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ThumbsUp, Bookmark, Flag as FlagIcon, Download, CheckCircle,
  ArrowLeft, Loader2, ShieldCheck, Trash2, Calendar, FileText,
  User, Eye, Hash, Sparkles
} from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import PdfViewer from '../components/PdfViewer';
import FlagModal from '../components/FlagModal';

export default function ResourceDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [aLoad, setALoad] = useState(false);
  const [showFlag, setShowFlag] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/resources/${id}`)
      .then(({data})=>setResource(data))
      .catch(()=>setError('Resource not found.'))
      .finally(()=>setLoading(false));
  }, [id]);

  async function handleUpvote() {
    if(!user||aLoad) return; setALoad(true);
    try {
      const {data} = await api.post(`/resources/${id}/upvote`);
      setResource(r=>({...r, upvotesCount:data.upvotesCount, userUpvoted:data.upvoted}));
    } catch(err){ alert(err.response?.data?.error||'Failed'); }
    finally { setALoad(false); }
  }
  async function handleBookmark() {
    if(!user||aLoad) return; setALoad(true);
    try {
      const {data} = await api.post(`/resources/${id}/bookmark`);
      setResource(r=>({...r, userBookmarked:data.bookmarked}));
    } catch(_){}
    finally { setALoad(false); }
  }
  async function handleVerify() {
    setALoad(true);
    try {
      const {data} = await api.patch(`/resources/${id}/verify`);
      setResource(r=>({...r, isVerified:data.isVerified}));
    } catch(err){ alert(err.response?.data?.error||'Failed'); }
    finally { setALoad(false); }
  }
  async function handleDelete() {
    if(!window.confirm('Delete this resource permanently?')) return;
    setALoad(true);
    try { await api.delete(`/resources/${id}`); navigate('/'); }
    catch(err){ alert(err.response?.data?.error||'Failed'); setALoad(false); }
  }

  if(loading) return (
    <div className="flex flex-col items-center justify-center py-28 gap-4">
      <div className="w-16 h-16 rounded-2xl flex items-center justify-center animate-pulse-glow"
           style={{background:'rgba(124,92,252,0.2)', border:'1px solid rgba(124,92,252,0.3)'}}>
        <Loader2 size={28} className="animate-spin" style={{color:'#a78bfa'}}/>
      </div>
      <p className="text-sm text-dark-400">Loading resource…</p>
    </div>
  );

  if(error||!resource) return (
    <div className="card p-16 text-center max-w-md mx-auto">
      <div className="text-5xl mb-4">🔍</div>
      <p className="text-white font-bold mb-1">{error||'Not found'}</p>
      <button onClick={()=>navigate('/')} className="btn-secondary mt-4">
        <ArrowLeft size={15}/> Back to home
      </button>
    </div>
  );

  const canVerify = user&&(user.role==='faculty'||user.role==='admin');
  const canDelete = user&&user.role==='admin';
  const isOwner   = user&&user.id===resource.uploadedBy;
  const TypeIcon  = resource.type==='notes' ? FileText : Calendar;
  const barGrad   = resource.type==='notes'
    ? 'from-blue-500 to-cyan-400' : 'from-amber-500 to-orange-400';

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">

      {/* Back */}
      <button onClick={()=>navigate(-1)} className="btn-ghost text-dark-400 -ml-1 group">
        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform"/> Back
      </button>

      {/* ── Header card ─────────────────────────────────────── */}
      <div className="card relative overflow-hidden">
        {/* Top gradient bar */}
        <div className={`h-[3px] bg-gradient-to-r ${barGrad}`}/>

        {/* Background glow */}
        <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full blur-[80px] opacity-10 pointer-events-none"
             style={{background:`radial-gradient(circle, ${resource.type==='notes'?'#60a5fa':'#fbbf24'}, transparent)`}}/>

        <div className="p-6 sm:p-8 relative z-10">
          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            <span className={resource.type==='notes'?'badge-blue':'badge-yellow'}>
              <TypeIcon size={10}/>{resource.type==='notes'?'Notes':'PYQ'}
            </span>
            <span className="badge-gray">Semester {resource.semester}</span>
            {resource.isVerified && <span className="badge-green"><CheckCircle size={10}/>Verified</span>}
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-white leading-tight mb-3">
            {resource.title}
          </h1>

          {/* Meta grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-5">
            {[
              { icon:Sparkles, label:'Subject', value:resource.subjectName },
              { icon:Hash,     label:'Code',    value:resource.subjectCode },
              ...(resource.unit     ? [{ icon:FileText, label:'Unit',      value:`Unit ${resource.unit}` }] : []),
              ...(resource.examYear ? [{ icon:Calendar, label:'Exam Year', value:resource.examYear }] : []),
            ].map(m=>{
              const MIcon = m.icon;
              return (
                <div key={m.label} className="rounded-2xl p-3"
                     style={{background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.07)'}}>
                  <div className="flex items-center gap-1.5 mb-1 text-dark-400">
                    <MIcon size={11}/><span className="text-[10px] font-semibold uppercase tracking-wide">{m.label}</span>
                  </div>
                  <p className="text-sm font-bold text-white truncate">{m.value}</p>
                </div>
              );
            })}
          </div>

          {/* Uploader */}
          <div className="flex items-center gap-2 mb-6 text-xs text-dark-400">
            <User size={12}/>
            <span>Uploaded by</span>
            <span className="font-semibold" style={{color:'#a78bfa'}}>{resource.uploader?.name}</span>
            <span className="badge-gray capitalize">{resource.uploader?.role}</span>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-2">
            {user&&!isOwner && (
              <button onClick={handleUpvote} disabled={aLoad}
                className={`btn ${resource.userUpvoted?'btn-primary':'btn-secondary'}`}>
                <ThumbsUp size={15} strokeWidth={resource.userUpvoted?2.5:1.8}/>
                {resource.userUpvoted?'Upvoted':'Upvote'}
                <span className="opacity-60">({resource.upvotesCount})</span>
              </button>
            )}
            {user && (
              <button onClick={handleBookmark} disabled={aLoad}
                className={`btn ${resource.userBookmarked?'btn-primary':'btn-secondary'}`}>
                <Bookmark size={15} strokeWidth={resource.userBookmarked?2.5:1.8}/>
                {resource.userBookmarked?'Saved':'Save'}
              </button>
            )}
            <a href={resource.fileUrl} download target="_blank" rel="noreferrer" className="btn btn-secondary">
              <Download size={15}/> Download
            </a>
            {user && (
              <button onClick={()=>setShowFlag(true)} className="btn btn-secondary"
                style={{color:'#fca5a5', borderColor:'rgba(248,113,113,0.2)'}}>
                <FlagIcon size={15}/> Report
              </button>
            )}
            {canVerify&&!resource.isVerified && (
              <button onClick={handleVerify} disabled={aLoad} className="btn-success btn">
                <ShieldCheck size={15}/> Verify
              </button>
            )}
            {canDelete && (
              <button onClick={handleDelete} disabled={aLoad} className="btn-danger btn">
                <Trash2 size={15}/> Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* ── PDF Preview ─────────────────────────────────────── */}
      <div className="card">
        <div className="flex items-center justify-between p-5"
             style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                 style={{background:'rgba(96,165,250,0.15)', border:'1px solid rgba(96,165,250,0.2)'}}>
              <Eye size={16} style={{color:'#93c5fd'}}/>
            </div>
            <div>
              <p className="font-bold text-white text-sm">PDF Preview</p>
              <p className="text-xs text-dark-400">View in-browser or download</p>
            </div>
          </div>
          <button onClick={()=>setShowPreview(v=>!v)}
            className={`btn-sm ${showPreview?'btn-primary':'btn-secondary'}`}>
            {showPreview ? 'Hide':'Show Preview'}
          </button>
        </div>
        <div className="p-5">
          {showPreview ? <PdfViewer fileUrl={resource.fileUrl}/> : (
            <div className="text-center py-10">
              <div className="text-4xl mb-3">📄</div>
              <p className="text-sm text-dark-400">Click "Show Preview" to open the PDF viewer.</p>
            </div>
          )}
        </div>
      </div>

      {showFlag && <FlagModal resource={resource} onClose={()=>setShowFlag(false)}/>}
    </div>
  );
}
