// src/views/createGrid.js
export const createGrid = () => {
  const container = document.getElementById("podcastGrid");

  return {
    /**
     * Render a list of podcast objects using <podcast-preview>.
     * @param {Array<Object>} list
     */
    render(list) {
      container.innerHTML = "";
      list.forEach((p) => {
        const el = document.createElement("podcast-preview");
        // .data reflects key fields back to attributes (stateless API)
        el.data = p;
        container.appendChild(el);
      });
    },
  };
};
