import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Search, MessageSquare, Heart, Shield, Award, Activity, Globe, Zap } from 'lucide-react';

const COMMUNITY_METRICS = [
  { label: 'Network Cells', value: '1,284', icon: Globe },
  { label: 'Metabolic Sync', value: '98%', icon: Activity },
  { label: 'Verified Analysts', value: '42', icon: Shield }
];

export default function Community() {
  const [activeTab, setActiveTab] = useState('trending');
  
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '100px' }}>
      <header>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--color-text-main)', fontFamily: 'Orbitron' }}>SOCIAL ECOSYSTEM</h2>
        <p style={{ fontSize: '0.8rem', color: 'var(--color-text-dim)', fontWeight: 600 }}>CONNECT WITH GLOBAL METABOLIC ANALYSTS</p>
      </header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        {COMMUNITY_METRICS.map(metric => (
          <div key={metric.label} className="glass-card" style={{ padding: '20px', textAlign: 'center' }}>
            <metric.icon size={20} color="var(--color-primary)" style={{ marginBottom: '8px' }} />
            <div className="stat-value" style={{ fontSize: '1.2rem' }}>{metric.value}</div>
            <div className="stat-label">{metric.label}</div>
          </div>
        ))}
      </div>

      <div className="glass-card" style={{ padding: '32px' }}>
         <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <div style={{ display: 'flex', gap: '20px' }}>
              {['trending', 'verified', 'discussions'].map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: activeTab === tab ? 'var(--color-primary)' : 'var(--color-text-dim)',
                    fontWeight: 800,
                    fontSize: '0.8rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                    cursor: 'pointer',
                    position: 'relative',
                    padding: '8px 0',
                    transition: 'color 0.3s ease'
                  }}
                >
                  {tab}
                  {activeTab === tab && (
                    <motion.div 
                      layoutId="tabUnderline"
                      style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: '2px', background: 'var(--color-primary)' }} 
                    />
                  )}
                </button>
              ))}
            </div>
            
            <div style={{ position: 'relative' }}>
              <Search size={16} color="var(--color-text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Search ecosystem..." 
                className="input-premium"
                style={{ paddingLeft: '36px', height: '40px', fontSize: '0.8rem' }}
              />
            </div>
         </div>

         <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { author: 'Dr. Sarah Chen', title: 'The role of autophagy in glucose management', category: 'Verified Analyst', upvotes: 124, replies: 18 },
              { author: 'BioHacker_99', title: 'Macro ratios for sustained cognitive performance', category: 'Community', upvotes: 85, replies: 12 },
              { author: 'Chef Marco', title: 'Cooking techniques to preserve micronutrients', category: 'Expert', upvotes: 56, replies: 4 }
            ].map((post, i) => (
              <motion.div 
                key={i}
                whileHover={{ x: 5 }}
                style={{ 
                  padding: '16px', 
                  background: 'var(--color-bg-elevated)', 
                  border: '1px solid var(--color-border)', 
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <span className="badge-premium" style={{ fontSize: '0.6rem' }}>{post.category}</span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--color-text-muted)', fontWeight: 600 }}>{post.author}</span>
                  </div>
                  <h4 style={{ fontSize: '1rem', fontWeight: 700, color: 'var(--color-text-main)' }}>{post.title}</h4>
                </div>
                <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                  <div style={{ textAlign: 'center' }}>
                    <Heart size={16} color="var(--color-secondary)" />
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-text-muted)' }}>{post.upvotes}</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <MessageSquare size={16} color="var(--color-primary)" />
                    <div style={{ fontSize: '0.7rem', fontWeight: 800, color: 'var(--color-text-muted)' }}>{post.replies}</div>
                  </div>
                </div>
              </motion.div>
            ))}
         </div>
         
         <button className="btn-premium" style={{ width: '100%', marginTop: '32px' }}>
            <Zap size={18} /> INITIATE NEW PROTOCOL
         </button>
      </div>
    </motion.div>
  );
}
