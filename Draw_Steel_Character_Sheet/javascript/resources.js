function resetResources() {
    // Reset surges to 0
    const surgesInput = document.getElementById('surges-current');
    surgesInput.value = 0;
    surgesInput.dispatchEvent(new Event('change'));
    
    // Count checked victory boxes
    const victories = document.getElementById('victories');
    const checkedBoxes = victories.querySelectorAll('input[type="checkbox"]:checked').length;
    
    // Set heroic resource to number of victories
    const heroicInput = document.getElementById('heroic-current');
    heroicInput.value = checkedBoxes;
    heroicInput.dispatchEvent(new Event('change'));
    
    TS.debug.log(`Reset resources - Heroic set to ${checkedBoxes}`);
}

let trackedIds = {};

function addRandomHeroic() {
    TS.debug.log("Adding heroic resource (1-3) via d6 roll");
    const heroicInput = document.getElementById('heroic-current');
    const heroicNameInput = document.getElementById('heroic-name');
    const currentValue = parseInt(heroicInput.value) || 0;
    TS.debug.log("Current heroic value: " + currentValue);
    const resourceName = heroicNameInput.value.trim() || "Heroic Resource";
    TS.debug.log("Heroic name: " + heroicNameInput.value);
    const roll = {
        name: `${resourceName} Gain`,
        roll: "1d6"
    };
    TS.dice.putDiceInTray([roll]).then((rollId) => {
        trackedIds[rollId] = currentValue;
        TS.debug.log("Created roll with ID: " + rollId);
    }).catch(error => {
        TS.debug.log("Error creating roll: " + error);
    });
}