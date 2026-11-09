const API_URL = "https://v2.api.noroff.dev/rainy-days";
const productStatus = document.querySelector("#product-status");
const productList = document.querySelector("#product-list");
const genderFilter = document.querySelector("#gender-filter");
let allProducts = [];
async function fetchProducts() {
  const response = await fetch(API_URL);
  if (!response.ok) {
    throw new Error("Could not load the products");
  }
  const result = await response.json();
  return result.data;
}
async function startApp() {
  productStatus.textContent = "Loading jackets...";
  try {
    const products = await fetchProducts();
    allProducts = products;
    renderProducts(products);
    genderFilter.disabled = false;
    productStatus.textContent = `${products.length} jackets loaded`;
  } catch (error) {
    productStatus.textContent = "Could not load jackets. Please try again.";
  }
}
function renderProducts(products) {
  productList.innerHTML = "";

  products.forEach((product) => {
    const card = document.createElement("article");
    card.classList.add("product-card");

    const image = document.createElement("img");
    image.src = product.image.url;
    image.alt = product.image.alt;

    const heading = document.createElement("h3");
    heading.textContent = product.title;

    const price = document.createElement("p");
    if (product.onSale) {
        price.textContent = `Sale: $${product.discountedPrice.toFixed(2)} - Original: $${product.price.toFixed(2)}`;
    } else {
        price.textContent = `$${product.price.toFixed(2)}`;
    }

    const link = document.createElement("a");
    link.append(image, heading);
    link.href = `product/index.html?id=${product.id}`;

    const sizeSelect = document.createElement("select");
    sizeSelect.setAttribute("aria-label", `Size for ${product.title}`);

    const placeholder = document.createElement("option");
    placeholder.value = "";
    placeholder.textContent = "Select a size";
    placeholder.disabled = true;
    placeholder.selected = true;
    sizeSelect.appendChild(placeholder);

    product.sizes.forEach((size) => {
      const option = document.createElement("option");
      option.value = size;
      option.textContent = size;
      sizeSelect.appendChild(option);
    });

    const addButton = document.createElement("button");
    addButton.type = "button";
    addButton.textContent = "Add to cart";

    const cartMessage = document.createElement("p");
    cartMessage.setAttribute("role", "status");

    addButton.addEventListener("click", () => {
      try {
        addToCart(product, sizeSelect.value);
        cartMessage.textContent = "Added to your cart!";
      } catch (error) {
        cartMessage.textContent = error.message;
      }
    });

    card.appendChild(link);
    card.appendChild(price);
    const actions = document.createElement("div");
    actions.classList.add("product-card-actions");
    actions.append(sizeSelect, addButton);
    card.appendChild(actions);
    card.appendChild(cartMessage);
    productList.appendChild(card);
  });
}
  genderFilter.addEventListener("change", () => {
    const selectedGender = genderFilter.value;
    
    const filteredProducts = allProducts.filter((product) => {
      return selectedGender === "" || product.gender === selectedGender;
    });

    renderProducts(filteredProducts);
    productStatus.textContent = `${filteredProducts.length} jackets found`;
  });

startApp();
