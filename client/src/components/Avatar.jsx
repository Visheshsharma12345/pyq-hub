const ROLE_GRADIENTS = {
  student: 'from-blue-500 to-cyan-500',
  faculty: 'from-violet-500 to-purple-600',
  admin:   'from-rose-500 to-pink-600',
};

export default function Avatar({ user, profile, size = 'md', className = '' }) {
  const sizes = {
    xs:  { outer:'w-7 h-7',   text:'text-xs',  ring:'ring-1' },
    sm:  { outer:'w-9 h-9',   text:'text-sm',  ring:'ring-1' },
    md:  { outer:'w-12 h-12', text:'text-base',ring:'ring-2' },
    lg:  { outer:'w-20 h-20', text:'text-2xl', ring:'ring-2' },
    xl:  { outer:'w-28 h-28', text:'text-4xl', ring:'ring-4' },
    '2xl':{ outer:'w-36 h-36',text:'text-5xl', ring:'ring-4' },
  };
  const s = sizes[size] || sizes.md;
  const gradient = ROLE_GRADIENTS[user?.role] || ROLE_GRADIENTS.student;
  const initials = (user?.name || '?').split(' ').map(w=>w[0]).join('').slice(0,2).toUpperCase();

  if (profile?.avatarUrl) {
    return (
      <img
        src={profile.avatarUrl}
        alt={user?.name}
        className={`${s.outer} rounded-2xl object-cover ${s.ring} ring-white/10 ${className}`}
      />
    );
  }

  return (
    <div className={`${s.outer} rounded-2xl flex items-center justify-center font-bold text-white shrink-0 bg-gradient-to-br ${gradient} ${s.ring} ring-white/10 ${className}`}>
      <span className={s.text}>{initials}</span>
    </div>
  );
}
