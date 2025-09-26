document.addEventListener('DOMContentLoaded', () => { 
  const lightning = document.getElementById('lightning');

  document.addEventListener('mousemove', (e) => {
    const x = e.clientX - 10; // center the div on cursor
    const y = e.clientY - 10;

    lightning.style.transform = `translate(${x}px, ${y}px)`;
  });  
});
