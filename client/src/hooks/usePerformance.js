import { useRef, useCallback } from "react";

export const usePerformance = () => {
  const renderCount = useRef(0);

  const logRender = useCallback((componentName) => {
    renderCount.current += 1;
    if (process.env.NODE_ENV === 'development') {
      console.log(`🔁 ${componentName} rendered:`, renderCount.current);
    }
  }, []);

  const memoizedCallback = useCallback((callback, deps = []) => {
    return useCallback(callback, deps);
  }, []);

  return {
    logRender,
    memoizedCallback,
    renderCount: renderCount.current
  };
};

// Optimized version of useState that prevents unnecessary re-renders
export const useStableState = (initialValue) => {
  const [state, setState] = useState(initialValue);
  const stateRef = useRef(state);

  const setStableState = useCallback((newValue) => {
    if (JSON.stringify(stateRef.current) !== JSON.stringify(newValue)) {
      stateRef.current = newValue;
      setState(newValue);
    }
  }, []);

  return [state, setStableState];
};