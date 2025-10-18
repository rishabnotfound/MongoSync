'use client';

import { useEffect, Suspense } from 'react';
import NProgress from 'nprogress';
import { usePathname, useSearchParams } from 'next/navigation';

// Configure NProgress globally
if (typeof window !== 'undefined') {
  NProgress.configure({
    showSpinner: false,
    trickleSpeed: 200,
    minimum: 0.1,
    easing: 'ease',
    speed: 500,
  });
}

// Export helper functions for manual control
export const startProgress = () => {
  if (typeof window !== 'undefined') {
    NProgress.start();
  }
};

export const stopProgress = () => {
  if (typeof window !== 'undefined') {
    NProgress.done();
  }
};

// Helper to wrap async operations with progress bar
export const withProgress = async <T,>(fn: () => Promise<T>): Promise<T> => {
  startProgress();
  try {
    const result = await fn();
    stopProgress();
    return result;
  } catch (error) {
    stopProgress();
    throw error;
  }
};

function ProgressBarComponent() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    NProgress.done();
  }, [pathname, searchParams]);

  // Listen for custom loading events
  useEffect(() => {
    const handleStart = () => NProgress.start();
    const handleStop = () => NProgress.done();

    window.addEventListener('loadingStart', handleStart);
    window.addEventListener('loadingComplete', handleStop);

    return () => {
      window.removeEventListener('loadingStart', handleStart);
      window.removeEventListener('loadingComplete', handleStop);
    };
  }, []);

  return null;
}

export function ProgressBar() {
  return (
    <Suspense fallback={null}>
      <ProgressBarComponent />
    </Suspense>
  );
}
