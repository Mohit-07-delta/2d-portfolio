import { scaleFactor, k } from "./kaboomCtx";
import { modals } from "./modal";
import { sounds } from "./sound";
import { mobileControls } from "./controls";

// Friendly names for interaction HUD prompt
const friendlyNames = {
  pc: "Computer (Projects)",
  projects: "Wikimedia Profile",
  resume: "Desk (About Me & Resume)",
  library: "Bookshelf (Skills)",
  "cs-degree": "CS Degree (Timeline)",
  "sofa-table": "Sofa (Contact)",
  tv: "Television (Recommendations)",
  bed: "Bed (Ideation Zone)",
  exit: "Door (Exit/Restart)",
  welcome: "SATI Bot (Guide NPC)"
};

// Global active boundary tracking
let activeBoundary = null;
let promptEl = null;

// Initialize overlay elements and key binds
function initUI() {
  promptEl = document.getElementById("interaction-prompt");
  modals.init();
  mobileControls.init();
  
  // Set up audio button listeners
  const bgmBtn = document.getElementById("mute-bgm-btn");
  const sfxBtn = document.getElementById("mute-sfx-btn");
  
  if (bgmBtn) bgmBtn.addEventListener("click", () => sounds.toggleBgm());
  if (sfxBtn) sfxBtn.addEventListener("click", () => sounds.toggleSfx());
}

function showPrompt(boundaryName) {
  if (!promptEl) return;
  const objectName = friendlyNames[boundaryName] || "Object";
  
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouchDevice) {
    promptEl.innerHTML = `Tap <span class="mobile-tap-highlight">Interact</span> to inspect <strong>${objectName}</strong>`;
  } else {
    promptEl.innerHTML = `Press <span class="key-cap">[E]</span> or <span class="key-cap">[Enter]</span> to interact with <strong>${objectName}</strong>`;
  }
  
  promptEl.style.display = "block";
  setTimeout(() => promptEl.classList.add("visible"), 10);
  
  // Highlight mobile interact button
  const mobileInteract = document.getElementById("mobile-interact-btn");
  if (mobileInteract) {
    mobileInteract.classList.add("active");
  }
}

function hidePrompt() {
  if (!promptEl) return;
  promptEl.classList.remove("visible");
  setTimeout(() => {
    if (!promptEl.classList.contains("visible")) {
      promptEl.style.display = "none";
    }
  }, 200);
  
  // Dim mobile interact button
  const mobileInteract = document.getElementById("mobile-interact-btn");
  if (mobileInteract) {
    mobileInteract.classList.remove("active");
  }
}

// Load Game Assets
k.loadSprite("spritesheet", "./assets/spritesheet.png", {
  sliceX: 39,
  sliceY: 31,
  anims: {
    "idle-down": 936,
    "walk-down": { from: 936, to: 939, loop: true, speed: 8 },
    "idle-side": 975,
    "walk-side": { from: 975, to: 978, loop: true, speed: 8 },
    "idle-up": 1014,
    "walk-up": { from: 1014, to: 1017, loop: true, speed: 8 },
  },
});

k.loadSprite("map", "./assets/map.png");
k.setBackground(k.Color.fromHex("#130a1c")); // Dark purple matching room environment

