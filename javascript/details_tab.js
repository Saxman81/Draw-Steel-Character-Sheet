// Details Tab JavaScript Functions
// Handles skill selection, culture, languages, and project points

// Skill categories mapping
const SKILL_CATEGORIES = {
    'Crafting': ['Alchemy', 'Architecture', 'Blacksmithing', 'Carpentry', 'Cooking', 'Fletching', 'Forgery', 'Jewelry', 'Mechanics', 'Tailoring'],
    'Exploration': ['Climb', 'Drive', 'Endurance', 'Gymnastics', 'Heal', 'Jump', 'Lift', 'Navigate', 'Ride', 'Swim'],
    'Interpersonal': ['Brag', 'Empathize', 'Flirt', 'Gamble', 'Handle Animals', 'Interrogate', 'Intimidate', 'Lead', 'Lie', 'Music', 'Performance', 'Persuade', 'Read Person'],
    'Intrigue': ['Alertness', 'Conceal Object', 'Disguise', 'Eavesdrop', 'Escape Artist', 'Hide', 'Pick Lock', 'Pick Pocket', 'Sabotage', 'Search', 'Sneak', 'Track'],
    'Lore': ['Culture', 'Criminal Underworld', 'History', 'Magic', 'Monsters', 'Nature', 'Psionics', 'Religion', 'Rumors', 'Society', 'Strategy', 'Timescape']
};

function getSkillCategory(skillName) {
    for (const [category, skills] of Object.entries(SKILL_CATEGORIES)) {
        if (skills.includes(skillName)) {
            return category;
        }
    }
    return 'Other'; // Fallback for unknown skills
}

function setupDetailsTabHandlers() {
    console.log('[Details Tab] Setting up handlers');
    
    // Set up skill management system
    setupSkillManagement();
    
    // Set up abilities management system
    setupAbilityManagement();
}

function setupSkillManagement() {
    const addSkillBtn = document.getElementById('add-skill-btn');
    const skillSelector = document.getElementById('skill-selector');
    const skillDropdown = document.getElementById('skill-dropdown');
    const addSelectedSkillBtn = document.getElementById('add-selected-skill');
    const cancelSkillBtn = document.getElementById('cancel-skill-selection');
    
    if (!addSkillBtn || !skillSelector || !skillDropdown) {
        console.warn('[Details Tab] Skill management elements not found');
        return;
    }
    
    // Clear any existing skills on initialization to prevent auto-selection
    const selectedSkills = document.getElementById('selected-skills');
    if (selectedSkills) {
        const existingSkillElements = selectedSkills.querySelectorAll('.selected-skill');
        existingSkillElements.forEach(el => el.remove());
        const existingGroups = selectedSkills.querySelectorAll('.skill-category-group');
        existingGroups.forEach(group => group.remove());
        
        // Ensure no skills message is visible
        const noSkillsMessage = document.getElementById('no-skills-message');
        if (noSkillsMessage) {
            noSkillsMessage.style.display = 'block';
        }
    }
    
    // Add Skill button click
    addSkillBtn.addEventListener('click', function() {
        showSkillSelector();
    });
    
    // Add Selected Skill button click
    addSelectedSkillBtn.addEventListener('click', function() {
        const selectedSkill = skillDropdown.value;
        if (selectedSkill) {
            addSelectedSkill(selectedSkill);
            hideSkillSelector();
        }
    });
    
    // Cancel button click
    cancelSkillBtn.addEventListener('click', function() {
        hideSkillSelector();
    });
    
    // Dropdown change event
    skillDropdown.addEventListener('change', function() {
        const addBtn = document.getElementById('add-selected-skill');
        if (addBtn) {
            addBtn.disabled = !this.value;
        }
    });
    
    // Load existing skills from save data
    loadExistingSkills();
    
    console.log('[Details Tab] Skill management initialized');
}

function showSkillSelector() {
    const skillSelector = document.getElementById('skill-selector');
    const skillDropdown = document.getElementById('skill-dropdown');
    
    if (skillSelector && skillDropdown) {
        // Update dropdown to hide already selected skills
        updateSkillDropdown();
        
        skillSelector.style.display = 'block';
        skillDropdown.focus();
    }
}

