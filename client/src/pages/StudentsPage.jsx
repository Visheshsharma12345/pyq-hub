import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, GraduationCap, FileText, ChevronRight,
  Loader2, Users, Filter, X
} from 'lucide-react';
import api from '../lib/api';
import Avatar from '../components/Avatar';

const SEMESTERS = [1,2,3,4,5,6,7,8];

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [semester, setSemester] = useState('');
  const [department, setDepartment] = useState('');

  const fetch = useCallback(async () => {
    setLoading(true);
    try {
      const params = {};
      if (q) params.q = q;
      if (semester) params.semester = semester;
      if (department) params.department = department;
      const { data } = await api.get('/profile/students', { params });
      setStudents(data.data);
    } catch(_) {}
    finally { setLoading(false); }
  }, [q, semester, department]);

  useEffect(() => {
    const t = setTimeout(fetch, 300);
    return () => clearTimeout(t);
  }, [fetch]);

  function clear() { setQ(''); setSemester(''); setDepartment(''); }
  const hasFilters = q || semester || department;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl p-7"
           style={{background:'linear-gradient(135deg,#0d1a3d,#0d1530)',
                   border:'1px solid rgba(96,165,250,0.2)'}}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-20 pointer-events-none"
             style={{background:'radial-gradient(circle,#60a5fa,transparent)'}}/>
        <div className="relative z-10 flex items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 text-xs font-semibold"
                 style={{background:'rgba(96,165,250,0.15)', border:'1px solid rgba(96,165,250,0.25)', color:'#93c5fd'}}>
              <Users size={12}/> Faculty View
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Student Directory</h1>
            <p className="text-dark-300 text-sm">
              {loading ? 'Loading…' : `${students.length} student${students.length!==1?'s':''} found`}
            </p>
          </div>
          <div className="hidden sm:flex w-16 h-16 rounded-2xl items-center justify-center"
               style={{background:'rgba(96,165,250,0.15)', border:'1px solid rgba(96,165,250,0.2)'}}>
            <GraduationCap size={28} style={{color:'#93c5fd'}}/>
          </div>
        </div>
      </div>

      {/* Search & filters */}
      <div className="card p-4 space-y-3">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500"/>
            <input type="text" value={q} onChange={e=>setQ(e.target.value)}
              className="input pl-10" placeholder="Search by name, email, roll number…"/>
          </div>
          {hasFilters && (
            <button onClick={clear} className="btn-secondary text-dark-400 hover:text-red-400 px-3">
              <X size={15}/>
            </button>
          )}
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          <select value={semester} onChange={e=>setSemester(e.target.value)} className="input-sm">
            <option value="">All semesters</option>
            {SEMESTERS.map(s=><option key={s} value={s}>Semester {s}</option>)}
          </select>
          <input type="text" value={department} onChange={e=>setDepartment(e.target.value)}
            className="input-sm" placeholder="Department…"/>
        </div>
      </div>

      {/* Results */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_,i)=>(
            <div key={i} className="card p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="skeleton w-12 h-12 rounded-2xl shrink-0"/>
                <div className="flex-1"><div className="skeleton h-4 w-3/4 mb-2"/><div className="skeleton h-3 w-1/2"/></div>
              </div>
            </div>
          ))}
        </div>
      ) : students.length === 0 ? (
        <div className="card p-16 text-center animate-fade-in">
          <div className="text-5xl mb-4">🎓</div>
          <p className="text-white font-bold text-lg mb-2">No students found</p>
          <p className="text-dark-400 text-sm">Try adjusting your search filters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {students.map((s,i)=>(
            <Link key={s.id} to={`/users/${s.id}`}
              className="card-hover p-5 group animate-fade-in-up"
              style={{animationDelay:`${Math.min(i*50,400)}ms`}}>
              <div className="flex items-start gap-3 mb-4">
                <Avatar user={s} profile={s.profile} size="md"/>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-white group-hover:text-purple-300 transition-colors truncate">{s.name}</p>
                  <p className="text-xs text-dark-400 truncate">{s.email}</p>
                  {s.profile?.designation && (
                    <p className="text-xs mt-0.5" style={{color:'#a78bfa'}}>{s.profile.designation}</p>
                  )}
                </div>
                <ChevronRight size={15} className="text-dark-600 group-hover:text-purple-400 transition-colors shrink-0 mt-1"/>
              </div>

              <div className="flex flex-wrap gap-1.5 mb-3">
                {s.profile?.rollNumber && (
                  <span className="badge-gray"># {s.profile.rollNumber}</span>
                )}
                {s.profile?.semester && (
                  <span className="badge-blue">Sem {s.profile.semester}</span>
                )}
                {s.profile?.batch && (
                  <span className="badge-gray">{s.profile.batch}</span>
                )}
                {s.profile?.department && (
                  <span className="badge-gray truncate max-w-[120px]">{s.profile.department}</span>
                )}
              </div>

              <div className="flex items-center gap-3 text-xs text-dark-500 pt-3"
                   style={{borderTop:'1px solid rgba(255,255,255,0.05)'}}>
                <span className="flex items-center gap-1">
                  <FileText size={11}/> {s._count?.resources || 0} uploads
                </span>
                <span className="ml-auto text-dark-600">
                  Joined {new Date(s.createdAt).toLocaleDateString('en-IN',{month:'short',year:'numeric'})}
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