k.scene("main", async () => {
  // Quest state tracking
  const visitedObjects = new Set();
  window.visitedObjectsCount = 0;
  window.questCompleted = false;

  // Hide loading screen after assets loaded
  const loader = document.getElementById("loading-screen");
  if (loader) {
    loader.classList.add("fade-out");
    setTimeout(() => loader.style.display = "none", 500);
  }

  // Load Map JSON data
  const mapData = await (await fetch("./assets/map.json")).json();
  const layers = mapData.layers;

  // Add room tilemap image
  const map = k.add([
    k.sprite("map"),
    k.pos(0),
    k.scale(scaleFactor)
  ]);

  // Create player entity
  const player = k.make([
    k.sprite("spritesheet", { anim: "idle-down" }),
    k.area({
      shape: new k.Rect(k.vec2(0, 3), 10, 10), // tighter collision shape for better movement
    }),
    k.body(),
    k.anchor("center"),
    k.pos(),
    k.scale(scaleFactor),
    {
      speed: 180,
      direction: "down",
      isInDialogue: false,
      isMovingState: false
    },
    "player",
  ]);

  // Spawn welcome NPC Bot next to player
  const welcomeNpc = k.add([
    k.sprite("spritesheet", { frame: 940 }), // frame of alternative character on sheet
    k.area({
      shape: new k.Rect(k.vec2(0, 3), 10, 10),
    }),
    k.body({ isStatic: true }),
    k.anchor("center"),
    k.pos(380, 460), // Spawn location near starting position
    k.scale(scaleFactor),
    "welcome-npc"
  ]);

  // Setup interactions for NPC
  player.onCollide("welcome-npc", () => {
    activeBoundary = "welcome";
    showPrompt("welcome");
  });
  
  player.onCollideEnd("welcome-npc", () => {
    if (activeBoundary === "welcome") {
      activeBoundary = null;
      hidePrompt();
    }
  });

  // Loop through Tiled layers and add colliders/spawnpoints
  for (const layer of layers) {
    if (layer.name === "boundaries") {
      for (const boundary of layer.objects) {
        map.add([
          k.area({
            shape: new k.Rect(k.vec2(0), boundary.width, boundary.height),
          }),
          k.body({ isStatic: true }),
          k.pos(boundary.x, boundary.y),
          boundary.name || "wall", // if unnamed, it's just a boundary wall
        ]);

        // If boundary represents a interactive zone (e.g. pc, desk)
        if (boundary.name) {
          player.onCollide(boundary.name, () => {
            activeBoundary = boundary.name;
            showPrompt(boundary.name);
          });

          player.onCollideEnd(boundary.name, () => {
            if (activeBoundary === boundary.name) {
              activeBoundary = null;
              hidePrompt();
            }
          });
        }
      }
    }

    if (layer.name === "spawnpoints") {
      for (const entity of layer.objects) {
        if (entity.name === "player") {
          player.pos = k.vec2(
            (map.pos.x + entity.x) * scaleFactor,
            (map.pos.y + entity.y) * scaleFactor
          );
          k.add(player);
        }
      }
    }
  }

  // Camera settings and responsiveness
  function setCamScale() {
    const scale = k.width() / k.height() < 1 ? 1.0 : 1.5;
    k.camScale(k.vec2(scale));
  }
  
  setCamScale();
  k.onResize(setCamScale);

  // Helper to trigger the achievement popup notification
  function triggerAchievement() {
    sounds.playAchievement();
    const popup = document.getElementById("achievement-popup");
    if (popup) {
      popup.classList.add("visible");
      
      // Auto-hide the achievement popup after 4.5 seconds
      setTimeout(() => {
        popup.classList.remove("visible");
      }, 4500);
    }
  }

  // Function to open active boundary modal
  function triggerInteraction() {
    if (!activeBoundary || player.isInDialogue) return;
    
    // Track unique visited objects for the exploration quest
    const nonQuestObjects = ["welcome", "exit"];
    if (!nonQuestObjects.includes(activeBoundary)) {
      visitedObjects.add(activeBoundary);
      window.visitedObjectsCount = visitedObjects.size;
      
      // If user reaches 5 inspected objects, unlock the achievement!
      if (visitedObjects.size >= 5 && !window.questCompleted) {
        window.questCompleted = true;
        triggerAchievement();
      }
    }

    player.isInDialogue = true;
    hidePrompt();
    
    // Stop footstep sfx and player animation
    player.isMovingState = false;
    stopPlayerAnims();
    
    modals.open(activeBoundary, () => {
      // Callback triggered when modal closes
      player.isInDialogue = false;
      // If player is still colliding with the zone after closing, show prompt again
      if (activeBoundary) {
        showPrompt(activeBoundary);
      }
    });
  }

  // Bind desktop keys to trigger modal
  k.onKeyPress((key) => {
    if ((key === "e" || key === "enter" || key === "space") && activeBoundary && !player.isInDialogue) {
      triggerInteraction();
    }
  });

  function stopPlayerAnims() {
    if (player.direction === "down") {
      player.play("idle-down");
    } else if (player.direction === "up") {
      player.play("idle-up");
    } else {
      player.play("idle-side");
    }
  }

  // Unified Frame Loop for Movement, Animation, Camera, and SFX
  k.onUpdate(() => {
    // Camera follows player smoothly (offset slightly upwards for room aesthetic)
    k.camPos(player.worldPos().x, player.worldPos().y - 50);

    if (player.isInDialogue) {
      player.isMovingState = false;
      return;
    }

    let moveX = 0;
    let moveY = 0;

    // 1. Keyboard Input WASD / Arrow Keys
    if (k.isKeyDown("left") || k.isKeyDown("a")) {
      moveX = -1;
      player.direction = "left";
      player.flipX = true;
    } else if (k.isKeyDown("right") || k.isKeyDown("d")) {
      moveX = 1;
      player.direction = "right";
      player.flipX = false;
    }

    if (k.isKeyDown("up") || k.isKeyDown("w")) {
      moveY = -1;
      player.direction = "up";
    } else if (k.isKeyDown("down") || k.isKeyDown("s")) {
      moveY = 1;
      player.direction = "down";
    }

    // 2. Mobile Joystick Input (Overrides keyboard if active)
    if (mobileControls.isMoving) {
      moveX = mobileControls.vector.x;
      moveY = mobileControls.vector.y;

      // Determine dominant direction for sprite walk animation
      if (Math.abs(moveX) > Math.abs(moveY)) {
        player.direction = moveX < 0 ? "left" : "right";
        player.flipX = moveX < 0;
      } else {
        player.direction = moveY < 0 ? "up" : "down";
      }
    }

    // Normalize diagonal speed for keyboard
    if (!mobileControls.isMoving && (moveX !== 0 || moveY !== 0)) {
      const len = Math.sqrt(moveX * moveX + moveY * moveY);
      moveX /= len;
      moveY /= len;
    }

    // 3. Apply Velocity & Play Walk animations
    if (moveX !== 0 || moveY !== 0) {
      player.move(moveX * player.speed, moveY * player.speed);
      player.isMovingState = true;

      if (player.direction === "up" && player.curAnim() !== "walk-up") {
        player.play("walk-up");
      } else if (player.direction === "down" && player.curAnim() !== "walk-down") {
        player.play("walk-down");
      } else if ((player.direction === "left" || player.direction === "right") && player.curAnim() !== "walk-side") {
        player.play("walk-side");
      }
    } else {
      player.isMovingState = false;
      
      // Stop and play idle frame
      if (player.direction === "up" && player.curAnim() !== "idle-up") {
        player.play("idle-up");
      } else if (player.direction === "down" && player.curAnim() !== "idle-down") {
        player.play("idle-down");
      } else if ((player.direction === "left" || player.direction === "right") && player.curAnim() !== "idle-side") {
        player.play("idle-side");
      }
    }

    // 4. Trigger Footsteps Audio
    if (player.isMovingState) {
      sounds.playFootstep();
    }

    // 5. Handle Mobile touch interact press
    if (mobileControls.consumeInteractTap() && activeBoundary && !player.isInDialogue) {
      triggerInteraction();
    }
  });
});

// Run game loop
window.addEventListener("DOMContentLoaded", () => {
  initUI();
  k.go("main");
  
  // Auto-focus the game canvas on startup
  const gameCanvas = document.getElementById("game");
  if (gameCanvas) {
    gameCanvas.focus();
  }
});
