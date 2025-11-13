// src/components/createModal.js
import { GenreService } from "../utils/GenreService.js";
import { DateUtils } from "../utils/DateUtils.js";
import { seasons } from "../data.js";

export const createModal = (() => {
  const el = (id) => document.getElementById(id);
  const modal = el("modal");

  function updateContent(podcast) {
    el("modalImage").src = podcast.image || "";
    el("modalImage").alt = podcast.title || "Podcast cover";
    el("modalTitle").textContent = podcast.title || "";
    el("modalDesc").textContent = podcast.description || "";

    // Resolve genres: support ids or already-resolved names
    const names = Array.isArray(podcast.genres) && typeof podcast.genres[0] === "number"
      ? GenreService.getNames(podcast.genres)
      : (podcast.genres || []);

    el("modalGenres").innerHTML = names
      .map((g) => `<span class="tag">${g}</span>`)
      .join("");

    el("modalUpdated").textContent = DateUtils.format(podcast.updated);

    // Optional: render seasons list if available in data.js
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

  return {
    open(podcast) {
      updateContent(podcast);
      modal.classList.remove("hidden");
    },
    close() {
      modal.classList.add("hidden");
    },
  };
})();
