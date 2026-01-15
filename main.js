const cursor = document.querySelector('.cursor');
const cards = document.querySelectorAll('.card');
const video = document.querySelector('.hero-video');
const heroName = document.querySelector('.hero-name');
const bgPara = document.querySelector('.bg-paragraph');
const nav = document.querySelector('.nav');

if (video) {
  video.addEventListener('loadedmetadata', () => {
    video.playbackRate = 2.0;
  });
  
  // Store the original text and clear it for the typewriter effect
  const originalText = bgPara ? bgPara.textContent.trim().replace(/\s+/g, ' ') : '';
  if (bgPara) bgPara.textContent = '';

  let hasRevealed = false;
  const revealContent = () => {
    if (hasRevealed) return;
    hasRevealed = true;

    if (heroName) {
      heroName.style.opacity = '1';
    }

    // Wait for hero name to show up first before revealing cards
    setTimeout(() => {
      // Reveal Nav
      if (nav) nav.style.opacity = '1';

      // Trigger card animations
      cards.forEach(card => {
        card.style.opacity = '1';
        card.classList.add('animate-in');
      });

      // Typewriter effect starts AFTER cards appear
      setTimeout(() => {
        if (bgPara && originalText) {
          let i = 0;
          const speed = 40; // typing speed in ms
          
          function typeWriter() {
            if (i < originalText.length) {
              bgPara.textContent += originalText.charAt(i);
              i++;
              setTimeout(typeWriter, speed);
            }
          }
          typeWriter();
        }
      }, 1000); // 1 second delay after cards start appearing
    }, 1200); // Start cards/nav after hero name fades in
  };

  video.addEventListener('ended', revealContent);
  
  // Safety fallbacks
  window.addEventListener('load', () => {
    setTimeout(revealContent, 3000); 
  });
  
  // In case metadata doesn't load or something else fails
  setTimeout(revealContent, 5000);
}

document.addEventListener('mousemove', (e) => {
  cursor.style.left = e.clientX + 'px';
  cursor.style.top = e.clientY + 'px';
});

let activeCard = null;
let offset = { x: 0, y: 0 };
let zIndexCounter = 100;

cards.forEach(card => {
  card.addEventListener('mousedown', (e) => {
    activeCard = card;
    card.style.zIndex = zIndexCounter++;
    
    // Calculate offset
    const rect = card.getBoundingClientRect();
    offset.x = e.clientX - rect.left;
    offset.y = e.clientY - rect.top;
    
    card.style.transition = 'none';
    card.style.animation = 'none'; // Stop floating animation once grabbed
    card.style.opacity = '1'; // Ensure card stays visible

    // If blue card is clicked, toggle black text
    if (card.classList.contains('blue')) {
      bgPara.classList.add('dark-mode');
    }
  });
});

document.addEventListener('mousemove', (e) => {
  if (activeCard) {
    activeCard.style.left = (e.clientX - offset.x) + 'px';
    activeCard.style.top = (e.clientY - offset.y) + 'px';
    activeCard.style.transform = activeCard.style.transform.replace(/translateX\(-50%\)/, ''); // Remove centering
  }
});

document.addEventListener('mouseup', () => {
  if (activeCard && activeCard.classList.contains('blue')) {
    bgPara.classList.remove('dark-mode');
  }
  activeCard = null;
});

// Cursor grow effect on hover
const hoverElements = document.querySelectorAll('.card, .gallery-item img, .gallery-item video');
hoverElements.forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('grow'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('grow'));
});
