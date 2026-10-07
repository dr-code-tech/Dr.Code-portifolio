
(function () {
  document.documentElement.classList.add('js');

  const STORAGE_KEY = 'dr-code-theme';

  const setTheme = (theme) => {
    const nextTheme = theme === 'light' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', nextTheme);
    document.documentElement.classList.toggle('dark', nextTheme === 'dark');
    document.documentElement.classList.toggle('light', nextTheme === 'light');
    document.body.classList.toggle('theme-light', nextTheme === 'light');

    const appearanceToggle = document.querySelector('.appearance-toggle');
    if (appearanceToggle) {
      const icon = appearanceToggle.querySelector('i');
      const isLight = nextTheme === 'light';
      appearanceToggle.setAttribute('aria-pressed', String(isLight));
      appearanceToggle.setAttribute('aria-label', isLight ? 'Switch to dark mode' : 'Switch to light mode');
      if (icon) {
        icon.classList.toggle('bx-moon', !isLight);
        icon.classList.toggle('bx-sun', isLight);
      }
    }
  };

  const preferredTheme = (() => {
    const savedTheme = localStorage.getItem(STORAGE_KEY);
    if (savedTheme === 'light' || savedTheme === 'dark') return savedTheme;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  })();

  setTheme(preferredTheme);
  localStorage.setItem(STORAGE_KEY, preferredTheme);

  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.05,
    });

    revealElements.forEach((el) => revealObserver.observe(el));
  } else {
    revealElements.forEach((el) => el.classList.add('visible'));
  }

  const techTabs = document.querySelectorAll('.tech-tab');
  const techPanels = document.querySelectorAll('.tech-panel-content');

  techTabs.forEach((tab) => {
    tab.tabIndex = tab.classList.contains('active') ? 0 : -1;
  });

  techTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.tab;

      techTabs.forEach((item) => {
        const isActive = item === tab;
        item.classList.toggle('active', isActive);
        item.setAttribute('aria-selected', String(isActive));
        item.tabIndex = isActive ? 0 : -1;
      });

      techPanels.forEach((panel) => {
        const isActive = panel.dataset.panel === target;
        panel.classList.toggle('active', isActive);
        if (isActive) {
          panel.removeAttribute('hidden');
        } else {
          panel.setAttribute('hidden', 'hidden');
        }
      });
    });

    tab.addEventListener('keydown', (event) => {
      const tabs = [...techTabs];
      const currentIndex = tabs.indexOf(tab);
      let nextIndex = currentIndex;

      if (event.key === 'ArrowRight') nextIndex = (currentIndex + 1) % tabs.length;
      else if (event.key === 'ArrowLeft') nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      else if (event.key === 'Home') nextIndex = 0;
      else if (event.key === 'End') nextIndex = tabs.length - 1;
      else return;

      event.preventDefault();
      tabs[nextIndex].focus();
      tabs[nextIndex].click();
    });
  });

  const navLinks = document.querySelectorAll('.main-nav a, .mobile-menu-inner a');
  const sections = [...document.querySelectorAll('main section')];
  const topbar = document.querySelector('.topbar');
  let scrollFrameRequested = false;

  const updateActiveLink = () => {
    let currentId = 'home';
    sections.forEach((section) => {
      const top = section.offsetTop - 120;
      const height = section.offsetHeight;
      if (window.scrollY >= top && window.scrollY < top + height) {
        currentId = section.id;
      }
    });

    navLinks.forEach((link) => {
      const href = link.getAttribute('href');
      const isActive = href && href.startsWith('#') && href.substring(1) === currentId;
      link.classList.toggle('active', isActive);
      if (isActive) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    topbar?.classList.toggle('is-scrolled', window.scrollY > 12);
    scrollFrameRequested = false;
  };

  const scheduleScrollUpdate = () => {
    if (scrollFrameRequested) return;
    scrollFrameRequested = true;
    window.requestAnimationFrame(updateActiveLink);
  };

  const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu-panel');

  const closeMobileMenu = () => {
    if (!mobileMenu || !mobileMenuToggle) return;
    mobileMenu.classList.remove('is-open');
    mobileMenuToggle.setAttribute('aria-expanded', 'false');
    mobileMenu.setAttribute('aria-hidden', 'true');
  };

  const openMobileMenu = () => {
    if (!mobileMenu || !mobileMenuToggle) return;
    mobileMenu.classList.add('is-open');
    mobileMenuToggle.setAttribute('aria-expanded', 'true');
    mobileMenu.setAttribute('aria-hidden', 'false');
  };

  if (mobileMenuToggle && mobileMenu) {
    mobileMenuToggle.addEventListener('click', () => {
      const isOpen = mobileMenu.classList.contains('is-open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });

    mobileMenu.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        closeMobileMenu();
        const target = link.hash ? document.querySelector(link.hash) : null;
        if (target) {
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
        } else {
          mobileMenuToggle.focus();
        }
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && mobileMenu.classList.contains('is-open')) {
        closeMobileMenu();
        mobileMenuToggle.focus();
      }
    });
  }

  const appearanceToggle = document.querySelector('.appearance-toggle');
  if (appearanceToggle) {
    appearanceToggle.addEventListener('click', () => {
      const nextTheme = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
      setTheme(nextTheme);
      localStorage.setItem(STORAGE_KEY, nextTheme);
    });
  }

  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    const nameField = contactForm.querySelector('[name="name"]');
    const emailField = contactForm.querySelector('[name="email"]');
    const messageField = contactForm.querySelector('[name="message"]');
    const status = contactForm.querySelector('.form-status');
    const submitButton = contactForm.querySelector('[type="submit"]');

    const setStatus = (message, state = '') => {
      if (!(status instanceof HTMLElement)) return;
      status.textContent = message;
      status.classList.toggle('has-message', Boolean(message));
      status.classList.toggle('is-error', state === 'error');
      status.classList.toggle('is-pending', state === 'pending');
      status.classList.toggle('is-success', state === 'success');
    };

    const fields = [nameField, emailField, messageField].filter(Boolean);
    fields.forEach((field) => {
      field.addEventListener('input', () => {
        field.setCustomValidity('');
        setStatus('');
      });
    });

    contactForm.addEventListener('submit', async (event) => {
      event.preventDefault();
      if (!(nameField instanceof HTMLInputElement) ||
          !(emailField instanceof HTMLInputElement) ||
          !(messageField instanceof HTMLTextAreaElement) ||
          !(status instanceof HTMLElement) ||
          !(submitButton instanceof HTMLButtonElement)) {
        throw new Error('The contact form is missing a required field or status element.');
      }

      nameField.setCustomValidity(nameField.value.trim().length < 2 ? 'Please enter your name (at least 2 characters).' : '');
      emailField.setCustomValidity(emailField.validity.valid ? '' : 'Please enter a valid email address.');
      messageField.setCustomValidity(messageField.value.trim().length < 10 ? 'Please enter a message with at least 10 characters.' : '');

      if (!contactForm.checkValidity()) {
        setStatus('Please review the highlighted fields and try again.', 'error');
        contactForm.reportValidity();
        return;
      }

      const formData = {
        name: nameField.value.trim(),
        email: emailField.value.trim(),
        message: messageField.value.trim(),
      };
      const endpoint = contactForm.dataset.contactEndpoint?.trim();

      if (!endpoint) {
        const subject = encodeURIComponent(`Portfolio enquiry from ${formData.name}`);
        const body = encodeURIComponent(`${formData.message}\n\nFrom: ${formData.name}\nEmail: ${formData.email}`);
        setStatus('Opening your email app with a draft. Send it from there to deliver your message.');
        window.location.href = `mailto:denritacharles@gmail.com?subject=${subject}&body=${body}`;
        return;
      }

      submitButton.disabled = true;
      submitButton.classList.add('is-loading');
      setStatus('Sending your message…', 'pending');
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!response.ok) {
          setStatus('Your message could not be sent. Please try again or email me directly.', 'error');
          return;
        }

        setStatus('Your message was sent successfully.', 'success');
        contactForm.reset();
      } catch (error) {
        setStatus('Unable to reach the contact service. Please try again or email me directly.', 'error');
        console.error('Contact form submission failed:', error);
      } finally {
        submitButton.disabled = false;
        submitButton.classList.remove('is-loading');
      }
    });
  }

  const whatsappButton = document.querySelector('.whatsapp-float');
  if (whatsappButton instanceof HTMLAnchorElement) {
    let pointerId = null;
    let pointerOffsetX = 0;
    let pointerOffsetY = 0;
    let startX = 0;
    let startY = 0;
    let isDragging = false;
    let suppressClick = false;

    const setPosition = (left, top) => {
      const bounds = whatsappButton.getBoundingClientRect();
      const margin = 8;
      const maxLeft = Math.max(margin, window.innerWidth - bounds.width - margin);
      const maxTop = Math.max(margin, window.innerHeight - bounds.height - margin);
      whatsappButton.style.left = `${Math.min(Math.max(left, margin), maxLeft)}px`;
      whatsappButton.style.top = `${Math.min(Math.max(top, margin), maxTop)}px`;
      whatsappButton.style.right = 'auto';
      whatsappButton.style.bottom = 'auto';
    };

    whatsappButton.addEventListener('pointerdown', (event) => {
      if (event.button !== 0) return;
      const bounds = whatsappButton.getBoundingClientRect();
      pointerId = event.pointerId;
      pointerOffsetX = event.clientX - bounds.left;
      pointerOffsetY = event.clientY - bounds.top;
      startX = event.clientX;
      startY = event.clientY;
      isDragging = false;
      whatsappButton.setPointerCapture(pointerId);
    });

    whatsappButton.addEventListener('pointermove', (event) => {
      if (event.pointerId !== pointerId) return;
      if (!isDragging && Math.hypot(event.clientX - startX, event.clientY - startY) > 6) {
        isDragging = true;
        whatsappButton.classList.add('is-dragging');
      }
      if (isDragging) {
        setPosition(event.clientX - pointerOffsetX, event.clientY - pointerOffsetY);
      }
    });

    const finishPointer = (event) => {
      if (event.pointerId !== pointerId) return;
      if (whatsappButton.hasPointerCapture(pointerId)) {
        whatsappButton.releasePointerCapture(pointerId);
      }
      suppressClick = isDragging;
      pointerId = null;
      isDragging = false;
      whatsappButton.classList.remove('is-dragging');
    };

    whatsappButton.addEventListener('pointerup', finishPointer);
    whatsappButton.addEventListener('pointercancel', finishPointer);
    whatsappButton.addEventListener('click', (event) => {
      if (suppressClick) {
        event.preventDefault();
        suppressClick = false;
      }
    });

    whatsappButton.addEventListener('keydown', (event) => {
      const movement = 16;
      const directions = {
        ArrowUp: [0, -movement],
        ArrowDown: [0, movement],
        ArrowLeft: [-movement, 0],
        ArrowRight: [movement, 0],
      };
      const direction = directions[event.key];
      if (!direction) return;
      event.preventDefault();
      const bounds = whatsappButton.getBoundingClientRect();
      setPosition(bounds.left + direction[0], bounds.top + direction[1]);
    });

    window.addEventListener('resize', () => {
      if (whatsappButton.style.left && whatsappButton.style.top) {
        const bounds = whatsappButton.getBoundingClientRect();
        setPosition(bounds.left, bounds.top);
      }
    });
  }

  const copyrightYear = document.querySelector('#copyright-year');
  if (copyrightYear) {
    copyrightYear.textContent = String(new Date().getFullYear());
  }

  window.addEventListener('scroll', scheduleScrollUpdate, { passive: true });
  updateActiveLink();
})();
