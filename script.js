const main = document.getElementById('main');
const header = document.getElementById('header');

const birdJson = 'birdanimone.json';

// Track occupied lanes to prevent overlap
const occupiedLanes = new Set();

function getAvailableLane() {
  const laneHeight = 10; // Each lane is 10vh tall
  const lanes = [];
  
  // Create lanes from 10vh to 50vh
  for (let i = 10; i <= 25; i += laneHeight) {
    if (!occupiedLanes.has(i)) {
      lanes.push(i);
    }
  }
  
  if (lanes.length === 0) return null;
  return lanes[Math.floor(Math.random() * lanes.length)];
}

function spawnBird() {
  const lane = getAvailableLane();
  if (!lane) return; // No lanes available, skip spawn
  
  const bird = document.createElement('div');
  bird.className = 'bird';
  bird.dataset.lane = lane;
  occupiedLanes.add(lane);

  // Use the assigned lane with small random offset
  const top = lane + (Math.random() * 3 - 1.5); // ±1.5vh variation
  
  // SIZE - set different dimensions directly
  const size = 40 + Math.random() * 40; // 40px to 120px
  
  // Speed - balanced for smooth flight
  const duration = 10 + Math.random() * 10; // 15-25 seconds to cross
  
  // Set size directly on the element
  bird.style.width = `${size}px`;
  bird.style.height = `${size}px`;
  bird.style.top = `${top}vh`;
  bird.style.left = '-150px';
  
  // Smaller birds are more transparent
  bird.style.opacity = 0.5 + (size / 120) * 0.5;

  main.appendChild(bird);

  // Load Lottie with the bird's size
  const anim = lottie.loadAnimation({
    container: bird,
    renderer: 'svg',
    loop: true,
    autoplay: true,
    path: birdJson,
  });

  // Manual animation with requestAnimationFrame
  let position = -150;
  const speed = (window.innerWidth + 300) / (duration * 60); // pixels per frame
  
  function animate() {
    position += speed;
    bird.style.left = `${position}px`;
    
    if (position < window.innerWidth + 150) {
      requestAnimationFrame(animate);
    } else {
      occupiedLanes.delete(parseInt(bird.dataset.lane));
      bird.remove();
    }
  }
  
  requestAnimationFrame(animate);
}

// Spawn birds less frequently for a calmer feel
setInterval(() => {
  if (document.querySelectorAll('.bird').length < 4) {
    spawnBird();
  }
}, 4000); // Even more spaced out

// Initial bird after a delay
setTimeout(spawnBird, 500);

// Scroll animations
const observerOptions = {
  threshold: 0.1,
  rootMargin: '0px 0px -100px 0px'
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, observerOptions);

// Observe tech stack elements
const techTitle = document.getElementById('techTitle');
const techGrid = document.getElementById('techGrid');

if (techTitle) observer.observe(techTitle);
if (techGrid) observer.observe(techGrid);

// Enhanced Mobile Support for Problem/Solution Animation
class OptimizedScrollManager {
  constructor() {
    // Cache all DOM elements once
    this.main = document.getElementById('main');
    this.header = document.getElementById('header');
    this.interactiveSection = document.getElementById('interactiveSection');
    this.problemSolutionSection = document.getElementById('problemSolutionSection');
    this.statusIndicator = document.getElementById('statusIndicator');
    this.statusTitle = document.getElementById('statusTitle');
    this.progressItems = document.querySelectorAll('.progress-item');
    this.images = document.querySelectorAll('.interactive-image');
    
    // State tracking
    this.ticking = false;
    this.isInSolutionMode = false;
    this.totalSections = this.progressItems.length;
    this.isMobile = window.innerWidth <= 768;
    
    this.init();
  }
  
  init() {
    // Show all problem/solution cards immediately
    const problemCards = document.querySelectorAll('.problem-card');
    const solutionCards = document.querySelectorAll('.solution-card');
    
    problemCards.forEach(card => card.classList.add('visible'));
    solutionCards.forEach(card => card.classList.add('visible'));
    
    // Mobile-specific setup
    if (this.isMobile) {
      this.setupMobileEnhancements();
    }
    
    // Single scroll listener with throttling
    window.addEventListener('scroll', () => this.requestTick(), { passive: true });
    
    // Window resize handler
    window.addEventListener('resize', () => {
      this.isMobile = window.innerWidth <= 768;
    });
  }
  
  setupMobileEnhancements() {
    // Add mobile progress indicator
    this.addMobileProgressIndicator();
    
    // Setup intersection observer for mobile card animations
    this.setupMobileCardAnimations();
  }
  
  addMobileProgressIndicator() {
    if (document.querySelector('.mobile-progress')) return;
    
    const progressBar = document.createElement('div');
    progressBar.className = 'mobile-progress';
    progressBar.innerHTML = '<div class="mobile-progress-bar"></div>';
    document.body.appendChild(progressBar);
    
    this.mobileProgressBar = progressBar.querySelector('.mobile-progress-bar');
  }
  
