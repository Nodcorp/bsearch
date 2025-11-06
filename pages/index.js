// pages/index.js 
import { useEffect } from 'react';

export default function Home() {
  useEffect(() => {
    window.location.href = '/api/proxy';
  }, []);

  return (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
      <p>Loading Blekko…</p>
    </div>
  );
}
