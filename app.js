const data = window.BMCAG_DATA || {};
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const breakpoints = {
  mobile: window.matchMedia("(max-width: 820px)"),
  compact: window.matchMedia("(max-width: 560px)"),
  touch: window.matchMedia("(hover: none), (pointer: coarse)")
};
const revealGroups = [
  { container: ".metric-ribbon", items: ".metric-card" },
  { container: ".page-links-grid", items: ".page-link-card" },
  { container: ".events-grid", items: ".event-card" },
  { container: ".services-grid", items: ".service-card" },
  { container: ".leadership-grid", items: ".leadership-card" },
  { container: ".voices-grid", items: ".voice-card" },
  { container: ".gallery-grid", items: ".gallery-card" },
  { container: ".partner-stats", items: ".partner-stat" },
  { container: ".partners-grid", items: ".partner-card" },
  { container: ".resource-grid", items: ".resource-card" },
  { container: ".contact-grid", items: ".contact-card" },
  { container: ".subpage-grid", items: ".text-panel, .note-panel" },
  { container: ".subpage-grid-tight", items: ".subpage-feature" },
  { container: ".detail-grid", items: ".page-kpi" },
  { container: ".mission-highlights", items: "li" }
];
const state = {
  isMobile: false,
  isCompact: false,
  isTouch: false,
  isMenuOpen: false,
  scrollFrame: 0,
  viewportFrame: 0,
  pendingRevealRefresh: false
};

let revealObserver;

const elements = {
  siteHeader: document.querySelector(".site-header"),
  nav: document.getElementById("site-nav"),
  menuToggle: document.querySelector(".menu-toggle"),
  heroEyebrow: document.getElementById("hero-eyebrow"),
  heroTitle: document.getElementById("hero-title"),
  heroSummary: document.getElementById("hero-summary"),
  heroActions: document.getElementById("hero-actions"),
  heroImage: document.getElementById("hero-image"),
  heroProvenance: document.getElementById("hero-provenance"),
  spotlightKicker: document.getElementById("spotlight-kicker"),
  spotlightTitle: document.getElementById("spotlight-title"),
  spotlightText: document.getElementById("spotlight-text"),
  spotlightLink: document.getElementById("spotlight-link"),
  metricRibbon: document.getElementById("metric-ribbon"),
  pageLinksGrid: document.getElementById("page-links-grid"),
  missionTitle: document.getElementById("mission-title"),
  missionText: document.getElementById("mission-text"),
  missionImage: document.getElementById("mission-image"),
  missionHighlights: document.getElementById("mission-highlights"),
  eventsTitle: document.getElementById("events-title"),
  eventsText: document.getElementById("events-text"),
  eventsGrid: document.getElementById("events-grid"),
  servicesTitle: document.getElementById("services-title"),
  servicesText: document.getElementById("services-text"),
  servicesGrid: document.getElementById("services-grid"),
  leadershipTitle: document.getElementById("leadership-title"),
  leadershipText: document.getElementById("leadership-text"),
  leadershipGrid: document.getElementById("leadership-grid"),
  voicesTitle: document.getElementById("voices-title"),
  voicesText: document.getElementById("voices-text"),
  voicesGrid: document.getElementById("voices-grid"),
  galleryTitle: document.getElementById("gallery-title"),
  galleryText: document.getElementById("gallery-text"),
  galleryGrid: document.getElementById("gallery-grid"),
  partnersTitle: document.getElementById("partners-title"),
  partnersText: document.getElementById("partners-text"),
  partnerStats: document.getElementById("partner-stats"),
  partnersGrid: document.getElementById("partners-grid"),
  resourcesTitle: document.getElementById("resources-title"),
  resourcesText: document.getElementById("resources-text"),
  resourceSearch: document.getElementById("resource-search"),
  resourceCount: document.getElementById("resource-count"),
  resourceGrid: document.getElementById("resource-grid"),
  contactTitle: document.getElementById("contact-title"),
  contactText: document.getElementById("contact-text"),
  contactGrid: document.getElementById("contact-grid"),
  footerNote: document.getElementById("footer-note"),
  footerLinks: document.getElementById("footer-links")
};

