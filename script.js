
"use strict";

// ==========================================
// PORTFOLIO — MAIN JAVASCRIPT
// ==========================================

document.addEventListener("DOMContentLoaded", () => {

  // ========================================
  // 1. FOOTER YEAR
  // ========================================

  const yearElement = document.getElementById("year");

  if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
  }

  // ========================================
  // 2. MOBILE NAVIGATION
  // ========================================

  const menuToggle = document.querySelector(".menu-toggle");
  const mainNav = document.getElementById("main-nav");

  if (menuToggle && mainNav) {

    function closeMenu() {
      mainNav.classList.remove("is-open");
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Open navigation");
    }

    menuToggle.addEventListener("click", () => {
      const isOpen = mainNav.classList.toggle("is-open");

      menuToggle.setAttribute(
        "aria-expanded",
        String(isOpen)
      );

      menuToggle.setAttribute(
        "aria-label",
        isOpen ? "Close navigation" : "Open navigation"
      );
    });

    mainNav.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") {
        closeMenu();
      }
    });

    document.addEventListener("click", (event) => {
      if (
        !mainNav.contains(event.target) &&
        !menuToggle.contains(event.target)
      ) {
        closeMenu();
      }
    });
  }

  // ========================================
  // 3. MY JOURNEY PHOTO SLIDESHOW
  // ========================================

  const slideshow = document.getElementById("journey-slideshow");

  if (!slideshow) {
    return;
  }

  const slides = Array.from(
    slideshow.querySelectorAll(".journey-slide")
  );

  const previousButton = slideshow.querySelector(".slide-prev");
  const nextButton = slideshow.querySelector(".slide-next");
  const dotsContainer = slideshow.querySelector(".slide-dots");
  const counter = slideshow.querySelector(".slide-counter");

  if (
    slides.length === 0 ||
    !previousButton ||
    !nextButton ||
    !dotsContainer ||
    !counter
  ) {
    return;
  }

  let currentSlide = 0;
  let autoPlayTimer = null;
  let touchStartX = 0;
  let touchStartY = 0;

  const slideInterval = 5000;

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  // ========================================
  // 4. CREATE NAVIGATION DOTS
  // ========================================

  dotsContainer.innerHTML = "";

  const dots = slides.map((slide, index) => {
    const dot = document.createElement("button");

    dot.type = "button";
    dot.className = "slide-dot";
    dot.setAttribute(
      "aria-label",
      `Go to photo ${index + 1} of ${slides.length}`
    );

    dot.addEventListener("click", () => {
      showSlide(index);
      restartAutoPlay();
    });

    dotsContainer.appendChild(dot);

    return dot;
  });

  // ========================================
  // 5. DISPLAY THE SELECTED SLIDE
  // ========================================

  function showSlide(index) {

    currentSlide =
      (index + slides.length) % slides.length;

    slides.forEach((slide, slideIndex) => {
      const isActive = slideIndex === currentSlide;

      slide.classList.toggle("active", isActive);

      slide.setAttribute(
        "aria-hidden",
        String(!isActive)
      );
    });

    dots.forEach((dot, dotIndex) => {
      const isActive = dotIndex === currentSlide;

      dot.classList.toggle("active", isActive);

      if (isActive) {
        dot.setAttribute("aria-current", "true");
      } else {
        dot.removeAttribute("aria-current");
      }
    });

    const current = String(currentSlide + 1).padStart(2, "0");
    const total = String(slides.length).padStart(2, "0");

    counter.textContent = `${current} / ${total}`;
  }

  // ========================================
  // 6. PREVIOUS AND NEXT BUTTONS
  // ========================================

  function nextSlide() {
    showSlide(currentSlide + 1);
  }

  function previousSlide() {
    showSlide(currentSlide - 1);
  }

  nextButton.addEventListener("click", () => {
    nextSlide();
    restartAutoPlay();
  });

  previousButton.addEventListener("click", () => {
    previousSlide();
    restartAutoPlay();
  });

  // ========================================
  // 7. AUTOMATIC SLIDESHOW
  // ========================================

  function stopAutoPlay() {
    if (autoPlayTimer !== null) {
      clearInterval(autoPlayTimer);
      autoPlayTimer = null;
    }
  }

  function startAutoPlay() {
    stopAutoPlay();

    if (
      slides.length <= 1 ||
      prefersReducedMotion.matches ||
      document.hidden
    ) {
      return;
    }

    autoPlayTimer = setInterval(() => {
      nextSlide();
    }, slideInterval);
  }

  function restartAutoPlay() {
    startAutoPlay();
  }

  // Pause when the user hovers over the slideshow.
  slideshow.addEventListener("mouseenter", stopAutoPlay);

  slideshow.addEventListener("mouseleave", startAutoPlay);

  // Pause while interacting with slideshow controls.
  slideshow.addEventListener("focusin", stopAutoPlay);

  slideshow.addEventListener("focusout", (event) => {
    if (!slideshow.contains(event.relatedTarget)) {
      startAutoPlay();
    }
  });

  // Pause when the browser tab is hidden.
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      stopAutoPlay();
    } else {
      startAutoPlay();
    }
  });

  // Respect reduced-motion accessibility settings.
  if (prefersReducedMotion.addEventListener) {
    prefersReducedMotion.addEventListener("change", startAutoPlay);
  }

  // ========================================
  // 8. MOBILE SWIPE SUPPORT
  // ========================================

  const slideStage = slideshow.querySelector(".slideshow-stage");

  if (slideStage) {

    slideStage.addEventListener(
      "touchstart",
      (event) => {
        if (event.touches.length !== 1) {
          return;
        }

        touchStartX = event.touches[0].clientX;
        touchStartY = event.touches[0].clientY;
      },
      { passive: true }
    );

    slideStage.addEventListener(
      "touchend",
      (event) => {
        if (event.changedTouches.length === 0) {
          return;
        }

        const touchEndX = event.changedTouches[0].clientX;
        const touchEndY = event.changedTouches[0].clientY;

        const differenceX = touchEndX - touchStartX;
        const differenceY = touchEndY - touchStartY;

        // Ignore vertical scrolling and tiny movements.
        if (
          Math.abs(differenceX) < 50 ||
          Math.abs(differenceX) <= Math.abs(differenceY)
        ) {
          return;
        }

        if (differenceX < 0) {
          nextSlide();
        } else {
          previousSlide();
        }

        restartAutoPlay();
      },
      { passive: true }
    );
  }

  // ========================================
  // 9. KEYBOARD NAVIGATION
  // ========================================

  slideshow.setAttribute("tabindex", "0");

  slideshow.addEventListener("keydown", (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      nextSlide();
      restartAutoPlay();
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      previousSlide();
      restartAutoPlay();
    }
  });

  // ========================================
  // 10. INITIALISE SLIDESHOW
  // ========================================

  showSlide(0);
  startAutoPlay();

  console.log(
    `Portfolio slideshow ready: ${slides.length} photos loaded.`
  );

});
