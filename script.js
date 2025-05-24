// Store all fetched products globally
let allProducts = [];

// Get cart from localStorage
function getCart() {
  return JSON.parse(localStorage.getItem('cart')) || [];
}

// Save cart to localStorage and update UI
function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartUI();
}

// Add product to cart
function addToCart(product) {
  let cart = getCart();
  const existing = cart.find(item => item.id === product.id);
  if (existing) {
    existing.quantity++;
  } else {
    cart.push({ ...product, quantity: 1 });
  }
  saveCart(cart);
}

// Update item quantity in cart
function updateQuantity(productId, change) {
  let cart = getCart();
  const item = cart.find(p => p.id === productId);
  if (item) {
    item.quantity += change;
    if (item.quantity <= 0) {
      cart = cart.filter(p => p.id !== productId);
    }
  }
  saveCart(cart);
}

// Remove product from cart
function removeFromCart(productId) {
  const cart = getCart().filter(p => p.id !== productId);
  saveCart(cart);
}

// Update cart UI: items list, subtotal, count badge
function updateCartUI() {
  const cart = getCart();
  const container = document.getElementById('cart-items-container');
  const countBadge = document.getElementById('cart-count');
  const subtotalEl = document.getElementById('cart-subtotal');

  container.innerHTML = '';
  let subtotal = 0;
  let totalCount = 0;

  cart.forEach(item => {
    subtotal += item.price * item.quantity;
    totalCount += item.quantity;

    container.innerHTML += `
      <div class="cart-item d-flex justify-content-between align-items-center py-3 border-bottom">
        <div class="d-flex align-items-center">
          <img src="${item.image}" alt="${item.name}" class="img-fluid rounded" style="width: 80px; height: 80px;">
          <div class="ms-3">
            <h6 class="mb-0">${item.name}</h6>
            <small class="text-muted">${item.description}</small>
            <div class="mt-2 d-flex align-items-center gap-2">
              <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity('${item.id}', -1)">–</button>
              <span class="badge bg-light text-dark">${item.quantity}</span>
              <button class="btn btn-sm btn-outline-secondary" onclick="updateQuantity('${item.id}', 1)">+</button>
            </div>
          </div>
        </div>
        <div class="text-end">
          <h6>৳${(item.price * item.quantity).toFixed(2)}</h6>
          <button class="btn btn-outline-danger btn-sm mt-2" onclick="removeFromCart('${item.id}')">Remove</button>
        </div>
      </div>
    `;
  });

  countBadge.textContent = totalCount;
  subtotalEl.textContent = `৳${subtotal.toFixed(2)}`;
}

// Render products in product list container
function renderProducts(products) {
  const list = document.getElementById('product-list');
  list.innerHTML = '';

  products.forEach(product => {
    const col = document.createElement('div');
    col.className = 'col-lg-3 col-md-4 col-sm-6 mb-4';

    col.innerHTML = `
      <div class="card h-100 shadow-sm border-0">
        <img src="${product.image}" class="card-img-top" alt="${product.name}" style="height: 200px; object-fit: cover;">
        <div class="card-body d-flex flex-column justify-content-between">
          <div>
            <h5 class="card-title">${product.name}</h5>
            <p class="text-muted mb-1" style="font-size: 0.9rem;">${product.description}</p>
            <p class="mb-1"><strong>Category:</strong> ${product.category}</p>
            <p class="mb-1">
              <span class="text-danger text-decoration-line-through">৳${product.regularPrice}</span>
              <span class="text-success fw-bold ms-2">৳${product.price}</span>
            </p>
            <p class="text-muted" style="font-size: 0.85rem;"><i class="bi bi-bar-chart-fill"></i> Sales: ${product.sales}</p>
          </div>
          <button class="btn btn-sm btn-outline-success w-100 mt-2" onclick='addToCart(${JSON.stringify({
            id: product._id || product.id,
            name: product.name,
            price: product.price,
            image: product.image,
            description: product.description
          })})'>
            <i class="bi bi-cart-plus"></i> Add to Cart
          </button>
        </div>
      </div>
    `;

    list.appendChild(col);
  });
}

// Live search filter function
function handleLiveSearch() {
  const searchInput = document.querySelector('.search input').value.trim().toLowerCase();

  if (!searchInput) {
    renderProducts(allProducts);
    return;
  }

  const filteredProducts = allProducts.filter(product => {
    return (
      product.name.toLowerCase().includes(searchInput) ||
      product.description.toLowerCase().includes(searchInput) ||
      product.category.toLowerCase().includes(searchInput)
    );
  });

  renderProducts(filteredProducts);
}

// Download PDF receipt from server
async function downloadReceipt() {
  const cart = getCart();
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  try {
    const res = await fetch('https://billing-project-server.onrender.com/api/generate-receipt', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ cart })
    });

    if (!res.ok) {
      throw new Error("Failed to generate receipt");
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = "e-rashid-receipt.pdf";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error("Receipt download failed:", error);
    alert("Failed to download receipt. Try again.");
  }
}

// Initial fetch of products from server and setup
fetch('https://billing-project-server.onrender.com/api/products')
  .then(res => res.json())
  .then(products => {
    allProducts = products;
    renderProducts(allProducts);
    updateCartUI();
  })
  .catch(err => console.error('Error loading products:', err));

// Setup search listeners after DOM loaded
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();

  const searchInput = document.querySelector('.search input');
  if (searchInput) {
    searchInput.addEventListener('input', handleLiveSearch);
  }

  const searchButton = document.querySelector('.search button');
  if (searchButton) {
    searchButton.addEventListener('click', handleLiveSearch);
  }
});
