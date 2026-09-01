import React from 'react';
import ReactDOM from 'react-dom/client';
import { ConvexProvider, ConvexReactClient } from 'convex/react';
import { MidnightWalletProvider } from './context/MidnightWalletContext';
import { ConvexErrorBoundary } from './components/ConvexErrorBoundary';
import App from './App';
import './index.css';

const convexUrl = import.meta.env.VITE_CONVEX_URL || 'https://fine-rooster-248.convex.cloud';
const convex = new ConvexReactClient(convexUrl);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ConvexErrorBoundary>
      <ConvexProvider client={convex}>
        <MidnightWalletProvider>
          <App />
        </MidnightWalletProvider>
      </ConvexProvider>
    </ConvexErrorBoundary>
  </React.StrictMode>,
);
