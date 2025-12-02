// Character Sheet Save System
// Handles saving all character data to localStorage and files

function collectAllCharacterData() {
    const data = {};
    
    // Get all input elements across all tabs
    const inputs = document.querySelectorAll('input, textarea, select');
    
    inputs.forEach(input => {
        if (input.id && input.id !== 'clear-storage') {
            if (input.type === 'checkbox') {
                data[input.id] = input.checked;
            } else {
                data[input.id] = input.value;
            }
        }
    });
    
    // Handle inventory items separately as they're dynamically created
    const inventoryItems = [];
    const inventoryList = document.getElementById('inventory-list');
    if (inventoryList) {
        const items = inventoryList.querySelectorAll('.inventory-item');
        items.forEach((item, index) => {
            const itemData = {
                bonuses: {}
            };
            
            // Get basic item info
            const quantityInput = item.querySelector('input[type="number"]');
            const nameTextarea = item.querySelector('textarea[data-field="name"]');
            const descTextarea = item.querySelector('textarea[data-field="description"]');
            
            if (quantityInput) itemData.quantity = parseInt(quantityInput.value) || 1;
            if (nameTextarea) itemData.name = nameTextarea.value || '';
            if (descTextarea) itemData.description = descTextarea.value || '';
            
            // Get stat bonuses
            const bonusInputs = item.querySelectorAll('.stat-bonus');
            bonusInputs.forEach(input => {
                const stat = input.dataset.stat;
                const value = parseInt(input.value) || 0;
                if (value !== 0) {
                    itemData.bonuses[stat] = value;
                }
            });
            
            // Only save items that have a name or description
            if (itemData.name || itemData.description) {
                inventoryItems.push(itemData);
            }
        });
    }
    data.inventoryItems = inventoryItems;
    
    // Collect details tab data (skills, culture, etc.) using new system
    if (window.getDetailsTabData) {
        const detailsData = window.getDetailsTabData();
        Object.assign(data, detailsData);
    }
    
    // Collect notes tab data (multi-page notes system)
    if (window.getNotesTabData) {
        const notesData = window.getNotesTabData();
        Object.assign(data, notesData);
    }
    
    // Count checked victories
    const victoryCheckboxes = document.querySelectorAll('.victory-checkbox');
    let victoryCount = 0;
    victoryCheckboxes.forEach(checkbox => {
        if (checkbox.checked) {
            victoryCount++;
        }
    });
    data.victoryCount = victoryCount;
    
    // Add metadata
    data.lastSaved = new Date().toISOString();
    data.version = "1.0";
    
    return data;
}

