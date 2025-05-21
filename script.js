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

// Update item quantity
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

// Remove from cart
function removeFromCart(productId) {
  const cart = getCart().filter(p => p.id !== productId);
  saveCart(cart);
}

// Update Cart UI
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

// Render products on the page
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

// Live search function
function handleLiveSearch() {
  const searchInput = document.querySelector('.search input').value.trim().toLowerCase();

  if (!searchInput) {
    // Show all products if search input is empty
    renderProducts(allProducts);
    return;
  }

  // Filter products by name, description, or category
  const filteredProducts = allProducts.filter(product => {
    return (
      product.name.toLowerCase().includes(searchInput) ||
      product.description.toLowerCase().includes(searchInput) ||
      product.category.toLowerCase().includes(searchInput)
    );
  });

  renderProducts(filteredProducts);
}

// Download receipt as PDF
async function downloadReceipt() {
  const cart = getCart();
  if (cart.length === 0) {
    alert("Your cart is empty.");
    return;
  }

  const receiptItemsEl = document.getElementById('receipt-items');
  const receiptTotalEl = document.getElementById('receipt-total');
  const receiptDateEl = document.getElementById('receipt-date');
  const receiptEl = document.getElementById('receipt-content');

  receiptItemsEl.innerHTML = '';
  let subtotal = 0;

  cart.forEach(item => {
    const itemSubtotal = item.price * item.quantity;
    subtotal += itemSubtotal;

    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${item.name}</td>
      <td>${item.quantity}</td>
      <td>৳${item.price.toFixed(2)}</td>
      <td>৳${itemSubtotal.toFixed(2)}</td>
    `;
    receiptItemsEl.appendChild(row);
  });

  receiptTotalEl.textContent = `৳${subtotal.toFixed(2)}`;
  receiptDateEl.textContent = new Date().toLocaleString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  // Show receipt content before generating PDF
  receiptEl.style.display = 'block';

  try {
    await html2pdf()
      .from(receiptEl)
      .set({
        margin: 0.5,
        filename: 'e-rashid-receipt.pdf',
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
      })
      .save();

    // Hide receipt content only after PDF is saved
    receiptEl.style.display = 'none';
  } catch (err) {
    alert("PDF download failed. Please try again.");
    console.error(err);
    receiptEl.style.display = 'none';
  }
}

// Fetch and initialize products
fetch('https://billing-project-server.onrender.com/api/products')
  .then(res => res.json())
  .then(products => {
    allProducts = products;
    renderProducts(allProducts);
    updateCartUI();
  })
  .catch(err => console.error('Error loading products:', err));

// Initialize search listeners after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  updateCartUI();
  document.querySelector('.search input').addEventListener('input', handleLiveSearch);
  document.querySelector('.search button').addEventListener('click', handleLiveSearch);
});
