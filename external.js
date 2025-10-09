  document.addEventListener('DOMContentLoaded', () => {
    // Lightning Cursor Setup
    const lightning = document.getElementById('lightning');
    let mouseX = 0, mouseY = 0;

    document.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      lightning.style.left = `${mouseX}px`;
      lightning.style.top = `${mouseY}px`;
      lightning.style.transform = `translate(-50%, -50%)`;

      const hovered = e.target.closest('a, button, .hamburger');
      if (hovered) {
        lightning.style.width = '30px';
        lightning.style.height = '30px';
        lightning.style.boxShadow = '0 0 20px white, 0 0 40px gold, 0 0 60px crimson';
      } else {
        lightning.style.width = '20px';
        lightning.style.height = '20px';
        lightning.style.boxShadow = '0 0 10px white, 0 0 20px gold, 0 0 40px gold';
      }
    });

    // Hamburger Menu Toggle
    const hamburger = document.getElementById('hamburger');
    const closeMenu = document.getElementById('close-menu');
    const navLinks = document.getElementById('nav-links');

    if (hamburger) {
      hamburger.addEventListener('click', () => {
        navLinks.classList.add('show');
      });
    }

    if (closeMenu) {
      closeMenu.addEventListener('click', () => {
        navLinks.classList.remove('show');
      });
    }

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        const target = document.querySelector(targetId);
        if (target) {
          target.scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
          });
          // Close mobile menu if open
          if (navLinks.classList.contains('show')) {
            navLinks.classList.remove('show');
          }
        }
      });
    });

    // NEW: Collect all flow elements (cards + words/texts)
    const flowCards = [
      ...document.querySelectorAll('.project-tile'), 
      document.querySelector('.welcome-text'),      
      document.querySelector('.contact-container') 
    ];

    const flowTexts = [
      ...document.querySelectorAll('.welcome-text h1, .welcome-text p'),
      ...document.querySelectorAll('.project-tile .card-body h3, .project-tile .card-body p, .project-tile .tags span'),
      ...document.querySelectorAll('.contact-info h2, .contact-form h3, .contact-form label')
    ];

    let ticking = false; 
    let lastScrollY = 0; 

    function updateFlowEffects() {
      const viewportHeight = window.innerHeight;
      const viewportCenter = viewportHeight / 2;
      const currentScrollY = window.pageYOffset || document.documentElement.scrollTop;
      const scrollDelta = currentScrollY - lastScrollY; 
      lastScrollY = currentScrollY;

      // Movement speed (slower on mobile)
      const moveSpeed = window.innerWidth <= 430 ? 0.2 : 0.4;
      const maxMove = 50; 

      flowCards.forEach((el, index) => {
        if (!el) return;

        const rect = el.getBoundingClientRect();
        const elCenter = rect.top + rect.height / 2;
        const distanceFromCenter = Math.abs(elCenter - viewportCenter);

        // Existing: Blur and opacity
        const blurThreshold = viewportHeight * 0.5;
        const maxBlur = window.innerWidth <= 430 ? 2 : 5;
        let blurAmount = (distanceFromCenter / blurThreshold) * maxBlur;
        blurAmount = Math.min(blurAmount, maxBlur);

        const fadeThreshold = viewportHeight * 0.8;
        let opacityAmount = Math.max(0, 1 - (distanceFromCenter / fadeThreshold));
        opacityAmount = Math.min(1, opacityAmount);

        let riseAmount = 0;
        if (opacityAmount > 0.5) { 

          riseAmount = -(scrollDelta * moveSpeed); 

          if (el.classList.contains('project-tile')) {
            riseAmount += (index * 5) - 10; 
          } else if (el.classList.contains('contact-container')) {
            riseAmount *= 0.7; 
          }
          riseAmount = Math.max(-maxMove, Math.min(maxMove, riseAmount)); 
        }

        // Apply to card
        el.style.opacity = opacityAmount;
        el.style.transform = `translateY(${riseAmount}px)`;
        el.style.filter = `blur(${blurAmount}px)`;

        // Golden tint when focused
        if (blurAmount < 1 && opacityAmount > 0.8) {
          el.style.filter += ' brightness(1.05) sepia(0.1)';
        } else {
          const blurOnly = blurAmount > 0 ? `blur(${blurAmount}px)` : 'none';
          el.style.filter = blurOnly;
        }

        // Staggered reveal/fade for projects
        if (el.classList.contains('project-tile')) {
          if (distanceFromCenter < viewportHeight * 0.6) {
            el.style.opacity = Math.max(el.style.opacity, '0.8');
          } else if (distanceFromCenter > fadeThreshold) {
            el.style.opacity = '0';
          }
        }
      });

      flowTexts.forEach((textEl, index) => {
        if (!textEl) return;

        const parentCard = textEl.closest('.project-tile, .welcome-text, .contact-container');
        if (!parentCard) return;

        const parentRect = parentCard.getBoundingClientRect();
        const textCenter = parentRect.top + parentRect.height / 2; // Approximate
        const distanceFromCenter = Math.abs(textCenter - viewportCenter);

        const fadeThreshold = viewportHeight * 0.8;
        let opacityAmount = Math.max(0, 1 - (distanceFromCenter / fadeThreshold));

        if (opacityAmount > 0.5) {
          let textRise = -(scrollDelta * moveSpeed * 0.5); 
    
          if (textEl.closest('.project-tile')) {
            textRise += (index % 3) * 2 - 2;
          }
          textRise = Math.max(-maxMove / 2, Math.min(maxMove / 2, textRise));

          textEl.style.transform = `translateY(${textRise}px)`;
          textEl.style.opacity = opacityAmount;
        } else {
          textEl.style.transform = 'translateY(0)';
          textEl.style.opacity = opacityAmount;
        }
      });

      ticking = false;
    }

    // Scroll Event Listener with Throttling
    window.addEventListener('scroll', () => {
      if (!ticking) {
        requestAnimationFrame(updateFlowEffects);
        ticking = true;
      }
    });

    // Initial call on load
    updateFlowEffects();

    // Intersection Observer for Staggered Fade-In on Entry
    const observerOptions = { threshold: 0.1 };
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting) {
          // Stagger delay for project tiles
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

    // Observe flow cards
    flowCards.forEach(el => {
      if (el) observer.observe(el);
    });

    flowTexts.forEach(el => {
      if (el) observer.observe(el);
    });
  });

     
