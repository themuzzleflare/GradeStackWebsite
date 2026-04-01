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

const triggers = Array.from(document.querySelectorAll("[data-screen-trigger]"));
const showcaseImage = document.querySelector("[data-showcase-image]");
const showcaseTitle = document.querySelector("[data-showcase-title]");
const showcaseDescription = document.querySelector("[data-showcase-description]");
const showcaseCounter = document.querySelector("[data-showcase-counter]");
const screenStage = document.querySelector(".screen-stage");

if (
  triggers.length &&
  showcaseImage &&
  showcaseTitle &&
  showcaseDescription &&
  showcaseCounter &&
  screenStage
) {
  let activeIndex = Math.max(
    triggers.findIndex((trigger) => trigger.classList.contains("is-active")),
    0
  );
  let rotationId = null;

  function setActiveScreen(index) {
    activeIndex = (index + triggers.length) % triggers.length;
    const activeTrigger = triggers[activeIndex];

    triggers.forEach((trigger, triggerIndex) => {
      const isActive = triggerIndex === activeIndex;
      trigger.classList.toggle("is-active", isActive);
      trigger.setAttribute("aria-pressed", String(isActive));
    });

    screenStage.classList.add("is-updating");

    showcaseImage.src = activeTrigger.dataset.screenImage || showcaseImage.src;
    showcaseImage.alt = activeTrigger.dataset.screenAlt || showcaseImage.alt;
    showcaseTitle.textContent = activeTrigger.dataset.screenTitle || "";
    showcaseDescription.textContent = activeTrigger.dataset.screenDescription || "";
    showcaseCounter.textContent = `${String(activeIndex + 1).padStart(2, "0")} / ${String(
      triggers.length
    ).padStart(2, "0")}`;

    requestAnimationFrame(() => {
      window.setTimeout(() => {
        screenStage.classList.remove("is-updating");
      }, 120);
    });
  }

  function startRotation() {
    if (prefersReducedMotion.matches || triggers.length < 2) {
      return;
    }

    window.clearInterval(rotationId);
    rotationId = window.setInterval(() => {
      setActiveScreen(activeIndex + 1);
    }, 5200);
  }

  function stopRotation() {
    window.clearInterval(rotationId);
  }

  triggers.forEach((trigger, index) => {
    trigger.addEventListener("click", () => {
      setActiveScreen(index);
      startRotation();
    });
  });

  const showcaseRegion = document.querySelector(".showcase-grid");
  if (showcaseRegion) {
    showcaseRegion.addEventListener("mouseenter", stopRotation);
    showcaseRegion.addEventListener("mouseleave", startRotation);
  }

  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopRotation();
      return;
    }

    startRotation();
  });

  setActiveScreen(activeIndex);
  startRotation();
}
