import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Trash2, 
  Filter, 
  TrendingUp, 
  TrendingDown, 
  ChevronRight,
  Activity,
  Flame,
  Zap
} from 'lucide-react';
import { db } from '../firebase';
import { collection, query, orderBy, onSnapshot, doc, deleteDoc } from 'firebase/firestore';

export default function History({ user }) {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'users', user.uid, 'meals'),
      orderBy('timestamp', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const mealsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setMeals(mealsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const deleteMeal = async (id) => {
    if (window.confirm('Erase this data point from history?')) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'meals', id));
      } catch (err) {
        console.error('Error deleting meal:', err);
      }
    }
  };

  const filteredMeals = meals.filter(meal => {
    if (filter === 'all') return true;
    if (filter === 'high') return meal.health_score >= 8;
    if (filter === 'low') return meal.health_score < 5;
    return true;
  });

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}
          style={{ width: 40, height: 40, border: '4px solid var(--color-border)', borderTopColor: 'var(--color-primary)', borderRadius: '50%' }}
        />
      </div>
    );
  }

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="show"
      style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '100px' }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-text-main)', fontFamily: 'Orbitron' }}>METABOLIC LOG</h2>
          <p style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)', fontWeight: 600 }}>LONGITUDINAL TRACKING HISTORY</p>
        </div>
        
        <div style={{ display: 'flex', gap: '8px' }}>
          {['all', 'high', 'low'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              style={{
                padding: '8px 16px',
                borderRadius: '12px',
                border: '1px solid var(--color-border)',
                background: filter === f ? 'rgba(0, 255, 163, 0.1)' : 'transparent',
                color: filter === f ? 'var(--color-primary)' : 'var(--color-text-dim)',
                fontSize: '0.75rem',
                fontWeight: 800,
                textTransform: 'uppercase',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {filteredMeals.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px' }}>
          <Activity size={48} color="var(--color-border)" style={{ marginBottom: '16px' }} />
          <h3 style={{ color: 'var(--color-text-main)' }}>No logs found</h3>
          <p style={{ color: 'var(--color-text-dim)' }}>Start scanning meals to build your metabolic history.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <AnimatePresence>
            {filteredMeals.map((meal) => (
              <motion.div
                key={meal.id}
                variants={itemVariants}
                exit={{ opacity: 0, x: -20 }}
                layout
                className="glass-card"
                style={{ padding: '20px', display: 'flex', alignItems: 'center', gap: '20px' }}
              >
                <div style={{ 
                  width: '60px', 
                  height: '60px', 
                  borderRadius: '16px', 
                  background: 'var(--color-bg-elevated)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: `2px solid ${meal.health_score >= 7 ? 'var(--color-primary)' : meal.health_score >= 5 ? 'var(--color-secondary)' : '#ff3b30'}`
                }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 900, color: 'var(--color-text-main)', fontFamily: 'Orbitron' }}>
                    {meal.health_score}
                  </span>
                </div>

                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--color-text-main)' }}>{meal.food_name || 'Analysis Entry'}</h4>
                      <div style={{ display: 'flex', gap: '12px', marginTop: '4px' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--color-text-dim)', fontWeight: 600 }}>
                          <Clock size={12} /> {new Date(meal.timestamp?.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem', color: 'var(--color-text-dim)', fontWeight: 600 }}>
                          <Calendar size={12} /> {new Date(meal.timestamp?.toDate()).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    
                    <button 
                      onClick={() => deleteMeal(meal.id)}
                      style={{ background: 'none', border: 'none', color: 'rgba(255, 59, 48, 0.4)', cursor: 'pointer', transition: 'color 0.2s' }}
                      onMouseEnter={(e) => e.currentTarget.style.color = '#ff3b30'}
                      onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(255, 59, 48, 0.4)'}
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <div style={{ display: 'flex', gap: '16px', marginTop: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Flame size={14} color="var(--color-secondary)" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-dim)' }}>{meal.macros?.calories} kcal</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Zap size={14} color="var(--color-primary)" />
                      <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-text-dim)' }}>{meal.macros?.protein}g protein</span>
                    </div>
                  </div>
                </div>
                
                <ChevronRight size={20} color="var(--color-border)" />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
}
