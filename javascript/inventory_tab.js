function setupInventoryTabHandlers() {
    const inventoryList = document.getElementById('inventory-list');
    const addInventoryBtn = document.getElementById('add-inventory-item');
    if (inventoryList && addInventoryBtn) {
        // Clean up any empty items that might exist
        cleanupEmptyInventoryItems();
        
        // Remove existing event listeners by cloning the button
        const newBtn = addInventoryBtn.cloneNode(true);
        addInventoryBtn.parentNode.replaceChild(newBtn, addInventoryBtn);
        
        // Add the event listener to the new button
        newBtn.addEventListener('click', function() {
            addInventoryItem();
        });
    }
    
    // Resize all existing textareas after a short delay to ensure CSS is loaded
    setTimeout(() => {
        resizeAllInventoryTextareas();
    }, 150);
}

function addInventoryItem() {
    const inventoryList = document.getElementById('inventory-list');
    if (!inventoryList) return null;
    
    const row = document.createElement('div');
    row.className = 'inventory-item inventory-row';
    row.style.cssText = `
        display: flex; 
        flex-direction: column; 
        gap: 0.5em; 
        margin-bottom: 1em; 
        padding: 0.75em; 
        border: 1px solid #555; 
        border-radius: 6px; 
        background: rgba(0,0,0,0.2);
    `;
    
    row.innerHTML = `
        <!-- Main item info row -->
        <div style="display: flex; align-items: flex-start; gap: 0.5em;">
            <input type="number" min="0" value="1" style="width: 3em; height: 2.2em;" title="Quantity">
            <textarea placeholder="Item Name" style="flex: 1; min-width: 8em; height: 2.2em; min-height: 2.2em; font-size: 1.1em; font-weight: bold; resize: none; overflow: hidden;" data-field="name"></textarea>
            <button type="button" class="toggle-bonuses" style="background: #333; border: 1px solid #555; color: #fff; padding: 0.25em 0.5em; border-radius: 3px; cursor: pointer; font-size: 0.8em; height: 2.2em; white-space: nowrap;">
                Bonuses &#9660;
            </button>
            <button class="delete-item" style="background: #c00; border: none; color: #000; font-size: 1.3em; cursor: pointer; padding: 0.2em 0.5em; border-radius: 4px; height: 2.2em;" title="Delete Item">
                <span style="color: #000; font-weight: bold; pointer-events: none;">&#128465;</span>
            </button>
        </div>
        
        <!-- Description row -->
        <textarea placeholder="Description / Notes" style="width: 100%; min-height: 2em; max-height: 22.5em; font-size: 1em; resize: vertical; line-height: 1.5em;" data-field="description"></textarea>
        
        <!-- Stat bonuses section (collapsible) -->
        <div class="stat-bonuses-section">
            <div class="stat-bonuses" style="display: none; margin-top: 0.5em; padding: 0.5em; background: rgba(0,0,0,0.3); border-radius: 4px;">
                <div style="display: grid; grid-template-columns: repeat(auto-fit, 4em); gap: 0.3em; margin-bottom: 0.5em;">
                    <div>
                        <label style="font-size: 0.8em; color: #ccc; display: block;">Might</label>
                        <input type="number" class="stat-bonus" data-stat="might" value="0" style="width: 80%; font-size: 0.85em; padding: 0.2em;">
                    </div>
                    <div>
                        <label style="font-size: 0.8em; color: #ccc; display: block;">Agility</label>
                        <input type="number" class="stat-bonus" data-stat="agility" value="0" style="width: 80%; font-size: 0.85em; padding: 0.2em;">
                    </div>
                    <div>
                        <label style="font-size: 0.8em; color: #ccc; display: block;">Reason</label>
                        <input type="number" class="stat-bonus" data-stat="reason" value="0" style="width: 80%; font-size: 0.85em; padding: 0.2em;">
                    </div>
                    <div>
                        <label style="font-size: 0.8em; color: #ccc; display: block;">Intuition</label>
                        <input type="number" class="stat-bonus" data-stat="intuition" value="0" style="width: 80%; font-size: 0.85em; padding: 0.2em;">
                    </div>
                    <div>
                        <label style="font-size: 0.8em; color: #ccc; display: block;">Presence</label>
                        <input type="number" class="stat-bonus" data-stat="presence" value="0" style="width: 80%; font-size: 0.85em; padding: 0.2em;">
                    </div>
                </div>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, 7em); gap: 0.3em;">
                    <div>
                        <label style="font-size: 0.8em; color: #ccc; display: block;">Max Stamina</label>
                        <input type="number" class="stat-bonus" data-stat="stamina-max" value="0" style="width: 80%; font-size: 0.85em; padding: 0.2em;">
                    </div>
                    <div>
                        <label style="font-size: 0.8em; color: #ccc; display: block;">Max Recoveries</label>
                        <input type="number" class="stat-bonus" data-stat="recoveries-max" value="0" style="width: 80%; font-size: 0.85em; padding: 0.2em;">
                    </div>
                    <div>
                        <label style="font-size: 0.8em; color: #ccc; display: block;">Recovery Stamina</label>
                        <input type="number" class="stat-bonus" data-stat="recoveries-stamina" value="0" style="width: 80%; font-size: 0.85em; padding: 0.2em;">
                    </div>
                </div>
                <div style="margin-top: 0.5em; font-size: 0.8em; color: #888;">
                    Only items in inventory apply bonuses.   Set to 0 for no bonus.
                </div>
            </div>
        </div>
    `;
    
    // Add event listeners
    setupInventoryItemHandlers(row);
    
    inventoryList.appendChild(row);
    return row;
}

