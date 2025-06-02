// DOM Elements
const dropArea = document.getElementById('drop-area');
const fileInput = document.getElementById('file-input');
const browseBtn = document.getElementById('browse-btn');
const fileList = document.getElementById('file-list');
const clearBtn = document.getElementById('clear-btn');
const uploadBtn = document.getElementById('upload-btn');

// Global variables
let files = [];
const maxFileSize = 5 * 1024 * 1024; // 5MB
const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 'text/plain'];

// Initialize
function init() {
    // Event listeners for drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });

    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });

    dropArea.addEventListener('drop', handleDrop, false);
    
    // Other event listeners
    browseBtn.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFiles);
    clearBtn.addEventListener('click', clearFiles);
    uploadBtn.addEventListener('click', uploadFiles);
    
    // Initial button state
    updateButtonState();
}

// Prevent default behaviors for drag events
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Highlight drop area when file is dragged over
function highlight() {
    dropArea.classList.add('highlight');
}

// Remove highlight when file leaves the drop area
function unhighlight() {
    dropArea.classList.remove('highlight');
}

// Handle dropped files
function handleDrop(e) {
    const dt = e.dataTransfer;
    const newFiles = dt.files;
    handleFiles({ target: { files: newFiles } });
}

// Process files from input or drop
function handleFiles(e) {
    const newFiles = [...e.target.files];
    
    newFiles.forEach(file => {
        // Validate file type and size
        if (!validateFile(file)) return;
        
        // Add file to array if it's not already there
        if (!files.some(f => f.name === file.name && f.size === file.size)) {
            files.push(file);
        }
    });
    
    // Reset file input
    fileInput.value = '';
    
    // Update UI
    updateFileList();
    updateButtonState();
}

// Validate file type and size
function validateFile(file) {
    // Check file size
    if (file.size > maxFileSize) {
        alert(`File too large: ${file.name} exceeds the 5MB limit`);
        return false;
    }
    
    // Check file type
    if (!allowedTypes.includes(file.type)) {
        alert(`Invalid file type: ${file.name} is not an allowed file type`);
        return false;
    }
    
    return true;
}

// Update the file list UI
function updateFileList() {
    fileList.innerHTML = '';
    
    if (files.length === 0) {
        fileList.innerHTML = '<div class="empty-message">No files uploaded yet</div>';
        return;
    }
    
    files.forEach((file, index) => {
        const fileItem = document.createElement('div');
        fileItem.className = 'file-item';
        
        // Create file preview
        const preview = document.createElement('div');
        preview.className = 'file-preview';
        
        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = URL.createObjectURL(file);
            preview.appendChild(img);
        } else {
            // Show file extension for non-images
            const ext = file.name.split('.').pop().toUpperCase();
            preview.textContent = ext;
        }
        
        // File info
        const fileInfo = document.createElement('div');
        fileInfo.className = 'file-info';
        
        const fileName = document.createElement('div');
        fileName.className = 'file-name';
        fileName.textContent = file.name;
        
        const fileSize = document.createElement('div');
        fileSize.className = 'file-size';
        fileSize.textContent = formatFileSize(file.size);
        
        const progressBar = document.createElement('div');
        progressBar.className = 'progress-bar';
        progressBar.innerHTML = '<div class="progress" data-index="' + index + '"></div>';
        
        fileInfo.appendChild(fileName);
        fileInfo.appendChild(fileSize);
        fileInfo.appendChild(progressBar);
        
        // File actions
        const fileActions = document.createElement('div');
        fileActions.className = 'file-actions';
        
        const removeBtn = document.createElement('button');
        removeBtn.className = 'remove-btn';
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', () => removeFile(index));
        
        fileActions.appendChild(removeBtn);
        
        // Assemble file item
        fileItem.appendChild(preview);
        fileItem.appendChild(fileInfo);
        fileItem.appendChild(fileActions);
        
        fileList.appendChild(fileItem);
    });
}

// Format file size to human-readable format
function formatFileSize(bytes) {
    if (bytes < 1024) return bytes + ' bytes';
    else if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    else return (bytes / 1048576).toFixed(1) + ' MB';
}

// Remove a file from the list
function removeFile(index) {
    files.splice(index, 1);
    updateFileList();
    updateButtonState();
}

// Clear all files
function clearFiles() {
    files = [];
    updateFileList();
    updateButtonState();
}

// Update button states based on files array
function updateButtonState() {
    clearBtn.disabled = files.length === 0;
    uploadBtn.disabled = files.length === 0;
}

// Simulate file upload
function uploadFiles() {
    if (files.length === 0) return;
    
    // Disable buttons during upload
    uploadBtn.disabled = true;
    clearBtn.disabled = true;
    
    // Process each file
    files.forEach((file, index) => {
        simulateUpload(file, index);
    });
}

// Simulate file upload with progress
function simulateUpload(file, index) {
    const progress = document.querySelector(`.progress[data-index="${index}"]`);
    let width = 0;
    
    // Simulate upload progress
    const interval = setInterval(() => {
        if (width >= 100) {
            clearInterval(interval);
            
            // Check if all files are uploaded
            const allUploaded = [...document.querySelectorAll('.progress')].every(p => 
                parseInt(p.style.width) === 100);
            
            if (allUploaded) {
                setTimeout(() => {
                    alert('All files uploaded successfully!');
                    clearFiles();
                }, 500);
            }
        } else {
            width += Math.random() * 10;
            if (width > 100) width = 100;
            progress.style.width = width + '%';
        }
    }, 200);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', init);
