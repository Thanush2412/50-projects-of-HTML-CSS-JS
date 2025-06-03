document.addEventListener('DOMContentLoaded', () => {
    const svg = document.getElementById('mainSvg');
    const background = document.getElementById('background');
    const celestialBody = document.getElementById('celestialBody');
    const sunRays = document.getElementById('sunRays');
    const moonDetails = document.getElementById('moonDetails');
    const clouds = document.getElementById('clouds');
    const stars = document.getElementById('stars');
    const starGroup = document.getElementById('starGroup');
    const abstractElements = document.getElementById('abstractElements');
    
    const playPauseBtn = document.getElementById('playPauseBtn');
    const resetBtn = document.getElementById('resetBtn');
    const speedRange = document.getElementById('speedRange');
    const speedValue = document.getElementById('speedValue');
    
    const daySceneBtn = document.getElementById('dayScene');
    const sunsetSceneBtn = document.getElementById('sunsetScene');
    const nightSceneBtn = document.getElementById('nightScene');
    const abstractSceneBtn = document.getElementById('abstractScene');
    
    const animationElements = document.querySelectorAll('animate, animateMotion, animateTransform');
    const interactiveElements = document.querySelectorAll('.interactive');
    const draggableElements = document.querySelectorAll('.draggable');
    
    let isPaused = false;
    let selectedElement = null;
    let offset = { x: 0, y: 0 };
    let currentScene = 'day';
    
    function setAnimationSpeed(speed) {
        animationElements.forEach(animation => {
            const originalDur = animation.getAttribute('data-original-dur') || animation.getAttribute('dur');
            if (!animation.getAttribute('data-original-dur')) {
                animation.setAttribute('data-original-dur', originalDur);
            }
            
            const newDuration = parseFloat(originalDur) / speed;
            animation.setAttribute('dur', `${newDuration}s`);
        });
    }
    
    function resetAnimations() {
        animationElements.forEach(animation => {
            const element = animation.parentElement;
            const clone = element.cloneNode(true);
            element.parentNode.replaceChild(clone, element);
        });
        
        setupInteractions();
        speedRange.value = 1;
        speedValue.textContent = '1x';
        
        setScene(currentScene);
    }
    
    function togglePlayPause() {
        if (isPaused) {
            svg.unpauseAnimations();
            playPauseBtn.textContent = 'Pause';
        } else {
            svg.pauseAnimations();
            playPauseBtn.textContent = 'Play';
        }
        isPaused = !isPaused;
    }
    
    function startDrag(evt) {
        if (evt.target.closest('.draggable')) {
            selectedElement = evt.target.closest('.draggable');
            
            const transforms = selectedElement.transform.baseVal;
            if (transforms.length === 0 || transforms.getItem(0).type !== SVGTransform.SVG_TRANSFORM_TRANSLATE) {
                const translate = svg.createSVGTransform();
                translate.setTranslate(0, 0);
                selectedElement.transform.baseVal.insertItemBefore(translate, 0);
            }
            
            const transform = transforms.getItem(0);
            offset.x = evt.clientX - transform.matrix.e;
            offset.y = evt.clientY - transform.matrix.f;
            
            const animateMotion = selectedElement.querySelector('animateMotion');
            if (animateMotion) {
                animateMotion.setAttribute('dur', '999999s');
            }
        }
    }
    
    function drag(evt) {
        if (selectedElement) {
            evt.preventDefault();
            const transform = selectedElement.transform.baseVal.getItem(0);
            transform.setTranslate(evt.clientX - offset.x, evt.clientY - offset.y);
        }
    }
    
    function endDrag() {
        selectedElement = null;
    }
    
    function createStar(x, y, size, color) {
        const star = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const points = 5;
        const outerRadius = size;
        const innerRadius = size / 2;
        
        let d = "";
        for (let i = 0; i < points * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (Math.PI / points) * i;
            const currX = x + radius * Math.sin(angle);
            const currY = y - radius * Math.cos(angle);
            
            if (i === 0) {
                d += `M ${currX},${currY} `;
            } else {
                d += `L ${currX},${currY} `;
            }
        }
        d += "Z";
        
        star.setAttribute("d", d);
        star.setAttribute("fill", color);
        star.setAttribute("filter", "url(#starGlow)");
        
        return star;
    }
    
    function createFallingStar(evt) {
        if (evt.target.id === 'background' || evt.target.id === 'mainSvg') {
            const svgPoint = getSVGCoordinates(evt);
            
            const star = createStar(svgPoint.x, svgPoint.y, Math.random() * 10 + 5, `hsl(${Math.random() * 60 + 40}, 100%, 70%)`);
            star.classList.add('falling-star');
            
            const endX = Math.random() * 200 - 100;
            const endY = Math.random() * 200 + 100;
            star.style.setProperty('--end-x', `${endX}px`);
            star.style.setProperty('--end-y', `${endY}px`);
            
            document.getElementById('clickStars').appendChild(star);
            
            setTimeout(() => {
                star.remove();
            }, 1500);
        }
    }
    
    function getSVGCoordinates(evt) {
        const pt = svg.createSVGPoint();
        pt.x = evt.clientX;
        pt.y = evt.clientY;
        return pt.matrixTransform(svg.getScreenCTM().inverse());
    }
    
    function generateStars() {
        starGroup.innerHTML = '';
        
        const starCount = 100;
        for (let i = 0; i < starCount; i++) {
            const x = Math.random() * 800;
            const y = Math.random() * 300;
            const size = Math.random() * 2 + 1;
            
            const star = document.createElementNS("http://www.w3.org/2000/svg", "circle");
            star.setAttribute("cx", x);
            star.setAttribute("cy", y);
            star.setAttribute("r", size);
            star.setAttribute("fill", "white");
            star.setAttribute("opacity", Math.random() * 0.5 + 0.5);
            
            const animateOpacity = document.createElementNS("http://www.w3.org/2000/svg", "animate");
            animateOpacity.setAttribute("attributeName", "opacity");
            animateOpacity.setAttribute("values", `${Math.random() * 0.5 + 0.5}; ${Math.random() * 0.2 + 0.2}; ${Math.random() * 0.5 + 0.5}`);
            animateOpacity.setAttribute("dur", `${Math.random() * 3 + 2}s`);
            animateOpacity.setAttribute("repeatCount", "indefinite");
            
            star.appendChild(animateOpacity);
            starGroup.appendChild(star);
        }
    }
    
    function setScene(scene) {
        currentScene = scene;
        
        [daySceneBtn, sunsetSceneBtn, nightSceneBtn, abstractSceneBtn].forEach(btn => {
            btn.classList.remove('active');
        });
        
        switch (scene) {
            case 'day':
                daySceneBtn.classList.add('active');
                background.setAttribute('fill', 'url(#skyGradientDay)');
                celestialBody.setAttribute('fill', 'url(#sunGradient)');
                celestialBody.setAttribute('r', '60');
                sunRays.setAttribute('opacity', '1');
                moonDetails.setAttribute('opacity', '0');
                clouds.setAttribute('opacity', '1');
                stars.setAttribute('opacity', '0');
                abstractElements.setAttribute('opacity', '0');
                break;
                
            case 'sunset':
                sunsetSceneBtn.classList.add('active');
                background.setAttribute('fill', 'url(#skyGradientSunset)');
                celestialBody.setAttribute('fill', 'url(#sunGradient)');
                celestialBody.setAttribute('r', '50');
                sunRays.setAttribute('opacity', '0.5');
                moonDetails.setAttribute('opacity', '0');
                clouds.setAttribute('opacity', '0.8');
                stars.setAttribute('opacity', '0.2');
                abstractElements.setAttribute('opacity', '0');
                generateStars();
                break;
                
            case 'night':
                nightSceneBtn.classList.add('active');
                background.setAttribute('fill', 'url(#skyGradientNight)');
                celestialBody.setAttribute('fill', 'url(#moonGradient)');
                celestialBody.setAttribute('r', '40');
                sunRays.setAttribute('opacity', '0');
                moonDetails.setAttribute('opacity', '1');
                clouds.setAttribute('opacity', '0.5');
                stars.setAttribute('opacity', '1');
                abstractElements.setAttribute('opacity', '0');
                generateStars();
                break;
                
            case 'abstract':
                abstractSceneBtn.classList.add('active');
                background.setAttribute('fill', 'url(#skyGradientAbstract)');
                celestialBody.setAttribute('fill', 'url(#sunGradient)');
                celestialBody.setAttribute('r', '30');
                sunRays.setAttribute('opacity', '0');
                moonDetails.setAttribute('opacity', '0');
                clouds.setAttribute('opacity', '0');
                stars.setAttribute('opacity', '0.5');
                abstractElements.setAttribute('opacity', '1');
                generateStars();
                break;
        }
    }
    
    function setupInteractions() {
        const shape1 = document.getElementById('clickShape1');
        const shape2 = document.getElementById('clickShape2');
        const shape3 = document.getElementById('clickShape3');
        const trees = [
            document.getElementById('tree1'),
            document.getElementById('tree2'),
            document.getElementById('tree3')
        ];
        
        shape1.addEventListener('click', () => {
            const animation = document.getElementById('shape1Morph');
            if (animation.getAttribute('begin') === 'indefinite') {
                animation.beginElement();
            } else {
                animation.setAttribute('begin', 'indefinite');
                animation.endElement();
            }
        });
        
        shape2.addEventListener('click', () => {
            const animation = document.getElementById('shape2Morph');
            if (animation.getAttribute('begin') === 'indefinite') {
                animation.beginElement();
            } else {
                animation.setAttribute('begin', 'indefinite');
                animation.endElement();
            }
        });
        
        shape3.addEventListener('click', () => {
            const rotateAnim = document.getElementById('shape3Rotate');
            const morphAnim = document.getElementById('shape3Morph');
            
            if (rotateAnim.getAttribute('begin') === 'indefinite') {
                rotateAnim.beginElement();
                morphAnim.beginElement();
            } else {
                rotateAnim.setAttribute('begin', 'indefinite');
                morphAnim.setAttribute('begin', 'indefinite');
                rotateAnim.endElement();
                morphAnim.endElement();
            }
        });
        
        trees.forEach(tree => {
            tree.addEventListener('click', () => {
                const currentScale = tree.transform.baseVal.getItem(1)?.matrix.a || 1;
                
                if (currentScale < 1.5) {
                    const scaleTransform = svg.createSVGTransform();
                    scaleTransform.setScale(currentScale + 0.1, currentScale + 0.1);
                    
                    if (tree.transform.baseVal.length > 1) {
                        tree.transform.baseVal.replaceItem(scaleTransform, 1);
                    } else {
                        tree.transform.baseVal.appendItem(scaleTransform);
                    }
                } else {
                    const translateTransform = tree.transform.baseVal.getItem(0);
                    tree.transform.baseVal.clear();
                    tree.transform.baseVal.appendItem(translateTransform);
                }
            });
        });
        
        svg.addEventListener('click', createFallingStar);
    }
    
    function initializeDraggable() {
        svg.addEventListener('mousedown', startDrag);
        svg.addEventListener('mousemove', drag);
        svg.addEventListener('mouseup', endDrag);
        svg.addEventListener('mouseleave', endDrag);
        
        svg.addEventListener('touchstart', evt => {
            const touch = evt.touches[0];
            const mouseEvent = new MouseEvent('mousedown', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            startDrag(mouseEvent);
        });
        
        svg.addEventListener('touchmove', evt => {
            evt.preventDefault();
            const touch = evt.touches[0];
            const mouseEvent = new MouseEvent('mousemove', {
                clientX: touch.clientX,
                clientY: touch.clientY
            });
            drag(mouseEvent);
        });
        
        svg.addEventListener('touchend', endDrag);
        svg.addEventListener('touchcancel', endDrag);
    }
    
    playPauseBtn.addEventListener('click', togglePlayPause);
    resetBtn.addEventListener('click', resetAnimations);
    
    speedRange.addEventListener('input', () => {
        const speed = parseFloat(speedRange.value);
        speedValue.textContent = `${speed.toFixed(1)}x`;
        setAnimationSpeed(speed);
    });
    
    daySceneBtn.addEventListener('click', () => setScene('day'));
    sunsetSceneBtn.addEventListener('click', () => setScene('sunset'));
    nightSceneBtn.addEventListener('click', () => setScene('night'));
    abstractSceneBtn.addEventListener('click', () => setScene('abstract'));
    
    setupInteractions();
    initializeDraggable();
    setScene('day');
});