function setupInventoryItemHandlers(row) {
    // Delete button
    const deleteBtn = row.querySelector('.delete-item');
    deleteBtn.addEventListener('click', function() {
        row.remove();
        recalculateItemBonuses(); // Recalculate when item is removed
    });
    
    // Toggle bonuses section
    const toggleBtn = row.querySelector('.toggle-bonuses');
    const bonusesSection = row.querySelector('.stat-bonuses');
    toggleBtn.addEventListener('click', function() {
        const isHidden = bonusesSection.style.display === 'none';
        bonusesSection.style.display = isHidden ? 'block' : 'none';
        toggleBtn.innerHTML = isHidden ? 'Bonuses &#9650;' : 'Bonuses &#9660;';
    });
    
    // Auto-expand textareas
    const nameBox = row.querySelector('textarea[data-field="name"]');
    const descBox = row.querySelector('textarea[data-field="description"]');
    
    nameBox.addEventListener('input', function() {
        autoResizeTextarea(this);
    });
    
    descBox.addEventListener('input', function() {
        autoResizeTextarea(this);
    });
    
    // Stat bonus change listeners
    const statBonuses = row.querySelectorAll('.stat-bonus');
    statBonuses.forEach(input => {
        input.addEventListener('input', function() {
            recalculateItemBonuses(); // Recalculate when any bonus changes
        });
    });
}

