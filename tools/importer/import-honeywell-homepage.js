/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import heroParser from './parsers/hero.js';
import columnsParser from './parsers/columns.js';
import tabsParser from './parsers/tabs.js';
import cardsParser from './parsers/cards.js';

// TRANSFORMER IMPORTS
import cleanupTransformer from './transformers/honeywell-cleanup.js';
import sectionsTransformer from './transformers/honeywell-sections.js';

// PARSER REGISTRY
const parsers = {
  'hero': heroParser,
  'columns': columnsParser,
  'tabs': tabsParser,
  'cards': cardsParser,
};

// TRANSFORMER REGISTRY
const transformers = [
  cleanupTransformer,
];

// PAGE TEMPLATE CONFIGURATION (from page-templates.json)
const PAGE_TEMPLATE = {
  name: 'honeywell-homepage',
  urls: ['https://www.honeywell.com/us/en'],
  description: 'Honeywell corporate homepage with hero, mega-trends columns, industry tabs, news cards, digitalization tabs, and contact CTAs',
  blocks: [
    {
      name: 'hero',
      instances: ['.section.responsivegrid:has(h1)'],
    },
    {
      name: 'columns',
      instances: ['.section.pt-0.pb-20'],
    },
    {
      name: 'tabs',
      instances: [
        '.leftrailwithcontent.left-rail-v2-styles',
        '.accordion.p-15',
      ],
    },
    {
      name: 'cards',
      instances: ['.filtered-list.pb-none'],
    },
    {
      name: 'columns',
      instances: ['.responsivegrid.bg-light-gray.p-30'],
    },
  ],
  sections: [
    {
      id: 'section-1-hero',
      name: 'Hero Banner',
      selector: '.section.responsivegrid:has(h1)',
      style: 'dark',
      blocks: ['hero'],
      defaultContent: [],
    },
    {
      id: 'section-2-mega-trends',
      name: 'Delivering Mega Results on Mega Trends',
      selector: '.section.pt-0.pb-20',
      style: null,
      blocks: ['columns'],
      defaultContent: ['.sectiontitle.pt-15.pl-15 h2', '.section.pt-0.pb-20 .text h6'],
    },
    {
      id: 'section-3-what-we-do',
      name: 'What We Do',
      selector: ['.sectiontitle.pt-15.pl-30', '.leftrailwithcontent'],
      style: null,
      blocks: ['tabs'],
      defaultContent: ['.sectiontitle.pt-15.pl-30 h2'],
    },
    {
      id: 'section-4-whats-new',
      name: 'Whats New',
      selector: ['.sectiontitle.pt-50.pl-30', '.filtered-list'],
      style: null,
      blocks: ['cards'],
      defaultContent: ['.sectiontitle.pt-50.pl-30 h2'],
    },
    {
      id: 'section-5-digitalization',
      name: 'Industrial Digitalization',
      selector: ['.sectiontitle.pt-0.pl-15', '.accordion.p-15', '.section.overlap-bottom'],
      style: null,
      blocks: ['tabs'],
      defaultContent: ['.sectiontitle.pt-0.pl-15 h2', '.sectiontitle.pt-0.pl-15 + .text p'],
    },
    {
      id: 'section-6-contact',
      name: 'Contact CTAs',
      selector: '.responsivegrid.bg-light-gray.p-30',
      style: 'light-grey',
      blocks: ['columns'],
      defaultContent: [],
    },
  ],
};

/**
 * Execute all page transformers for a specific hook
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  const allTransformers = hookName === 'afterTransform'
    ? [...transformers, ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [sectionsTransformer] : [])]
    : transformers;

  allTransformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the template configuration
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];

  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });

  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, html, params } = payload;
    const main = document.body;

    // 1. Execute beforeTransform (initial cleanup)
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks on page using embedded template
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse each block using registered parsers
    pageBlocks.forEach((block) => {
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Execute afterTransform (final cleanup + section breaks/metadata)
    executeTransformers('afterTransform', main, payload);

    // 5. Apply WebImporter built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    WebImporter.rules.createMetadata(main, document);
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Generate sanitized path
    const path = WebImporter.FileUtils.sanitizePath(
      new URL(params.originalURL).pathname.replace(/\/$/, '').replace(/\.html$/, '')
    );

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
      },
    }];
  },
};
