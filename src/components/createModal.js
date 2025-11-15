// src/components/createModal.js
// Phase 2 additions:
// - Escape-to-close (from earlier step)
// - Focus management: remember opener, move focus into dialog, restore on close
// - Focus trap: keep Tab/Shift+Tab inside the dialog while open
// - ARIA toggles + polite live region announced on open (no HTML edits)

import { GenreService } from "../utils/GenreService.js";
import { DateUtils } from "../utils/DateUtils.js";
import { seasons } from "../data.js";

export const createModal = (() => {
  const el = (id) => document.getElementById(id);
  const modal = el("modal");
  const closeBtn = el("closeModal");

  // One-time ARIA baseline (don’t modify HTML file)
  if (!modal.hasAttribute("role")) modal.setAttribute("role", "dialog");
  if (!modal.hasAttribute("aria-modal")) modal.setAttribute("aria-modal", "true");
  if (!modal.hasAttribute("aria-labelledby")) modal.setAttribute("aria-labelledby", "modalTitle");
  if (!modal.hasAttribute("aria-describedby")) modal.setAttribute("aria-describedby", "modalDesc");

  // Polite live region for screen reader announcement on open
  let live = document.getElementById("sr-live-region");
  if (!live) {
    live = document.createElement("div");
    live.id = "sr-live-region";
    live.setAttribute("role", "status");
    live.setAttribute("aria-live", "polite");
    live.style.position = "absolute";
    live.style.width = "1px";
    live.style.height = "1px";
    live.style.margin = "-1px";
    live.style.border = "0";
    live.style.padding = "0";
    live.style.clip = "rect(0 0 0 0)";
    live.style.overflow = "hidden";
    document.body.appendChild(live);
  }

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
      return;
    }

    if (e.key !== "Tab") return;

    // Focus trap for Tab/Shift+Tab
    const focusables = modal.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    if (!focusables.length) return;

    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (e.shiftKey) {
      if (active === first || !modal.contains(active)) {
        last.focus();
        e.preventDefault();
      }
    } else {
      if (active === last) {
        first.focus();
        e.preventDefault();
      }
    }
  }

  const api = {
    open(podcast) {
      _lastFocus = document.activeElement;

      updateContent(podcast);

      modal.classList.remove("hidden");
      modal.setAttribute("aria-hidden", "false");

      // Announce opening & title for screen readers
      const titleText = (document.getElementById("modalTitle")?.textContent || "Details").trim();
      live.textContent = `Dialog opened: ${titleText}`;

      // Focus the close button for immediate keyboard access
      closeBtn?.focus();

      // Enable keyboard handlers while open
      document.addEventListener("keydown", trapKey, true);
    },

    close() {
      modal.classList.add("hidden");
      modal.setAttribute("aria-hidden", "true");

      document.removeEventListener("keydown", trapKey, true);

      // Restore focus to the previously focused element, if still present
      if (_lastFocus && document.contains(_lastFocus)) {
        _lastFocus.focus();
      }
      _lastFocus = null;
    },
  };

  return api;
})();
