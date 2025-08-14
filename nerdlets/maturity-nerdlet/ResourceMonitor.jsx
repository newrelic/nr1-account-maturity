/* eslint-disable */
import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef
} from 'react';
import { Button, navigation } from 'nr1';

const ResourceMonitorContext = createContext({
  startTracking: () => {},
  stopTracking: () => {}
});

export const useResourceMonitor = () => useContext(ResourceMonitorContext);

export function ResourceMonitorProvider({ children, timeLimitMinutes = 5 }) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [usagePercent, setUsagePercent] = useState(null);

  const timerRef = useRef(null);
  const memoryCheckIntervalRef = useRef(null);

  const supportsMemory = !!(window.performance && window.performance.memory);

  useEffect(() => {
    if (supportsMemory) {
      memoryCheckIntervalRef.current = setInterval(() => {
        const { usedJSHeapSize, jsHeapSizeLimit } = performance.memory;
        const percent = (usedJSHeapSize / jsHeapSizeLimit) * 100;
        setUsagePercent(percent);

        // console.log('tracking', percent);
        if (percent >= 80 && !showPrompt) {
          setShowPrompt(true);
        }
      }, 3000);
    }

    return () => {
      clearInterval(memoryCheckIntervalRef.current);
      clearTimeout(timerRef.current);
    };
  }, [supportsMemory, showPrompt]);

  const startTracking = () => {
    if (!timerRef.current) {
      timerRef.current = setTimeout(() => {
        setShowPrompt(true);
      }, 1000);
    }
  };

  const stopTracking = () => {
    if (timerRef.current) {
      setShowPrompt(false);
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleReload = () =>
    navigation.getOpenLauncherLocation({ id: 'maturity-launcher' });
  // const handleReload = window.location.reload;
  const handleContinue = () => setShowPrompt(false);

  return (
    <ResourceMonitorContext.Provider value={{ startTracking, stopTracking }}>
      {children}
      {showPrompt && (
        <div style={modalStyle}>
          <h2>Resource Usage Warning</h2>
          <br />
          <p>
            This report is taking a long time to run - it is not likely to
            complete successfully and may cause the application to crash. We
            recommend canceling this query and applying additional filters to
            reduce the number of entities included in scope.
          </p>
          <br />
          {/* {supportsMemory ? (
            <p>
              Memory usage is at {usagePercent?.toFixed(2)}% of the allowed
              limit.
            </p>
          ) : (
            <p>
              You've been using this feature for over {timeLimitMinutes}{' '}
              minutes.
            </p>
          )} */}
          <br />
          <Button
            onClick={() =>
              navigation.replaceNerdlet({
                id: 'redirector-nerdlet',
                urlState: {
                  time: new Date().getTime(),
                  redirectNerdlet: 'maturity-nerdlet'
                }
              })
            }
          >
            Cancel Query
          </Button>
          &nbsp;
          <Button onClick={handleContinue}>Continue</Button>
        </div>
      )}
    </ResourceMonitorContext.Provider>
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
