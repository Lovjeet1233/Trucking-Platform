// pages/_app.js
import '../styles/globals.css';
import { AuthProvider } from '../context/auth/AuthContext';
import { AlertProvider } from '../context/alert/AlertContext';

function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <AlertProvider>
        <Component {...pageProps} />
      </AlertProvider>
    </AuthProvider>
  );
}

export default MyApp;






