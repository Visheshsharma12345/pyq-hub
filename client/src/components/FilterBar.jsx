import { Search, SlidersHorizontal, X, ChevronDown } from 'lucide-react';
import { useState } from 'react';

const SEMESTERS = [1,2,3,4,5,6,7,8];
const EXAM_YEARS = [2024,2023,2022,2021,2020,2019];

export default function FilterBar({ filters, onChange }) {
  const [expanded, setExpanded] = useState(false);

  function set(k,v) { onChange({...filters,[k]:v}); }
  function clear()  { onChange({type:'',semester:'',subject_code:'',unit:'',exam_year:'',q:''}); }

  const activeCount = Object.values(filters).filter(Boolean).length;
  const hasFilters  = activeCount > 0;

  return (
    <div className="card p-4 space-y-3">
      {/* Search row */}
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-dark-500"/>
          <input
            type="text" value={filters.q}
            onChange={e=>set('q',e.target.value)}
            placeholder="Search title, subject or code…"
            className="input pl-10 text-sm"/>
        </div>

        <button onClick={()=>setExpanded(v=>!v)}
          className="btn-secondary relative gap-2 shrink-0 text-sm"
          style={expanded ? {borderColor:'rgba(124,92,252,0.4)', background:'rgba(124,92,252,0.1)', color:'#c4b5fd'} : {}}>
          <SlidersHorizontal size={14}/>
          <span className="hidden sm:inline">Filters</span>
          <ChevronDown size={13} className={`transition-transform duration-200 ${expanded?'rotate-180':''}`}/>
          {activeCount > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full text-[9px] font-bold flex items-center justify-center text-white"
                  style={{background:'#7c5cfc', boxShadow:'0 0 8px rgba(124,92,252,0.6)'}}>
              {activeCount}
            </span>
          )}
        </button>

        {hasFilters && (
          <button onClick={clear} className="btn-secondary shrink-0 text-dark-400 hover:text-red-400 px-2.5">
            <X size={15}/>
          </button>
        )}
      </div>

      {/* Type chips */}
      <div className="flex gap-2 flex-wrap">
        {[
          { v:'',      label:'✦ All' },
          { v:'notes', label:'📄 Notes' },
          { v:'pyq',   label:'📝 PYQ' },
        ].map(t=>(
          <button key={t.v} onClick={()=>set('type',t.v)}
            className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 border"
            style={{
              background: filters.type===t.v ? 'rgba(124,92,252,0.2)' : 'rgba(255,255,255,0.03)',
              borderColor: filters.type===t.v ? 'rgba(124,92,252,0.5)' : 'rgba(255,255,255,0.08)',
              color: filters.type===t.v ? '#c4b5fd' : '#6a6a88',
              boxShadow: filters.type===t.v ? '0 0 12px rgba(124,92,252,0.2)' : 'none',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Advanced filters */}
      {expanded && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1 animate-fade-in">
          <select value={filters.semester} onChange={e=>set('semester',e.target.value)} className="input-sm">
            <option value="">All semesters</option>
            {SEMESTERS.map(s=><option key={s} value={s}>Semester {s}</option>)}
          </select>

          <input type="text" placeholder="Subject code…" value={filters.subject_code}
            onChange={e=>set('subject_code',e.target.value.toUpperCase())} className="input-sm uppercase"/>

          <input type="number" placeholder="Unit #" min={1} max={10} value={filters.unit}
            onChange={e=>set('unit',e.target.value)} className="input-sm"/>

          <select value={filters.exam_year} onChange={e=>set('exam_year',e.target.value)} className="input-sm">
            <option value="">All years</option>
            {EXAM_YEARS.map(y=><option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      )}

      {/* Active filter chips */}
      {hasFilters && (
        <div className="flex flex-wrap gap-1.5 animate-fade-in">
          {Object.entries(filters).filter(([,v])=>v).map(([k,v])=>(
            <span key={k} className="badge-purple flex items-center gap-1 cursor-pointer"
                  onClick={()=>set(k,'')}>
              {k.replace(/_/g,' ')}: {v} <X size={10}/>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
