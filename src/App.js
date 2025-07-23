import './App.css';
import { useEffect, useRef, useState } from 'react';

function App() {
  const contentFrameRef = useRef(null);
  const lastUpdateTime = useRef(0);
  const lastMousePosition = useRef({ x: 50, y: 50 });
  const rafRef = useRef(null);
  const mainTitleRef = useRef(null); // Add ref for main title
  
  // Slideshow state
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  // Mobile menu state
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Loading state
  const [loading, setLoading] = useState(true);

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
      type: "about",
      title: "About",
      subtitle: "Quality Software Solutions",
      description: "The Queen's EngSoc Software Development team is a group of students focused on learning software developement through hands-on experience with real clients. We are open to all clients to request work. Projects are considered every September, and the team is always looking for more members.",
      links: [
        { text: "EngSoc clubs site for more information", href: "https://www.engsoc.queensu.ca/get-involved/clubs/" },
        { text: "Our instagram page!", href: "https://www.instagram.com/queens.essdev/" }
      ],
      image: "/AboutImage.jpg",
      imageLabel: "A group photo of the EssDev Team in 2023"
    },
    {
      id: 3,
      type: "for students",
      title: "For Students",
      image: "/ForStudentsImage.jpg",
      imageLabel: "Queen's EngSoc Members",
      subtitle: "Up your programming skills with real client work",
      description: "Have you always wanted to learn how to code? Want to get real world experience? Want to work with a team of passionate students? Then EssDev is the place for you!\n\nThe team is open to hiring Project Managers and Software Developers, applications open late August and run through to the end of September.",
      
      joinLink: "https://breezy.engsoc.queensu.ca/?#positions"
    },
    {
      id: 4,
      type: "for clients",
      title: "For Clients",
      image: "/ForClientsImage.jpg",
      imageLabel: "Smith Engineering Administration",
      subtitle: "Free and high-quality projects",
      description: "Are you a club, team, organization, or business in need of software solutions? Whether you need a website, a mobile app, or custom software, EssDev offers free, high-quality, and reliable software development services.\n\nWe are always looking for new clients and projects. If you are interested, please contact us.",
      // Add contactLink for clarity
      contactLink: "#contact"
    },
    // {
    //   id: 5,
    //   type: "examples",
    //   title: "Examples",
    //   subtitle: "Project Number 1",
    //   description: "description",
    //   links: [
    //     { text: "link - link - link", href: "#" },
    //     { text: "link - link", href: "#" }
    //   ],
    //   image: "/project-image.jpg" // placeholder for now
    // },
    {
      id: 6,
      type: "contact",
      title: "Contact",
      email: "essdev@engsoc.queensu.ca",
      phone: "613-533-2323 (Office)",
      description: "The Engineering Society Software Developement team is open to all clients to request work. Projects are considered every September, and the team is always looking for more members."
    }
  ];

  // Helper to preload images
  const preloadImages = (imageUrls) => {
    return Promise.all(
      imageUrls.map(
        (url) =>
          new Promise((resolve) => {
            const img = new window.Image();
            img.src = url;
            img.onload = img.onerror = resolve;
          })
      )
    );
  };

  useEffect(() => {
    // Gather all images from slides
    const imageUrls = slides
      .map((slide) => slide.image)
      .filter(Boolean)
      .map((url) => url.startsWith('/') ? process.env.PUBLIC_URL + url : url);
    preloadImages(imageUrls).then(() => {
      // Add a small delay for smoothness
      setTimeout(() => setLoading(false), 400);
    });
  }, []);

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
    if (isTransitioning || index === currentSlide) {
      // If navigating to hero slide, force animation reset (no longer needed)
      return;
    }
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
    }, 122000); //Change slide every x seconds

    return () => clearInterval(interval);
  }, [isTransitioning, currentSlide, slides.length]);

  // For typing animation
  const [mainTitleDone, setMainTitleDone] = useState(false);
  const [subTitleDone, setSubTitleDone] = useState(false);
  // Remove heroAnimKey logic

  useEffect(() => {
    setMainTitleDone(false);
    setSubTitleDone(false);
    const mainTimer = setTimeout(() => setMainTitleDone(true), 600); // match .main-title-line animation
    const subTimer = setTimeout(() => setSubTitleDone(true), 1400); // main + sub animation
    return () => {
      clearTimeout(mainTimer);
      clearTimeout(subTimer);
    };
  }, []); // Only run on mount

  // Helper to render description with line breaks
  const renderDescription = (desc) =>
    desc.split('\n').map((line, idx) => (
      <span key={idx}>
        {line}
        {idx !== desc.split('\n').length - 1 && <br />}
      </span>
    ));

  return (
    <div className="App">
      {/* Loading Modal */}
      {loading && (
        <div className="loading-modal">
          <div className="loading-spinner">
            <div className="spinner-wheel"></div>
            <div className="loading-text">Loading...</div>
          </div>
        </div>
      )}
      {/* Navigation Header */}
      <nav className="navbar">
        <div className="nav-brand" onClick={() => goToSlide(0)} style={{ cursor: 'pointer' }}>
          <img src="/Logo.png" alt="essdev logo" className="logo" />
        </div>
        
        {/* Desktop Navigation */}
        <div className="nav-links desktop-nav">
          <a href="#about" onClick={e => { e.preventDefault(); goToSlide(1); }} className="nav-link">about</a>
          <a href="#for-students" onClick={e => { e.preventDefault(); goToSlide(2); }} className="nav-link">for students</a>
          <a href="#for-clients" onClick={e => { e.preventDefault(); goToSlide(3); }} className="nav-link">for clients</a>
          {/* <a href="#examples" onClick={e => { e.preventDefault(); goToSlide(4); }} className="nav-link">examples</a> */}
          <a href="#contact" onClick={e => { e.preventDefault(); goToSlide(4); }} className="nav-link">contact</a>
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
            <a href="#about" onClick={e => { e.preventDefault(); goToSlide(1); closeMobileMenu(); }} className="nav-link">about</a>
            <a href="#for-students" onClick={e => { e.preventDefault(); goToSlide(2); closeMobileMenu(); }} className="nav-link">for students</a>
            <a href="#for-clients" onClick={e => { e.preventDefault(); goToSlide(3); closeMobileMenu(); }} className="nav-link">for clients</a>
            {/* <a href="#examples" onClick={e => { e.preventDefault(); goToSlide(4); closeMobileMenu(); }} className="nav-link">examples</a> */}
            <a href="#contact" onClick={e => { e.preventDefault(); goToSlide(4); closeMobileMenu(); }} className="nav-link">contact</a>
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
                        <span className={`main-title-line${mainTitleDone ? ' done' : ''}`}>{slide.title}</span>
                        <span className={`main-title-sub highlight${subTitleDone ? ' done' : ''}`}>{slide.subtitle}</span>
                      </h1>
                      <p className="tagline">{slide.tagline}</p>
                      
                      <div className="bottom-nav">
                        <a href={slide.bottomLinks[0].href} className="bottom-link" onClick={e => { e.preventDefault(); goToSlide(2); }}>
                          {slide.bottomLinks[0].text}
                        </a>
                        <span className="bottom-or">or</span>
                        <a href={slide.bottomLinks[1].href} className="bottom-link" onClick={e => { e.preventDefault(); goToSlide(slides.length - 1); }}>
                          {slide.bottomLinks[1].text}
                        </a>
                      </div>
                    </div>
                  ) : slide.type === "examples" || slide.type === "about" || slide.type === "for students" || slide.type === "for clients" ? (
                    <div className="content-inner two-column-layout">
                      <div className="text-content">
                        <h1 className="section-title">{slide.title}</h1>
                        <h2 className="project-title">{slide.subtitle}</h2>
                        <p className="description-text">{renderDescription(slide.description)}</p>
                        {/* Buttons for For Students and For Clients slides */}
                        {slide.type === 'for students' && (
                          <div className="slide-action-buttons">
                            <a href={slide.joinLink || "#join"} className="join-btn" target="_blank" rel="noopener noreferrer">Join Now</a>
                          </div>
                        )}
                        {slide.type === 'for clients' && (
                          <div className="slide-action-buttons">
                            <a href="#contact" className="contact-btn" onClick={e => { e.preventDefault(); goToSlide(slides.length - 1); }}>Contact Now</a>
                          </div>
                        )}
                        <div className="section-links">
                          {slide.links && slide.links.map((link, linkIndex) => (
                            <a key={linkIndex} href={link.href} className="section-link">
                              {link.text}
                            </a>
                          ))}
                        </div>
                      </div>
                      {slide.image && (
                        <div className="image-content">
                          <div className="project-image">
                            <img src={slide.image} alt={slide.title} />
                          </div>
                          {/* Image label below the image */}
                          <div className="image-label">
                            {slide.imageLabel || slide.title}
                          </div>
                        </div>
                      )}
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
