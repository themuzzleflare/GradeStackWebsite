document.documentElement.classList.add("js-enabled");

const header = document.querySelector(".site-header");

function syncHeaderState() {
  if (!header) {
    return;
  }

  header.classList.toggle("is-scrolled", window.scrollY > 12);
}

syncHeaderState();
window.addEventListener("scroll", syncHeaderState, { passive: true });

const revealElements = document.querySelectorAll(".reveal");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (prefersReducedMotion.matches) {
  revealElements.forEach((element) => element.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.18,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealElements.forEach((element) => revealObserver.observe(element));
}

const policyLinks = Array.from(document.querySelectorAll("[data-policy-link]"));
const policySections = Array.from(document.querySelectorAll("[data-policy-section]"));
const accordionMode = window.matchMedia("(max-width: 900px)");

function getSectionFromHash() {
  const hash = window.location.hash.replace("#", "");
  return policySections.find((section) => section.id === hash) || null;
}

function setActivePolicyLink(id) {
  policyLinks.forEach((link) => {
    const isActive = link.getAttribute("href") === `#${id}`;
    link.classList.toggle("is-active", isActive);
  });
}

function closeSiblingSections(activeSection) {
  policySections.forEach((section) => {
    if (section !== activeSection) {
      section.open = false;
    }
  });
}

function openPolicySection(section, { scroll = false, updateHash = false } = {}) {
  if (!section) {
    return;
  }

  section.open = true;

  if (accordionMode.matches) {
    closeSiblingSections(section);
  }

  setActivePolicyLink(section.id);

  if (updateHash) {
    window.history.replaceState(null, "", `#${section.id}`);
  }

  if (scroll) {
    section.scrollIntoView({
      behavior: prefersReducedMotion.matches ? "auto" : "smooth",
      block: "start",
    });
  }
}

function syncAccordionLayout() {
  if (!policySections.length) {
    return;
  }

  if (accordionMode.matches) {
    const targetSection =
      getSectionFromHash() ||
      policySections.find((section) => section.open) ||
      policySections[0];

    policySections.forEach((section) => {
      section.open = section === targetSection;
    });

    setActivePolicyLink(targetSection.id);
    return;
  }

  policySections.forEach((section) => {
    section.open = true;
  });

  setActivePolicyLink(getSectionFromHash()?.id || policySections[0].id);
}

if (policyLinks.length && policySections.length) {
  policyLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href")?.slice(1);
      const targetSection = policySections.find((section) => section.id === targetId);

      if (!targetSection) {
        return;
      }

      event.preventDefault();
      openPolicySection(targetSection, { scroll: true, updateHash: true });
    });
  });

  policySections.forEach((section) => {
    section.addEventListener("toggle", () => {
      if (accordionMode.matches) {
        if (section.open) {
          closeSiblingSections(section);
          setActivePolicyLink(section.id);
          return;
        }

        const openSection = policySections.find((candidate) => candidate.open);
        if (!openSection) {
          section.open = true;
          setActivePolicyLink(section.id);
        }

        return;
      }

      if (section.open) {
        setActivePolicyLink(section.id);
      }
    });
  });

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

      if (!visibleEntry) {
        return;
      }

      setActivePolicyLink(visibleEntry.target.id);
    },
    {
      threshold: [0.18, 0.4, 0.65],
      rootMargin: "-18% 0px -45% 0px",
    }
  );

  policySections.forEach((section) => sectionObserver.observe(section));

  syncAccordionLayout();

  window.addEventListener("hashchange", () => {
    const targetSection = getSectionFromHash();
    if (targetSection) {
      openPolicySection(targetSection, { scroll: true });
    }
  });

  accordionMode.addEventListener("change", () => {
    syncAccordionLayout();
  });
}
