(function () {
  'use strict';

  const progress = document.getElementById('topProgress');
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');
  const finalTrigger = document.getElementById('finalTrigger');
  const finalReveal = document.getElementById('finalReveal');
  const revealClose = document.getElementById('revealClose');
  const songPlayer = document.getElementById('songPlayer');
  const finalSong = document.getElementById('finalSong');
  const songStatus = document.getElementById('songStatus');
  let closeFocusTarget = null;
  let songLoaded = false;

  // Top progress line — a small visual detail, not another feature to manage.
  function updateProgress() {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const current = maxScroll > 0 ? (window.scrollY / maxScroll) * 100 : 0;
    if (progress) progress.style.width = `${Math.min(100, Math.max(0, current))}%`;
  }
  window.addEventListener('scroll', updateProgress, { passive: true });
  updateProgress();

  // Mobile navigation.
  if (menuToggle && mainNav) {
    menuToggle.addEventListener('click', function () {
      const isOpen = mainNav.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', String(isOpen));
      menuToggle.setAttribute('aria-label', isOpen ? 'Navigation band karo' : 'Navigation kholo');
    });
    mainNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('open');
        menuToggle.setAttribute('aria-expanded', 'false');
        menuToggle.setAttribute('aria-label', 'Navigation kholo');
      });
    });
  }

  // Screenshot placeholders automatically disappear when the matching image file is added.
  document.querySelectorAll('.visual-still img').forEach(function (img) {
    const slot = img.closest('.visual-still');
    const optionalSlot = slot.classList.contains('optional-still');
    let handled = false;
    function imageLoaded() {
      if (handled) return;
      handled = true;
      if (img.naturalWidth > 0) {
        slot.classList.add('has-image');
        // Optional image slots become part of the grid only when their image is real.
        slot.classList.remove('optional-still');
      } else if (optionalSlot) {
        // No image in bonus slots? Remove the empty slot completely.
        slot.remove();
      } else {
        // Keep the designed placeholder for the first four required slots.
        img.remove();
      }
    }
    img.addEventListener('load', imageLoaded, { once: true });
    img.addEventListener('error', imageLoaded, { once: true });
    if (img.complete) imageLoaded();
  });

  // Optional character portraits: if Surya drops the named file in the folder, it blends into the design.
  document.querySelectorAll('.hero-portrait').forEach(function (img) {
    img.addEventListener('error', function () { img.remove(); }, { once: true });
    if (img.complete && img.naturalWidth === 0) img.remove();
  });

  function playFinalSong() {
    if (!finalSong) return;

    finalSong.currentTime = 0;

    finalSong.play()
        .then(function () {
            if (songStatus) {
                songStatus.textContent =
                    "Pleaseee Yawrrr, Badhiya Gana hai Pura sunn ke jana 😭🤣";
            }
        })
        .catch(function () {
            if (songStatus) {
                songStatus.textContent =
                    "Buddy, neeche diye gaye Play option se song chalao. 🎵";
            }

            // Playback fail ho toh user ko manual control do.
            finalSong.controls = true;
        });
}

  function openReveal() {
    closeFocusTarget = document.activeElement;
    finalReveal.hidden = false;
    document.body.classList.add('reveal-open');
    // Force a layout before applying the fade-in class.
    void finalReveal.offsetWidth;
    finalReveal.classList.add('is-open');
    revealClose.focus({ preventScroll: true });
    playFinalSong();
  }

  function closeReveal() {
    finalReveal.classList.remove('is-open');
    document.body.classList.remove('reveal-open');
    if (finalSong) {
    finalSong.pause();
    finalSong.currentTime = 0;
}
    window.setTimeout(function () {
      finalReveal.hidden = true;
      // Removing the iframe stops playback when the overlay closes.
      if (closeFocusTarget && typeof closeFocusTarget.focus === 'function') {
        closeFocusTarget.focus({ preventScroll: true });
      }
    }, 350);
  }

  if (finalTrigger) finalTrigger.addEventListener('click', openReveal);
  if (revealClose) revealClose.addEventListener('click', closeReveal);
  if (finalReveal) {
    finalReveal.addEventListener('click', function (event) {
      if (event.target === finalReveal) closeReveal();
    });
  }
  document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape' && finalReveal && !finalReveal.hidden) closeReveal();
  });

  // Reveal animation is CSS-led and respects reduced-motion preferences.
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    document.querySelectorAll('.section-kicker, .confession-heading, .confession-paper, .section-intro, .review-file, .visual-episode, .promise-content').forEach(function (el) {
      el.classList.add('will-reveal');
      observer.observe(el);
    });
  }
})();
