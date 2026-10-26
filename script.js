(() => {
  const currentYear = document.getElementById('currentYear');
  if (currentYear) currentYear.textContent = String(new Date().getFullYear());

  const themeToggle = document.getElementById('themeToggle');
  if (themeToggle) {
    themeToggle.addEventListener('click', () => {
      const isDark = document.body.dataset.theme === 'dark';
      document.body.dataset.theme = isDark ? 'light' : 'dark';
      themeToggle.setAttribute('aria-pressed', String(!isDark));
      themeToggle.setAttribute(
        'aria-label',
        `Switch to ${isDark ? 'dark' : 'light'} theme`
      );
    });
  }

  const heroTitle = document.getElementById('typewriter-text');
  if (heroTitle) {
    const titleText = "Hi, I'm Anwar.";
    heroTitle.setAttribute('aria-label', titleText);

    function typeHeroTitle() {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        heroTitle.textContent = titleText;
        return;
      }

      heroTitle.textContent = '';
      heroTitle.classList.add('is-typing');
      let characterIndex = 0;

      function typeNextCharacter() {
        heroTitle.textContent = titleText.slice(0, characterIndex + 1);
        characterIndex += 1;
        if (characterIndex < titleText.length) {
          window.setTimeout(typeNextCharacter, 75);
        } else {
          heroTitle.classList.remove('is-typing');
        }
      }

      window.setTimeout(typeNextCharacter, 250);
    }

    if ('IntersectionObserver' in window) {
      const heroObserver = new IntersectionObserver((entries) => {
        if (entries.some((entry) => entry.isIntersecting)) typeHeroTitle();
      }, { threshold: 0.4 });
      heroObserver.observe(heroTitle);
    } else {
      typeHeroTitle();
    }
  }

  if ('IntersectionObserver' in window) {
    const revealTargets = document.querySelectorAll(
      '#about > *, #videos > *, #contact > *, #client-inquiry > *, #short-form-videos > *:not(#shortSlider), .benefit-list > *, footer'
    );
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('is-revealed');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.14, rootMargin: '0px 0px -40px 0px' });

    revealTargets.forEach((element, index) => {
      element.classList.add('scroll-reveal');
      element.style.setProperty('--reveal-delay', `${(index % 4) * 90}ms`);
      revealObserver.observe(element);
    });
  }

  const inquiryForm = document.getElementById('projectInquiryForm');
  if (inquiryForm) {
    inquiryForm.addEventListener('submit', (event) => {
      event.preventDefault();
      const formData = new FormData(inquiryForm);
      const message = [
        'Hi Anwar, I would like to discuss a finance video edit.',
        '',
        `Name: ${formData.get('clientName')}`,
        `Format: ${formData.get('editingType')}`,
        `Project details: ${formData.get('projectDetails')}`
      ].join('\n');

      window.location.href = `https://wa.me/919334273309?text=${encodeURIComponent(message)}`;
    });
  }

  const videoGrid = document.getElementById('shortVideoGrid');
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const sliderContainer = document.getElementById('shortSlider');

  if (!videoGrid || !prevBtn || !nextBtn || !sliderContainer) return;

  const videoSources = [
    {
      src: 'Short video/short 1.mp4',
      poster: 'Short video/cover 1.jpg',
      title: '₹1 Lakh Per Month'
    },
    {
      src: 'Short video/short 2.mp4',
      poster: 'Short video/cover 2.jpg',
      title: 'Finance & Lifestyle'
    },
    {
      src: 'Short video/short 3.mp4',
      poster: 'Short video/cover 3.jpg',
      title: 'Finance Short 03'
    },
    {
      src: 'Short video/short 4.mp4',
      poster: 'Short video/cover 4.jpg',
      title: 'Why Does the Fortuner Cost ₹42 Lakh?'
    },
    {
      src: 'Short video/short 5.mp4',
      poster: 'Short video/cover 5.jpg',
      title: 'Why It Is Important'
    },
    {
      src: 'Short video/short 6.mp4',
      poster: 'Short video/cover 6.jpg',
      title: 'Share This'
    }
  ];
  let currentIndex = 0;
  let animationFrame = 0;
  let currentCardWidth = 0;
  const motionStates = new Map();
  const springMass = 0.9;
  const springStiffness = 210;
  const springDamping = 26;

  function createVideoElement(source, containerClass) {
    const container = document.createElement('div');
    container.className = `slider-video-container ${containerClass}`;
    container.dataset.index = String(videoSources.indexOf(source));
    container.tabIndex = 0;
    container.setAttribute('role', 'button');
    container.setAttribute('aria-label', `Show ${source.title}`);

    const video = document.createElement('video');
    video.poster = source.poster;
    video.src = source.src;
    video.loading = 'lazy';
    video.title = source.title;
    video.muted = true;
    video.preload = 'none';
    video.controls = videoSources.indexOf(source) === currentIndex;
    container.appendChild(video);

    const title = document.createElement('p');
    title.className = 'short-video-title';
    title.textContent = source.title;
    container.appendChild(title);

    container.addEventListener('click', () => setActive(videoSources.indexOf(source)));
    container.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setActive(videoSources.indexOf(source));
      }
    });

    return container;
  }

  function getCardOffset(index) {
    let offset = index - currentIndex;
    if (offset > videoSources.length / 2) offset -= videoSources.length;
    if (offset < -videoSources.length / 2) offset += videoSources.length;
    return offset;
  }

  function getCardPosition(offset) {
    const distance = Math.abs(offset);
    const direction = Math.sign(offset);
    const x = distance === 0
      ? 0
      : direction * (currentCardWidth * 0.6 + (distance - 1) * currentCardWidth * 0.34);

    return {
      x,
      rotateY: distance === 0 ? 0 : -direction * 43,
      z: distance === 0 ? 40 : -distance * 80,
      scale: distance === 0 ? 1 : Math.max(0.62, 0.84 - (distance - 1) * 0.07),
      opacity: distance === 0 ? 1 : Math.max(0.22, 1 - distance * 0.22),
      visible: distance <= 3,
      zIndex: 100 - distance
    };
  }

  function applyCardPosition(card, position) {
    card.style.transform = `translate3d(${position.x}px, 0, ${position.z}px) rotateY(${position.rotateY}deg) scale(${position.scale})`;
    card.style.opacity = String(position.opacity);
    card.style.zIndex = String(position.zIndex);
    card.style.visibility = position.visible ? 'visible' : 'hidden';
    card.style.pointerEvents = position.visible ? 'auto' : 'none';
    card.setAttribute('aria-hidden', String(!position.visible));
    card.setAttribute('aria-current', position.opacity === 1 ? 'true' : 'false');
    card.classList.toggle('center', position.opacity === 1);
    card.classList.toggle('side', position.opacity !== 1);
    card.querySelector('video').controls = position.opacity === 1;
  }

  function springProgress(elapsed) {
    const angularFrequency = Math.sqrt(springStiffness / springMass);
    const dampingRatio = springDamping / (2 * Math.sqrt(springStiffness * springMass));
    const dampedFrequency = angularFrequency * Math.sqrt(1 - dampingRatio ** 2);
    const sineCoefficient = dampingRatio / Math.sqrt(1 - dampingRatio ** 2);
    const decay = Math.exp(-dampingRatio * angularFrequency * elapsed);

    return 1 - decay * (
      Math.cos(dampedFrequency * elapsed)
      + sineCoefficient * Math.sin(dampedFrequency * elapsed)
    );
  }

  function updateCarousel(animate = true) {
    if (animationFrame) window.cancelAnimationFrame(animationFrame);

    const cards = Array.from(videoGrid.querySelectorAll('.slider-video-container'));
    const targets = cards.map((card) => ({
      card,
      from: motionStates.get(card) || getCardPosition(getCardOffset(Number(card.dataset.index))),
      to: getCardPosition(getCardOffset(Number(card.dataset.index)))
    }));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!animate || reduceMotion) {
      targets.forEach(({ card, to }) => {
        motionStates.set(card, to);
        applyCardPosition(card, to);
      });
      return;
    }

    const startedAt = performance.now();
    function frame(now) {
      const elapsed = (now - startedAt) / 1000;
      const progress = Math.min(1, springProgress(elapsed));

      targets.forEach(({ card, from, to }) => {
        const position = {
          x: from.x + (to.x - from.x) * progress,
          rotateY: from.rotateY + (to.rotateY - from.rotateY) * progress,
          z: from.z + (to.z - from.z) * progress,
          scale: from.scale + (to.scale - from.scale) * progress,
          opacity: from.opacity + (to.opacity - from.opacity) * progress,
          visible: to.visible,
          zIndex: to.zIndex
        };
        motionStates.set(card, position);
        applyCardPosition(card, position);
      });

      if (elapsed < 0.72) {
        animationFrame = window.requestAnimationFrame(frame);
      } else {
        targets.forEach(({ card, to }) => {
          motionStates.set(card, to);
          applyCardPosition(card, to);
        });
        animationFrame = 0;
      }
    }

    animationFrame = window.requestAnimationFrame(frame);
  }

  function setActive(index) {
    currentIndex = (index + videoSources.length) % videoSources.length;
    updateCarousel();
  }

  function goNext() {
    setActive(currentIndex + 1);
  }

  function goPrevious() {
    setActive(currentIndex - 1);
  }

  nextBtn.addEventListener('click', goNext);
  prevBtn.addEventListener('click', goPrevious);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowRight') goNext();
    if (event.key === 'ArrowLeft') goPrevious();
  });

  let touchStartX = 0;
  sliderContainer.addEventListener('touchstart', (event) => {
    touchStartX = event.changedTouches[0].screenX;
  }, { passive: true });
  sliderContainer.addEventListener('touchend', (event) => {
    const difference = touchStartX - event.changedTouches[0].screenX;
    if (Math.abs(difference) > 50) {
      difference > 0 ? goNext() : goPrevious();
    }
  }, { passive: true });

  videoSources.forEach((source, index) => {
    const distance = getCardOffset(index);
    const card = createVideoElement(
      source,
      distance === 0 ? 'center' : 'side'
    );
    const initialPosition = getCardPosition(distance);
    card.style.width = 'var(--carousel-card-width, 172px)';
    card.style.left = '50%';
    card.style.top = '20px';
    videoGrid.appendChild(card);
    motionStates.set(card, initialPosition);
    applyCardPosition(card, initialPosition);
  });

  function resizeCarousel() {
    currentCardWidth = Math.round(Math.min(268, Math.max(172, videoGrid.clientWidth * 0.4)));
    videoGrid.style.setProperty('--carousel-card-width', `${currentCardWidth}px`);
    videoGrid.style.height = `${Math.round(currentCardWidth * (16 / 9) + 92)}px`;
    videoGrid.querySelectorAll('.slider-video-container').forEach((card) => {
      card.style.marginLeft = `${-currentCardWidth / 2}px`;
    });
    updateCarousel(false);
  }

  if ('ResizeObserver' in window) {
    const resizeObserver = new ResizeObserver(resizeCarousel);
    resizeObserver.observe(videoGrid);
  } else {
    window.addEventListener('resize', resizeCarousel);
  }
  resizeCarousel();
})();
