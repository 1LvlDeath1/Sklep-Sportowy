const products = [
  {
    id: 1,
    img: "images/product-jacket.jpg",
    name: "Aeron Vapor Shell",
    sub: "Kurtka wiatroodporna",
    price: 589,
    oldPrice: null,
    badge: "new",
  },
  {
    id: 2,
    img: "images/product-shoes.jpg",
    name: "Aeron Pulse X",
    sub: "Buty do biegania",
    price: 749,
    oldPrice: 899,
    badge: "sale",
  },
  {
    id: 3,
    img: "images/product-shorts.jpg",
    name: "Aeron Flex Pro",
    sub: "Spodenki treningowe",
    price: 249,
    oldPrice: null,
    badge: null,
  },
  {
    id: 4,
    img: "images/product-tee.jpg",
    name: "Aeron Core Tee",
    sub: "Koszulka kompresyjna",
    price: 189,
    oldPrice: null,
    badge: "new",
  },
  {
    id: 5,
    img: "images/product-backpack.jpg",
    name: "Aeron Trail Pack",
    sub: "Plecak do biegania",
    price: 449,
    oldPrice: 520,
    badge: "sale",
  },
  {
    id: 6,
    img: "images/product-cap.jpg",
    name: "Aeron Speed Cap",
    sub: "Czapka aerodynamiczna",
    price: 149,
    oldPrice: null,
    badge: null,
  },
];

// Fix 4a — restore cart from localStorage on startup
let cart = JSON.parse(localStorage.getItem("aeron_cart") || "[]");

function renderProducts() {
  const container = $.productsScroll;
  container.innerHTML = products
    .map(
      (p) => `
      <div class="product-card reveal" data-id="${p.id}">
        <div class="product-img">
          <div class="product-img-inner"><img src="${p.img}" alt="${p.name}" loading="lazy"></div>
          ${p.badge ? `<span class="product-badge ${p.badge === "new" ? "new" : ""}">${p.badge === "new" ? "Nowość" : "Wyprzedaż"}</span>` : ""}
          <button class="product-quick" onclick="addToCart(${p.id}, event)">+ Do koszyka</button>
        </div>
        <div class="product-name">${p.name}</div>
        <div class="product-sub">${p.sub}</div>
        <div class="product-price">
          ${p.oldPrice ? `<span class="old">${p.oldPrice} zł</span>` : ""}
          ${p.price} zł
        </div>
      </div>
    `,
    )
    .join("");
  observeReveal();
}

function addToCart(productId, e) {
  e && e.stopPropagation();
  const product = products.find((p) => p.id === productId);
  if (!product) return;
  const existing = cart.find((i) => i.id === productId);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  updateCartUI();
  showToast(`${product.name} dodany do koszyka!`);
}

function removeFromCart(productId) {
  cart = cart.filter((i) => i.id !== productId);
  updateCartUI();
}

function changeQty(productId, delta) {
  const item = cart.find((i) => i.id === productId);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(productId);
  else updateCartUI();
}

function updateCartUI() {
  // Fix 4b — persist cart to localStorage on every change
  localStorage.setItem("aeron_cart", JSON.stringify(cart));

  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const count = cart.reduce((s, i) => s + i.qty, 0);
  const countEl = $.cartCount;
  countEl.textContent = count;
  countEl.classList.toggle("show", count > 0);
  $.cartHeader.textContent = count > 0 ? `(${count})` : "";
  $.cartTotal.textContent = `${total} zł`;
  $.cartFooter.style.display = count > 0 ? "block" : "none";
  renderCartItems();
}

function renderCartItems() {
  const el = $.cartItems;
  if (cart.length === 0) {
    el.innerHTML = `<div class="cart-empty">
        <svg viewBox="0 0 24 24" stroke-width="1"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
        <p>Koszyk jest pusty</p>
      </div>`;
    return;
  }
  el.innerHTML = cart
    .map(
      (item) => `
      <div class="cart-item">
        <div class="cart-item-img"><img src="${item.img}" alt="${item.name}" loading="lazy"></div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-sub">${item.sub}</div>
          <div class="cart-item-price">${item.price * item.qty} zł</div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
            <button class="remove-btn" onclick="removeFromCart(${item.id})">Usuń</button>
          </div>
        </div>
      </div>
    `,
    )
    .join("");
}

function toggleCart() {
  $.cartDrawer.classList.toggle("open");
  $.cartOverlay.classList.toggle("open");
}

function toggleSearch() {
  const wrap = $.searchWrap;
  wrap.classList.toggle("open");
  if (wrap.classList.contains("open")) $.searchInput.focus();
}

let toastTimer;
function showToast(msg) {
  const t = $.toast;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2500);
}

function ripple(e) {
  const btn = e.currentTarget;
  const r = document.createElement("span");
  const d = Math.max(btn.offsetWidth, btn.offsetHeight);
  r.className = "ripple";
  r.style.cssText = `width:${d}px;height:${d}px;left:${e.offsetX - d / 2}px;top:${e.offsetY - d / 2}px;`;
  btn.appendChild(r);
  setTimeout(() => r.remove(), 700);
}

function scrollToSection(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

window.addEventListener("scroll", () => {
  $.navbar.classList.toggle("scrolled", window.scrollY > 50);
});

function observeReveal() {
  const els = document.querySelectorAll(".reveal:not(.visible)");
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("visible");
          observer.unobserve(e.target);
        }
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -60px 0px" },
  );
  els.forEach((el) => observer.observe(el));
}

const cursor = document.getElementById("cursor");
const ring = document.getElementById("cursor-ring");
let mx = 0,
  my = 0,
  rx = 0,
  ry = 0;

