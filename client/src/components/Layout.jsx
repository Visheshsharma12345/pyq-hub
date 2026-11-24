import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col" style={{background:'#0d0d1a'}}>
      <Navbar />
      {/* pb-24 on mobile to clear bottom nav */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-7 pb-28 md:pb-10">
        <Outlet />
      </main>
      <footer className="hidden md:block text-center py-6 text-xs text-dark-500 border-t"
              style={{borderColor:'rgba(255,255,255,0.05)'}}>
        © {new Date().getFullYear()} Department Study Note &amp; PYQ Hub ·{' '}
        <span className="text-gradient font-semibold">Built for college students</span>
      </footer>
    </div>
  );
}
