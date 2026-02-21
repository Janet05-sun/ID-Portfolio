// Force scroll to top on refresh
if (history.scrollRestoration) {
  history.scrollRestoration = 'manual';
}
window.scrollTo(0, 0);

const cursor = document.querySelector('.cursor');
const cards = document.querySelectorAll('.card');
const video = document.querySelector('.hero-video');
const heroName = document.querySelector('.hero-name');
const bgPara = document.querySelector('.bg-paragraph');
const nav = document.querySelector('.nav');
const indexLoading = document.getElementById('index-loading');

function hideIndexLoading() {
  if (indexLoading && !indexLoading.classList.contains('hidden')) {
    indexLoading.classList.add('hidden');
    indexLoading.setAttribute('aria-hidden', 'true');
  }
}

if (video) {
  // Force video to load
  video.load();
  
  video.addEventListener('loadedmetadata', () => {
    video.playbackRate = 2.0;
  });
  
  // Hide loading screen when video is ready to play
  video.addEventListener('canplay', hideIndexLoading);
  video.addEventListener('loadeddata', hideIndexLoading);
  
  // Handle video errors gracefully
  video.addEventListener('error', (e) => {
    console.error('Video failed to load:', e);
    hideIndexLoading();
    revealContent(); // Show content even if video fails
  });
  
  // Handle stalled video (when loading stops)
  video.addEventListener('stalled', () => {
    console.warn('Video loading stalled, retrying...');
    video.load(); // Try to reload
  });
  
  // Store the original text and clear it for the typewriter effect
  const originalText = bgPara ? bgPara.textContent.trim().replace(/\s+/g, ' ') : '';
  if (bgPara) bgPara.textContent = '';

  let hasRevealed = false;
  const revealContent = () => {
    if (hasRevealed) return;
    hasRevealed = true;
    hideIndexLoading();

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

const cardRotations = { orange: '-3deg', peach: '2deg', green: '6deg' };

cards.forEach(card => {
  // Blue card: only toggle dark-mode on mousedown/mouseup (no fall, no drag)
  if (card.classList.contains('blue')) {
    card.addEventListener('mousedown', () => bgPara && bgPara.classList.add('dark-mode'));
    card.addEventListener('mouseup', () => bgPara && bgPara.classList.remove('dark-mode'));
    card.addEventListener('mouseleave', () => bgPara && bgPara.classList.remove('dark-mode'));
    return;
  }

  // Orange, peach, green: click = fall to bottom then scroll to footer
  card.addEventListener('click', (e) => {
    if (card.classList.contains('card-falling')) return;
    card.classList.add('card-falling');
    card.style.zIndex = 1000;
    card.style.transition = 'transform 1.1s ease-in';
    const rotation = cardRotations[card.classList[1]] || '0deg';
    card.style.transform = `translateY(160vh) rotate(${rotation})`;
    setTimeout(() => {
      const footer = document.getElementById('footer');
      if (footer) footer.scrollIntoView({ behavior: 'smooth' });
    }, 1200);
  });
});


// Cursor grow effect on hover
const hoverElements = document.querySelectorAll('.card, .gallery-item img, .gallery-item video');
hoverElements.forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('grow'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('grow'));
});

// Ideation Section Toggle
function toggleIdeation(element) {
  const item = element.parentElement;
  
  // If the current item is already active, close it
  if (item.classList.contains('active')) {
    item.classList.remove('active');
  } else {
    // Close all other items
    document.querySelectorAll('.ideation-item').forEach(otherItem => {
      otherItem.classList.remove('active');
    });
    // Open current item
    item.classList.add('active');
  }
}

// Scroll-based reveal for Ideation items
const ideationObserverOptions = {
  root: null,
  rootMargin: '-42% 0px -42% 0px', // Narrower center band for more stability
  threshold: 0
};

let ideationTimeout;

const ideationObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      clearTimeout(ideationTimeout);
      ideationTimeout = setTimeout(() => {
        document.querySelectorAll('.ideation-item').forEach(item => {
          if (item !== entry.target) item.classList.remove('active');
        });
        entry.target.classList.add('active');
      }, 150);
    } else {
      entry.target.classList.remove('active');
      // Also clear timeout if the item that was about to open leaves the zone
      clearTimeout(ideationTimeout);
    }
  });
}, ideationObserverOptions);

document.querySelectorAll('.ideation-item').forEach(item => {
  ideationObserver.observe(item);
});
