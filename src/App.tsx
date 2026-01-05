import { useState } from 'react';
import { MapViewer } from './components/MapViewer';
import { Zap } from 'lucide-react';

function App() {
  const [isAllUnlocked, setIsAllUnlocked] = useState(false);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative' }}>
      {/* Sidebar */}
      <aside className="sidebar glass-morphism">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <div className="premium-gradient" style={{ width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Zap size={24} color="white" />
          </div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: '700' }}>React Under the Hood</h2>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>Settings</p>

          <div className="glass-morphism" style={{ padding: '10px 14px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: '500' }}>Master Map Access</span>
            <label className="switch">
              <input
                type="checkbox"
                checked={isAllUnlocked}
                onChange={() => setIsAllUnlocked(!isAllUnlocked)}
              />
              <span className="slider round"></span>
            </label>
          </div>
        </nav>
      </aside>



      {/* Main Content */}
      <main style={{ width: '100%', height: '100%' }}>
        <MapViewer isAllUnlocked={isAllUnlocked} />
      </main>

      {/* Floating Info */}
      <div style={{ position: 'absolute', bottom: '20px', right: '20px', pointerEvents: 'none' }}>
        <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Interactive Rendering Roadmap • v1.0</p>
      </div>
    </div>
  );
}

export default App;
