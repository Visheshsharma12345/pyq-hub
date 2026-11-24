import { useState } from 'react';
import { X, Flag, AlertCircle } from 'lucide-react';
import api from '../lib/api';

const REASONS = [
  { label:'Wrong semester',  emoji:'📅' },
  { label:'Wrong subject',   emoji:'📚' },
  { label:'Poor scan quality',emoji:'🔍' },
  { label:'Incorrect year',  emoji:'🗓️' },
  { label:'Duplicate file',  emoji:'📋' },
  { label:'Other',           emoji:'✏️' },
];

export default function FlagModal({ resource, onClose }) {
  const [reason, setReason] = useState('');
  const [custom, setCustom] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const finalReason = reason === 'Other' ? custom : reason;

  async function handleSubmit(e) {
    e.preventDefault();
    if(!finalReason||finalReason.trim().length < 5){
      setError('Please describe the issue (at least 5 characters).'); return;
    }
    setSubmitting(true); setError('');
    try {
      await api.post(`/resources/${resource.id}/flag`, { reason:finalReason.trim() });
      setSuccess(true);
      setTimeout(onClose, 2000);
    } catch(err) {
      setError(err.response?.data?.error||'Failed to submit. Try again.');
    } finally { setSubmitting(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in"
         style={{background:'rgba(0,0,0,0.75)', backdropFilter:'blur(8px)'}}
         onClick={e=>{ if(e.target===e.currentTarget) onClose(); }}>

      <div className="w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl overflow-hidden animate-slide-up"
           style={{background:'var(--color-surface)', border:'1px solid rgba(255,255,255,0.08)',
                   boxShadow:'0 -20px 60px rgba(0,0,0,0.5)'}}>
        {/* Handle bar (mobile) */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full" style={{background:'rgba(255,255,255,0.15)'}}/>
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5"
             style={{borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center"
                 style={{background:'rgba(239,68,68,0.15)', border:'1px solid rgba(239,68,68,0.2)'}}>
              <Flag size={18} style={{color:'#fca5a5'}}/>
            </div>
            <div>
              <p className="font-bold text-white text-sm">Report an Issue</p>
              <p className="text-xs text-dark-400 max-w-[180px] truncate">{resource.title}</p>
            </div>
          </div>
          <button onClick={onClose} className="btn-icon btn-ghost text-dark-400">
            <X size={18}/>
          </button>
        </div>

        <div className="p-6">
          {success ? (
            <div className="text-center py-8 animate-scale-in">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                   style={{background:'rgba(16,185,129,0.15)', border:'1px solid rgba(16,185,129,0.3)',
                           boxShadow:'0 0 24px rgba(16,185,129,0.3)'}}>
                <span className="text-2xl">✓</span>
              </div>
              <p className="font-bold text-white text-lg mb-1">Report submitted!</p>
              <p className="text-sm text-dark-400">A reviewer will check this resource soon.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Reason chips */}
              <div>
                <p className="label">Select a reason</p>
                <div className="grid grid-cols-2 gap-2">
                  {REASONS.map(r=>{
                    const sel = reason===r.label;
                    return (
                      <button type="button" key={r.label}
                        onClick={()=>{setReason(r.label);setError('');}}
                        className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all duration-200 border"
                        style={{
                          background: sel ? 'rgba(239,68,68,0.12)' : 'rgba(255,255,255,0.03)',
                          borderColor: sel ? 'rgba(239,68,68,0.3)' : 'rgba(255,255,255,0.08)',
                          color: sel ? '#fca5a5' : '#6a6a88',
                        }}>
                        <span className="text-base">{r.emoji}</span>
                        {r.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {reason==='Other' && (
                <div className="animate-fade-in">
                  <label className="label">Describe the issue</label>
                  <textarea rows={3} value={custom}
                    onChange={e=>setCustom(e.target.value)} className="input resize-none"
                    placeholder="Please explain what's wrong…"/>
                </div>
              )}

              {error && (
                <div className="flex gap-2 items-start rounded-xl p-3 text-sm"
                     style={{background:'rgba(239,68,68,0.08)', border:'1px solid rgba(239,68,68,0.2)', color:'#fca5a5'}}>
                  <AlertCircle size={14} className="shrink-0 mt-0.5"/>
                  {error}
                </div>
              )}

              <div className="flex gap-2 pt-1">
                <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={submitting||!reason} className="btn-danger flex-1">
                  {submitting ? 'Submitting…' : 'Submit Report'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
