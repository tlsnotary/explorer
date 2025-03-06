import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

declare global {
  interface Window {
    _paq?: any[];
  }
}

const MatomoTracking = () => {
  const location = useLocation();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      var _paq = (window._paq = window._paq || []);
      _paq.push(['setTrackerUrl', 'https://psedev.matomo.cloud/matomo.php']);
      _paq.push(['setSiteId', '16']);
      let script = document.createElement('script');
      script.async = true;
      script.src = 'https://cdn.matomo.cloud/psedev.matomo.cloud/matomo.js';
      document.head.appendChild(script);
    }
  }, []);

  useEffect(() => {

    if (typeof window !== 'undefined' && window._paq) {
      window._paq.push(['setCustomUrl', window.location.pathname]);
      window._paq.push(['trackPageView']);
    }
  }, [location.pathname]);
  return null;
};

export default MatomoTracking;
