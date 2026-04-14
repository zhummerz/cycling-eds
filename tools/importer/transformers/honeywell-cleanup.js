/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Honeywell site-wide cleanup.
 * Selectors from captured DOM of https://www.honeywell.com/us/en
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.before) {
    // Remove cookie consent, tracking, analytics overlays (from captured DOM)
    WebImporter.DOMUtils.remove(element, [
      '#onetrust-consent-sdk',
      '[class*="onetrust"]',
      '[id*="onetrust"]',
      '[class*="cookie"]',
      '.optanon-alert-box-wrapper',
      '#_evidon_banner',
      '#drift-widget',
      '[id*="CybotCookiebot"]',
    ]);

    // Remove analytics and tracking elements
    WebImporter.DOMUtils.remove(element, [
      '.page-load-analytics-data',
      '.page_global_info',
      '.user_global_info',
      '.page_load_event_info',
      '[data-datalayer-sbgname]',
    ]);

    // Remove notification banners
    WebImporter.DOMUtils.remove(element, [
      '.globalnotification',
    ]);

    // Fix overflow issues that can affect scraping
    const overflowEls = element.querySelectorAll('[style*="overflow: hidden"]');
    overflowEls.forEach((el) => { el.style.overflow = 'visible'; });
  }

  if (hookName === H.after) {
    // Remove non-authorable site chrome (from captured DOM)
    WebImporter.DOMUtils.remove(element, [
      // Header/navigation experience fragment
      '.localized-experiencefragment:has(.cmp-experiencefragment--header)',
      '.cmp-experiencefragment--header',
      '.header',
      '.global-header-container',
      'header',
      'nav',

      // Footer experience fragment
      '.flexible-footer',
      '.localized-experiencefragment:has(.cmp-experiencefragment--footer)',
      'footer',

      // Breadcrumbs
      '.breadcrumb',

      // Utility elements
      'iframe',
      'link',
      'noscript',

      // Hidden utility divs
      '.d-none',
      '[class*="htmlcontainer"]',
      'input[type="hidden"]',
    ]);

    // Remove tracking pixel images
    element.querySelectorAll('img').forEach((img) => {
      const src = img.src || '';
      if (src.includes('analytics') || src.includes('adsct') || src.includes('bing.com')
        || src.includes('rlcdn') || src.includes('cookielaw') || src.includes('bat.bing')
        || src.includes('t.co/i/') || src.includes('facebook.com/tr')) {
        img.remove();
      }
    });

    // Clean tracking attributes
    element.querySelectorAll('*').forEach((el) => {
      el.removeAttribute('data-track');
      el.removeAttribute('onclick');
      el.removeAttribute('data-analytics');
      el.removeAttribute('data-datalayer-sbgname');
    });
  }
}
