// DOM Content Loaded
document.addEventListener('DOMContentLoaded', function() {
  // Search Toggle Functionality
  const searchToggle = document.getElementById('searchToggle');
  const searchBox = document.getElementById('searchBox');
  
  if (searchToggle && searchBox) {
    searchToggle.addEventListener('click', function() {
      searchBox.classList.toggle('active');
      if (searchBox.classList.contains('active')) {
        searchBox.focus();
      }
    });
    
    // Close search when clicking outside
    document.addEventListener('click', function(e) {
      if (!searchToggle.contains(e.target) && !searchBox.contains(e.target)) {
        searchBox.classList.remove('active');
      }
    });
  }
  
  // Image Slider Functionality
  const slides = document.querySelectorAll('.slide');
  const dots = document.querySelectorAll('.dot');
  const prevBtn = document.getElementById('prevSlide');
  const nextBtn = document.getElementById('nextSlide');
  let currentSlide = 0;
  let slideInterval;
  
  function showSlide(index) {
    // Ensure index is within bounds
    if (index < 0) {
      currentSlide = slides.length - 1;
    } else if (index >= slides.length) {
      currentSlide = 0;
    } else {
      currentSlide = index;
    }
    
    // Update slides display
    slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === currentSlide);
    });
    
    // Update dots
    dots.forEach((dot, i) => {
      dot.classList.toggle('active', i === currentSlide);
    });
    
    // Move slides container
    const slidesContainer = document.getElementById('slides');
    slidesContainer.style.transform = `translateX(-${currentSlide * 100}%)`;
  }
  
  function startSlider() {
    slideInterval = setInterval(() => {
      showSlide(currentSlide + 1);
    }, 5000);
  }
  
  function stopSlider() {
    clearInterval(slideInterval);
  }
  
  // Initialize slider
  if (slides.length > 0) {
    showSlide(0);
    startSlider();
    
    // Add event listeners for buttons
    if (prevBtn) {
      prevBtn.addEventListener('click', () => {
        stopSlider();
        showSlide(currentSlide - 1);
        startSlider();
      });
    }
    
    if (nextBtn) {
      nextBtn.addEventListener('click', () => {
        stopSlider();
        showSlide(currentSlide + 1);
        startSlider();
      });
    }
    
    // Add event listeners for dots
    dots.forEach(dot => {
      dot.addEventListener('click', function() {
        const index = parseInt(this.getAttribute('data-index'));
        stopSlider();
        showSlide(index);
        startSlider();
      });
    });
    
    // Pause slider on hover
    const slider = document.getElementById('heroSlider');
    if (slider) {
      slider.addEventListener('mouseenter', stopSlider);
      slider.addEventListener('mouseleave', startSlider);
    }
  }
  
  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 80,
          behavior: 'smooth'
        });
      }
    });
  });
  
  // Navbar scroll effect
  const navbar = document.querySelector('.navbar');
  window.addEventListener('scroll', function() {
    if (window.scrollY > 50) {
      navbar.style.background = 'rgba(255, 255, 255, 0.95)';
      navbar.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
    } else {
      navbar.style.background = 'rgba(255, 255, 255, 0.85)';
      navbar.style.boxShadow = '0 4px 6px rgba(0, 0, 0, 0.1)';
    }
  });
  
  // Form submission handler
  const contactForm = document.querySelector('.contact-form');
  if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
      e.preventDefault();
      
      // Get form data
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const message = document.getElementById('message').value;
      
      // Simple validation
      if (!name || !email || !message) {
        alert('Please fill in all fields');
        return;
      }
      
      // In a real application, you would send this data to a server
      // For demo purposes, we'll just show a success message
      alert('Thank you for your message! We will get back to you soon.');
      
      // Reset form
      contactForm.reset();
    });
  }
  
  // Add animation on scroll
  function animateOnScroll() {
    const elements = document.querySelectorAll('.feature, .role, .card');
    
    elements.forEach(element => {
      const elementTop = element.getBoundingClientRect().top;
      const elementVisible = 150;
      
      if (elementTop < window.innerHeight - elementVisible) {
        element.style.opacity = '1';
        element.style.transform = 'translateY(0)';
      }
    });
  }
  
  // Initialize elements for animation
  document.querySelectorAll('.feature, .role, .card').forEach(element => {
    element.style.opacity = '0';
    element.style.transform = 'translateY(20px)';
    element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  });
  
  // Run on load and scroll
  window.addEventListener('load', animateOnScroll);
  window.addEventListener('scroll', animateOnScroll);
});