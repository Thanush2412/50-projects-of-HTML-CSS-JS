const markdownInput = document.getElementById('markdown-input');
const previewOutput = document.getElementById('preview-output');
const clearBtn = document.getElementById('clear-btn');
const copyBtn = document.getElementById('copy-btn');
const saveBtn = document.getElementById('save-btn');
const loadBtn = document.getElementById('load-btn');
const expandEditorBtn = document.getElementById('expand-editor');
const expandPreviewBtn = document.getElementById('expand-preview');
const helpButtons = document.querySelectorAll('.help-buttons button');
const savedList = document.getElementById('saved-list');
const modal = document.getElementById('modal');
const closeModal = document.querySelector('.close');
const documentNameInput = document.getElementById('document-name');
const confirmSaveBtn = document.getElementById('confirm-save');
const alertElement = document.getElementById('alert');

let savedDocuments = JSON.parse(localStorage.getItem('markdownDocuments')) || [];

// Help snippets for markdown reference
const helpSnippets = {
    headings: "# Heading 1\n## Heading 2\n### Heading 3\n#### Heading 4\n##### Heading 5\n###### Heading 6",
    
    formatting: "**Bold text**\n*Italic text*\n~~Strikethrough~~\n**_Bold and italic_**\n\n> Blockquote text\n\n---\nHorizontal rule above",
    
    lists: "- Unordered list item\n- Another item\n  - Nested item\n  - Another nested item\n\n1. Ordered list item\n2. Second item\n3. Third item\n\n- [x] Task list item (completed)\n- [ ] Task list item (not completed)",
    
    links: "[Link text](https://www.example.com)\n[Link with title](https://www.example.com \"Title on hover\")\n\n![Image alt text](https://via.placeholder.com/150)\n![Image with title](https://via.placeholder.com/150 \"Image title\")",
    
    code: "Inline `code` example\n\n```javascript\n// Code block with syntax highlighting\nfunction example() {\n    console.log(\"Hello, world!\");\n    return true;\n}\n```\n\n```html\n<!-- HTML example -->\n<div class=\"example\">\n    <p>Sample HTML</p>\n</div>\n```\n\n| Table | Header | Example |\n|-------|--------|--------|\n| Cell  | Cell   | Cell   |\n| Data  | Data   | Data   |"
};

function renderMarkdown() {
    const markdownText = markdownInput.value;
    try {
        // Configure marked options for better rendering
        marked.setOptions({
            breaks: true,           // Add line breaks on single line breaks
            gfm: true,              // Use GitHub Flavored Markdown
            headerIds: true,        // Generate IDs for headings
            mangle: false,          // Don't escape HTML in output
            smartLists: true,       // Use smarter list behavior
            smartypants: true,      // Use smart typography
            xhtml: false            // Don't use self-closing tags
        });
        
        const htmlOutput = marked.parse(markdownText);
        const sanitizedHtml = DOMPurify.sanitize(htmlOutput, {
            ADD_ATTR: ['target']   // Allow target attribute for links
        });
        previewOutput.innerHTML = sanitizedHtml;
        
        // Make all links open in new tab
        const links = previewOutput.querySelectorAll('a');
        links.forEach(link => {
            if (link.getAttribute('href') && link.getAttribute('href').startsWith('http')) {
                link.setAttribute('target', '_blank');
                link.setAttribute('rel', 'noopener noreferrer');
            }
        });
    } catch (error) {
        console.error('Error rendering markdown:', error);
        previewOutput.innerHTML = '<div class="error">Error rendering markdown</div>';
    }
}

function updateSavedDocumentsList() {
    savedList.innerHTML = '';
    
    if (savedDocuments.length === 0) {
        const emptyMessage = document.createElement('p');
        emptyMessage.textContent = 'No saved documents yet.';
        savedList.appendChild(emptyMessage);
        return;
    }
    
    savedDocuments.forEach((doc, index) => {
        const li = document.createElement('li');
        
        const nameSpan = document.createElement('span');
        nameSpan.textContent = doc.name;
        
        const buttonsDiv = document.createElement('div');
        
        const loadButton = document.createElement('button');
        loadButton.innerHTML = '<i class="fas fa-file-import"></i>';
        loadButton.title = 'Load document';
        loadButton.addEventListener('click', () => loadDocument(index));
        
        const deleteButton = document.createElement('button');
        deleteButton.innerHTML = '<i class="fas fa-trash"></i>';
        deleteButton.title = 'Delete document';
        deleteButton.addEventListener('click', () => deleteDocument(index));
        
        buttonsDiv.appendChild(loadButton);
        buttonsDiv.appendChild(deleteButton);
        
        li.appendChild(nameSpan);
        li.appendChild(buttonsDiv);
        
        savedList.appendChild(li);
    });
}

