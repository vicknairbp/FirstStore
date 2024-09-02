import { updateNumberofIdsInCart } from "./utilis.js";
window.onload = function() {
    fetch('./data.json')
        .then((response) => response.json())
        .then((json) => {
            let products = document.querySelector(".products");
            json.forEach((product) => {
                var newElement = '<a class="product">'+
                    `<div><img src="${product.picture}"/></div>`+
                    `<div>${product.name}</div>`+
                    `<div class="price">$${product.price}</div>`+
                    `<button data-product="${product.id}">Add to cart</button>`+
                '</a>';
                products.innerHTML += newElement;
            });
            let idsInCart = localStorage.getItem("cart");
            if (idsInCart == null) {
                idsInCart = [];
            }
            else {
                idsInCart = JSON.parse(localStorage.getItem("cart"));
            }
            const buttons = document.querySelectorAll(".product button");
            for (let i = 0; i < buttons.length; i++) {
                buttons[i].addEventListener("click",  () => {
                    let product = buttons[i].dataset.product;
                    idsInCart.push(product);
                    updateNumberofIdsInCart(idsInCart.length)
                    localStorage.setItem("cart", JSON.stringify(idsInCart));
                });
            }
            updateNumberofIdsInCart(idsInCart.length)
        });
};