import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import Analyze from './pages/Analyze';
import History from './pages/History';
import Community from './pages/Community';
import Profile from './pages/Profile';
import Onboarding from './pages/Onboarding';
import Reports from './pages/Reports';
import RecipeBuilder from './pages/RecipeBuilder';
import { useState, useEffect } from 'react';
import { RefreshCcw } from 'lucide-react';
import { useAuth } from './contexts/AuthContext';
import { api } from './utils/api';

// NutriLens Root Ecosystem App
export default function App() {
  const { user, setUser, loading: authLoading, logout } = useAuth();

  const [profile, setProfile] = useState(null);
  const [meals, setMeals] = useState([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prev => prev === 'light' ? 'dark' : 'light');

  useEffect(() => {
    const fetchData = async () => {
      if (!user) {
        setProfile(null);
        setMeals([]);
        setDataLoading(false);
        return;
      }

      setDataLoading(true);
      try {
        const profileData = await api.request('/profile/');
        setProfile(profileData);

        if (profileData?.onboarded) {
          const mealsData = await api.request('/meals/');
          setMeals(mealsData || []);
        }
      } catch (error) {
        console.error("Error fetching app data:", error);
      } finally {
        setDataLoading(false);
      }
    };

    if (!authLoading) {
      fetchData();
    }
  }, [user, authLoading]);

  const addMeal = (meal) => setMeals(prev => [meal, ...prev]);
  
  const isSimulated = !import.meta.env.VITE_FIREBASE_API_KEY;

  if (authLoading || (user && dataLoading)) {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '20px', background: 'var(--color-background)' }}>
        <RefreshCcw className="animate-spin" size={40} color="var(--color-primary)" />
        <p style={{ fontWeight: 800, color: 'var(--color-text-tertiary)', letterSpacing: '0.05em' }}>VERIFYING BIO-IDENTITY...</p>
      </div>
    );
  }

  return (
    <BrowserRouter>
      {isSimulated && (
        <div style={{ background: 'var(--color-primary)', color: 'white', fontSize: '0.65rem', fontWeight: 900, textAlign: 'center', padding: '4px', position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999, letterSpacing: '0.1em' }}>
          VITALITY PRO: ECOSYSTEM CALIBRATION (SANDBOX MODE)
        </div>
      )}
      <Routes>
        {!user ? (
          <>
            <Route path="/auth" element={<Auth onLogin={(u) => setUser(u)} />} />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </>
        ) : !profile?.onboarded ? (
          <>
            <Route path="/onboarding" element={<Onboarding onComplete={(p) => setProfile({ ...p, onboarded: true })} />} />
            <Route path="*" element={<Navigate to="/onboarding" replace />} />
          </>
        ) : (
          <Route element={<Layout user={user} logout={logout} theme={theme} toggleTheme={toggleTheme} />}>
            <Route path="/" element={<Dashboard meals={meals} profile={profile} user={user} />} />
            <Route path="/analyze" element={<Analyze user={user} profile={profile} addMeal={addMeal} />} />
            <Route path="/history" element={<History meals={meals} user={user} />} />
            <Route path="/community" element={<Community user={user} />} />
            <Route path="/profile" element={<Profile user={user} profile={profile} logout={logout} />} />
            <Route path="/reports" element={<Reports meals={meals} profile={profile} user={user} />} />
            <Route path="/recipes" element={<RecipeBuilder user={user} />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        )}
      </Routes>
    </BrowserRouter>
  );
}
