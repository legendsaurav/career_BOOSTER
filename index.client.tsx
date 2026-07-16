
import React from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './index';
import './index.css';

// Error boundary so a single render throw shows the actual error instead of a blank white page.
class RootErrorBoundary extends React.Component<{ children: React.ReactNode }, { error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error: Error) {
    return { error };
  }
  componentDidCatch(error: Error, info: any) {
    console.error('App crashed during render:', error, info);
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '24px', fontFamily: 'monospace', color: '#b91c1c', whiteSpace: 'pre-wrap' }}>
          <h2 style={{ color: '#b91c1c' }}>The app hit a render error</h2>
          <div><strong>{this.state.error.name}: {this.state.error.message}</strong></div>
          <pre style={{ marginTop: 12, color: '#334155', fontSize: 12, overflow: 'auto' }}>{this.state.error.stack}</pre>
        </div>
      );
    }
    return this.props.children as any;
  }
}

const root = createRoot(document.getElementById('root'));
root.render(
  <RootErrorBoundary>
    <App />
  </RootErrorBoundary>
);
