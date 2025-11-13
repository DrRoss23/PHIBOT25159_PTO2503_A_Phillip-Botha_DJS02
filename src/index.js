// src/index.js
import "./components/PodcastPreview.js";
import { createGrid } from "./views/createGrid.js";
import { createModal } from "./components/createModal.js";
import { podcasts } from "./data.js";

// Render list
const grid = createGrid();
grid.render(podcasts);

// Listen for selections from any <podcast-preview>
document.addEventListener("podcast-select", (e) => {
  const selected = e.detail; // normalized by the component
  createModal.open(selected);
});

// Close button for the modal
document.getElementById("closeModal").addEventListener("click", () => {
  createModal.close();
});

// Click outside modal to close
document.getElementById("modal").addEventListener("click", (evt) => {
  if (evt.target.id === "modal") createModal.close();
});