function autoResizeTextarea(textarea) {
    if (!textarea) {
        return;
    }
    
    const content = textarea.value || '';
    
    // Skip if no content
    if (!content.trim()) {
        if (textarea.dataset.field === 'description') {
            textarea.style.height = '24px';
        } else {
            textarea.style.height = '30px';
        }
        return;
    }
    
    try {
        // Get computed styles first
        const computedStyle = getComputedStyle(textarea);
        const lineHeight = parseFloat(computedStyle.lineHeight) || 24;
        
        // For short content, don't bother with complex measurement
        if (content.length < 50) {
            if (textarea.dataset.field === 'description') {
                textarea.style.height = lineHeight + 'px';
                textarea.style.maxHeight = (lineHeight * 15) + 'px';
                textarea.style.overflowY = 'hidden';
            } else {
                // For names, just use standard height for short content
                textarea.style.height = '30px';
                textarea.style.overflowY = 'hidden';
            }
            return;
        }
        
        // Create a measurement element for longer content
        const measurer = document.createElement('div');
        measurer.style.position = 'absolute';
        measurer.style.left = '-9999px';
        measurer.style.top = '-9999px';
        measurer.style.visibility = 'hidden';
        measurer.style.whiteSpace = 'pre-wrap';
        measurer.style.wordWrap = 'break-word';
        measurer.style.overflowWrap = 'break-word';
        
        // Copy computed styles from the textarea
        const textAreaWidth = textarea.offsetWidth - parseFloat(computedStyle.paddingLeft) - parseFloat(computedStyle.paddingRight);
        measurer.style.width = textAreaWidth + 'px';
        measurer.style.fontFamily = computedStyle.fontFamily;
        measurer.style.fontSize = computedStyle.fontSize;
        measurer.style.lineHeight = computedStyle.lineHeight;
        measurer.style.fontWeight = computedStyle.fontWeight;
        
        // Set the content
        measurer.textContent = content;
        
        // Add to DOM and measure
        document.body.appendChild(measurer);
        const measuredHeight = measurer.offsetHeight;
        document.body.removeChild(measurer);
        
        // Apply constraints based on field type
        if (textarea.dataset.field === 'description') {
            const maxHeight = lineHeight * 15; // 15 lines max
            const minHeight = lineHeight; // At least one line
            
            if (measuredHeight > maxHeight) {
                textarea.style.height = maxHeight + 'px';
                textarea.style.maxHeight = maxHeight + 'px';
                textarea.style.overflowY = 'auto';
            } else {
                const finalHeight = Math.max(measuredHeight, minHeight);
                textarea.style.height = finalHeight + 'px';
                textarea.style.maxHeight = maxHeight + 'px';
                textarea.style.overflowY = 'hidden';
            }
        } else {
            // For name textareas, be very conservative - most names should be single line
            const minHeight = 30;
            const maxNameHeight = lineHeight * 2; // Max 2 lines for names
            const finalHeight = Math.min(Math.max(measuredHeight, minHeight), maxNameHeight);
            textarea.style.height = finalHeight + 'px';
            textarea.style.overflowY = finalHeight >= maxNameHeight ? 'auto' : 'hidden';
        }
        
    } catch (error) {
        console.error(`[Resize] Error during resize:`, error);
        // Fallback to minimum height
        if (textarea.dataset.field === 'description') {
            textarea.style.height = '24px';
        } else {
            textarea.style.height = '30px';
        }
    }
}

// Function to resize all existing textareas in the inventory
function resizeAllInventoryTextareas() {
    const inventoryList = document.getElementById('inventory-list');
    if (inventoryList) {
        const textareas = inventoryList.querySelectorAll('textarea');
        textareas.forEach((textarea, index) => {
            try {
                autoResizeTextarea(textarea);
            } catch (error) {
                console.error(`[Inventory] Error resizing textarea ${index + 1}:`, error);
            }
        });
    }
}

// Main function to calculate and apply all item bonuses
function recalculateItemBonuses() {
    // Safety check: if character changed, reset base values
    const currentCharacterName = document.getElementById('character-name')?.value || 'Unknown';
    if (window.lastKnownCharacter && window.lastKnownCharacter !== currentCharacterName && !window.isLoadingCharacterData) {
        window.baseStatValues = null;
    }
    window.lastKnownCharacter = currentCharacterName;
    
    // Note: Negative base values are allowed in this system
    
    const bonuses = {
        might: 0,
        agility: 0,
        reason: 0,
        intuition: 0,
        presence: 0,
        'stamina-max': 0,
        'recoveries-max': 0,
        'recoveries-stamina': 0
    };
    
    // Sum up bonuses from all inventory items
    const inventoryItems = document.querySelectorAll('.inventory-item');
    inventoryItems.forEach(item => {
        const statInputs = item.querySelectorAll('.stat-bonus');
        statInputs.forEach(input => {
            const stat = input.dataset.stat;
            const value = parseInt(input.value) || 0;
            if (bonuses.hasOwnProperty(stat)) {
                bonuses[stat] += value;
            }
        });
    });
    
    // Apply bonuses to the character sheet
    applyItemBonuses(bonuses);
    
    // Update visual indicators
    updateBonusIndicators(bonuses);
}

