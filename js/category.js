const categoryStatus = document.querySelector("#category-status");
const categoryProducts = document.querySelector("#category-products");

async function loadCategory() {
  categoryStatus.textContent = "Loading jackets...";

  try {
    const response = await fetch("https://v2.api.noroff.dev/rainy-days");

    if (!response.ok) {
      throw new Error("Could not load jackets.");
    }

    const result = await response.json();
    const gender = categoryProducts.dataset.gender;
    const jackets = result.data.filter((product) => product.gender === gender);

    jackets.forEach((jacket) => {
      const card = document.createElement("article");
      card.classList.add("men-card");

      const image = document.createElement("img");
      image.src = jacket.image.url;
      image.alt = jacket.image.alt;

      const heading = document.createElement("h2");
      heading.textContent = jacket.title;

      const price = document.createElement("p");
      const unitPrice = jacket.onSale ? jacket.discountedPrice : jacket.price;
      price.textContent = `$${unitPrice.toFixed(2)}`;

      const link = document.createElement("a");
      link.textContent = "View details";
      link.href = `../product/index.html?id=${jacket.id}`;

      link.classList.add("product-card-link");
      link.setAttribute("aria-label", `View details for ${jacket.title}`);
      
      card.appendChild(image);
      card.appendChild(heading);
      card.appendChild(price);
      card.appendChild(link);
      categoryProducts.appendChild(card);
    });

    categoryStatus.textContent = "";
  } catch (error) {
    categoryStatus.textContent = "Could not load jackets. Please try again.";
  }
}

loadCategory();
