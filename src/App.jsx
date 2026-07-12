import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VideoDownloader from './components/VideoDownloader';
import Login from './components/Login';
import { supabase } from './supabaseClient';

function App() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setupAxios(session);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setupAxios(session);
    });

    return () => subscription.unsubscribe();
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

  return (
    <VideoDownloader session={session} />
  );
}

export default App;
