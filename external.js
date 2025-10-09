document.addEventListener('DOMContentLoaded', () => {
  // --- Lightning Cursor Setup  ---
  const lightning = document.getElementById('lightning');
  let mouseX = 0, mouseY = 0;
  let wantUpdateCursor = false;

  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!wantUpdateCursor) {
      wantUpdateCursor = true;
      requestAnimationFrame(() => {
        if (!lightning) { wantUpdateCursor = false; return; }
        lightning.style.left = `${mouseX}px`;
        lightning.style.top = `${mouseY}px`;
        lightning.style.transform = `translate(-50%, -50%)`;

        const hovered = (e.target && e.target.closest) ? e.target.closest('a, button, .hamburger') : null;
        if (hovered) {
          lightning.style.width = '30px';
          lightning.style.height = '30px';
          lightning.style.boxShadow = '0 0 20px white, 0 0 40px gold, 0 0 60px crimson';
        } else {
          lightning.style.width = '20px';
          lightning.style.height = '20px';
          lightning.style.boxShadow = '0 0 10px white, 0 0 20px gold, 0 0 40px gold';
        }
        wantUpdateCursor = false;
      });
    }
  });

  // --- Hamburger Toggle & smooth anchor scrolling ---
  const hamburger = document.getElementById('hamburger');
  const closeMenu = document.getElementById('close-menu');
  const navLinks = document.getElementById('nav-links');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => navLinks.classList.add('show'));
  }
  if (closeMenu && navLinks) {
    closeMenu.addEventListener('click', () => navLinks.classList.remove('show'));
  }

  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      const targetId = this.getAttribute('href');
      const target = document.querySelector(targetId);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (navLinks && navLinks.classList.contains('show')) navLinks.classList.remove('show');
      }
    });
  });

  // --- Collect flow elements (cards + texts) ---
  const flowCards = [
    ...document.querySelectorAll('.project-tile'),
    document.querySelector('.welcome-text'),
    document.querySelector('.contact-container')
  ].filter(Boolean);

  const flowTexts = [
    ...document.querySelectorAll('.welcome-text h1, .welcome-text p'),
    ...document.querySelectorAll('.project-tile .card-body h3, .project-tile .card-body p, .project-tile .tags span'),
    ...document.querySelectorAll('.contact-info h2, .contact-form h3, .contact-form label')
  ].filter(Boolean);

  let ticking = false;
  let lastScrollY = window.pageYOffset || document.documentElement.scrollTop;

  function updateFlowEffects() {
    const viewportHeight = window.innerHeight;
    const viewportCenter = viewportHeight / 2;
    const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
    const scrollDelta = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;

    const moveSpeed = window.innerWidth <= 430 ? 0.2 : 0.4;
    const maxMove = 50;

    flowCards.forEach((el, index) => {
      const rect = el.getBoundingClientRect();
      const elCenter = rect.top + rect.height / 2;
      const distanceFromCenter = Math.abs(elCenter - viewportCenter);

      const blurThreshold = viewportHeight * 0.5;
      const maxBlur = window.innerWidth <= 430 ? 2 : 5;
      let blurAmount = Math.min((distanceFromCenter / blurThreshold) * maxBlur, maxBlur);

      const fadeThreshold = viewportHeight * 0.8;
      let opacityAmount = Math.min(1, Math.max(0, 1 - (distanceFromCenter / fadeThreshold)));

      let riseAmount = 0;
      if (opacityAmount > 0.5) {
        riseAmount = -(scrollDelta * moveSpeed);
        if (el.classList.contains('project-tile')) riseAmount += (index * 5) - 10;
        else if (el.classList.contains('contact-container')) riseAmount *= 0.7;
        riseAmount = Math.max(-maxMove, Math.min(maxMove, riseAmount));
      }

      // Build filter string once
      let filters = blurAmount > 0 ? `blur(${blurAmount}px)` : 'none';
      if (blurAmount < 1 && opacityAmount > 0.8) {
        filters += ' brightness(1.05) sepia(0.1)';
      }

      el.style.opacity = String(opacityAmount); 
      el.style.transform = `translateY(${riseAmount}px)`;
      el.style.filter = filters;


      if (el.classList.contains('project-tile')) {
        if (distanceFromCenter < viewportHeight * 0.6) {
          el.style.opacity = String(Math.max(Number(el.style.opacity), 0.8));
        } else if (distanceFromCenter > fadeThreshold) {
          el.style.opacity = '0';
        }
      }
    });

    flowTexts.forEach((textEl, index) => {
      const parentCard = textEl.closest('.project-tile, .welcome-text, .contact-container');
      if (!parentCard) return;
      const parentRect = parentCard.getBoundingClientRect();
      const textCenter = parentRect.top + parentRect.height / 2;
      const distanceFromCenter = Math.abs(textCenter - viewportCenter);

      const fadeThreshold = viewportHeight * 0.8;
      let opacityAmount = Math.max(0, 1 - (distanceFromCenter / fadeThreshold));

      if (opacityAmount > 0.5) {
        let textRise = -(scrollDelta * moveSpeed * 0.5);
        if (textEl.closest('.project-tile')) textRise += (index % 3) * 2 - 2;
        textRise = Math.max(-maxMove / 2, Math.min(maxMove / 2, textRise));
        textEl.style.transform = `translateY(${textRise}px)`;
        textEl.style.opacity = String(opacityAmount);
      } else {
        textEl.style.transform = 'translateY(0)';
        textEl.style.opacity = String(opacityAmount);
      }
    });

    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if (!ticking) {
      requestAnimationFrame(updateFlowEffects);
      ticking = true;
    }
  });

  // Initial call
  updateFlowEffects();

  const observerOptions = { threshold: 0.1 };
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        const delay = entry.target.classList.contains('project-tile') ? index * 0.2 : 0;
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
          if (entry.target.classList.contains('contact-container')) {
            entry.target.classList.add('flow-active');
          }
        }, delay * 1000);
      }
    });
  }, observerOptions);

  flowCards.forEach(el => observer.observe(el));
  flowTexts.forEach(el => observer.observe(el));

  // --- EmailJS Contact Form Handling ---
  if (window.emailjs) {
    emailjs.init("2t4XGdhJvRDl_u6j7"); 

    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
      contactForm.addEventListener('submit', function (e) {
        e.preventDefault();
        const name = (document.getElementById('name') || {}).value?.trim();
        const email = (document.getElementById('email') || {}).value?.trim();
        const message = (document.getElementById('message') || {}).value?.trim();

        if (!name || !email || !message) {
          alert('Please fill in all fields.');
          return;
        }

        emailjs.sendForm('service_1kw4ov9', 'template_6qxaej9', this)
          .then(() => {
            alert("Message sent successfully! Thanks for reaching out—I'll get back to you soon.");
            this.reset();
          })
          .catch((error) => {
            console.error('EmailJS Error:', error);
            alert('Oops! Something went wrong. Please try emailing me directly at bercelesjohnbenedict25@gmail.com');
          });
      });
    }
  }
});

// Thunderstorm Loading Animation
window.addEventListener('load', () => {
  const overlay = document.getElementById('thunder-overlay');
  if (!overlay) return;
  const strikeTimes = [0, 300, 700, 1100];

  strikeTimes.forEach(time => {
    setTimeout(() => {
      overlay.style.opacity = '1';
      overlay.style.transition = 'opacity 0.1s';
      setTimeout(() => overlay.style.opacity = '0', 100);

      const strike = document.createElement('div');
      strike.className = 'lightning-strike';
      overlay.appendChild(strike);
      setTimeout(() => strike.remove(), 200);
    }, time);
  });

  setTimeout(() => {
    document.body.classList.add('loaded');
    overlay.style.transition = 'opacity 0.5s ease';
    overlay.style.opacity = '0';
    setTimeout(() => overlay.remove(), 500);
  }, 1500);
});
