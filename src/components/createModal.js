// src/components/createModal.js
// Phase 2: accessibility improvements
// - Escape-to-close
// - Focus management (move focus into dialog; restore on close)
// - ARIA toggles (aria-hidden) without changing your HTML file

import { GenreService } from "../utils/GenreService.js";
import { DateUtils } from "../utils/DateUtils.js";
import { seasons } from "../data.js";

export const createModal = (() => {
  const el = (id) => document.getElementById(id);
  const modal = el("modal");
  const closeBtn = el("closeModal");

  // One-time ARIA baseline (does not modify HTML file)
  if (!modal.hasAttribute("role")) modal.setAttribute("role", "dialog");
  if (!modal.hasAttribute("aria-modal")) modal.setAttribute("aria-modal", "true");
  if (!modal.hasAttribute("aria-labelledby")) modal.setAttribute("aria-labelledby", "modalTitle");
  if (!modal.hasAttribute("aria-describedby")) modal.setAttribute("aria-describedby", "modalDesc");

  let _lastFocus = null;

  function updateContent(podcast) {
    el("modalImage").src = podcast.image || "";
    el("modalImage").alt = podcast.title || "Podcast cover";
    el("modalTitle").textContent = podcast.title || "";
    el("modalDesc").textContent = podcast.description || "";

    const names = Array.isArray(podcast.genres) && typeof podcast.genres[0] === "number"
      ? GenreService.getNames(podcast.genres)
      : (podcast.genres || []);

    el("modalGenres").innerHTML = names.map((g) => `<span class="tag">${g}</span>`).join("");
    el("modalUpdated").textContent = DateUtils.format(podcast.updated);

    const seasonData = seasons.find((s) => s.id === podcast.id)?.seasonDetails || [];
    el("seasonList").innerHTML = seasonData
      .map((s, index) => `
        <li class="season-item">
          <strong class="season-title">Season ${index + 1}: ${s.title}</strong>
          <span class="episodes">${s.episodes} episodes</span>
        </li>
      `)
      .join("");
  }

  function trapKey(e) {
    if (e.key === "Escape") {
      e.stopPropagation();
      api.close();
    }
  }

  const api = {
    open(podcast) {
      _lastFocus = document.activeElement;
      updateContent(podcast);
      modal.classList.remove("hidden");
      modal.setAttribute("aria-hidden", "false");

      // Focus the close button for immediate keyboard access
      closeBtn?.focus();

      // Esc to close while open
      document.addEventListener("keydown", trapKey, true);
    },
    close() {
      modal.classList.add("hidden");
      modal.setAttribute("aria-hidden", "true");

      document.removeEventListener("keydown", trapKey, true);
      // Restore focus to the previously focused element, if still in the document
      if (_lastFocus && document.contains(_lastFocus)) {
        _lastFocus.focus();
      }
      _lastFocus = null;
    },
  };

  return api;
})();
