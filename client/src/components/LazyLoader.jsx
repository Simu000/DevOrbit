import { useState, useEffect } from "react";

const LazyLoader = ({ children, fallback = null, delay = 0 }) => {
  const [show, setShow] = useState(!delay);

  useEffect(() => {
    if (delay) {
      const timer = setTimeout(() => setShow(true), delay);
      return () => clearTimeout(timer);
    }
  }, [delay]);

  if (!show) return fallback;

  return children;
};

export default LazyLoader;