function normalizePath(value = "") {
  const sanitized = value.split("#")[0].split("?")[0];
  const segment = sanitized.split("/").pop();
  return segment || "index.html";
}

function parseDelayMs(value) {
  const trimmed = String(value || "").trim();

  if (!trimmed) {
    return null;
  }

  const numeric = Number.parseFloat(trimmed);
  return Number.isFinite(numeric) ? numeric : null;
}

function getViewportHeight() {
  return Math.round(window.visualViewport?.height || window.innerHeight || document.documentElement.clientHeight);
}

function getViewportWidth() {
  return Math.round(window.visualViewport?.width || window.innerWidth || document.documentElement.clientWidth);
}

function setInert(node, inert) {
  if (!node) {
    return;
  }

  if ("inert" in node) {
    node.inert = inert;
  }

  node.toggleAttribute("inert", inert);
}

function syncHeaderMetrics() {
  if (!elements.siteHeader) {
    return;
  }

  document.documentElement.style.setProperty(
    "--header-height",
    `${Math.ceil(elements.siteHeader.getBoundingClientRect().height)}px`
  );
}

function syncCurrentNavigation() {
  const currentPath = normalizePath(window.location.pathname);

  document.querySelectorAll(".site-nav a").forEach((anchor) => {
    const href = anchor.getAttribute("href");
    const isCurrent = Boolean(href) && normalizePath(href) === currentPath;

    if (isCurrent) {
      anchor.setAttribute("aria-current", "page");
      return;
    }

    anchor.removeAttribute("aria-current");
  });
}

function prepareRevealItems() {
  revealGroups.forEach(({ container, items }) => {
    document.querySelectorAll(container).forEach((group) => {
      Array.from(group.children)
        .filter((child) => child.matches(items))
        .forEach((child, index) => {
          child.classList.add("reveal-item");
          child.dataset.staggerIndex = String(index);
        });
    });
  });
}

function syncAnimationDelays() {
  prepareRevealItems();

  const delayScale = state.isCompact ? 0.34 : state.isMobile ? 0.58 : 1;
  const maxDelay = state.isMobile ? 220 : 480;

  document.querySelectorAll(".reveal, .reveal-item").forEach((node) => {
    if (!node.dataset.baseDelay) {
      const inlineDelay = parseDelayMs(node.style.getPropertyValue("--delay"));
      const staggerIndex = Number.parseInt(node.dataset.staggerIndex || "0", 10);
      const baseDelay = inlineDelay ?? staggerIndex * 80;

      node.dataset.baseDelay = String(baseDelay);
    }

    const baseDelay = Number.parseFloat(node.dataset.baseDelay || "0");
    const delay = Math.min(Math.round(baseDelay * delayScale), maxDelay);

    node.style.setProperty("--delay", `${delay}ms`);
  });
}

function getRevealOptions() {
  return state.isMobile
    ? {
        threshold: 0.08,
        rootMargin: "0px 0px -4% 0px"
      }
    : {
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px"
      };
}

function ensureRevealObserver(forceRefresh = false) {
  if (prefersReducedMotion) {
    return;
  }

  if (revealObserver && !forceRefresh) {
    return;
  }

  if (revealObserver) {
    revealObserver.disconnect();
  }

  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    getRevealOptions()
  );
}

function linkAttributes(item) {
  return item.external ? ' target="_blank" rel="noreferrer"' : "";
}

function applyLinkBehavior(anchor, item) {
  anchor.href = item.href;

  if (item.external) {
    anchor.target = "_blank";
    anchor.rel = "noreferrer";
    return;
  }

  anchor.removeAttribute("target");
  anchor.removeAttribute("rel");
}

