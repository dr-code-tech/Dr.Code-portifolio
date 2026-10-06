
(function () {
  document.documentElement.classList.add('js');

  const revealElements = document.querySelectorAll('.reveal');

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

  const revealElementsInView = () => {
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    revealElements.forEach((el) => {
      const bounds = el.getBoundingClientRect();
      if (bounds.top < viewportHeight && bounds.bottom > 0) {
        el.classList.add('visible');
        revealObserver.unobserve(el);
      }
    });
  };

  window.addEventListener('scroll', revealElementsInView, { passive: true });
  revealElementsInView();

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
    });
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
      const isPressed = appearanceToggle.getAttribute('aria-pressed') === 'true';
      appearanceToggle.setAttribute('aria-pressed', String(!isPressed));
      document.body.classList.toggle('theme-light', !isPressed);
      const icon = appearanceToggle.querySelector('i');
      if (icon) {
        icon.classList.toggle('bx-moon', isPressed);
        icon.classList.toggle('bx-sun', !isPressed);
      }
    });
  }

  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    const nameField = contactForm.querySelector('[name="name"]');
    const emailField = contactForm.querySelector('[name="email"]');
    const messageField = contactForm.querySelector('[name="message"]');
    const status = contactForm.querySelector('.form-status');
    const submitButton = contactForm.querySelector('[type="submit"]');

    const fields = [nameField, emailField, messageField].filter(Boolean);
    fields.forEach((field) => {
      field.addEventListener('input', () => {
        field.setCustomValidity('');
        if (status) status.textContent = '';
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
        status.textContent = 'Please review the highlighted fields and try again.';
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
        status.textContent = 'Opening your email app with a draft. Send it from there to deliver your message.';
        window.location.href = `mailto:denritacharles@gmail.com?subject=${subject}&body=${body}`;
        return;
      }

      submitButton.disabled = true;
      status.textContent = 'Sending your message…';
      try {
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        if (!response.ok) {
          status.textContent = 'Your message could not be sent. Please try again or email me directly.';
          return;
        }

        status.textContent = 'Your message was sent successfully.';
        contactForm.reset();
      } catch (error) {
        status.textContent = 'Unable to reach the contact service. Please try again or email me directly.';
        console.error('Contact form submission failed:', error);
      } finally {
        submitButton.disabled = false;
      }
    });
  }

  const copyrightYear = document.querySelector('#copyright-year');
  if (copyrightYear) {
    copyrightYear.textContent = String(new Date().getFullYear());
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });
  updateActiveLink();
})();
