// Shared logic (tab switching, initialization, storage, TaleSpire API hooks)
const tabLoadingStates = {
    main: false,
    details: false,
    inventory: false,
    notes: false,
    rules: false
};

function loadTabContent(tabId, fileName) {
    return new Promise((resolve, reject) => {
        console.log(`[Tab Loading] Starting load for tab: ${tabId}`);
        
        fetch(fileName)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load ${fileName}: ${response.status}`);
                }
                return response.text();
            })
            .then(html => {
                console.log(`[Tab Loading] HTML loaded for tab: ${tabId}`);
                document.getElementById('tab-' + tabId).innerHTML = html;
                
                // Initialize tab-specific handlers after DOM is ready
                return initializeTabHandlers(tabId);
            })
            .then(() => {
                tabLoadingStates[tabId] = true;
                console.log(`[Tab Loading] Completed initialization for tab: ${tabId}`);
                resolve(tabId);
            })
            .catch(error => {
                console.error(`[Tab Loading] Failed to load tab ${tabId}:`, error);
                reject(error);
            });
    });
}

function initializeTabHandlers(tabId) {
    return new Promise((resolve) => {
        console.log(`[Tab Init] Initializing handlers for tab: ${tabId}`);
        
        if (tabId === 'main' && window.setupPowerRollHandlers) {
            window.setupPowerRollHandlers();
            console.log(`[Tab Init] Power roll handlers initialized`);
        }
        
        if (tabId === 'inventory' && window.setupInventoryTabHandlers) {
            window.setupInventoryTabHandlers();
            console.log(`[Tab Init] Inventory handlers initialized`);
        }
        
        if (tabId === 'details' && window.setupDetailsTabHandlers) {
            window.setupDetailsTabHandlers();
            console.log(`[Tab Init] Details tab handlers initialized`);
        }
        
        if (tabId === 'notes' && window.setupNotesTabHandlers) {
            window.setupNotesTabHandlers();
            console.log(`[Tab Init] Notes tab handlers initialized`);
        }
        
        // Use a small delay to ensure DOM is fully ready
        setTimeout(() => {
            resolve();
        }, 50);
    });
}

function showTab(tabId) {
    console.log(`[Tab Switch] Switching to tab: ${tabId}`);
    
    document.querySelectorAll('.tab-content').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.tab-btn').forEach(el => el.classList.remove('active'));
    document.getElementById('tab-' + tabId).classList.add('active');
    document.getElementById('tab-btn-' + tabId).classList.add('active');
    
    // Load tab content if not already loaded
    if (!document.getElementById('tab-' + tabId).innerHTML.trim() && !tabLoadingStates[tabId]) {
        console.log(`[Tab Switch] Loading content for tab: ${tabId}`);
        
        const fileName = getTabFileName(tabId);
        if (fileName) {
            loadTabContent(tabId, fileName)
                .then(() => {
                    console.log(`[Tab Switch] Tab ${tabId} loaded successfully`);
                    // If this is the inventory tab, ensure bonus system is initialized
                    if (tabId === 'inventory' && window.initializeInventoryBonusSystem) {
                        setTimeout(() => window.initializeInventoryBonusSystem(), 100);
                    }
                })
                .catch(error => {
                    console.error(`[Tab Switch] Failed to load tab ${tabId}:`, error);
                });
        }
    }
}

function getTabFileName(tabId) {
    const fileMap = {
        'main': 'tabs/main_tab.html',
        'details': 'tabs/details_tab.html',
        'inventory': 'tabs/inventory_tab.html',
        'notes': 'tabs/notes_tab.html',
        'rules': 'tabs/rules_tab.html'
    };
    return fileMap[tabId];
}
// Sequential initialization system
async function initializeSheet() {
    console.log('[Initialization] Starting sequential sheet initialization');
    
    try {
        // Load essential tabs first in order of importance
        console.log('[Initialization] Loading main tab...');
        await loadTabContent('main', 'tabs/main_tab.html');
        
        console.log('[Initialization] Loading details tab...');
        await loadTabContent('details', 'tabs/details_tab.html');
        
        console.log('[Initialization] Loading inventory tab...');
        await loadTabContent('inventory', 'tabs/inventory_tab.html');
        
        // Initialize save system after core tabs are loaded
        console.log('[Initialization] Initializing save system...');
        if (typeof initializeSaveSystem === 'function') {
            await new Promise(resolve => {
                initializeSaveSystem();
                setTimeout(resolve, 100); // Allow save system to fully initialize
            });
        }
        
        // Initialize inventory bonus system after save system
        console.log('[Initialization] Initializing inventory bonus system...');
        if (window.initializeInventoryBonusSystem) {
            await new Promise(resolve => {
                window.initializeInventoryBonusSystem();
                setTimeout(resolve, 100); // Allow bonus system to fully initialize
            });
        }
        
        // Load remaining tabs in background (they're loaded on-demand anyway)
        Promise.all([
            loadTabContent('notes', 'tabs/notes_tab.html'),
            loadTabContent('rules', 'tabs/rules_tab.html')
        ]).then(() => {
            console.log('[Initialization] All background tabs loaded');
        }).catch(error => {
            console.warn('[Initialization] Some background tabs failed to load:', error);
        });
        
        // Show the main tab
        showTab('main');
        console.log('[Initialization] Sheet initialization complete');
        
    } catch (error) {
        console.error('[Initialization] Failed to initialize sheet:', error);
        // Fallback to simple initialization
        showTab('main');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    initializeSheet();
});
window.showTab = showTab;

var clearStorageButton = undefined;

function initSheetHandlers() {
    console.log('[Sheet Init] Setting up sheet handlers and inputs');
    
    // Set up power roll handlers first
    setupPowerRollHandlers();

    // Set up other inputs
    let inputs = document.querySelectorAll("input,button,textarea");
    for (let input of inputs) {
        if (input.id != undefined && input.id != "clear-storage") {
            input.addEventListener("change", function() {
                // Use new auto-save system instead of old localStorage
                if (window.autoSaveCharacterData) {
                    window.autoSaveCharacterData();
                } else {
                    // Fallback to old system if new one isn't available
                    onInputChange(input);
                }
            });

            let titleSibling = findFirstSiblingWithClass(input, "field-title");
            if (titleSibling != null) {
                titleSibling.id = `${input.id}-field-title`;
            }
            let descSibling = findFirstSiblingWithClass(input, "field-desc");
            if (descSibling != null) {
                descSibling.id = `${input.id}-field-desc`;
            }

            let finalInput = input; //otherwise the input can change which breaks the onchange handler
            if (titleSibling == null && input.dataset.modifier != undefined) {
                //manual fix for melee/ranged attack buttons being formatted differently
                titleSibling = finalInput;
                finalInput = document.getElementById(finalInput.dataset.modifier);
            }

            if (titleSibling != null && titleSibling.dataset.diceType != undefined) {
                titleSibling.classList.add("interactible-title");
                titleSibling.style.cursor = "pointer";
                titleSibling.addEventListener("click", function() {
                    TS.dice.putDiceInTray([createDiceRoll(titleSibling, finalInput)]);
                    //we are not checking for success or failure here, but could easily by adding a .then (success) and .catch (failure)
                });
                input.setAttribute("aria-labelledby", titleSibling.id);
                if (descSibling != null) {
                    input.setAttribute("aria-describedby", descSibling.id);
                }
            } else if (titleSibling != null) {
                titleSibling.setAttribute("for", input.id);
                if (descSibling != null) {
                    input.setAttribute("aria-describedby", descSibling.id);
                }
            }
        }
    }

    // Inventory tab logic
    setupInventoryTabHandlers();

    // Load default tab
    showTab('main');
}

function onInputChange(input) {
    // Legacy input change handler - now primarily used as fallback
    // The new save system handles most saving automatically
    
    console.log('[Legacy Save] Input changed:', input.id);
    
    // Only handle basic UI updates, let the new save system handle storage
    if (clearStorageButton) {
        clearStorageButton.classList.add("danger");
        clearStorageButton.disabled = false;
        clearStorageButton.textContent = "Clear Character Sheet";
    }
    
    // Handle abilities text parsing (still needed for functionality)
    if (input.id == "abilities-text") {
        let actions = parseActions(input.value);
        addActions(actions);
    }
    
    // Trigger new save system if available
    if (window.autoSaveCharacterData) {
        window.autoSaveCharacterData();
    }
}

function findFirstSiblingWithClass(element, className) {
    let siblings = element.parentElement.children;
    for (let sibling of siblings) {
        if (sibling.classList.contains(className)) {
            return sibling;
        }
    }
    return null;
}

function createDiceRoll(clickElement, inputElement) {
    let modifierString = "";
    if (clickElement.dataset.modifier != "no-mod" && inputElement != null) {
        modifierString = inputElement.value >= 0 ? "+" + inputElement.value : inputElement.value;
    }
    let label = "";
    if (clickElement.dataset.label != undefined) {
        label = clickElement.dataset.label;
    } else {
        label = clickElement.textContent;
    }
    let roll = `${clickElement.dataset.diceType}${modifierString == '+' ? '' : modifierString}`

    //this returns a roll descriptor object. we could be using TS.dice.makeRollDescriptor(`${roll}+${modifierString}`) instead
    //depends mostly on personal preference. using makeRollDescriptor can be safer through updates, but it's also less efficient
    //and would ideally need error handling on the return value (and can be rate limited)
    return { name: label, roll: roll };
}

function parseActions(text) {
    let results = text.matchAll(/(.*) (\d{0,2}d\d{1,2}[+-]?\d*) ?(.*)/gi);
    let actions = [];
    for (let result of results) {
        let action = {
            title: result[1],
            dice: result[2],
            description: result[3]
        }
        actions.push(action);
    }
    return actions;
}

function addActions(results) {
    //remove old actions
    let oldActions = document.querySelectorAll("[id^=list-action]");
    for (let oldAction of oldActions) {
        oldAction.remove();
    }

    //add new actions
    let template = document.getElementById("abilities-template");
    let container = template.parentElement;
    for (let i = 0; i < results.length; i++) {
        let clonedAction = template.content.firstElementChild.cloneNode(true);
        clonedAction.id = "list-action" + i;
        let title = clonedAction.querySelector("[id=abilities-template-title]");
        title.removeAttribute("id");
        title.textContent = results[i]["title"];

        let description = clonedAction.querySelector("[id=abilities-template-desc]");
        description.removeAttribute("id");
        description.textContent = results[i]["description"];

        let button = clonedAction.querySelector("[id=abilities-template-button]");
        button.id = "action-button" + i;
        button.dataset.diceType = results[i]["dice"];
        button.dataset.label = results[i]["title"];
        button.addEventListener("click", function() {
            TS.dice.putDiceInTray([createDiceRoll(button, null)]);
            //we are not checking for success or failure here, but could easily by adding a .then (success) and .catch (failure)
        });

        container.insertBefore(clonedAction, document.getElementById("abilities-text").parentElement);
    }
}

function loadStoredData() {
    TS.localStorage.campaign.getBlob().then((storedData) => {
        //localstorage blobs are just unstructured text.
        //this means we can store whatever we like, but we also need to parse it to use it.
        let data = JSON.parse(storedData || "{}");
        if (Object.entries(data).length > 0) {
            clearStorageButton.classList.add("danger");
            clearStorageButton.disabled = false;
            clearStorageButton.textContent = "Clear Character Sheet";
        }
        let keyCount = 0;
        for (let [key, value] of Object.entries(data)) {
            keyCount++;
            let element = document.getElementById(key);
            element.value = value;
            if (key == "thac0") {
                element.dispatchEvent(new Event('change'));
            } else if (element.type == "checkbox") {
                element.checked = value == "on" ? true : false;
            } else if (key == "abilities-text") {
                let results = parseActions(element.value);
                addActions(results);
            }
        }
        //adding some log information to the symbiote log
        //this doesn't have particular importance, but is here to show how it's done
        TS.debug.log(`Loaded ${keyCount} values from storage`);
    });
}

function clearSheet() {
    //clear stored data
    TS.localStorage.campaign.deleteBlob().then(() => {
        //if the delete succeeded (.then), set the UI to reflect that
        clearStorageButton.classList.remove("danger");
        clearStorageButton.disabled = true;
        clearStorageButton.textContent = "Character Sheet Empty";
    }).catch((deleteResponse) => {
        //if the delete failed (.catch), write a message to symbiote log
        TS.debug.log("Failed to delete local storage: " + deleteResponse.cause);
        console.error("Failed to delete local storage:", deleteResponse);
    });

    //clear sheet inputs
    let inputs = document.querySelectorAll("input,textarea");
    for (let input of inputs) {
        switch (input.type) {
            case "button":
                break;
            case "checkbox":
                input.checked = false;
                break;
            default:
                input.value = "";
                break;
        }
    }
}

function globalRollLogger(event) {
    TS.debug.log("GLOBAL LOGGER: Roll event received: " + JSON.stringify(event));
}

async function onStateChangeEvent(msg) {
    if (msg.kind == "hasInitialized") {
        console.log('[TaleSpire] TaleSpire has initialized, starting sequential setup');
        
        try {
            // Set up clear storage button first
            clearStorageButton = document.getElementById("clear-storage");
            
            // Wait for essential systems to be ready
            await waitForEssentialSystems();
            
            // Initialize core sheet functionality
            initSheetHandlers();
            
            // Load stored data after sheet is initialized
            loadStoredData();
            
            // Initialize systems in proper order after data is loaded
            await initializeSystemsSequentially();
            
            // Set up TaleSpire event handlers
            setupTaleSpireEventHandlers();
            
            console.log('[TaleSpire] Sequential initialization complete');
            
        } catch (error) {
            console.error('[TaleSpire] Failed during sequential initialization:', error);
            // Fallback to basic initialization
            fallbackInitialization();
        }
    }
}

async function waitForEssentialSystems() {
    // Wait for essential tabs to be loaded before proceeding
    const maxWaitTime = 5000; // 5 seconds max
    const startTime = Date.now();
    
    while (!tabLoadingStates.main && (Date.now() - startTime) < maxWaitTime) {
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    if (!tabLoadingStates.main) {
        console.warn('[TaleSpire] Main tab not loaded within timeout, proceeding anyway');
    }
}

async function initializeSystemsSequentially() {
    // Initialize save system first
    if (window.initializeSaveSystem) {
        console.log('[TaleSpire] Initializing save system...');
        window.initializeSaveSystem();
        await new Promise(resolve => setTimeout(resolve, 200));
    }
    
    // Initialize inventory bonus system after save system
    if (window.initializeInventoryBonusSystem) {
        console.log('[TaleSpire] Initializing inventory bonus system...');
        window.initializeInventoryBonusSystem();
        await new Promise(resolve => setTimeout(resolve, 200));
    }
}

function setupTaleSpireEventHandlers() {
    TS.onRollResult.add(handleRollResult);
    TS.debug.log("Subscribed to TS.onRollResult");
    
    if (TS.dice && TS.dice.onRollResult) {
        TS.dice.onRollResult.add(handleRollResult);
        TS.dice.onRollResult.add(globalRollLogger);
        TS.debug.log("Subscribed to TS.dice.onRollResult and global logger");
    }
    
    TS.debug.log("Initialized and subscribed to roll events");
}

function fallbackInitialization() {
    console.log('[TaleSpire] Using fallback initialization');
    clearStorageButton = document.getElementById("clear-storage");
    loadStoredData();
    initSheetHandlers();
    
    if (window.initializeSaveSystem) {
        window.initializeSaveSystem();
    }
    
    if (window.initializeInventoryBonusSystem) {
        window.initializeInventoryBonusSystem();
    }
    
    setupTaleSpireEventHandlers();
}
