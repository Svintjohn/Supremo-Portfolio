document.addEventListener('DOMContentLoaded', () => { // DOMContentLoaded for DOM readiness, used to ensure DOM is fully loaded before running scripts
  // Cursor Effect
  const lightning = document.getElementById('lightning');
  let mouseX = 0, mouseY = 0; // Track mouse position
  let wantUpdateCursor = false;

  // this method is used to ensure the lightning element exists
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    if (!wantUpdateCursor) {
      wantUpdateCursor = true;
      requestAnimationFrame(() => {
        if (!lightning) { wantUpdateCursor = false; return; }
        lightning.style.left = `${mouseX}px`;
        lightning.style.top = `${mouseY}px`;
        lightning.style.transform = `translate(-50%, -50%)`; // Center the lightning on cursor

        // Change style if hovering over interactive elements
        // closest method is used to check for multiple element types

        const hovered = (e.target && e.target.closest) ? e.target.closest('a, button, .hamburger') : null; // null is used for safety
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

  // Hamburger Toggle & smooth anchor scrolling
  const hamburger = document.getElementById('hamburger');
  const closeMenu = document.getElementById('close-menu');
  const navLinks = document.getElementById('nav-links');

  // this method is used to ensure elements exist before adding event listeners
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => navLinks.classList.add('show'));
  }
  if (closeMenu && navLinks) {
    closeMenu.addEventListener('click', () => navLinks.classList.remove('show'));
  }

  // Smooth scrolling for in-page links
  // this method is used to ensure all anchor links with href starting with '#' are handled
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

  // This is used to ensure smooth scrolling for in-page links
  // --- Flow Effect on Scroll ---
  // This effect is applied to project cards, welcome text, and contact section
  // It involves movement, blurring, and fading based on scroll position
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

  // This method is used to ensure smooth and performant updates
  function updateFlowEffects() {
    const viewportHeight = window.innerHeight;
    const viewportCenter = viewportHeight / 2;
    const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
    const scrollDelta = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;

    const moveSpeed = window.innerWidth <= 430 ? 0.2 : 0.4;
    const maxMove = 50;

    // Card elements flow, blur, and fade
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

      // Combine filters
      // this method is used to ensure multiple filters can be applied
      let filters = blurAmount > 0 ? `blur(${blurAmount}px)` : 'none'; // Start with blur
      if (blurAmount < 1 && opacityAmount > 0.8) { // Slight brightness and warmth when clear
        filters += ' brightness(1.05) sepia(0.1)'; // subtle warmth
      }

      // Apply styles
      el.style.opacity = String(opacityAmount);  // Ensure opacity is a string
      el.style.transform = `translateY(${riseAmount}px)`; // Apply vertical movement
      el.style.filter = filters;


      if (el.classList.contains('project-tile')) { // Special handling for project cards
        // Ensure cards don't become too transparent
        if (distanceFromCenter < viewportHeight * 0.6) { // within 60% of viewport height
          el.style.opacity = String(Math.max(Number(el.style.opacity), 0.8)); // minimum opacity of 0.8
        } else if (distanceFromCenter > fadeThreshold) { // beyond fade threshold
          el.style.opacity = '0';
        }
      }
    });

    // Text elements flow and fade
    flowTexts.forEach((textEl, index) => { // index for staggered movement
      const parentCard = textEl.closest('.project-tile, .welcome-text, .contact-container');
      if (!parentCard) return; // Skip if no parent card found
      const parentRect = parentCard.getBoundingClientRect(); // .getBoundingClientRect for accurate position
      const textCenter = parentRect.top + parentRect.height / 2; // center of parent card
      const distanceFromCenter = Math.abs(textCenter - viewportCenter); // Math.abs for distance

      // Fade based on distance
      const fadeThreshold = viewportHeight * 0.8;
      let opacityAmount = Math.max(0, 1 - (distanceFromCenter / fadeThreshold));

      // if else method is used to prevent excessive fading
      if (opacityAmount > 0.5) { // only move if sufficiently visible
        let textRise = -(scrollDelta * moveSpeed * 0.5); // slower than cards
        if (textEl.closest('.project-tile')) textRise += (index % 3) * 2 - 2; // .closest to limit index scope
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
  // this method is used to ensure effects are applied on load
  updateFlowEffects(); 

  const observerOptions = { threshold: 0.1 }; // Trigger when 10% of the element is visible
  const observer = new IntersectionObserver((entries) => { // Callback for intersection changes
    entries.forEach((entry, index) => {
      // if method is used to allow delay based on index
      if (entry.isIntersecting) {
        const delay = entry.target.classList.contains('project-tile') ? index * 0.2 : 0; // Stagger cards
        setTimeout(() => { // Delay for stagger effect
          entry.target.style.opacity = '1'; // Fade in
          entry.target.style.transform = 'translateY(0)'; // Reset position
          if (entry.target.classList.contains('contact-container')) { // Special case for contact container
            entry.target.classList.add('flow-active'); // Add class for additional styles
          }
        }, delay * 1000);
      }
    });
  }, observerOptions);

  flowCards.forEach(el => observer.observe(el)); // Observe each card
  flowTexts.forEach(el => observer.observe(el)); // Observe each text element

  // --- EmailJS Contact Form Handling ---
  // Emailjs is loaded via external script in HTML
  // Emailsjs is used to send emails from the contact form without a backend
  if (window.emailjs) {
    emailjs.init("2t4XGdhJvRDl_u6j7"); // Public Key

    const contactForm = document.getElementById('contact-form'); // Ensure this element exists
    // if method is used to keep 'this' context in event listener
    if (contactForm) {
      contactForm.addEventListener('submit', function (e) { // Do not use arrow function to keep 'this' context
        e.preventDefault(); // prevent default form submission
        const name = (document.getElementById('name') || {}).value?.trim(); // .trim() to remove extra spaces
        const email = (document.getElementById('email') || {}).value?.trim(); 
        const message = (document.getElementById('message') || {}).value?.trim();

        // Basic validation
        if (!name || !email || !message) { 
          alert('Please fill in all fields.');
          return;
        }

        emailjs.sendForm('service_1kw4ov9', 'template_6qxaej9', this) // 'this' refers to the form element
          // then and catch for promise handling and user feedback
          .then(() => {
            alert("Thanks for your message! I’ve received it and will be in touch with you soon."); 
            this.reset();
          })
          .catch((error) => {
            console.error('EmailJS Error:', error); // Log error for debugging
            alert('Oops! Something went wrong. Please contact me directly at bercelesjohnbenedict25@gmail.com');
          });
      });
    }
  }
});

// LOADING ANIMATION
window.addEventListener('load', () => { // ensures all resources are loaded
  const overlay = document.getElementById('thunder-overlay'); // Ensure this element exists
  if (!overlay) return; // Exit if overlay is not found
  const strikeTimes = [0, 300, 700, 1100]; // times in ms for lightning strikes

  strikeTimes.forEach(time => { // Schedule each strike
    setTimeout(() => { // Use a closure to capture the time
      overlay.style.opacity = '1'; // 1 for quick flash
      overlay.style.transition = 'opacity 0.1s'; // quick fade
      setTimeout(() => overlay.style.opacity = '0', 100); // fade out after 100ms
      
      // simulate lightning strike effect
      const strike = document.createElement('div'); // create strike element
      strike.className = 'lightning-strike'; // add class for styling
      overlay.appendChild(strike); // add to overlay
      setTimeout(() => strike.remove(), 200); // remove after effect
    }, time);
  });

  // After all strikes, fade out overlay and show content
  setTimeout(() => { // after last strike
    document.body.classList.add('loaded'); // show main content
    overlay.style.transition = 'opacity 0.5s ease'; // smooth fade out
    overlay.style.opacity = '0'; // fade out overlay
    setTimeout(() => overlay.remove(), 500); // .remove is for cleanup after fade out
  }, 1500); // 1500 ms to cover all strikes and fade out
});