function renderNavigation() {
  if (!elements.nav || !Array.isArray(data.navigation) || elements.nav.childElementCount > 0) {
    return;
  }

  elements.nav.innerHTML = data.navigation
    .map((item) => `<a href="${item.href}"${linkAttributes(item)}>${item.label}</a>`)
    .join("");
}

function renderHero() {
  if (!data.hero || !elements.heroTitle || !elements.heroSummary || !elements.heroActions) {
    return;
  }

  elements.heroEyebrow.textContent = data.hero.eyebrow;
  elements.heroTitle.textContent = data.hero.title;
  elements.heroSummary.textContent = data.hero.summary;
  elements.heroProvenance.textContent = `${data.hero.provenance} Stand: ${data.syncDate}.`;
  elements.heroImage.src = data.hero.image;
  elements.heroImage.alt = `${data.brand.shortName} Titelbild`;

  elements.heroActions.innerHTML = data.hero.actions
    .map((action) => {
      const attrs = action.external ? ' target="_blank" rel="noreferrer"' : "";
      return `<a class="button button-${action.variant}" href="${action.href}"${attrs}>${action.label}</a>`;
    })
    .join("");

  elements.spotlightKicker.textContent = data.spotlight.kicker;
  elements.spotlightTitle.textContent = data.spotlight.title;
  elements.spotlightText.textContent = data.spotlight.text;
  elements.spotlightLink.textContent = data.spotlight.label || "Mehr entdecken";
  applyLinkBehavior(elements.spotlightLink, data.spotlight);

  elements.metricRibbon.innerHTML = data.metrics
    .map(
      (metric, index) => `
        <article class="metric-card reveal-item" style="--delay:${index * 90}ms">
          <span class="metric-value">${metric.value}</span>
          <span class="metric-label">${metric.label}</span>
        </article>
      `
    )
    .join("");
}

function renderPageLinks() {
  if (!elements.pageLinksGrid || !Array.isArray(data.pages)) {
    return;
  }

  elements.pageLinksGrid.innerHTML = data.pages
    .map(
      (page, index) => `
        <a class="page-link-card reveal-item" href="${page.href}" style="--delay:${index * 70}ms">
          <p class="card-kicker">${page.kicker}</p>
          <h3>${page.title}</h3>
          <p>${page.text}</p>
          <span class="page-link-arrow">Mehr erfahren</span>
        </a>
      `
    )
    .join("");
}

function renderMission() {
  if (!data.mission || !elements.missionTitle || !elements.missionHighlights) {
    return;
  }

  elements.missionTitle.textContent = data.mission.title;
  elements.missionText.textContent = data.mission.text;
  elements.missionImage.src = data.mission.image;
  elements.missionImage.alt = "BMCAG Gemeinschaftsbanner";
  elements.missionHighlights.innerHTML = data.mission.highlights
    .map((item) => `<li>${item}</li>`)
    .join("");
}

function renderEvents() {
  if (!data.events || !elements.eventsTitle || !elements.eventsGrid) {
    return;
  }

  elements.eventsTitle.textContent = data.events.title;
  elements.eventsText.textContent = data.events.text;
  elements.eventsGrid.innerHTML = data.events.items
    .map(
      (event, index) => `
        <article class="event-card reveal-item" style="--delay:${index * 100}ms">
          <figure>
            <img src="${event.image}" alt="${event.title}" loading="lazy">
          </figure>
          <p class="event-date">${event.date}</p>
          <h3>${event.title}</h3>
        </article>
      `
    )
    .join("");
}

function renderServices() {
  if (!data.services || !elements.servicesTitle || !elements.servicesGrid) {
    return;
  }

  elements.servicesTitle.textContent = data.services.title;
  elements.servicesText.textContent = data.services.text;
  elements.servicesGrid.innerHTML = data.services.items
    .map(
      (service, index) => `
        <article class="service-card reveal-item" style="--delay:${index * 100}ms">
          <span class="service-number">${service.number}</span>
          <h3>${service.title}</h3>
          <p>${service.text}</p>
        </article>
      `
    )
    .join("");
}

