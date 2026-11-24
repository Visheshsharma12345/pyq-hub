import { Link } from 'react-router-dom';
import { ThumbsUp, Bookmark, CheckCircle, FileText, Calendar, ArrowUpRight, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../lib/api';
import { useState } from 'react';

const TYPE = {
  notes: {
    badge:'badge-blue', bar:'from-blue-500 to-cyan-400',
    icon:FileText, label:'Notes', glow:'rgba(96,165,250,0.15)',
  },
  pyq: {
    badge:'badge-yellow', bar:'from-amber-500 to-orange-400',
    icon:Calendar, label:'PYQ', glow:'rgba(251,191,36,0.15)',
  },
};

export default function ResourceCard({ resource, onUpdate }) {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const t = TYPE[resource.type] || TYPE.notes;
  const Icon = t.icon;

  async function handleUpvote(e) {
    e.preventDefault();
    if(!user||loading) return;
    setLoading(true);
    try {
      const { data } = await api.post(`/resources/${resource.id}/upvote`);
      onUpdate?.({...resource, upvotesCount:data.upvotesCount, userUpvoted:data.upvoted});
    } catch(_){}
    setLoading(false);
  }

  async function handleBookmark(e) {
    e.preventDefault();
    if(!user||loading) return;
    setLoading(true);
    try {
      const { data } = await api.post(`/resources/${resource.id}/bookmark`);
      onUpdate?.({...resource, userBookmarked:data.bookmarked});
    } catch(_){}
    setLoading(false);
  }

  return (
    <Link to={`/resources/${resource.id}`}
      className="card-hover flex flex-col group relative overflow-hidden"
      style={{animationFillMode:'both'}}>

      {/* Gradient top bar */}
      <div className={`h-[3px] bg-gradient-to-r ${t.bar} w-full`}/>

      {/* Glow on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-300 rounded-[20px]"
           style={{background:`radial-gradient(ellipse at top right, ${t.glow}, transparent 60%)`}}/>

      <div className="p-5 flex-1 flex flex-col relative z-10">
        {/* Badges row */}
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap gap-1.5">
            <span className={t.badge}>
              <Icon size={10}/>{t.label}
            </span>
            <span className="badge-gray">Sem {resource.semester}</span>
            {resource.isVerified && (
              <span className="badge-green"><CheckCircle size={10}/>Verified</span>
            )}
          </div>
          <ArrowUpRight size={15} className="shrink-0 mt-0.5 transition-all duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
                        style={{color:'rgba(255,255,255,0.15)'}}/>
        </div>

        {/* Title */}
        <h3 className="font-bold text-white group-hover:text-gradient transition-all duration-200 leading-snug mb-1.5 text-sm"
            style={{WebkitTextFillColor: 'white'}}>
          {resource.title}
        </h3>

        {/* Subject */}
        <div className="mb-1">
          <span className="text-xs font-semibold" style={{color:'#a78bfa'}}>{resource.subjectCode}</span>
          <span className="text-xs text-dark-400"> · {resource.subjectName}</span>
        </div>
        {resource.unit    && <p className="text-xs text-dark-500">Unit {resource.unit}</p>}
        {resource.examYear&& <p className="text-xs text-dark-500">Exam {resource.examYear}</p>}

        <div className="flex-1"/>

        {/* Footer */}
        <div className="mt-4 pt-3 flex items-center justify-between"
             style={{borderTop:'1px solid rgba(255,255,255,0.06)'}}
             onClick={e=>e.preventDefault()}>
          <div className="flex items-center gap-1">
            {/* Upvote */}
            <button onClick={handleUpvote}
              disabled={loading||!user||resource.uploadedBy===user?.id}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
              style={{
                background: resource.userUpvoted ? 'rgba(124,92,252,0.2)' : 'rgba(255,255,255,0.05)',
                color: resource.userUpvoted ? '#a78bfa' : '#6a6a88',
                border:`1px solid ${resource.userUpvoted ? 'rgba(124,92,252,0.3)' : 'rgba(255,255,255,0.08)'}`,
              }}>
              <ThumbsUp size={12} strokeWidth={resource.userUpvoted?2.5:1.8}/>
              {resource.upvotesCount}
            </button>

            {/* Bookmark */}
            <button onClick={handleBookmark} disabled={loading||!user}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold transition-all duration-200"
              style={{
                background: resource.userBookmarked ? 'rgba(124,92,252,0.2)' : 'rgba(255,255,255,0.05)',
                color: resource.userBookmarked ? '#a78bfa' : '#6a6a88',
                border:`1px solid ${resource.userBookmarked ? 'rgba(124,92,252,0.3)' : 'rgba(255,255,255,0.08)'}`,
              }}>
              <Bookmark size={12} strokeWidth={resource.userBookmarked?2.5:1.8}/>
              {resource.userBookmarked ? 'Saved' : 'Save'}
            </button>
          </div>

          <div className="flex items-center gap-1 text-xs text-dark-500">
            <User size={10}/>
            <Link to={`/users/${resource.uploadedBy}`}
              className="truncate max-w-[80px] hover:text-purple-400 transition-colors"
              onClick={e=>e.stopPropagation()}>
              {resource.uploader?.name}
            </Link>
          </div>
        </div>
      </div>
    </Link>
  );
}
