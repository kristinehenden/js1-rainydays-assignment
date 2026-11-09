const productStatus = document.querySelector("#product-status");
const productTitle = document.querySelector("#product-title");
const productImage = document.querySelector("#product-image");
const productDescription = document.querySelector("#product-description");
const productPrice = document.querySelector("#product-price");
const breadcrumbTitle = document.querySelector("#breadcrumb-title");
const productColour = document.querySelector("#product-colour");
const sizeButtons = document.querySelector("#size-buttons");
const selectedSizeText = document.querySelector("#selected-size");
const addToCartButton = document.querySelector("#add-to-cart");
const cartMessage = document.querySelector("#cart-message");
let selectedSize = "";
let currentProduct = null;
const params = new URLSearchParams(window.location.search);
const productId = params.get("id");
const API_URL = `https://v2.api.noroff.dev/rainy-days/${productId}`;
async function fetchProduct() {
  const response = await fetch(API_URL);

  if (!response.ok) {
    throw new Error("Could not load the product");
  }

  const result = await response.json();
  return result.data;
}

function renderSizes(sizes) {
  sizeButtons.innerHTML = "";

  sizes.forEach((size) => {
    const button = document.createElement("button");
    button.type = "button";
    button.textContent = size;

    button.setAttribute("aria-pressed", "false");
    button.addEventListener("click", () => {
      selectedSize = size;
      selectedSizeText.textContent = `Selected size: ${selectedSize}`;

      sizeButtons.querySelectorAll("button").forEach((sizeButton) => {
        sizeButton.classList.remove("active-size");
        sizeButton.setAttribute("aria-pressed", "false");
      });
      button.classList.add("active-size");
      button.setAttribute("aria-pressed", "true");
    });

    sizeButtons.appendChild(button);
  });
}

async function startApp() {
  productStatus.textContent = "Loading jacket...";
  try {
    if (!productId) {
      throw new Error("Please select a jacket from the homepage");
    }
    const product = await fetchProduct();
    currentProduct = product;
    renderSizes(product.sizes);
    productTitle.textContent = product.title;
    breadcrumbTitle.textContent = product.title;
    productImage.src = product.image.url;
    productImage.alt = product.image.alt;
    productDescription.textContent = product.description;
    productColour.textContent = `Colour: ${product.baseColor}`;
    if (product.onSale) {
      productPrice.textContent = `Sale: $${product.discountedPrice.toFixed(2)} - Original: $${product.price.toFixed(2)}`;
    } else {
      productPrice.textContent = `$${product.price.toFixed(2)}`;
    }
    productStatus.textContent = "";
    addToCartButton.disabled = false;
    await loadRelatedProducts([product.id]);
  } catch (error) {
    productStatus.textContent = error.message;
  }
}

addToCartButton.addEventListener("click", () => {
    try {
        if (!currentProduct) {
            throw new Error("Please wait for the product to load.");
        }

        addToCart(currentProduct, selectedSize);
        cartMessage.textContent = "Added to your cart!";
    } catch (error) {
        cartMessage.textContent = error.message;
    }
});

const openImageButton = document.querySelector("#open-product-image");
const imageDialog = document.querySelector("#product-image-dialog");
const enlargedImage = document.querySelector("#enlarged-product-image");

openImageButton.addEventListener("click", () => {
    if (!productImage.getAttribute("src")) {
        return;
    }

    enlargedImage.src = productImage.src;
    enlargedImage.alt = productImage.alt;
    imageDialog .showModal();
});

imageDialog.addEventListener("click", (event) => {
    if (event.target === imageDialog) {
        imageDialog.close();
    }
});

startApp();
