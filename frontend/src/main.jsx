import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { ApolloProvider } from '@apollo/client';
import { Toaster } from 'react-hot-toast';
import client from './apollo/client';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider>
      <ApolloProvider client={client}>
        <AuthProvider>
          <BrowserRouter>
            <Toaster
              position="top-right"
              toastOptions={{
                style: {
                  background: 'var(--elevated)',
                  color: 'var(--text)',
                  border: '1px solid var(--border)',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 500,
                  boxShadow: 'var(--shadow-lg)',
                },
              }}
            />
            <App />
          </BrowserRouter>
        </AuthProvider>
      </ApolloProvider>
    </ThemeProvider>
  </React.StrictMode>
);
