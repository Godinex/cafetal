(async function () {
  const data = window.CAFETAL_DATA || await fetch("data.json").then(r => r.json());
  const { tipos, cartas, zonas } = data;
  const esc = s => String(s).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const $ = id => document.getElementById(id);

  // Menú móvil
  const burger = document.querySelector(".burger"), nav = document.querySelector(".top nav");
  burger.addEventListener("click", () => { const o = nav.classList.toggle("open"); burger.setAttribute("aria-expanded", o); });
  nav.querySelectorAll("a").forEach(a => a.addEventListener("click", () => nav.classList.remove("open")));

  // Zonas
  $("zonas").innerHTML = zonas.map(z => `
    <div class="zona"><img src="img/zonas/${z.slug}.jpg" alt="Paisaje cafetalero de ${esc(z.nombre)}" loading="lazy">
    <div><h4>${esc(z.nombre)}</h4><p class="zs">${esc(z.sub)}</p><p>${esc(z.texto)}</p></div></div>`).join("");

  // Filtros
  const state = { tipo: "", q: "" };
  const enGaleria = cartas.filter(c => c.tipo !== "leyenda");
  const cuenta = t => enGaleria.filter(c => c.tipo === t).length;
  function drawChips() {
    $("f-tipo").innerHTML = `<button class="chip" data-v="" aria-pressed="${state.tipo === ""}">Todo</button>` +
      Object.entries(tipos).filter(([k]) => cuenta(k)).map(([k, t]) =>
        `<button class="chip" data-v="${k}" aria-pressed="${state.tipo === k}" style="--c:${t.color}"><i></i>${esc(t.nombre)}</button>`).join("");
  }
  $("f-tipo").addEventListener("click", e => {
    const b = e.target.closest(".chip"); if (!b) return;
    state.tipo = b.dataset.v; drawChips(); drawGrid();
  });
  $("f-q").addEventListener("input", e => { state.q = e.target.value.trim().toLowerCase(); drawGrid(); });

  const sinTilde = s => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const card = (c, i, grupo) => `
    <button class="card" data-i="${i}" data-g="${grupo}" style="--c:${tipos[c.tipo].color}">
      <img class="art" src="${c.img}" alt="${esc(c.nombre)}" loading="lazy">
      <div class="meta"><div class="num">N.º ${c.id} · ${esc(tipos[c.tipo].nombre)}</div><h3>${esc(c.nombre)}</h3></div>
    </button>`;

  let current = [];
  function drawGrid() {
    const q = sinTilde(state.q);
    current = enGaleria.filter(c => (!state.tipo || c.tipo === state.tipo) && (!q || sinTilde(c.nombre).includes(q)));
    $("grid").innerHTML = current.map((c, i) => card(c, i, "g")).join("") ||
      `<p class="center"><i>No hay cartas con esos filtros.</i></p>`;
    $("count").textContent = `${current.length} carta${current.length === 1 ? "" : "s"}`;
  }
  drawChips(); drawGrid();
  const leyendas = cartas.filter(c => c.tipo === "leyenda");
  $("grid-noche").innerHTML = leyendas.map((c, i) => card(c, i, "n")).join("");

  // Ficha
  const dlg = $("ficha");
  let list = [], idx = 0;
  function show() {
    const c = list[idx], t = tipos[c.tipo];
    dlg.querySelector(".fx").style.setProperty("--c", t.color);
    $("fx-img").src = c.img; $("fx-img").alt = c.nombre;
    $("fx-num").textContent = `Carta n.º ${c.id} de ${cartas.length}`;
    $("fx-name").textContent = c.nombre;
    $("fx-tipo").textContent = t.nombre;
    $("fx-nota").textContent = c.nota;
    $("fx-pareja").textContent = c.pareja || "";
    $("fx-regla").textContent = t.regla;
  }
  document.addEventListener("click", e => {
    const b = e.target.closest(".card"); if (!b) return;
    list = b.dataset.g === "n" ? leyendas : current; idx = +b.dataset.i;
    show(); dlg.showModal();
  });
  dlg.querySelector(".close").addEventListener("click", () => dlg.close());
  dlg.addEventListener("click", e => { if (e.target === dlg) dlg.close(); });
  $("fx-prev").addEventListener("click", () => { idx = (idx - 1 + list.length) % list.length; show(); });
  $("fx-next").addEventListener("click", () => { idx = (idx + 1) % list.length; show(); });
  document.addEventListener("keydown", e => {
    if (!dlg.open) return;
    if (e.key === "ArrowRight") $("fx-next").click();
    if (e.key === "ArrowLeft") $("fx-prev").click();
  });
})();
