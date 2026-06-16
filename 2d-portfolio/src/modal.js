import { portfolioData } from "./data";
import { sounds } from "./sound";

class ModalController {
  constructor() {
    this.overlay = null;
    this.modalBody = null;
    this.closeBtn = null;
    this.isOpen = false;
    this.onCloseCallback = null;
  }

  init() {
    this.overlay = document.getElementById("modal-overlay");
    this.modalBody = document.getElementById("modal-body-content");
    this.closeBtn = document.getElementById("modal-close-btn");

    if (this.closeBtn) {
      this.closeBtn.addEventListener("click", () => this.close());
    }

    // Close on clicking overlay outside the content box
    if (this.overlay) {
      this.overlay.addEventListener("click", (e) => {
        if (e.target === this.overlay) {
          this.close();
        }
      });
    }

    // Escape key closes modal
    window.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isOpen) {
        this.close();
      }
    });
  }

  open(zoneName, onCloseCallback) {
    if (this.isOpen) return;
    
    sounds.init();
    sounds.playInteract();
    
    this.isOpen = true;
    this.onCloseCallback = onCloseCallback;
    
    // Generate and inject content based on the active zone
    const contentHtml = this.generateContent(zoneName);
    this.modalBody.innerHTML = contentHtml;
    
    // Display modal with animation class
    this.overlay.style.display = "flex";
    setTimeout(() => {
      this.overlay.classList.add("active");
    }, 10);
    
    // Auto-focus close button
    if (this.closeBtn) {
      this.closeBtn.focus();
    }
  }

  close() {
    if (!this.isOpen) return;
    
    sounds.playClose();
    this.isOpen = false;
    
    this.overlay.classList.remove("active");
    
    // Wait for fade animation (300ms) to hide display
    setTimeout(() => {
      this.overlay.style.display = "none";
      this.modalBody.innerHTML = "";
      
      // Refocus the game canvas so KAPLAY regains keyboard event capture
      const gameCanvas = document.getElementById("game");
      if (gameCanvas) {
        gameCanvas.focus();
      }

      if (this.onCloseCallback) {
        this.onCloseCallback();
        this.onCloseCallback = null;
      }
    }, 300);
  }

  generateContent(zoneName) {
    switch (zoneName) {
      case "resume":
        return this.renderAboutMe();
      case "projects":
        return this.renderWikimediaProfile();
      case "pc":
        return this.renderProjects();
      case "library":
        return this.renderSkills();
      case "sofa-table":
        return this.renderContact();
      case "cs-degree":
        return this.renderTimeline();
      case "tv":
        return this.renderTV();
      case "bed":
        return this.renderBed();
      case "exit":
        return this.renderExit();
      case "npc":
      case "welcome":
        return this.renderWelcomeNPC();
      default:
        return `<div class="retro-box"><h3>Interactive Object</h3><p>You triggered: <strong>${zoneName}</strong></p></div>`;
    }
  }

  renderAboutMe() {
    const { name, title, avatar, description, resumeLink, resumeFileName } = portfolioData.bio;
    return `
      <div class="modal-section about-section">
        <h2 class="pixel-heading">About Me</h2>
        <div class="about-grid">
          <div class="avatar-container">
            <img class="pixel-avatar" src="${avatar}" alt="${name}" />
          </div>
          <div class="bio-container">
            <h3 class="bio-name">${name}</h3>
            <h4 class="bio-title">${title}</h4>
            <p class="bio-desc">${description}</p>
            <a href="${resumeLink}" class="retro-btn resume-btn" download="${resumeFileName}" target="_blank">
              💾 Download Resume
            </a>
          </div>
        </div>
      </div>
    `;
  }

  renderWikimediaProfile() {
    const { username, profileUrl, bio, groups, contributions } = portfolioData.wikimedia;
    
    const groupsHtml = groups.map(g => `
      <div class="skill-item">
        <span class="skill-icon">🎗️</span>
        <span class="skill-name"><strong>${g.name}</strong> (${g.role})</span>
      </div>
    `).join("");
    
    const contribsHtml = contributions.map(c => `
      <div class="skill-item">
        <span class="skill-icon">${c.icon}</span>
        <span class="skill-name">${c.name}</span>
      </div>
    `).join("");

    return `
      <div class="modal-section wikimedia-section">
        <h2 class="pixel-heading">Wikimedia Community Profile</h2>
        <div class="retro-card" style="margin-bottom: 20px; padding: 24px;">
          <div style="display: flex; align-items: center; gap: 16px; margin-bottom: 16px; border-bottom: 2px solid rgba(255, 255, 255, 0.05); padding-bottom: 12px;">
            <div style="font-size: 2.2rem; background: var(--bg-darker); border: 2px solid var(--color-primary); width: 55px; height: 55px; display: flex; align-items: center; justify-content: center; border-radius: 50%;">🌐</div>
            <div>
              <h3 style="color: var(--color-accent); font-size: 1.3rem; margin: 0;">${username}</h3>
              <p style="color: var(--color-secondary); font-size: 0.9rem; margin: 0;">Meta-Wiki Global User</p>
            </div>
          </div>
          <p style="line-height: 1.6; color: var(--text-color); font-size: 0.95rem; margin-bottom: 16px;">${bio}</p>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 20px; margin: 24px 0;">
            <div>
              <h4 style="color: var(--color-secondary); font-family: var(--font-retro); font-size: 0.7rem; margin-bottom: 12px; text-transform: uppercase;">👥 User Groups</h4>
              <div class="skills-list">
                ${groupsHtml}
              </div>
            </div>
            <div>
              <h4 style="color: var(--color-secondary); font-family: var(--font-retro); font-size: 0.7rem; margin-bottom: 12px; text-transform: uppercase;">✨ Contributions</h4>
              <div class="skills-list">
                ${contribsHtml}
              </div>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 24px;">
            <a href="${profileUrl}" target="_blank" class="retro-btn highlight" style="width: 100%; max-width: 400px; display: block; margin: 0 auto;">
              🌐 View Meta-Wiki Profile
            </a>
          </div>
        </div>
      </div>
    `;
  }

  renderProjects() {
    const cards = portfolioData.projects.map(p => `
      <div class="project-card retro-card">
        <h3 class="project-title">${p.name}</h3>
        <p class="project-desc">${p.description}</p>
        <div class="project-tags">
          ${p.tech.map(t => `<span class="tag-chip">${t}</span>`).join("")}
        </div>
        <div class="project-links">
          <a href="${p.github}" target="_blank" class="retro-btn-sm card-link">🐙 GitHub</a>
          <a href="${p.live}" target="_blank" class="retro-btn-sm card-link highlight">⚡ Demo</a>
        </div>
      </div>
    `).join("");

    return `
      <div class="modal-section">
        <h2 class="pixel-heading">My Projects</h2>
        <div class="projects-grid">
          ${cards}
        </div>
      </div>
    `;
  }

  renderSkills() {
    const categories = Object.keys(portfolioData.skills).map(category => {
      const skillsList = portfolioData.skills[category].map(s => `
        <div class="skill-item">
          <span class="skill-icon">${s.icon}</span>
          <span class="skill-name">${s.name}</span>
        </div>
      `).join("");
      
      return `
        <div class="skills-category-box retro-card">
          <h3 class="category-title">${category}</h3>
          <div class="skills-list">
            ${skillsList}
          </div>
        </div>
      `;
    }).join("");

    return `
      <div class="modal-section">
        <h2 class="pixel-heading">My Tech Stack</h2>
        <div class="skills-grid">
          ${categories}
        </div>
      </div>
    `;
  }

  renderContact() {
    const { email, linkedin, github, twitter } = portfolioData.contact;
    return `
      <div class="modal-section contact-section">
        <h2 class="pixel-heading">Get In Touch</h2>
        <p class="contact-lead">Have a question or want to work together? Let's connect!</p>
        <div class="contact-links-grid">
          <a href="mailto:${email}" class="contact-card retro-card">
            <div class="contact-icon">📧</div>
            <span class="contact-label">Email</span>
            <span class="contact-val">${email}</span>
          </a>
          <a href="${linkedin}" target="_blank" class="contact-card retro-card">
            <div class="contact-icon">👔</div>
            <span class="contact-label">LinkedIn</span>
            <span class="contact-val">Connect</span>
          </a>
          <a href="${github}" target="_blank" class="contact-card retro-card">
            <div class="contact-icon">🐙</div>
            <span class="contact-label">GitHub</span>
            <span class="contact-val">Follow</span>
          </a>
          <a href="${twitter}" target="_blank" class="contact-card retro-card">
            <div class="contact-icon">🐦</div>
            <span class="contact-label">Twitter / X</span>
            <span class="contact-val">Follow</span>
          </a>
        </div>
      </div>
    `;
  }

  renderTimeline() {
    const items = portfolioData.experience.map(exp => `
      <div class="timeline-item">
        <div class="timeline-dot"></div>
        <div class="timeline-content retro-card">
          <span class="timeline-period">${exp.period}</span>
          <h3 class="timeline-title">${exp.title}</h3>
          <h4 class="timeline-company">${exp.company}</h4>
          <p class="timeline-desc">${exp.description}</p>
        </div>
      </div>
    `).join("");

    return `
      <div class="modal-section">
        <h2 class="pixel-heading">Experience & Education</h2>
        <div class="timeline">
          ${items}
        </div>
      </div>
    `;
  }

  renderTV() {
    return `
      <div class="modal-section">
        <h2 class="pixel-heading">Media Station</h2>
        <div class="retro-card" style="text-align: center; max-width: 500px; margin: 0 auto;">
          <p style="font-size: 2rem; margin-bottom: 1rem;">📺</p>
          <h3>Tech & Developer Content</h3>
          <p>I enjoy watching and learning from several tech content creators during my downtime:</p>
          <ul style="text-align: left; list-style-type: '⚡ '; margin: 1rem 0; padding-left: 2rem; line-height: 1.6;">
            <li><strong>ThePrimeagen</strong> - Vim, Go, coding setups & hot takes.</li>
            <li><strong>PirateSoftware</strong> - Game development, industry tips, and security.</li>
            <li><strong>Theo - t3.gg</strong> - Modern web technologies & framework debates.</li>
            <li><strong>Melkey</strong> - Rust, React, and software engineering humor.</li>
          </ul>
          <p>Turn on some lofi music and keep coding!</p>
        </div>
      </div>
    `;
  }

  renderBed() {
    return `
      <div class="modal-section">
        <h2 class="pixel-heading">The Ideation Zone</h2>
        <div class="retro-card" style="text-align: center; max-width: 500px; margin: 0 auto;">
          <p style="font-size: 2rem; margin-bottom: 1rem;">🛏️</p>
          <h3>Ideas & Sleep Schedule</h3>
          <p>They say developers turn caffeine into code. I turn sleep disruptions into software!</p>
          <p style="margin-top: 1rem; font-style: italic; color: var(--color-primary);">"My best ideas strike right when I'm trying to fall asleep. If I don't write them down immediately, they consume my thoughts all night!"</p>
        </div>
      </div>
    `;
  }

  renderExit() {
    return `
      <div class="modal-section">
        <h2 class="pixel-heading">Goodbye!</h2>
        <div class="retro-card" style="text-align: center; max-width: 400px; margin: 0 auto; padding: 2rem;">
          <p style="font-size: 2.5rem; margin-bottom: 1rem;">🚪</p>
          <h3>Thanks for visiting!</h3>
          <p>If you want to close the game, you can close this browser tab.</p>
          <p style="margin-top: 1rem;">Or you can reset your player position by clicking below:</p>
          <button onclick="window.location.reload()" class="retro-btn" style="margin-top: 1rem; width: 100%;">
            🔄 Restart Game
          </button>
        </div>
      </div>
    `;
  }

  renderWelcomeNPC() {
    const visitedCount = window.visitedObjectsCount || 0;
    const isCompleted = window.questCompleted || false;
    
    let questBoxHtml = "";
    if (isCompleted) {
      questBoxHtml = `
        <div class="quest-box completed">
          <span class="quest-badge">🏆</span>
          <strong>Quest Completed!</strong> You are now a certified <em>Wiki Explorer</em>! Thank you for exploring my room.
        </div>
      `;
    } else {
      questBoxHtml = `
        <div class="quest-box in-progress">
          <span class="quest-badge">⏳</span>
          <strong>Active Quest:</strong> Walk around and inspect <strong>5 interactive objects</strong> (PC, Desk, TV, Sofa, Bookshelf, Bed, Wall Board) to unlock the <em>Wiki Explorer</em> badge!
          <div class="quest-progress-bar">
            <div class="quest-progress-fill" style="width: ${visitedCount * 20}%;"></div>
          </div>
          <span class="quest-count">${visitedCount} / 5 Objects Inspected</span>
        </div>
      `;
    }

    return `
      <div class="modal-section welcome-npc-section">
        <h2 class="pixel-heading">SATI Bot (NPC)</h2>
        <div class="npc-dialog retro-card">
          <div class="npc-portrait">🤖</div>
          <div class="npc-text">
            <h3>Hello and welcome!</h3>
            <p>I am your guide bot. Welcome to this playable 2D portfolio room built on <strong>KAPLAY</strong> and <strong>Vite</strong>!</p>
            <div class="instructions-box">
              <h4>🎮 Controls Guide:</h4>
              <ul>
                <li><strong>Desktop</strong>: Use <strong>WASD</strong> or <strong>Arrow Keys</strong> to move your character.</li>
                <li><strong>Mobile/Touch</strong>: Use the **Virtual Joystick** on the bottom-left to walk.</li>
                <li><strong>Interaction</strong>: Walk near a sparkling object (PC, TV, Desk, Bookshelf, Sofa, Bed, etc.) to highlight it. On desktop, press <strong>E</strong> or <strong>Enter</strong> to open the menu. On mobile, tap the <strong>Interact</strong> button on the bottom-right.</li>
              </ul>
            </div>
            ${questBoxHtml}
            <p style="margin-top: 1rem;">Go ahead and explore the room! I'll be right here if you need to review these controls or check your progress.</p>
          </div>
        </div>
      </div>
    `;
  }
}

export const modals = new ModalController();
