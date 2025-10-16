function useRecovery() {
    const recoveriesInput = document.getElementById('recoveries-current');
    const staminaInput = document.getElementById('stamina-current');
    const staminaMaxInput = document.getElementById('stamina-max');
    const staminaTempInput = document.getElementById('stamina-temp');
    const recoveryValueInput = document.getElementById('recoveries-stamina');

    const currentRecoveries = parseInt(recoveriesInput.value) || 0;
    const currentStamina = parseInt(staminaInput.value) || 0;
    const maxStamina = parseInt(staminaMaxInput.value) || 0;
    const tempStamina = parseInt(staminaTempInput.value) || 0;
    const recoveryValue = parseInt(recoveryValueInput.value) || 0;

    // Check if we have recoveries available
    if (currentRecoveries <= 0) {
        return; // No recoveries left
    }

    // Calculate how much stamina we can restore (limited by max + temp)
    const maxPossibleStamina = maxStamina + tempStamina;
    const actualHealingDone = Math.min(recoveryValue, maxPossibleStamina - currentStamina);
    
    // Only proceed if we can actually heal
    if (actualHealingDone > 0) {
        // Reduce recoveries by 1
        recoveriesInput.value = currentRecoveries - 1;
        
        // Increase current stamina
        staminaInput.value = currentStamina + actualHealingDone;
        
        // Update status
        updateStaminaStatus();
    }
}

function takeDamage() {
    const damageInput = document.getElementById('damage-amount');
    const staminaInput = document.getElementById('stamina-current');
    const tempStaminaInput = document.getElementById('stamina-temp');
    
    const damage = parseInt(damageInput.value) || 0;
    const currentStamina = parseInt(staminaInput.value) || 0;
    const tempStamina = parseInt(tempStaminaInput.value) || 0;
    
    // Apply damage
    if (damage > 0) {
        let remainingDamage = damage;
        
        // First reduce temp stamina
        if (tempStamina > 0) {
            const newTempStamina = Math.max(0, tempStamina - damage);
            tempStaminaInput.value = newTempStamina;
            remainingDamage = damage - (tempStamina - newTempStamina);
        }
        
        // If there's still damage remaining, apply it to current stamina
        if (remainingDamage > 0) {
            staminaInput.value = currentStamina - remainingDamage;
        }
        
        damageInput.value = 0; // Reset damage input
        
        // Enforce limits and update status
        enforceStaminaLimits();
        updateStaminaStatus();
    }
}

function heal() {
    const amountInput = document.getElementById('damage-amount');
    const staminaInput = document.getElementById('stamina-current');
    const maxInput = document.getElementById('stamina-max');
    
    const healing = parseInt(amountInput.value) || 0;
    const currentStamina = parseInt(staminaInput.value) || 0;
    const maxStamina = parseInt(maxInput.value) || 0;
    
    // Apply healing up to max stamina
    if (healing > 0) {
        const newStamina = Math.min(maxStamina, currentStamina + healing);
        staminaInput.value = newStamina;
        amountInput.value = 0; // Reset amount input
        
        // Update status
        updateStaminaStatus();
    }
}

function updateStaminaStatus() {
    const currentStamina = parseInt(document.getElementById('stamina-current').value) || 0;
    const maxStamina = parseInt(document.getElementById('stamina-max').value) || 0;
    const status = document.getElementById('stamina-status');
    
    if (currentStamina <= -maxStamina/2) {
        status.textContent = "Dead";
        status.style.color = "red";
    } else if (currentStamina <= 0 && currentStamina > Math.floor(-maxStamina/2)) {
        status.textContent = "Dying";
        status.style.color = "red";
    } else if (currentStamina <= Math.floor(maxStamina/2)) {
        status.textContent = "Winded";
        status.style.color = "#ff6666";
    } else {
        status.textContent = "Healthy";
        status.style.color = "";
    }
}

function enforceRecoveryLimits() {
    const currentInput = document.getElementById('recoveries-current');
    const maxInput = document.getElementById('recoveries-max');
    
    const current = parseInt(currentInput.value) || 0;
    const max = parseInt(maxInput.value) || 0;
    
    // Enforce limits
    if (current > max) {
        currentInput.value = max;
    } else if (current < 0) {
        currentInput.value = 0;
    }
}

function enforceStaminaLimits() {
    const currentInput = document.getElementById('stamina-current');
    const maxInput = document.getElementById('stamina-max');
    const tempInput = document.getElementById('stamina-temp');

    const current = parseInt(currentInput.value) || 0;
    const max = parseInt(maxInput.value) || 0;
    const temp = parseInt(tempInput.value) || 0;
    
    const effectiveMax = max + temp;
    const minAllowed = Math.floor(-max/2);  // Minimum allowed is -50% of max, rounded down

    // Enforce limits
    if (current > effectiveMax) {
        currentInput.value = effectiveMax;
    } else if (current < minAllowed) {
        currentInput.value = minAllowed;
    }
}

function enforceMinZero(inputId) {
    const input = document.getElementById(inputId);
    const value = parseInt(input.value) || 0;
    
    if (value < 0) {
        input.value = 0;
    }
}