// src/components/PodcastPreview.js
// Adds aria-haspopup="dialog" to indicate the card opens a dialog.

import { DateUtils } from "../utils/DateUtils.js";
import { GenreService } from "../utils/GenreService.js";

const TEMPLATE_HTML = document.createElement("template");
TEMPLATE_HTML.innerHTML = `
  <style>
    :host {
      display: block;
      cursor: pointer;
      user-select: none;
      outline: none;
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
      aspect-ratio: 1 / 1;
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

/**
 * Custom Web Component that renders a podcast preview card.
 *
 * Public API:
 * 
 * **Attributes**
 * - `pid`      – string ID for the podcast  
 * - `title`    – title text  
 * - `image`    – URL for the cover image  
 * - `genres`   – comma-separated list or JSON-like array of names/IDs  
 * - `seasons`  – number of seasons (stringified number)  
 * - `updated`  – ISO date string representing last updated date  
 *
 * **Property**
 * - `data` – object form of all podcast fields  
 *   `{ id, title, image, genres, seasons, updated, description }`  
 *   Setting `.data` updates attributes so the component stays **stateless**
 *   and always renders from attribute values.
 *
 * **Events**
 * - `"podcast-select"` – fired on click/Enter/Space activation.  
 *   `event.detail` contains the full `.value` object of the podcast.  
 *
 * **Design Goals**
 * - Fully encapsulated via Shadow DOM  
 * - Works with attributes *or* properties  
 * - Emits events instead of opening modals itself  
 * - Keyboard & screen-reader accessible  
 * - Reusable across different apps/pages (demo.html proves this)  
 */
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

    this.$.card.addEventListener("click", () => this._emitSelect());

    this.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this._emitSelect();
      }
    });
  }

  connectedCallback() {
    if (!this.hasAttribute("tabindex")) this.setAttribute("tabindex", "0");
    if (!this.hasAttribute("role")) this.setAttribute("role", "button");
    if (!this.hasAttribute("aria-haspopup")) this.setAttribute("aria-haspopup", "dialog");

    this._syncAria();
    this._render();
  }

  attributeChangedCallback() {
    this._syncAria();
    this._render();
  }

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

  set data(obj) {
    this._data = obj ?? null;
    if (obj) {
      this.setAttribute("pid", obj.id ?? "");
      this.setAttribute("title", obj.title ?? "");
      this.setAttribute("image", obj.image ?? "");
      this.setAttribute("seasons", obj.seasons ?? "");
      this.setAttribute("updated", obj.updated ?? "");

      const g = Array.isArray(obj.genres)
        ? obj.genres.join(",")
        : (obj.genres ?? "");
      this.setAttribute("genres", g);
    }
  }

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

    this.$.img.src = v.image || "";
    this.$.img.alt = v.title || "Podcast cover";
    this.$.title.textContent = v.title || "";

    const s = Number.isFinite(v.seasons) ? v.seasons : 0;
    this.$.seasons.textContent = s ? `${s} season${s > 1 ? "s" : ""}` : "";
    this.$.updated.textContent = v.updated ? DateUtils.format(v.updated) : "";

    const names =
      typeof v.genres?.[0] === "number"
        ? GenreService.getNames(v.genres)
        : (v.genres || []);

    this.$.tags.innerHTML = names
      .map((g) => `<span class="tag">${g}</span>`)
      .join("");
  }
}

customElements.define("podcast-preview", PodcastPreview);
