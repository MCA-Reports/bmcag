const data = window.BMCAG_DATA;
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let revealObserver;

const elements = {
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

function linkAttributes(item) {
  return item.external ? ' target="_blank" rel="noreferrer"' : "";
}

function renderNavigation() {
  elements.nav.innerHTML = data.navigation
    .map((item) => `<a href="${item.href}"${linkAttributes(item)}>${item.label}</a>`)
    .join("");
}

function renderHero() {
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
  elements.spotlightLink.href = data.spotlight.href;

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

function renderMission() {
  elements.missionTitle.textContent = data.mission.title;
  elements.missionText.textContent = data.mission.text;
  elements.missionImage.src = data.mission.image;
  elements.missionImage.alt = "BMCAG Gemeinschaftsbanner";
  elements.missionHighlights.innerHTML = data.mission.highlights
    .map((item) => `<li>${item}</li>`)
    .join("");
}

function renderEvents() {
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
  const normalized = query.trim().toLowerCase();
  const items = data.resources.items.filter((item) =>
    item.city.toLowerCase().includes(normalized)
  );

  elements.resourceCount.textContent = `${items.length} ${items.length === 1 ? "Download" : "Downloads"}`;

  if (!items.length) {
    elements.resourceGrid.innerHTML = '<p class="empty-state">Keine Stadt gefunden.</p>';
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
  elements.resourcesTitle.textContent = data.resources.title;
  elements.resourcesText.textContent = data.resources.text;
  renderResources();
}

function renderContact() {
  elements.contactTitle.textContent = data.contact.title;
  elements.contactText.textContent = data.contact.text;
  elements.contactGrid.innerHTML = data.contact.cards
    .map(
      (card, index) => `
        <article class="contact-card reveal-item" style="--delay:${index * 100}ms">
          <h3>${card.title}</h3>
          <p>${card.text}</p>
          <a class="inline-link" href="${card.href}" target="_blank" rel="noreferrer">${card.label}</a>
        </article>
      `
    )
    .join("");
}

function renderFooter() {
  elements.footerNote.textContent = data.footer.note;
  elements.footerLinks.innerHTML = data.footer.links
    .map((link) => `<a href="${link.href}" target="_blank" rel="noreferrer">${link.label}</a>`)
    .join("");
}

function setupMenu() {
  elements.menuToggle.addEventListener("click", () => {
    const isOpen = elements.nav.classList.toggle("is-open");
    elements.menuToggle.setAttribute("aria-expanded", String(isOpen));
  });

  elements.nav.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof HTMLAnchorElement)) {
      return;
    }
    elements.nav.classList.remove("is-open");
    elements.menuToggle.setAttribute("aria-expanded", "false");
  });
}

function setupResources() {
  elements.resourceSearch.addEventListener("input", (event) => {
    renderResources(event.target.value);
    setupReveal();
  });
}

function setupScrollState() {
  const setState = () => {
    document.body.classList.toggle("is-scrolled", window.scrollY > 16);
  };

  setState();
  window.addEventListener("scroll", setState, { passive: true });
}

function setupReveal() {
  const revealables = document.querySelectorAll(".reveal, .reveal-item");

  if (prefersReducedMotion) {
    revealables.forEach((node) => node.classList.add("is-visible"));
    return;
  }

  if (!revealObserver) {
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
      {
        threshold: 0.12,
        rootMargin: "0px 0px -8% 0px"
      }
    );
  }

  revealables.forEach((node) => {
    if (!node.classList.contains("is-visible")) {
      revealObserver.observe(node);
    }
  });
}

function init() {
  renderNavigation();
  renderHero();
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
  setupScrollState();
  setupReveal();
}

init();
