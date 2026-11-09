const checkoutStatus = document.querySelector("#checkout-status");
const checkoutItems = document.querySelector("#checkout-items");
const checkoutSubtotal = document.querySelector("#checkout-subtotal");
const checkoutTotal = document.querySelector("#checkout-total");
const checkoutShipping = document.querySelector("#checkout-shipping");
const standardShippingPrice = document.querySelector("#standard-shipping-price");
const shippingOptions = document.querySelectorAll('input[name="shipping"]');
const checkoutForm = document.querySelector("#checkout-form");
const payNowButton = document.querySelector("#pay-now");

let orderSubtotal = 0;
let orderItems = [];

async function fetchCheckoutProduct(id) {
  const response = await fetch(`https://v2.api.noroff.dev/rainy-days/${id}`);

  if (!response.ok) {
    throw new Error("Could not load a product in your order");
  }

  const result = await response.json();
  return result.data;
}

function updateShipping() {
  const selectedOption = document.querySelector(
    'input[name="shipping"]:checked',
  );

  const method = selectedOption.value;
  const shipping = calculateShipping(orderSubtotal, method);
  const standardPrice = calculateShipping(orderSubtotal);

  standardShippingPrice.textContent =
    standardPrice === 0 ? "Free" : `$${standardPrice.toFixed(2)}`;

  checkoutShipping.textContent =
    shipping === 0 ? "Free" : `$${shipping.toFixed(2)}`;

  checkoutTotal.textContent = `$${(orderSubtotal + shipping).toFixed(2)}`;
}

function saveOrder() {
    const selectedOption = document.querySelector("input[name='shipping']:checked");

    const shipping = calculateShipping(
        orderSubtotal,
        selectedOption.value
    );

    const order = {
        id: crypto.randomUUID(),
        items: orderItems,
        subtotal: orderSubtotal,
        shipping: shipping,
        total: orderSubtotal + shipping
    };

    sessionStorage.setItem("rainyDaysOrder", JSON.stringify(order));
}

async function loadCheckout() {
  checkoutStatus.textContent = "Loading your order...";
  checkoutItems.innerHTML = "";
  orderItems = [];

  try {
    const cart = getCart();

    if (cart.length === 0) {
      checkoutStatus.textContent = "Your order is empty.";
      checkoutSubtotal.textContent = "$0.00";
      checkoutTotal.textContent = "$0.00";
      return;
    }

    let subtotal = 0;

    for (const item of cart) {
      const product = await fetchCheckoutProduct(item.id);
      orderItems.push ({
        product: product,
        size: item.size,
        quantity: item.quantity
      });

      const card = document.createElement("div");
      card.classList.add("checkout-product");

      const image = document.createElement("img");
      image.src = product.image.url;
      image.alt = product.image.alt;

      const info = document.createElement("div");

      const heading = document.createElement("h3");
      heading.textContent = product.title;

      const size = document.createElement("p");
      size.textContent = `Size: ${item.size}`;

      const quantity = document.createElement("p");
      quantity.textContent = `Quantity: ${item.quantity}`;

      const unitPrice = product.onSale
        ? product.discountedPrice
        : product.price;

      const lineTotal = unitPrice * item.quantity;
      subtotal += lineTotal;

      info.appendChild(heading);
      info.appendChild(size);
      info.appendChild(quantity);

      card.appendChild(image);
      card.appendChild(info);

      checkoutItems.appendChild(card);
    }

    checkoutStatus.textContent = `${cart.length} item(s) in your order`;
    orderSubtotal = subtotal;
    checkoutSubtotal.textContent = `$${subtotal.toFixed(2)}`;
    updateShipping();
    payNowButton.disabled = false;

  } catch (error) {
    checkoutStatus.textContent = error.message;
  }
}

shippingOptions.forEach((option) => {
    option.addEventListener("change", () => {
        updateShipping();
    });
});

checkoutForm.addEventListener("submit", (event) => {
    event.preventDefault();

    if (payNowButton.disabled || orderItems.length === 0) {
        return;
    }

    payNowButton.disabled = true;

    try {
      saveOrder();
      saveCart([]);
      window.location.href = "confirmation/index.html";
    } catch (error) {
      checkoutStatus.textContent ="Could not complete your order. Please try again.";
      payNowButton.disabled = false;  
    }
});

loadCheckout();
 