  setupMobileCardAnimations() {
    const cards = document.querySelectorAll('.card-container');
    
    const cardObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          setTimeout(() => {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
          }, 100);
        }
      });
    }, {
      threshold: 0.2,
      rootMargin: '0px 0px -50px 0px'
    });
    
    cards.forEach(card => {
      if (this.isMobile) {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
      }
      cardObserver.observe(card);
    });
  }
  
  requestTick() {
    if (!this.ticking) {
      this.ticking = true;
      requestAnimationFrame(() => this.handleScroll());
    }
  }
  
  handleScroll() {
    this.ticking = false;
    
    // Cache scroll position once
    const scrollY = window.pageYOffset;
    const windowHeight = window.innerHeight;
    
    // 1. Main header scroll effect (desktop only)
    if (!this.isMobile) {
      this.handleMainScroll(scrollY);
    }
    
    // 2. Interactive section scroll (desktop only)
    if (!this.isMobile) {
      this.handleInteractiveScroll(windowHeight);
    }
    
    // 3. Problem/Solution section scroll (both mobile and desktop)
    this.handleProblemSolutionScroll(windowHeight);
    
    // 4. Mobile progress indicator
    if (this.isMobile && this.mobileProgressBar) {
      this.updateMobileProgress(scrollY);
    }
  }
  
  updateMobileProgress(scrollY) {
    if (!this.problemSolutionSection) return;
    
    const rect = this.problemSolutionSection.getBoundingClientRect();
    const sectionTop = rect.top;
    const sectionHeight = rect.height;
    const windowHeight = window.innerHeight;
    
    // Calculate progress through the section
    if (sectionTop <= 0 && sectionTop + sectionHeight > 0) {
      const progress = Math.abs(sectionTop) / (sectionHeight - windowHeight);
      const clampedProgress = Math.max(0, Math.min(1, progress));
      this.mobileProgressBar.style.width = `${clampedProgress * 100}%`;
    }
  }
  
  handleMainScroll(scrollY) {
    if (!this.main || !this.header) return;
    
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    const scrollPercent = Math.min(scrollY / maxScroll, 1);
    
    // Calculate values smoothly based on scroll position
    const width = 98 - (scrollPercent * 30);
    const marginTop = scrollPercent * 50;
    
    // Apply styles
    this.main.style.width = `${width}%`;
    this.main.style.borderRadius = `0 0 20px 20px`;
    this.main.style.marginTop = `${marginTop}px`;
    
    if (scrollPercent > 0) {
      this.header.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
    } else {
      this.header.style.backgroundColor = 'transparent';
    }
  }
  
  handleInteractiveScroll(windowHeight) {
    if (!this.interactiveSection) return;
    
    const rect = this.interactiveSection.getBoundingClientRect();
    const sectionTop = rect.top;
    const sectionHeight = rect.height;
    
    const scrollStart = 0;
    const scrollEnd = -(sectionHeight - windowHeight);
    
    if (sectionTop > scrollStart || sectionTop < scrollEnd) {
      this.resetInteractiveDisplay();
      return;
    }
    
    const stickyProgress = Math.abs(sectionTop) / Math.abs(scrollEnd);
    const clampedProgress = Math.max(0, Math.min(1, stickyProgress));
    
    const totalProgress = clampedProgress * this.totalSections;
    const currentSection = Math.min(Math.floor(totalProgress), this.totalSections - 1);
    const subProgress = totalProgress - currentSection;
    
    this.updateInteractiveDisplay(currentSection, subProgress);
  }
  
  updateInteractiveDisplay(currentSection, subProgress) {
    this.progressItems.forEach((item, index) => {
      const progressFill = item.querySelector('.progress-fill');
      
      if (index < currentSection) {
        item.classList.remove('active');
        if (progressFill) progressFill.style.height = '100%';
      } else if (index === currentSection) {
        item.classList.add('active');
        if (progressFill) {
          const fillHeight = Math.min(100, subProgress * 100);
          progressFill.style.height = `${fillHeight}%`;
        }
      } else {
        item.classList.remove('active');
        if (progressFill) progressFill.style.height = '0%';
      }
    });
    
    this.images.forEach((image, index) => {
      if (index === currentSection) {
        image.classList.add('active');
      } else {
        image.classList.remove('active');
      }
    });
  }
  
  resetInteractiveDisplay() {
    this.progressItems.forEach((item, index) => {
      const progressFill = item.querySelector('.progress-fill');
      
      if (index === 0) {
        item.classList.add('active');
        if (progressFill) progressFill.style.height = '0%';
      } else {
        item.classList.remove('active');
        if (progressFill) progressFill.style.height = '0%';
      }
    });
    
    this.images.forEach((image, index) => {
      if (index === 0) {
        image.classList.add('active');
      } else {
        image.classList.remove('active');
      }
    });
  }
  
  handleProblemSolutionScroll(windowHeight) {
    if (!this.problemSolutionSection) return;
    
    const rect = this.problemSolutionSection.getBoundingClientRect();
    
    // Different logic for mobile vs desktop
    let shouldBeGreen;
    
    if (this.isMobile) {
      // On mobile, switch based on scroll position within section
      const sectionTop = rect.top;
      const sectionHeight = rect.height;
      const scrolledIntoSection = Math.max(0, windowHeight - sectionTop);
      const progress = scrolledIntoSection / (sectionHeight * 0.6); // Switch at 60% through
      shouldBeGreen = progress > 1;
    } else {
      // Desktop logic (existing)
      const sectionCenter = rect.top + (rect.height / 2);
      shouldBeGreen = sectionCenter < windowHeight / 2;
    }
    
    // Only update if state changed
    if (shouldBeGreen && !this.isInSolutionMode) {
      this.isInSolutionMode = true;
      this.statusIndicator.classList.add('solution-mode');
      this.statusTitle.textContent = 'Die Lösung';
    } else if (!shouldBeGreen && this.isInSolutionMode) {
      this.isInSolutionMode = false;
      this.statusIndicator.classList.remove('solution-mode');
      this.statusTitle.textContent = 'Das Problem';
    }
  }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new OptimizedScrollManager();
});