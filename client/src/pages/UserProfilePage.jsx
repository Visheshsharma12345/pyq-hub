import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft, Loader2, FileText, Calendar, CheckCircle,
  Github, Linkedin, Globe, Phone, Building2, Award,
  Hash, GraduationCap, BookOpen, Star, Users, ExternalLink
} from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';

const ROLE_COLOR = {
  student:{ badge:'badge-blue',   text:'#93c5fd' },
  faculty:{ badge:'badge-purple', text:'#c4b5fd' },
  admin:  { badge:'badge-red',    text:'#fca5a5' },
};

function InfoPill({ icon:Icon, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-1.5 text-xs text-dark-300">
      <Icon size={12} style={{color:'#a78bfa'}}/>{value}
    </div>
  );
}

export default function UserProfilePage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: me } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // If viewing own profile redirect to /profile
    if (id === me?.id) { navigate('/profile', {replace:true}); return; }
    api.get(`/profile/users/${id}`)
      .then(r=>setData(r.data))
      .catch(()=>setError('User not found.'))
      .finally(()=>setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex justify-center items-center py-28">
      <Loader2 size={32} className="animate-spin" style={{color:'#a78bfa'}}/>
    </div>
  );
  if (error || !data) return (
    <div className="card p-16 text-center max-w-md mx-auto">
      <p className="text-5xl mb-4">🔍</p>
      <p className="text-white font-bold mb-3">{error||'Not found'}</p>
      <button onClick={()=>navigate(-1)} className="btn-secondary">
        <ArrowLeft size={15}/> Go back
      </button>
    </div>
  );

  const { profile, resources, _count } = data;
  const rc = ROLE_COLOR[data.role] || ROLE_COLOR.student;
  const isFaculty = data.role === 'faculty' || data.role === 'admin';

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">
      <button onClick={()=>navigate(-1)} className="btn-ghost text-dark-400 -ml-1 group">
        <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform"/> Back
      </button>

      {/* ── Hero ──────────────────────────────────────────────── */}
      <div className="card relative overflow-hidden">
        <div className="h-28 sm:h-36 w-full relative overflow-hidden"
             style={{background:'linear-gradient(135deg,#1a0d3d,#130d2e,#0f1535)'}}>
          <div className="absolute inset-0 bg-grid-dark opacity-60"/>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-30"
               style={{background:`radial-gradient(circle,${isFaculty?'#a78bfa':'#60a5fa'},transparent)`}}/>
        </div>

        <div className="px-6 sm:px-8 pb-6">
          <div className="-mt-10 sm:-mt-14 mb-5">
            <Avatar user={data} profile={profile} size="xl"/>
          </div>

          <div className="mb-3">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-2xl font-bold text-white">{data.name}</h1>
              <span className={`${rc.badge} capitalize`}>{data.role}</span>
            </div>
            <p className="text-sm text-dark-400">{data.email}</p>
            {profile?.designation && (
              <p className="text-sm font-semibold mt-0.5" style={{color:'#a78bfa'}}>{profile.designation}</p>
            )}
          </div>

          {profile?.bio && (
            <p className="text-sm text-dark-300 leading-relaxed mb-4 max-w-2xl">{profile.bio}</p>
          )}

          {/* Quick info row */}
          <div className="flex flex-wrap gap-4 mb-4">
            <InfoPill icon={Building2}    value={profile?.department}/>
            <InfoPill icon={Phone}        value={profile?.phone}/>
            {isFaculty
              ? <InfoPill icon={Hash}        value={profile?.employeeId ? `EMP: ${profile.employeeId}` : null}/>
              : <InfoPill icon={Hash}        value={profile?.rollNumber ? `Roll: ${profile.rollNumber}` : null}/>
            }
            {!isFaculty && <InfoPill icon={GraduationCap} value={profile?.semester ? `Sem ${profile.semester}` : null}/>}
            {!isFaculty && <InfoPill icon={Calendar}      value={profile?.batch}/>}
          </div>

          {/* Stats */}
          <div className="flex flex-wrap gap-3 mb-4">
            {[
              { icon:FileText,  label:'Uploads',   value:_count?.resources||0 },
              { icon:Calendar,  label:'Joined',    value:new Date(data.createdAt).toLocaleDateString('en-IN',{month:'short',year:'numeric'}) },
            ].map(s=>{
              const Icon = s.icon;
              return (
                <div key={s.label} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm"
                     style={{background:'rgba(255,255,255,0.04)', border:'1px solid rgba(255,255,255,0.07)'}}>
                  <Icon size={14} style={{color:'#a78bfa'}}/>
                  <span className="font-bold text-white">{s.value}</span>
                  <span className="text-dark-400">{s.label}</span>
                </div>
              );
            })}
          </div>

          {/* Social */}
          {(profile?.githubUrl || profile?.linkedinUrl || profile?.websiteUrl) && (
            <div className="flex gap-2 flex-wrap">
              {profile.githubUrl && (
                <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="btn-secondary btn-sm">
                  <Github size={13}/> GitHub
                </a>
              )}
              {profile.linkedinUrl && (
                <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="btn-secondary btn-sm"
                   style={{color:'#93c5fd'}}>
                  <Linkedin size={13}/> LinkedIn
                </a>
              )}
              {profile.websiteUrl && (
                <a href={profile.websiteUrl} target="_blank" rel="noreferrer" className="btn-secondary btn-sm">
                  <Globe size={13}/> Website
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Faculty extras */}
      {isFaculty && (profile?.subjects?.length > 0 || profile?.qualifications?.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {profile.subjects?.length > 0 && (
            <div className="card p-5">
              <h2 className="font-bold text-white mb-3 flex items-center gap-2 text-sm">
                <BookOpen size={15} style={{color:'#a78bfa'}}/> Subjects Taught
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.subjects.map(s=><span key={s} className="badge-purple">{s}</span>)}
              </div>
            </div>
          )}
          {profile.qualifications?.length > 0 && (
            <div className="card p-5">
              <h2 className="font-bold text-white mb-3 flex items-center gap-2 text-sm">
                <Star size={15} style={{color:'#fbbf24'}}/> Qualifications
              </h2>
              <div className="flex flex-wrap gap-2">
                {profile.qualifications.map(q=><span key={q} className="badge-yellow">{q}</span>)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Recent uploads */}
      {resources?.length > 0 && (
        <div className="card p-5">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2 text-sm">
            <FileText size={15} style={{color:'#a78bfa'}}/> Recent Uploads
            <span className="badge-gray ml-auto">{_count?.resources}</span>
          </h2>
          <div className="space-y-2">
            {resources.map(r=>(
              <Link key={r.id} to={`/resources/${r.id}`}
                className="flex items-center gap-3 p-3 rounded-2xl transition-all group hover:scale-[1.01]"
                style={{background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.06)'}}>
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                     style={{background: r.type==='notes'?'rgba(96,165,250,0.15)':'rgba(251,191,36,0.15)'}}>
                  {r.type==='notes'
                    ? <FileText size={16} style={{color:'#93c5fd'}}/>
                    : <Calendar size={16} style={{color:'#fcd34d'}}/>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white group-hover:text-purple-300 transition-colors truncate">{r.title}</p>
                  <p className="text-xs text-dark-400">{r.subjectCode} · Sem {r.semester}</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {r.isVerified && <CheckCircle size={13} style={{color:'#6ee7b7'}}/>}
                  <span className="text-xs text-dark-500">▲ {r.upvotesCount}</span>
                  <ExternalLink size={12} className="text-dark-600 group-hover:text-purple-400 transition-colors"/>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