function getCharacterName() {
    const nameInput = document.getElementById('character-name');
    let characterName = nameInput ? nameInput.value.trim() : '';
    
    // If no name, use a default with timestamp to make it unique
    if (!characterName) {
        const now = new Date();
        characterName = `Unnamed_Character_${now.getFullYear()}${(now.getMonth()+1).toString().padStart(2,'0')}${now.getDate().toString().padStart(2,'0')}`;
    }
    
    // Sanitize filename - remove invalid characters more thoroughly
    characterName = characterName
        .replace(/[<>:"/\\|?*\x00-\x1f]/g, '_')  // Invalid filename characters
        .replace(/\s+/g, '_')                     // Replace spaces with underscores
        .replace(/_{2,}/g, '_')                   // Replace multiple underscores with single
        .replace(/^_+|_+$/g, '');                 // Remove leading/trailing underscores
    
    // Ensure it's not empty after sanitization
    if (!characterName) {
        characterName = 'Character';
    }
    
    // Limit length to reasonable filename size
    if (characterName.length > 50) {
        characterName = characterName.substring(0, 50);
    }
    
    return characterName;
}

function saveCharacterData() {
    console.log(`[Save System] Starting character save process`);
    const data = collectAllCharacterData();
    const characterName = getCharacterName();
    
    console.log(`[Save System] Character name: "${characterName}"`);
    console.log(`[Save System] Data collected:`, Object.keys(data));
    
    // Save to TaleSpire localStorage system (like the sample code)
    saveTaleSpireCharacterData(data, characterName).then((result) => {
        TS.debug.log("Character data saved successfully");
        console.log(`[Save System] Data saved to TaleSpire localStorage successfully`);
        
        // Check if this was an update or new save based on whether we got back an existing ID
        const wasUpdate = result && result.includes('character-') && parseInt(result.split('-')[1]) < (Date.now() - 1000);
        const action = wasUpdate ? "updated" : "saved";
        showNotification(`Character "${characterName}" ${action} successfully!`, "success");
        
        // Update the saved characters list
        updateSavedCharactersList(characterName, data);
        
    }).catch(error => {
        console.error(`[Save System] Save error:`, error);
        TS.debug.log("Failed to save character data: " + error.message);
        showNotification("Failed to save character data!", "error");
    });
}

// New function that mimics the sample code's approach
async function saveTaleSpireCharacterData(characterData, characterName) {
    try {
        // Load existing data from TaleSpire localStorage
        const existingData = await TS.localStorage.global.getBlob();
        let allData = {};
        
        if (existingData) {
            allData = JSON.parse(existingData);
        }
        
        // Ensure we have a characters section
        if (!allData.characters) {
            allData.characters = {};
        }
        
        // Look for existing character with the same name
        let existingCharacterId = null;
        Object.keys(allData.characters).forEach(id => {
            if (allData.characters[id].characterName === characterName) {
                existingCharacterId = id;
            }
        });
        
        // Use existing ID or generate a new one
        const characterId = existingCharacterId || 'character-' + Date.now();
        
        // Add/update character data with metadata
        allData.characters[characterId] = {
            ...characterData,
            characterName: characterName,
            savedAt: new Date().toISOString(),
            characterId: characterId
        };
        
        // Save back to TaleSpire localStorage (like the sample code)
        await TS.localStorage.global.setBlob(JSON.stringify(allData, null, 4));
        
        const action = existingCharacterId ? 'updated' : 'created';
        console.log(`[Save System] Character ${action} with ID: ${characterId}`);
        return characterId;
        
    } catch (error) {
        console.error('[Save System] Error saving to TaleSpire localStorage:', error);
        throw error;
    }
}

// Utility function to clean up duplicate characters
async function cleanupDuplicateCharacters() {
    try {
        const existingData = await TS.localStorage.global.getBlob();
        if (!existingData) return;
        
        const allData = JSON.parse(existingData);
        if (!allData.characters) return;
        
        const characterMap = new Map(); // name -> {id, savedAt}
        const toDelete = [];
        
        // Find duplicates
        Object.keys(allData.characters).forEach(id => {
            const char = allData.characters[id];
            const name = char.characterName;
            
            if (characterMap.has(name)) {
                const existing = characterMap.get(name);
                // Keep the most recently saved version
                if (new Date(char.savedAt) > new Date(existing.savedAt)) {
                    toDelete.push(existing.id);
                    characterMap.set(name, {id, savedAt: char.savedAt});
                } else {
                    toDelete.push(id);
                }
            } else {
                characterMap.set(name, {id, savedAt: char.savedAt});
            }
        });
        
        // Delete duplicates
        toDelete.forEach(id => {
            delete allData.characters[id];
        });
        
        if (toDelete.length > 0) {
            await TS.localStorage.global.setBlob(JSON.stringify(allData, null, 4));
            console.log(`[Save System] Cleaned up ${toDelete.length} duplicate character entries`);
            showNotification(`Cleaned up ${toDelete.length} duplicate characters`, "success");
        } else {
            console.log(`[Save System] No duplicate characters found`);
        }
        
    } catch (error) {
        console.error('[Save System] Error cleaning up duplicates:', error);
    }
}

function loadCharacterFromFile(fileContent) {
    try {
        const data = JSON.parse(fileContent);
        
        // Get character name for display
        const characterName = data['character-name'] || 'Unknown Character';
        console.log(`[Load System] Loading character: ${characterName}`);
        
        // Load regular input data
        Object.keys(data).forEach(key => {
            if (key === 'inventoryItems' || key === 'lastSaved' || key === 'version' || 
                key === 'savedCharacters') {
                return; // Skip special keys
            }
            
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = data[key];
                } else {
                    element.value = data[key];
                }
                // Trigger change event to update any dependent functionality
                element.dispatchEvent(new Event('change'));
            }
        });
        
        // Load inventory items with enhanced data structure
        if (data.inventoryItems && Array.isArray(data.inventoryItems)) {
            // Clear existing inventory
            const inventoryList = document.getElementById('inventory-list');
            if (inventoryList) {
                inventoryList.innerHTML = '';
            }
            
            // Add each inventory item
            data.inventoryItems.forEach(item => {
                if (window.addInventoryItem) {
                    const itemElement = window.addInventoryItem();
                    
                    // Set basic item data
                    const quantityInput = itemElement.querySelector('input[type="number"]');
                    const nameTextarea = itemElement.querySelector('textarea[data-field="name"]');
                    const descTextarea = itemElement.querySelector('textarea[data-field="description"]');
                    
                    if (quantityInput && item.quantity !== undefined) {
                        quantityInput.value = item.quantity;
                    }
                    if (nameTextarea && item.name) {
                        nameTextarea.value = item.name;
                        if (window.autoResizeTextarea) window.autoResizeTextarea(nameTextarea);
                    }
                    if (descTextarea && item.description) {
                        descTextarea.value = item.description;
                        if (window.autoResizeTextarea) window.autoResizeTextarea(descTextarea);
                    }
                    
                    // Set stat bonuses
                    if (item.bonuses && typeof item.bonuses === 'object') {
                        Object.keys(item.bonuses).forEach(stat => {
                            const bonusInput = itemElement.querySelector(`.stat-bonus[data-stat="${stat}"]`);
                            if (bonusInput) {
                                bonusInput.value = item.bonuses[stat];
                            }
                        });
                    }
                }
            });
            
            // Recalculate bonuses after loading all items
            setTimeout(() => {
                if (window.recalculateItemBonuses) {
                    window.recalculateItemBonuses();
                }
            }, 100);
        }
        
        TS.debug.log("Character data loaded successfully");
        showNotification("Character loaded successfully!", "success");
        
    } catch (error) {
        TS.debug.log("Failed to load character data: " + error.message);
        console.error("Failed to load character data:", error);
        showNotification("Failed to load character data!", "error");
    }
}

