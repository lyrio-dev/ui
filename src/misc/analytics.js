function getScript(url) {
  const script = document.createElement("script");
  script.src = url;
  script.async = true;
  document.head.appendChild(script);
}

/**
 * @param {string} googleAnalyticsId
 */
export function loadGoogleAnalytics(googleAnalyticsId) {
  if (!googleAnalyticsId) return;

  if (googleAnalyticsId.startsWith("G")) {
    // v4
    const dataLayer = [];
    window.dataLayer = dataLayer;
    window.gtag = function () {
      dataLayer.push(arguments);
    };
    gtag("js", new Date());
    gtag("config", googleAnalyticsId);

    getScript("https://www.googletagmanager.com/gtag/js?id=" + googleAnalyticsId);
  } else if (googleAnalyticsId.startsWith("UA")) {
    // v3
    window.ga = function () {
      (ga.q = ga.q || []).push(arguments);
    };
    ga.l = +new Date();

    import("autotrack/lib/plugins/event-tracker");
    import("autotrack/lib/plugins/outbound-link-tracker");
    import("autotrack/lib/plugins/url-change-tracker");

    ga("create", googleAnalyticsId, "auto");
    ga("require", "eventTracker");
    ga("require", "outboundLinkTracker");
    ga("require", "urlChangeTracker");
    ga("send", "pageview");

    getScript("https://www.google-analytics.com/analytics.js");
  } else {
    console.error("Invalid Google Analytics ID: " + googleAnalyticsId);
  }
}

loadGoogleAnalytics();