function renderLeadership() {
  if (!data.leadership || !elements.leadershipTitle || !elements.leadershipGrid) {
    return;
  }

  elements.leadershipTitle.textContent = data.leadership.title;
  elements.leadershipText.textContent = data.leadership.text;
  elements.leadershipGrid.innerHTML = data.leadership.members
    .map(
      (member, index) => `
        <article class="leadership-card reveal-item" style="--delay:${index * 100}ms">
          <figure>
            <img src="${member.image}" alt="${member.name}" loading="lazy">
          </figure>
          <div class="leadership-copy">
            <p class="role-pill">${member.role}</p>
            <h3>${member.name}</h3>
            <p>${member.text}</p>
          </div>
        </article>
      `
    )
    .join("");
}

function renderVoices() {
  if (!data.voices || !elements.voicesTitle || !elements.voicesGrid) {
    return;
  }

  elements.voicesTitle.textContent = data.voices.title;
  elements.voicesText.textContent = data.voices.text;
  elements.voicesGrid.innerHTML = data.voices.items
    .map(
      (voice, index) => `
        <article class="voice-card reveal-item" style="--delay:${index * 70}ms">
          <p class="voice-quote">"${voice.quote}"</p>
          <div class="voice-person">
            <img src="${voice.image}" alt="${voice.name}" loading="lazy">
            <div>
              <h3>${voice.name}</h3>
              <p>${voice.role}</p>
            </div>
          </div>
        </article>
      `
    )
    .join("");
}

function renderGallery() {
  if (!data.gallery || !elements.galleryTitle || !elements.galleryGrid) {
    return;
  }

  elements.galleryTitle.textContent = data.gallery.title;
  elements.galleryText.textContent = data.gallery.text;
  elements.galleryGrid.innerHTML = data.gallery.items
    .map(
      (item, index) => `
        <figure class="gallery-card reveal-item" style="--delay:${index * 80}ms">
          <img src="${item.image}" alt="${item.title}" loading="lazy">
          <figcaption>${item.title}</figcaption>
        </figure>
      `
    )
    .join("");
}

function renderPartners() {
  if (!data.partners || !elements.partnersTitle || !elements.partnerStats || !elements.partnersGrid) {
    return;
  }

  elements.partnersTitle.textContent = data.partners.title;
  elements.partnersText.textContent = data.partners.text;
  elements.partnerStats.innerHTML = data.partners.stats
    .map(
      (stat, index) => `
        <article class="partner-stat reveal-item" style="--delay:${index * 80}ms">
          <span class="partner-stat-value">${stat.value}</span>
          <span class="partner-stat-label">${stat.label}</span>
        </article>
      `
    )
    .join("");

  elements.partnersGrid.innerHTML = data.partners.items
    .map(
      (partner, index) => `
        <article class="partner-card reveal-item" style="--delay:${index * 100}ms">
          <p class="partner-location">${partner.location}</p>
          <h3>${partner.name}</h3>
          <p>${partner.description}</p>
        </article>
      `
    )
    .join("");
}

function renderResources(query = "") {
  if (!data.resources || !elements.resourceCount || !elements.resourceGrid) {
    return;
  }

  const normalized = query.trim().toLowerCase();
  const items = data.resources.items.filter((item) => item.city.toLowerCase().includes(normalized));

  elements.resourceCount.textContent = `${items.length} ${items.length === 1 ? "PDF-Datei" : "PDF-Dateien"}`;

  if (!items.length) {
    elements.resourceGrid.innerHTML = '<p class="empty-state">Keine passende Stadt gefunden.</p>';
    return;
  }

  elements.resourceGrid.innerHTML = items
    .map(
      (item, index) => `
        <a class="resource-card reveal-item" href="${item.url}" target="_blank" rel="noreferrer" style="--delay:${index * 30}ms">
          <span>${item.city}</span>
          <span>PDF</span>
        </a>
      `
    )
    .join("");
}

