(function () {
  const config = window.AURA_CONFIG || {};
  const measurementId = String(config.gaMeasurementId || '').trim();
  const enabled = /^G-[A-Z0-9]{6,}$/.test(measurementId) && !/X{4,}/i.test(measurementId);

  window.auraTrack = function (eventName, params) {
    if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params || {});
    }
  };

  window.auraAnalyticsEnabled = false;

  if (!enabled) return;

  const script = document.createElement('script');
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(measurementId)}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () {
    window.dataLayer.push(arguments);
  };

  window.gtag('js', new Date());
  window.gtag('config', measurementId, {
    anonymize_ip: true,
    send_page_view: true,
    allow_google_signals: false,
    allow_ad_personalization_signals: false
  });

  window.auraAnalyticsEnabled = true;
})();
