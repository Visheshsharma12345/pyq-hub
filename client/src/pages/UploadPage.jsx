import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Upload, AlertCircle, CheckCircle, FileText, ArrowLeft, Cloud, Sparkles } from 'lucide-react';
import api from '../lib/api';

const SEMESTERS = [1,2,3,4,5,6,7,8];

export default function UploadPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title:'', type:'notes', semester:'',
    subject_code:'', subject_name:'', unit:'', exam_year:'',
  });
  const [file, setFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [duplicate, setDuplicate] = useState(null);
  const [fields, setFields] = useState([]);
  const [dragOver, setDragOver] = useState(false);

  function set(k,v){ setForm(f=>({...f,[k]:v})); }

  function onDrop(e) {
    e.preventDefault(); setDragOver(false);
    const f = e.dataTransfer.files[0];
    if(f?.type==='application/pdf') setFile(f);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(''); setDuplicate(null); setFields([]);
    if(!file){ setError('Please select a PDF file.'); return; }

    const fd = new FormData();
    Object.entries(form).forEach(([k,v])=>{ if(v) fd.append(k,v); });
    fd.append('file', file);

    setSubmitting(true); setProgress(0);
    try {
      const { data } = await api.post('/resources', fd, {
        headers:{'Content-Type':'multipart/form-data'},
        onUploadProgress: e => setProgress(Math.round((e.loaded/e.total)*100)),
      });
      navigate(`/resources/${data.id}`);
    } catch(err) {
      const resp = err.response?.data;
      if(resp?.error==='duplicate') setDuplicate(resp);
      else if(resp?.fields){ setFields(resp.fields); setError(resp.error); }
      else setError(resp?.error||'Upload failed. Please try again.');
    } finally { setSubmitting(false); setProgress(0); }
  }

  return (
    <div className="max-w-2xl mx-auto animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-7">
        <button onClick={()=>navigate(-1)} className="btn-secondary btn-icon">
          <ArrowLeft size={16}/>
        </button>
        <div>
          <h1 className="text-2xl font-bold text-white">Upload Resource</h1>
          <p className="text-xs text-dark-400 mt-0.5">Share notes or question papers with your department</p>
        </div>
      </div>

      {/* Duplicate alert */}
      {duplicate && (
        <div className="rounded-2xl p-5 mb-5 animate-scale-in flex gap-4"
             style={{background:'rgba(251,191,36,0.08)', border:'1px solid rgba(251,191,36,0.2)'}}>
          <span className="text-2xl shrink-0">⚠️</span>
          <div>
            <p className="font-bold text-amber-400 text-sm mb-1">Duplicate File Detected</p>
            <p className="text-xs text-dark-300">
              This exact file already exists as{' '}
              <Link to={`/resources/${duplicate.existingId}`}
                className="underline font-semibold" style={{color:'#fbbf24'}}>
                {duplicate.existingTitle}
              </Link>. No duplicate was created — protecting your storage!
            </p>
          </div>
        </div>
      )}

      {/* General error */}
      {error&&!duplicate && (
        <div className="rounded-2xl p-5 mb-5 animate-scale-in flex gap-4"
             style={{background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)'}}>
          <AlertCircle size={18} style={{color:'#ef4444'}} className="shrink-0 mt-0.5"/>
          <div>
            <p className="font-bold text-red-400 text-sm">{error}</p>
            {fields.length>0 && (
              <ul className="text-xs mt-1 space-y-0.5 text-red-400">
                {fields.map(f=><li key={f}>• {f}</li>)}
              </ul>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Drop zone */}
        <div
          onDragOver={e=>{e.preventDefault();setDragOver(true);}}
          onDragLeave={()=>setDragOver(false)}
          onDrop={onDrop}
          className="relative rounded-3xl transition-all duration-300"
          style={{
            background: file ? 'rgba(124,92,252,0.08)' : dragOver ? 'rgba(124,92,252,0.1)' : 'rgba(255,255,255,0.02)',
            border: `2px dashed ${file ? 'rgba(124,92,252,0.5)' : dragOver ? '#7c5cfc' : 'rgba(255,255,255,0.1)'}`,
            boxShadow: file||dragOver ? '0 0 24px rgba(124,92,252,0.15)' : 'none',
          }}>
          <input type="file" accept="application/pdf" id="file-upload"
            onChange={e=>setFile(e.target.files[0]||null)}
            className="absolute inset-0 opacity-0 cursor-pointer z-10"/>
          <label htmlFor="file-upload" className="flex flex-col items-center justify-center py-12 cursor-pointer">
            {file ? (
              <>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                     style={{background:'rgba(124,92,252,0.2)', border:'1px solid rgba(124,92,252,0.3)',
                             boxShadow:'0 0 24px rgba(124,92,252,0.3)'}}>
                  <FileText size={28} style={{color:'#a78bfa'}}/>
                </div>
                <p className="font-bold text-white text-sm mb-1">{file.name}</p>
                <p className="text-xs text-dark-400">
                  {(file.size/1024/1024).toFixed(2)} MB
                  <span className="ml-2 font-semibold" style={{color:'#6ee7b7'}}>✓ Ready</span>
                </p>
                <button type="button" onClick={e=>{e.preventDefault();setFile(null);}}
                  className="mt-3 text-xs text-dark-500 hover:text-red-400 transition-colors z-20 relative">
                  Remove file
                </button>
              </>
            ) : (
              <>
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4 animate-bounce-soft"
                     style={{background:'rgba(255,255,255,0.05)', border:'1px solid rgba(255,255,255,0.1)'}}>
                  <Cloud size={28} className="text-dark-400"/>
                </div>
                <p className="font-bold text-dark-200 text-sm mb-1">Drop your PDF here</p>
                <p className="text-xs text-dark-500">or click to browse · PDF only · Max 20 MB</p>
              </>
            )}
          </label>
        </div>

        {/* Upload progress */}
        {submitting && progress > 0 && (
          <div className="animate-fade-in">
            <div className="flex items-center justify-between text-xs text-dark-400 mb-1.5">
              <span>Uploading…</span><span>{progress}%</span>
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{background:'rgba(255,255,255,0.08)'}}>
              <div className="h-full rounded-full transition-all duration-300"
                   style={{width:`${progress}%`, background:'linear-gradient(90deg,#7c5cfc,#60a5fa)',
                           boxShadow:'0 0 8px rgba(124,92,252,0.6)'}}/>
            </div>
          </div>
        )}

        {/* Form card */}
        <div className="card p-6 space-y-5">
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={15} style={{color:'#a78bfa'}}/>
            <span className="text-sm font-bold text-white">Resource Details</span>
          </div>

          {/* Title */}
          <div>
            <label className="label">Title <span style={{color:'#ef4444'}}>*</span></label>
            <input type="text" required value={form.title}
              onChange={e=>set('title',e.target.value)} className="input"
              placeholder="e.g., Data Structures Unit 1 Notes"/>
          </div>

          {/* Type toggle */}
          <div>
            <label className="label">Type <span style={{color:'#ef4444'}}>*</span></label>
            <div className="grid grid-cols-2 rounded-2xl overflow-hidden p-1 gap-1"
                 style={{background:'rgba(255,255,255,0.03)', border:'1px solid rgba(255,255,255,0.08)'}}>
              {[{v:'notes',l:'📄 Notes'},{v:'pyq',l:'📝 PYQ (Exam Paper)'}].map(t=>(
                <button type="button" key={t.v} onClick={()=>set('type',t.v)}
                  className="py-2.5 rounded-xl text-sm font-bold transition-all duration-200"
                  style={{
                    background: form.type===t.v ? 'rgba(124,92,252,0.3)' : 'transparent',
                    color: form.type===t.v ? '#c4b5fd' : '#6a6a88',
                    border: form.type===t.v ? '1px solid rgba(124,92,252,0.4)' : '1px solid transparent',
                    boxShadow: form.type===t.v ? '0 0 16px rgba(124,92,252,0.2)' : 'none',
                  }}>
                  {t.l}
                </button>
              ))}
            </div>
          </div>

          {/* Semester + Code */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label">Semester <span style={{color:'#ef4444'}}>*</span></label>
              <select value={form.semester} onChange={e=>set('semester',e.target.value)} className="input">
                <option value="">Select…</option>
                {SEMESTERS.map(s=><option key={s} value={s}>Semester {s}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Subject Code <span style={{color:'#ef4444'}}>*</span></label>
              <input type="text" value={form.subject_code}
                onChange={e=>set('subject_code',e.target.value.toUpperCase())} className="input" placeholder="CS201"/>
            </div>
          </div>

          {/* Subject name */}
          <div>
            <label className="label">Subject Name <span style={{color:'#ef4444'}}>*</span></label>
            <input type="text" value={form.subject_name}
              onChange={e=>set('subject_name',e.target.value)} className="input" placeholder="Data Structures"/>
          </div>

          {form.type==='notes' && (
            <div>
              <label className="label">Unit Number <span style={{color:'#ef4444'}}>*</span></label>
              <input type="number" min={1} max={10} value={form.unit}
                onChange={e=>set('unit',e.target.value)} className="input" placeholder="e.g., 1"/>
            </div>
          )}
          {form.type==='pyq' && (
            <div>
              <label className="label">Exam Year <span style={{color:'#ef4444'}}>*</span></label>
              <input type="number" min={2000} max={new Date().getFullYear()} value={form.exam_year}
                onChange={e=>set('exam_year',e.target.value)} className="input" placeholder="2023"/>
            </div>
          )}
        </div>

        <button type="submit" disabled={submitting} className="btn-primary btn-lg w-full">
          {submitting ? (
            <span className="flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="white" strokeWidth="4"/>
                <path className="opacity-75" fill="white" d="M4 12a8 8 0 018-8v8z"/>
              </svg>Uploading…
            </span>
          ) : <><Upload size={18}/>Upload Resource</>}
        </button>
      </form>
    </div>
  );
}
