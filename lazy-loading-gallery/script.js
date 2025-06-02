document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.querySelector('.gallery');
    const loadingIndicator = document.getElementById('loading-indicator');
    
    // Track if we're currently loading images
    let isLoading = false;
    
    // Track the current page of images
    let currentPage = 1;
    
    // Maximum number of pages to load
    const maxPages = 3;
    
    // Generate random height for variety in the masonry layout
    function getRandomHeight() {
        // Heights between 200px and 500px
        return Math.floor(Math.random() * 300) + 200;
    }
    
    // Function to create a gallery item with blur-to-clear loading
    function createGalleryItem(imageData, index) {
        const item = document.createElement('div');
        item.className = 'gallery-item';
        
        // Random height for masonry effect
        const height = getRandomHeight();
        
        // Create tiny thumbnail (blurred version)
        const thumbImg = document.createElement('img');
        thumbImg.className = 'thumb';
        thumbImg.alt = '';
        thumbImg.src = `https://picsum.photos/id/${index + 10}/30/30`; // Tiny version
        
        // Create full-size image with native lazy loading
        const fullImg = document.createElement('img');
        fullImg.className = 'full';
        fullImg.loading = 'lazy'; // Native lazy loading
        fullImg.alt = `Image ${index}`;
        fullImg.src = `https://picsum.photos/id/${index + 10}/800/${height}`;
        
        // Create placeholder with loading text
        const placeholder = document.createElement('div');
        placeholder.className = 'placeholder';
        placeholder.textContent = 'Loading...';
        
        // Create image info element
        const info = document.createElement('div');
        info.className = 'image-info';
        info.innerHTML = `
            <h3>${imageData.title}</h3>
            <p>${imageData.description}</p>
        `;
        
        // Append elements to gallery item
        item.appendChild(placeholder);
        item.appendChild(thumbImg);
        item.appendChild(fullImg);
        item.appendChild(info);
        
        // When the full image loads, add the loaded class to trigger the transition
        // Add artificial delay to make the loading effect more visible for teaching purposes
        fullImg.onload = () => {
            // Show loading text for a longer time
            setTimeout(() => {
                placeholder.style.display = 'none';
                item.classList.add('loaded');
            }, 2000); // 2 second delay after image loads to demonstrate the effect
        };
        
        return item;
    }
    
    // Function to load images for a specific page
    function loadImagesForPage(page) {
        if (isLoading || page > maxPages) return;
        
        isLoading = true;
        loadingIndicator.classList.add('active');
        
        // Simulate API call with setTimeout
        setTimeout(() => {
            // Generate random image data
            const images = Array.from({ length: 12 }, (_, i) => {
                const index = (page - 1) * 12 + i + 1;
                return {
                    id: index,
                    title: `Image Title ${index}`,
                    description: `This is a beautiful image demonstrating progressive blur-to-clear loading technique.`
                };
            });
            
            // Add images to gallery
            images.forEach((imageData, i) => {
                const item = createGalleryItem(imageData, (page - 1) * 12 + i + 1);
                gallery.appendChild(item);
                
                // Add animation delay for staggered appearance
                item.style.animationDelay = `${i * 0.1}s`;
            });
            
            // Set up animation for new items
            animateItems();
            
            currentPage++;
            isLoading = false;
            loadingIndicator.classList.remove('active');
            
            // Check if we've reached the max pages
            if (currentPage > maxPages) {
                loadingIndicator.innerHTML = '<p>No more images to load</p>';
            }
        }, 3000); // Longer network delay for teaching purposes
    }
    
    // Function to animate items as they enter the viewport
    function animateItems() {
        // Use Intersection Observer to detect when items enter viewport
        const animationObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    // Add animation class when item enters viewport
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    
                    // Stop observing once animation is triggered
                    animationObserver.unobserve(entry.target);
                }
            });
        }, {
            threshold: 0.1 // Trigger when 10% of the item is visible
        });
        
        // Observe all new items that don't have animation yet
        document.querySelectorAll('.gallery-item:not(.animated)').forEach(item => {
            // Set initial styles for animation
            item.style.opacity = '0';
            item.style.transform = 'translateY(20px)';
            item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            
            // Mark as animated so we don't re-observe
            item.classList.add('animated');
            
            // Start observing
            animationObserver.observe(item);
        });
    }
    
    // Create Intersection Observer for infinite scroll
    const scrollObserver = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && !isLoading) {
            loadImagesForPage(currentPage);
        }
    }, {
        root: null,
        rootMargin: '0px 0px 200px 0px',
        threshold: 0.1
    });
    
    // Observe the loading indicator for infinite scroll
    scrollObserver.observe(loadingIndicator);
    
    // Initial load of first page
    loadImagesForPage(currentPage);
    
    // Fallback for browsers that don't support native lazy loading
    if (!('loading' in HTMLImageElement.prototype)) {
        console.log('Native lazy loading not supported, using fallback');
        
        // Polyfill with Intersection Observer if available
        if ('IntersectionObserver' in window) {
            const lazyLoadObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const item = entry.target;
                        const fullImg = item.querySelector('.full');
                        
                        // Force load the image
                        if (fullImg.dataset.src) {
                            fullImg.src = fullImg.dataset.src;
                            delete fullImg.dataset.src;
                        }
                        
                        lazyLoadObserver.unobserve(item);
                    }
                });
            });
            
            // Observe all gallery items
            document.querySelectorAll('.gallery-item').forEach(item => {
                lazyLoadObserver.observe(item);
            });
        } else {
            // If no IntersectionObserver support, load all images immediately
            document.querySelectorAll('.gallery-item').forEach(item => {
                const fullImg = item.querySelector('.full');
                if (fullImg.dataset.src) {
                    fullImg.src = fullImg.dataset.src;
                    delete fullImg.dataset.src;
                }
            });
        }
    }
});
