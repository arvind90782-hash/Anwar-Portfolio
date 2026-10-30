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

  const videoCards = Array.from(
    videoGrid.querySelectorAll('.slider-video-container')
  );
  const videoElements = videoCards.map((card, index) => {
    const video = card.querySelector('video');
    if (!video) throw new Error(`Portfolio video ${index + 1} is missing its media.`);
    return video;
  });
  const loadVideoPosters = (indices = videoElements.map((_, index) => index)) => {
    new Set(indices).forEach((index) => {
      const video = videoElements[index];
      if (!video.dataset.poster) {
        throw new Error(`Portfolio video ${index + 1} is missing its poster.`);
      }
      video.poster = video.dataset.poster;
    });
  };
  const videoSources = videoCards.map((card) => {
    const title = card.querySelector('.short-video-title');
    if (!title) throw new Error('Each portfolio video needs a title.');
    return { title: title.textContent.trim() };
  });
  let currentIndex = 0;
  let animationFrame = 0;
  let currentCardWidth = 0;
  const motionStates = new Map();
  const springMass = 0.9;
  const springStiffness = 210;
  const springDamping = 26;

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

  function applyCardState(card, video, position) {
    card.style.zIndex = String(position.zIndex);
    card.style.visibility = position.visible ? 'visible' : 'hidden';
    card.style.pointerEvents = position.visible ? 'auto' : 'none';
    card.setAttribute('aria-hidden', String(!position.visible));
    card.setAttribute('aria-current', position.opacity === 1 ? 'true' : 'false');
    card.classList.toggle('center', position.opacity === 1);
    card.classList.toggle('side', position.opacity !== 1);
    video.controls = position.opacity === 1;
  }

  function applyCardPosition(card, video, position) {
    card.style.transform = `translate3d(${position.x}px, 0, ${position.z}px) rotateY(${position.rotateY}deg) scale(${position.scale})`;
    video.style.opacity = String(position.opacity);
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

    const targets = videoCards.map((card, index) => ({
      card,
      video: videoElements[index],
      from: motionStates.get(card) || getCardPosition(getCardOffset(Number(card.dataset.index))),
      to: getCardPosition(getCardOffset(Number(card.dataset.index)))
    }));
    targets.forEach(({ card, video, to }) => applyCardState(card, video, to));
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (!animate || reduceMotion) {
      targets.forEach(({ card, video, to }) => {
        motionStates.set(card, to);
        applyCardPosition(card, video, to);
      });
      return;
    }

    const startedAt = performance.now();
    function frame(now) {
      const elapsed = (now - startedAt) / 1000;
      const progress = Math.min(1, springProgress(elapsed));

      targets.forEach(({ card, video, from, to }) => {
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
        applyCardPosition(card, video, position);
      });

      if (elapsed < 0.72) {
        animationFrame = window.requestAnimationFrame(frame);
      } else {
        targets.forEach(({ card, video, to }) => {
          motionStates.set(card, to);
          applyCardPosition(card, video, to);
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

  videoCards.forEach((card, index) => {
    const source = videoSources[index];
    const video = videoElements[index];

    card.dataset.index = String(index);
    card.tabIndex = 0;
    card.setAttribute('role', 'button');
    card.setAttribute('aria-label', `Show ${source.title}`);
    video.muted = true;
    video.preload = 'none';
    card.addEventListener('click', () => setActive(index));
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        setActive(index);
      }
    });

    const distance = getCardOffset(index);
    const initialPosition = getCardPosition(distance);
    card.style.width = 'var(--carousel-card-width, 172px)';
    card.style.left = '50%';
    card.style.top = '20px';
    motionStates.set(card, initialPosition);
    applyCardState(card, video, initialPosition);
    applyCardPosition(card, video, initialPosition);
  });
  videoGrid.dataset.carouselReady = 'true';

  if ('IntersectionObserver' in window) {
    const posterObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const index = Number(entry.target.dataset.index);
        loadVideoPosters([index]);
        observer.unobserve(entry.target);
      });
    }, { rootMargin: '300px 0px' });
    videoCards.forEach((card) => posterObserver.observe(card));
  } else {
    loadVideoPosters();
  }

  function resizeCarousel() {
    currentCardWidth = Math.round(Math.min(268, Math.max(172, videoGrid.clientWidth * 0.4)));
    videoGrid.style.setProperty('--carousel-card-width', `${currentCardWidth}px`);
    videoGrid.style.height = `${Math.round(currentCardWidth * (16 / 9) + 92)}px`;
    videoCards.forEach((card) => {
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
