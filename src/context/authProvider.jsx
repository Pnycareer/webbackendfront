import { useEffect, useReducer, useState } from 'react';
import AuthContext from './authContext';
import { setSession, getToken, isValidToken, jwtDecode } from './session';

const initialState = {
  isAuthenticated: false,
  user: null,
};

function reducer(state, action) {
  switch (action.type) {
    case 'LOGIN':
      return {
        isAuthenticated: true,
        user: action.payload,
      };
    case 'LOGOUT':
      return {
        isAuthenticated: false,
        user: null,
      };
    default:
      return state;
  }
}

export default function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const [isInitialized, setIsInitialized] = useState(false); // 👈 new state

  useEffect(() => {
    const initialize = async () => {
      try {
        const token = getToken();
        if (token && isValidToken(token)) {
          const user = jwtDecode(token);
          setSession(token);
          dispatch({ type: 'LOGIN', payload: user });
        }
      } catch (err) {
        console.error('Auth init failed:', err);
      } finally {
        setIsInitialized(true); // ✅ mark as ready
      }
    };

    initialize();
  }, []);

  const login = (token) => {
    const user = jwtDecode(token);
    setSession(token);
    dispatch({ type: 'LOGIN', payload: user });
  };

  const logout = () => {
    setSession(null);
    dispatch({ type: 'LOGOUT' });
  };

  // ⛔ Don’t render children until initialized
  if (!isInitialized) return <div className="p-4 text-center">Loading auth...</div>;

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
