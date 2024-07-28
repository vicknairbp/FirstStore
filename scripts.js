
window.onload = function() {
    let products = localStorage.getItem("cart");
    if (products == null) {
        products = [];
    }
    else {
        products = JSON.parse(localStorage.getItem("cart"));
    }
    const buttons = document.querySelectorAll(".product button");
    for (let i = 0; i < buttons.length; i++) {
        buttons[i].addEventListener("click",  () => {
            let product = buttons[i].dataset.product;
            products.push(product);
            let idcount = document.querySelector(".cart sup");
            idcount.innerText = products.length;
            localStorage.setItem("cart", JSON.stringify(products));
        });
    }
    let idcount = document.querySelector(".cart sup");
    idcount.innerText = products.length;
    
};