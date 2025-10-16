function setupPowerRollHandlers() {
    // Set up stat checkbox exclusive selection
    const statCheckboxes = document.querySelectorAll('.power-stat');
    statCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                // Uncheck all other stat checkboxes
                statCheckboxes.forEach(otherBox => {
                    if (otherBox !== this) {
                        otherBox.checked = false;
                    }
                });
            }
        });
    });

    // Set up edge/bane checkbox exclusive selection
    const modifierCheckboxes = document.querySelectorAll('.power-modifier');
    modifierCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            if (this.checked) {
                // Uncheck the other modifier checkbox
                modifierCheckboxes.forEach(otherBox => {
                    if (otherBox !== this) {
                        otherBox.checked = false;
                    }
                });
            }
        });
    });

    // Set up power roll button
    const powerRollButton = document.getElementById('power-roll');
    if (powerRollButton) {
        powerRollButton.addEventListener('click', performPowerRoll);
    }
}


function performPowerRoll() {
    // Get the selected stat value if any
    const selectedStat = document.querySelector('.power-stat:checked');
    let statModifier = 0;
    let statName = '';
    if (selectedStat) {
        const statId = selectedStat.id.split('-')[0]; // e.g., "might" from "might-power"
        statModifier = parseInt(document.getElementById(statId).value) || 0;
        statName = statId.charAt(0).toUpperCase() + statId.slice(1); // Capitalize first letter
    }

    // Check for edge/bane
    const hasEdge = document.getElementById('edge-power').checked;
    const hasBane = document.getElementById('bane-power').checked;
    let edgeBaneModifier = hasEdge ? 2 : (hasBane ? -2 : 0);

    // Get 'Other' modifier value
    const otherModifierInput = document.getElementById('other-power');
    let otherModifier = 0;
    if (otherModifierInput) {
        otherModifier = parseInt(otherModifierInput.value) || 0;
    }

    // Prepare roll descriptor for TaleSpire
    const modifier = statModifier + edgeBaneModifier + otherModifier;
    const modifierString = modifier >= 0 ? `+${modifier}` : `${modifier}`;
    const label = `Power Roll${statName ? ` (${statName})` : ''}${hasEdge ? ' with Edge' : ''}${hasBane ? ' with Bane' : ''}${otherModifier ? ` +${otherModifier} Other` : ''}`;

    // Create and perform the roll
    const roll = {
        name: label,
        roll: `2d10${modifierString}`
    };

    // Put the roll in the dice tray
    TS.dice.putDiceInTray([roll]);
}

async function handleRollResult(rollEvent) {
    TS.debug.log("handleRollResult called with event: " + JSON.stringify(rollEvent));
    if (!trackedIds.hasOwnProperty(rollEvent.payload.rollId)) {
        TS.debug.log("Ignoring untracked roll ID: " + rollEvent.payload.rollId);
        return;
    }
    const roll = rollEvent.payload;
    TS.debug.log("Handling roll result: " + JSON.stringify(roll));
    if (rollEvent.kind === "rollResults") {
        // Extract dice value from resultsGroups
        if (roll.resultsGroups && roll.resultsGroups.length > 0) {
            const group = roll.resultsGroups[0];
            if (group.result && group.result.results && group.result.results.length > 0) {
                const diceValue = group.result.results[0];
                TS.debug.log("Got dice value: " + diceValue);
                let randomAmount;
                if (diceValue <= 2) randomAmount = 1;
                else if (diceValue <= 4) randomAmount = 2;
                else randomAmount = 3;
                const heroicInput = document.getElementById('heroic-current');
                const currentValue = trackedIds[roll.rollId];
                const newValue = currentValue + randomAmount;
                heroicInput.value = newValue;
                heroicInput.dispatchEvent(new Event('change'));
                TS.debug.log(`Added ${randomAmount} (rolled ${diceValue}). New total: ${newValue}`);
            } else {
                TS.debug.log("No dice results found in resultsGroups.");
            }
        } else {
            TS.debug.log("No resultsGroups found in roll.");
        }
    }
    delete trackedIds[rollEvent.payload.rollId];
}

document.addEventListener('DOMContentLoaded', function() {
    showTab('main');
});


// Export for core
window.setupPowerRollHandlers = setupPowerRollHandlers;
window.performPowerRoll = performPowerRoll;
