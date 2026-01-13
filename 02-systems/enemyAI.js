// ============================================================================
// ENEMYAI.JS - Abstracted Enemy AI Behavior System
// ============================================================================
// This file contains abstracted AI behaviors inspired by Rain World's enemy AI.
// It provides reusable systems for vision, memory, behavioral states, and
// investigation that can be used by any enemy in the game.
// ============================================================================

console.log('Loading enemyAI.js...');

// ============================================================================
// VISION SYSTEM
// ============================================================================
// Handles line-of-sight checks, vision cones, and angle limitations
// ============================================================================

class VisionSystem {
    constructor(config = {}) {
        this.visionAngle = config.visionAngle || Math.PI * 2 / 3; // 120 degrees forward
        this.visionRange = config.visionRange || 300;
        this.closeRangeAwareness = config.closeRangeAwareness || 50; // Spatial awareness for very close objects
        this.canSeeBackwards = config.canSeeBackwards || false;
    }
    
    /**
     * Check if enemy can see a target
     * @param {Object} enemy - The enemy checking vision
     * @param {Object} target - The target to check visibility of
     * @param {Array} platforms - Array of platforms for line-of-sight checks
     * @returns {Object|null} - Vision result with position and distance, or null if not visible
     */
    canSee(enemy, target, platforms = []) {
        const enemyCenterX = enemy.x + enemy.width / 2;
        const enemyCenterY = enemy.y + enemy.height / 2;
        const targetCenterX = target.x + target.width / 2;
        const targetCenterY = target.y + target.height / 2;
        
        // Calculate distance
        const dx = targetCenterX - enemyCenterX;
        const dy = targetCenterY - enemyCenterY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Check if within range
        if (distance > this.visionRange && distance > this.closeRangeAwareness) {
            return null;
        }
        
        // Close-range spatial awareness - can detect objects very close regardless of angle
        if (distance <= this.closeRangeAwareness) {
            // Still need line of sight
            if (this.hasLineOfSight(enemyCenterX, enemyCenterY, targetCenterX, targetCenterY, platforms)) {
                return {
                    position: { x: targetCenterX, y: targetCenterY },
                    distance: distance,
                    angle: Math.atan2(dy, dx)
                };
            }
            return null;
        }
        
        // Calculate angle to target
        const angleToTarget = Math.atan2(dy, dx);
        
        // Determine enemy facing direction (based on velocity or direction property)
        let enemyFacingAngle = 0;
        if (enemy.direction !== undefined) {
            enemyFacingAngle = enemy.direction > 0 ? 0 : Math.PI;
        } else if (enemy.velocityX !== undefined) {
            enemyFacingAngle = enemy.velocityX > 0 ? 0 : (enemy.velocityX < 0 ? Math.PI : 0);
        }
        
        // Calculate angle difference
        let angleDiff = Math.abs(angleToTarget - enemyFacingAngle);
        if (angleDiff > Math.PI) {
            angleDiff = Math.PI * 2 - angleDiff;
        }
        
        // Check if target is within vision cone
        const halfVisionAngle = this.visionAngle / 2;
        if (angleDiff > halfVisionAngle && !this.canSeeBackwards) {
            return null; // Target is outside vision cone
        }
        
        // Check line of sight
        if (!this.hasLineOfSight(enemyCenterX, enemyCenterY, targetCenterX, targetCenterY, platforms)) {
            return null;
        }
        
        return {
            position: { x: targetCenterX, y: targetCenterY },
            distance: distance,
            angle: angleToTarget
        };
    }
    
    /**
     * Check if there's a clear line of sight between two points
     * Uses tilemap if available, otherwise checks against platforms
     */
    hasLineOfSight(x1, y1, x2, y2, platforms = []) {
        // Use tilemap if available for more accurate checks
        if (window.worldMap) {
            return this.hasLineOfSightTilemap(x1, y1, x2, y2);
        }
        
        // Fallback to platform-based checks
        return this.hasLineOfSightPlatforms(x1, y1, x2, y2, platforms);
    }
    