function renderResourcePanel() {
  if (!data.resources || !elements.resourcesTitle || !elements.resourcesText) {
    return;
  }

  elements.resourcesTitle.textContent = data.resources.title;
  elements.resourcesText.textContent = data.resources.text;
  renderResources();
}

function renderContact() {
  if (!data.contact || !elements.contactTitle || !elements.contactGrid) {
    return;
  }

  elements.contactTitle.textContent = data.contact.title;
  elements.contactText.textContent = data.contact.text;
  elements.contactGrid.innerHTML = data.contact.cards
    .map(
      (card, index) => {
        const attrs = linkAttributes(card);
        return `
        <article class="contact-card reveal-item" style="--delay:${index * 100}ms">
          <h3>${card.title}</h3>
          <p>${card.text}</p>
          <a class="inline-link" href="${card.href}"${attrs}>${card.label}</a>
        </article>
      `;
      }
    )
    .join("");
}

function renderFooter() {
  if (!data.footer || !elements.footerNote || !elements.footerLinks) {
    return;
  }

  elements.footerNote.textContent = data.footer.note;
  elements.footerLinks.innerHTML = data.footer.links
    .map((link) => `<a href="${link.href}"${linkAttributes(link)}>${link.label}</a>`)
    .join("");
}

function getMenuLinks() {
  if (!elements.nav) {
    return [];
  }

  return Array.from(elements.nav.querySelectorAll("a[href]"));
}

function getMenuFocusables() {
  if (!elements.menuToggle) {
    return [];
  }

  return [elements.menuToggle, ...getMenuLinks()];
}

function syncMenuState() {
  if (!elements.menuToggle || !elements.nav) {
    return;
  }

  const showOverlayMenu = state.isMobile;
  const menuIsOpen = showOverlayMenu && state.isMenuOpen;

  elements.menuToggle.classList.toggle("is-active", menuIsOpen);
  elements.menuToggle.setAttribute("aria-expanded", String(menuIsOpen));
  elements.menuToggle.setAttribute("aria-label", menuIsOpen ? "Menü schließen" : "Menü öffnen");
  elements.nav.classList.toggle("is-open", menuIsOpen);
  elements.nav.setAttribute("aria-hidden", String(showOverlayMenu && !menuIsOpen));
  setInert(elements.nav, showOverlayMenu && !menuIsOpen);
  document.body.classList.toggle("is-menu-open", menuIsOpen);

  syncHeaderMetrics();
}

function closeMenu({ restoreFocus = false } = {}) {
  if (!elements.menuToggle || !elements.nav) {
    return;
  }

  state.isMenuOpen = false;
  syncMenuState();

  if (restoreFocus) {
    elements.menuToggle.focus({ preventScroll: true });
  }
}

function openMenu({ focusFirstLink = false } = {}) {
  if (!state.isMobile || !elements.menuToggle || !elements.nav) {
    return;
  }

  state.isMenuOpen = true;
  syncMenuState();

  if (focusFirstLink) {
    getMenuLinks()[0]?.focus({ preventScroll: true });
  }
}

function trapMenuFocus(event) {
  if (!state.isMobile || !state.isMenuOpen || event.key !== "Tab") {
    return;
  }

  const focusables = getMenuFocusables();

  if (!focusables.length) {
    return;
  }

  const first = focusables[0];
  const last = focusables[focusables.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
    return;
  }

  if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function setupMenu() {
  if (!elements.menuToggle || !elements.nav) {
    return;
  }

  syncMenuState();

  elements.menuToggle.addEventListener("click", (event) => {
    if (!state.isMobile) {
      return;
    }

    if (state.isMenuOpen) {
      closeMenu();
      return;
    }

    openMenu({ focusFirstLink: event.detail === 0 });
  });

  elements.nav.addEventListener("click", (event) => {
    const target = event.target;

    if (!(target instanceof HTMLAnchorElement) || !state.isMobile) {
      return;
    }

    closeMenu();
  });

  document.addEventListener("pointerdown", (event) => {
    if (!state.isMobile || !state.isMenuOpen || !elements.siteHeader) {
      return;
    }

    const target = event.target;

    if (!(target instanceof Node) || elements.siteHeader.contains(target)) {
      return;
    }

    closeMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && state.isMenuOpen) {
      closeMenu({ restoreFocus: true });
      return;
    }

    trapMenuFocus(event);
  });
}

