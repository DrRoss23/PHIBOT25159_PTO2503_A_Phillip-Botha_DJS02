# 🎧 DJS02 – Web Component: Podcast Preview

This project builds a **reusable and encapsulated Web Component** that displays a podcast preview card.  
The component is designed to be **modular, stateless, and framework-agnostic**, making it easy to reuse across different applications.

---

## 🚀 Overview

`<podcast-preview>` is a custom HTML element that:
- Displays a podcast’s cover image, title, genres, season count, and last updated date.  
- Accepts all data through HTML attributes or a `.data` property.  
- Uses **Shadow DOM** for style and logic encapsulation.  
- Emits a **`podcast-select`** custom event when clicked or activated with Enter / Space.  
- Works completely independently from the main application logic.

=========================

## 🧩 Project Structure

📦 DJS02
┣ 📂 src
┃ ┣ 📂 components
┃ ┃ ┣ 📜 PodcastPreview.js → main Web Component
┃ ┃ ┗ 📜 createModal.js → modal controller with ARIA support
┃ ┣ 📂 utils
┃ ┃ ┣ 📜 DateUtils.js → formats ISO dates to “Updated Month Day, Year”
┃ ┃ ┗ 📜 GenreService.js → resolves genre IDs to human-readable names
┃ ┗ 📂 views
┃ ┗ 📜 createGrid.js → renders < podcast-preview > cards
┣ 📜 data.js → podcast and genre data
┣ 📜 index.html → main app entry (for grid + modal)
┣ 📜 demo.html → standalone component demo page
┣ 📜 styles.css → global layout and modal styles
┗ 📜 README.md → project documentation

=========================

## ⚙️ How to Run Locally

1. Clone this repository  
2. Open `index.html` directly in your browser (or use VS Code Live Server)  
3. The podcast grid should load dynamically with interactive cards and a modal.

---

## 🎨 How to Interact (with the App)

- Each `<podcast-preview>` represents one podcast.  
- Click or press **Enter / Space** to open its details in a modal dialog.  
- Press **Escape** to close the modal.  
- Focus automatically moves to the Close button and returns to the previous card on close.  

All styles for each card are encapsulated in the component’s Shadow DOM, while the modal and grid are styled globally.

---

## 🧠 Component Usage Guide

### 1️⃣ Register the Component

```js
import "./src/components/PodcastPreview.js";

Once imported, you can use <podcast-preview> elements anywhere in your HTML.

---

2️⃣ Passing Data

Option A — HTML Attributes (stateless)

<podcast-preview
  pid="demo1"
  title="History Bites"
  image="https://picsum.photos/seed/history/400/400"
  genres="History,Education"
  seasons="2"
  updated="2025-09-20"
></podcast-preview>

Option B — JavaScript .data Property

const card = document.createElement("podcast-preview");
card.data = {
  id: "p1",
  title: "History Bites",
  image: "history.png",
  genres: [1, 3], // genre IDs resolved via GenreService
  seasons: 2,
  updated: "2025-09-20",
};
document.body.appendChild(card);

---

3️⃣ Listening for Interaction Events

Each component emits a bubbling, composed custom event podcast-select when clicked or activated via keyboard:

document.addEventListener("podcast-select", (e) => {
  console.log("Selected podcast:", e.detail);
  // e.detail includes: { id, title, image, genres, seasons, updated, description }
});

The parent application (in this case, src/index.js) listens for this event to open the modal.

---

♿ Accessibility Highlights

Accessibility was a key focus in Phase 2:

- Keyboard navigation
(a)Cards are focusable (tabindex="0")
(b)Can be activated with Enter or Space

- Semantic roles
(a)Each card has role="button" and aria-haspopup="dialog"
(b)The modal uses role="dialog" with aria-modal="true"

- Focus management
(a)Focus is trapped inside the modal while open
(b)Focus returns to the triggering card when closed

- Escape key
(a)Pressing Escape closes the modal immediately

- Screen reader announcement
(a)A hidden live region announces when the dialog opens (e.g., “Dialog opened: [Title]”)

---

🧪 Demo Page (Deliverable)

Open demo.html
 in your browser to test <podcast-preview> running on its own — no app scripts required.

This verifies the component’s independence and reusability.
The demo includes:

- One example using genre names
- One example using numeric genre IDs
- Console logging and alert on event trigger

---

🧹 Code Quality & Maintainability

ES6+ syntax and modular imports

JSDoc comments for helper utilities

Shadow DOM encapsulation

No external frameworks only native JavaScript, HTML, and CSS

Consistent naming conventions across files

Clear commit messages documenting each implementation phase

---

✅ Summary
Phase	Description	Status
Phase 1	Core Web Component creation + integration with modal	✅Completed
Phase 2	Accessibility enhancements + event handling + demo page	✅Completed
Phase 3	Documentation + README finalization	✅Completed

This final version satisfies all DJS02 requirements:

Fully functional <podcast-preview> Web Component

Accessible modal integration

Independent demo page

Comprehensive documentation for use and review

---

Author: Phillip Botha
Project: DJS02 – Web Component: Podcast Preview
Course: CodeSpace Software Development Program

---
