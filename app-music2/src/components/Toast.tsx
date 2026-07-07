import { useState, useEffect, useCallback } from 'react';

export function useToast() {
  const [message, setMessage] = useState('');
  const [visible, setVisible] = useState(false);

  const showToast = useCallback((msg: string) => {
    setMessage(msg);
    setVisible(true);
  }, []);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => setVisible(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  const Toast = () => (
    <div id="toast" className={visible ? 'show' : ''}>
      {message}
    </div>
  );

  return { showToast, Toast };
}
