
// context/alert/AlertContext.js
import { createContext, useContext, useReducer } from 'react';
import { v4 as uuidv4 } from 'uuid';
import alertReducer from './alertReducer';
import {
  SET_ALERT,
  REMOVE_ALERT
} from '../types';

// Create context
const AlertContext = createContext();

// Provider component
export const AlertProvider = ({ children }) => {
  const initialState = [];

  const [state, dispatch] = useReducer(alertReducer, initialState);

  // Set Alert
  const setAlert = (msg, type, timeout = 5000) => {
    const id = uuidv4();
    dispatch({
      type: SET_ALERT,
      payload: { msg, type, id }
    });

    setTimeout(() => dispatch({ type: REMOVE_ALERT, payload: id }), timeout);
  };

  return (
    <AlertContext.Provider
      value={{
        alerts: state,
        setAlert
      }}
    >
      {children}
    </AlertContext.Provider>
  );
};

// Custom hook for using alert context
export const useAlert = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};

export default AlertContext;