function hideSkillSelector() {
    const skillSelector = document.getElementById('skill-selector');
    const skillDropdown = document.getElementById('skill-dropdown');
    
    if (skillSelector && skillDropdown) {
        skillSelector.style.display = 'none';
        skillDropdown.value = '';
    }
}

function updateSkillDropdown() {
    const skillDropdown = document.getElementById('skill-dropdown');
    const selectedSkills = getSelectedSkillsList();
    
    if (!skillDropdown) return;
    
    // Enable all options first
    const options = skillDropdown.querySelectorAll('option[value]');
    options.forEach(option => {
        if (option.value) {
            option.disabled = selectedSkills.includes(option.value);
            option.style.display = selectedSkills.includes(option.value) ? 'none' : '';
        }
    });
}

function getSelectedSkillsList() {
    const selectedSkills = document.getElementById('selected-skills');
    const skillElements = selectedSkills ? selectedSkills.querySelectorAll('[data-skill]') : [];
    return Array.from(skillElements).map(el => el.getAttribute('data-skill'));
}

function addSelectedSkill(skillName) {
    const selectedSkills = document.getElementById('selected-skills');
    const noSkillsMessage = document.getElementById('no-skills-message');
    
    if (!selectedSkills) return;
    
    // Check if skill already exists
    if (getSelectedSkillsList().includes(skillName)) {
        console.warn(`[Details Tab] Skill ${skillName} already selected`);
        return;
    }
    
    // Hide "no skills" message
    if (noSkillsMessage) {
        noSkillsMessage.style.display = 'none';
    }
    
    // Create skill element and add it directly to maintain order
    const skillElement = createSkillElement(skillName);
    
    // Find the right place to insert it (maintaining category grouping)
    const category = getSkillCategory(skillName);
    let insertPosition = null;
    
    // Look for existing category group
    const existingCategoryGroup = selectedSkills.querySelector(`.skill-category-group[data-category="${category}"]`);
    
    if (existingCategoryGroup) {
        // Add to existing category group
        const categorySkills = existingCategoryGroup.querySelector('div:last-child');
        if (categorySkills) {
            categorySkills.appendChild(skillElement);
        }
    } else {
        // Create new category group
        const categoryGroup = document.createElement('div');
        categoryGroup.className = 'skill-category-group';
        categoryGroup.setAttribute('data-category', category);
        categoryGroup.style.cssText = `margin-bottom: 0.6em;`;
        
        // Create category header
        const categoryHeader = document.createElement('div');
        categoryHeader.style.cssText = `
            font-weight: bold;
            color: #ccc;
            margin-bottom: 0.2em;
            font-size: 0.85em;
        `;
        categoryHeader.textContent = category;
        categoryGroup.appendChild(categoryHeader);
        
        // Create skills container
        const categorySkills = document.createElement('div');
        categorySkills.style.cssText = `
            display: flex;
            flex-wrap: wrap;
            gap: 0.5em;
            margin-bottom: 0.5em;
        `;
        categorySkills.appendChild(skillElement);
        categoryGroup.appendChild(categorySkills);
        
        // Find correct position to insert category group (alphabetical)
        const existingGroups = selectedSkills.querySelectorAll('.skill-category-group');
        let insertBeforeGroup = null;
        
        for (const group of existingGroups) {
            const groupCategory = group.getAttribute('data-category');
            if (groupCategory && category < groupCategory) {
                insertBeforeGroup = group;
                break;
            }
        }
        
        if (insertBeforeGroup) {
            selectedSkills.insertBefore(categoryGroup, insertBeforeGroup);
        } else {
            selectedSkills.appendChild(categoryGroup);
        }
    }
    
    // Update dropdown to hide this skill
    updateSkillDropdown();
    
    console.log(`[Details Tab] Added skill: ${skillName}`);
    
    // Trigger auto-save if available
    if (window.autoSaveCharacterData) {
        window.autoSaveCharacterData();
    }
}

