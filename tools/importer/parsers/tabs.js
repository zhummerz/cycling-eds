/* eslint-disable */
/* global WebImporter */

/**
 * Parser for tabs block.
 * Base: tabs. Source: https://www.honeywell.com/us/en
 *
 * Pattern A - What We Do (section-3): .leftrailwithcontent.left-rail-v2-styles
 *   Left-rail navigation with 11 industry verticals.
 *
 * Pattern B - Digitalization (section-5): .accordion.p-15 (3 instances)
 *   3 accordion items combined into ONE tabs block.
 *   Uses marker to prevent duplicate parsing of sibling accordions.
 */
export default function parse(element, { document }) {
  const cells = [];

  const isLeftRail = element.classList.contains('leftrailwithcontent')
    || element.querySelector('.leftrailwithcontent');
  const isAccordion = element.classList.contains('accordion')
    || element.querySelector('.accordion');

  if (isLeftRail) {
    // Pattern A: What We Do - left rail industry navigation
    const leftRail = element.classList.contains('leftrailwithcontent')
      ? element
      : element.querySelector('.leftrailwithcontent');

    const tabLinks = leftRail.querySelectorAll('a[href*="#"]');
    const seen = new Set();

    tabLinks.forEach((link) => {
      const text = link.textContent.trim();
      if (!text || seen.has(text)) return;
      seen.add(text);

      const label = document.createElement('p');
      label.textContent = text;

      const slug = link.getAttribute('href').split('#').pop();
      // Try to find the "LEARN ABOUT" link for this industry
      const learnLink = leftRail.querySelector(
        `a[href*="/industries/${slug}"], a[href$="/${slug}"]`
      );

      const content = document.createElement('p');
      if (learnLink && !learnLink.getAttribute('href').includes('#')) {
        const a = document.createElement('a');
        a.href = learnLink.href || learnLink.getAttribute('href');
        a.textContent = `Learn about ${text}`;
        content.appendChild(a);
      } else {
        // Fallback: construct the industries link from the slug
        const a = document.createElement('a');
        a.href = `/us/en/industries/${slug}`;
        a.textContent = `Learn about ${text}`;
        content.appendChild(a);
      }

      cells.push([[label], [content]]);
    });
  } else if (isAccordion) {
    // Pattern B: Digitalization accordion tabs
    // Skip if already processed by a sibling
    if (element.dataset.tabsParsed === 'true') return;

    const accordionEl = element.classList.contains('accordion') ? element : element.querySelector('.accordion');
    if (!accordionEl) {
      const block = WebImporter.Blocks.createBlock(document, { name: 'tabs', cells });
      element.replaceWith(block);
      return;
    }

    // Find ALL sibling accordions and combine into one tabs block
    const parent = accordionEl.parentElement;
    const allAccordions = parent
      ? Array.from(parent.querySelectorAll(':scope > .accordion.p-15'))
      : [accordionEl];

    // Mark all siblings as parsed to prevent duplicate processing
    allAccordions.forEach((acc) => { acc.dataset.tabsParsed = 'true'; });

    // Find the overlap-bottom section for detail content
    const overlapSection = document.querySelector('.section.overlap-bottom');

    allAccordions.forEach((acc, i) => {
      const titleEl = acc.querySelector('.advancedaccordion-title, [class*="accordion-title"], button');
      const label = document.createElement('p');
      label.textContent = titleEl ? titleEl.textContent.trim() : `Tab ${i + 1}`;

      const panelEl = acc.querySelector('.advancedaccordion-content, [class*="accordion-content"]');
      const contentWrapper = document.createElement('div');

      if (panelEl) {
        const panelText = panelEl.querySelector('p');
        if (panelText) {
          const p = document.createElement('p');
          p.textContent = panelText.textContent.trim();
          contentWrapper.appendChild(p);
        }
      }

      // Add overlap section content only to the first tab
      if (i === 0 && overlapSection) {
        const heading = overlapSection.querySelector('h5, h4, h3');
        const desc = overlapSection.querySelector('.cmp-text p');
        const cta = overlapSection.querySelector('.cta a, .cmp-call-to-action a');

        if (heading) {
          const h = document.createElement('h5');
          h.textContent = heading.textContent.trim();
          contentWrapper.appendChild(h);
        }
        if (desc) {
          const p = document.createElement('p');
          p.textContent = desc.textContent.trim();
          contentWrapper.appendChild(p);
        }
        if (cta) {
          const link = document.createElement('a');
          link.href = cta.href || cta.getAttribute('href');
          link.textContent = cta.textContent.trim();
          const p = document.createElement('p');
          p.appendChild(link);
          contentWrapper.appendChild(p);
        }

        // Remove the overlap section from the DOM so it doesn't appear as orphaned content
        overlapSection.remove();
      }

      cells.push([[label], [contentWrapper]]);
    });

    // Remove the sibling accordions from the DOM (they're now inside the combined block)
    allAccordions.slice(1).forEach((acc) => acc.remove());
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'tabs', cells });
  element.replaceWith(block);
}
