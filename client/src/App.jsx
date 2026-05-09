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
import SkeletonLoader from './components/SkeletonLoader';
import { useState, useEffect } from 'react';

// NutriLens Root Ecosystem App
export default function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('v_user');
    return saved ? JSON.parse(saved) : { uid: 'test-user-vitality', email: 'vitality@nutrilens.com' };
  });

  const [profile, setProfile] = useState(() => {
    const saved = localStorage.getItem('v_profile');
    return saved ? JSON.parse(saved) : { onboarded: true, goal: 'maintain', activity: 'active' };
  });

  const [meals, setMeals] = useState(() => {
    const saved = localStorage.getItem('v_meals');
    const defaultMeals = [
      { id: 1, name: 'Greek Yogurt Bowl', calories: 280, protein: 18, carbs: 32, fat: 12, health_score: 8, timestamp: new Date(Date.now() - 86400000).toISOString() },
      { id: 2, name: 'Quinoa Salad', calories: 420, protein: 15, carbs: 55, fat: 14, health_score: 9, timestamp: new Date(Date.now() - 172800000).toISOString() },
      { id: 3, name: 'Grilled Salmon', calories: 350, protein: 34, carbs: 0, fat: 22, health_score: 10, timestamp: new Date(Date.now() - 259200000).toISOString() }
    ];
    return saved ? JSON.parse(saved) : defaultMeals;
  });

  useEffect(() => {
    localStorage.setItem('v_user', JSON.stringify(user));
    localStorage.setItem('v_profile', JSON.stringify(profile));
    localStorage.setItem('v_meals', JSON.stringify(meals));
  }, [user, profile, meals]);

  const addMeal = (meal) => setMeals(prev => [meal, ...prev]);
  const logout = () => {
    setUser(null);
    localStorage.removeItem('v_user');
  };

  const isSimulated = !import.meta.env.VITE_FIREBASE_API_KEY;

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
          <Route element={<Layout user={user} logout={logout} />}>
            <Route path="/" element={<Dashboard meals={meals} profile={profile} user={user} />} />
            <Route path="/analyze" element={<Analyze user={user} profile={profile} />} />
            <Route path="/history" element={<History meals={meals} />} />
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