function createSkillElement(skillName) {
    const skillElement = document.createElement('div');
    skillElement.className = 'selected-skill';
    skillElement.setAttribute('data-skill', skillName);
    skillElement.style.cssText = `
        display: inline-flex;
        align-items: center;
        gap: 0.3em;
        background: rgba(70, 130, 180, 0.3);
        border: 1px solid #4682b4;
        border-radius: 4px;
        padding: 0.25em 0.4em;
        color: #fff;
        font-size: 0.9em;
        margin: 0.1em 0.2em 0.1em 0;
    `;
    
    skillElement.innerHTML = `
        <span style="margin: 0; font-weight: normal;">
            ${skillName}
        </span>
        <button type="button" class="remove-skill" data-skill="${skillName}" style="background: none; border: none; color: #ffaaaa; cursor: pointer; font-size: 1.1em; padding: 0; margin-left: 0.2em;" title="Remove skill">
            &times;
        </button>
        <input type="checkbox" name="skill" value="${skillName}" id="skill-${skillName.replace(/\s+/g, '-').toLowerCase()}" checked style="display: none;">
    `;
    
    // Add event listener for remove button
    const removeBtn = skillElement.querySelector('.remove-skill');
    removeBtn.addEventListener('click', function() {
        removeSelectedSkill(skillName);
    });
    
    return skillElement;
}

function reorganizeSkillsDisplay() {
    const selectedSkills = document.getElementById('selected-skills');
    const noSkillsMessage = document.getElementById('no-skills-message');
    
    if (!selectedSkills) return;
    
    // Get current skills list before clearing
    const currentSkills = getSelectedSkillsList();
    
    // Clear ALL skill elements and groups (but preserve no skills message)
    const existingSkillElements = selectedSkills.querySelectorAll('.selected-skill');
    existingSkillElements.forEach(el => el.remove());
    const existingGroups = selectedSkills.querySelectorAll('.skill-category-group');
    existingGroups.forEach(group => group.remove());
    
    if (currentSkills.length === 0) {
        if (noSkillsMessage) {
            noSkillsMessage.style.display = 'block';
        }
        return;
    }
    
    if (noSkillsMessage) {
        noSkillsMessage.style.display = 'none';
    }
    
    // Group skills by category
    const skillsByCategory = {};
    
    currentSkills.forEach(skillName => {
        const category = getSkillCategory(skillName);
        if (!skillsByCategory[category]) {
            skillsByCategory[category] = [];
        }
        skillsByCategory[category].push(skillName);
    });
    
    // Sort categories and skills within categories
    const sortedCategories = Object.keys(skillsByCategory).sort();
    
    sortedCategories.forEach(category => {
        // Sort skills within category alphabetically
        skillsByCategory[category].sort();
        
        // Create category group
        const categoryGroup = document.createElement('div');
        categoryGroup.className = 'skill-category-group';
        categoryGroup.style.cssText = `
            margin-bottom: 1em;
        `;
        
        // Create category header
        const categoryHeader = document.createElement('div');
        categoryHeader.style.cssText = `
            font-weight: bold;
            color: #ccc;
            margin-bottom: 0.2em;
            font-size: 0.85em;
        `;
        categoryHeader.textContent = category;
        categoryGroup.appendChild(categoryHeader);
        
        // Create skills container for this category
        const categorySkills = document.createElement('div');
        categorySkills.style.cssText = `
            display: flex;
            flex-wrap: wrap;
            gap: 0.3em;
            margin-bottom: 0.3em;
        `;
        
        // Add skills to this category
        skillsByCategory[category].forEach(skillName => {
            const skillElement = createSkillElement(skillName);
            categorySkills.appendChild(skillElement);
        });
        
        categoryGroup.appendChild(categorySkills);
        selectedSkills.appendChild(categoryGroup);
    });
    
    // Update dropdown
    updateSkillDropdown();
}