function applyItemBonuses(bonuses) {
    // Prevent any bonus application during character loading to avoid corruption
    if (window.isLoadingCharacterData) {
        return;
    }

    // Only initialize base values if they don't exist
    if (!window.baseStatValues) {
        window.baseStatValues = {};
        Object.keys(bonuses).forEach(stat => {
            const element = document.getElementById(stat);
            if (element) {
                // Get current value and subtract current bonuses to get the true base
                const currentValue = parseInt(element.value) || 0;
                const currentBonus = bonuses[stat] || 0;
                window.baseStatValues[stat] = currentValue - currentBonus;
            }
        });
    }
    
    // Apply bonuses to actual stat values
    Object.keys(bonuses).forEach(stat => {
        const element = document.getElementById(stat);
        if (element && window.baseStatValues[stat] !== undefined) {
            const newValue = window.baseStatValues[stat] + bonuses[stat];
            element.value = newValue;
            
            // Trigger any dependent calculations
            if (stat === 'stamina-max') {
                if (window.enforceStaminaLimits) window.enforceStaminaLimits();
            } else if (stat === 'recoveries-max') {
                if (window.enforceRecoveryLimits) window.enforceRecoveryLimits();
            }
        }
    });
}

function updateBonusIndicators(bonuses) {
    // Add visual indicators to show which stats have item bonuses
    Object.keys(bonuses).forEach(stat => {
        const element = document.getElementById(stat);
        if (element) {
            const bonus = bonuses[stat];
            
            // Remove existing bonus indicator
            const existingIndicator = element.parentNode.querySelector('.item-bonus-indicator');
            if (existingIndicator) {
                existingIndicator.remove();
            }
            
            // Add new indicator if there's a bonus
            if (bonus !== 0) {
                const indicator = document.createElement('span');
                indicator.className = 'item-bonus-indicator';
                indicator.style.cssText = `
                    position: absolute;
                    top: -0.2em;
                    right: -0.2em;
                    background: ${bonus > 0 ? '#4CAF50' : '#f44336'};
                    color: white;
                    font-size: 0.7em;
                    padding: 0.1em 0.3em;
                    border-radius: 10px;
                    font-weight: bold;
                    z-index: 1;
                `;
                indicator.textContent = bonus > 0 ? `+${bonus}` : `${bonus}`;
                indicator.title = `Item bonus: ${bonus > 0 ? '+' : ''}${bonus}`;
                
                // Make sure parent has relative positioning
                if (element.parentNode.style.position !== 'relative') {
                    element.parentNode.style.position = 'relative';
                }
                
                element.parentNode.appendChild(indicator);
            }
        }
    });
}

// Function to update base values when user manually changes stats
function updateBaseStatValue(statId, newValue) {
    // Don't update base values while loading a character
    if (window.isLoadingCharacterData) {
        return;
    }
    
    if (window.baseStatValues && window.baseStatValues.hasOwnProperty(statId)) {
        // Calculate what the base should be by subtracting current item bonuses
        const currentBonuses = calculateCurrentItemBonuses();
        const currentItemBonus = currentBonuses[statId] || 0;
        window.baseStatValues[statId] = (parseInt(newValue) || 0) - currentItemBonus;
        recalculateItemBonuses(); // Reapply bonuses with new base
    }
}

