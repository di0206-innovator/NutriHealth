import { motion } from 'framer-motion';
import { Activity, Flame, Zap, Target, ArrowUpRight, TrendingUp, Clock, ChevronRight, PieChart } from 'lucide-react';

export default function Dashboard({ meals }) {
  const totalCalories = meals.reduce((sum, m) => sum + (m.calories || 0), 0);
  const targetCalories = 2500;
  const progress = Math.min((totalCalories / targetCalories) * 100, 100);

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

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      style={{ display: 'flex', flexDirection: 'column', gap: '32px', paddingBottom: '120px' }}
    >
      {/* 1. Header & Quick Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 900, fontFamily: 'Orbitron', letterSpacing: '0.05em' }}>COMMAND<br/>CENTER</h2>
          <p style={{ color: 'var(--color-text-dim)', fontSize: '0.9rem', marginTop: '4px', fontWeight: 600 }}>SYSTEM STATUS: <span style={{ color: 'var(--color-primary)' }}>OPTIMAL</span></p>
        </div>
        <div style={{ width: '56px', height: '56px', borderRadius: '18px', background: 'var(--glass-bg)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Activity size={24} color="var(--color-primary)" />
        </div>
      </div>

      {/* 2. Primary Metabolic Gauge */}
      <motion.div variants={itemVariants} className="glass-card" style={{ padding: '32px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, right: 0, padding: '24px', opacity: 0.05 }}>
          <Flame size={120} />
        </div>
        
        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div>
              <span style={{ fontSize: '0.7rem', fontWeight: 900, color: 'var(--color-text-dim)', textTransform: 'uppercase', letterSpacing: '0.2em' }}>METABOLIC FUEL</span>
              <h3 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '8px 0', color: 'var(--color-text-main)' }}>{totalCalories} <span style={{ fontSize: '1rem', color: 'var(--color-text-dim)' }}>KCAL</span></h3>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-primary)' }}>{progress.toFixed(0)}%</span>
              <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--color-text-dim)', textTransform: 'uppercase' }}>OF {targetCalories} TARGET</div>
            </div>
          </div>
          
          <div style={{ height: '12px', background: 'rgba(0, 0, 0, 0.05)', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--color-border)' }}>
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              style={{ height: '100%', background: 'linear-gradient(90deg, var(--color-primary), var(--color-secondary))', boxShadow: '0 0 20px rgba(0, 255, 163, 0.5)' }}
            />
          </div>
          
          <div style={{ display: 'flex', gap: '20px', marginTop: '32px' }}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--color-text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>PROTEIN VOLUME</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>124g <span style={{ fontSize: '0.7rem', color: 'var(--color-primary)' }}>+12%</span></div>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.6rem', fontWeight: 800, color: 'var(--color-text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>CARB DENSITY</div>
              <div style={{ fontSize: '1.1rem', fontWeight: 900 }}>86g <span style={{ fontSize: '0.7rem', color: '#ff3b30' }}>-5%</span></div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* 3. Secondary Metrics Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        <motion.div variants={itemVariants} className="glass-card" style={{ padding: '24px' }}>
          <div style={{ color: 'var(--color-secondary)', marginBottom: '16px' }}><Zap size={24} /></div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>8.4</div>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-text-dim)', textTransform: 'uppercase', marginTop: '4px' }}>AVG HEALTH IQ</div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="glass-card" style={{ padding: '24px' }}>
          <div style={{ color: '#ff9500', marginBottom: '16px' }}><TrendingUp size={24} /></div>
          <div style={{ fontSize: '1.4rem', fontWeight: 900 }}>{meals.length}</div>
          <div style={{ fontSize: '0.65rem', fontWeight: 800, color: 'var(--color-text-dim)', textTransform: 'uppercase', marginTop: '4px' }}>SCAN SESSIONS</div>
        </motion.div>
      </div>

      {/* 4. Recent Data Streams */}
      <motion.div variants={itemVariants} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0 8px' }}>
          <h4 style={{ fontSize: '0.8rem', fontWeight: 900, color: 'var(--color-text-dim)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>RECENT TELEMETRY</h4>
          <button style={{ background: 'transparent', border: 'none', color: 'var(--color-primary)', fontSize: '0.7rem', fontWeight: 800 }}>VIEW ARCHIVE</button>
        </div>

        {meals.slice(0, 3).map((meal, i) => (
          <div key={i} className="glass-card" style={{ padding: '16px', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'rgba(0, 0, 0, 0.03)', border: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Clock size={20} color="var(--color-text-dim)" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.9rem', fontWeight: 800 }}>{meal.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--color-text-dim)', marginTop: '2px' }}>{meal.calories} kcal • {new Date(meal.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
            <div style={{ color: meal.health_score > 7 ? 'var(--color-primary)' : '#ff9500', fontWeight: 900, fontSize: '0.9rem' }}>
              +{meal.health_score}
            </div>
          </div>
        ))}

        {meals.length === 0 && (
          <div className="glass-card" style={{ padding: '40px', textAlign: 'center', opacity: 0.5, borderStyle: 'dashed' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 700 }}>NO RECENT DATA STREAMS</span>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
