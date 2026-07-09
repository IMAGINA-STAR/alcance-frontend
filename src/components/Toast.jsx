import { useState, useCallback } from 'react';

export function useToast() {
  const [toast, setToast] = useState({ msg: '', show: false, error: false });

  const showToast = useCallback((msg, error = false) => {
    setToast({ msg, show: true, error });
    setTimeout(() => setToast((t) => ({ ...t, show: false })), 2600);
  }, []);

  return { toast, showToast };
}

export function Toast({ toast }) {
  return (
    <div className={`toast ${toast.show ? 'show' : ''} ${toast.error ? 'error' : ''}`}>
      {toast.msg}
    </div>
  );
}
