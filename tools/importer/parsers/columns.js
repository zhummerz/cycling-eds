/* eslint-disable */
/* global WebImporter */

/**
 * Parser for columns block.
 * Base: columns. Source: https://www.honeywell.com/us/en
 *
 * Used for TWO section patterns:
 *
 * Pattern A - Mega Trends (section-2): .section.pt-0.pb-20
 *   3 columns, each with: image (Scene7) + category link + h6 description
 *   Source: .responsivegrid.bg-transparent.p-15 containers with .cmp-image + .text
 *
 * Pattern B - Contact CTAs (section-6): .responsivegrid.bg-light-gray.p-30
 *   2 columns, each with: eyebrow label (p) + description (p) + CTA link
 *   Source: .text + .cta containers side by side
 *
 * Target block structure (_columns.json):
 *   N rows x M columns, each cell contains rich content
 */
export default function parse(element, { document }) {
  const cells = [];

  // Detect which pattern we're dealing with
  const isMegaTrends = !!element.querySelector('.section.pt-0.pb-20, .sectiontitle');
  const isContactCTA = !!element.querySelector('.bg-light-gray');

  if (element.classList.contains('bg-light-gray') || isContactCTA) {
    // Pattern B: Contact CTA cards - combine this card AND its sibling into one columns block
    // Skip if already processed by a sibling
    if (element.dataset.columnsParsed === 'true') return;

    // Find all sibling bg-light-gray containers (Help & Support + Sales)
    const parent = element.parentElement;
    const allCards = parent
      ? Array.from(parent.querySelectorAll(':scope > .responsivegrid.bg-light-gray'))
      : [element];

    // Mark all as parsed to prevent duplicate processing
    allCards.forEach((card) => { card.dataset.columnsParsed = 'true'; });

    // Build one column per card
    allCards.forEach((card) => {
      const paragraphs = card.querySelectorAll('.cmp-text p');
      const cta = card.querySelector('.cta a, .cmp-call-to-action a');

      const contentCell = [];
      paragraphs.forEach((p) => {
        if (p.textContent.trim()) contentCell.push(p);
      });
      if (cta) {
        const link = document.createElement('a');
        link.href = cta.href || cta.getAttribute('href');
        link.textContent = cta.textContent.trim();
        const strong = document.createElement('strong');
        strong.appendChild(link);
        const p = document.createElement('p');
        p.appendChild(strong);
        contentCell.push(p);
      }
      cells.push(contentCell);
    });

    // Remove sibling cards from DOM (content is now in the combined block)
    allCards.slice(1).forEach((card) => card.remove());
  } else {
    // Pattern A: Mega Trends columns
    // Find the 3 column containers (responsive grids with image + text)
    const columnContainers = element.querySelectorAll(':scope .responsivegrid.bg-transparent.p-15');

    columnContainers.forEach((col) => {
      const contentCell = [];

      // Image from Scene7 - try multiple sources
      const img = col.querySelector('img[src*="scene7"], .s7dm-dynamic-media img, .cmp-image img, img');
      const imgContainer = col.querySelector('[data-asset-path][data-imageserver]');
      if (img || imgContainer) {
        const imgEl = document.createElement('img');
        if (imgContainer) {
          const server = imgContainer.getAttribute('data-imageserver');
          const asset = imgContainer.getAttribute('data-asset-path');
          imgEl.src = server && asset ? `${server}${asset}` : (img ? img.src : '');
        } else {
          imgEl.src = img.src || '';
        }
        imgEl.alt = img ? (img.alt || '') : '';
        if (imgEl.src) contentCell.push(imgEl);
      }

      // Category link (e.g., "AUTOMATION")
      const categoryLink = col.querySelector('.cmp-text a, p a');
      if (categoryLink) {
        const p = document.createElement('p');
        const link = document.createElement('a');
        link.href = categoryLink.href || categoryLink.getAttribute('href');
        link.textContent = categoryLink.textContent.trim();
        const strong = document.createElement('strong');
        strong.appendChild(link);
        p.appendChild(strong);
        contentCell.push(p);
      }

      // Description (h6)
      const desc = col.querySelector('h6, .cmp-text h6');
      if (desc) contentCell.push(desc);

      if (contentCell.length > 0) cells.push(contentCell);
    });

    // If no column containers found, try a simpler structure
    if (cells.length === 0) {
      const images = element.querySelectorAll('.cmp-image img, .cmp.cmp-image img');
      const texts = element.querySelectorAll('.text.pt-10 .cmp-text');
      const count = Math.min(images.length, texts.length);

      for (let i = 0; i < count; i++) {
        const contentCell = [];
        if (images[i]) contentCell.push(images[i]);
        const allContent = texts[i]?.children;
        if (allContent) {
          Array.from(allContent).forEach((child) => {
            if (child.textContent.trim()) contentCell.push(child);
          });
        }
        cells.push(contentCell);
      }
    }
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'columns', cells });
  element.replaceWith(block);
}
