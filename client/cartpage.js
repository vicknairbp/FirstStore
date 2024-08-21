window.onload = function() {   
  let amountTotal = 0; 
  console.log("cartpageloaded");
  let cartsup = document.querySelector(".cart sup");
  var productIdsInCart = JSON.parse(localStorage.getItem("cart"));
  cartsup.innerText = productIdsInCart.length;
  fetch('./data.json')
  .then((response) => response.json())
  .then((products) => {
      let productsCartPage = document.querySelector(".productsCartPage");
      products.forEach((product) => {
          if (productIdsInCart.includes(product.id)) {
              let newElement = `<div data-product="${product.id}" class="productCartPage" data-productPrice="${product.price}">`+
              `<div><img src="${product.picture}"/></div>`+
              `<div>${product.name}</div>`+
              `<div class="price">Price &nbsp;$${product.price}</div>`+
              `<button data-product="${product.id}" >Remove</button>`+
              '</div>';
              productsCartPage.innerHTML += newElement;
              amountTotal += product.price;
          }
      });
      let completeTotal = document.querySelector(".totalAmount");
      completeTotal.innerHTML += amountTotal.toFixed(2);
      const buttons = document.querySelectorAll(".productCartPage button");
      for (let i = 0; i < buttons.length; i++) {
          buttons[i].addEventListener("click",  () => {
              let productid = buttons[i].dataset.product;
                  for (let i = 0; i < productIdsInCart.length; i++) {
                      if (productIdsInCart[i] == productid) {
                          productIdsInCart.splice(i, 1);
                          const productlayout = document.querySelector(`[data-product~="${productid}"]`);
                          productlayout?.remove();
                          let productPrice = Number(productlayout?.getAttribute("data-productPrice"));
                          amountTotal -= productPrice;
                      }
                  }
              cartsup.innerText = productIdsInCart.length;
              let completeTotal = document.querySelector(".totalAmount");
              completeTotal.innerHTML = amountTotal.toFixed(2);
              localStorage.setItem('cart', JSON.stringify(productIdsInCart));
          });
      }
  });
  window.paypal.Buttons({
    style: {
        shape: "rect",
        layout: "vertical",
    },
    async createOrder() {
      try {
          const response = await fetch("/api/orders", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            // use the "body" param to optionally pass additional order information
            // like product ids and quantities
            body: JSON.stringify({
                cart: 
                  {
                      total: amountTotal.toFixed(2).toString()
                  }
            }),
          });

          const orderData = await response.json();

          if (orderData.id) {
              return orderData.id;
          } else {
          const errorDetail = orderData?.details?.[0];
          const errorMessage = errorDetail
              ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
              : JSON.stringify(orderData);
          throw new Error(errorMessage);
          }
          } catch (error) {
            console.error(error);
            resultMessage(`Could not initiate PayPal Checkout...<br><br>${error}`);
          }
    },
    async onApprove(data, actions) {
      try {
        const response = await fetch(`/api/orders/${data.orderID}/capture`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
        });

        const orderData = await response.json();
        // Three cases to handle:
        //   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
        //   (2) Other non-recoverable errors -> Show a failure message
        //   (3) Successful transaction -> Show confirmation or thank you message

        const errorDetail = orderData?.details?.[0];

        if (errorDetail?.issue === "INSTRUMENT_DECLINED") {
          // (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
          // recoverable state, per https://developer.paypal.com/docs/checkout/standard/customize/handle-funding-failures/
          return actions.restart();
        } else if (errorDetail) {
          // (2) Other non-recoverable errors -> Show a failure message
          throw new Error(`${errorDetail.description} (${orderData.debug_id})`);
        } else if (!orderData.purchase_units) {
          throw new Error(JSON.stringify(orderData));
        } else {
          // (3) Successful transaction -> Show confirmation or thank you message
          // Or go to another URL:  actions.redirect('thank_you.html');
          const transaction =
            orderData?.purchase_units?.[0]?.payments?.captures?.[0] ||
            orderData?.purchase_units?.[0]?.payments?.authorizations?.[0];
          resultMessage(
            `Transaction ${transaction.status}: ${transaction.id}<br><br>See console for all available details`,
          );
          console.log(
            "Capture result",
            orderData,
            JSON.stringify(orderData, null, 2),
          );
        }
      } catch (error) {
        console.error(error);
        resultMessage(
          `Sorry, your transaction could not be processed...<br><br>${error}`,
        );
      }
    },
  })
  .render("#paypal-button-container");
  // Example function to show a result to the user. Your site's UI library can be used instead.
  function resultMessage(message) {
    const container = document.querySelector("#result-message");
    container.innerHTML = message;
    let shoppingCart = document.querySelector(".shopping-cart");
    shoppingCart.innerHTML = "Transaction complete"
    localStorage.removeItem("cart");
  }
};