function showAlert(message) {
    alertElement.textContent = message;
    alertElement.classList.add('show');
    
    setTimeout(() => {
        alertElement.classList.remove('show');
    }, 3000);
}

function clearEditor() {
    markdownInput.value = '';
    renderMarkdown();
}

function copyHtml() {
    const htmlOutput = previewOutput.innerHTML;
    
    navigator.clipboard.writeText(htmlOutput)
        .then(() => {
            showAlert('HTML copied to clipboard!');
        })
        .catch(() => {
            const textarea = document.createElement('textarea');
            textarea.value = htmlOutput;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            showAlert('HTML copied to clipboard!');
        });
}

function openSaveModal() {
    documentNameInput.value = '';
    modal.style.display = 'block';
}

function saveDocument() {
    const name = documentNameInput.value.trim();
    
    if (!name) {
        showAlert('Please enter a document name');
        return;
    }
    
    const content = markdownInput.value;
    const timestamp = new Date().toISOString();
    
    const existingIndex = savedDocuments.findIndex(doc => doc.name === name);
    
    if (existingIndex !== -1) {
        // Ask for confirmation before overwriting
        if (confirm(`A document named "${name}" already exists. Do you want to overwrite it?`)) {
            savedDocuments[existingIndex] = { name, content, timestamp };
        } else {
            return; // User canceled overwrite
        }
    } else {
        savedDocuments.push({ name, content, timestamp });
    }
    
    localStorage.setItem('markdownDocuments', JSON.stringify(savedDocuments));
    updateSavedDocumentsList();
    modal.style.display = 'none';
    showAlert('Document saved successfully!');
}

function loadDocument(index) {
    if (index >= 0 && index < savedDocuments.length) {
        markdownInput.value = savedDocuments[index].content;
        renderMarkdown();
        showAlert('Document loaded!');
    }
}

function deleteDocument(index) {
    if (index >= 0 && index < savedDocuments.length) {
        const documentName = savedDocuments[index].name;
        savedDocuments.splice(index, 1);
        localStorage.setItem('markdownDocuments', JSON.stringify(savedDocuments));
        updateSavedDocumentsList();
        showAlert(`Document "${documentName}" deleted!`);
    }
}

function insertHelpSnippet(snippetName) {
    if (helpSnippets[snippetName]) {
        // Get current cursor position
        const cursorPos = markdownInput.selectionStart;
        const textBefore = markdownInput.value.substring(0, cursorPos);
        const textAfter = markdownInput.value.substring(cursorPos);
        
        // Add a newline before snippet if not at beginning of text and previous character isn't already a newline
        const needsNewlineBefore = cursorPos > 0 && textBefore.charAt(textBefore.length - 1) !== '\n' ? '\n' : '';
        // Add a newline after snippet if next character isn't already a newline
        const needsNewlineAfter = textAfter.length > 0 && textAfter.charAt(0) !== '\n' ? '\n' : '';
        
        // Insert the snippet at cursor position
        const snippet = needsNewlineBefore + helpSnippets[snippetName] + needsNewlineAfter;
        markdownInput.value = textBefore + snippet + textAfter;
        
        // Update cursor position to end of inserted snippet
        const newPosition = cursorPos + snippet.length;
        markdownInput.selectionStart = markdownInput.selectionEnd = newPosition;
        
        // Focus back on the textarea and render markdown
        markdownInput.focus();
        renderMarkdown();
        
        // Auto-resize textarea if needed
        if (typeof autoResizeTextarea === 'function') {
            autoResizeTextarea();
        }
    }
}

