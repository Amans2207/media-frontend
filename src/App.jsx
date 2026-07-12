import React, { useState, useEffect } from 'react';
import axios from 'axios';
import VideoDownloader from './components/VideoDownloader';
import Login from './components/Login';

// Configure Axios globally to inject the JWT token
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('mdp_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(() => {
    return !!localStorage.getItem('mdp_token');
  });

  // Handle logout interceptor (if backend returns 401 Unauthorized)
  useEffect(() => {
    const interceptor = axios.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('mdp_token');
          setIsAuthenticated(false);
        }
        return Promise.reject(error);
      }
    );
    return () => axios.interceptors.response.eject(interceptor);
  }, []);

  if (!isAuthenticated) {
    return <Login onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <VideoDownloader />
  );
}

export default App;
