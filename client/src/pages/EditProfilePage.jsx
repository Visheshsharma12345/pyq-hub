import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Save, Plus, X, Upload, Loader2,
  User, Building2, Phone, Award, Hash, GraduationCap,
  Calendar, Github, Linkedin, Globe, BookOpen, Star
} from 'lucide-react';
import api from '../lib/api';
import { useAuth } from '../context/AuthContext';
import Avatar from '../components/Avatar';

const SEMESTERS = [1,2,3,4,5,6,7,8];

export default function EditProfilePage() {
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const isFaculty = authUser?.role === 'faculty' || authUser?.role === 'admin';

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // form state
  const [form, setForm] = useState({
    name:'', bio:'', phone:'', department:'', designation:'',
    employeeId:'', rollNumber:'', semester:'', batch:'',
    githubUrl:'', linkedinUrl:'', websiteUrl:'',
  });
  const [subjects, setSubjects] = useState([]);
  const [quals, setQuals] = useState([]);
  const [subjectInput, setSubjectInput] = useState('');
  const [qualInput, setQualInput] = useState('');

  useEffect(() => {
    api.get('/profile/me').then(r=>{
      const d = r.data;
      setData(d);
      const p = d.profile || {};
      setForm({
        name:        d.name || '',
        bio:         p.bio || '',
        phone:       p.phone || '',
        department:  p.department || '',
        designation: p.designation || '',
        employeeId:  p.employeeId || '',
        rollNumber:  p.rollNumber || '',
        semester:    p.semester || '',
        batch:       p.batch || '',
        githubUrl:   p.githubUrl || '',
        linkedinUrl: p.linkedinUrl || '',
        websiteUrl:  p.websiteUrl || '',
      });
      setSubjects(p.subjects || []);
      setQuals(p.qualifications || []);
    }).finally(()=>setLoading(false));
  }, []);

  function set(k,v){ setForm(f=>({...f,[k]:v})); }

  function addSubject() {
    const s = subjectInput.trim();
    if(s && !subjects.includes(s)){ setSubjects(prev=>[...prev,s]); setSubjectInput(''); }
  }
  function removeSubject(s){ setSubjects(prev=>prev.filter(x=>x!==s)); }

  function addQual() {
    const q = qualInput.trim();
    if(q && !quals.includes(q)){ setQuals(prev=>[...prev,q]); setQualInput(''); }
  }
  function removeQual(q){ setQuals(prev=>prev.filter(x=>x!==q)); }

  async function handleSave(e) {
    e.preventDefault();
    setSaving(true); setError(''); setSuccess(false);
    try {
      await api.put('/profile/me', {
        ...form,
        subjects,
        qualifications: quals,
      });
      setSuccess(true);
      setTimeout(()=>navigate('/profile'), 1200);
    } catch(err) {
      setError(err.response?.data?.error || 'Failed to save profile.');
    } finally { setSaving(false); }
  }

  async function handleAvatarChange(e) {
    const file = e.target.files?.[0];
    if(!file) return;
    setAvatarLoading(true);
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const { data: res } = await api.post('/profile/me/avatar', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setData(d=>({...d, profile:{...(d.profile||{}), avatarUrl:res.avatarUrl}}));
    } catch(err){ alert(err.response?.data?.error||'Upload failed'); }
    finally { setAvatarLoading(false); }
  }

  if(loading) return (
    <div className="flex justify-center py-28">
      <Loader2 size={32} className="animate-spin" style={{color:'#a78bfa'}}/>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <button onClick={()=>navigate('/profile')} className="btn-secondary btn-icon">
          <ArrowLeft size={16}/>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Edit Profile</h1>
          <p className="text-xs text-dark-400 mt-0.5">Update your information and photo</p>
        </div>
      </div>

      {success && (
        <div className="rounded-2xl p-4 mb-5 flex items-center gap-3 animate-scale-in"
             style={{background:'rgba(16,185,129,0.1)', border:'1px solid rgba(16,185,129,0.25)'}}>
          <span className="text-xl">✓</span>
          <p className="text-sm font-semibold" style={{color:'#6ee7b7'}}>Profile saved! Redirecting…</p>
        </div>
      )}

      {error && (
        <div className="rounded-2xl p-4 mb-5 flex items-center gap-3"
             style={{background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)'}}>
          <span className="text-xl">⚠️</span>
          <p className="text-sm font-semibold text-red-400">{error}</p>
        </div>
      )}

      <form onSubmit={handleSave} className="space-y-5">
        {/* Avatar card */}
        <div className="card p-6">
          <h2 className="font-bold text-white mb-4 flex items-center gap-2 text-sm">
            <User size={15} style={{color:'#a78bfa'}}/> Profile Photo
          </h2>
          <div className="flex items-center gap-5">
            <div className="relative group shrink-0">
              <Avatar user={data} profile={data?.profile} size="lg"/>
              <label className="absolute inset-0 rounded-2xl flex items-center justify-center cursor-pointer
                                opacity-0 group-hover:opacity-100 transition-opacity"
                     style={{background:'rgba(0,0,0,0.65)'}}>
                {avatarLoading
                  ? <Loader2 size={18} className="animate-spin text-white"/>
                  : <Upload size={18} className="text-white"/>}
                <input type="file" accept="image/jpeg,image/png,image/webp"
                  className="hidden" onChange={handleAvatarChange}/>
              </label>
            </div>
            <div>
              <p className="text-sm font-semibold text-white mb-1">Upload a photo</p>
              <p className="text-xs text-dark-400 mb-3">JPEG, PNG, or WebP · max 5 MB</p>
              <label className="btn-secondary btn-sm cursor-pointer">
                <Upload size={13}/> Choose image
                <input type="file" accept="image/jpeg,image/png,image/webp"
                  className="hidden" onChange={handleAvatarChange}/>
              </label>
            </div>
          </div>
        </div>

        {/* Basic info */}
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-white mb-1 flex items-center gap-2 text-sm">
            <User size={15} style={{color:'#a78bfa'}}/> Basic Information
          </h2>

          <div>
            <label className="label">Full Name</label>
            <input type="text" value={form.name} onChange={e=>set('name',e.target.value)} className="input" placeholder="Your full name"/>
          </div>

          <div>
            <label className="label">Bio / About</label>
            <textarea rows={3} value={form.bio} onChange={e=>set('bio',e.target.value)}
              className="input resize-none" placeholder="Tell others about yourself…"/>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Department</label>
              <input type="text" value={form.department} onChange={e=>set('department',e.target.value)}
                className="input" placeholder="Computer Science"/>
            </div>
            <div>
              <label className="label">Phone</label>
              <input type="tel" value={form.phone} onChange={e=>set('phone',e.target.value)}
                className="input" placeholder="+91 …"/>
            </div>
          </div>
        </div>

        {/* Faculty-specific */}
        {isFaculty ? (
          <>
            <div className="card p-6 space-y-4">
              <h2 className="font-bold text-white mb-1 flex items-center gap-2 text-sm">
                <Award size={15} style={{color:'#a78bfa'}}/> Faculty Details
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Designation</label>
                  <input type="text" value={form.designation} onChange={e=>set('designation',e.target.value)}
                    className="input" placeholder="Associate Professor"/>
                </div>
                <div>
                  <label className="label">Employee ID</label>
                  <input type="text" value={form.employeeId} onChange={e=>set('employeeId',e.target.value)}
                    className="input" placeholder="EMP001"/>
                </div>
              </div>
            </div>

            {/* Subjects */}
            <div className="card p-6">
              <h2 className="font-bold text-white mb-4 flex items-center gap-2 text-sm">
                <BookOpen size={15} style={{color:'#a78bfa'}}/> Subjects Taught
              </h2>
              <div className="flex flex-wrap gap-2 mb-3">
                {subjects.map(s=>(
                  <span key={s} className="badge-purple flex items-center gap-1">
                    {s}
                    <button type="button" onClick={()=>removeSubject(s)} className="hover:text-red-400 transition-colors">
                      <X size={10}/>
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" value={subjectInput} onChange={e=>setSubjectInput(e.target.value)}
                  onKeyDown={e=>{ if(e.key==='Enter'){e.preventDefault();addSubject();} }}
                  className="input-sm flex-1" placeholder="e.g. Data Structures (press Enter)"/>
                <button type="button" onClick={addSubject} className="btn-secondary btn-sm">
                  <Plus size={13}/> Add
                </button>
              </div>
            </div>

            {/* Qualifications */}
            <div className="card p-6">
              <h2 className="font-bold text-white mb-4 flex items-center gap-2 text-sm">
                <Star size={15} style={{color:'#fbbf24'}}/> Qualifications
              </h2>
              <div className="flex flex-wrap gap-2 mb-3">
                {quals.map(q=>(
                  <span key={q} className="badge-yellow flex items-center gap-1">
                    {q}
                    <button type="button" onClick={()=>removeQual(q)} className="hover:text-red-400 transition-colors">
                      <X size={10}/>
                    </button>
                  </span>
                ))}
              </div>
              <div className="flex gap-2">
                <input type="text" value={qualInput} onChange={e=>setQualInput(e.target.value)}
                  onKeyDown={e=>{ if(e.key==='Enter'){e.preventDefault();addQual();} }}
                  className="input-sm flex-1" placeholder="e.g. M.Tech, Ph.D (press Enter)"/>
                <button type="button" onClick={addQual} className="btn-secondary btn-sm">
                  <Plus size={13}/> Add
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Student-specific */
          <div className="card p-6 space-y-4">
            <h2 className="font-bold text-white mb-1 flex items-center gap-2 text-sm">
              <GraduationCap size={15} style={{color:'#a78bfa'}}/> Student Details
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="label">Roll Number</label>
                <input type="text" value={form.rollNumber} onChange={e=>set('rollNumber',e.target.value)}
                  className="input" placeholder="2022CS001"/>
              </div>
              <div>
                <label className="label">Current Semester</label>
                <select value={form.semester} onChange={e=>set('semester',e.target.value)} className="input">
                  <option value="">Select…</option>
                  {SEMESTERS.map(s=><option key={s} value={s}>Semester {s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="label">Batch</label>
              <input type="text" value={form.batch} onChange={e=>set('batch',e.target.value)}
                className="input" placeholder="2022-2026"/>
            </div>
          </div>
        )}

        {/* Social links */}
        <div className="card p-6 space-y-4">
          <h2 className="font-bold text-white mb-1 flex items-center gap-2 text-sm">
            <Globe size={15} style={{color:'#a78bfa'}}/> Social & Links
          </h2>
          <div>
            <label className="label flex items-center gap-1.5"><Github size={13}/> GitHub URL</label>
            <input type="url" value={form.githubUrl} onChange={e=>set('githubUrl',e.target.value)}
              className="input" placeholder="https://github.com/username"/>
          </div>
          <div>
            <label className="label flex items-center gap-1.5"><Linkedin size={13}/> LinkedIn URL</label>
            <input type="url" value={form.linkedinUrl} onChange={e=>set('linkedinUrl',e.target.value)}
              className="input" placeholder="https://linkedin.com/in/username"/>
          </div>
          <div>
            <label className="label flex items-center gap-1.5"><Globe size={13}/> Website / Portfolio</label>
            <input type="url" value={form.websiteUrl} onChange={e=>set('websiteUrl',e.target.value)}
              className="input" placeholder="https://yourwebsite.com"/>
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary btn-lg w-full">
          {saving ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z"/>
              </svg>Saving…
            </span>
          ) : <><Save size={16}/> Save Profile</>}
        </button>
      </form>
    </div>
  );
}
