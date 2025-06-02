const hotspots = document.querySelectorAll('.hotspot');
const locationTitle = document.getElementById('location-title');
const locationImage = document.getElementById('location-image');
const locationDescription = document.getElementById('location-description');
const locationHours = document.getElementById('location-hours');
const locationCapacity = document.getElementById('location-capacity');
const locationContact = document.getElementById('location-contact');
const closeInfoBtn = document.getElementById('close-info');

const locationData = {
    'main-building': {
        title: 'Main Building',
        description: 'The main academic building houses classrooms for grades 9-12, administrative offices, and the school counseling center.',
        image: 'main-building.jpg',
        hours: 'Monday-Friday: 7:30 AM - 4:30 PM',
        capacity: '800 students',
        contact: 'Main Office: (555) 123-4567',
        type: 'academic'
    },
    'library': {
        title: 'Library & Media Center',
        description: 'Our modern library features a vast collection of books, digital resources, study spaces, and computer stations for student research and learning.',
        image: 'library.jpg',
        hours: 'Monday-Friday: 8:00 AM - 5:00 PM',
        capacity: '150 students',
        contact: 'Librarian: (555) 123-4568',
        type: 'academic'
    },
    'cafeteria': {
        title: 'Cafeteria',
        description: 'The school cafeteria provides nutritious meals and snacks for students and staff, with indoor and outdoor seating options.',
        image: 'cafeteria.jpg',
        hours: 'Monday-Friday: 7:00 AM - 2:00 PM',
        capacity: '300 students',
        contact: 'Food Services: (555) 123-4569',
        type: 'facilities'
    },
    'gym': {
        title: 'Gymnasium',
        description: 'Our state-of-the-art gymnasium hosts physical education classes, school sports events, and community activities.',
        image: 'gym.jpg',
        hours: 'Monday-Friday: 7:30 AM - 9:00 PM, Saturday: 9:00 AM - 5:00 PM',
        capacity: '500 spectators',
        contact: 'Athletics Dept: (555) 123-4570',
        type: 'recreation'
    },
    'auditorium': {
        title: 'Auditorium',
        description: 'The school auditorium is equipped with professional sound and lighting for assemblies, performances, and special events.',
        image: 'auditorium.jpg',
        hours: 'By reservation only',
        capacity: '400 seats',
        contact: 'Events Coordinator: (555) 123-4571',
        type: 'facilities'
    },
    'science-lab': {
        title: 'Science Laboratory',
        description: 'Our modern science labs provide hands-on learning experiences for biology, chemistry, and physics courses.',
        image: 'science-lab.jpg',
        hours: 'Monday-Friday: 8:00 AM - 4:00 PM',
        capacity: '30 students per lab',
        contact: 'Science Dept: (555) 123-4572',
        type: 'academic'
    },
    'playground': {
        title: 'Playground & Sports Fields',
        description: 'The outdoor recreation area includes sports fields, basketball courts, and playground equipment for physical education and recess.',
        image: 'playground.jpg',
        hours: 'School hours and daylight hours on weekends',
        capacity: 'Multiple classes',
        contact: 'Facilities: (555) 123-4573',
        type: 'recreation'
    },
    'parking': {
        title: 'Parking & Drop-off Area',
        description: 'The school parking lot provides spaces for staff, visitors, and student drivers, with a designated drop-off and pick-up zone.',
        image: 'parking.jpg',
        hours: '24/7 access',
        capacity: '200 vehicles',
        contact: 'Security: (555) 123-4574',
        type: 'facilities'
    }
};

function showLocationInfo(locationId) {
    const location = locationData[locationId];
    
    if (!location) return;
    
    locationTitle.textContent = location.title;
    locationDescription.textContent = location.description;
    locationHours.textContent = location.hours;
    locationCapacity.textContent = location.capacity;
    locationContact.textContent = location.contact;
    
    locationImage.style.backgroundImage = `url(${location.image})`;
    
    // Add active class to the clicked hotspot
    hotspots.forEach(spot => {
        if (spot.dataset.location === locationId) {
            spot.classList.add('active');
        } else {
            spot.classList.remove('active');
        }
    });
}

function resetLocationInfo() {
    locationTitle.textContent = 'Select a location';
    locationDescription.textContent = 'Click on any highlighted area of the map to learn more about that location.';
    locationHours.textContent = '-';
    locationCapacity.textContent = '-';
    locationContact.textContent = '-';
    locationImage.style.backgroundImage = 'none';
    
    hotspots.forEach(spot => {
        spot.classList.remove('active');
    });
}

// Add event listeners to hotspots
hotspots.forEach(hotspot => {
    hotspot.addEventListener('click', () => {
        const locationId = hotspot.dataset.location;
        showLocationInfo(locationId);
    });
});

// Close info panel
closeInfoBtn.addEventListener('click', resetLocationInfo);

// Create placeholder map image with canvas
function createPlaceholderMap() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 800;
    canvas.height = 500;
    
    // Background
    ctx.fillStyle = '#e6f7ff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Draw buildings and areas
    drawBuilding(ctx, 400, 200, 150, 100, '#3498db'); // Main building
    drawBuilding(ctx, 560, 150, 80, 60, '#3498db'); // Library
    drawBuilding(ctx, 240, 300, 100, 80, '#f1c40f'); // Cafeteria
    drawBuilding(ctx, 480, 350, 120, 80, '#2ecc71'); // Gym
    drawBuilding(ctx, 320, 100, 100, 70, '#9b59b6'); // Auditorium
    drawBuilding(ctx, 600, 250, 70, 50, '#3498db'); // Science lab
    
    // Draw playground
    ctx.fillStyle = '#2ecc71';
    ctx.beginPath();
    ctx.ellipse(320, 400, 100, 60, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Draw parking lot
    ctx.fillStyle = '#95a5a6';
    ctx.fillRect(160, 75, 100, 50);
    
    // Draw paths
    ctx.strokeStyle = '#bdc3c7';
    ctx.lineWidth = 5;
    ctx.beginPath();
    ctx.moveTo(160, 100);
    ctx.lineTo(300, 100);
    ctx.lineTo(400, 200);
    ctx.lineTo(400, 300);
    ctx.lineTo(320, 400);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(400, 200);
    ctx.lineTo(560, 150);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(400, 300);
    ctx.lineTo(480, 350);
    ctx.stroke();
    
    ctx.beginPath();
    ctx.moveTo(400, 200);
    ctx.lineTo(600, 250);
    ctx.stroke();
    
    // Save the canvas as an image
    const dataUrl = canvas.toDataURL('image/png');
    
    // Create a download link
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = 'school-map.png';
    
    // Automatically download the image
    link.click();
    
    // Also set it as the map image
    const mapImage = document.querySelector('.map-image');
    mapImage.src = dataUrl;
}

function drawBuilding(ctx, x, y, width, height, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x - width/2, y - height/2, width, height);
    
    // Add a simple shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(x - width/2 + 5, y - height/2 + 5, width, height);
}

// Generate the map image when the page loads
window.addEventListener('load', createPlaceholderMap);
