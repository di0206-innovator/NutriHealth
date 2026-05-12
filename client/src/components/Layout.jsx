import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { Sun, Moon, Home, Camera, History, User, Bell, FileText, Utensils, WifiOff, LayoutGrid } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function Layout({ user, logout, theme, toggleTheme }) {
  const location = useLocation();
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { path: '/', icon: <LayoutGrid size={22} />, label: 'HOME' },
    { path: '/analyze', icon: <Camera size={22} />, label: 'SCAN' },
    { path: '/history', icon: <History size={22} />, label: 'LOG' },
    { path: '/recipes', icon: <Utensils size={22} />, label: 'LAB' },
    { path: '/profile', icon: <User size={22} />, label: 'BIO' }
  ];

  return (
    <div style={{ minHeight: '100vh', backgroundColor: 'var(--color-background)', color: 'var(--color-text-main)', paddingBottom: '120px' }}>
      {/* 1. Network Status */}
      <AnimatePresence>
        {offline && (
          <motion.div 
            initial={{ height: 0 }} 
            animate={{ height: 'auto' }} 
            exit={{ height: 0 }} 
            style={{ background: 'var(--color-error)', color: 'white', overflow: 'hidden', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 10000 }}
          >
            <div style={{ padding: '6px 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.65rem', fontWeight: 900, fontFamily: 'Orbitron', letterSpacing: '0.1em' }}>
              <WifiOff size={14} /> SYSTEM OFFLINE: SYNC SUSPENDED
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Sleek Header */}
      <header style={{ 
        position: 'sticky', 
        top: 0, 
        zIndex: 1000, 
        background: scrolled ? 'var(--glass-bg)' : 'transparent', 
        backdropFilter: scrolled ? 'var(--glass-blur)' : 'none', 
        padding: '16px 24px', 
        transition: 'all 0.4s', 
        borderBottom: scrolled ? '1px solid var(--color-border)' : '1px solid transparent' 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', maxWidth: '1000px', margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-bg-deep)', fontWeight: 900, fontSize: '1.2rem' }}>N</div>
            <span style={{ fontSize: '0.9rem', fontWeight: 900, fontFamily: 'Orbitron', letterSpacing: '0.2em', color: 'var(--color-text-main)' }}>NUTRILENS</span>
          </div>
          
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
            <button 
              onClick={toggleTheme}
              style={{ background: 'transparent', border: 'none', color: 'var(--color-text-dim)', padding: '8px', cursor: 'pointer' }}
            >
              {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
            <button style={{ background: 'transparent', border: 'none', color: 'var(--color-text-dim)', padding: '8px', cursor: 'pointer' }}>
              <Bell size={20} />
            </button>
            <div style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'var(--color-bg-deep)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, fontSize: '0.8rem', color: 'var(--color-primary)' }}>
              {user?.email?.[0].toUpperCase() || 'U'}
            </div>
          </div>
        </div>
      </header>

      {/* 3. Main Content Wrapper */}
      <main style={{ maxWidth: '600px', margin: '0 auto', padding: '32px 24px' }}>
        <AnimatePresence mode="wait">
          <motion.div 
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 4. Sci-Fi Tab Bar */}
      <nav style={{ 
        position: 'fixed', 
        bottom: '32px', 
        left: '50%', 
        transform: 'translateX(-50%)',
        width: 'calc(100% - 48px)',
        maxWidth: '450px',
        background: 'var(--glass-bg)', 
        backdropFilter: 'var(--glass-blur)', 
        padding: '8px', 
        borderRadius: '32px',
        border: '1px solid var(--color-border)',
        boxShadow: 'var(--shadow-md)',
        zIndex: 10000 
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          {navItems.map((item) => (
            <NavLink 
              key={item.path} 
              to={item.path} 
              style={({ isActive }) => ({
                flex: 1,
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                gap: '4px', 
                textDecoration: 'none', 
                color: isActive ? 'var(--color-primary)' : 'var(--color-text-dim)', 
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', 
                padding: '12px 0',
                position: 'relative'
              })}
            >
              {({ isActive }) => (
                <>
                  <div style={{ position: 'relative' }}>
                    {isActive && (
                      <motion.div 
                        layoutId="nav-glow"
                        style={{ 
                          position: 'absolute', 
                          top: '50%', 
                          left: '50%', 
                          transform: 'translate(-50%, -50%)',
                          width: '40px', 
                          height: '40px', 
                          background: 'var(--color-primary)', 
                          filter: 'blur(20px)', 
                          opacity: 0.2,
                          zIndex: -1
                        }}
                      />
                    )}
                    <motion.div 
                      animate={{ 
                        scale: isActive ? 1.1 : 1,
                        y: isActive ? -2 : 0
                      }}
                    >
                      {item.icon}
                    </motion.div>
                  </div>
                  <span style={{ 
                    fontSize: '0.55rem', 
                    fontWeight: 900, 
                    fontFamily: 'Orbitron',
                    letterSpacing: '0.1em',
                    opacity: isActive ? 1 : 0.6
                  }}>
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