function removeSelectedSkill(skillName) {
    const selectedSkills = document.getElementById('selected-skills');
    const noSkillsMessage = document.getElementById('no-skills-message');
    
    if (!selectedSkills) return;
    
    // Find and remove the skill element
    const skillElement = selectedSkills.querySelector(`[data-skill="${skillName}"]`);
    
    if (!skillElement) return;
    
    // Find the category group this skill belongs to
    const categoryGroup = skillElement.closest('.skill-category-group');
    
    // Remove the skill element
    skillElement.remove();
    
    // If the category group is now empty, remove it
    if (categoryGroup) {
        const remainingSkills = categoryGroup.querySelectorAll('.selected-skill');
        if (remainingSkills.length === 0) {
            categoryGroup.remove();
        }
    }
    
    // Check if we need to show "no skills" message
    const remainingSkillCount = selectedSkills.querySelectorAll('.selected-skill').length;
    if (remainingSkillCount === 0 && noSkillsMessage) {
        noSkillsMessage.style.display = 'block';
    }
    
    // Update dropdown
    updateSkillDropdown();
    
    console.log(`[Details Tab] Removed skill: ${skillName}`);
    
    // Trigger auto-save if available
    if (window.autoSaveCharacterData) {
        window.autoSaveCharacterData();
    }
}

function loadExistingSkills() {
    // This function will be called when loading saved character data
    // It should restore previously selected skills
    console.log('[Details Tab] Loading existing skills (placeholder for save system integration)');
    
    // The save system will need to handle this by calling addSelectedSkill() for each saved skill
}

function getDetailsTabData() {
    // Collect all details tab data for saving
    const data = {};
    
    // Basic fields
    const culture = document.getElementById('culture');
    const languages = document.getElementById('languages');
    const projectPoints = document.getElementById('project-points');
    
    if (culture) data.culture = culture.value;
    if (languages) data.languages = languages.value;
    if (projectPoints) data['project-points'] = projectPoints.value;
    
    // Skills
    const selectedSkills = getSelectedSkillsList();
    data.skills = selectedSkills;
    
    // Individual skill checkboxes (for compatibility with existing save system)
    const skillCheckboxes = document.querySelectorAll('input[name="skill"]');
    skillCheckboxes.forEach(checkbox => {
        if (checkbox.id) {
            data[checkbox.id] = checkbox.checked;
        }
    });
    
    // Abilities
    const abilitiesData = getAbilitiesData();
    data.characterAbilities = abilitiesData.characterAbilities;
    data.nextAbilityId = abilitiesData.nextAbilityId;
    
    return data;
}

function loadDetailsTabData(data) {
    // Load details tab data from saved character
    console.log('[Details Tab] Loading saved data');
    
    // Basic fields
    const culture = document.getElementById('culture');
    const languages = document.getElementById('languages');
    const projectPoints = document.getElementById('project-points');
    
    if (culture && data.culture !== undefined) culture.value = data.culture;
    if (languages && data.languages !== undefined) languages.value = data.languages;
    if (projectPoints && data['project-points'] !== undefined) projectPoints.value = data['project-points'];
    
    // Clear existing skills first
    const selectedSkills = document.getElementById('selected-skills');
    if (selectedSkills) {
        const skillElements = selectedSkills.querySelectorAll('.selected-skill');
        skillElements.forEach(el => el.remove());
        const categoryGroups = selectedSkills.querySelectorAll('.skill-category-group');
        categoryGroups.forEach(group => group.remove());
        
        // Show no skills message initially
        const noSkillsMessage = document.getElementById('no-skills-message');
        if (noSkillsMessage) {
            noSkillsMessage.style.display = 'block';
        }
    }
    
    // Load skills from array format (new system)
    if (data.skills && Array.isArray(data.skills)) {
        data.skills.forEach(skillName => {
            addSelectedSkill(skillName);
        });
    } else {
        // Load skills from individual checkbox format (legacy compatibility)
        // Only check for explicitly saved skills, don't load all checkboxes
        Object.keys(data).forEach(key => {
            if (key.startsWith('skill-') && data[key] === true) {
                // Extract skill name from checkbox ID
                const skillNameMatch = key.match(/^skill-(.+)$/);
                if (skillNameMatch) {
                    const skillId = skillNameMatch[1];
                    // Find the corresponding skill name from the checkbox
                    const checkbox = document.getElementById(key);
                    if (checkbox && checkbox.value) {
                        addSelectedSkill(checkbox.value);
                    }
                }
            }
        });
    }
    
    // Load abilities
    loadAbilitiesData(data);
}

