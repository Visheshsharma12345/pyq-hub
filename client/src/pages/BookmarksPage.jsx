import { useEffect, useState } from 'react';
import { Bookmark, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../lib/api';
import ResourceCard from '../components/ResourceCard';

function SkeletonCard() {
  return (
    <div className="card p-5 space-y-3">
      <div className="flex gap-2"><div className="skeleton h-5 w-14 rounded-full"/><div className="skeleton h-5 w-20 rounded-full"/></div>
      <div className="skeleton h-5 w-full"/><div className="skeleton h-4 w-3/4"/>
    </div>
  );
}

export default function BookmarksPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/bookmarks')
      .then(({data})=>setResources(data.data))
      .finally(()=>setLoading(false));
  },[]);

  function handleUpdate(updated) {
    if(!updated.userBookmarked) setResources(prev=>prev.filter(r=>r.id!==updated.id));
    else setResources(prev=>prev.map(r=>r.id===updated.id?updated:r));
  }

  return (
    <div className="space-y-7 animate-fade-in">
      {/* Header */}
      <div className="relative overflow-hidden rounded-3xl p-7"
           style={{background:'linear-gradient(135deg,#1a0d3d,#130d2e)',
                   border:'1px solid rgba(124,92,252,0.2)'}}>
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full blur-[80px] opacity-20 pointer-events-none"
             style={{background:'radial-gradient(circle,#7c5cfc,transparent)'}}/>
        <div className="relative z-10 flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-3 text-xs font-semibold"
                 style={{background:'rgba(124,92,252,0.2)', border:'1px solid rgba(124,92,252,0.3)', color:'#c4b5fd'}}>
              <Bookmark size={12}/> Saved Resources
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Your Bookmarks</h1>
            <p className="text-dark-300 text-sm">
              {loading ? 'Loading…' : `${resources.length} resource${resources.length!==1?'s':''} saved`}
            </p>
          </div>
          <div className="hidden sm:flex w-16 h-16 rounded-2xl items-center justify-center animate-float"
               style={{background:'rgba(124,92,252,0.2)', border:'1px solid rgba(124,92,252,0.3)'}}>
            <Bookmark size={28} style={{color:'#a78bfa'}}/>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(3)].map((_,i)=><SkeletonCard key={i}/>)}
        </div>
      ) : resources.length === 0 ? (
        <div className="card p-16 text-center animate-fade-in">
          <div className="text-6xl mb-4 animate-bounce-soft">🔖</div>
          <p className="text-white font-bold text-xl mb-2">Nothing saved yet</p>
          <p className="text-dark-400 text-sm mb-6 max-w-xs mx-auto">
            Tap the bookmark icon on any resource card to save it here for quick access.
          </p>
          <Link to="/" className="btn-primary inline-flex">
            Browse resources <ArrowRight size={15}/>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {resources.map((r,i)=>(
            <div key={r.id} className="animate-fade-in-up" style={{animationDelay:`${i*60}ms`}}>
              <ResourceCard resource={r} onUpdate={handleUpdate}/>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