function togglePanelExpansion(panelToExpand) {
    const editorPanel = document.querySelector('.panel:first-child');
    const previewPanel = document.querySelector('.panel:last-child');
    
    if (panelToExpand === 'editor') {
        // If editor is already expanded, restore both panels
        if (editorPanel.classList.contains('expanded')) {
            editorPanel.classList.remove('expanded');
            previewPanel.classList.remove('hidden');
            expandEditorBtn.innerHTML = '<i class="fas fa-expand"></i>';
        } else {
            // Expand editor, hide preview
            editorPanel.classList.add('expanded');
            previewPanel.classList.add('hidden');
            expandEditorBtn.innerHTML = '<i class="fas fa-compress"></i>';
            // Make sure preview is not expanded
            previewPanel.classList.remove('expanded');
            expandPreviewBtn.innerHTML = '<i class="fas fa-expand"></i>';
        }
    } else if (panelToExpand === 'preview') {
        // If preview is already expanded, restore both panels
        if (previewPanel.classList.contains('expanded')) {
            previewPanel.classList.remove('expanded');
            editorPanel.classList.remove('hidden');
            expandPreviewBtn.innerHTML = '<i class="fas fa-expand"></i>';
        } else {
            // Expand preview, hide editor
            previewPanel.classList.add('expanded');
            editorPanel.classList.add('hidden');
            expandPreviewBtn.innerHTML = '<i class="fas fa-compress"></i>';
            // Make sure editor is not expanded
            editorPanel.classList.remove('expanded');
            expandEditorBtn.innerHTML = '<i class="fas fa-expand"></i>';
        }
    }
    
    // Force re-render of markdown when changing views
    renderMarkdown();
}

// Main editor functionality
markdownInput.addEventListener('input', renderMarkdown);
markdownInput.addEventListener('keydown', (e) => {
    // Allow tab key for indentation in the editor
    if (e.key === 'Tab') {
        e.preventDefault();
        const start = markdownInput.selectionStart;
        const end = markdownInput.selectionEnd;
        
        // Insert tab character at cursor position
        markdownInput.value = markdownInput.value.substring(0, start) + '    ' + markdownInput.value.substring(end);
        
        // Move cursor after the inserted tab
        markdownInput.selectionStart = markdownInput.selectionEnd = start + 4;
        
        // Update preview
        renderMarkdown();
    }
});

// Button event listeners
clearBtn.addEventListener('click', clearEditor);
copyBtn.addEventListener('click', copyHtml);
saveBtn.addEventListener('click', openSaveModal);
loadBtn.addEventListener('click', () => {
    if (savedDocuments.length === 0) {
        showAlert('No saved documents available');
    }
});

expandEditorBtn.addEventListener('click', () => togglePanelExpansion('editor'));
expandPreviewBtn.addEventListener('click', () => togglePanelExpansion('preview'));

// Set up help button event listeners
document.getElementById('help-headings').addEventListener('click', () => insertHelpSnippet('headings'));
document.getElementById('help-formatting').addEventListener('click', () => insertHelpSnippet('formatting'));
document.getElementById('help-lists').addEventListener('click', () => insertHelpSnippet('lists'));
document.getElementById('help-links').addEventListener('click', () => insertHelpSnippet('links'));
document.getElementById('help-code').addEventListener('click', () => insertHelpSnippet('code'));

closeModal.addEventListener('click', () => {
    modal.style.display = 'none';
});

confirmSaveBtn.addEventListener('click', saveDocument);

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Add keyboard shortcuts
window.addEventListener('keydown', (e) => {
    // Ctrl/Cmd + S to save
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        openSaveModal();
    }
    
    // Ctrl/Cmd + C to copy HTML when preview is focused
    if ((e.ctrlKey || e.metaKey) && e.key === 'c' && document.activeElement === previewOutput) {
        e.preventDefault();
        copyHtml();
    }
});

// Handle textarea auto-resize
function autoResizeTextarea() {
    // Reset height to auto to get the correct scrollHeight
    markdownInput.style.height = 'auto';
    // Set the height to match content (minus padding)
    markdownInput.style.height = (markdownInput.scrollHeight) + 'px';
}

// Initialize the application
window.addEventListener('load', () => {
    updateSavedDocumentsList();
    
    // Start with a blank editor
    markdownInput.value = '';
    renderMarkdown();
    
    // Set focus to the editor
    setTimeout(() => {
        markdownInput.focus();
    }, 100);
});