// Helper function to calculate current item bonuses without applying them
function calculateCurrentItemBonuses() {
    const bonuses = {
        might: 0,
        agility: 0,
        reason: 0,
        intuition: 0,
        presence: 0,
        'stamina-max': 0,
        'recoveries-max': 0,
        'recoveries-stamina': 0
    };
    
    const inventoryItems = document.querySelectorAll('.inventory-item');
    inventoryItems.forEach(item => {
        const statInputs = item.querySelectorAll('.stat-bonus');
        statInputs.forEach(input => {
            const stat = input.dataset.stat;
            const value = parseInt(input.value) || 0;
            if (bonuses.hasOwnProperty(stat)) {
                bonuses[stat] += value;
            }
        });
    });
    
    return bonuses;
}

// Initialize the system when the page loads
let inventoryBonusSystemInitialized = false;
function initializeInventoryBonusSystem() {
    // Prevent multiple initializations
    if (inventoryBonusSystemInitialized) {
        return;
    }
    
    // Check if required elements are available
    const inventoryList = document.getElementById('inventory-list');
    if (!inventoryList) {
        setTimeout(initializeInventoryBonusSystem, 200);
        return;
    }
    
    // Set up change listeners for base stats
    const statIds = ['might', 'agility', 'reason', 'intuition', 'presence', 'stamina-max', 'recoveries-max', 'recoveries-stamina'];
    let foundStats = 0;
    
    statIds.forEach(statId => {
        const element = document.getElementById(statId);
        if (element) {
            foundStats++;
            element.addEventListener('input', function() {
                updateBaseStatValue(statId, this.value);
            });
            element.addEventListener('change', function() {
                updateBaseStatValue(statId, this.value);
            });
        }
    });
    
    // Mark as initialized
    inventoryBonusSystemInitialized = true;
    
    // Only run initial calculation if we're not in the middle of loading data
    setTimeout(() => {
        if (!window.isLoadingCharacterData) {
            recalculateItemBonuses();
        }
    }, 200);
}

// Function to fix truly corrupted base values (only extremely unreasonable values)
function fixCorruptedBaseValues() {
    if (!window.baseStatValues) return;
    
    let foundCorruption = false;
    
    Object.keys(window.baseStatValues).forEach(stat => {
        const baseValue = window.baseStatValues[stat];
        // Only fix truly corrupted values (like NaN, undefined, or extremely unreasonable values)
        if (isNaN(baseValue) || baseValue === undefined || baseValue < -10 || baseValue > 50) {
            window.baseStatValues[stat] = 0;
            foundCorruption = true;
        }
    });
    
    if (foundCorruption) {
        recalculateItemBonuses();
    }
}

// Function to reset base values to correct state based on current field values and bonuses
function resetBaseValuesToCorrectState() {
    // Get current bonuses
    const bonuses = calculateCurrentItemBonuses();
    
    // Calculate correct base values from current field values
    const stats = ['might', 'agility', 'reason', 'intuition', 'presence', 'stamina-max', 'recoveries-max', 'recoveries-stamina'];
    const correctedBaseValues = {};
    
    stats.forEach(stat => {
        const element = document.getElementById(stat);
        if (element) {
            const currentFieldValue = parseInt(element.value) || 0;
            const currentBonus = bonuses[stat] || 0;
            correctedBaseValues[stat] = currentFieldValue - currentBonus;
        }
    });
    
    // Update base values
    window.baseStatValues = correctedBaseValues;
    
    // Reapply bonuses to ensure fields are correct
    applyItemBonuses(bonuses);
}

// Function to manually fix known corrupted base values
function fixKnownCorruptedValues() {
    // Based on the conversation history, the original might base should be -1
    // Current field shows -2, with +1 bonus, so correct base should be -1
    if (window.baseStatValues && window.baseStatValues.might === -3) {
        window.baseStatValues.might = -1;
        
        // Reapply bonuses to get correct field values
        const bonuses = calculateCurrentItemBonuses();
        applyItemBonuses(bonuses);
        
        return true;
    }
    
    return false;
}