// Abilities Management System
let characterAbilities = [];
let nextAbilityId = 1;

function setupAbilityManagement() {
    const addAbilityBtn = document.getElementById('add-ability-btn');
    const abilityModal = document.getElementById('ability-modal');
    const saveAbilityBtn = document.getElementById('save-ability-btn');
    const cancelAbilityBtn = document.getElementById('cancel-ability-btn');
    const addDamageOptionBtn = document.getElementById('add-damage-option');
    
    if (!addAbilityBtn || !abilityModal) {
        console.warn('[Details Tab] Ability management elements not found');
        return;
    }
    
    // Add ability button click
    addAbilityBtn.addEventListener('click', function() {
        showAbilityModal();
    });
    
    // Save ability button click
    saveAbilityBtn.addEventListener('click', function() {
        saveNewAbility();
    });
    
    // Cancel button click
    cancelAbilityBtn.addEventListener('click', function() {
        hideAbilityModal();
    });
    
    // Add damage option button
    addDamageOptionBtn.addEventListener('click', function() {
        addDamageOption();
    });
    
    // Click outside modal to close
    abilityModal.addEventListener('click', function(e) {
        if (e.target === abilityModal) {
            hideAbilityModal();
        }
    });
    
    // Setup ability filters
    setupAbilityFilters();
    
    console.log('[Details Tab] Abilities management initialized');
}

let currentAbilityFilter = 'all';

function setupAbilityFilters() {
    const filterButtons = document.querySelectorAll('.ability-filter-btn');
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filterValue = button.dataset.filter;
            
            // Update active filter
            currentAbilityFilter = filterValue;
            
            // Update button states
            filterButtons.forEach(btn => {
                if (btn.dataset.filter === filterValue) {
                    btn.style.background = '#0078d4';
                    btn.style.borderColor = '#106ebe';
                } else {
                    btn.style.background = '#444';
                    btn.style.borderColor = '#666';
                }
            });
            
            // Apply filter to abilities
            filterAbilities(filterValue);
            
            console.log('[Details Tab] Filtered abilities by:', filterValue);
        });
    });
}

function filterAbilities(filterType) {
    const allAbilities = document.querySelectorAll('.selected-ability');
    let visibleCount = 0;
    
    allAbilities.forEach(abilityElement => {
        const abilityId = abilityElement.getAttribute('data-ability-id');
        const ability = characterAbilities.find(a => a.id === abilityId);
        
        if (!ability) return;
        
        let shouldShow = false;
        
        if (filterType === 'all') {
            shouldShow = true;
        } else {
            // Check if ability's action type matches the filter
            shouldShow = ability.action === filterType;
        }
        
        if (shouldShow) {
            abilityElement.style.display = 'block';
            visibleCount++;
        } else {
            abilityElement.style.display = 'none';
        }
    });
    
    // Update no abilities message
    updateNoAbilitiesMessage(visibleCount);
}

function updateNoAbilitiesMessage(visibleCount = null) {
    const noAbilitiesMessage = document.getElementById('no-abilities-message');
    if (!noAbilitiesMessage) return;
    
    if (visibleCount === null) {
        // Count visible abilities if not provided
        const visibleAbilities = document.querySelectorAll('.selected-ability[style*="display: block"], .selected-ability:not([style*="display: none"])');
        visibleCount = visibleAbilities.length;
    }
    
    if (characterAbilities.length === 0) {
        noAbilitiesMessage.textContent = 'No abilities added. Click "Add Ability" to create your first ability.';
        noAbilitiesMessage.style.display = 'block';
    } else if (visibleCount === 0 && currentAbilityFilter !== 'all') {
        noAbilitiesMessage.textContent = `No abilities found for "${currentAbilityFilter}". Try a different filter or add more abilities.`;
        noAbilitiesMessage.style.display = 'block';
    } else {
        noAbilitiesMessage.style.display = 'none';
    }
}

