/* eslint-disable */
/* global WebImporter */

/**
 * Parser for hero block.
 * Base: hero. Source: https://www.honeywell.com/us/en
 * Selector: .section.responsivegrid:has(h1)
 *
 * Source DOM structure (from captured HTML):
 * - .cmp-section-container-preview-mode[style="background: url(//honeywell.scene7.com/...)"]
 *   - .text.pt-30 > .cmp-text > h1 (heading with colored spans)
 *   - .text.pt-30 > .cmp-text > p.desc (description)
 *   - .cta.cta--primary > .cmp-call-to-action > a (CTA link)
 *
 * Target block structure (from _hero.json):
 * Row 1: [image] [rich text: heading + description + CTA]
 */
export default function parse(element, { document }) {
  // Extract background image from inline style
  const bgContainer = element.querySelector('[style*="background"]');
  let bgImageUrl = '';
  if (bgContainer) {
    const style = bgContainer.getAttribute('style') || '';
    const match = style.match(/url\(([^)]+)\)/);
    if (match) {
      bgImageUrl = match[1].replace(/['"]/g, '').trim();
      // Fix protocol-relative URLs
      if (bgImageUrl.startsWith('//')) {
        bgImageUrl = 'https:' + bgImageUrl;
      }
    }
  }

  // Extract heading
  const heading = element.querySelector('h1');

  // Extract description paragraph
  const description = element.querySelector('p.desc, .cmp-text p:not(:empty)');

  // Extract CTA link
  const ctaContainer = element.querySelector('.cta a, .cmp-call-to-action a');

  // Build image cell
  const cells = [];

  if (bgImageUrl) {
    const img = document.createElement('img');
    img.src = bgImageUrl;
    img.alt = bgContainer?.getAttribute('alt') || 'Hero background';
    cells.push([img]);
  }

  // Build content cell: heading + description + CTA
  const contentCell = [];
  if (heading) contentCell.push(heading);
  if (description) contentCell.push(description);
  if (ctaContainer) {
    const link = document.createElement('a');
    link.href = ctaContainer.href || ctaContainer.getAttribute('href');
    link.textContent = ctaContainer.textContent.trim();
    const strong = document.createElement('strong');
    strong.appendChild(link);
    const p = document.createElement('p');
    p.appendChild(strong);
    contentCell.push(p);
  }
  cells.push(contentCell);

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero', cells });
  element.replaceWith(block);
}
