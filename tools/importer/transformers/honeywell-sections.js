/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: Honeywell section breaks and section-metadata.
 * Runs in afterTransform only.
 *
 * After parsers run, the original DOM selectors are replaced by block tables.
 * This transformer finds block tables and default content headings to insert
 * section breaks and section-metadata blocks.
 *
 * Strategy: Find block tables by their header text (e.g., "Hero", "Columns", "Tabs", "Cards")
 * and h2 headings that serve as section titles. Insert hr before each new section.
 */
const H = { before: 'beforeTransform', after: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === H.after) {
    const { template } = payload || {};
    const sections = template && template.sections;
    if (!sections || sections.length < 2) return;

    const document = element.ownerDocument;

    // After parsers run, blocks become tables with header rows.
    // Find all block tables
    const allTables = element.querySelectorAll('table');
    const blockTables = Array.from(allTables).filter((table) => {
      const firstTh = table.querySelector('tr:first-child th, tr:first-child td');
      return firstTh && firstTh.colSpan > 1;
    });

    // Build a list of section markers: elements where sections start
    // Each section starts at either a block table or an h2 heading
    const sectionMarkers = [];

    sections.forEach((section, idx) => {
      if (idx === 0) {
        // First section: find the hero block table
        const heroTable = blockTables.find((t) => {
          const header = t.querySelector('tr:first-child');
          return header && header.textContent.trim().toLowerCase() === 'hero';
        });
        if (heroTable) {
          sectionMarkers.push({ element: heroTable, section, isFirst: true });
        }
        return;
      }

      // For other sections, look for h2 headings with matching text
      // or block tables that correspond to this section
      const blockNames = section.blocks || [];

      // Try to find a matching h2 heading
      const h2s = element.querySelectorAll('h2');
      let matchedH2 = null;
      for (const h2 of h2s) {
        const text = h2.textContent.trim().toLowerCase();
        const sectionName = section.name.toLowerCase();
        if (text === sectionName || text.includes(sectionName) || sectionName.includes(text)) {
          matchedH2 = h2;
          break;
        }
      }

      // Try to find a matching block table
      let matchedTable = null;
      for (const blockName of blockNames) {
        matchedTable = blockTables.find((t) => {
          const header = t.querySelector('tr:first-child');
          const headerText = header ? header.textContent.trim().toLowerCase() : '';
          return headerText === blockName.toLowerCase();
        });
        if (matchedTable) break;
      }

      // Use the h2 if it comes before the block table, otherwise use the block table
      const marker = matchedH2 || matchedTable;
      if (marker) {
        sectionMarkers.push({ element: marker, section, isFirst: false });
      }
    });

    // Insert section breaks and metadata in reverse order
    sectionMarkers.reverse().forEach(({ element: markerEl, section, isFirst }) => {
      // Add section-metadata if section has a style
      if (section.style) {
        const sectionMetadata = WebImporter.Blocks.createBlock(document, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        // Find the last element of this section (before the next hr or end)
        let insertAfter = markerEl;
        let next = markerEl.nextElementSibling;
        while (next && next.tagName !== 'HR') {
          insertAfter = next;
          next = next.nextElementSibling;
        }
        insertAfter.after(sectionMetadata);
      }

      // Add section break before non-first sections
      if (!isFirst) {
        const hr = document.createElement('hr');
        markerEl.before(hr);
      }
    });
  }
}
