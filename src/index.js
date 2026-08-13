import React from 'react';
import { createRoot } from 'react-dom/client';
import { ConfigProvider } from 'antd';
import { Provider } from 'react-redux';
import { GoogleOAuthProvider } from '@react-oauth/google';

// Import order is load-bearing: tokens before Bootstrap, base after it,
// otherwise Bootstrap's defaults win silently.
import './styles/tokens.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/base.css';
import { cliniqDarkTheme } from './styles/theme';

import App from './App';
import { store } from './redux/store';

const root = createRoot(document.getElementById('root'));

root.render(
  <React.StrictMode>
    <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <Provider store={store}>
        <ConfigProvider theme={cliniqDarkTheme}>
          <App />
        </ConfigProvider>
      </Provider>
    </GoogleOAuthProvider>
  </React.StrictMode>
);
