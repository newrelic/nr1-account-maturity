import React, { useEffect, useState } from 'react';
import { Button } from 'nr1';

function MemoryMonitor() {
  const [showPrompt, setShowPrompt] = useState(false);
  const [usagePercent, setUsagePercent] = useState(null);

  useEffect(() => {
    if (!window.performance || !window.performance.memory) return;

    const interval = setInterval(() => {
      const { usedJSHeapSize, jsHeapSizeLimit } = performance.memory;
      const percent = (usedJSHeapSize / jsHeapSizeLimit) * 100;
      setUsagePercent(percent);

      if (percent >= 80 && !showPrompt) {
        setShowPrompt(true);
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [showPrompt]);

  const handleReload = () => window.location.reload();
  const handleContinue = () => setShowPrompt(false);

  return (
    <>
      {showPrompt && (
        <div style={modalStyle}>
          <h2>High Memory Usage</h2>
          <p>You've used {usagePercent.toFixed(2)}% of available memory.</p>
          <Button onClick={handleReload}>Reload</Button>
          <Button onClick={handleContinue}>Ignore</Button>
        </div>
      )}
    </>
  );
}

const modalStyle = {
  position: 'fixed',
  top: '20%',
  left: '50%',
  transform: 'translateX(-50%)',
  background: 'white',
  padding: '2rem',
  border: '1px solid #ccc',
  boxShadow: '0 0 10px rgba(0,0,0,0.2)',
  zIndex: 9999
};

export default MemoryMonitor;
