/* ==========================================================================
   Wiki Club SATI JavaScript Logic
   Includes: Theme engine, mobile menu, scroll-reveal, counters, modal form.
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

  // ==========================================================================
  // 1. Theme Toggle Engine
  // ==========================================================================
  const themeToggleBtn = document.getElementById('theme-toggle');
  const sunIcon = themeToggleBtn.querySelector('.sun-icon');
  const moonIcon = themeToggleBtn.querySelector('.moon-icon');
  const htmlElement = document.documentElement;

  const navbarLogo = document.getElementById('navbar-logo');
  const footerLogo = document.getElementById('footer-logo');

  // Retrieve theme preference from localStorage or check system preference
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

  // Initialize theme
  if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
    applyTheme('dark');
  } else {
    applyTheme('light');
  }

  themeToggleBtn.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    applyTheme(newTheme);
  });

  function applyTheme(theme) {
    htmlElement.setAttribute('data-theme', theme);
    localStorage.setItem('theme', theme);

    if (theme === 'dark') {
      sunIcon.style.display = 'none';
      moonIcon.style.display = 'block';
      if (navbarLogo) navbarLogo.src = 'logo-dark.svg';
      if (footerLogo) footerLogo.src = 'logo-dark.svg';
    } else {
      sunIcon.style.display = 'block';
      moonIcon.style.display = 'none';
      if (navbarLogo) navbarLogo.src = 'logo.svg';
      if (footerLogo) footerLogo.src = 'logo-dark.svg';
    }
  }

  // ==========================================================================
  // 2. Mobile Drawer Navigation & Scroll Effects
  // ==========================================================================
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const mobileDrawer = document.getElementById('mobile-drawer');
  const mobileLinks = document.querySelectorAll('.mobile-nav-link');

  mobileMenuToggle.addEventListener('click', () => {
    const isActive = mobileMenuToggle.classList.toggle('active');
    mobileDrawer.classList.toggle('active', isActive);
  });

  // Close mobile menu when a link is clicked
  mobileLinks.forEach(link => {
    link.addEventListener('click', () => {
      mobileMenuToggle.classList.remove('active');
      mobileDrawer.classList.remove('active');
    });
  });

  // Close mobile drawer on resize to desktop dimensions
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      mobileMenuToggle.classList.remove('active');
      mobileDrawer.classList.remove('active');
    }
  });

  // Shrink navbar on scroll
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  // ==========================================================================
  // 3. Scroll Reveal Animations (Intersection Observer)
  // ==========================================================================
  const fadeUpElements = document.querySelectorAll('.fade-in-up');

  const revealOnScrollObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target); // Reveal only once
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -50px 0px'
  });

  fadeUpElements.forEach(element => {
    revealOnScrollObserver.observe(element);
  });

  // ==========================================================================
  // 4. Statistics Counters Animation (Supports Integers and Decimals)
  // ==========================================================================
  const statNumbers = document.querySelectorAll('.stat-number');
  const statsSection = document.getElementById('statistics');
  let hasAnimatedStats = false;

  const animateCounters = () => {
    statNumbers.forEach(stat => {
      const targetAttr = stat.getAttribute('data-target');
      const decimalsAttr = stat.getAttribute('data-decimals');
      
      const target = parseFloat(targetAttr);
      const decimals = decimalsAttr ? parseInt(decimalsAttr, 10) : 0;
      
      const duration = 2000; // Total animation duration in ms
      const startTime = performance.now();

      const updateCounter = (currentTime) => {
        const elapsedTime = currentTime - startTime;
        const progress = Math.min(elapsedTime / duration, 1);

        // Ease-out-quad function for smooth slowing effect
        const easeProgress = progress * (2 - progress);
        const currentValue = easeProgress * target;

        // Display numbers with decimals if specified, else locale formatted integer
        if (decimals > 0) {
          stat.textContent = currentValue.toFixed(decimals);
        } else {
          stat.textContent = Math.floor(currentValue).toLocaleString();
        }

        if (progress < 1) {
          requestAnimationFrame(updateCounter);
        } else {
          stat.textContent = decimals > 0 ? target.toFixed(decimals) : target.toLocaleString();
        }
      };

      requestAnimationFrame(updateCounter);
    });
  };

  const statsObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !hasAnimatedStats) {
        hasAnimatedStats = true;
        animateCounters();
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.2
  });

  if (statsSection) {
    statsObserver.observe(statsSection);
  }

  // ==========================================================================
  // 5. Join Community Modal Control & Form Handling
  // ==========================================================================
  const modalOverlay = document.getElementById('join-modal');
  const joinTriggers = document.querySelectorAll('.btn-join-trigger');
  const modalCloseBtn = document.getElementById('modal-close');
  const joinForm = document.getElementById('join-form');
  const successMessage = document.getElementById('success-message');
  const successCloseBtn = document.getElementById('success-close');

  const openModal = () => {
    modalOverlay.classList.add('active');
    document.body.style.overflow = 'hidden'; // Stop background scrolling
  };

  const closeModal = () => {
    modalOverlay.classList.remove('active');
    document.body.style.overflow = '';
    
    // Reset form and panel states after transition completes
    setTimeout(() => {
      joinForm.style.display = 'block';
      successMessage.style.display = 'none';
      joinForm.reset();
    }, 300);
  };

  joinTriggers.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      openModal();
    });
  });

  modalCloseBtn.addEventListener('click', closeModal);
  successCloseBtn.addEventListener('click', closeModal);

  // Close modal when clicking outside of modal card
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeModal();
    }
  });

  // Close modal on Escape key press
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay.classList.contains('active')) {
      closeModal();
    }
  });

  // Form Submission Logic
  joinForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('student-name').value;
    const email = document.getElementById('student-email').value;
    const branch = document.getElementById('student-branch').value;
    const year = document.getElementById('student-year').value;

    if (!name || !email || !branch || !year) {
      alert('Please fill out all required fields.');
      return;
    }

    // Simulate sending data to server
    const submitBtn = joinForm.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.disabled = true;
    submitBtn.textContent = 'Submitting...';

    setTimeout(() => {
      joinForm.style.display = 'none';
      successMessage.style.display = 'block';
      submitBtn.disabled = false;
      submitBtn.textContent = originalText;
    }, 1200);
  });

  // ==========================================================================
  // 6. Contributors Page Filter & Search System
  // ==========================================================================
  const searchInput = document.getElementById('contributor-search');
  const filterPills = document.querySelectorAll('.filter-pill');
  const contributorCards = document.querySelectorAll('.contributor-card');

  if (searchInput && filterPills.length > 0 && contributorCards.length > 0) {
    let activeFilter = 'all';
    let searchQuery = '';

    const filterContributors = () => {
      contributorCards.forEach(card => {
        const name = card.getAttribute('data-name') || '';
        const username = card.getAttribute('data-username') || '';
        const rolesAttr = card.getAttribute('data-roles') || '';
        const roles = rolesAttr.split(',');

        // Check if query matches name or username
        const matchesSearch = name.includes(searchQuery) || username.includes(searchQuery);
        
        // Check if roles contains the active filter
        const matchesFilter = activeFilter === 'all' || roles.includes(activeFilter);

        if (matchesSearch && matchesFilter) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    };

    // Listen for search input
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      filterContributors();
    });

    // Listen for filter pill clicks
    filterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        // Toggle active class on pills
        filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        activeFilter = pill.getAttribute('data-filter') || 'all';
        filterContributors();
      });
    });
  }

  // ==========================================================================
  // 7. Contact Form Submission Handling
  // ==========================================================================
  const contactForm = document.getElementById('contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('contact-name').value;
      const email = document.getElementById('contact-email').value;
      const message = document.getElementById('contact-message').value;

      if (!name || !email || !message) {
        alert('Please fill out all fields.');
        return;
      }

      const submitBtn = contactForm.querySelector('button[type="submit"]');
      const originalText = submitBtn.textContent;
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';

      setTimeout(() => {
        alert(`Thank you, ${name}! Your message has been received. We will get back to you shortly at ${email}.`);
        contactForm.reset();
        submitBtn.disabled = false;
        submitBtn.textContent = originalText;
      }, 1200);
    });
  }

  // ==========================================================================
  // 8. Events Page Filter & Search System
  // ==========================================================================
  const eventSearchInput = document.getElementById('event-search');
  const eventFilterPills = document.querySelectorAll('.filter-pill');
  const eventCards = document.querySelectorAll('.event-card-v2');

  if (eventSearchInput && eventCards.length > 0) {
    let activeFilter = 'all';
    let searchQuery = '';

    const filterEvents = () => {
      eventCards.forEach(card => {
        const name = (card.getAttribute('data-name') || '').toLowerCase();
        const location = (card.getAttribute('data-location') || '').toLowerCase();
        const type = card.getAttribute('data-type') || '';
        const time = card.getAttribute('data-time') || '';

        const matchesSearch = name.includes(searchQuery) || location.includes(searchQuery);
        
        let matchesFilter = false;
        if (activeFilter === 'all') {
          matchesFilter = true;
        } else if (activeFilter === 'upcoming' || activeFilter === 'past') {
          matchesFilter = time === activeFilter;
        } else {
          matchesFilter = type === activeFilter;
        }

        if (matchesSearch && matchesFilter) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    };

    eventSearchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      filterEvents();
    });

    eventFilterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        eventFilterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        activeFilter = pill.getAttribute('data-filter') || 'all';
        filterEvents();
      });
    });
  }

  // ==========================================================================
  // 9. Resources Page Filter & Search System
  // ==========================================================================
  const resourceSearchInput = document.getElementById('resource-search');
  const resourceFilterPills = document.querySelectorAll('.filter-pill');
  const resourceCards = document.querySelectorAll('.resource-card');

  if (resourceSearchInput && resourceCards.length > 0) {
    let activeFilter = 'all';
    let searchQuery = '';

    const filterResources = () => {
      resourceCards.forEach(card => {
        const name = (card.getAttribute('data-name') || '').toLowerCase();
        const desc = (card.getAttribute('data-desc') || '').toLowerCase();
        const category = card.getAttribute('data-category') || '';

        const matchesSearch = name.includes(searchQuery) || desc.includes(searchQuery);
        const matchesFilter = activeFilter === 'all' || category === activeFilter;

        if (matchesSearch && matchesFilter) {
          card.classList.remove('hidden');
        } else {
          card.classList.add('hidden');
        }
      });
    };

    resourceSearchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      filterResources();
    });

    resourceFilterPills.forEach(pill => {
      pill.addEventListener('click', () => {
        resourceFilterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        activeFilter = pill.getAttribute('data-filter') || 'all';
        filterResources();
      });
    });
  }

  // ==========================================================================
  // 10. FAQ Accordion Toggle System
  // ==========================================================================
  const faqQuestions = document.querySelectorAll('.faq-question');
  
  if (faqQuestions.length > 0) {
    faqQuestions.forEach(question => {
      question.addEventListener('click', () => {
        const item = question.parentNode;
        const isActive = item.classList.contains('active');
        
        // Close other items
        document.querySelectorAll('.faq-item').forEach(otherItem => {
          otherItem.classList.remove('active');
        });
        
        if (!isActive) {
          item.classList.add('active');
        }
      });
    });
  }

});

