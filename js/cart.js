const CART_KEY = "rainyDaysCart";

function getCart() {
    try {
        const savedCart = localStorage.getItem(CART_KEY);

        if (savedCart === null) {
            return [];
        }

        const cart = JSON.parse(savedCart);
        if (!Array.isArray(cart)) {
            throw new Error("Invalid cart data");
        }

        return cart;
    } catch (error) {
        throw new Error("Could not read your shopping cart.");
    }
}

function saveCart(cart) {
    try {
        const cartText = JSON.stringify(cart);
        localStorage.setItem(CART_KEY, cartText);
        updateCartCount();
    } catch (error) {
        throw new Error("Could not save your shopping cart.");
    }
}

function addToCart(product, size) {
    if (!size) {
        throw new Error("Please select a size.");
    }

    const cart = getCart();

    const existingItem = cart.find((item) => {
        return item.id === product.id && item.size === size;
    });

    if (existingItem) {
        existingItem.quantity += 1;
    } else {
        cart.push({
            id: product.id,
            size: size,
            quantity: 1
        });
    }

    saveCart(cart);
}

function removeFromCart(id, size) {
    const cart = getCart();

    const updatedCart = cart.filter((item) => {
        return !(item.id === id && item.size === size);
    });

    saveCart(updatedCart);
}

function changeQuantity(id, size, change) {
    const cart = getCart();

    const item = cart.find((item) => {
        return item.id === id && item.size === size;
    });

    if (!item) {
        throw new Error("This item is no longer in your cart.");
    }

    const newQuantity = item.quantity + change;

    if (newQuantity < 1) {
        removeFromCart(id, size);
        return;
    }

    item.quantity = newQuantity;
    saveCart(cart);
}

function calculateShipping(subtotal, method = "standard") {
    if (method === "express") {
        return 9.99;
    }

    if (subtotal >= 100) {
        return 0;
    }

    return 6.99;
}

function updateCartCount() {
    const cartLink = document.querySelector("header a[aria-label='Shopping cart']");

    if (!cartLink) {
        return;
    }

    let countBadge = cartLink.querySelector(".cart-count");

    if (!countBadge) {
        countBadge = document.createElement("span");
        countBadge.classList.add("cart-count");
        cartLink.appendChild(countBadge);
    }

    try {
        const cart = getCart();
        const count = cart.reduce((sum, item) => sum+ item.quantity, 0);
        countBadge.textContent = count > 0 ? count : "";
        countBadge.hidden = count === 0;
      } catch {
        countBadge.hidden = true;
    }
}

updateCartCount();

function changeCartSize(id, oldSize, newSize) {
    if (oldSize === newSize) {
        return;
    }

    const cart = getCart();
    const itemIndex = cart.findIndex((item) => {
        return item.id === id && item.size === oldSize;
    });

    if (itemIndex === -1) {
        throw new Error("This item is no longer in your cart.");
    }

    const item = cart[itemIndex];
    const matchingItem = cart.find((entry) => {
        return entry.id === id && entry.size === newSize;
    });

    if (matchingItem) {
        matchingItem.quantity += item.quantity;
        cart.splice(itemIndex, 1);
      } else {
        item.size = newSize;
      }

      saveCart(cart);
}