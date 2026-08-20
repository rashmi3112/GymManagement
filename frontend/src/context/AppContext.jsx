// src/context/AppContext.jsx
import { createContext, useContext, useReducer, useCallback } from 'react';

const AppContext = createContext(null);

const initialState = {
  sidebarCollapsed: false,
  notifications: [],
  unreadCount: 0,
  theme: 'dark',
  gymSettings: {
    name: 'FitCore Gym',
    currency: '₹',
    logo: null,
  },
  toasts: [],
};

function appReducer(state, action) {
  switch (action.type) {
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarCollapsed: !state.sidebarCollapsed };
    case 'SET_NOTIFICATIONS':
      return {
        ...state,
        notifications: action.payload,
        unreadCount: action.payload.filter((n) => !n.read).length,
      };
    case 'MARK_NOTIFICATION_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.payload ? { ...n, read: true } : n
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      };
    case 'MARK_ALL_READ':
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      };
    case 'SET_GYM_SETTINGS':
      return { ...state, gymSettings: { ...state.gymSettings, ...action.payload } };
    case 'ADD_TOAST':
      return { ...state, toasts: [...state.toasts, action.payload] };
    case 'REMOVE_TOAST':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.payload) };
    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  const toggleSidebar = useCallback(() => dispatch({ type: 'TOGGLE_SIDEBAR' }), []);

  const setNotifications = useCallback(
    (notifications) => dispatch({ type: 'SET_NOTIFICATIONS', payload: notifications }),
    []
  );

  const markNotificationRead = useCallback(
    (id) => dispatch({ type: 'MARK_NOTIFICATION_READ', payload: id }),
    []
  );

  const markAllNotificationsRead = useCallback(
    () => dispatch({ type: 'MARK_ALL_READ' }),
    []
  );

  const setGymSettings = useCallback(
    (settings) => dispatch({ type: 'SET_GYM_SETTINGS', payload: settings }),
    []
  );

  return (
    <AppContext.Provider
      value={{
        ...state,
        toggleSidebar,
        setNotifications,
        markNotificationRead,
        markAllNotificationsRead,
        setGymSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};
