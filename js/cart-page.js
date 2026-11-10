const cartStatus = document.querySelector("#cart-status");
const cartItems = document.querySelector("#cart-items");
const cartSubtotal = document.querySelector("#cart-subtotal");
const cartTotal = document.querySelector("#cart-total");
const cartShipping = document.querySelector("#cart-shipping");

async function fetchCartProduct(id) {
  const response = await fetch(`https://v2.api.noroff.dev/rainy-days/${id}`);

  if (!response.ok) {
    throw new Error("Could not load a product in your cart");
  }

  const result = await response.json();
  return result.data;
}

async function loadCart() {
  cartItems.innerHTML = "";
  cartSubtotal.textContent = "-";
  cartTotal.textContent = "-";
  cartStatus.textContent = "Loading your cart...";

  try {
    const cart = getCart();
    const cartProductIds = cart.map((item) => item.id);
    await loadRelatedProducts(cartProductIds, "product/index.html");

    if (cart.length === 0) {
      cartStatus.textContent = "Your cart is empty.";
      cartSubtotal.textContent = "$0.00";
      cartTotal.textContent = "$0.00";
      return;
    }

    let total = 0;
    for (const item of cart) {
      const product = await fetchCartProduct(item.id);

      const card = document.createElement("article");
      card.classList.add("cart-item");

      const image = document.createElement("img");
      image.src = product.image.url;
      image.alt = product.image.alt;

      const heading = document.createElement("h2");
      heading.textContent = product.title;

      const sizeSelect = document.createElement("select");
      sizeSelect.setAttribute(
        "aria-label",
        `Size for ${product.title}, currently ${item.size}`,
      );

      product.sizes.forEach((size) => {
        const option = document.createElement("option");
        option.value = size;
        option.textContent = size;
        option.selected = size === item.size;
        sizeSelect.appendChild(option);
      });

      sizeSelect.addEventListener("change", async () => {
        try {
          changeCartSize(item.id, item.size, sizeSelect.value);
          await loadCart();
        } catch (error) {
          sizeSelect.value = item.size;
          cartStatus.textContent = error.message;
        }
      });

      const quantity = document.createElement("p");
      quantity.textContent = `Quantity: ${item.quantity}`;

      const unitPrice = product.onSale
        ? product.discountedPrice
        : product.price;

      const lineTotal = unitPrice * item.quantity;
      total += lineTotal;

      const price = document.createElement("p");
      price.textContent = `Price: $${unitPrice.toFixed(2)} - Item total: $${lineTotal.toFixed(2)}`;

      const minusButton = document.createElement("button");
      minusButton.type = "button";
      minusButton.textContent = "-";
      minusButton.setAttribute(
        "aria-label",
        `Decrease quantity of ${product.title} size ${item.size}`,
      );

      minusButton.addEventListener("click", async () => {
        try {
          changeQuantity(item.id, item.size, -1);
          await loadCart();
        } catch (error) {
          cartStatus.textContent = error.message;
        }
      });

      const plusButton = document.createElement("button");
      plusButton.type = "button";
      plusButton.textContent = "+";
      plusButton.setAttribute(
        "aria-label",
        `Increase quantity of ${product.title} size ${item.size}`,
      );

      plusButton.addEventListener("click", async () => {
        try {
          changeQuantity(item.id, item.size, 1);
          await loadCart();
        } catch (error) {
          cartStatus.textContent = error.message;
        }
      });

      const removeButton = document.createElement("button");
      removeButton.type = "button";
      removeButton.textContent = "Remove";

      removeButton.addEventListener("click", async () => {
        try {
          removeFromCart(item.id, item.size);
          await loadCart();
        } catch (error) {
          cartStatus.textContent = error.message;
        }
      });

      const quantityControls = document.createElement("div");
      quantityControls.classList.add("cart-quantity-controls");
      quantityControls.append(minusButton, plusButton, quantity);

      const details = document.createElement("div");
      details.classList.add("cart-item-details");
      details.append(heading, price, sizeSelect, quantityControls, removeButton);

      card.append(image, details);
      cartItems.appendChild(card);

    }
    const shipping = calculateShipping(total);

    cartSubtotal.textContent = `$${total.toFixed(2)}`;
    cartShipping.textContent =
      shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`;
    cartTotal.textContent = `$${(total + shipping).toFixed(2)}`;
    cartStatus.textContent = `${cart.length} different items in your cart.`;
  } catch (error) {
    cartStatus.textContent = error.message;
  }
}
const checkoutLink = document.querySelector(".checkout-button");

checkoutLink.addEventListener("click", (event) => {
  try {
    if (getCart().length === 0) {
      event.preventDefault();
      cartStatus.textContent =
        "Your cart is empty. Add a product before checking out.";
    }
  } catch (error) {
    event.preventDefault();
    cartStatus.textContent = error.message;
  }
});

loadCart();
