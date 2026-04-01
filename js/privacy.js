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

if (policyLinks.length && policySections.length) {
  const linkById = new Map(
    policyLinks.map((link) => [link.getAttribute("href")?.slice(1), link])
  );

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      const visibleEntry = entries
        .filter((entry) => entry.isIntersecting)
        .sort((first, second) => second.intersectionRatio - first.intersectionRatio)[0];

      if (!visibleEntry) {
        return;
      }

      policyLinks.forEach((link) => link.classList.remove("is-active"));
      linkById.get(visibleEntry.target.id)?.classList.add("is-active");
    },
    {
      threshold: [0.2, 0.45, 0.7],
      rootMargin: "-18% 0px -45% 0px",
    }
  );

  policySections.forEach((section) => sectionObserver.observe(section));
}
