/**
 * SATURNUS LEGAL
 * Production JavaScript
 * Accessible interactions, sticky navigation, modal handling & form validation
 */

// --- Security: Anti-Clickjacking Frame Buster Defense ---
if (window.self !== window.top) {
  try {
    if (window.top.location.hostname !== window.self.location.hostname) {
      window.top.location = window.self.location;
    }
  } catch (e) {
    // Cross-origin iframe nesting attempt detected
    document.documentElement.style.display = 'none';
    window.top.location = window.self.location;
  }
}

// --- Security: Self-XSS Warning in Developer Console ---
try {
  console.log(
    '%cSTOP!\n%cThis browser console is intended exclusively for authorized developers. If someone told you to copy and paste code here, it is an attack known as Self-XSS and can compromise your data or device.',
    'color: #dc2626; font-size: 26px; font-weight: 800; font-family: sans-serif;',
    'color: #4b5563; font-size: 14px; font-weight: 500; font-family: sans-serif; line-height: 1.5;'
  );
} catch (e) {
  // Ignore console errors in restricted environments
}

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // --- Elements ---
  const header = document.getElementById('site-header');
  const mobileToggle = document.getElementById('mobile-nav-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileBackdrop = document.getElementById('mobile-backdrop');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');
  const navLinks = document.querySelectorAll('.nav-link');

  // Modal elements
  const modal = document.getElementById('consultation-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const openModalBtns = [
    document.getElementById('open-consultation-btn'),
    document.getElementById('mobile-consultation-btn'),
    document.getElementById('cta-strip-consult-btn'),
    document.getElementById('aor-brief-btn')
  ].filter(Boolean);

  // Forms
  const contactForm = document.getElementById('consultation-form');
  const contactFormStatus = document.getElementById('contact-form-status');
  const modalForm = document.getElementById('modal-consultation-form');
  const modalFormStatus = document.getElementById('modal-form-status');

  // -------------------------------------------------------------------------
  // 0. Mandatory Entry Disclaimer Gateway (BCI Rule 36 Compliance)
  // -------------------------------------------------------------------------
  const disclaimerGateway = document.getElementById('entry-disclaimer-gateway');
  const disclaimerAgreeBtn = document.getElementById('disclaimer-agree-btn');
  const disclaimerDeclineBtn = document.getElementById('disclaimer-decline-btn');
  const DISCLAIMER_STORAGE_KEY = 'saturnus_bci_disclaimer_accepted';

  const checkDisclaimerStatus = () => {
    if (!disclaimerGateway) return;

    let hasAccepted = false;
    try {
      hasAccepted = sessionStorage.getItem(DISCLAIMER_STORAGE_KEY) === 'true';
    } catch (e) {
      hasAccepted = false;
    }

    if (hasAccepted) {
      disclaimerGateway.classList.add('accepted');
      disclaimerGateway.style.display = 'none';
      document.body.classList.remove('disclaimer-locked');
      document.body.style.overflow = '';
    } else {
      disclaimerGateway.classList.remove('accepted');
      disclaimerGateway.style.display = 'flex';
      document.body.classList.add('disclaimer-locked');
      setTimeout(() => {
        if (disclaimerAgreeBtn) disclaimerAgreeBtn.focus();
      }, 120);
    }
  };

  if (disclaimerAgreeBtn) {
    disclaimerAgreeBtn.addEventListener('click', () => {
      try {
        sessionStorage.setItem(DISCLAIMER_STORAGE_KEY, 'true');
        localStorage.setItem(DISCLAIMER_STORAGE_KEY, 'true');
      } catch (e) {
        // Storage restricted
      }
      if (disclaimerGateway) {
        disclaimerGateway.classList.add('accepted');
        disclaimerGateway.style.display = 'none';
      }
      document.body.classList.remove('disclaimer-locked');
      document.body.style.overflow = '';
    });
  }

  if (disclaimerDeclineBtn) {
    disclaimerDeclineBtn.addEventListener('click', () => {
      let declineAlert = disclaimerGateway.querySelector('.disclaimer-decline-message');
      if (!declineAlert) {
        declineAlert = document.createElement('div');
        declineAlert.className = 'disclaimer-decline-message visible';
        declineAlert.innerHTML = '<strong>Access Declined:</strong> Under Bar Council of India rules, you cannot enter without accepting the regulatory terms. Redirecting...';
        const actionsWrap = disclaimerGateway.querySelector('.entry-disclaimer-actions');
        if (actionsWrap) actionsWrap.after(declineAlert);
      } else {
        declineAlert.classList.add('visible');
      }

      setTimeout(() => {
        window.location.href = 'https://www.google.com';
      }, 1200);
    });
  }

  // Footer / internal links to #disclaimer can re-display terms
  const footerDisclaimerLinks = document.querySelectorAll('a[href="#disclaimer"]');
  footerDisclaimerLinks.forEach(link => {
    link.addEventListener('click', () => {
      if (disclaimerGateway) {
        disclaimerGateway.classList.remove('accepted');
        document.body.classList.add('disclaimer-locked');
        setTimeout(() => {
          if (disclaimerAgreeBtn) disclaimerAgreeBtn.focus();
        }, 120);
      }
    });
  });

  // Initialize disclaimer immediately
  checkDisclaimerStatus();

  // -------------------------------------------------------------------------
  // 1. High-Performance Sticky Navigation & Active Section Highlighting
  // -------------------------------------------------------------------------
  const sections = Array.from(document.querySelectorAll('section[id]'));
  let isTicking = false;

  const updateScrollState = () => {
    const currentScrollY = window.scrollY;

    if (currentScrollY > 40) {
      if (!header.classList.contains('scrolled')) header.classList.add('scrolled');
    } else {
      if (header.classList.contains('scrolled')) header.classList.remove('scrolled');
    }

    // Highlight current active section in nav
    let currentSectionId = '';
    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      const sectionTop = section.offsetTop - 120;
      const sectionHeight = section.offsetHeight;
      if (currentScrollY >= sectionTop && currentScrollY < sectionTop + sectionHeight) {
        currentSectionId = section.getAttribute('id');
        break;
      }
    }

    if (currentSectionId) {
      navLinks.forEach(link => {
        const matches = link.getAttribute('href') === `#${currentSectionId}`;
        if (matches && !link.classList.contains('active')) {
          link.classList.add('active');
        } else if (!matches && link.classList.contains('active')) {
          link.classList.remove('active');
        }
      });
    }

    // Floating Chambers Concierge Dial visibility
    const floatingDial = document.getElementById('floating-chambers-dial');
    if (floatingDial) {
      if (currentScrollY > 380) {
        floatingDial.classList.add('visible');
      } else {
        floatingDial.classList.remove('visible');
      }
    }

    // Back to Top Luxury Button visibility
    const backToTopBtn = document.getElementById('back-to-top-btn');
    if (backToTopBtn) {
      if (currentScrollY > 500) {
        backToTopBtn.classList.add('visible');
      } else {
        backToTopBtn.classList.remove('visible');
      }
    }

    isTicking = false;
  };

  const handleScroll = () => {
    if (!isTicking) {
      window.requestAnimationFrame(updateScrollState);
      isTicking = true;
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  updateScrollState(); // Initial check

  // Back to Top button click event
  const backToTopBtn = document.getElementById('back-to-top-btn');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // -------------------------------------------------------------------------
  // 2. Mobile Drawer Navigation
  // -------------------------------------------------------------------------
  const openMobileMenu = () => {
    mobileDrawer.classList.add('open');
    mobileBackdrop.classList.add('open');
    mobileToggle.classList.add('open');
    mobileToggle.setAttribute('aria-expanded', 'true');
    mobileDrawer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  };

  const closeMobileMenu = () => {
    mobileDrawer.classList.remove('open');
    mobileBackdrop.classList.remove('open');
    mobileToggle.classList.remove('open');
    mobileToggle.setAttribute('aria-expanded', 'false');
    mobileDrawer.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  if (mobileToggle) {
    mobileToggle.addEventListener('click', () => {
      const isOpen = mobileDrawer.classList.contains('open');
      if (isOpen) {
        closeMobileMenu();
      } else {
        openMobileMenu();
      }
    });
  }

  if (mobileBackdrop) {
    mobileBackdrop.addEventListener('click', closeMobileMenu);
  }

  const mobileDrawerCloseBtn = document.getElementById('mobile-drawer-close-btn');
  if (mobileDrawerCloseBtn) {
    mobileDrawerCloseBtn.addEventListener('click', closeMobileMenu);
  }

  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      closeMobileMenu();
    });
  });

  // -------------------------------------------------------------------------
  // 3. Consultation Modal Dialog
  // -------------------------------------------------------------------------
  const openModal = () => {
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    closeMobileMenu();

    // Focus on first input in modal
    const firstInput = modal.querySelector('input, select, textarea');
    if (firstInput) {
      setTimeout(() => firstInput.focus(), 100);
    }
  };

  const closeModal = () => {
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  };

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  const aorBriefBtn = document.getElementById('aor-brief-btn');
  if (aorBriefBtn) {
    aorBriefBtn.addEventListener('click', () => {
      const modalSubject = document.getElementById('modal-matterSubject');
      if (modalSubject) {
        modalSubject.value = 'AOR Filing & Outstation Counsel Briefing';
      }
      const modalCounsel = document.getElementById('modal-preferredCounsel');
      if (modalCounsel) {
        modalCounsel.value = 'gaurav';
      }
    });
  }

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', closeModal);
  }

  if (modal) {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        closeModal();
      }
    });
  }

  // Keyboard accessibility: Escape key closes modal & mobile drawer
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (modal && modal.classList.contains('open')) {
        closeModal();
      }
      if (mobileDrawer && mobileDrawer.classList.contains('open')) {
        closeMobileMenu();
      }
    }
  });

  // -------------------------------------------------------------------------
  // 4. Form Security, Anti-Spam, Rate Limiting & Validation
  // -------------------------------------------------------------------------
  const PAGE_LOAD_TIME = Date.now();
  const MIN_SUBMISSION_TIME_MS = 1800; // Minimum 1.8 seconds dwell time to prevent automated script spam
  const MAX_SUBMISSIONS_PER_WINDOW = 3;
  const RATE_LIMIT_WINDOW_MS = 5 * 60 * 1000; // 5 minutes window

  // Session rate limiter to prevent flooding/DoS against chambers enquiry inbox
  const checkRateLimit = () => {
    try {
      const raw = sessionStorage.getItem('__saturnus_sub_history');
      const now = Date.now();
      let history = raw ? JSON.parse(raw) : [];
      history = history.filter(ts => (now - ts) < RATE_LIMIT_WINDOW_MS);
      return history.length < MAX_SUBMISSIONS_PER_WINDOW;
    } catch (err) {
      return true; // Graceful fallback
    }
  };

  const recordSubmission = () => {
    try {
      const raw = sessionStorage.getItem('__saturnus_sub_history');
      const now = Date.now();
      let history = raw ? JSON.parse(raw) : [];
      history = history.filter(ts => (now - ts) < RATE_LIMIT_WINDOW_MS);
      history.push(now);
      sessionStorage.setItem('__saturnus_sub_history', JSON.stringify(history));
    } catch (err) {
      // Graceful fallback
    }
  };

  // Strip dangerous HTML tags, executable URIs and invisible control characters
  const sanitizeInput = (val) => {
    if (typeof val !== 'string') return '';
    return val
      .replace(/<[^>]*>?/gm, '') // Strip HTML tags
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, '') // Strip ASCII control characters
      .replace(/(javascript:|data:|vbscript:)/gi, '') // Strip executable URI schemes
      .trim();
  };

  const validateEmail = (email) => {
    // Rejects CRLF characters to prevent HTTP/email header injection
    if (/[\r\n]/.test(email)) return false;
    return /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)+$/.test(email);
  };

  const validatePhone = (phone) => {
    // Allows optional +, spaces, dashes, parentheses and 8-15 digits
    const digitsOnly = phone.replace(/\D/g, '');
    const isValidFormat = /^[\d\s+\-()]{8,25}$/.test(phone);
    return isValidFormat && digitsOnly.length >= 8 && digitsOnly.length <= 15;
  };

  const validateName = (name) => {
    // Disallow script/injection symbols in full name
    if (/[<>{}\[\]=;]/.test(name)) return false;
    return name.length >= 2 && name.length <= 100;
  };

  const ALLOWED_CATEGORIES = [
    'AOR Filing & Outstation Counsel Briefing',
    'Litigation & Appellate Practice',
    'Arbitration & Dispute Resolution',
    'Banking, Finance & Insurance',
    'Intellectual Property (IP)',
    'Employment & Industrial Law',
    'Real Estate & Infrastructure',
    'Insolvency Laws (IBC)',
    'Regulatory & Government Compliance',
    'Other Legal Matter',
    'Supreme Court SLP / Appeal',
    'Constitutional / Writ Petition',
    'Corporate / NCLAT / Commercial',
    'Civil Dispute',
    'Criminal Matter',
    'Service / Tribunal Matter'
  ];

  const setupForm = (formEl, statusEl, isModal = false) => {
    if (!formEl || !statusEl) return;

    const submitBtn = formEl.querySelector('button[type="submit"]');

    formEl.addEventListener('submit', (e) => {
      e.preventDefault();

      // 1. Anti-Bot Honeypot Trap
      const honeypot = formEl.querySelector('input[name="_firm_hp_validation"], input[name="_modal_hp_validation"]');
      if (honeypot && honeypot.value.trim() !== '') {
        // Silently drop bot submission with simulated success
        showStatus(
          statusEl,
          'Thank you. Your consultation enquiry has been recorded with strict discretion.',
          'success'
        );
        formEl.reset();
        return;
      }

      // 2. Automated Script / Dwell Time Check (< 1.8 seconds indicates bot auto-fill)
      const elapsed = Date.now() - PAGE_LOAD_TIME;
      if (elapsed < MIN_SUBMISSION_TIME_MS) {
        showStatus(statusEl, 'Please take a moment to review your matter details before submitting.', 'error');
        return;
      }

      // 3. Client Rate Limiting (Flood Prevention)
      if (!checkRateLimit()) {
        showStatus(
          statusEl,
          'Multiple enquiries received from this session. For urgent matters, please contact chambers directly via phone.',
          'error'
        );
        return;
      }

      const nameInput = formEl.querySelector('[name="fullName"]');
      const phoneInput = formEl.querySelector('[name="phoneNumber"]');
      const subjectInput = formEl.querySelector('[name="matterSubject"]');
      const counselInput = formEl.querySelector('[name="preferredCounsel"]');
      const messageInput = formEl.querySelector('[name="matterMessage"]');

      const nameVal = sanitizeInput(nameInput ? nameInput.value : '');
      const phoneVal = sanitizeInput(phoneInput ? phoneInput.value : '');
      const subjectVal = sanitizeInput(subjectInput ? subjectInput.value : '');
      const counselVal = counselInput ? counselInput.value : 'gaurav';
      const messageVal = sanitizeInput(messageInput ? messageInput.value : '');

      // Validation
      if (!nameVal || !validateName(nameVal)) {
        showStatus(statusEl, 'Please enter your full name (2–100 characters).', 'error');
        if (nameInput) nameInput.focus();
        return;
      }

      if (!phoneVal || !validatePhone(phoneVal)) {
        showStatus(statusEl, 'Please provide a valid contact phone number (8–15 digits).', 'error');
        if (phoneInput) phoneInput.focus();
        return;
      }

      if (!subjectVal || !ALLOWED_CATEGORIES.includes(subjectVal)) {
        showStatus(statusEl, 'Please select the matter category from the list.', 'error');
        if (subjectInput) subjectInput.focus();
        return;
      }

      if (!messageVal || messageVal.length < 10 || messageVal.length > 3000) {
        showStatus(statusEl, 'Please provide a brief summary of the matter (10 to 3,000 characters).', 'error');
        if (messageInput) messageInput.focus();
        return;
      }

      // Prevent duplicate double-clicks
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.setAttribute('aria-busy', 'true');
      }

      // Record this submission for session rate limiting
      recordSubmission();

      // Destination counsel and WhatsApp number
      const targetPhone = counselVal === 'surjeet' ? '919557641555' : '918750569505';
      const targetCounselName = counselVal === 'surjeet' ? 'Advocate Surjeet Singh' : 'Advocate Gaurav Singh';

      // Cleanly format WhatsApp enquiry message with standard markdown formatting
      const waTextLines = [
        '⚖️ *NEW LEGAL CONSULTATION ENQUIRY*',
        '*Saturnus Legal*',
        '━━━━━━━━━━━━━━━━━━━━━',
        `👤 *Client Name:* ${nameVal}`,
        `📞 *Contact Phone:* ${phoneVal}`,
        `📂 *Matter Category:* ${subjectVal}`,
        `🎯 *Attention:* ${targetCounselName}`,
        '━━━━━━━━━━━━━━━━━━━━━',
        '*Brief Summary of Matter:*',
        messageVal,
        '━━━━━━━━━━━━━━━━━━━━━',
        '_Transmitted via Chambers Consultation Portal_'
      ];

      const waUrl = `https://wa.me/${targetPhone}?text=${encodeURIComponent(waTextLines.join('\n'))}`;

      // Display secure confirmation message with direct manual link fallback
      statusEl.className = 'form-status-alert success';
      statusEl.style.display = 'block';
      statusEl.innerHTML = '';

      const confirmMsg = document.createElement('p');
      confirmMsg.style.margin = '0 0 10px 0';
      confirmMsg.textContent = `Enquiry verified. Opening WhatsApp to connect with ${targetCounselName}...`;
      statusEl.appendChild(confirmMsg);

      const waBtnLink = document.createElement('a');
      waBtnLink.href = waUrl;
      waBtnLink.target = '_blank';
      waBtnLink.rel = 'noopener noreferrer';
      waBtnLink.className = 'btn btn-primary';
      waBtnLink.style.display = 'inline-flex';
      waBtnLink.style.alignItems = 'center';
      waBtnLink.style.gap = '8px';
      waBtnLink.style.fontSize = '0.84rem';
      waBtnLink.style.padding = '8px 16px';
      waBtnLink.innerHTML = `
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2M12.05 3.67C14.25 3.67 16.31 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.58 20.15 12.04 20.15C10.56 20.15 9.11 19.76 7.85 19L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 15 3.8 13.47 3.8 11.91C3.81 7.37 7.5 3.67 12.05 3.67M9.04 6.72C8.84 6.72 8.52 6.8 8.25 7.09C7.99 7.38 7.24 8.08 7.24 9.51C7.24 10.95 8.29 12.33 8.43 12.52C8.58 12.72 10.5 15.68 13.43 16.94C14.13 17.24 14.67 17.42 15.1 17.56C15.8 17.78 16.43 17.75 16.94 17.67C17.5 17.59 18.68 16.96 18.93 16.27C19.18 15.58 19.18 14.98 19.1 14.86C19.03 14.74 18.83 14.67 18.53 14.52C18.24 14.37 16.79 13.66 16.52 13.56C16.25 13.46 16.05 13.41 15.86 13.71C15.66 14 15.09 14.67 14.92 14.86C14.75 15.06 14.58 15.08 14.28 14.93C13.99 14.79 13.04 14.47 11.91 13.47C11.03 12.69 10.44 11.72 10.27 11.43C10.1 11.13 10.25 10.98 10.4 10.83C10.53 10.7 10.7 10.48 10.84 10.31C10.99 10.14 11.04 10.02 11.14 9.82C11.24 9.63 11.19 9.45 11.11 9.31C11.04 9.16 10.44 7.68 10.19 7.09C9.95 6.51 9.7 6.59 9.52 6.58C9.35 6.57 9.15 6.57 9.04 6.72Z"/></svg>
        <span>Open WhatsApp Now</span>
      `;
      statusEl.appendChild(waBtnLink);

      // Open WhatsApp automatically
      window.open(waUrl, '_blank');

      formEl.reset();

      setTimeout(() => {
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.removeAttribute('aria-busy');
        }
      }, 2500);

      if (isModal) {
        setTimeout(() => {
          closeModal();
          statusEl.style.display = 'none';
        }, 5000);
      }
    });
  };

  const showStatus = (el, text, type) => {
    el.textContent = text;
    el.className = `form-status-alert ${type}`;
    el.style.display = 'block';
    el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  setupForm(contactForm, contactFormStatus, false);
  setupForm(modalForm, modalFormStatus, true);

  // -------------------------------------------------------------------------
  // 5. Smooth Scroll with Header Offset for Anchors
  // -------------------------------------------------------------------------
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#' || !targetId) return;

      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // -------------------------------------------------------------------------
  // 6. Intersection Observer for Subtle Editorial Reveals
  // -------------------------------------------------------------------------
  if ('IntersectionObserver' in window) {
    const revealCallback = (entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          observer.unobserve(entry.target);
        }
      });
    };

    const revealObserver = new IntersectionObserver(revealCallback, {
      root: null,
      threshold: 0.1,
      rootMargin: '0px 0px -40px 0px'
    });

    const revealItems = document.querySelectorAll(
      '.stat-card, .counsel-card, .practice-card, .insight-card, .contact-details-box, .consultation-form-panel'
    );

    revealItems.forEach(item => {
      item.style.opacity = '0';
      item.style.transform = 'translateY(24px)';
      item.style.transition = 'opacity 600ms cubic-bezier(0.16, 1, 0.3, 1), transform 600ms cubic-bezier(0.16, 1, 0.3, 1)';
      revealObserver.observe(item);
    });
  }

  // -------------------------------------------------------------------------
  // 7. Interactive Practice Area Click-to-Consult (Auto-Select Category)
  // -------------------------------------------------------------------------
  document.querySelectorAll('.practice-card').forEach(card => {
    const handlePracticeSelect = () => {
      const practiceCategory = card.getAttribute('data-practice');
      if (!practiceCategory) return;

      const matterSelect = document.getElementById('matterSubject');
      const modalMatterSelect = document.getElementById('modal-matterSubject');

      if (matterSelect) {
        matterSelect.value = practiceCategory;
      }
      if (modalMatterSelect) {
        modalMatterSelect.value = practiceCategory;
      }

      // Smooth scroll to contact section
      const contactSection = document.getElementById('contact');
      if (contactSection) {
        const headerOffset = 80;
        const elementPosition = contactSection.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });

        // Highlight the select input
        if (matterSelect) {
          matterSelect.focus();
          matterSelect.style.borderColor = 'var(--color-gold-bright)';
          matterSelect.style.boxShadow = '0 0 16px rgba(197, 160, 89, 0.4)';
          setTimeout(() => {
            matterSelect.style.borderColor = '';
            matterSelect.style.boxShadow = '';
          }, 2500);
        }
      }
    };

    const ctaLink = card.querySelector('.practice-cta-link');
    if (ctaLink) {
      ctaLink.addEventListener('click', (e) => {
        e.stopPropagation();
        handlePracticeSelect();
      });
      ctaLink.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handlePracticeSelect();
        }
      });
    }

    card.addEventListener('click', handlePracticeSelect);
  });

  // -------------------------------------------------------------------------
  // 8. AOR Gateway Interactive Tab Switcher & Transmit Action
  // -------------------------------------------------------------------------
  const aorTabs = document.querySelectorAll('.aor-tab-btn');
  const aorPanels = document.querySelectorAll('.aor-tab-panel');

  if (aorTabs.length > 0 && aorPanels.length > 0) {
    aorTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const targetTab = tab.getAttribute('data-tab');
        if (!targetTab) return;

        // Toggle active states on tabs
        aorTabs.forEach(t => {
          t.classList.remove('active');
          t.setAttribute('aria-selected', 'false');
        });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');

        // Toggle panel visibility
        aorPanels.forEach(panel => {
          if (panel.id === `panel-${targetTab}`) {
            panel.style.display = 'block';
            panel.classList.add('active');
          } else {
            panel.style.display = 'none';
            panel.classList.remove('active');
          }
        });
      });
    });
  }

});
