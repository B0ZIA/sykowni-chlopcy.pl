document.addEventListener("DOMContentLoaded", () => {
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (window.AOS) {
    AOS.init({
      duration: 700,
      easing: 'ease-out-cubic',
      once: true,
      offset: 80,
      disable: prefersReducedMotion
    });
  }

  const yearSpan = document.getElementById('year');
  if (yearSpan) yearSpan.textContent = new Date().getFullYear();

  const navbar = document.getElementById('navbar');
  const scrollToTopBtn = document.getElementById('scrollToTopBtn');
  const hamburger = document.getElementById('hamburger');
  const navLinks = document.getElementById('nav-links');

  /* ---------- nawigacja: stan po scrollu ---------- */
  function onScroll() {
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 20);
    scrollToTopBtn.classList.toggle('show', y > 500);
    updateScrollSpy();
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  window.scrollToTop = function () {
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    closeMobileMenu();
  };
  scrollToTopBtn.addEventListener('click', window.scrollToTop);

  /* ---------- menu mobilne ---------- */
  function closeMobileMenu() {
    hamburger.classList.remove('open');
    navLinks.classList.remove('open');
    hamburger.setAttribute('aria-expanded', 'false');
  }

  hamburger.addEventListener('click', () => {
    const open = navLinks.classList.toggle('open');
    hamburger.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('click', (e) => {
    if (!navLinks.classList.contains('open')) return;
    if (!navLinks.contains(e.target) && !hamburger.contains(e.target)) closeMobileMenu();
  });

  /* ---------- wybór wersji językowej ---------- */
  const langToggle = document.getElementById('lang-toggle');
  const langMenu = document.getElementById('lang-menu');

  if (langToggle && langMenu) {
    const closeLangMenu = () => {
      langMenu.hidden = true;
      langToggle.setAttribute('aria-expanded', 'false');
    };

    langToggle.addEventListener('click', (e) => {
      e.stopPropagation();
      const open = langMenu.hidden;
      langMenu.hidden = !open;
      langToggle.setAttribute('aria-expanded', String(open));
    });

    document.addEventListener('click', (e) => {
      if (!langMenu.hidden && !langMenu.contains(e.target)) closeLangMenu();
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !langMenu.hidden) {
        closeLangMenu();
        langToggle.focus();
      }
    });
  }

  /* ---------- płynne przewijanie do sekcji ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (!targetId || targetId === '#') return;
      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      closeMobileMenu();

      const offset = target.getBoundingClientRect().top + window.scrollY - navbar.offsetHeight - 12;
      window.scrollTo({ top: Math.max(offset, 0), behavior: prefersReducedMotion ? 'auto' : 'smooth' });
    });
  });

  /* ---------- podświetlanie aktywnej sekcji ---------- */
  const sections = document.querySelectorAll('section[id], header[id]');
  const navItems = document.querySelectorAll('.nav-links a');

  function updateScrollSpy() {
    let currentId = '';
    const scrollY = window.scrollY + navbar.offsetHeight + 100;

    sections.forEach(sec => {
      if (scrollY >= sec.offsetTop && scrollY < sec.offsetTop + sec.offsetHeight) {
        currentId = sec.getAttribute('id');
      }
    });

    navItems.forEach(link => {
      link.classList.toggle('active', link.getAttribute('href') === `#${currentId}`);
    });
  }
  updateScrollSpy();

  /* ---------- liczniki w pasku statystyk ---------- */
  const counters = document.querySelectorAll('.stat-num');
  if (counters.length) {
    const runCounter = (el) => {
      const target = parseInt(el.dataset.count, 10) || 0;
      const suffix = el.dataset.suffix || '';
      const duration = 1200;

      if (prefersReducedMotion || target === 0) {
        el.textContent = `${target}${suffix}`;
        return;
      }

      const start = performance.now();
      const tick = (now) => {
        const progress = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = `${Math.round(target * eased)}${suffix}`;
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };

    const counterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          runCounter(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(el => counterObserver.observe(el));
  }

  /* ---------- FAQ ---------- */
  document.querySelectorAll('.faq-item').forEach(item => {
    const question = item.querySelector('.faq-q');
    const answer = item.querySelector('.faq-a');
    if (!question || !answer) return;

    question.addEventListener('click', () => {
      const isOpen = item.classList.contains('open');

      document.querySelectorAll('.faq-item.open').forEach(other => {
        other.classList.remove('open');
        other.querySelector('.faq-a').style.maxHeight = null;
        other.querySelector('.faq-q').setAttribute('aria-expanded', 'false');
      });

      if (!isOpen) {
        item.classList.add('open');
        answer.style.maxHeight = `${answer.scrollHeight}px`;
        question.setAttribute('aria-expanded', 'true');
      }
    });
  });

  /* ---------- formularz kontaktowy ---------- */
  const contactForm = document.getElementById('contact-form');
  const formMessage = document.getElementById('form-message');

  if (contactForm) {
    contactForm.addEventListener('submit', async function (e) {
      e.preventDefault();
      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const formData = new FormData(contactForm);

      const isSK = document.documentElement.lang === 'sk';
      const sendingText = isSK ? 'Odosielanie...' : 'Wysyłanie...';
      const successText = isSK ? 'Ďakujeme! Vaša správa bola odoslaná.' : 'Dziękujemy! Twoja wiadomość została wysłana. Odezwiemy się najszybciej, jak to możliwe.';
      const errorText = isSK ? 'Vyskytla sa chyba. Skúste to prosím znova.' : 'Wystąpił błąd. Spróbuj ponownie lub zadzwoń: +48 574 977 131.';

      formMessage.textContent = sendingText;
      formMessage.className = 'form-message';
      if (submitBtn) submitBtn.disabled = true;

      try {
        const response = await fetch(contactForm.action, {
          method: 'POST',
          headers: { 'Accept': 'application/json' },
          body: formData
        });

        if (!response.ok) throw new Error('Server error');

        contactForm.reset();
        formMessage.textContent = successText;
        formMessage.classList.add('success');
      } catch (error) {
        formMessage.textContent = errorText;
        formMessage.classList.add('error');
      } finally {
        if (submitBtn) submitBtn.disabled = false;
      }
    });
  }

  /* ---------- opinie: dane z wizytówki Google ----------
     reviews.json wypełnia raz na dobę GitHub Action (tools/fetch_reviews.py).
     Sekcja startuje ukryta i pokazuje się dopiero przy komplecie opinii –
     mniej niż MIN_REVIEWS wygląda gorzej niż brak sekcji w ogóle. */
  const MIN_REVIEWS = 3;

  const GOOGLE_G_SVG = `
    <svg viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg">
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z"/>
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z"/>
      <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34C2.85 17.09 2 20.45 2 24s.85 6.91 2.34 9.88l7.35-5.7z"/>
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z"/>
    </svg>`;

  function buildStars(rating) {
    const stars = document.createElement('div');
    stars.className = 'rv-stars';
    stars.setAttribute('role', 'img');
    stars.setAttribute('aria-label', `Ocena ${rating} na 5`);
    for (let i = 1; i <= 5; i++) {
      const star = document.createElement('i');
      star.className = i <= Math.round(rating) ? 'fas fa-star' : 'far fa-star';
      stars.appendChild(star);
    }
    return stars;
  }

  function buildReviewCard(review) {
    const card = document.createElement('article');
    card.className = 'review-card';

    const head = document.createElement('div');
    head.className = 'rv-head';

    const avatar = document.createElement('span');
    avatar.className = 'rv-avatar';
    avatar.setAttribute('aria-hidden', 'true');
    avatar.style.setProperty('--av', review.color || '#1A73E8');
    avatar.textContent = review.initials || '?';
    if (review.photo) {
      const photo = document.createElement('img');
      photo.className = 'rv-photo';
      photo.src = review.photo;
      photo.alt = '';
      photo.loading = 'lazy';
      photo.referrerPolicy = 'no-referrer';
      photo.addEventListener('error', () => photo.remove());
      avatar.appendChild(photo);
    }

    const meta = document.createElement('div');
    meta.className = 'rv-meta';
    const name = document.createElement('strong');
    name.textContent = review.author || 'Klient Google';
    const time = document.createElement('span');
    time.textContent = review.relativeTime || '';
    meta.append(name, time);

    const logo = document.createElement('span');
    logo.className = 'rv-g';
    logo.setAttribute('aria-hidden', 'true');
    logo.innerHTML = GOOGLE_G_SVG;

    head.append(avatar, meta, logo);

    const text = document.createElement('p');
    text.className = 'rv-text';
    text.textContent = review.text || '';

    const more = document.createElement('button');
    more.type = 'button';
    more.className = 'rv-more';
    more.textContent = 'Czytaj więcej';

    card.append(head, buildStars(review.rating || 5), text, more);
    return card;
  }

  function renderGoogleReviews(data, track) {
    if (!data || !Array.isArray(data.reviews) || data.reviews.length < MIN_REVIEWS) return false;

    track.replaceChildren(...data.reviews.map(buildReviewCard));

    const summary = document.querySelector('.google-card');
    if (!summary) return true;

    const count = data.ratingCount || data.reviews.length;
    const rating = typeof data.rating === 'number'
      ? data.rating
      : data.reviews.reduce((sum, r) => sum + (r.rating || 5), 0) / data.reviews.length;

    const num = summary.querySelector('.gc-num');
    if (num) num.textContent = rating.toFixed(1).replace('.', ',');

    const oldStars = summary.querySelector('.rv-stars');
    if (oldStars) oldStars.replaceWith(buildStars(rating));

    const counter = summary.querySelector('.gc-count');
    /* po „na podstawie" liczebnik zawsze łączy się z dopełniaczem: 3 opinii, 5 opinii */
    if (counter) counter.textContent = `na podstawie ${count} opinii`;

    const profile = summary.querySelector('a[href*="google"]');
    if (profile && data.profileUrl) profile.href = data.profileUrl;

    /* rozkład ocen pokazujemy tylko wtedy, gdy mamy komplet opinii –
       Google udostępnia treść najwyżej pięciu, więc przy większej liczbie byłby zmyślony */
    const bars = summary.querySelector('.gc-bars');
    if (bars) {
      if (data.reviews.length >= count) {
        Array.from(bars.querySelectorAll('li')).forEach((row, index) => {
          const stars = 5 - index;
          const share = data.reviews.filter(r => Math.round(r.rating || 5) === stars).length / count * 100;
          row.querySelector('.gc-bar i').style.setProperty('--w', `${share}%`);
        });
      } else {
        bars.remove();
      }
    }

    return true;
  }

  async function loadGoogleReviews(track) {
    try {
      const response = await fetch('reviews.json', { cache: 'no-cache' });
      if (!response.ok) return false;
      return renderGoogleReviews(await response.json(), track);
    } catch (error) {
      /* brak pliku albo błąd sieci – sekcja zostaje ukryta */
      return false;
    }
  }

  function revealReviewsSection() {
    document.querySelectorAll('#reviews, .js-reviews-link').forEach(el => { el.hidden = false; });
    if (window.AOS) AOS.refresh();
  }

  /* ---------- karuzela opinii ---------- */
  function initReviewsCarousel(reviewsTrack) {
    const reviewCards = Array.from(reviewsTrack.querySelectorAll('.review-card'));
    const reviewDots = document.getElementById('reviews-dots');
    const reviewPrev = document.getElementById('reviews-prev');
    const reviewNext = document.getElementById('reviews-next');

    /* szerokość jednej karty razem z odstępem */
    const cardStep = () => (reviewCards.length > 1
      ? reviewCards[1].offsetLeft - reviewCards[0].offsetLeft
      : reviewsTrack.clientWidth);
    const perView = () => Math.max(1, Math.round(reviewsTrack.clientWidth / cardStep()));
    const pageCount = () => Math.max(1, Math.ceil(reviewCards.length / perView()));
    const currentPage = () => Math.min(
      Math.round(reviewsTrack.scrollLeft / (cardStep() * perView())),
      pageCount() - 1
    );

    function scrollToPage(page) {
      const index = Math.min(Math.max(page, 0) * perView(), reviewCards.length - 1);
      reviewsTrack.scrollTo({
        left: reviewCards[index].offsetLeft - reviewCards[0].offsetLeft,
        behavior: prefersReducedMotion ? 'auto' : 'smooth'
      });
    }

    function syncReviewControls() {
      const page = currentPage();
      Array.from(reviewDots.children).forEach((dot, i) => {
        dot.classList.toggle('is-active', i === page);
        dot.setAttribute('aria-current', i === page ? 'true' : 'false');
      });
      reviewPrev.disabled = page === 0;
      reviewNext.disabled = page >= pageCount() - 1;
    }

    function buildReviewDots() {
      reviewDots.innerHTML = '';
      for (let i = 0; i < pageCount(); i++) {
        const dot = document.createElement('button');
        dot.type = 'button';
        dot.setAttribute('aria-label', `Opinie – strona ${i + 1}`);
        dot.addEventListener('click', () => scrollToPage(i));
        reviewDots.appendChild(dot);
      }
      syncReviewControls();
    }

    /* „czytaj więcej" pokazujemy tylko tam, gdzie tekst faktycznie się nie mieści */
    function checkClamped() {
      reviewCards.forEach(card => {
        if (card.classList.contains('expanded')) return;
        const text = card.querySelector('.rv-text');
        if (!text) return;
        card.classList.toggle('has-more', text.scrollHeight - text.clientHeight > 4);
      });
    }

    reviewCards.forEach(card => {
      const moreBtn = card.querySelector('.rv-more');
      if (!moreBtn) return;
      moreBtn.addEventListener('click', () => {
        const expanded = card.classList.toggle('expanded');
        moreBtn.textContent = expanded ? 'Zwiń' : 'Czytaj więcej';
      });
    });

    reviewPrev.addEventListener('click', () => scrollToPage(currentPage() - 1));
    reviewNext.addEventListener('click', () => scrollToPage(currentPage() + 1));
    reviewsTrack.addEventListener('scroll', syncReviewControls, { passive: true });

    let reviewsResizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(reviewsResizeTimer);
      reviewsResizeTimer = setTimeout(() => {
        buildReviewDots();
        checkClamped();
      }, 200);
    });

    buildReviewDots();
    checkClamped();
    /* po dociągnięciu fontów wysokość tekstu potrafi się zmienić */
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(checkClamped);
  }

  const reviewsTrackEl = document.getElementById('reviews-track');
  if (reviewsTrackEl) {
    loadGoogleReviews(reviewsTrackEl).then(hasReviews => {
      if (!hasReviews) return;
      /* karuzelę mierzymy dopiero po odsłonięciu sekcji – ukryta nie ma wymiarów */
      revealReviewsSection();
      initReviewsCarousel(reviewsTrackEl);
    });
  }

  /* ---------- galeria przed / po ---------- */
  const galleryCards = document.querySelectorAll('.gallery-card');

  /* podpis pod zdjęciem budujemy z atrybutów data-* karty;
     zakres prac idzie na pierwszy plan, reszta jako parametry z ikonami,
     a puste pola pomijamy, żeby nie zostawiać sierot */
  const FACT_ICONS = { place: 'fas fa-map-marker-alt', area: 'fas fa-vector-square', time: 'far fa-clock' };

  function buildGalleryMeta(card) {
    const { place, scope, area, time } = card.dataset;
    if (!place && !scope && !area && !time) return;

    const wrap = card.querySelector('.img-wrap');

    /* miejscowość jako plakietka w rogu zdjęcia */
    if (place && wrap) {
      const badge = document.createElement('span');
      badge.className = 'gm-badge';
      const pin = document.createElement('i');
      pin.className = FACT_ICONS.place;
      pin.setAttribute('aria-hidden', 'true');
      badge.append(pin, document.createTextNode(place));
      wrap.appendChild(badge);
    }

    /* zakres prac na przyciemnionym pasku u dołu zdjęcia */
    if (scope && wrap) {
      const strip = document.createElement('p');
      strip.className = 'gm-strip';
      strip.textContent = scope;
      wrap.appendChild(strip);
    }

    const meta = document.createElement('div');
    meta.className = 'gallery-meta';

    const facts = [
      wrap ? null : ['place', place],
      ['area', area],
      ['time', time]
    ].filter(entry => entry && entry[1]);

    if (!facts.length) return;

    const list = document.createElement('ul');
    list.className = 'gm-facts';
    facts.forEach(([key, value]) => {
      const item = document.createElement('li');
      const icon = document.createElement('i');
      icon.className = FACT_ICONS[key];
      icon.setAttribute('aria-hidden', 'true');
      item.append(icon, document.createTextNode(value));
      list.appendChild(item);
    });
    meta.appendChild(list);

    card.appendChild(meta);
  }

  galleryCards.forEach(buildGalleryMeta);

  const overlay = document.getElementById('lightbox-overlay');
  const beforeImg = document.getElementById('lightbox-before');
  const afterImg = document.getElementById('lightbox-after');
  let currentIndex = 0;
  let lastFocused = null;

  /* podmieniamy rozszerzenie na .webp, a przy braku pliku wracamy do .jpg */
  function setLightboxImage(img, file) {
    img.onerror = () => { img.onerror = null; img.src = file; };
    img.src = file.replace(/\.jpe?g$/i, '.webp');
  }

  const lbPlace = document.getElementById('lightbox-place');
  const lbTitle = document.getElementById('lightbox-title');
  const lbCounter = document.getElementById('lightbox-counter');
  const lbDesc = document.getElementById('lightbox-desc');
  const lbFacts = document.getElementById('lightbox-facts');
  const lbLegend = document.getElementById('lightbox-legend');
  const lbFrames = {
    before: document.getElementById('lightbox-frame-before'),
    after: document.getElementById('lightbox-frame-after')
  };

  /* dymek przy pinezce z brzegu zdjęcia wyjechałby poza ekran – przesuwamy go do środka */
  function clampPinLabel(pin) {
    const label = pin.querySelector('.lb-pin-label');
    if (!label) return;
    label.style.left = '50%';
    label.style.setProperty('--shift', '0px');
    const box = label.getBoundingClientRect();
    const margin = 12;
    let shift = 0;
    if (box.left < margin) shift = margin - box.left;
    else if (box.right > window.innerWidth - margin) shift = window.innerWidth - margin - box.right;
    shift = Math.round(shift);
    if (!shift) return;
    label.style.left = `calc(50% + ${shift}px)`;
    /* dziobek zostaje nad kropką */
    label.style.setProperty('--shift', `${shift}px`);
  }

  /* pinezki i legenda podświetlają się nawzajem */
  function linkPinToLegendItem(pin, item) {
    const on = () => { pin.classList.add('is-active'); item.classList.add('is-active'); };
    const off = () => { pin.classList.remove('is-active'); item.classList.remove('is-active'); };
    item.addEventListener('mouseenter', on);
    item.addEventListener('mouseleave', off);
    pin.addEventListener('mouseenter', on);
    pin.addEventListener('mouseleave', off);
  }

  function buildLightboxPins(card) {
    Object.values(lbFrames).forEach(frame => {
      frame.querySelectorAll('.lb-pin').forEach(pin => pin.remove());
    });
    lbLegend.replaceChildren();

    const details = card.querySelector('.gm-details');
    const notes = details ? Array.from(details.content.querySelectorAll('li')) : [];
    if (!notes.length) {
      lbLegend.hidden = true;
      return;
    }

    notes.forEach((note, i) => {
      const number = i + 1;
      const text = note.textContent.trim();
      const frame = lbFrames[note.dataset.side === 'before' ? 'before' : 'after'];

      const pin = document.createElement('button');
      pin.type = 'button';
      pin.className = 'lb-pin';
      pin.style.left = `${note.dataset.x || 50}%`;
      pin.style.top = `${note.dataset.y || 50}%`;
      pin.setAttribute('aria-label', `Szczegół ${number}: ${text}`);

      const dot = document.createElement('span');
      dot.className = 'lb-pin-dot';
      dot.textContent = number;

      const label = document.createElement('span');
      label.className = 'lb-pin-label';
      label.textContent = text;

      /* na dotyku nie ma najechania, więc kliknięcie przypina dymek */
      pin.addEventListener('click', (e) => {
        e.stopPropagation();
        const open = pin.classList.contains('is-open');
        overlay.querySelectorAll('.lb-pin.is-open').forEach(p => p.classList.remove('is-open'));
        pin.classList.toggle('is-open', !open);
        if (!open) clampPinLabel(pin);
      });
      pin.addEventListener('mouseenter', () => clampPinLabel(pin));
      pin.addEventListener('focus', () => clampPinLabel(pin));

      pin.append(dot, label);
      frame.appendChild(pin);

      const item = document.createElement('li');
      const badge = document.createElement('span');
      badge.className = 'lb-legend-num';
      badge.textContent = number;
      item.append(badge, document.createTextNode(text));
      lbLegend.appendChild(item);

      linkPinToLegendItem(pin, item);
    });

    lbLegend.hidden = false;
  }

  function showLightboxPair(index) {
    const card = galleryCards[index];
    const { place, scope, area, time } = card.dataset;

    setLightboxImage(beforeImg, card.getAttribute('data-before'));
    setLightboxImage(afterImg, card.getAttribute('data-after'));

    lbPlace.hidden = !place;
    if (place) lbPlace.querySelector('span').textContent = place;
    lbTitle.textContent = scope || place || 'Porównanie przed i po';
    lbCounter.textContent = `${index + 1} / ${galleryCards.length}`;

    const details = card.querySelector('.gm-details');
    const desc = details ? details.content.querySelector('p') : null;
    lbDesc.textContent = desc ? desc.textContent.trim() : '';
    lbDesc.hidden = !desc;

    /* zakres prac jest już nagłówkiem, więc w parametrach zostają liczby */
    const facts = [
      ['fas fa-vector-square', area],
      ['far fa-clock', time]
    ].filter(([, value]) => value);

    lbFacts.replaceChildren(...facts.map(([iconClass, value]) => {
      const item = document.createElement('li');
      const icon = document.createElement('i');
      icon.className = iconClass;
      icon.setAttribute('aria-hidden', 'true');
      item.append(icon, document.createTextNode(value));
      return item;
    }));

    buildLightboxPins(card);

    overlay.style.display = 'flex';
    document.body.classList.add('noscroll');
    currentIndex = index;
  }

  function closeLightbox() {
    overlay.style.display = 'none';
    document.body.classList.remove('noscroll');
    if (lastFocused) lastFocused.focus();
  }

  galleryCards.forEach((card, index) => {
    card.setAttribute('tabindex', '0');
    card.setAttribute('role', 'button');
    card.addEventListener('click', () => {
      lastFocused = card;
      showLightboxPair(index);
    });
    card.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        lastFocused = card;
        showLightboxPair(index);
      }
    });
  });

  const prevBtn = document.getElementById('lightbox-prev');
  const nextBtn = document.getElementById('lightbox-next');

  document.getElementById('lightbox-close').addEventListener('click', closeLightbox);

  prevBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showLightboxPair((currentIndex - 1 + galleryCards.length) % galleryCards.length);
  });

  nextBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    showLightboxPair((currentIndex + 1) % galleryCards.length);
  });

  overlay.addEventListener('click', (e) => {
    /* kliknięcie w tło zamyka, ale najpierw chowamy otwarty dymek pinezki */
    const openPin = overlay.querySelector('.lb-pin.is-open');
    if (openPin && !openPin.contains(e.target)) {
      openPin.classList.remove('is-open');
      return;
    }
    if (e.target === overlay || e.target.classList.contains('lb-shell') || e.target.classList.contains('lb-stage')) {
      closeLightbox();
    }
  });

  document.addEventListener('keydown', (e) => {
    if (overlay.style.display !== 'flex') return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowLeft') prevBtn.click();
    if (e.key === 'ArrowRight') nextBtn.click();
  });
});
