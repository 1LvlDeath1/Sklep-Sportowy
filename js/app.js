
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

let toastTimer;
function showToast(msg) {
  const t = $.toast;
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2500);
}

function ripple(e, btn) {
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

function toggleCart() {
  $.cartDrawer.classList.toggle("open");
  $.cartOverlay.classList.toggle("open");
}

function toggleSearch() {
  const wrap = $.searchWrap;
  wrap.classList.toggle("open");
  if (wrap.classList.contains("open")) $.searchInput.focus();
}

function updateCartUI() {
  const total = CartService.getTotal();
  const count = CartService.getCount();
  
  $.cartCount.textContent = count;
  $.cartCount.classList.toggle("show", count > 0);
  $.cartHeader.textContent = count > 0 ? `(${count})` : "";
  $.cartTotal.textContent = `${total} zł`;
  $.cartFooter.style.display = count > 0 ? "block" : "none";
  
  CartService.renderCartItems($.cartItems);
}

function renderProducts() {
  if (!$.productsScroll) return;
  $.productsScroll.innerHTML = products
    .map(
      (p) => `
      <div class="product-card reveal" data-id="${p.id}" tabindex="0" role="button">
        <div class="product-img">
          <div class="product-img-inner"><img src="${p.img}" alt="${p.name}" loading="lazy"></div>
          ${p.badge ? `<span class="product-badge ${p.badge === "new" ? "new" : ""}">${p.badge === "new" ? "Nowość" : "Wyprzedaż"}</span>` : ""}
          <button class="product-quick" data-action="add-to-cart" data-id="${p.id}">+ Do koszyka</button>
        </div>
        <div class="product-name">${p.name}</div>
        <div class="product-sub">${p.sub}</div>
        <div class="product-price">
          ${p.oldPrice ? `<span class="old">${p.oldPrice} zł</span>` : ""}
          ${p.price} zł
        </div>
      </div>
    `
    )
    .join("");
  observeReveal();
}

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
    { threshold: 0.1, rootMargin: "0px 0px -60px 0px" }
  );
  els.forEach((el) => observer.observe(el));
}

function createSpeedLines() {
  const container = document.getElementById("speedLines");
  if (!container) return;
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

function initEvents() {
  // Global click event delegation
  document.addEventListener("click", (e) => {
    const actionBtn = e.target.closest("[data-action]");
    if (actionBtn) {
      const action = actionBtn.getAttribute("data-action");
      const id = parseInt(actionBtn.getAttribute("data-id"));
      
      if (action === "add-to-cart") {
        e.stopPropagation();
        const product = products.find(p => p.id === id);
        if (product) {
          CartService.add(product);
          updateCartUI();
          showToast(`${product.name} dodany do koszyka!`);
        }
      } else if (action === "change-qty") {
        const delta = parseInt(actionBtn.getAttribute("data-delta"));
        CartService.changeQty(id, delta);
        updateCartUI();
      } else if (action === "remove-item") {
        CartService.remove(id);
        updateCartUI();
      } else if (action === "toggle-cart") {
        toggleCart();
      } else if (action === "toggle-search") {
        toggleSearch();
      } else if (action === "scroll-to") {
        ripple(e, actionBtn);
        const target = actionBtn.getAttribute("data-target");
        scrollToSection(target);
      } else if (action === "show-toast") {
        ripple(e, actionBtn);
        const msg = actionBtn.getAttribute("data-msg");
        showToast(msg);
      }
    }
  });

  // Global keydown event for accessibility
  document.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      if (document.activeElement.hasAttribute("role") && document.activeElement.getAttribute("role") === "button") {
        e.preventDefault();
        document.activeElement.click();
      }
    }
  });

  // Category cards click
  document.querySelectorAll(".cat-card").forEach(card => {
    card.addEventListener("click", () => {
      showToast(card.getAttribute("data-toast"));
    });
  });

  // Optimized Scroll
  let isScrolling = false;
  window.addEventListener("scroll", () => {
    if (!isScrolling) {
      window.requestAnimationFrame(() => {
        $.navbar.classList.toggle("scrolled", window.scrollY > 50);
        isScrolling = false;
      });
      isScrolling = true;
    }
  });
}

// --- INIT ---
document.addEventListener("DOMContentLoaded", () => {
  CartService.init();
  createSpeedLines();
  renderProducts();
  updateCartUI();
  initEvents();
  initLightning();
});