// Thunderstorm Loading Animation
  window.addEventListener('load', () => {
  const overlay = document.getElementById('thunder-overlay');
  const strikeTimes = [0, 300, 700, 1100]; 

  strikeTimes.forEach(time => {
    setTimeout(() => {
      // Flash overlay
      overlay.style.opacity = '1';
      overlay.style.transition = 'opacity 0.1s';
      setTimeout(() => {
        overlay.style.opacity = '0';
      }, 100);

      // Create and animate lightning strike
      const strike = document.createElement('div');
      strike.className = 'lightning-strike';
      overlay.appendChild(strike);
      setTimeout(() => {
        strike.remove(); // Clean up after animation
      }, 200); // Matches animation duration
    }, time);
  });

  // Fade out overlay and add loaded class
  setTimeout(() => {
    document.body.classList.add('loaded');
    if (overlay) {
      overlay.style.transition = 'opacity 0.5s ease';
      overlay.style.opacity = '0';
      setTimeout(() => overlay.remove(), 500);
    }
  }, 1500);
});

// Contact Form Handling with EmailJS 
document.addEventListener('DOMContentLoaded', () => {
  emailjs.init("2t4XGdhJvRDl_u6j7"); 

     const contactForm = document.getElementById('contact-form');
     if (contactForm) {
       contactForm.addEventListener('submit', function(e) {
         e.preventDefault();
         // Basic validation
         const name = document.getElementById('name').value.trim();
         const email = document.getElementById('email').value.trim();
         const message = document.getElementById('message').value.trim();
         
         if (!name || !email || !message) {
           alert('Please fill in all fields.');
           return;
         }
         // Send via EmailJS 
         emailjs.sendForm('service_1kw4ov9', 'template_6qxaej9', this) 
           .then((result) => {
             alert('Message sent successfully! Thanks for reaching out—I\'ll get back to you soon.');
             this.reset(); // Clear form
           }, (error) => {
             console.error('EmailJS Error:', error);
             alert('Oops! Something went wrong. Please try emailing me directly at bercelesjohnbenedict25@gmail.com');
           });
       });
     }
   });