    /**
     * Check line of sight using tilemap
     */
    hasLineOfSightTilemap(x1, y1, x2, y2) {
        const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
        const stepX = (x2 - x1) / steps;
        const stepY = (y2 - y1) / steps;
        
        for (let i = 0; i <= steps; i++) {
            const checkX = x1 + stepX * i;
            const checkY = y1 + stepY * i;
            
            // Check a small area around the point
            const checkSize = 8;
            if (window.worldMap.checkCollision(
                checkX - checkSize / 2,
                checkY - checkSize / 2,
                checkSize,
                checkSize
            )) {
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Check line of sight using platforms (fallback)
     */
    hasLineOfSightPlatforms(x1, y1, x2, y2, platforms) {
        // Simple raycast - check if line intersects any platform
        const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
        const stepX = (x2 - x1) / steps;
        const stepY = (y2 - y1) / steps;
        
        for (let i = 0; i <= steps; i += 5) {
            const checkX = x1 + stepX * i;
            const checkY = y1 + stepY * i;
            
            for (let platform of platforms) {
                if (checkX >= platform.x && checkX <= platform.x + platform.width &&
                    checkY >= platform.y && checkY <= platform.y + platform.height) {
                    return false;
                }
            }
        }
        
        return true;
    }
}

// ============================================================================
// MEMORY SYSTEM
// ============================================================================
// Tracks last known positions, memory decay, and multiple target tracking
// ============================================================================

class MemorySystem {
    constructor(config = {}) {
        this.memoryDecayTime = config.memoryDecayTime || 300; // 5 seconds at 60fps
        this.memories = new Map(); // Map of target ID to memory data
    }
    
    /**
     * Update memory for a target
     * @param {string|number} targetId - Unique identifier for the target
     * @param {Object} position - {x, y} position of the target
     * @param {number} timeSinceLastSighting - Time since last visual contact
     */
    updateMemory(targetId, position, timeSinceLastSighting = 0) {
        this.memories.set(targetId, {
            position: { x: position.x, y: position.y },
            timeSinceLastSighting: timeSinceLastSighting,
            lastUpdateTime: Date.now()
        });
    }
    
    /**
     * Get memory for a target
     * @param {string|number} targetId - Target identifier
     * @returns {Object|null} - Memory data or null if no memory/expired
     */
    getMemory(targetId) {
        const memory = this.memories.get(targetId);
        if (!memory) return null;
        
        // Check if memory has decayed
        if (memory.timeSinceLastSighting > this.memoryDecayTime) {
            this.memories.delete(targetId);
            return null;
        }
        
        return memory;
    }
    
    /**
     * Delete memory for a target
     * @param {string|number} targetId - Target identifier
     */
    deleteMemory(targetId) {
        this.memories.delete(targetId);
    }
    
    /**
     * Check if target is at remembered position (within tolerance)
     * @param {string|number} targetId - Target identifier
     * @param {Object} currentPosition - Current position to check
     * @param {number} tolerance - Distance tolerance in pixels
     * @returns {boolean} - True if target is at remembered position
     */
    isAtRememberedPosition(targetId, currentPosition, tolerance = 30) {
        const memory = this.getMemory(targetId);
        if (!memory) return false;
        
        const dx = currentPosition.x - memory.position.x;
        const dy = currentPosition.y - memory.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance <= tolerance;
    }
    
    /**
     * Update all memories (increment time since last sighting)
     */
    update() {
        for (let [targetId, memory] of this.memories.entries()) {
            memory.timeSinceLastSighting++;
            if (memory.timeSinceLastSighting > this.memoryDecayTime) {
                this.memories.delete(targetId);
            }
        }
    }
    
    /**
     * Clear all memories
     */
    clear() {
        this.memories.clear();
    }
}

// ============================================================================
// BEHAVIOR STATE MACHINE
// ============================================================================
// Manages state transitions (idle → hunting → investigating)
// ============================================================================

const BEHAVIOR_STATE = {
    IDLE: 'idle',
    HUNTING: 'hunting',
    INVESTIGATING: 'investigating',
    SEARCHING: 'searching'
};

class BehaviorStateMachine {
    constructor(initialState = BEHAVIOR_STATE.IDLE) {
        this.currentState = initialState;
        this.stateStartTime = 0;
        this.stateData = {}; // Can store state-specific data
    }
    
    /**
     * Change to a new state
     * @param {string} newState - New state to transition to
     * @param {Object} data - Optional data to pass to the new state
     */
    changeState(newState, data = {}) {
        if (this.currentState !== newState) {
            this.currentState = newState;
            this.stateStartTime = 0;
            this.stateData = data;
        }
    }
    
    /**
     * Get current state
     * @returns {string} - Current state
     */
    getState() {
        return this.currentState;
    }
    
    /**
     * Check if in a specific state
     * @param {string} state - State to check
     * @returns {boolean} - True if in that state
     */
    isInState(state) {
        return this.currentState === state;
    }
    
    /**
     * Update state machine (increment state timer)
     */
    update() {
        this.stateStartTime++;
    }
    
    /**
     * Get time spent in current state
     * @returns {number} - Frames spent in current state
     */
    getStateTime() {
        return this.stateStartTime;
    }
}

// ============================================================================
// INVESTIGATION BEHAVIOR
// ============================================================================
// Searches areas, uses scout checkpoints
// ============================================================================

class InvestigationBehavior {
    constructor(config = {}) {
        this.searchRadius = config.searchRadius || 100;
        this.scoutDistance = config.scoutDistance || 50;
        this.maxInvestigationTime = config.maxInvestigationTime || 180; // 3 seconds
        this.investigationTime = 0;
        this.targetPosition = null;
        this.scoutPoints = [];
        this.currentScoutIndex = 0;
    }
    
    /**
     * Start investigating a position
     * @param {Object} position - {x, y} position to investigate
     */
    startInvestigation(position) {
        this.targetPosition = { x: position.x, y: position.y };
        this.investigationTime = 0;
        this.currentScoutIndex = 0;
        this.generateScoutPoints(position);
    }
    
    /**
     * Generate scout points around a position
     * @param {Object} position - Center position
     */
    generateScoutPoints(position) {
        this.scoutPoints = [];
        const numScouts = 4;
        
        for (let i = 0; i < numScouts; i++) {
            const angle = (Math.PI * 2 / numScouts) * i;
            const scoutX = position.x + Math.cos(angle) * this.scoutDistance;
            const scoutY = position.y + Math.sin(angle) * this.scoutDistance;
            this.scoutPoints.push({ x: scoutX, y: scoutY });
        }
        
        // Add the center position as first scout point
        this.scoutPoints.unshift({ x: position.x, y: position.y });
    }
    
    /**
     * Get current investigation target (scout point or center)
     * @returns {Object|null} - Current target position or null if investigation complete
     */
    getCurrentTarget() {
        if (!this.targetPosition) return null;
        
        if (this.investigationTime >= this.maxInvestigationTime) {
            return null; // Investigation complete
        }
        
        // Return current scout point
        if (this.currentScoutIndex < this.scoutPoints.length) {
            return this.scoutPoints[this.currentScoutIndex];
        }
        
        // All scout points checked, return to center
        return this.targetPosition;
    }
    
    /**
     * Move to next scout point
     */
    nextScoutPoint() {
        this.currentScoutIndex++;
        if (this.currentScoutIndex >= this.scoutPoints.length) {
            this.currentScoutIndex = 0; // Loop back
        }
    }
    
    /**
     * Check if at current target (within tolerance)
     * @param {Object} currentPosition - Current position
     * @param {number} tolerance - Distance tolerance
     * @returns {boolean} - True if at target
     */
    isAtTarget(currentPosition, tolerance = 20) {
        const target = this.getCurrentTarget();
        if (!target) return false;
        
        const dx = currentPosition.x - target.x;
        const dy = currentPosition.y - target.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance <= tolerance;
    }
    
    /**
     * Update investigation (increment timer)
     */
    update() {
        if (this.targetPosition) {
            this.investigationTime++;
        }
    }
    
    /**
     * Check if investigation is complete
     * @returns {boolean} - True if investigation should end
     */
    isComplete() {
        return !this.targetPosition || this.investigationTime >= this.maxInvestigationTime;
    }
    
    /**
     * Reset investigation
     */
    reset() {
        this.targetPosition = null;
        this.investigationTime = 0;
        this.currentScoutIndex = 0;
        this.scoutPoints = [];
    }
}

// ============================================================================
// ESTIMATION SYSTEM
// ============================================================================
// Predicts player movement when out of sight
// ============================================================================

class EstimationSystem {
    constructor(config = {}) {
        this.estimationTime = config.estimationTime || 60; // 1 second
        this.maxEstimationDistance = config.maxEstimationDistance || 200;
    }
    
    /**
     * Estimate where target might be based on last known position and velocity
     * @param {Object} lastKnownPosition - Last known {x, y} position
     * @param {Object} lastKnownVelocity - Last known {x, y} velocity
     * @param {number} timeSinceLastSighting - Time since last sighting
     * @returns {Object} - Estimated {x, y} position
     */
    estimatePosition(lastKnownPosition, lastKnownVelocity, timeSinceLastSighting) {
        // Simple estimation: assume target continues in same direction
        const estimatedX = lastKnownPosition.x + (lastKnownVelocity.x || 0) * timeSinceLastSighting;
        const estimatedY = lastKnownPosition.y + (lastKnownVelocity.y || 0) * timeSinceLastSighting;
        
        // Apply gravity to Y estimation
        const gravity = 0.6; // Approximate gravity
        const estimatedYWithGravity = estimatedY + (gravity * timeSinceLastSighting * timeSinceLastSighting) / 2;
        
        // Limit estimation distance
        const dx = estimatedX - lastKnownPosition.x;
        const dy = estimatedYWithGravity - lastKnownPosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > this.maxEstimationDistance) {
            const scale = this.maxEstimationDistance / distance;
            return {
                x: lastKnownPosition.x + dx * scale,
                y: lastKnownPosition.y + dy * scale
            };
        }
        
        return {
            x: estimatedX,
            y: estimatedYWithGravity
        };
    }
}

// Export for use in other files
window.VisionSystem = VisionSystem;
window.MemorySystem = MemorySystem;
window.BehaviorStateMachine = BehaviorStateMachine;
window.BEHAVIOR_STATE = BEHAVIOR_STATE;
window.InvestigationBehavior = InvestigationBehavior;
window.EstimationSystem = EstimationSystem;
