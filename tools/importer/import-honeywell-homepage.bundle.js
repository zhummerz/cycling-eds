var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-honeywell-homepage.js
  var import_honeywell_homepage_exports = {};
  __export(import_honeywell_homepage_exports, {
    default: () => import_honeywell_homepage_default
  });

  // tools/importer/parsers/hero.js
  function parse(element, { document }) {
    const bgContainer = element.querySelector('[style*="background"]');
    let bgImageUrl = "";
    if (bgContainer) {
      const style = bgContainer.getAttribute("style") || "";
      const match = style.match(/url\(([^)]+)\)/);
      if (match) {
        bgImageUrl = match[1].replace(/['"]/g, "").trim();
        if (bgImageUrl.startsWith("//")) {
          bgImageUrl = "https:" + bgImageUrl;
        }
      }
    }
    const heading = element.querySelector("h1");
    const description = element.querySelector("p.desc, .cmp-text p:not(:empty)");
    const ctaContainer = element.querySelector(".cta a, .cmp-call-to-action a");
    const cells = [];
    if (bgImageUrl) {
      const img = document.createElement("img");
      img.src = bgImageUrl;
      img.alt = (bgContainer == null ? void 0 : bgContainer.getAttribute("alt")) || "Hero background";
      cells.push([img]);
    }
    const contentCell = [];
    if (heading) contentCell.push(heading);
    if (description) contentCell.push(description);
    if (ctaContainer) {
      const link = document.createElement("a");
      link.href = ctaContainer.href || ctaContainer.getAttribute("href");
      link.textContent = ctaContainer.textContent.trim();
      const strong = document.createElement("strong");
      strong.appendChild(link);
      const p = document.createElement("p");
      p.appendChild(strong);
      contentCell.push(p);
    }
    cells.push(contentCell);
    const block = WebImporter.Blocks.createBlock(document, { name: "hero", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns.js
  function parse2(element, { document }) {
    var _a;
    const cells = [];
    const isMegaTrends = !!element.querySelector(".section.pt-0.pb-20, .sectiontitle");
    const isContactCTA = !!element.querySelector(".bg-light-gray");
    if (element.classList.contains("bg-light-gray") || isContactCTA) {
      if (element.dataset.columnsParsed === "true") return;
      const parent = element.parentElement;
      const allCards = parent ? Array.from(parent.querySelectorAll(":scope > .responsivegrid.bg-light-gray")) : [element];
      allCards.forEach((card) => {
        card.dataset.columnsParsed = "true";
      });
      allCards.forEach((card) => {
        const paragraphs = card.querySelectorAll(".cmp-text p");
        const cta = card.querySelector(".cta a, .cmp-call-to-action a");
        const contentCell = [];
        paragraphs.forEach((p) => {
          if (p.textContent.trim()) contentCell.push(p);
        });
        if (cta) {
          const link = document.createElement("a");
          link.href = cta.href || cta.getAttribute("href");
          link.textContent = cta.textContent.trim();
          const strong = document.createElement("strong");
          strong.appendChild(link);
          const p = document.createElement("p");
          p.appendChild(strong);
          contentCell.push(p);
        }
        cells.push(contentCell);
      });
      allCards.slice(1).forEach((card) => card.remove());
    } else {
      const columnContainers = element.querySelectorAll(":scope .responsivegrid.bg-transparent.p-15");
      columnContainers.forEach((col) => {
        const contentCell = [];
        const img = col.querySelector('img[src*="scene7"], .s7dm-dynamic-media img, .cmp-image img, img');
        const imgContainer = col.querySelector("[data-asset-path][data-imageserver]");
        if (img || imgContainer) {
          const imgEl = document.createElement("img");
          if (imgContainer) {
            const server = imgContainer.getAttribute("data-imageserver");
            const asset = imgContainer.getAttribute("data-asset-path");
            imgEl.src = server && asset ? `${server}${asset}` : img ? img.src : "";
          } else {
            imgEl.src = img.src || "";
          }
          imgEl.alt = img ? img.alt || "" : "";
          if (imgEl.src) contentCell.push(imgEl);
        }
        const categoryLink = col.querySelector(".cmp-text a, p a");
        if (categoryLink) {
          const p = document.createElement("p");
          const link = document.createElement("a");
          link.href = categoryLink.href || categoryLink.getAttribute("href");
          link.textContent = categoryLink.textContent.trim();
          const strong = document.createElement("strong");
          strong.appendChild(link);
          p.appendChild(strong);
          contentCell.push(p);
        }
        const desc = col.querySelector("h6, .cmp-text h6");
        if (desc) contentCell.push(desc);
        if (contentCell.length > 0) cells.push(contentCell);
      });
      if (cells.length === 0) {
        const images = element.querySelectorAll(".cmp-image img, .cmp.cmp-image img");
        const texts = element.querySelectorAll(".text.pt-10 .cmp-text");
        const count = Math.min(images.length, texts.length);
        for (let i = 0; i < count; i++) {
          const contentCell = [];
          if (images[i]) contentCell.push(images[i]);
          const allContent = (_a = texts[i]) == null ? void 0 : _a.children;
          if (allContent) {
            Array.from(allContent).forEach((child) => {
              if (child.textContent.trim()) contentCell.push(child);
            });
          }
          cells.push(contentCell);
        }
      }
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "columns", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/tabs.js
  function parse3(element, { document }) {
    const cells = [];
    const isLeftRail = element.classList.contains("leftrailwithcontent") || element.querySelector(".leftrailwithcontent");
    const isAccordion = element.classList.contains("accordion") || element.querySelector(".accordion");
    if (isLeftRail) {
      const leftRail = element.classList.contains("leftrailwithcontent") ? element : element.querySelector(".leftrailwithcontent");
      const tabLinks = leftRail.querySelectorAll('a[href*="#"]');
      const seen = /* @__PURE__ */ new Set();
      tabLinks.forEach((link) => {
        const text = link.textContent.trim();
        if (!text || seen.has(text)) return;
        seen.add(text);
        const label = document.createElement("p");
        label.textContent = text;
        const slug = link.getAttribute("href").split("#").pop();
        const learnLink = leftRail.querySelector(
          `a[href*="/industries/${slug}"], a[href$="/${slug}"]`
        );
        const content = document.createElement("p");
        if (learnLink && !learnLink.getAttribute("href").includes("#")) {
          const a = document.createElement("a");
          a.href = learnLink.href || learnLink.getAttribute("href");
          a.textContent = `Learn about ${text}`;
          content.appendChild(a);
        } else {
          const a = document.createElement("a");
          a.href = `/us/en/industries/${slug}`;
          a.textContent = `Learn about ${text}`;
          content.appendChild(a);
        }
        cells.push([[label], [content]]);
      });
    } else if (isAccordion) {
      if (element.dataset.tabsParsed === "true") return;
      const accordionEl = element.classList.contains("accordion") ? element : element.querySelector(".accordion");
      if (!accordionEl) {
        const block2 = WebImporter.Blocks.createBlock(document, { name: "tabs", cells });
        element.replaceWith(block2);
        return;
      }
      const parent = accordionEl.parentElement;
      const allAccordions = parent ? Array.from(parent.querySelectorAll(":scope > .accordion.p-15")) : [accordionEl];
      allAccordions.forEach((acc) => {
        acc.dataset.tabsParsed = "true";
      });
      const overlapSection = document.querySelector(".section.overlap-bottom");
      allAccordions.forEach((acc, i) => {
        const titleEl = acc.querySelector('.advancedaccordion-title, [class*="accordion-title"], button');
        const label = document.createElement("p");
        label.textContent = titleEl ? titleEl.textContent.trim() : `Tab ${i + 1}`;
        const panelEl = acc.querySelector('.advancedaccordion-content, [class*="accordion-content"]');
        const contentWrapper = document.createElement("div");
        if (panelEl) {
          const panelText = panelEl.querySelector("p");
          if (panelText) {
            const p = document.createElement("p");
            p.textContent = panelText.textContent.trim();
            contentWrapper.appendChild(p);
          }
        }
        if (i === 0 && overlapSection) {
          const heading = overlapSection.querySelector("h5, h4, h3");
          const desc = overlapSection.querySelector(".cmp-text p");
          const cta = overlapSection.querySelector(".cta a, .cmp-call-to-action a");
          if (heading) {
            const h = document.createElement("h5");
            h.textContent = heading.textContent.trim();
            contentWrapper.appendChild(h);
          }
          if (desc) {
            const p = document.createElement("p");
            p.textContent = desc.textContent.trim();
            contentWrapper.appendChild(p);
          }
          if (cta) {
            const link = document.createElement("a");
            link.href = cta.href || cta.getAttribute("href");
            link.textContent = cta.textContent.trim();
            const p = document.createElement("p");
            p.appendChild(link);
            contentWrapper.appendChild(p);
          }
          overlapSection.remove();
        }
        cells.push([[label], [contentWrapper]]);
      });
      allAccordions.slice(1).forEach((acc) => acc.remove());
    }
    const block = WebImporter.Blocks.createBlock(document, { name: "tabs", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards.js
  function parse4(element, { document }) {
    const cells = [];
    const listItems = element.querySelectorAll("li");
    listItems.forEach((li) => {
      const img = li.querySelector("img");
      const headingLink = li.querySelector("a:has(h2), a:has(h3)");
      const heading = li.querySelector("h2, h3");
      const articleLink = li.querySelector("a[href]");
      const imageCell = [];
      const imgEl = document.createElement("img");
      let imgSrc = "";
      let imgAlt = img ? img.alt || "" : "";
      const imageContainer = li.querySelector("[data-asset-path][data-imageserver]");
      if (imageContainer) {
        const server = imageContainer.getAttribute("data-imageserver");
        const asset = imageContainer.getAttribute("data-asset-path");
        if (server && asset) imgSrc = `${server}${asset}`;
      }
      if (!imgSrc) {
        const assetDiv = li.querySelector("[data-asset-name]");
        if (assetDiv) {
          const name = assetDiv.getAttribute("data-asset-name");
          const server = assetDiv.getAttribute("data-imageserver") || "https://honeywell.scene7.com/is/image/";
          const path = assetDiv.getAttribute("data-asset-path");
          if (path) imgSrc = `${server}${path}`;
          else if (name) imgSrc = `${server}honeywell/${name}`;
        }
      }
      if (!imgSrc && img) {
        const src = img.src || img.getAttribute("src") || "";
        if (src.includes("scene7") || src.includes("honeywell.com/content/dam")) {
          imgSrc = src;
        }
      }
      if (!imgSrc && img) {
        const src = img.src || img.getAttribute("src") || "";
        if (src && !src.includes("placeholder")) {
          imgSrc = src;
        }
      }
      if (imgSrc) {
        imgEl.src = imgSrc;
        imgEl.alt = imgAlt;
        imageCell.push(imgEl);
      }
      const contentCell = [];
      if (heading && articleLink) {
        const link = document.createElement("a");
        link.href = articleLink.href || articleLink.getAttribute("href");
        link.textContent = heading.textContent.trim();
        const h = document.createElement("h2");
        h.appendChild(link);
        contentCell.push(h);
      } else if (heading) {
        contentCell.push(heading);
      }
      if (imageCell.length > 0 || contentCell.length > 0) {
        cells.push([imageCell.length > 0 ? imageCell : "", contentCell.length > 0 ? contentCell : ""]);
      }
    });
    const block = WebImporter.Blocks.createBlock(document, { name: "cards", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/honeywell-cleanup.js
  var H = { before: "beforeTransform", after: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === H.before) {
      WebImporter.DOMUtils.remove(element, [
        "#onetrust-consent-sdk",
        '[class*="onetrust"]',
        '[id*="onetrust"]',
        '[class*="cookie"]',
        ".optanon-alert-box-wrapper",
        "#_evidon_banner",
        "#drift-widget",
        '[id*="CybotCookiebot"]'
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".page-load-analytics-data",
        ".page_global_info",
        ".user_global_info",
        ".page_load_event_info",
        "[data-datalayer-sbgname]"
      ]);
      WebImporter.DOMUtils.remove(element, [
        ".globalnotification"
      ]);
      const overflowEls = element.querySelectorAll('[style*="overflow: hidden"]');
      overflowEls.forEach((el) => {
        el.style.overflow = "visible";
      });
    }
    if (hookName === H.after) {
      WebImporter.DOMUtils.remove(element, [
        // Header/navigation experience fragment
        ".localized-experiencefragment:has(.cmp-experiencefragment--header)",
        ".cmp-experiencefragment--header",
        ".header",
        ".global-header-container",
        "header",
        "nav",
        // Footer experience fragment
        ".flexible-footer",
        ".localized-experiencefragment:has(.cmp-experiencefragment--footer)",
        "footer",
        // Breadcrumbs
        ".breadcrumb",
        // Utility elements
        "iframe",
        "link",
        "noscript",
        // Hidden utility divs
        ".d-none",
        '[class*="htmlcontainer"]',
        'input[type="hidden"]'
      ]);
      element.querySelectorAll("img").forEach((img) => {
        const src = img.src || "";
        if (src.includes("analytics") || src.includes("adsct") || src.includes("bing.com") || src.includes("rlcdn") || src.includes("cookielaw") || src.includes("bat.bing") || src.includes("t.co/i/") || src.includes("facebook.com/tr")) {
          img.remove();
        }
      });
      element.querySelectorAll("*").forEach((el) => {
        el.removeAttribute("data-track");
        el.removeAttribute("onclick");
        el.removeAttribute("data-analytics");
        el.removeAttribute("data-datalayer-sbgname");
      });
    }
  }

  // tools/importer/transformers/honeywell-sections.js
  var H2 = { before: "beforeTransform", after: "afterTransform" };
  function transform2(hookName, element, payload) {
    if (hookName === H2.after) {
      const { template } = payload || {};
      const sections = template && template.sections;
      if (!sections || sections.length < 2) return;
      const document = element.ownerDocument;
      const allTables = element.querySelectorAll("table");
      const blockTables = Array.from(allTables).filter((table) => {
        const firstTh = table.querySelector("tr:first-child th, tr:first-child td");
        return firstTh && firstTh.colSpan > 1;
      });
      const sectionMarkers = [];
      sections.forEach((section, idx) => {
        if (idx === 0) {
          const heroTable = blockTables.find((t) => {
            const header = t.querySelector("tr:first-child");
            return header && header.textContent.trim().toLowerCase() === "hero";
          });
          if (heroTable) {
            sectionMarkers.push({ element: heroTable, section, isFirst: true });
          }
          return;
        }
        const blockNames = section.blocks || [];
        const h2s = element.querySelectorAll("h2");
        let matchedH2 = null;
        for (const h2 of h2s) {
          const text = h2.textContent.trim().toLowerCase();
          const sectionName = section.name.toLowerCase();
          if (text === sectionName || text.includes(sectionName) || sectionName.includes(text)) {
            matchedH2 = h2;
            break;
          }
        }
        let matchedTable = null;
        for (const blockName of blockNames) {
          matchedTable = blockTables.find((t) => {
            const header = t.querySelector("tr:first-child");
            const headerText = header ? header.textContent.trim().toLowerCase() : "";
            return headerText === blockName.toLowerCase();
          });
          if (matchedTable) break;
        }
        const marker = matchedH2 || matchedTable;
        if (marker) {
          sectionMarkers.push({ element: marker, section, isFirst: false });
        }
      });
      sectionMarkers.reverse().forEach(({ element: markerEl, section, isFirst }) => {
        if (section.style) {
          const sectionMetadata = WebImporter.Blocks.createBlock(document, {
            name: "Section Metadata",
            cells: { style: section.style }
          });
          let insertAfter = markerEl;
          let next = markerEl.nextElementSibling;
          while (next && next.tagName !== "HR") {
            insertAfter = next;
            next = next.nextElementSibling;
          }
          insertAfter.after(sectionMetadata);
        }
        if (!isFirst) {
          const hr = document.createElement("hr");
          markerEl.before(hr);
        }
      });
    }
  }

  // tools/importer/import-honeywell-homepage.js
  var parsers = {
    "hero": parse,
    "columns": parse2,
    "tabs": parse3,
    "cards": parse4
  };
  var transformers = [
    transform
  ];
  var PAGE_TEMPLATE = {
    name: "honeywell-homepage",
    urls: ["https://www.honeywell.com/us/en"],
    description: "Honeywell corporate homepage with hero, mega-trends columns, industry tabs, news cards, digitalization tabs, and contact CTAs",
    blocks: [
      {
        name: "hero",
        instances: [".section.responsivegrid:has(h1)"]
      },
      {
        name: "columns",
        instances: [".section.pt-0.pb-20"]
      },
      {
        name: "tabs",
        instances: [
          ".leftrailwithcontent.left-rail-v2-styles",
          ".accordion.p-15"
        ]
      },
      {
        name: "cards",
        instances: [".filtered-list.pb-none"]
      },
      {
        name: "columns",
        instances: [".responsivegrid.bg-light-gray.p-30"]
      }
    ],
    sections: [
      {
        id: "section-1-hero",
        name: "Hero Banner",
        selector: ".section.responsivegrid:has(h1)",
        style: "dark",
        blocks: ["hero"],
        defaultContent: []
      },
      {
        id: "section-2-mega-trends",
        name: "Delivering Mega Results on Mega Trends",
        selector: ".section.pt-0.pb-20",
        style: null,
        blocks: ["columns"],
        defaultContent: [".sectiontitle.pt-15.pl-15 h2", ".section.pt-0.pb-20 .text h6"]
      },
      {
        id: "section-3-what-we-do",
        name: "What We Do",
        selector: [".sectiontitle.pt-15.pl-30", ".leftrailwithcontent"],
        style: null,
        blocks: ["tabs"],
        defaultContent: [".sectiontitle.pt-15.pl-30 h2"]
      },
      {
        id: "section-4-whats-new",
        name: "Whats New",
        selector: [".sectiontitle.pt-50.pl-30", ".filtered-list"],
        style: null,
        blocks: ["cards"],
        defaultContent: [".sectiontitle.pt-50.pl-30 h2"]
      },
      {
        id: "section-5-digitalization",
        name: "Industrial Digitalization",
        selector: [".sectiontitle.pt-0.pl-15", ".accordion.p-15", ".section.overlap-bottom"],
        style: null,
        blocks: ["tabs"],
        defaultContent: [".sectiontitle.pt-0.pl-15 h2", ".sectiontitle.pt-0.pl-15 + .text p"]
      },
      {
        id: "section-6-contact",
        name: "Contact CTAs",
        selector: ".responsivegrid.bg-light-gray.p-30",
        style: "light-grey",
        blocks: ["columns"],
        defaultContent: []
      }
    ]
  };
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    const allTransformers = hookName === "afterTransform" ? [...transformers, ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []] : transformers;
    allTransformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
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
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_honeywell_homepage_default = {
    transform: (payload) => {
      const { document, url, html, params } = payload;
      const main = document.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);
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
      executeTransformers("afterTransform", main, payload);
      const hr = document.createElement("hr");
      main.appendChild(hr);
      WebImporter.rules.createMetadata(main, document);
      WebImporter.rules.transformBackgroundImages(main, document);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const path = WebImporter.FileUtils.sanitizePath(
        new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html$/, "")
      );
      return [{
        element: main,
        path,
        report: {
          title: document.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_honeywell_homepage_exports);
})();
