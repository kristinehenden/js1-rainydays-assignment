const confirmationStatus = document.querySelector("#confirmation-status");
const confirmationItems = document.querySelector("#confirmation-items");
const confirmationSubtotal = document.querySelector("#confirmation-subtotal");
const confirmationShipping = document.querySelector("#confirmation-shipping");
const confirmationTotal = document.querySelector("#confirmation-total");
const orderNumber = document.querySelector("#order-number");

function loadConfirmation() {
    try {
        const savedOrder = sessionStorage.getItem("rainyDaysOrder");

        if (savedOrder === null) {
            document.querySelector("#confirmation-heading").textContent = "No order found";
            confirmationStatus.textContent = "Complete a demo purchase to see your order confirmation here";

            document.querySelector(".confirmation-icon").style.display = "none";
            document.querySelector(".confirmation-text").style.display = "none";
            document.querySelector(".confirmation-grid").style.display = "none";
            return;
        }

        const order = JSON.parse(savedOrder);

        orderNumber.textContent = `Order number: ${order.id}`;
        confirmationSubtotal.textContent = `$${order.subtotal.toFixed(2)}`;
        confirmationShipping.textContent = order.shipping === 0
            ? "Free"
            : `$${order.shipping.toFixed(2)}`;
        confirmationTotal.textContent = `$${order.total.toFixed(2)}`;

        for (const item of order.items) {
            const row = document.createElement("div");

            const heading = document.createElement("h3");
            heading.textContent = item.product.title;

            const details = document.createElement("p");
            details.textContent = `Size: ${item.size} - Quantity: ${item.quantity}`;
 
            row.appendChild(heading);
            row.appendChild(details);
            const unitPrice = item.product.onSale
                ? item.product.discountedPrice
                : item.product.price;
            const lineTotal = unitPrice * item.quantity;

            const price = document.createElement("p");
            price.textContent = `Unit price $${unitPrice.toFixed(2)} - Item total: $${lineTotal.toFixed(2)}`;
            row.appendChild(price);

            confirmationItems.appendChild(row);
        }
      } catch (error) {
        confirmationStatus.textContent = "Could not load your order confirmation.";
    }  
}

loadConfirmation();