import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BookOpen, Upload, Bookmark, Flag, LogOut, Home, Menu, X, Bell, UserCircle, Users } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';

const NAV_ITEMS = (role) => [
  { to:'/',          icon:Home,       label:'Home' },
  { to:'/upload',    icon:Upload,     label:'Upload' },
  { to:'/bookmarks', icon:Bookmark,   label:'Saved' },
  { to:'/profile',   icon:UserCircle, label:'Profile' },
  ...((role==='student') ? [{ to:'/faculty', icon:Users, label:'Faculty' }] : []),
  ...((role==='faculty'||role==='admin') ? [
    { to:'/flags',    icon:Flag,  label:'Flags' },
    { to:'/students', icon:Users, label:'Students' },
  ] : []),
];

const ROLE_STYLES = {
  student: { bg:'rgba(96,165,250,0.15)',  border:'rgba(96,165,250,0.25)',  text:'#93c5fd',  dot:'#60a5fa' },
  faculty: { bg:'rgba(167,139,250,0.15)', border:'rgba(167,139,250,0.25)', text:'#c4b5fd',  dot:'#a78bfa' },
  admin:   { bg:'rgba(248,113,113,0.15)', border:'rgba(248,113,113,0.25)', text:'#fca5a5',  dot:'#ef4444' },
};

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);

  const roleStyle = ROLE_STYLES[user?.role] || ROLE_STYLES.student;
  const items = NAV_ITEMS(user?.role);

  function handleLogout() {
    logout();
    navigate('/register');
    setOpen(false);
  }

  return (
    <>
      {/* ── Top bar ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 glass-strong border-b"
              style={{borderColor:'rgba(255,255,255,0.06)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 shrink-0 group">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                 style={{background:'linear-gradient(135deg,#7c5cfc,#6d3ff5)', boxShadow:'0 0 16px rgba(124,92,252,0.4)'}}>
              <BookOpen size={18} className="text-white"/>
            </div>
            <div className="hidden sm:block">
              <p className="font-bold text-white text-sm leading-tight">PYQ Hub</p>
              <p className="text-[10px] leading-tight text-dark-400">Study Notes & Papers</p>
            </div>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-1">
            {items.map(item => (
              <DesktopNavLink key={item.to} {...item} active={pathname === item.to} />
            ))}
          </nav>

          {/* Right: user + notif + hamburger */}
          <div className="flex items-center gap-2">
            {/* Notification bell */}
            <button className="hidden md:flex btn-icon relative text-dark-400 hover:text-dark-200">
              <Bell size={17}/>
              <span className="notif-dot"/>
            </button>

            {/* User chip */}
            <div className="hidden md:flex items-center gap-2.5 pl-2 pr-3 py-1.5 rounded-2xl cursor-default"
                 style={{background:roleStyle.bg, border:`1px solid ${roleStyle.border}`}}>
              <div className="w-7 h-7 rounded-xl flex items-center justify-center text-white text-xs font-bold shrink-0"
                   style={{background:'linear-gradient(135deg,#7c5cfc,#6d3ff5)'}}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-bold leading-tight text-white max-w-[90px] truncate">{user?.name}</p>
                <p className="text-[10px] leading-tight capitalize" style={{color:roleStyle.text}}>{user?.role}</p>
              </div>
              <button onClick={handleLogout} className="ml-1 p-1 rounded-lg transition-colors text-dark-400 hover:text-red-400 hover:bg-red-900/20">
                <LogOut size={13}/>
              </button>
            </div>

            {/* Mobile hamburger */}
            <button onClick={()=>setOpen(v=>!v)}
              className="md:hidden btn-icon text-dark-300">
              {open ? <X size={21}/> : <Menu size={21}/>}
            </button>
          </div>
        </div>

        {/* Mobile drawer */}
        {open && (
          <div className="md:hidden border-t animate-slide-down px-4 py-4 space-y-1"
               style={{background:'rgba(13,13,26,0.98)', borderColor:'rgba(255,255,255,0.06)'}}>
            {/* User row */}
            <div className="flex items-center gap-3 p-3 rounded-2xl mb-3"
                 style={{background:roleStyle.bg, border:`1px solid ${roleStyle.border}`}}>
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-white font-bold"
                   style={{background:'linear-gradient(135deg,#7c5cfc,#6d3ff5)'}}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <p className="font-bold text-white text-sm">{user?.name}</p>
                <p className="text-xs capitalize" style={{color:roleStyle.text}}>{user?.role}</p>
              </div>
            </div>

            {items.map(item => (
              <MobileNavLink key={item.to} {...item} active={pathname===item.to}
                onClick={()=>setOpen(false)}/>
            ))}

            <button onClick={handleLogout}
              className="flex items-center gap-2.5 w-full px-4 py-3 rounded-2xl text-sm font-semibold text-red-400 hover:bg-red-900/20 transition-colors mt-2">
              <LogOut size={16}/> Sign out
            </button>
          </div>
        )}
      </header>

      {/* ── Mobile bottom nav ──────────────────────────────── */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 safe-bottom"
           style={{background:'rgba(13,13,26,0.95)', backdropFilter:'blur(20px)',
                   borderTop:'1px solid rgba(255,255,255,0.08)'}}>
        <div className="flex items-center justify-around h-16 px-2">
          {items.map(item=>(
            <BottomNavItem key={item.to} {...item} active={pathname===item.to}/>
          ))}
        </div>
      </div>
    </>
  );
}

function DesktopNavLink({ to, icon:Icon, label, active }) {
  return (
    <Link to={to} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-all duration-200"
      style={{
        background: active ? 'rgba(124,92,252,0.15)' : 'transparent',
        color: active ? '#c4b5fd' : '#6a6a88',
      }}>
      <Icon size={15} strokeWidth={active ? 2.5 : 1.8}/>
      {label}
    </Link>
  );
}

function MobileNavLink({ to, icon:Icon, label, active, onClick }) {
  return (
    <Link to={to} onClick={onClick}
      className="flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-semibold transition-all duration-200"
      style={{
        background: active ? 'rgba(124,92,252,0.15)' : 'transparent',
        color: active ? '#c4b5fd' : '#6a6a88',
      }}>
      <Icon size={16} strokeWidth={active?2.5:1.8}/>
      {label}
    </Link>
  );
}

function BottomNavItem({ to, icon:Icon, label, active }) {
  return (
    <Link to={to} className="flex flex-col items-center gap-1 px-4 py-1 transition-all duration-200"
      style={{color: active ? '#a78bfa' : '#4a4a66'}}>
      <div className="p-1.5 rounded-xl transition-all duration-200"
           style={{background: active ? 'rgba(124,92,252,0.2)' : 'transparent'}}>
        <Icon size={20} strokeWidth={active?2.5:1.8}/>
      </div>
      <span className="text-[10px] font-bold">{label}</span>
    </Link>
  );
}
