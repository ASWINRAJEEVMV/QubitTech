document.addEventListener('DOMContentLoaded', () => {
    // Cloudinary configuration
    const CLOUDINARY_CLOUD_NAME = 'demo'; // Replace with your cloud name
    const CLOUDINARY_UPLOAD_PRESET = 'ml_default'; // Replace with your upload preset

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const imageInput = document.getElementById('imageInput');
    const brightnessSlider = document.getElementById('brightness');
    const contrastSlider = document.getElementById('contrast');
    const saturationSlider = document.getElementById('saturation');
    const blurSlider = document.getElementById('blur');
    const sepiaSlider = document.getElementById('sepia');
    const resetBtn = document.getElementById('resetBtn');
    const downloadBtn = document.getElementById('downloadBtn');
    const themeButtons = document.querySelectorAll('.theme-btn');
    const aiButtons = document.querySelectorAll('.ai-btn');
    const aiProgress = document.getElementById('aiProgress');
    
    // Resize controls
    const resizeWidthInput = document.getElementById('resizeWidth');
    const resizeHeightInput = document.getElementById('resizeHeight');
    const maintainAspectRatio = document.getElementById('maintainAspectRatio');
    const applyResizeBtn = document.getElementById('applyResize');

    let originalImage = null;
    let currentImage = null;
    let currentTheme = 'normal';
    let originalWidth = 0;
    let originalHeight = 0;
    let aspectRatio = 1;

    const themes = {
        normal: {
            brightness: 0,
            contrast: 0,
            saturation: 0,
            blur: 0,
            sepia: 0
        },
        vintage: {
            brightness: -10,
            contrast: 10,
            saturation: -20,
            blur: 0,
            sepia: 50
        },
        noir: {
            brightness: -10,
            contrast: 20,
            saturation: -100,
            blur: 0,
            sepia: 0
        },
        summer: {
            brightness: 10,
            contrast: 10,
            saturation: 20,
            blur: 0,
            sepia: 10
        },
        dramatic: {
            brightness: -5,
            contrast: 30,
            saturation: 10,
            blur: 1,
            sepia: 0
        }
    };

    function resetSliders() {
        const theme = themes[currentTheme];
        brightnessSlider.value = theme.brightness;
        contrastSlider.value = theme.contrast;
        saturationSlider.value = theme.saturation;
        blurSlider.value = theme.blur;
        sepiaSlider.value = theme.sepia;
    }

    function applyFilters() {
        if (!currentImage) return;

        const brightness = parseInt(brightnessSlider.value);
        const contrast = parseInt(contrastSlider.value);
        const saturation = parseInt(saturationSlider.value);
        const blur = parseInt(blurSlider.value);
        const sepia = parseInt(sepiaSlider.value);

        ctx.filter = `brightness(${100 + brightness}%) 
                     contrast(${100 + contrast}%) 
                     saturate(${100 + saturation}%) 
                     blur(${blur}px) 
                     sepia(${sepia}%)`;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(currentImage, 0, 0, canvas.width, canvas.height);
    }

    function updateActiveTheme(themeName) {
        themeButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.theme === themeName) {
                btn.classList.add('active');
            }
        });
    }

    function initializeResizeInputs(width, height) {
        originalWidth = width;
        originalHeight = height;
        aspectRatio = width / height;
        resizeWidthInput.value = width;
        resizeHeightInput.value = height;
    }

    function handleWidthChange() {
        const newWidth = parseInt(resizeWidthInput.value);
        if (maintainAspectRatio.checked && newWidth > 0) {
            resizeHeightInput.value = Math.round(newWidth / aspectRatio);
        }
    }

    function handleHeightChange() {
        const newHeight = parseInt(resizeHeightInput.value);
        if (maintainAspectRatio.checked && newHeight > 0) {
            resizeWidthInput.value = Math.round(newHeight * aspectRatio);
        }
    }

    function resizeImage() {
        const newWidth = parseInt(resizeWidthInput.value);
        const newHeight = parseInt(resizeHeightInput.value);
        
        if (newWidth <= 0 || newHeight <= 0) {
            alert('Please enter valid dimensions greater than 0');
            return;
        }

        // Create a temporary canvas for the resize operation
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = newWidth;
        tempCanvas.height = newHeight;
        const tempCtx = tempCanvas.getContext('2d');
        
        // Use better image smoothing
        tempCtx.imageSmoothingEnabled = true;
        tempCtx.imageSmoothingQuality = 'high';
        
        // Draw the original image at the new size
        tempCtx.drawImage(currentImage, 0, 0, newWidth, newHeight);
        
        // Create a new image from the resized canvas
        const resizedImage = new Image();
        resizedImage.onload = () => {
            currentImage = resizedImage;
            canvas.width = newWidth;
            canvas.height = newHeight;
            applyFilters(); // Reapply current filters to the resized image
        };
        resizedImage.src = tempCanvas.toDataURL();
    }

    async function applyAIEffect(effect) {
        if (!currentImage) return;

        // Show progress bar
        aiProgress.classList.remove('hidden');
        const button = document.querySelector(`[data-effect="${effect}"]`);
        button.classList.add('processing');

        try {
            // Convert canvas to blob
            const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/png'));
            
            // Create form data for upload
            const formData = new FormData();
            formData.append('file', blob);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
            
            // Add effect-specific transformations
            const transformations = {
                improve: 'e_improve',
                recolor: 'e_art:zorro',
                removeBackground: 'e_background_removal',
                restore: 'e_restore',
                hdr: 'e_hdr'
            };

            // Upload to Cloudinary with transformation
            const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formData
            });

            if (!response.ok) throw new Error('Upload failed');
            
            const data = await response.json();
            
            // Create new image with the enhanced version
            const enhancedImage = new Image();
            enhancedImage.crossOrigin = 'anonymous';
            enhancedImage.onload = () => {
                currentImage = enhancedImage;
                canvas.width = enhancedImage.width;
                canvas.height = enhancedImage.height;
                initializeResizeInputs(enhancedImage.width, enhancedImage.height);
                applyFilters();
                
                // Hide progress bar and reset button state
                aiProgress.classList.add('hidden');
                button.classList.remove('processing');
            };
            
            // Apply transformation and get the result
            const transformation = transformations[effect];
            enhancedImage.src = data.secure_url.replace('/upload/', `/upload/${transformation}/`);

        } catch (error) {
            console.error('AI enhancement failed:', error);
            alert('AI enhancement failed. Please try again.');
            aiProgress.classList.add('hidden');
            button.classList.remove('processing');
        }
    }

    imageInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            originalImage = new Image();
            originalImage.onload = () => {
                currentImage = originalImage;
                canvas.width = originalImage.width;
                canvas.height = originalImage.height;
                canvas.classList.remove('hidden');
                downloadBtn.classList.remove('hidden');
                currentTheme = 'normal';
                updateActiveTheme(currentTheme);
                initializeResizeInputs(originalImage.width, originalImage.height);
                resetSliders();
                applyFilters();
            };
            originalImage.src = event.target.result;
        };
        reader.readAsDataURL(file);
    });

    // Theme buttons event listeners
    themeButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            currentTheme = btn.dataset.theme;
            updateActiveTheme(currentTheme);
            resetSliders();
            applyFilters();
        });
    });

    // Slider event listeners
    brightnessSlider.addEventListener('input', applyFilters);
    contrastSlider.addEventListener('input', applyFilters);
    saturationSlider.addEventListener('input', applyFilters);
    blurSlider.addEventListener('input', applyFilters);
    sepiaSlider.addEventListener('input', applyFilters);

    // Resize event listeners
    resizeWidthInput.addEventListener('input', handleWidthChange);
    resizeHeightInput.addEventListener('input', handleHeightChange);
    applyResizeBtn.addEventListener('click', resizeImage);

    resetBtn.addEventListener('click', () => {
        currentTheme = 'normal';
        updateActiveTheme(currentTheme);
        resetSliders();
        applyFilters();
    });

    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = 'edited-image.png';
        link.href = canvas.toDataURL();
        link.click();
    });

    // Add event listeners for AI enhancement buttons
    aiButtons.forEach(button => {
        button.addEventListener('click', () => {
            const effect = button.dataset.effect;
            applyAIEffect(effect);
        });
    });
});
