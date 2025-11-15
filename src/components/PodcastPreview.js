// src/components/PodcastPreview.js
// DJS02 – Reusable, encapsulated Web Component for a podcast preview.
// Accessibility additions in Phase 2:
// - Host is keyboard-focusable (tabindex="0") and role="button"
// - Space/Enter fire the same select event as click
// - aria-label kept in sync with title + seasons for screen readers

import { DateUtils } from "../utils/DateUtils.js";
import { GenreService } from "../utils/GenreService.js";

const TEMPLATE_HTML = document.createElement("template");
TEMPLATE_HTML.innerHTML = `
  <style>
    :host {
      display: block;
      cursor: pointer;
      user-select: none;
      outline: none; /* we'll show a custom outline on focus-visible */
    }
    .card {
      background: white;
      padding: 1rem;
      border-radius: 8px;
      box-shadow: 0 2px 6px rgba(0,0,0,0.1);
      transition: transform .2s ease;
      height: 100%;
    }
    .card:hover { transform: scale(1.02); }
    /* High-contrast focus ring (respects prefers-reduced-motion for hover only) */
    :host(:focus-visible) .card {
      outline: 3px solid CanvasText;
      outline-offset: 3px;
    }
    @media (prefers-reduced-motion: reduce) {
      .card { transition: none; }
      .card:hover { transform: none; }
    }
    .cover {
      width: 100%;
      height: auto;
      border-radius: 6px;
      display: block;
      aspect-ratio: 1 / 1; /* consistent thumbnails if images vary */
      object-fit: cover;
    }
    h3 {
      margin: .5rem 0 .25rem 0;
      font-size: 1rem;
      line-height: 1.2;
    }
    .sub {
      margin: 0;
      font-size: .8rem;
      color: #555;
    }
    .tags { margin: .5rem 0 0 0; }
    .tag {
      background: #eee;
      padding: .3rem .6rem;
      margin: .25rem .5rem .25rem 0;
      border-radius: 4px;
      display: inline-block;
      font-size: .75rem;
      line-height: 1;
    }
  </style>

  <article class="card" part="card">
    <img class="cover" part="cover" />
    <h3 part="title"></h3>
    <p class="sub" part="seasons"></p>
    <p class="sub" part="updated"></p>
    <div class="tags" part="tags"></div>
  </article>
`;

export class PodcastPreview extends HTMLElement {
  static get observedAttributes() {
    return ["pid", "title", "image", "genres", "seasons", "updated"];
  }

  constructor() {
    super();
    this._data = null;

    this.attachShadow({ mode: "open" });
    this.shadowRoot.appendChild(TEMPLATE_HTML.content.cloneNode(true));

    this.$ = {
      card: this.shadowRoot.querySelector(".card"),
      img: this.shadowRoot.querySelector(".cover"),
      title: this.shadowRoot.querySelector("h3"),
      seasons: this.shadowRoot.querySelector('[part="seasons"]'),
      updated: this.shadowRoot.querySelector('[part="updated"]'),
      tags: this.shadowRoot.querySelector(".tags"),
    };

    // Click -> bubble a custom event to the parent app
    this.$.card.addEventListener("click", () => this._emitSelect());

    // Keyboard: handle Enter/Space on the host
    this.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault(); // prevent page scroll on Space
        this._emitSelect();
      }
    });
  }

  connectedCallback() {
    // A11y defaults: focusable button-like host
    if (!this.hasAttribute("tabindex")) this.setAttribute("tabindex", "0");
    if (!this.hasAttribute("role")) this.setAttribute("role", "button");
    this._syncAria();
    this._render();
  }

  attributeChangedCallback() {
    this._syncAria();
    this._render();
  }

  /**
   * Normalized "value" regardless of attributes vs .data usage.
   */
  get value() {
    return {
      id: this.getAttribute("pid") || this._data?.id || "",
      title: this.getAttribute("title") || this._data?.title || "",
      image: this.getAttribute("image") || this._data?.image || "",
      genres: this._readGenres(),
      seasons: this._readInt("seasons"),
      updated: this.getAttribute("updated") || this._data?.updated || "",
      description: this._data?.description || "",
    };
  }

  /** Allow parent code to set a whole object: el.data = {...} */
  set data(obj) {
    this._data = obj ?? null;
    if (obj) {
      this.setAttribute("pid", obj.id ?? "");
      this.setAttribute("title", obj.title ?? "");
      this.setAttribute("image", obj.image ?? "");
      this.setAttribute("seasons", obj.seasons ?? "");
      this.setAttribute("updated", obj.updated ?? "");
      const g = Array.isArray(obj.genres) ? obj.genres.join(",") : (obj.genres ?? "");
      this.setAttribute("genres", g);
    }
  }

  // ---- private helpers ----
  _emitSelect() {
    this.dispatchEvent(
      new CustomEvent("podcast-select", {
        bubbles: true,
        composed: true,
        detail: this.value,
      })
    );
  }

  _readInt(attr) {
    const v = this.getAttribute(attr);
    const n = Number(v);
    return Number.isFinite(n) ? n : (this._data?.[attr] ?? 0);
  }

  _readGenres() {
    const raw = this.getAttribute("genres");
    if (raw == null) return this._data?.genres ?? [];
    return raw
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean)
      .map((x) => (isNaN(Number(x)) ? x : Number(x)));
  }

  _syncAria() {
    const t = this.getAttribute("title") || this._data?.title || "Podcast";
    const s = this._readInt("seasons");
    const seasonsLabel = s ? `${s} season${s > 1 ? "s" : ""}` : "";
    const label = seasonsLabel ? `${t} — ${seasonsLabel}` : t;
    this.setAttribute("aria-label", label);
  }

  _render() {
    const v = this.value;

    // image & title
    this.$.img.src = v.image || "";
    this.$.img.alt = v.title || "Podcast cover";
    this.$.title.textContent = v.title || "";

    // seasons + updated
    const s = Number.isFinite(v.seasons) ? v.seasons : 0;
    this.$.seasons.textContent = s ? `${s} season${s > 1 ? "s" : ""}` : "";
    this.$.updated.textContent = v.updated ? DateUtils.format(v.updated) : "";

    // genres: accept ids or names; resolve ids via GenreService
    const names =
      typeof v.genres?.[0] === "number"
        ? GenreService.getNames(v.genres)
        : (v.genres || []);
    this.$.tags.innerHTML = names.map((g) => `<span class="tag">${g}</span>`).join("");
  }
}

customElements.define("podcast-preview", PodcastPreview);
