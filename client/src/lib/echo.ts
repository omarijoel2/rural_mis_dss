import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// Simple Echo initializer. It reads auth token from localStorage and exposes
// Echo on window to let pages subscribe to private channels.

const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

let echo: any = null;

try {
  (window as any).Pusher = Pusher;

  echo = new (Echo as any)({
    broadcaster: 'pusher',
    key: import.meta.env.VITE_PUSHER_KEY || (window as any).__PUSHER_KEY__ || '',
    cluster: import.meta.env.VITE_PUSHER_CLUSTER || (window as any).__PUSHER_CLUSTER__ || undefined,
    forceTLS: true,
    auth: {
      headers: {
        Authorization: token ? `Bearer ${token}` : undefined,
      },
    },
  });

  (window as any).Echo = echo;
} catch (e) {
  // If Echo/Pusher not installed or misconfigured, fail silently — feature is optional.
  // Console-info for developer visibility.
  // eslint-disable-next-line no-console
  console.info('Echo initializer: not configured or failed to initialize', e);
}

export default echo;