function animateRing() {
  rx += (mx - rx - 20) * 0.12;
  ry += (my - ry - 20) * 0.12;
  ring.style.left = rx + "px";
  ring.style.top = ry + "px";
  requestAnimationFrame(animateRing);
}
animateRing();

function createSpeedLines() {
  const container = document.getElementById("speedLines");
  for (let i = 0; i < 20; i++) {
    const line = document.createElement("div");
    line.className = "speed-line";
    const top = Math.random() * 100;
    const width = 100 + Math.random() * 300;
    const delay = Math.random() * 4;
    const dur = 2 + Math.random() * 3;
    line.style.cssText = `top:${top}%;width:${width}px;animation-delay:${delay}s;animation-duration:${dur}s;`;
    container.appendChild(line);
  }
}

// Fix 1 — cached DOM element references, initialised once after DOM is ready
const $ = {
  cartDrawer: document.getElementById("cartDrawer"),
  cartOverlay: document.getElementById("cartOverlay"),
  cartItems: document.getElementById("cartItems"),
  cartFooter: document.getElementById("cartFooter"),
  cartCount: document.getElementById("cartCount"),
  cartTotal: document.getElementById("cartTotal"),
  cartHeader: document.getElementById("cartItemCountHeader"),
  toast: document.getElementById("toast"),
  navbar: document.getElementById("navbar"),
  searchWrap: document.getElementById("searchWrap"),
  searchInput: document.getElementById("searchInput"),
  productsScroll: document.getElementById("productsScroll"),
};

// --- INIT ---
createSpeedLines();
renderProducts();
observeReveal();
updateCartUI();

const lightningCanvas = document.getElementById("lightningCanvas");
const lCtx = lightningCanvas.getContext("2d");

function resizeLightningCanvas() {
  lightningCanvas.width = window.innerWidth;
  lightningCanvas.height = window.innerHeight;
}
resizeLightningCanvas();
window.addEventListener("resize", resizeLightningCanvas);

const bolts = [];
let lastLX = 0,
  lastLY = 0;

function jolt(x1, y1, x2, y2, depth) {
  if (depth === 0) return [[x1, y1, x2, y2]];
  const spread = Math.hypot(x2 - x1, y2 - y1) * 0.45;
  const mx = (x1 + x2) / 2 + (Math.random() - 0.5) * spread;
  const my = (y1 + y2) / 2 + (Math.random() - 0.5) * spread;
  return [
    ...jolt(x1, y1, mx, my, depth - 1),
    ...jolt(mx, my, x2, y2, depth - 1),
  ];
}

// Fix 2 — single merged mousemove handler (cursor tracking + lightning bolt generation)
document.addEventListener("mousemove", (e) => {
  mx = e.clientX;
  my = e.clientY;
  cursor.style.left = mx - 6 + "px";
  cursor.style.top = my - 6 + "px";

  const dx = e.clientX - lastLX;
  const dy = e.clientY - lastLY;
  const dist = Math.sqrt(dx * dx + dy * dy);

  if (dist > 6) {
    bolts.push({
      segs: jolt(lastLX, lastLY, e.clientX, e.clientY, 3),
      alpha: 1.0,
      decay: 0.04 + Math.random() * 0.04,
      width: 1.5 + Math.random(),
    });

    if (Math.random() < 0.4) {
      const bx = lastLX + dx * 0.5 + (Math.random() - 0.5) * 70;
      const by = lastLY + dy * 0.5 + (Math.random() - 0.5) * 70;
      bolts.push({
        segs: jolt(lastLX + dx * 0.25, lastLY + dy * 0.25, bx, by, 2),
        alpha: 0.55,
        decay: 0.07 + Math.random() * 0.07,
        width: 0.8,
      });
    }

    lastLX = e.clientX;
    lastLY = e.clientY;
  }

  if (bolts.length > 60) bolts.splice(0, bolts.length - 60);

  // Fix 3 — only start the RAF loop when there is work to do
  scheduleLightning();
});

// Fix 3 — RAF loop that pauses itself when the bolts array is empty
let rafId = null;

function drawLightning() {
  lCtx.clearRect(0, 0, lightningCanvas.width, lightningCanvas.height);

  for (let i = bolts.length - 1; i >= 0; i--) {
    const bolt = bolts[i];
    bolt.alpha -= bolt.decay;
    if (bolt.alpha <= 0) {
      bolts.splice(i, 1);
      continue;
    }

    lCtx.save();
    lCtx.globalAlpha = bolt.alpha;
    lCtx.lineCap = "round";
    lCtx.lineJoin = "round";

    lCtx.shadowColor = "#c8f02e";
    lCtx.shadowBlur = 18;
    lCtx.strokeStyle = "rgba(200,240,46,0.85)";
    lCtx.lineWidth = bolt.width;
    bolt.segs.forEach(([x1, y1, x2, y2]) => {
      lCtx.beginPath();
      lCtx.moveTo(x1, y1);
      lCtx.lineTo(x2, y2);
      lCtx.stroke();
    });

    lCtx.shadowBlur = 4;
    lCtx.strokeStyle = "rgba(255,255,220,0.95)";
    lCtx.lineWidth = bolt.width * 0.35;
    bolt.segs.forEach(([x1, y1, x2, y2]) => {
      lCtx.beginPath();
      lCtx.moveTo(x1, y1);
      lCtx.lineTo(x2, y2);
      lCtx.stroke();
    });

    lCtx.restore();
  }

  if (bolts.length > 0) {
    rafId = requestAnimationFrame(drawLightning);
  } else {
    rafId = null;
  }
}

function scheduleLightning() {
  if (!rafId) rafId = requestAnimationFrame(drawLightning);
}
