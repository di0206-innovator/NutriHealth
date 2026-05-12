import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, Lock, LogIn, Sparkles, Brain, Leaf, UserPlus, AlertCircle, RefreshCcw } from 'lucide-react';
import { api } from '../utils/api';

export default function Auth({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleAuth = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (isLogin) {
        const formData = new URLSearchParams();
        formData.append('username', email);
        formData.append('password', password);
        
        const data = await api.request('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: formData,
        });
        
        localStorage.setItem('token', data.access_token);
        onLogin(data.user);
      } else {
        const data = await api.post('/api/auth/register', { email, password });
        setSuccess('Account created! Please log in.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (err) {
      console.error("Authentication Error:", err);
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', padding: '40px 24px', backgroundColor: 'var(--color-background)', color: 'var(--color-text-main)' }}>
      <header style={{ textAlign: 'center', marginBottom: '40px', marginTop: '20px' }}>
         <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ display: 'inline-flex', background: 'var(--color-primary)', color: 'white', padding: '16px', borderRadius: '24px', boxShadow: '0 10px 30px rgba(255,45,85,0.2)', marginBottom: '24px' }}
         >
            <Leaf size={40} />
         </motion.div>
         <h1 style={{ fontSize: '2.4rem', fontWeight: 900, letterSpacing: '-0.02em', fontFamily: 'Orbitron' }}>NUTRI HEALTH</h1>
         <p style={{ color: 'var(--color-text-dim)', fontWeight: 700, marginTop: '8px', letterSpacing: '0.1em', fontSize: '0.8rem' }}>METABOLIC INTELLIGENCE ENGINE</p>
      </header>

      <div style={{ maxWidth: '400px', width: '100%', margin: '0 auto' }}>
        <AnimatePresence mode="wait">
            {error && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{ background: 'rgba(255, 59, 48, 0.1)', color: '#ff3b30', padding: '16px', borderRadius: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', fontWeight: 700, border: '1px solid rgba(255, 59, 48, 0.2)' }}
                >
                    <AlertCircle size={18} /> {error}
                </motion.div>
            )}
            {success && (
                <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    style={{ background: 'rgba(0, 255, 163, 0.1)', color: 'var(--color-primary)', padding: '16px', borderRadius: '16px', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.9rem', fontWeight: 700, border: '1px solid rgba(0, 255, 163, 0.2)' }}
                >
                    <Sparkles size={18} /> {success}
                </motion.div>
            )}
        </AnimatePresence>

        <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleAuth}
            style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}
        >
            <div style={{ position: 'relative' }}>
            <Mail style={{ position: 'absolute', left: '20px', top: '18px', color: 'var(--color-text-dim)' }} size={20} />
            <input 
                type="email" 
                required 
                placeholder="Ecosystem ID (Email)" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ width: '100%', height: '56px', borderRadius: '20px', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', padding: '0 20px 0 56px', fontSize: '1rem', fontWeight: 600, outline: 'none', color: 'var(--color-text-main)' }}
            />
            </div>

            <div style={{ position: 'relative' }}>
            <Lock style={{ position: 'absolute', left: '20px', top: '18px', color: 'var(--color-text-dim)' }} size={20} />
            <input 
                type="password" 
                required 
                placeholder="Biometric Passcode" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ width: '100%', height: '56px', borderRadius: '20px', background: 'var(--color-bg-elevated)', border: '1px solid var(--color-border)', padding: '0 20px 0 56px', fontSize: '1rem', fontWeight: 600, outline: 'none', color: 'var(--color-text-main)' }}
            />
            </div>

            <button 
                className="btn-primary" 
                type="submit" 
                disabled={loading}
                style={{ height: '64px', borderRadius: '24px', marginTop: '24px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '12px', fontSize: '1.1rem', fontWeight: 900, cursor: 'pointer', transition: 'all 0.3s ease' }}
            >
                {loading ? <RefreshCcw className="animate-spin" size={20} /> : (isLogin ? <><LogIn size={20} /> INITIALIZE CALIBRATION</> : <><UserPlus size={20} /> REGISTER PROFILE</>)}
            </button>

            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
                <button 
                    type="button"
                    onClick={() => setIsLogin(!isLogin)}
                    style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontWeight: 800, cursor: 'pointer', fontSize: '0.9rem', textTransform: 'uppercase' }}
                >
                    {isLogin ? 'Create New Profile' : 'Existing Profile Sync'}
                </button>
            </div>
        </motion.form>

        <div style={{ textAlign: 'center', marginTop: '60px' }}>
           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', color: 'var(--color-text-dim)', fontWeight: 800, fontSize: '0.7rem' }}>
              <Brain size={16} color="var(--color-secondary)" />
              POWERED BY VISION AI ECOSYSTEM v4.2
           </div>
        </div>
      </div>
    </div>
  );
}
