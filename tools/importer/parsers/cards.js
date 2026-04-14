/* eslint-disable */
/* global WebImporter */

/**
 * Parser for cards block.
 * Base: cards. Source: https://www.honeywell.com/us/en
 * Selector: .filtered-list.pb-none
 *
 * Source DOM structure (from captured HTML):
 * - .filtered-list.pb-none > ul > li (6 visible cards)
 *   - li > div > a > img (card image - placeholder images with meaningful alt text)
 *   - li > div > a > h2 (card headline, linked)
 *
 * Target block structure (_cards.json):
 *   N rows x 2 columns: [image] [rich text with heading + link]
 */
export default function parse(element, { document }) {
  const cells = [];

  // Find all list items (cards)
  const listItems = element.querySelectorAll('li');

  listItems.forEach((li) => {
    // Get the card image
    const img = li.querySelector('img');

    // Get the heading link (the linked h2)
    const headingLink = li.querySelector('a:has(h2), a:has(h3)');
    const heading = li.querySelector('h2, h3');

    // Get the article link (first link with href)
    const articleLink = li.querySelector('a[href]');

    // Build image cell - try multiple strategies for real image URLs
    const imageCell = [];
    const imgEl = document.createElement('img');
    let imgSrc = '';
    let imgAlt = img ? (img.alt || '') : '';

    // Strategy 1: Scene7 data attributes on container
    const imageContainer = li.querySelector('[data-asset-path][data-imageserver]');
    if (imageContainer) {
      const server = imageContainer.getAttribute('data-imageserver');
      const asset = imageContainer.getAttribute('data-asset-path');
      if (server && asset) imgSrc = `${server}${asset}`;
    }

    // Strategy 2: data-asset-name on wrapper div
    if (!imgSrc) {
      const assetDiv = li.querySelector('[data-asset-name]');
      if (assetDiv) {
        const name = assetDiv.getAttribute('data-asset-name');
        const server = assetDiv.getAttribute('data-imageserver') || 'https://honeywell.scene7.com/is/image/';
        const path = assetDiv.getAttribute('data-asset-path');
        if (path) imgSrc = `${server}${path}`;
        else if (name) imgSrc = `${server}honeywell/${name}`;
      }
    }

    // Strategy 3: Scene7 img src
    if (!imgSrc && img) {
      const src = img.src || img.getAttribute('src') || '';
      if (src.includes('scene7') || src.includes('honeywell.com/content/dam')) {
        imgSrc = src;
      }
    }

    // Strategy 4: Any img with non-placeholder src
    if (!imgSrc && img) {
      const src = img.src || img.getAttribute('src') || '';
      if (src && !src.includes('placeholder')) {
        imgSrc = src;
      }
    }

    if (imgSrc) {
      imgEl.src = imgSrc;
      imgEl.alt = imgAlt;
      imageCell.push(imgEl);
    }

    // Build content cell
    const contentCell = [];
    if (heading && articleLink) {
      const link = document.createElement('a');
      link.href = articleLink.href || articleLink.getAttribute('href');
      link.textContent = heading.textContent.trim();
      const h = document.createElement('h2');
      h.appendChild(link);
      contentCell.push(h);
    } else if (heading) {
      contentCell.push(heading);
    }

    if (imageCell.length > 0 || contentCell.length > 0) {
      cells.push([imageCell.length > 0 ? imageCell : '', contentCell.length > 0 ? contentCell : '']);
    }
  });

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards', cells });
  element.replaceWith(block);
}
