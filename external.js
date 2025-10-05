document.addEventListener('DOMContentLoaded', () => {
  // Lightning cursor
  const lightning = document.getElementById('lightning');
  document.addEventListener('mousemove', (e) => {
    const x = e.clientX - 10;
    const y = e.clientY - 10;
    lightning.style.transform = `translate(${x}px, ${y}px)`;
  });

  // Hamburger menu
  const hamburger = document.getElementById("hamburger");
  const closeMenu = document.getElementById("close-menu");
  const navLinks = document.getElementById("nav-links");

  hamburger.addEventListener("click", () => {
    navLinks.classList.add("show");
    hamburger.style.display = "none";
    closeMenu.style.display = "block";
  });

  closeMenu.addEventListener("click", () => {
    navLinks.classList.remove("show");
    closeMenu.style.display = "none";
    hamburger.style.display = "block";
  });
});

// Thunder overlay effect on page load
window.addEventListener('load', () => {
  const overlay = document.getElementById('thunder-overlay');

  const strikeTimes = [0, 300, 700, 1100]; 
  strikeTimes.forEach(time => {
    setTimeout(() => {
      overlay.style.opacity = '1';
      overlay.style.transition = 'opacity 0.1s';
      setTimeout(() => overlay.style.opacity = '0', 100);
    }, time);
  });


  setTimeout(() => {
    document.body.classList.add('loaded');
    overlay.remove();
  }, 1500);
});








