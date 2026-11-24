import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Edit2, FileText, Bookmark, Github, Linkedin, Globe,
  Phone, Building2, Award, Hash, GraduationCap, Calendar,
  Users, ChevronRight, Upload, Loader2, ExternalLink,
  BookOpen, Star, Shield
} from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';

const ROLE_COLOR = {
  student:{ badge:'badge-blue',  bg:'rgba(96,165,250,0.1)',  border:'rgba(96,165,250,0.2)',  text:'#93c5fd' },
  faculty:{ badge:'badge-purple',bg:'rgba(167,139,250,0.1)', border:'rgba(167,139,250,0.2)', text:'#c4b5fd' },
  admin:  { badge:'badge-red',   bg:'rgba(248,113,113,0.1)', border:'rgba(248,113,113,0.2)', text:'#fca5a5' },
};

function InfoRow({ icon:Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3 py-3" style={{borderBottom:'1px solid rgba(255,255,255,0.05)'}}>
      <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5"
           style={{background:'rgba(124,92,252,0.1)', border:'1px solid rgba(124,92,252,0.15)'}}>
        <Icon size={14} style={{color:'#a78bfa'}}/>
      </div>
      <div>
        <p className="text-xs font-semibold text-dark-500 uppercase tracking-wide mb-0.5">{label}</p>
        <p className="text-sm text-white font-medium">{value}</p>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [avatarLoading, setAvatarLoading] = useState(false);

  useEffect(() => {
    api.get('/profile/me').then(r=>setData(r.data)).finally(()=>setLoading(false));
  }, []);

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarLoading(true);
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const { data: res } = await api.post('/profile/me/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setData(d => ({ ...d, profile: { ...(d.profile||{}), avatarUrl: res.avatarUrl } }));
    } catch(err) { alert(err.response?.data?.error || 'Upload failed'); }
    finally { setAvatarLoading(false); }
  }

  if (loading) return (
    <div className="flex justify-center items-center py-28">
      <Loader2 size={32} className="animate-spin" style={{color:'#a78bfa'}}/>
    </div>
  );
  if (!data) return null;

  const { profile, _count } = data;
  const rc = ROLE_COLOR[data.role] || ROLE_COLOR.student;
  const isFaculty = data.role === 'faculty' || data.role === 'admin';

  return (
    <div className="max-w-4xl mx-auto space-y-5 animate-fade-in">

      {/* ── Hero card ─────────────────────────────────────────── */}
      <div className="card relative overflow-hidden">
        {/* Gradient header bg */}
        <div className="h-28 sm:h-36 w-full relative overflow-hidden"
             style={{background:'linear-gradient(135deg,#1a0d3d,#130d2e,#0f1535)'}}>
          <div className="absolute inset-0 bg-grid-dark opacity-60"/>
          <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-30"
               style={{background:'radial-gradient(circle,#7c5cfc,transparent)'}}/>
        </div>

        <div className="px-6 sm:px-8 pb-6">
          {/* Avatar + edit row */}
          <div className="flex items-end justify-between -mt-10 sm:-mt-14 mb-5">
            <div className="relative group">
              <Avatar user={data} profile={profile} size="xl" />
              {/* Camera overlay */}
              <label className="absolute inset-0 rounded-2xl flex items-center justify-center cursor-pointer
                                opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                     style={{background:'rgba(0,0,0,0.6)'}}>
                {avatarLoading
                  ? <Loader2 size={22} className="animate-spin text-white"/>
                  : <Upload size={22} className="text-white"/>}
                <input type="file" accept="image/jpeg,image/png,image/webp"
                  className="hidden" onChange={handleAvatarChange}/>
              </label>
            </div>
            <Link to="/profile/edit" className="btn-secondary gap-2">
              <Edit2 size={15}/> Edit Profile
            </Link>
          </div>

          {/* Name + role */}
          <div className="mb-4">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h1 className="text-2xl font-bold text-white">{data.name}</h1>
              <span className={`${rc.badge} capitalize`}>{data.role}</span>
            </div>
            <p className="text-sm text-dark-400">{data.email}</p>
            {profile?.designation && (
              <p className="text-sm font-semibold mt-0.5" style={{color:'#a78bfa'}}>{profile.designation}</p>
            )}
            {profile?.department && (
              <p className="text-sm text-dark-400">{profile.department}</p>
            )}
          </div>

          {/* Bio */}
          {profile?.bio && (
            <p className="text-sm text-dark-300 leading-relaxed mb-4 max-w-2xl">{profile.bio}</p>
          )}

          {/* Stats row */}
          <div className="flex flex-wrap gap-3">
            {[
              { icon:FileText,  label:'Uploads',   value:_count?.resources || 0 },
              { icon:Bookmark,  label:'Bookmarks', value:_count?.bookmarks || 0 },
              { icon:Calendar,  label:'Joined',    value: new Date(data.createdAt).toLocaleDateString('en-IN',{month:'short',year:'numeric'}) },
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

          {/* Social links */}
          {(profile?.githubUrl || profile?.linkedinUrl || profile?.websiteUrl) && (
            <div className="flex gap-2 mt-4 flex-wrap">
              {profile.githubUrl && (
                <a href={profile.githubUrl} target="_blank" rel="noreferrer" className="btn-secondary btn-sm gap-1.5">
                  <Github size={13}/> GitHub
                </a>
              )}
              {profile.linkedinUrl && (
                <a href={profile.linkedinUrl} target="_blank" rel="noreferrer" className="btn-secondary btn-sm gap-1.5"
                   style={{color:'#93c5fd'}}>
                  <Linkedin size={13}/> LinkedIn
                </a>
              )}
              {profile.websiteUrl && (
                <a href={profile.websiteUrl} target="_blank" rel="noreferrer" className="btn-secondary btn-sm gap-1.5">
                  <Globe size={13}/> Website
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ── Two column detail ──────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

        {/* Details card */}
        <div className="card p-5">
          <h2 className="font-bold text-white mb-3 flex items-center gap-2 text-sm">
            <Hash size={15} style={{color:'#a78bfa'}}/> Details
          </h2>
          <div className="space-y-0">
            {isFaculty ? (
              <>
                <InfoRow icon={Building2} label="Department"   value={profile?.department}/>
                <InfoRow icon={Award}     label="Designation"  value={profile?.designation}/>
                <InfoRow icon={Hash}      label="Employee ID"  value={profile?.employeeId}/>
                <InfoRow icon={Phone}     label="Phone"        value={profile?.phone}/>
              </>
            ) : (
              <>
                <InfoRow icon={Hash}         label="Roll Number" value={profile?.rollNumber}/>
                <InfoRow icon={GraduationCap}label="Semester"    value={profile?.semester ? `Semester ${profile.semester}` : null}/>
                <InfoRow icon={Calendar}     label="Batch"       value={profile?.batch}/>
                <InfoRow icon={Building2}    label="Department"  value={profile?.department}/>
                <InfoRow icon={Phone}        label="Phone"       value={profile?.phone}/>
              </>
            )}
          </div>
          {!profile && (
            <div className="text-center py-6">
              <p className="text-sm text-dark-400 mb-3">No details added yet</p>
              <Link to="/profile/edit" className="btn-primary btn-sm">Complete profile</Link>
            </div>
          )}
        </div>

        {/* Faculty: subjects + qualifications / Student: nothing extra */}
        {isFaculty && (
          <div className="card p-5 space-y-5">
            {/* Subjects */}
            <div>
              <h2 className="font-bold text-white mb-3 flex items-center gap-2 text-sm">
                <BookOpen size={15} style={{color:'#a78bfa'}}/> Subjects Taught
              </h2>
              {profile?.subjects?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.subjects.map(s=>(
                    <span key={s} className="badge-purple">{s}</span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-dark-500">No subjects listed</p>
              )}
            </div>

            {/* Qualifications */}
            <div>
              <h2 className="font-bold text-white mb-3 flex items-center gap-2 text-sm">
                <Star size={15} style={{color:'#fbbf24'}}/> Qualifications
              </h2>
              {profile?.qualifications?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.qualifications.map(q=>(
                    <span key={q} className="badge-yellow">{q}</span>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-dark-500">No qualifications listed</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Faculty-only actions ──────────────────────────────── */}
      {isFaculty && (
        <div className="card p-5">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2 text-sm">
            <Users size={15} style={{color:'#a78bfa'}}/> Faculty Tools
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Link to="/students"
              className="flex items-center justify-between p-4 rounded-2xl transition-all hover:scale-[1.01]"
              style={{background:'rgba(124,92,252,0.08)', border:'1px solid rgba(124,92,252,0.2)'}}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                     style={{background:'rgba(124,92,252,0.2)'}}>
                  <GraduationCap size={18} style={{color:'#a78bfa'}}/>
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Student Directory</p>
                  <p className="text-xs text-dark-400">View all student profiles</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-dark-500"/>
            </Link>

            <Link to="/flags"
              className="flex items-center justify-between p-4 rounded-2xl transition-all hover:scale-[1.01]"
              style={{background:'rgba(239,68,68,0.06)', border:'1px solid rgba(239,68,68,0.15)'}}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                     style={{background:'rgba(239,68,68,0.12)'}}>
                  <Shield size={18} style={{color:'#fca5a5'}}/>
                </div>
                <div>
                  <p className="font-bold text-white text-sm">Review Flags</p>
                  <p className="text-xs text-dark-400">Moderate reported resources</p>
                </div>
              </div>
              <ChevronRight size={16} className="text-dark-500"/>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
