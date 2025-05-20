import { useEffect } from 'react';
import { TestComponent } from '@/components/TestComponent';
import './App.css';

function App() {
  useEffect(() => {
    console.log('App component mounted');
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 p-4">
      <h1 className="text-2xl font-bold mb-4">VibeCode IDE</h1>
      <TestComponent />
    </div>
  );
}

export default App;