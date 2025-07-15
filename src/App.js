import './App.css';
import { useEffect, useRef, useState } from 'react';

function App() {
  const contentFrameRef = useRef(null);
  const lastUpdateTime = useRef(0);
  const lastMousePosition = useRef({ x: 50, y: 50 });
  const rafRef = useRef(null);
  
  // Slideshow state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const THROTTLE_MS = 16; // ~60fps
  
  // Sample slides data
  const slides = [
    {
      id: 1,
      type: "hero",
      title: "Inhouse Pro-Bono",
      subtitle: "Software Solutions",
      tagline: "Free. High-Quality. Reliable. Robust.",
      bottomLinks: [
        { text: "scroll for examples", href: "#examples" },
        { text: "contact us", href: "#contact" }
      ]
    },
    {
      id: 2,
      type: "examples",
      title: "Examples",
      subtitle: "Project Number 1",
      description: "description",
      links: [
        { text: "link - link - link", href: "#" },
        { text: "link - link", href: "#" }
      ],
      image: "/project-image.jpg" // placeholder for now
    },
    {
      id: 3,
      type: "about",
      title: "About",
      subtitle: "Queen's EngSoc Software Development Team",
      description: "description",
      links: [
        { text: "link - link - link", href: "#" },
        { text: "link - link", href: "#" }
      ],
      image: "/about-image.jpg" // placeholder for now
    },
    {
      id: 4,
      type: "contact",
      title: "Contact",
      email: "essdev@engsoc.queensu.ca",
      phone: "613-533-2323",
      description: "description"
    }
  ];

  const nextSlide = () => {
    if (isTransitioning || currentSlide >= slides.length - 1) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => prev + 1);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const prevSlide = () => {
    if (isTransitioning || currentSlide <= 0) return;
    setIsTransitioning(true);
    setCurrentSlide((prev) => prev - 1);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const goToSlide = (index) => {
    if (isTransitioning || index === currentSlide) return;
    setIsTransitioning(true);
    setCurrentSlide(index);
    setTimeout(() => setIsTransitioning(false), 500);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  useEffect(() => {
    const handleMouseMove = (e) => {
      const now = performance.now();
      if (now - lastUpdateTime.current < THROTTLE_MS) return;
      lastUpdateTime.current = now;

      if (contentFrameRef.current) {
        const rect = contentFrameRef.current.getBoundingClientRect();
        const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
        const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
        
        // Only update if position changed significantly
        if (Math.abs(lastMousePosition.current.x - x) > 1 || 
            Math.abs(lastMousePosition.current.y - y) > 1) {
          lastMousePosition.current = { x, y };
          
          if (!rafRef.current) {
            rafRef.current = requestAnimationFrame(() => {
              if (contentFrameRef.current) {
                contentFrameRef.current.style.setProperty('--gradient-x', `${x}%`);
                contentFrameRef.current.style.setProperty('--gradient-y', `${y}%`);
                contentFrameRef.current.style.setProperty('--outline-x', `${x}%`);
                contentFrameRef.current.style.setProperty('--outline-y', `${y}%`);
              }
              rafRef.current = null;
            });
          }
        }
      }
    };

    const container = contentFrameRef.current;
    if (container) {
      container.addEventListener('mousemove', handleMouseMove, { passive: true });
      
      return () => {
        container.removeEventListener('mousemove', handleMouseMove);
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
        }
      };
    }
  }, []);

  // Handle mobile menu interactions
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isMobileMenuOpen) {
        closeMobileMenu();
      }
    };

    const handleResize = () => {
      if (window.innerWidth > 768 && isMobileMenuOpen) {
        closeMobileMenu();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleResize);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [isMobileMenuOpen]);

  // Handle keyboard navigation for slides
  useEffect(() => {
    const handleSlideKeyDown = (e) => {
      // Only handle arrow keys if mobile menu is not open
      if (isMobileMenuOpen) return;
      
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          prevSlide();
          break;
        case 'ArrowDown':
          e.preventDefault();
          nextSlide();
          break;
        default:
          break;
      }
    };

    document.addEventListener('keydown', handleSlideKeyDown);

    return () => {
      document.removeEventListener('keydown', handleSlideKeyDown);
    };
  }, [currentSlide, isTransitioning, isMobileMenuOpen]);

  // Handle mouse wheel navigation for slides
  useEffect(() => {
    let wheelTimeout = null;

    const handleWheelNavigation = (e) => {
      // Only handle wheel events if mobile menu is not open and not currently transitioning
      if (isMobileMenuOpen || isTransitioning) return;

      // Clear existing timeout to debounce rapid wheel events
      if (wheelTimeout) {
        clearTimeout(wheelTimeout);
      }

      // Debounce wheel events to prevent too rapid slide changes
      wheelTimeout = setTimeout(() => {
        const deltaY = e.deltaY;
        
        if (deltaY > 0) {
          // Scrolling down - go to next slide
          nextSlide();
        } else if (deltaY < 0) {
          // Scrolling up - go to previous slide
          prevSlide();
        }
      }, 50); // 50ms debounce
    };

    // Add wheel event listener to the document
    document.addEventListener('wheel', handleWheelNavigation, { passive: true });

    return () => {
      document.removeEventListener('wheel', handleWheelNavigation);
      if (wheelTimeout) {
        clearTimeout(wheelTimeout);
      }
    };
  }, [currentSlide, isTransitioning, isMobileMenuOpen]);

  // Auto-play slideshow (optional)
  useEffect(() => {
    const interval = setInterval(() => {
      if (!isTransitioning && currentSlide < slides.length - 1) {
        nextSlide();
      }
    }, 6000); // Change slide every 6 seconds

    return () => clearInterval(interval);
  }, [isTransitioning, currentSlide, slides.length]);

  return (
    <div className="App">
      {/* Navigation Header */}
      <nav className="navbar">
        <div className="nav-brand">
          <img src="/Logo.png" alt="essdev logo" className="logo" />
        </div>
        
        {/* Desktop Navigation */}
        <div className="nav-links desktop-nav">
          <a href="#examples">examples</a>
          <a href="#about">about</a>
          <a href="#contact">contact</a>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="mobile-menu-btn"
          onClick={toggleMobileMenu}
          aria-label="Toggle mobile menu"
          aria-expanded={isMobileMenuOpen}
        >
          <span className={`hamburger ${isMobileMenuOpen ? 'open' : ''}`}>
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>

        {/* Mobile Navigation */}
        <div 
          className={`mobile-nav ${isMobileMenuOpen ? 'open' : ''}`}
          onClick={closeMobileMenu}
        >
          <div 
            className="mobile-nav-links"
            onClick={(e) => e.stopPropagation()}
          >
            <a href="#examples" onClick={closeMobileMenu}>examples</a>
            <a href="#about" onClick={closeMobileMenu}>about</a>
            <a href="#contact" onClick={closeMobileMenu}>contact</a>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="main-content">
        <div className="slideshow-container">
          <div className="content-frame noise-perlin" ref={contentFrameRef}>
            <div className="slides-wrapper">
              {slides.map((slide, index) => (
                <div 
                  key={slide.id}
                  className={`slide ${index === currentSlide ? 'active' : ''} ${
                    index < currentSlide ? 'prev' : index > currentSlide ? 'next' : ''
                  }`}
                >
                  {slide.type === "hero" ? (
                    <div className="content-inner hero-layout">
                      <h1 className="main-title">
                        {slide.title}<br />
                        <span className="highlight">{slide.subtitle}</span>
                      </h1>
                      <p className="tagline">{slide.tagline}</p>
                      
                      <div className="bottom-nav">
                        <a href={slide.bottomLinks[0].href} className="bottom-link">
                          {slide.bottomLinks[0].text}
                        </a>
                        <span className="bottom-or">or</span>
                        <a href={slide.bottomLinks[1].href} className="bottom-link">
                          {slide.bottomLinks[1].text}
                        </a>
                      </div>
                    </div>
                  ) : slide.type === "examples" || slide.type === "about" ? (
                    <div className="content-inner two-column-layout">
                      <div className="text-content">
                        <h1 className="section-title">{slide.title}</h1>
                        <h2 className="project-title">{slide.subtitle}</h2>
                        <p className="description-text">{slide.description}</p>
                        <div className="section-links">
                          {slide.links.map((link, linkIndex) => (
                            <a key={linkIndex} href={link.href} className="section-link">
                              {link.text}
                            </a>
                          ))}
                        </div>
                      </div>
                      <div className="image-content">
                        <div className="project-image">
                          {/* Placeholder for project image */}
                          <div className="image-placeholder"></div>
                        </div>
                      </div>
                    </div>
                  ) : slide.type === "contact" ? (
                    <div className="content-inner contact-layout">
                      <h1 className="section-title">{slide.title}</h1>
                      <div className="contact-info">
                        <div className="contact-item">
                          <span className="contact-label">Email: </span>
                          <span className="contact-value">{slide.email}</span>
                        </div>
                        <div className="contact-item">
                          <span className="contact-label">Phone: </span>
                          <span className="contact-value">{slide.phone}</span>
                        </div>
                      </div>
                      <p className="description-text">{slide.description}</p>
                    </div>
                  ) : null}
                </div>
              ))}
            </div>

            {/* Navigation Controls */}
            {currentSlide > 0 && (
              <button 
                className="nav-button nav-prev" 
                onClick={prevSlide}
                disabled={isTransitioning}
                aria-label="Previous slide"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M18 15L12 9L6 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}
            
            {currentSlide < slides.length - 1 && (
              <button 
                className="nav-button nav-next" 
                onClick={nextSlide}
                disabled={isTransitioning}
                aria-label="Next slide"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M6 9L12 15L18 9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            )}

            {/* Slide Indicators */}
            <div className="slide-indicators">
              {slides.map((_, index) => (
                <div
                  key={index}
                  className={`indicator ${index === currentSlide ? 'active' : ''}`}
                  onClick={() => goToSlide(index)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Go to slide ${index + 1}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      goToSlide(index);
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
