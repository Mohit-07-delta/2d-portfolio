// Mobile Touch Controls (Virtual Joystick & Interact Button)
class MobileControlsManager {
  constructor() {
    this.container = null;
    this.handle = null;
    this.interactBtn = null;
    
    // Joystick vector: magnitude 0 to 1, direction normalized
    this.vector = { x: 0, y: 0 };
    this.isMoving = false;
    
    // Discrete direction mappings
    this.directions = {
      up: false,
      down: false,
      left: false,
      right: false
    };
    
    this.interactTapped = false;
    this.touchId = null;
    this.centerX = 0;
    this.centerY = 0;
    this.maxDistance = 45; // Max radius handle can slide (in pixels)
  }

  init() {
    this.container = document.getElementById("joystick-container");
    this.handle = document.getElementById("joystick-handle");
    this.interactBtn = document.getElementById("mobile-interact-btn");
    
    if (!this.container || !this.handle) return;
    
    // Check if it's a touch device
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    // On non-touch desktop browsers, we hide the joystick, unless the user overrides it
    if (!isTouchDevice) {
      this.container.style.display = "none";
      if (this.interactBtn) this.interactBtn.style.display = "none";
      return;
    } else {
      this.container.style.display = "block";
      if (this.interactBtn) this.interactBtn.style.display = "flex";
    }

    // Touch Event Listeners
    this.container.addEventListener("touchstart", (e) => this.onTouchStart(e), { passive: false });
    window.addEventListener("touchmove", (e) => this.onTouchMove(e), { passive: false });
    window.addEventListener("touchend", (e) => this.onTouchEnd(e), { passive: false });
    
    // Mobile Interact Button Event Listener
    if (this.interactBtn) {
      this.interactBtn.addEventListener("touchstart", (e) => {
        e.preventDefault();
        this.interactTapped = true;
        
        // Visual tap feedback
        this.interactBtn.classList.add("pressed");
      });
      
      this.interactBtn.addEventListener("touchend", (e) => {
        this.interactBtn.classList.remove("pressed");
      });
    }
  }

  onTouchStart(e) {
    e.preventDefault();
    if (this.touchId !== null) return;
    
    const touch = e.changedTouches[0];
    this.touchId = touch.identifier;
    
    const rect = this.container.getBoundingClientRect();
    this.centerX = rect.left + rect.width / 2;
    this.centerY = rect.top + rect.height / 2;
    
    this.isMoving = true;
    this.processTouch(touch);
  }

  onTouchMove(e) {
    if (this.touchId === null) return;
    
    // Find our tracking touch
    let activeTouch = null;
    for (let i = 0; i < e.touches.length; i++) {
      if (e.touches[i].identifier === this.touchId) {
        activeTouch = e.touches[i];
        break;
      }
    }
    
    if (activeTouch) {
      e.preventDefault();
      this.processTouch(activeTouch);
    }
  }

  onTouchEnd(e) {
    if (this.touchId === null) return;
    
    // Check if our tracking touch ended
    let touchEnded = false;
    for (let i = 0; i < e.changedTouches.length; i++) {
      if (e.changedTouches[i].identifier === this.touchId) {
        touchEnded = true;
        break;
      }
    }
    
    if (touchEnded) {
      this.touchId = null;
      this.isMoving = false;
      this.vector = { x: 0, y: 0 };
      
      // Reset handle to center
      this.handle.style.transform = `translate(0px, 0px)`;
      
      // Reset directions
      this.directions.up = false;
      this.directions.down = false;
      this.directions.left = false;
      this.directions.right = false;
    }
  }

  processTouch(touch) {
    const deltaX = touch.clientX - this.centerX;
    const deltaY = touch.clientY - this.centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    let moveX = deltaX;
    let moveY = deltaY;
    
    // Cap the distance the handle can move
    if (distance > this.maxDistance) {
      moveX = (deltaX / distance) * this.maxDistance;
      moveY = (deltaY / distance) * this.maxDistance;
    }
    
    // Update handle position
    this.handle.style.transform = `translate(${moveX}px, ${moveY}px)`;
    
    // Compute normalized vector
    const currentDist = Math.sqrt(moveX * moveX + moveY * moveY);
    if (currentDist > 0) {
      this.vector.x = moveX / this.maxDistance;
      this.vector.y = moveY / this.maxDistance;
    } else {
      this.vector = { x: 0, y: 0 };
    }
    
    // Convert to discrete directions (with diagonal deadzones)
    const threshold = 0.35;
    this.directions.left = this.vector.x < -threshold;
    this.directions.right = this.vector.x > threshold;
    this.directions.up = this.vector.y < -threshold;
    this.directions.down = this.vector.y > threshold;
    
    // Resolve priority (no multi-directional walk if one is dominant)
    if (Math.abs(this.vector.x) > Math.abs(this.vector.y)) {
      this.directions.up = false;
      this.directions.down = false;
    } else {
      this.directions.left = false;
      this.directions.right = false;
    }
  }

  consumeInteractTap() {
    const tapped = this.interactTapped;
    this.interactTapped = false;
    return tapped;
  }
}

export const mobileControls = new MobileControlsManager();
