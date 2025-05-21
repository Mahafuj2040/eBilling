const productForm = document.getElementById('productForm');
const apiUrl = 'https://billing-project-server.onrender.com/api/products';
let currentEditId = null;

// Search functionality
const searchInput = document.querySelector('.search input[type="text"]');
const searchButton = document.querySelector('.search button');

searchButton.addEventListener('click', () => {
  const searchTerm = searchInput.value.trim();
  loadProducts(searchTerm);
});

// Handle form submission
productForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const productData = {
    name: document.getElementById('productName').value,
    description: document.getElementById('productDescription').value,
    category: document.getElementById('productCategory').value,
    regularPrice: parseFloat(document.getElementById('productRegularPrice').value),
    price: parseFloat(document.getElementById('productPrice').value),
    sales: parseInt(document.getElementById('productSales').value),
    image: document.getElementById('productImage').value
  };

  try {
    const method = currentEditId ? 'PUT' : 'POST';
    const endpoint = currentEditId ? `${apiUrl}/${currentEditId}` : apiUrl;

    const response = await fetch(endpoint, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(productData)
    });

    if (response.ok) {
      alert(`✅ Product ${currentEditId ? 'updated' : 'created'} successfully!`);
      productForm.reset();
      const modal = bootstrap.Modal.getInstance(document.getElementById('addToCartModal'));
      modal.hide();
      currentEditId = null;
      loadProducts();
    } else {
      alert('❌ Failed to save product');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('❌ Error occurred while saving product');
  }
});

// Load products and render cards
async function loadProducts(search = '') {
  try {
    const params = new URLSearchParams();
    if (search) params.append('search', search);

    const res = await fetch(`${apiUrl}?${params.toString()}`);
    const products = await res.json();
    const productList = document.getElementById('product-list');
    productList.innerHTML = '';

    if (!Array.isArray(products) || products.length === 0) {
      productList.innerHTML = `<p class="text-center text-muted">No products found.</p>`;
      return;
    }

    products.forEach(product => {
      const productCard = `
        <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
          <div class="card h-100 shadow-sm border-0 position-relative">
            <div class="position-absolute top-0 end-0 p-2 d-flex gap-2">
              <button class="btn btn-light btn-sm" onclick='editProduct(${JSON.stringify(product)})'>
                <i class="bi bi-pencil-square fs-5 text-primary"></i>
              </button>
              <button class="btn btn-light btn-sm" onclick='deleteProduct("${product._id}")'>
                <i class="bi bi-trash-fill fs-5 text-danger"></i>
              </button>
            </div>
            <img src="${product.image}" class="card-img-top" alt="${product.name}" style="height: 200px; object-fit: cover;">
            <div class="card-body">
              <h5 class="card-title">${product.name}</h5>
              <p class="text-muted">${product.description}</p>
              <p><strong>Category:</strong> ${product.category}</p>
              <p><s class="text-danger">৳${product.regularPrice}</s> <span class="text-success fw-bold">৳${product.price}</span></p>
              <p>Sales: ${product.sales}</p>
            </div>
          </div>
        </div>
      `;
      productList.insertAdjacentHTML('beforeend', productCard);
    });
  } catch (err) {
    console.error('Failed to load products:', err);
    alert('❌ Failed to load products');
  }
}

// Fill form for editing
function editProduct(product) {
  currentEditId = product._id;
  document.getElementById('productName').value = product.name;
  document.getElementById('productDescription').value = product.description;
  document.getElementById('productCategory').value = product.category;
  document.getElementById('productRegularPrice').value = product.regularPrice;
  document.getElementById('productPrice').value = product.price;
  document.getElementById('productSales').value = product.sales;
  document.getElementById('productImage').value = product.image;

  const modal = new bootstrap.Modal(document.getElementById('addToCartModal'));
  modal.show();
}

// Delete product
async function deleteProduct(id) {
  if (confirm('Are you sure you want to delete this product?')) {
    try {
      const res = await fetch(`${apiUrl}/${id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        alert('✅ Product deleted successfully');
        loadProducts();
      } else {
        alert('❌ Failed to delete product');
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('❌ Error while deleting product');
    }
  }
}

// Initial load
window.addEventListener('DOMContentLoaded', () => loadProducts());
