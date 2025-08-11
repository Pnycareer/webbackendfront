import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AuthLock() {
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleUnlock = () => {
    if (password === 'admin123') {
      localStorage.setItem('unlocked', 'true');
      navigate('/');
    } else {
      alert('Wrong password');
    }
  };

  return (
    <div className="h-screen w-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex items-center justify-center">
      <div className="backdrop-blur-md bg-white/5 border border-white/10 rounded-2xl shadow-2xl px-8 py-10 w-full max-w-sm">
        <h2 className="text-2xl font-semibold text-white text-center mb-6 flex items-center justify-center gap-2">
          <span role="img" aria-label="lock">🔒</span> Enter App Password
        </h2>

        <input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 rounded-md text-white bg-white/10 placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />

        <button
          onClick={handleUnlock}
          className="w-full p-3 rounded-md bg-blue-600 hover:bg-blue-700 text-white font-medium transition-all duration-200"
        >
          Unlock
        </button>
      </div>
    </div>
  );
}
