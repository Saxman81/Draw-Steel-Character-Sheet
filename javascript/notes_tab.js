// Notes Tab JavaScript Functions
// Handles multi-page notes system with named tabs

let notesPages = []; // Array to store all notes pages
let currentNotesPageId = null; // Currently active page ID
let nextNotesPageId = 1; // Counter for generating unique IDs

function setupNotesTabHandlers() {
    console.log('[Notes Tab] Setting up handlers');
    
    // Set up notes page management system
    setupNotesPageManagement();
    
    // Initialize dropdown selector
    updatePageSelector();
    
    // Load existing notes pages from save data if available
    loadExistingNotesPages();
}

function saveCurrentPageContent() {
    if (!currentNotesPageId) return;
    
    // Use the correct textarea ID format
    const currentTextarea = document.getElementById(`notes-content-${currentNotesPageId}`);
    if (currentTextarea) {
        const currentPage = notesPages.find(p => p.id === currentNotesPageId);
        if (currentPage) {
            currentPage.content = currentTextarea.value;
            console.log(`[Notes Tab] Saved content for page: ${currentPage.name} (${currentTextarea.value.length} characters)`);
        }
    } else {
        console.warn(`[Notes Tab] Could not find textarea for page: ${currentNotesPageId}`);
    }
}

function setupNotesPageManagement() {
    const addPageBtn = document.getElementById('add-notes-page-btn');
    const modal = document.getElementById('notes-page-modal');
    const pageNameInput = document.getElementById('page-name-input');
    const savePageBtn = document.getElementById('save-page-btn');
    const cancelPageBtn = document.getElementById('cancel-page-btn');
    const pageSelectorBtn = document.getElementById('page-selector-btn');
    const dropdownMenu = document.getElementById('page-dropdown-menu');
    const deleteCurrentPageBtn = document.getElementById('delete-current-page-btn');
    
    if (!addPageBtn || !modal || !pageSelectorBtn || !dropdownMenu) {
        console.warn('[Notes Tab] Notes page management elements not found');
        return;
    }
    
    // Add Page button click
    addPageBtn.addEventListener('click', function() {
        showAddPageModal();
    });
    
    // Save page button click
    savePageBtn.addEventListener('click', function() {
        const pageName = pageNameInput.value.trim();
        if (pageName) {
            addNotesPage(pageName);
            hidePageModal();
        }
    });
    
    // Cancel button click
    cancelPageBtn.addEventListener('click', function() {
        hidePageModal();
    });
    
    // Enter key in input field
    pageNameInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const pageName = pageNameInput.value.trim();
            if (pageName) {
                addNotesPage(pageName);
                hidePageModal();
            }
        }
    });
    
    // Click outside modal to close
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            hidePageModal();
        }
    });
    
    // Dropdown selector click handler
    pageSelectorBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        const isOpen = dropdownMenu.style.display === 'block';
        if (isOpen) {
            closeDropdown();
        } else {
            openDropdown();
        }
    });
    
    // Delete current page button
    deleteCurrentPageBtn.addEventListener('click', function() {
        if (currentNotesPageId) {
            deleteNotesPage(currentNotesPageId);
        }
    });
    
    // Close dropdown when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('#current-page-dropdown')) {
            closeDropdown();
        }
    });
    
    // Handle dropdown menu clicks
    dropdownMenu.addEventListener('click', function(e) {
        const option = e.target.closest('.dropdown-option');
        if (option) {
            const pageId = option.dataset.pageId;
            if (pageId) {
                switchToNotesPage(pageId);
                closeDropdown();
            }
        }
    });
    
    // Setup font selector
    setupFontSelector();
    
    console.log('[Notes Tab] Notes page management initialized with dropdown interface');
}

function showAddPageModal() {
    const modal = document.getElementById('notes-page-modal');
    const pageNameInput = document.getElementById('page-name-input');
    const modalTitle = document.getElementById('modal-title');
    
    if (modal && pageNameInput && modalTitle) {
        modalTitle.textContent = 'Add New Notes Page';
        pageNameInput.value = '';
        modal.style.display = 'flex';
        setTimeout(() => pageNameInput.focus(), 100);
    }
}

