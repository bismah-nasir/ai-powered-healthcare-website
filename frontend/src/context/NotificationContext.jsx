import { createContext, useContext, useState, useCallback } from 'react';
import Toast from '../components/common/Toast';

const NotificationContext = createContext();

// eslint-disable-next-line react-refresh/only-export-components -- hook is kept next to its provider
export const useNotify = () => useContext(NotificationContext);

export const NotificationProvider = ({ children }) => {
  // In-app alert: { id, message, tone, actions }
  const [notice, setNotice] = useState(null);

  const showNotice = useCallback(({ message, tone = 'warning', actions = [] }) => {
    setNotice({ id: Date.now(), message, tone, actions });
  }, []);

  const dismissNotice = useCallback(() => setNotice(null), []);

  return (
    <NotificationContext.Provider value={{ showNotice, dismissNotice }}>
      {children}
      {notice && (
        <Toast
          key={notice.id}
          message={notice.message}
          tone={notice.tone}
          actions={notice.actions}
          onClose={dismissNotice}
        />
      )}
    </NotificationContext.Provider>
  );
};
