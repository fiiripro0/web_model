import React from 'react';
import { AudioProvider } from './contexts/AudioContext';
import { Dashboard } from './pages/Dashboard';

function App() {
  return (
    <AudioProvider>
      <Dashboard />
    </AudioProvider>
  );
}

export default App;