function hidePageModal() {
    const modal = document.getElementById('notes-page-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function openDropdown() {
    const dropdownMenu = document.getElementById('page-dropdown-menu');
    const dropdownArrow = document.getElementById('dropdown-arrow');
    
    if (dropdownMenu && dropdownArrow) {
        dropdownMenu.style.display = 'block';
        dropdownArrow.textContent = '^';
        updateDropdownOptions();
    }
}

function closeDropdown() {
    const dropdownMenu = document.getElementById('page-dropdown-menu');
    const dropdownArrow = document.getElementById('dropdown-arrow');
    
    if (dropdownMenu && dropdownArrow) {
        dropdownMenu.style.display = 'none';
        dropdownArrow.textContent = 'v';
    }
}

function updateDropdownOptions() {
    const dropdownMenu = document.getElementById('page-dropdown-menu');
    if (!dropdownMenu) return;
    
    dropdownMenu.innerHTML = '';
    
    notesPages.forEach(page => {
        const option = document.createElement('div');
        option.className = 'dropdown-option';
        option.dataset.pageId = page.id;
        option.style.cssText = `
            padding: 0.5em 1em;
            cursor: pointer;
            border-bottom: 1px solid #555;
            color: #fff;
            ${page.id === currentNotesPageId ? 'background: #0078d4; font-weight: bold;' : ''}
        `;
        option.textContent = page.name;
        
        option.addEventListener('mouseenter', function() {
            if (page.id !== currentNotesPageId) {
                option.style.backgroundColor = '#555';
            }
        });
        
        option.addEventListener('mouseleave', function() {
            if (page.id !== currentNotesPageId) {
                option.style.backgroundColor = '';
            }
        });
        
        dropdownMenu.appendChild(option);
    });
}

function updatePageSelector() {
    const currentPageNameSpan = document.getElementById('current-page-name');
    const deleteBtn = document.getElementById('delete-current-page-btn');
    
    if (!currentPageNameSpan || !deleteBtn) return;
    
    if (notesPages.length === 0) {
        currentPageNameSpan.textContent = 'No pages';
        deleteBtn.style.display = 'none';
        closeDropdown();
    } else {
        const currentPage = notesPages.find(p => p.id === currentNotesPageId);
        if (currentPage) {
            currentPageNameSpan.textContent = currentPage.name;
            deleteBtn.style.display = 'block';
        } else {
            currentPageNameSpan.textContent = 'Select page';
            deleteBtn.style.display = 'none';
        }
    }
}

function setupFontSelector() {
    const fontSelector = document.getElementById('notes-font-selector');
    if (!fontSelector) return;
    
    // Load saved font preference
    const savedFont = localStorage.getItem('notes-font-preference') || 'inherit';
    fontSelector.value = savedFont;
    applyFontToAllTextareas(savedFont);
    
    // Handle font changes
    fontSelector.addEventListener('change', function() {
        const selectedFont = fontSelector.value;
        console.log('[Notes Tab] Font changed to:', selectedFont);
        
        // Apply to all existing textareas
        applyFontToAllTextareas(selectedFont);
        
        // Save preference
        localStorage.setItem('notes-font-preference', selectedFont);
    });
}

function applyFontToAllTextareas(fontFamily) {
    const allTextareas = document.querySelectorAll('.notes-page-content textarea');
    allTextareas.forEach(textarea => {
        textarea.style.fontFamily = fontFamily;
        
        // Adjust some other properties for better readability
        if (fontFamily === 'serif' || fontFamily.includes('Georgia') || fontFamily.includes('Garamond') || fontFamily.includes('Palatino')) {
            textarea.style.lineHeight = '1.6';
            textarea.style.fontSize = '1.05em';
        } else if (fontFamily === 'monospace') {
            textarea.style.lineHeight = '1.4';
            textarea.style.fontSize = '0.95em';
        } else {
            textarea.style.lineHeight = '1.5';
            textarea.style.fontSize = '1em';
        }
    });
}

function showDeleteConfirmation(pageName, onConfirm) {
    // Create a custom confirmation modal
    const confirmModal = document.createElement('div');
    confirmModal.id = 'delete-confirmation-modal';
    confirmModal.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0,0,0,0.8);
        z-index: 20000;
        display: flex;
        justify-content: center;
        align-items: center;
    `;
    
    confirmModal.innerHTML = `
        <div style="
            background: #333;
            border: 2px solid #666;
            border-radius: 8px;
            padding: 1.5em;
            max-width: 400px;
            width: 90%;
            text-align: center;
        ">
            <h3 style="margin-top: 0; color: #fff; margin-bottom: 1em;">Delete Page</h3>
            <p style="color: #ccc; margin-bottom: 1.5em;">
                Are you sure you want to delete the page "<strong style="color: #fff;">${pageName}</strong>"?<br>
                This cannot be undone.
            </p>
            <div style="display: flex; gap: 1em; justify-content: center;">
                <button id="confirm-delete-btn" style="
                    background: #d32f2f;
                    border: 1px solid #f44336;
                    color: #fff;
                    padding: 0.6em 1.2em;
                    border-radius: 4px;
                    cursor: pointer;
                    font-weight: bold;
                ">Delete</button>
                <button id="cancel-delete-btn" style="
                    background: #666;
                    border: 1px solid #888;
                    color: #fff;
                    padding: 0.6em 1.2em;
                    border-radius: 4px;
                    cursor: pointer;
                ">Cancel</button>
            </div>
        </div>
    `;
    
    document.body.appendChild(confirmModal);
    
    // Handle button clicks
    const confirmBtn = confirmModal.querySelector('#confirm-delete-btn');
    const cancelBtn = confirmModal.querySelector('#cancel-delete-btn');
    
    confirmBtn.addEventListener('click', function() {
        document.body.removeChild(confirmModal);
        console.log('[Notes Tab] User confirmed deletion via custom dialog');
        onConfirm();
    });
    
    cancelBtn.addEventListener('click', function() {
        document.body.removeChild(confirmModal);
        console.log('[Notes Tab] User cancelled deletion via custom dialog');
    });
    
    // Close on background click
    confirmModal.addEventListener('click', function(e) {
        if (e.target === confirmModal) {
            document.body.removeChild(confirmModal);
            console.log('[Notes Tab] User cancelled deletion by clicking outside');
        }
    });
}

function addNotesPage(pageName) {
    // Check if page name already exists
    if (notesPages.some(page => page.name === pageName)) {
        alert('A page with this name already exists. Please choose a different name.');
        return;
    }
    
    const pageId = `notes-page-${nextNotesPageId++}`;
    const newPage = {
        id: pageId,
        name: pageName,
        content: ''
    };
    
    notesPages.push(newPage);
    
    // Create content area (no tabs needed for dropdown)
    createNotesPageContent(newPage);
    
    // Switch to the new page
    switchToNotesPage(pageId);
    
    // Update the dropdown selector
    updatePageSelector();
    
    // Hide "no pages" message
    const noPagesMessage = document.getElementById('no-pages-message');
    if (noPagesMessage) {
        noPagesMessage.style.display = 'none';
    }
    
    console.log(`[Notes Tab] Added page: ${pageName}`);
    
    // Trigger auto-save
    if (window.autoSaveCharacterData) {
        window.autoSaveCharacterData();
    }
}


function createNotesPageContent(page) {
    const contentArea = document.getElementById('notes-content-area');
    if (!contentArea) return;
    
    const pageContent = document.createElement('div');
    pageContent.className = 'notes-page-content';
    pageContent.setAttribute('data-page-id', page.id);
    pageContent.style.cssText = `
        display: none;
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
    `;
    
    const textarea = document.createElement('textarea');
    textarea.id = `notes-content-${page.id}`;
    textarea.placeholder = `Enter your notes for "${page.name}" here...`;
    textarea.value = page.content;
    textarea.style.cssText = `
        width: 100%;
        height: 100%;
        background: #222;
        border: 1px solid #555;
        color: #fff;
        font-family: inherit;
        font-size: 1em;
        line-height: 1.5;
        padding: 1em;
        border-radius: 4px;
        resize: none;
    `;
    
    // Apply saved font preference to new textarea
    const savedFont = localStorage.getItem('notes-font-preference');
    if (savedFont && savedFont !== 'inherit') {
        textarea.style.fontFamily = savedFont;
        
        // Apply font-specific adjustments
        if (savedFont === 'serif' || savedFont.includes('Georgia') || savedFont.includes('Garamond') || savedFont.includes('Palatino')) {
            textarea.style.lineHeight = '1.6';
            textarea.style.fontSize = '1.05em';
        } else if (savedFont === 'monospace') {
            textarea.style.lineHeight = '1.4';
            textarea.style.fontSize = '0.95em';
        }
    }
    
    // Auto-save on content change with debouncing
    let saveTimeout;
    textarea.addEventListener('input', function() {
        // Update the page content in memory immediately
        const pageIndex = notesPages.findIndex(p => p.id === page.id);
        if (pageIndex !== -1) {
            notesPages[pageIndex].content = textarea.value;
        }
        
        // Debounced auto-save to avoid excessive saves
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            if (window.autoSaveCharacterData) {
                window.autoSaveCharacterData();
            }
        }, 1000); // Save after 1 second of no typing
    });
    
    pageContent.appendChild(textarea);
    contentArea.appendChild(pageContent);
}

function switchToNotesPage(pageId) {
    // Save current page content if it exists
    if (currentNotesPageId && currentNotesPageId !== pageId) {
        saveCurrentPageContent();
    }
    
    // Hide all page contents
    const allContents = document.querySelectorAll('.notes-page-content');
    allContents.forEach(content => {
        content.style.display = 'none';
    });
    
    // Show selected page content
    const targetContent = document.querySelector(`[data-page-id="${pageId}"].notes-page-content`);
    if (targetContent) {
        targetContent.style.display = 'block';
        
        // Focus on the textarea
        const textarea = targetContent.querySelector('textarea');
        if (textarea) {
            textarea.focus();
        }
    }
    
    // Hide "no pages" message
    const noPagesMessage = document.getElementById('no-pages-message');
    if (noPagesMessage) {
        noPagesMessage.style.display = 'none';
    }
    
    currentNotesPageId = pageId;
    
    // Update the dropdown selector to show current page
    updatePageSelector();
    
    console.log(`[Notes Tab] Switched to page: ${pageId}`);
}

function deleteNotesPage(pageId) {
    console.log(`[Notes Tab] deleteNotesPage called with ID: ${pageId}`);
    const page = notesPages.find(p => p.id === pageId);
    if (!page) {
        console.warn(`[Notes Tab] No page found with ID: ${pageId}`);
        return;
    }
    
    console.log(`[Notes Tab] Showing confirmation for page: ${page.name}`);
    
    // Use custom confirmation dialog instead of browser confirm()
    showDeleteConfirmation(page.name, function() {
        // User confirmed deletion
        console.log(`[Notes Tab] Starting deletion process for page: ${page.name}`);
        
        // Remove from array
        const originalLength = notesPages.length;
        notesPages = notesPages.filter(p => p.id !== pageId);
        console.log(`[Notes Tab] Pages array length changed from ${originalLength} to ${notesPages.length}`);
        
        // Remove content element (no tabs in dropdown system)
        const content = document.querySelector(`[data-page-id="${pageId}"].notes-page-content`);
        
        console.log(`[Notes Tab] Found content element: ${!!content}`);
        
        if (content) {
            console.log(`[Notes Tab] Removing content element`);
            content.remove();
        }
        
        // If this was the current page, switch to another or show "no pages"
        console.log(`[Notes Tab] Current page ID: ${currentNotesPageId}, deleting: ${pageId}`);
        if (currentNotesPageId === pageId) {
            if (notesPages.length > 0) {
                console.log(`[Notes Tab] Switching to first remaining page: ${notesPages[0].id}`);
                switchToNotesPage(notesPages[0].id);
            } else {
                console.log(`[Notes Tab] No pages left, showing no-pages message`);
                const noPagesMessage = document.getElementById('no-pages-message');
                if (noPagesMessage) {
                    noPagesMessage.style.display = 'flex';
                }
                currentNotesPageId = null;
                updatePageSelector();
            }
        } else {
            // Update dropdown even if we didn't switch pages
            updatePageSelector();
        }
        
        console.log(`[Notes Tab] Successfully deleted page: ${page.name}`);
        
        // Trigger auto-save
        if (window.autoSaveCharacterData) {
            console.log(`[Notes Tab] Triggering auto-save`);
            window.autoSaveCharacterData();
        }
    });
}

function loadExistingNotesPages() {
    // This will be called by the save system to restore notes pages
    console.log('[Notes Tab] Ready to load existing notes pages');
}

function getNotesTabData() {
    // Save the current page content before returning data
    saveCurrentPageContent();
    
    console.log('[Notes Tab] Collecting notes data:', {
        pagesCount: notesPages.length,
        currentPageId: currentNotesPageId,
        nextId: nextNotesPageId
    });
    
    return {
        notesPages: notesPages,
        currentNotesPageId: currentNotesPageId,
        nextNotesPageId: nextNotesPageId
    };
}

function loadNotesTabData(data) {
    console.log('[Notes Tab] Loading saved notes data:', data);
    
    // Clear existing pages
    notesPages = [];
    currentNotesPageId = null;
    
    // Clear UI content area (no tabs in dropdown system)
    const contentArea = document.getElementById('notes-content-area');
    
    if (contentArea) {
        const existingContents = contentArea.querySelectorAll('.notes-page-content');
        existingContents.forEach(content => content.remove());
    }
    
    // Load data
    if (data.notesPages && Array.isArray(data.notesPages)) {
        notesPages = data.notesPages;
        nextNotesPageId = data.nextNotesPageId || 1;
        
        console.log(`[Notes Tab] Loading ${notesPages.length} pages`);
        
        // Recreate all page content areas (no tabs needed for dropdown)
        notesPages.forEach(page => {
            createNotesPageContent(page);
        });
        
        // Switch to the previously active page or first page
        const targetPageId = data.currentNotesPageId || (notesPages.length > 0 ? notesPages[0].id : null);
        if (targetPageId && notesPages.some(p => p.id === targetPageId)) {
            switchToNotesPage(targetPageId);
        } else if (notesPages.length > 0) {
            switchToNotesPage(notesPages[0].id);
        }
    }
    
    // Update dropdown selector
    updatePageSelector();
    
    // Show/hide "no pages" message
    const noPagesMessage = document.getElementById('no-pages-message');
    if (noPagesMessage) {
        noPagesMessage.style.display = notesPages.length === 0 ? 'flex' : 'none';
    }
    
    // Handle legacy single notes field
    if (data.notes && typeof data.notes === 'string' && data.notes.trim() && notesPages.length === 0) {
        console.log('[Notes Tab] Converting legacy notes to new system');
        // Convert old single notes to a page
        const legacyPage = {
            id: 'notes-page-' + Date.now(),
            name: 'Notes',
            content: data.notes
        };
        
        notesPages.push(legacyPage);
        createNotesPageContent(legacyPage);
        switchToNotesPage(legacyPage.id);
        updatePageSelector();
        nextNotesPageId = 2;
    }
}

// Export functions for global use
window.setupNotesTabHandlers = setupNotesTabHandlers;
window.getNotesTabData = getNotesTabData;
window.loadNotesTabData = loadNotesTabData;

console.log('[Notes Tab] JavaScript module loaded');