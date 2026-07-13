import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VideoDownloader from './components/VideoDownloader';
import Login from './components/Login';
import AdminPanel from './components/AdminPanel';
import { supabase } from './supabaseClient';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showAdmin, setShowAdmin] = useState(false);

  useEffect(() => {
    // Get initial session
    const initSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setupAxios(session);
      setLoading(false);
    };
    
    initSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setupAxios(session);
    });

    // Force session refresh when app comes to foreground (fixes mobile sleep issues)
    const handleVisibilityChange = async () => {
      if (document.visibilityState === 'visible') {
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        setupAxios(session);
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleVisibilityChange);

    return () => {
      subscription.unsubscribe();
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleVisibilityChange);
    };
  }, []);

  const setupAxios = (session) => {
    // Clear previous interceptors to avoid stacking
    axios.interceptors.request.clear();
    axios.interceptors.response.clear();

    axios.interceptors.request.use((config) => {
      if (session?.access_token) {
        config.headers.Authorization = `Bearer ${session.access_token}`;
      }
      return config;
    }, (error) => Promise.reject(error));

    // Handle 401 errors gracefully without aggressively signing out, 
    // as Supabase might be in the middle of refreshing the token.
    axios.interceptors.response.use(
      (response) => response,
      async (error) => {
        // We let Supabase handle the actual session state.
        return Promise.reject(error);
      }
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#030014] text-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!session) {
    return <Login onLogin={() => {}} />; // onLogin not needed anymore as onAuthStateChange handles it
  }

  if (showAdmin) {
    return <AdminPanel onBack={() => setShowAdmin(false)} />;
  }

  return (
    <VideoDownloader session={session} onAdminClick={() => setShowAdmin(true)} isAdmin={session.user.email === 'as65012007@gmail.com'} />
  );
}

export default App;
