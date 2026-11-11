const API_URL = "https://v2.api.noroff.dev/rainy-days";
const productStatus = document.querySelector("#product-status");
const productList = document.querySelector("#product-list");
const genderFilter = document.querySelector("#gender-filter");
let allProducts = [];

const searchParams = new URLSearchParams(window.location.search);
const searchTerm = (searchParams.get("search") || "").trim().toLowerCase();

document.querySelector("#search").value = searchParams.get("search") || "";
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
    const fetchedProducts = await fetchProducts();
    const products = productList.dataset.saleOnly === "true"
      ? fetchedProducts.filter((product) => product.onSale)
      : fetchedProducts;
    allProducts = products;
    const matchingProducts = allProducts.filter((product) =>
      product.title.toLowerCase().includes(searchTerm)
    );

    renderProducts(matchingProducts);
    genderFilter.disabled = false;
    productStatus.textContent = `${matchingProducts.length} jackets found`;

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
      const salePrice = document.createElement("strong");
      salePrice.textContent = `Sale: $${product.discountedPrice.toFixed(2)}`;

      const originalPrice = document.createElement("s");
      originalPrice.textContent = `$${product.price.toFixed(2)}`;

      price.append(salePrice, " - Original: ", originalPrice);
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
    const matchesGender = selectedGender === "" || product.gender === selectedGender;
    const matchesSearch = product.title.toLowerCase().includes(searchTerm);
    return matchesGender && matchesSearch;
    });

    renderProducts(filteredProducts);
    productStatus.textContent = `${filteredProducts.length} jackets found`;
  });

startApp();
