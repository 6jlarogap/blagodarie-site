function updateDisplayValues() {
    document.getElementById('charge-strength-value').textContent = currentParams.chargeStrength;
    document.getElementById('collide-radius-value').textContent = currentParams.collideRadius;
    document.getElementById('link-strength-value').textContent = currentParams.linkStrength.toFixed(3);
    document.getElementById('x-strength-value').textContent = currentParams.xStrength.toFixed(3);
    document.getElementById('y-strength-value').textContent = currentParams.yStrength.toFixed(3);
    document.getElementById('velocity-decay-value').textContent = currentParams.velocityDecay.toFixed(3);
    document.getElementById('alpha-decay-value').textContent = currentParams.alphaDecay.toFixed(3);
}

function changeChargeStrength(delta) {
    const newValue = currentParams.chargeStrength + delta;
    if (newValue >= SIMULATION_CONFIG.LIMITS.CHARGE_STRENGTH.MIN && 
        newValue <= SIMULATION_CONFIG.LIMITS.CHARGE_STRENGTH.MAX) {
        currentParams.chargeStrength = newValue;
        if (simulation) {
            simulation.force('charge', d3.forceManyBody().strength(newValue));
            updateDisplayValues();
            simulation.alpha(1).restart();
        }
    }
}

function changeCollideRadius(delta) {
    const newValue = currentParams.collideRadius + delta;
    if (newValue >= SIMULATION_CONFIG.LIMITS.COLLIDE_RADIUS.MIN && 
        newValue <= SIMULATION_CONFIG.LIMITS.COLLIDE_RADIUS.MAX) {
        currentParams.collideRadius = newValue;
        if (simulation) {
            simulation.force("collide", d3.forceCollide().radius(newValue));
            updateDisplayValues();
            simulation.alpha(1).restart();
        }
    }
}

function changeLinkStrength(delta) {
    const newValue = currentParams.linkStrength + delta;
    if (newValue >= SIMULATION_CONFIG.LIMITS.LINK_STRENGTH.MIN && 
        newValue <= SIMULATION_CONFIG.LIMITS.LINK_STRENGTH.MAX) {
        currentParams.linkStrength = newValue;
        if (simulation) {
            simulation.force('link', d3.forceLink(links).id(({ id }) => id).strength(newValue));
            updateDisplayValues();
            simulation.alpha(1).restart();
        }
    }
}

function changeXStrength(delta) {
    const newValue = currentParams.xStrength + delta;
    if (newValue >= SIMULATION_CONFIG.LIMITS.X_STRENGTH.MIN && 
        newValue <= SIMULATION_CONFIG.LIMITS.X_STRENGTH.MAX) {
        currentParams.xStrength = newValue;
        if (simulation) {
            simulation.force('x', d3.forceX(width / 2).strength(newValue));
            updateDisplayValues();
            simulation.alpha(1).restart();
        }
    }
}

function changeYStrength(delta) {
    const newValue = currentParams.yStrength + delta;
    if (newValue >= SIMULATION_CONFIG.LIMITS.Y_STRENGTH.MIN && 
        newValue <= SIMULATION_CONFIG.LIMITS.Y_STRENGTH.MAX) {
        currentParams.yStrength = newValue;
        if (simulation) {
            simulation.force('y', d3.forceY(height / 2).strength(newValue));
            updateDisplayValues();
            simulation.alpha(1).restart();
        }
    }
}

function changeVelocityDecay(delta) {
    const newValue = currentParams.velocityDecay + delta;
    if (newValue >= SIMULATION_CONFIG.LIMITS.VELOCITY_DECAY.MIN && 
        newValue <= SIMULATION_CONFIG.LIMITS.VELOCITY_DECAY.MAX) {
        currentParams.velocityDecay = newValue;
        if (simulation) {
            simulation.velocityDecay(newValue);
            updateDisplayValues();
            simulation.alpha(1).restart();
        }
    }
}

function changeAlphaDecay(delta) {
    const newValue = currentParams.alphaDecay + delta;
    if (newValue >= SIMULATION_CONFIG.LIMITS.ALPHA_DECAY.MIN && 
        newValue <= SIMULATION_CONFIG.LIMITS.ALPHA_DECAY.MAX) {
        currentParams.alphaDecay = newValue;
        if (simulation) {
            simulation.alphaDecay(newValue);
            updateDisplayValues();
            simulation.alpha(1).restart();
        }
    }
}

const stopsim = () => {
    if (simulation) {
        simulation.stop();
        updateGraphInfo();
    }
}

const startsim = () => { 
    if (simulation) {
        simulation.alpha(1).alphaTarget(1).alphaMin(0.001).restart();
    }
}