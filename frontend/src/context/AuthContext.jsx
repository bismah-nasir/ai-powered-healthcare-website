import { createContext, useState, useEffect, useContext } from 'react';
import { apiRequest, setUnauthorizedHandler } from '../services/api';
import { useNotify } from './NotificationContext';

const AuthContext = createContext(null);

const TOKEN_STORAGE_KEY = 'token';
const USER_STORAGE_KEY = 'user';

// Profile fields kept in auth state (the API response also carries the token)
const toSessionUser = (data) => ({
  _id: data._id,
  name: data.name,
  email: data.email,
  phone: data.phone || '',
  role: data.role,
});

// Last verified profile, used when the server can't be reached on load
const loadSavedUser = () => {
  try {
    const parsed = JSON.parse(localStorage.getItem(USER_STORAGE_KEY));
    if (parsed && typeof parsed === 'object' && typeof parsed._id === 'string' && typeof parsed.name === 'string') {
      return toSessionUser(parsed);
    }
  } catch {
    // Unreadable JSON or storage blocked by the browser
  }
  return null;
};

const saveSession = (token, user) => {
  try {
    if (token) localStorage.setItem(TOKEN_STORAGE_KEY, token);
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch (error) {
    // Storage full or blocked: the session still works until the tab is closed
    console.error('[Auth Context] Could not save session:', error.message);
  }
};

const clearSavedSession = () => {
  try {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(USER_STORAGE_KEY);
  } catch {
    // Storage blocked: nothing was saved
  }
};

const readSavedToken = () => {
  try {
    return localStorage.getItem(TOKEN_STORAGE_KEY);
  } catch {
    return null;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  const { showNotice } = useNotify();

  // Logout handler
  const logout = () => {
    clearSavedSession();
    setToken(null);
    setUser(null);
  };

  // End the session when the server rejects the current token (expired, password changed, account deleted).
  // A 401 for an older token is ignored, so a slow request can't log out a newer login.
  useEffect(() => {
    return setUnauthorizedHandler((rejectedToken) => {
      if (rejectedToken !== readSavedToken()) return;

      clearSavedSession();
      setToken(null);
      setUser(null);
      showNotice({ message: 'Your session has expired. Please sign in again.', tone: 'warning' });
    });
  }, [showNotice]);

  // Sync token and user profile on load
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = readSavedToken();
      if (storedToken) {
        setToken(storedToken);
        try {
          // Fetch current profile to verify token is valid and active
          const { ok, status, data } = await apiRequest('/api/auth/profile', { token: storedToken });

          if (ok && data.success) {
            const profile = toSessionUser(data.data);
            saveSession(null, profile);
            setUser(profile);
          } else if (status !== 401) {
            // Server trouble (5xx, rate limit) is not a reason to log out; a 401 is handled above
            setUser(loadSavedUser());
          }
        } catch (error) {
          // Offline or backend down: keep the session and use the last known profile
          console.error('[Auth Context] Initialization error:', error.message);
          setUser(loadSavedUser());
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  // Login handler
  const login = async (email, password) => {
    try {
      const { data } = await apiRequest('/api/auth/login', {
        method: 'POST',
        body: { email, password },
      });

      if (data.success) {
        const profile = toSessionUser(data.data);
        saveSession(data.data.token, profile);
        setToken(data.data.token);
        setUser(profile);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('[Auth Context] Login error:', error.message);
      return { success: false, message: 'Server connection failed. Try again later.' };
    }
  };

  // Registration handler
  const signup = async (name, email, password, phone) => {
    try {
      const { data } = await apiRequest('/api/auth/signup', {
        method: 'POST',
        body: { name, email, password, phone },
      });

      if (data.success) {
        const profile = toSessionUser(data.data);
        saveSession(data.data.token, profile);
        setToken(data.data.token);
        setUser(profile);
        return { success: true };
      } else {
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('[Auth Context] Signup error:', error.message);
      return { success: false, message: 'Server connection failed. Try again later.' };
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for simple context consumption
// eslint-disable-next-line react-refresh/only-export-components -- hook is kept next to its provider
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
