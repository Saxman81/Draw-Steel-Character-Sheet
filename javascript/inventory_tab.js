function setupInventoryTabHandlers() {
    const inventoryList = document.getElementById('inventory-list');
    const addInventoryBtn = document.getElementById('add-inventory-item');
    if (inventoryList && addInventoryBtn) {
        addInventoryBtn.addEventListener('click', function() {
            addInventoryItem();
        });
    }
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
        <textarea placeholder="Description / Notes" style="width: 100%; min-height: 2em; font-size: 1em; resize: vertical;" data-field="description"></textarea>
        
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
    textarea.style.height = 'auto';
    textarea.style.height = (textarea.scrollHeight) + 'px';
}

// Main function to calculate and apply all item bonuses
function recalculateItemBonuses() {
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
    // Store base values if not already stored
    if (!window.baseStatValues) {
        window.baseStatValues = {};
        Object.keys(bonuses).forEach(stat => {
            const element = document.getElementById(stat);
            if (element) {
                window.baseStatValues[stat] = parseInt(element.value) || 0;
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
    if (window.baseStatValues && window.baseStatValues.hasOwnProperty(statId)) {
        window.baseStatValues[statId] = parseInt(newValue) || 0;
        recalculateItemBonuses(); // Reapply bonuses with new base
    }
}

// Initialize the system when the page loads
let inventoryBonusSystemInitialized = false;
function initializeInventoryBonusSystem() {
    // Prevent multiple initializations
    if (inventoryBonusSystemInitialized) {
        console.log('[Inventory] Bonus system already initialized, skipping');
        return;
    }
    
    console.log('[Inventory] Initializing bonus system');
    
    // Check if required elements are available
    const inventoryList = document.getElementById('inventory-list');
    if (!inventoryList) {
        console.warn('[Inventory] Inventory list not found, retrying in 200ms');
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
            element.addEventListener('blur', function() {
                updateBaseStatValue(statId, this.value);
            });
        }
    });
    
    console.log(`[Inventory] Found ${foundStats}/${statIds.length} stat elements`);
    
    // Mark as initialized
    inventoryBonusSystemInitialized = true;
    
    // Initial calculation after a brief delay to ensure all systems are ready
    setTimeout(() => {
        console.log('[Inventory] Running initial bonus calculation');
        recalculateItemBonuses();
    }, 200);
}

window.setupInventoryTabHandlers = setupInventoryTabHandlers;
window.addInventoryItem = addInventoryItem;
window.autoResizeTextarea = autoResizeTextarea;
window.recalculateItemBonuses = recalculateItemBonuses;
window.initializeInventoryBonusSystem = initializeInventoryBonusSystem;
