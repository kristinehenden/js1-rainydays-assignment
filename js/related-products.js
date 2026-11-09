async function loadRelatedProducts(excludedIds, productPagePath = "../product/index.html") {
    const status = document.querySelector("#related-status");
    const grid = document.querySelector("#related-products");

    status.textContent = "Loading recommendations...";
    grid.replaceChildren();

    try {
        const response = await fetch("https://v2.api.noroff.dev/rainy-days");

        if (!response.ok) {
            throw new Error("Could not load recommendations.");
        }

        const result = await response.json();
        const recommendations = result.data
            .filter((jacket) => !excludedIds.includes(jacket.id))
            .slice(0, 3);

    for (const jacket of recommendations) {
        const card = document.createElement("article");
        card.classList.add("related-card");

        const image = document.createElement("img");
        image.src = jacket.image.url;
        image.alt = jacket.image.alt;

        const heading = document.createElement("h3");
        heading.textContent = jacket.title;

        const price = document.createElement("p");
        const unitPrice = jacket.onSale ? jacket.discountedPrice : jacket.price;
        price.textContent = `$${unitPrice.toFixed(2)}`;

        const link = document.createElement("a");
        link.textContent = "View details";
        link.href = `${productPagePath}?id=${jacket.id}`;

        card.append(image,  heading, price, link);
        grid.appendChild(card);
    }

    status.textContent = recommendations.length === 0
        ? "No recommendations available."
        :"";
    }   catch (error) {
        status.textContent = "Could not load recommendations. Please try again.";
    }
}