import { motion } from 'framer-motion';
import { User, Settings, Shield, Bell, LogOut, ChevronRight, Award, Zap, Activity } from 'lucide-react';

export default function Profile({ user, profile, logout }) {
  const userName = profile?.name || user?.email?.split('@')[0].toUpperCase() || 'ADMIN_UNIT_01';
  const goalText = profile?.goal === 'lose' ? 'FAT LOSS OBJECTIVE' : profile?.goal === 'gain' ? 'HYPERTROPHY OBJECTIVE' : 'MAINTENANCE PROTOCOL';

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  const menuItems = [
    { icon: <User size={20} />, label: 'Neural Profile', sub: 'Biometric data & preferences', color: 'var(--color-primary)' },
    { icon: <Settings size={20} />, label: 'System Config', sub: 'App behavior & integration', color: 'var(--color-secondary)' },
    { icon: <Shield size={20} />, label: 'Data Security', sub: 'Privacy & encryption settings', color: '#ff9500' },
    { icon: <Bell size={20} />, label: 'Neural Alerts', sub: 'Sync & notification frequency', color: '#ff3b30' },
  ];

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '120px' }}
    >
      {/* 1. Profile Header */}
      <div style={{ textAlign: 'center', paddingTop: '20px' }}>
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <div style={{ 
            width: '120px', 
            height: '120px', 
            borderRadius: '40px', 
            background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))',
            padding: '4px'
          }}>
            <div style={{ width: '100%', height: '100%', borderRadius: '36px', background: 'var(--color-bg-deep)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
              <User size={60} color="var(--color-text-dim)" />
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: '-10px', right: '-10px', background: 'var(--color-primary)', width: '40px', height: '40px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '4px solid var(--color-bg-deep)' }}>
            <Award size={20} color="var(--color-bg-deep)" />
          </div>
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 900, fontFamily: 'Orbitron', letterSpacing: '0.05em', marginTop: '24px' }}>{userName}</h2>
        <p style={{ color: 'var(--color-text-dim)', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.2em', marginTop: '4px' }}>{goalText}</p>
      </div>

      {/* 2. Achievement Stats */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <motion.div variants={itemVariants} className="glass-card" style={{ flex: 1, padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-primary)' }}>14</div>
          <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--color-text-dim)', textTransform: 'uppercase', marginTop: '4px' }}>DAY STREAK</div>
        </motion.div>
        <motion.div variants={itemVariants} className="glass-card" style={{ flex: 1, padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-secondary)' }}>2.4k</div>
          <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--color-text-dim)', textTransform: 'uppercase', marginTop: '4px' }}>XP POINTS</div>
        </motion.div>
        <motion.div variants={itemVariants} className="glass-card" style={{ flex: 1, padding: '20px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#ff9500' }}>Lvl 8</div>
          <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--color-text-dim)', textTransform: 'uppercase', marginTop: '4px' }}>OPERATIVE</div>
        </motion.div>
      </div>

      {/* 3. Settings Menu */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {menuItems.map((item, i) => (
          <motion.div 
            key={i} 
            variants={itemVariants}
            whileHover={{ x: 5 }}
            className="glass-card" 
            style={{ padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '20px', cursor: 'pointer' }}
          >
            <div style={{ color: item.color }}>{item.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '1rem', fontWeight: 800 }}>{item.label}</div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-text-dim)' }}>{item.sub}</div>
            </div>
            <ChevronRight size={18} color="var(--color-text-dim)" />
          </motion.div>
        ))}
      </div>

      {/* 4. Danger Zone */}
      <motion.button 
        variants={itemVariants}
        onClick={logout}
        style={{ 
          marginTop: '20px',
          padding: '20px', 
          background: 'rgba(255, 59, 48, 0.05)', 
          border: '1px solid rgba(255, 59, 48, 0.2)', 
          borderRadius: '24px', 
          color: '#ff3b30', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '12px',
          fontWeight: 900,
          fontSize: '0.8rem',
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          cursor: 'pointer'
        }}
      >
        <LogOut size={20} />
        TERMINATE SESSION
      </motion.button>
    </motion.div>
  );
}
