function escapeHTML(str) {
  if (typeof str !== "string") return str;
  return str.replace(/[&<>'"]/g, (tag) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag]));
}

const CartService = {
  items: [],

  init() {
    try {
      const savedCart = localStorage.getItem("aeron_cart");
      if (savedCart) {
        this.items = JSON.parse(savedCart);
      }
    } catch (error) {
      console.error("Błąd ładowania koszyka:", error);
      this.items = [];
    }
  },

  save() {
    localStorage.setItem("aeron_cart", JSON.stringify(this.items));
  },

  add(product) {
    const existing = this.items.find((i) => i.id === product.id);
    if (existing) {
      existing.qty++;
    } else {
      this.items.push({ ...product, qty: 1 });
    }
    this.save();
  },

  remove(productId) {
    this.items = this.items.filter((i) => i.id !== productId);
    this.save();
  },

  changeQty(productId, delta) {
    const item = this.items.find((i) => i.id === productId);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) {
      this.remove(productId);
    } else {
      this.save();
    }
  },

  getTotal() {
    return this.items.reduce((s, i) => s + i.price * i.qty, 0);
  },

  getCount() {
    return this.items.reduce((s, i) => s + i.qty, 0);
  },

  renderCartItems(containerEl) {
    if (this.items.length === 0) {
      containerEl.innerHTML = `
        <div class="cart-empty">
          <svg viewBox="0 0 24 24" stroke-width="1"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>
          <p>Koszyk jest pusty</p>
        </div>`;
      return;
    }
    containerEl.innerHTML = this.items
      .map(
        (item) => `
        <div class="cart-item">
          <div class="cart-item-img"><img src="${escapeHTML(item.img)}" alt="${escapeHTML(item.name)}" loading="lazy"></div>
          <div class="cart-item-info">
            <div class="cart-item-name">${escapeHTML(item.name)}</div>
            <div class="cart-item-sub">${escapeHTML(item.sub)}</div>
            <div class="cart-item-price">${item.price * item.qty} zł</div>
            <div class="cart-item-qty">
              <button class="qty-btn" data-action="change-qty" data-id="${item.id}" data-delta="-1">−</button>
              <span class="qty-val">${item.qty}</span>
              <button class="qty-btn" data-action="change-qty" data-id="${item.id}" data-delta="1">+</button>
              <button class="remove-btn" data-action="remove-item" data-id="${item.id}">Usuń</button>
            </div>
          </div>
        </div>
      `
      )
      .join("");
  }
};
