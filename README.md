# 🎮 2D Pixel-Art Developer Portfolio Game

An interactive, playable 2D top-down portfolio website built using **KAPLAY (formerly Kaboom.js)** as the game engine and **Vite** as the build tool. Instead of browsing a static web page, visitors can navigate a character around a custom pixel-art room and interact with physical objects to discover my projects, skills, education timeline, and Wikimedia contributions.

👉 **[Play the Game Live Here!](https://Mohit-07-delta.github.io/2d-portfolio/)**

---

## 🌟 Key Features

*   **🎮 Dual Controls Input**: Smooth, normalized character movement using **WASD / Arrow Keys** on desktop and a custom semi-transparent **Virtual Joystick HUD** on mobile/touch viewports.
*   **🔊 Real-time Web Audio Synthesizer**: Custom synthesized retro 8-bit sound effects (ascending chimes for interactions, descending notes for closes, low-frequency percussive walking thuds) and a warm triangle-wave BGM loop generated in real-time using the **Web Audio API** (requires zero external audio file latency!).
*   **📋 Responsive Glassmorphic Modals**: High-performance UI overlays built with CSS Grid/Flexbox displaying:
    *   **About Me**: A pixel-art avatar, bio statement, and a resume download link.
    *   **Projects**: Interactive card grid linking to GitHub repositories and live demos.
    *   **Skills**: Tech stack chips categorized into Frontend, Backend, and Tools.
    *   **Experience & Education**: A vertical chronological timeline showcasing academic coursework and technical milestones.
    *   **Wikimedia Profile**: Dedicated section showcasing community organizing and Meta-Wiki contributions.
*   **🏆 Quest & Achievement System**: The guide NPC (**SATI Bot**) issues an active quest to inspect 5 objects in the room. Progress is tracked via a visual progress bar inside the NPC dialogue, and completing it triggers a custom C-major arpeggio chime and slides down a gold-bordered achievement banner.
*   **⚙️ Modular Data Setup**: Centralized JS object configuration in `/src/data.js` separating content from game engine logic for simple customizations.
*   **🐛 Focus Lock Fix**: Robust programmatic canvas autofocus (`canvas.focus()`) and `tabindex` handling to prevent keys from getting locked up or lost when closing modals.

---

## 🛠️ Tech Stack

*   **Core Engine:** [KAPLAY](https://kaplayjs.com/) (The maintained successor of Kaboom.js)
*   **Bundler & Dev Server:** Vite
*   **Programming Language:** JavaScript (ES6 Modules)
*   **Styling & UI Overlays:** HTML5 Canvas, Vanilla CSS3 (Custom properties, CSS Grid, animations)
*   **Audio Pipeline:** Web Audio API (native browser synthesis)

---

## 📂 Project Structure

```
2d-portfolio/
├── package.json           # Vite and KAPLAY dependencies
├── vite.config.js         # Base paths, server, and bundler parameters
├── index.html             # Main page, overlays (modals, joypad, audio HUD)
├── public/
│   └── assets/            # Sprites, map textures, tiled level, and fonts
└── src/
    ├── main.js            # Core game scene, physics, loop, and input parsing
    ├── kaboomCtx.js       # KAPLAY engine context setup
    ├── data.js            # Customizable portfolio data (Bio, Projects, Timeline)
    ├── modal.js           # Handles HTML overlays, animations, and data injection
    ├── sound.js           # 8-bit Audio synthesizer (Web Audio API)
    ├── controls.js        # Mobile touch joystick and interact click tracker
    └── styles.css         # Styling system for modals, buttons, and joystick HUD
```

---

## 🚀 Getting Started

To run the game locally or build it for static production deployment, follow these commands:

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) installed on your machine.

### 1. Install Dependencies
Navigate into the `2d-portfolio` directory and run:
```bash
cd 2d-portfolio
npm install
```

### 2. Start Local Dev Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** (or the port shown in your terminal) to explore the game.

### 3. Build for Production
To bundle and minify the static files into `dist/`:
```bash
npm run build
```

---

## 🎮 Game Controls

| Device | Action | Control |
| :--- | :--- | :--- |
| **Desktop** | Movement | `W`, `A`, `S`, `D` or `Arrow Keys` |
| **Desktop** | Interaction | `E` or `Enter` (when near an object) |
| **Mobile** | Movement | Drag the **Virtual Joystick** on the bottom-left |
| **Mobile** | Interaction | Tap the **INTERACT** button on the bottom-right |
| **Global** | Close Modal | `Esc` key or click the `✕` button |
| **Global** | Audio Controls | Toggle buttons in the top-right corner |

---

## 📦 Deployment

This project is fully configured for deployment on **GitHub Pages** using the `gh-pages` package:

```bash
npm run deploy
```
*This command runs the production build and pushes the compiled files in `dist/` directly to the `gh-pages` branch on your repository, making it live on the web instantly.*

---

## 📜 Credits & License

*   **Tileset Graphics:** Built using the free **"Happy La V2"** tileset pack (available on itch.io).
*   **Game Engine Layout Reference:** Inspired by JSLegendDev's open-source 2D portfolio Kaboom template.
*   **License:** MIT License. Feel free to clone, edit, and use this template for your own developer profile!