function setupResources() {
  if (!elements.resourceSearch) {
    return;
  }

  elements.resourceSearch.addEventListener("input", (event) => {
    renderResources(event.target.value);
    setupReveal();
  });
}

function applyResponsiveState(refreshReveal = false) {
  const nextIsMobile = breakpoints.mobile.matches;
  const nextIsCompact = breakpoints.compact.matches;
  const nextIsTouch = breakpoints.touch.matches;
  const breakpointChanged =
    state.isMobile !== nextIsMobile ||
    state.isCompact !== nextIsCompact ||
    state.isTouch !== nextIsTouch;

  state.isMobile = nextIsMobile;
  state.isCompact = nextIsCompact;
  state.isTouch = nextIsTouch;

  document.body.classList.toggle("is-mobile", state.isMobile);
  document.body.classList.toggle("is-compact", state.isCompact);
  document.body.classList.toggle("is-touch", state.isTouch);
  document.documentElement.style.setProperty("--app-height", `${getViewportHeight()}px`);
  document.documentElement.style.setProperty("--viewport-width", `${getViewportWidth()}px`);

  if (!state.isMobile && state.isMenuOpen) {
    state.isMenuOpen = false;
  }

  syncMenuState();
  syncAnimationDelays();

  if (breakpointChanged && refreshReveal) {
    setupReveal(true);
  }
}

function queueViewportSync(refreshReveal = false) {
  state.pendingRevealRefresh = state.pendingRevealRefresh || refreshReveal;

  if (state.viewportFrame) {
    return;
  }

  state.viewportFrame = window.requestAnimationFrame(() => {
    const shouldRefreshReveal = state.pendingRevealRefresh;

    state.viewportFrame = 0;
    state.pendingRevealRefresh = false;
    applyResponsiveState(shouldRefreshReveal);
  });
}

function setupResponsiveState() {
  const handleViewportChange = () => queueViewportSync(true);

  applyResponsiveState(false);
  window.addEventListener("resize", handleViewportChange, { passive: true });
  window.addEventListener("orientationchange", handleViewportChange, { passive: true });

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", handleViewportChange, { passive: true });
    window.visualViewport.addEventListener("scroll", handleViewportChange, { passive: true });
  }
}

function setupScrollState() {
  const setState = () => {
    state.scrollFrame = 0;
    document.body.classList.toggle("is-scrolled", window.scrollY > 16);
  };

  const onScroll = () => {
    if (state.scrollFrame) {
      return;
    }

    state.scrollFrame = window.requestAnimationFrame(setState);
  };

  setState();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function setupReveal(forceObserverRefresh = false) {
  syncAnimationDelays();

  const revealables = document.querySelectorAll(".reveal, .reveal-item");

  if (prefersReducedMotion) {
    revealables.forEach((node) => node.classList.add("is-visible"));
    return;
  }

  ensureRevealObserver(forceObserverRefresh);

  revealables.forEach((node) => {
    if (!node.classList.contains("is-visible")) {
      revealObserver.observe(node);
    }
  });
}

function init() {
  renderNavigation();
  syncCurrentNavigation();
  renderHero();
  renderPageLinks();
  renderMission();
  renderEvents();
  renderServices();
  renderLeadership();
  renderVoices();
  renderGallery();
  renderPartners();
  renderResourcePanel();
  renderContact();
  renderFooter();
  setupMenu();
  setupResources();
  setupResponsiveState();
  setupScrollState();
  setupReveal();
}

init();