function showAbilityModal() {
    const modal = document.getElementById('ability-modal');
    if (modal) {
        // Clear previous inputs
        document.getElementById('ability-name-input').value = '';
        document.getElementById('ability-type-input').value = '';
        document.getElementById('ability-keywords-input').value = '';
        document.getElementById('ability-action-input').value = '';
        document.getElementById('ability-target-input').value = '';
        document.getElementById('ability-description-input').value = '';
        
        // Clear damage options
        const damageList = document.getElementById('damage-list');
        if (damageList) {
            damageList.innerHTML = '';
        }
        
        modal.style.display = 'flex';
    }
}

function hideAbilityModal() {
    const modal = document.getElementById('ability-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function addDamageOption() {
    const damageList = document.getElementById('damage-list');
    if (!damageList) return;
    
    const damageId = 'damage-' + Date.now();
    const damageDiv = document.createElement('div');
    damageDiv.className = 'damage-option';
    damageDiv.style.cssText = 'display: flex; gap: 0.5em; align-items: center; margin-bottom: 0.5em; padding: 0.5em; background: #2a2a2a; border-radius: 4px;';
    
    damageDiv.innerHTML = `
        <input type="text" placeholder="2d10 + 2" style="flex: 1; padding: 0.3em; background: #333; border: 1px solid #555; color: #fff; border-radius: 3px;">
        <input type="text" placeholder="damage" style="flex: 1; padding: 0.3em; background: #333; border: 1px solid #555; color: #fff; border-radius: 3px;">
        <button type="button" onclick="this.parentElement.remove()" style="background: #d32f2f; border: 1px solid #f44336; color: #fff; padding: 0.3em 0.6em; border-radius: 3px; cursor: pointer;">X</button>
    `;
    
    damageList.appendChild(damageDiv);
}

function saveNewAbility() {
    const name = document.getElementById('ability-name-input').value.trim();
    const type = document.getElementById('ability-type-input').value.trim();
    const keywords = document.getElementById('ability-keywords-input').value.trim();
    const action = document.getElementById('ability-action-input').value;
    const target = document.getElementById('ability-target-input').value.trim();
    const description = document.getElementById('ability-description-input').value.trim();
    
    if (!name) {
        alert('Please enter an ability name.');
        return;
    }
    
    // Collect damage options
    const damageOptions = [];
    const damageElements = document.querySelectorAll('.damage-option');
    damageElements.forEach(damageEl => {
        const inputs = damageEl.querySelectorAll('input');
        if (inputs.length >= 2 && inputs[0].value.trim()) {
            damageOptions.push({
                dice: inputs[0].value.trim(),
                type: inputs[1].value.trim() || 'damage'
            });
        }
    });
    
    const newAbility = {
        id: 'ability-' + nextAbilityId++,
        name: name,
        type: type,
        keywords: keywords,
        action: action,
        target: target,
        damage: damageOptions,
        description: description
    };
    
    characterAbilities.push(newAbility);
    displayAbility(newAbility);
    hideAbilityModal();
    updateNoAbilitiesMessage();
    
    // Trigger auto-save
    if (window.autoSaveCharacterData) {
        window.autoSaveCharacterData();
    }
    
    console.log('[Details Tab] Added new ability:', newAbility);
}

function displayAbility(ability) {
    const container = document.getElementById('selected-abilities');
    if (!container) return;
    
    const abilityDiv = document.createElement('div');
    abilityDiv.className = 'selected-ability';
    abilityDiv.setAttribute('data-ability-id', ability.id);
    abilityDiv.style.cssText = `
        border: 1px solid #555;
        border-radius: 6px;
        padding: 1em;
        margin-bottom: 1em;
        background: #2a2a2a;
        position: relative;
    `;
    
    let abilityHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 0.5em;">
            <div>
                <h4 style="margin: 0; color: #fff; font-size: 1.1em;">${ability.name}${ability.keywords ? ` (${ability.keywords})` : ''}</h4>
                <div style="color: #ccc; font-size: 0.9em; margin-top: 0.2em;">
                    ${ability.type}${ability.action ? ` | ${ability.action}` : ''}${ability.target ? ` | ${ability.target}` : ''}
                </div>
            </div>
            <button type="button" onclick="removeAbility('${ability.id}')" style="
                background: rgba(255, 100, 100, 0.3); 
                border: 1px solid #888; 
                color: #fff; 
                cursor: pointer; 
                font-size: 1.1em; 
                padding: 0.2em 0.5em; 
                border-radius: 3px;
            " title="Remove ability">X</button>
        </div>
    `;
    
    // Add damage options if any
    if (ability.damage && ability.damage.length > 0) {
        abilityHTML += '<div style="margin-bottom: 0.5em;">';
        ability.damage.forEach((dmg, index) => {
            const bgColor = index === 0 ? '#1a4a1a' : (index === 1 ? '#4a4a1a' : '#4a1a1a');
            abilityHTML += `
                <div style="display: inline-block; background: ${bgColor}; border: 1px solid #555; border-radius: 3px; padding: 0.3em 0.6em; margin-right: 0.5em; margin-bottom: 0.3em; font-size: 0.9em;">
                    <strong>${dmg.dice}</strong> ${dmg.type}
                </div>
            `;
        });
        abilityHTML += '</div>';
    }
    
    // Add description if provided
    if (ability.description) {
        abilityHTML += `<div style="color: #ddd; font-size: 0.9em; line-height: 1.4; font-style: italic;">${ability.description}</div>`;
    }
    
    abilityDiv.innerHTML = abilityHTML;
    container.appendChild(abilityDiv);
    
    // Apply current filter to new ability
    if (currentAbilityFilter !== 'all' && ability.action !== currentAbilityFilter) {
        abilityDiv.style.display = 'none';
    }
}

function removeAbility(abilityId) {
    // Remove from array
    characterAbilities = characterAbilities.filter(ability => ability.id !== abilityId);
    
    // Remove from DOM
    const abilityElement = document.querySelector(`[data-ability-id="${abilityId}"]`);
    if (abilityElement) {
        abilityElement.remove();
    }
    
    // Reapply current filter after removal
    filterAbilities(currentAbilityFilter);
    
    // Trigger auto-save
    if (window.autoSaveCharacterData) {
        window.autoSaveCharacterData();
    }
    
    console.log('[Details Tab] Removed ability:', abilityId);
}

function getAbilitiesData() {
    return {
        characterAbilities: characterAbilities,
        nextAbilityId: nextAbilityId
    };
}

function loadAbilitiesData(data) {
    if (data.characterAbilities && Array.isArray(data.characterAbilities)) {
        characterAbilities = data.characterAbilities;
        nextAbilityId = data.nextAbilityId || 1;
        
        // Clear existing display
        const container = document.getElementById('selected-abilities');
        if (container) {
            const existingAbilities = container.querySelectorAll('.selected-ability');
            existingAbilities.forEach(el => el.remove());
        }
        
        // Display loaded abilities
        characterAbilities.forEach(ability => {
            displayAbility(ability);
        });
        
        // Apply current filter
        filterAbilities(currentAbilityFilter);
        console.log('[Details Tab] Loaded abilities:', characterAbilities.length);
    }
}

// Export functions for global use
window.setupDetailsTabHandlers = setupDetailsTabHandlers;
window.getDetailsTabData = getDetailsTabData;
window.loadDetailsTabData = loadDetailsTabData;
window.addSelectedSkill = addSelectedSkill;
window.removeSelectedSkill = removeSelectedSkill;
window.removeAbility = removeAbility;
window.getAbilitiesData = getAbilitiesData;
window.loadAbilitiesData = loadAbilitiesData;

console.log('[Details Tab] JavaScript module loaded');