async function getAllSavedCharacters() {
    // Get characters from TaleSpire localStorage
    return new Promise(async (resolve) => {
        try {
            const savedCharacters = [];
            
            // Load from TaleSpire global localStorage
            try {
                const existingData = await TS.localStorage.global.getBlob();
                const allData = JSON.parse(existingData || "{}");
                
                if (allData.characters) {
                    // Extract character info from each saved character
                    Object.keys(allData.characters).forEach(characterId => {
                        const charData = allData.characters[characterId];
                        savedCharacters.push({
                            id: characterId,
                            name: charData.characterName || 'Unknown Character',
                            displayName: (charData.characterName || 'Unknown Character').replace(/_/g, ' '),
                            lastSaved: charData.savedAt || new Date().toISOString(),
                            level: charData.level || 0,
                            class: charData.class || '',
                            ancestry: charData.ancestry || '',
                            subclass: charData.subclass || '',
                            career: charData.career || '',
                            data: charData // Store the full character data for loading
                        });
                    });
                    
                    // Sort by most recently saved
                    savedCharacters.sort((a, b) => new Date(b.lastSaved) - new Date(a.lastSaved));
                }
            } catch (error) {
                console.log('[Save System] Could not load character list from TaleSpire localStorage:', error);
            }
            
            resolve(savedCharacters);
        } catch (error) {
            console.error('[Save System] Error loading saved characters:', error);
            resolve([]);
        }
    });
}

