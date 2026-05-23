'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';

function ToastInner() {
  const searchParams = useSearchParams();
  const success = searchParams.get('success');
  const error = searchParams.get('error');
  const [visible, setVisible] = useState(false);

  const isSuccess = success === 'zoho_connected';
  const isError = error === 'zoho_auth_failed' || error === 'zoho_token_exchange_failed';

  const message = isSuccess
    ? 'Zoho Bookings connected successfully!'
    : isError
      ? error === 'zoho_auth_failed'
        ? 'Zoho authorization was denied or cancelled.'
        : 'Failed to exchange Zoho token. Please try again.'
      : null;

  useEffect(() => {
    if (message) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  if (!visible || !message) return null;

  return (
    <div className={`ns-toast${isSuccess ? ' ns-toast--success' : ' ns-toast--error'}`} role="alert">
      {isSuccess ? (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M2 7l4 4 6-6"/></svg>
      ) : (
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"><path d="M2 2l10 10M12 2L2 12"/></svg>
      )}
      {message}
    </div>
  );
}

import { Suspense } from 'react';

export default function IntegrationsToast() {
  return (
    <Suspense fallback={null}>
      <ToastInner />
    </Suspense>
  );
}