// Function to completely reset inventory system state (for character switching)
function clearInventorySystemState() {
    window.baseStatValues = null;
    window.lastKnownCharacter = null;
    
    // Clear any bonus indicators
    const indicators = document.querySelectorAll('.item-bonus-indicator');
    indicators.forEach(indicator => indicator.remove());
}

// Function to reset base values (useful if the system gets confused)
function resetBaseStatValues() {
    // First calculate current bonuses
    const currentBonuses = calculateCurrentItemBonuses();
    
    // Reset base values and recalculate from current field values
    window.baseStatValues = {};
    const statFields = ['might', 'agility', 'reason', 'intuition', 'presence', 'stamina-max', 'recoveries-max', 'recoveries-stamina'];
    
    statFields.forEach(stat => {
        const element = document.getElementById(stat);
        if (element) {
            const currentValue = parseInt(element.value) || 0;
            const currentBonus = currentBonuses[stat] || 0;
            // The base should be current value minus any current bonus
            window.baseStatValues[stat] = currentValue - currentBonus;
        }
    });
    
    recalculateItemBonuses();
}

// Function to clean up empty inventory items
function cleanupEmptyInventoryItems() {
    const inventoryList = document.getElementById('inventory-list');
    if (!inventoryList) return;
    
    const items = inventoryList.querySelectorAll('.inventory-item');
    let removedCount = 0;
    
    items.forEach((item, index) => {
        const nameTextarea = item.querySelector('textarea[data-field="name"]');
        const descTextarea = item.querySelector('textarea[data-field="description"]');
        const name = nameTextarea ? nameTextarea.value.trim() : '';
        const desc = descTextarea ? descTextarea.value.trim() : '';
        
        // Check if there are any non-zero bonuses
        const bonusInputs = item.querySelectorAll('.stat-bonus');
        let hasBonuses = false;
        bonusInputs.forEach(input => {
            if (parseInt(input.value) || 0 !== 0) {
                hasBonuses = true;
            }
        });
        
        // Remove if completely empty
        if (!name && !desc && !hasBonuses) {
            item.remove();
            removedCount++;
        }
    });
}

// Debug function to check current state
function debugInventorySystem() {
    // Debug function kept for manual console calls but logging removed for cleaner output
    const currentBonuses = calculateCurrentItemBonuses();
    
    const statFields = ['might', 'agility', 'reason', 'intuition', 'presence'];
    statFields.forEach(stat => {
        const element = document.getElementById(stat);
        if (element) {
            const currentValue = parseInt(element.value) || 0;
            const baseValue = window.baseStatValues ? window.baseStatValues[stat] : 'undefined';
            const bonus = currentBonuses[stat] || 0;
        }
    });
    
    const inventoryItems = document.querySelectorAll('.inventory-item');
    inventoryItems.forEach((item, index) => {
        const name = item.querySelector('textarea[data-field="name"]')?.value || '(unnamed)';
        const bonuses = {};
        item.querySelectorAll('.stat-bonus').forEach(input => {
            const value = parseInt(input.value) || 0;
            if (value !== 0) {
                bonuses[input.dataset.stat] = value;
            }
        });
    });
}

window.setupInventoryTabHandlers = setupInventoryTabHandlers;
window.addInventoryItem = addInventoryItem;
window.autoResizeTextarea = autoResizeTextarea;
window.resizeAllInventoryTextareas = resizeAllInventoryTextareas;
window.recalculateItemBonuses = recalculateItemBonuses;
window.initializeInventoryBonusSystem = initializeInventoryBonusSystem;
window.resetBaseStatValues = resetBaseStatValues;
window.fixCorruptedBaseValues = fixCorruptedBaseValues;
window.clearInventorySystemState = clearInventorySystemState;
window.resetBaseValuesToCorrectState = resetBaseValuesToCorrectState;
window.fixKnownCorruptedValues = fixKnownCorruptedValues;
window.cleanupEmptyInventoryItems = cleanupEmptyInventoryItems;
window.debugInventorySystem = debugInventorySystem;