// New function to scan UUID files and extract character info
// This function is kept for potential future filesystem integration
async function scanLocalStorageFiles() {
    return new Promise((resolve) => {
        resolve([]);
    });
}

// Simplified function since we're storing everything in global localStorage now
function updateSavedCharactersList(characterName, characterData) {
    console.log(`[Save System] Character tracking updated for: ${characterName}`);
    // The character is already saved in the global localStorage by saveTaleSpireCharacterData
    // This function is kept for compatibility but doesn't need to do additional work
}

function showCharacterSelectionDialog() {
    return new Promise((resolve, reject) => {
        getAllSavedCharacters().then(characters => {
            if (characters.length === 0) {
                // No saved characters, fall back to file picker
                resolve('file-picker');
                return;
            }
            
            // Create modal dialog
            const modal = document.createElement('div');
            modal.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.7);
                display: flex;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                font-family: inherit;
            `;
            
            const dialog = document.createElement('div');
            dialog.style.cssText = `
                background: var(--ts-background-primary, #2a2a2a);
                border: 2px solid var(--ts-color-outline, #555);
                border-radius: 8px;
                padding: 2em;
                max-width: 500px;
                max-height: 70vh;
                overflow-y: auto;
                color: var(--ts-color-text, #fff);
            `;
            
            dialog.innerHTML = `
                <h2 style="margin-top: 0; text-align: center; color: var(--ts-color-primary, #4CAF50);">Load Character</h2>
                <p style="text-align: center; margin-bottom: 1.5em;">Choose a character to load or select a file:</p>
                <div id="character-list" style="margin-bottom: 1.5em; max-height: 300px; overflow-y: auto;"></div>
                <div style="display: flex; gap: 1em; justify-content: center;">
                    <button id="load-from-file" style="padding: 0.5em 1em; background: #2196F3; color: white; border: none; border-radius: 4px; cursor: pointer;">Load from File</button>
                    <button id="cancel-load" style="padding: 0.5em 1em; background: #666; color: white; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
                </div>
            `;
            
            const characterList = dialog.querySelector('#character-list');
            characters
                .sort((a, b) => new Date(b.lastSaved) - new Date(a.lastSaved))
                .forEach(character => {
                    const charDiv = document.createElement('div');
                    charDiv.style.cssText = `
                        padding: 0.75em;
                        margin: 0.5em 0;
                        background: var(--ts-background-secondary, #3a3a3a);
                        border: 1px solid var(--ts-color-outline, #555);
                        border-radius: 4px;
                        cursor: pointer;
                        transition: background-color 0.2s;
                    `;
                    
                    const displayName = character.displayName || character.name.replace(/_/g, ' ');
                    const characterDetails = [
                        character.class,
                        character.ancestry,
                        character.subclass,
                        character.career
                    ].filter(Boolean).join(' ');
                    
                    charDiv.innerHTML = `
                        <div style="font-weight: bold; font-size: 1.1em;">${displayName}</div>
                        <div style="font-size: 0.9em; color: var(--ts-color-secondary, #ccc); margin-top: 0.25em;">
                            ${characterDetails}${character.level ? ` (Level ${character.level})` : ''}
                        </div>
                        <div style="font-size: 0.8em; color: var(--ts-color-secondary, #aaa); margin-top: 0.25em;">
                            Last saved: ${new Date(character.lastSaved).toLocaleDateString()} ${new Date(character.lastSaved).toLocaleTimeString()}
                        </div>
                    `;
                    
                    charDiv.addEventListener('mouseenter', () => {
                        charDiv.style.backgroundColor = 'var(--ts-color-primary, #4CAF50)';
                    });
                    
                    charDiv.addEventListener('mouseleave', () => {
                        charDiv.style.backgroundColor = 'var(--ts-background-secondary, #3a3a3a)';
                    });
                    
                    charDiv.addEventListener('click', () => {
                        document.body.removeChild(modal);
                        // Resolve with the character object so we can load directly
                        resolve(character);
                    });
                    
                    characterList.appendChild(charDiv);
                });
            
            // Event listeners for buttons
            dialog.querySelector('#load-from-file').addEventListener('click', () => {
                document.body.removeChild(modal);
                resolve('file-picker');
            });
            
            dialog.querySelector('#cancel-load').addEventListener('click', () => {
                document.body.removeChild(modal);
                reject('cancelled');
            });
            
            // Close on outside click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    document.body.removeChild(modal);
                    reject('cancelled');
                }
            });
            
            modal.appendChild(dialog);
            document.body.appendChild(modal);
        });
    });
}

function loadCharacterByName(characterName) {
    // Load character directly from TaleSpire localStorage
    console.log(`[Load System] Loading character: ${characterName}`);
    
    getAllSavedCharacters().then(characters => {
        const character = characters.find(char => char.name === characterName);
        if (character && character.data) {
            loadCharacterFromData(character.data);
        } else {
            console.error(`[Load System] Character "${characterName}" not found in saved characters`);
            showNotification(`Character "${characterName}" not found!`, "error");
        }
    }).catch(error => {
        console.error('[Load System] Error loading character:', error);
        showNotification("Failed to load character!", "error");
    });
}

function loadCharacterFromData(data) {
    try {
        // Get character name for display
        const characterName = data.characterName || data['character-name'] || 'Unknown Character';
        console.log(`[Load System] Loading character: ${characterName}`);
        
        // Load regular input data
        Object.keys(data).forEach(key => {
            if (key === 'inventoryItems' || key === 'lastSaved' || key === 'version' || 
                key === 'savedCharacters' || key === 'savedAt' || key === 'characterId') {
                return; // Skip special keys
            }
            
            const element = document.getElementById(key);
            if (element) {
                if (element.type === 'checkbox') {
                    element.checked = data[key];
                } else {
                    element.value = data[key];
                }
                // Trigger change event to update any dependent functionality
                element.dispatchEvent(new Event('change'));
            }
        });
        
        // Load inventory items
        if (data.inventoryItems && Array.isArray(data.inventoryItems)) {
            // Clear existing inventory
            const inventoryList = document.getElementById('inventory-list');
            if (inventoryList) {
                inventoryList.innerHTML = '';
            }
            
            // Add each inventory item
            data.inventoryItems.forEach(item => {
                if (window.addInventoryItem) {
                    const itemElement = window.addInventoryItem();
                    const itemInputs = itemElement.querySelectorAll('input, textarea');
                    itemInputs.forEach(input => {
                        if (input.placeholder === 'Item') {
                            input.value = item.name || '';
                        } else if (input.placeholder === 'Description') {
                            input.value = item.description || '';
                        }
                    });
                }
            });
        }
        
        // Load details tab data using new system
        if (window.loadDetailsTabData) {
            // Use a small delay to ensure the details tab is loaded
            setTimeout(() => {
                window.loadDetailsTabData(data);
            }, 100);
        }
        
        // Load notes tab data using new system
        if (window.loadNotesTabData) {
            // Use a small delay to ensure the notes tab is loaded
            setTimeout(() => {
                window.loadNotesTabData(data);
            }, 150);
        }
        
        // Restore victory count (check boxes from left to right)
        if (data.victoryCount !== undefined) {
            const victoryCheckboxes = document.querySelectorAll('.victory-checkbox');
            // First, uncheck all victories
            victoryCheckboxes.forEach(checkbox => {
                checkbox.checked = false;
            });
            // Then check the specified number from left to right
            for (let i = 0; i < Math.min(data.victoryCount, victoryCheckboxes.length); i++) {
                victoryCheckboxes[i].checked = true;
            }
            console.log(`[Load System] Restored ${data.victoryCount} victories`);
        }
        
        TS.debug.log("Character data loaded successfully");
        showNotification(`Character "${characterName}" loaded successfully!`, "success");
        
    } catch (error) {
        TS.debug.log("Failed to load character data: " + error.message);
        console.error("Failed to load character data:", error);
        showNotification("Failed to load character data!", "error");
    }
}

function showNotification(message, type = "info") {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 1em 1.5em;
        border-radius: 4px;
        color: white;
        font-weight: bold;
        z-index: 10001;
        max-width: 300px;
        font-family: inherit;
    `;
    
    switch (type) {
        case 'success':
            notification.style.background = '#4CAF50';
            break;
        case 'error':
            notification.style.background = '#f44336';
            break;
        case 'info':
        default:
            notification.style.background = '#2196F3';
            break;
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            document.body.removeChild(notification);
        }
    }, 5000);
}

function setupAutoSave() {
    // Auto-save every 30 seconds if there's been a change
    let hasUnsavedChanges = false;
    
    // Track changes
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('change', () => {
            hasUnsavedChanges = true;
        });
    });
    
    // Auto-save interval
    setInterval(() => {
        if (hasUnsavedChanges) {
            const data = collectAllCharacterData();
            const characterName = getCharacterName();
            
            // Use the same save method as manual saves (TaleSpire global localStorage)
            saveTaleSpireCharacterData(data, characterName).then(() => {
                hasUnsavedChanges = false;
                TS.debug.log("Auto-saved character data");
                console.log(`[Auto-Save] Character "${characterName}" auto-saved successfully`);
            }).catch((error) => {
                TS.debug.log("Auto-save failed: " + error.message);
                console.error('[Auto-Save] Auto-save failed:', error);
            });
        }
    }, 30000); // 30 seconds
}

function createSaveLoadUI() {
    // Find existing buttons in the main tab
    const saveButton = document.getElementById('save-character');
    const loadButton = document.getElementById('load-character');
    const fileInput = document.getElementById('load-file-input');
    
    if (saveButton) {
        saveButton.addEventListener('click', saveCharacterData);
    }
    
    if (loadButton && fileInput) {
        loadButton.addEventListener('click', () => {
            showCharacterSelectionDialog().then(result => {
                if (result === 'file-picker') {
                    // User chose to load from file
                    fileInput.click();
                } else if (result !== 'cancelled') {
                    // User selected a character object
                    if (result.data) {
                        loadCharacterFromData(result.data);
                    } else {
                        // Fallback to loading by name
                        loadCharacterByName(result.name);
                    }
                }
            }).catch(error => {
                if (error !== 'cancelled') {
                    console.error('Error in character selection:', error);
                    showNotification("Error loading character selection", "error");
                }
            });
        });
        
        fileInput.addEventListener('change', (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    loadCharacterFromFile(e.target.result);
                };
                reader.readAsText(file);
            }
        });
    }
}

// Initialize save system when DOM is ready
let saveSystemInitialized = false;
function initializeSaveSystem() {
    // Prevent multiple initializations
    if (saveSystemInitialized) {
        console.log('[Save System] Already initialized, skipping');
        return;
    }
    
    console.log('[Save System] Initializing save system');
    
    // Check if main tab is available (required for save/load UI)
    const mainTab = document.getElementById('tab-main');
    if (!mainTab || mainTab.innerHTML.trim() === '') {
        console.warn('[Save System] Main tab not ready, retrying in 200ms');
        setTimeout(initializeSaveSystem, 200);
        return;
    }
    
    // Mark as initialized before proceeding
    saveSystemInitialized = true;
    
    // Use a slight delay to ensure tabs are fully loaded
    setTimeout(() => {
        try {
            createSaveLoadUI();
            setupAutoSave();
            console.log('[Save System] Save system initialized successfully');
        } catch (error) {
            console.error('[Save System] Failed to initialize:', error);
            saveSystemInitialized = false; // Allow retry
        }
    }, 100);
}

// Export functions for use in other modules
window.saveCharacterData = saveCharacterData;
window.loadCharacterFromFile = loadCharacterFromFile;
window.collectAllCharacterData = collectAllCharacterData;
window.initializeSaveSystem = initializeSaveSystem;
window.cleanupDuplicateCharacters = cleanupDuplicateCharacters;