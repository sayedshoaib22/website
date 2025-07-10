document.addEventListener('DOMContentLoaded', function() {
    const header = document.querySelector('.header');
    const navbar = document.querySelector('.navbar');
    const menuBtn = document.getElementById('menu-btn');
    const searchBtn = document.getElementById('search-btn');
    const cartBtn = document.getElementById('cart-btn');
    const searchForm = document.querySelector('.search-form');
    const cartContainer = document.querySelector('.cart-items-container');
    const currencyToggle = document.getElementById('currency-toggle');
    let cart = [];
    let totalPrice = 0;
    let currentCurrency = 'USD';

    function initializeHeader() {
        menuBtn.addEventListener('click', (e) => {
            e.preventDefault();
            navbar.classList.toggle('active');
            menuBtn.classList.toggle('fa-times');
        });

        searchBtn.addEventListener('click', (e) => {
            e.preventDefault();
            searchForm.classList.toggle('active');
            cartContainer.classList.remove('active');
        });

        cartBtn.addEventListener('click', (e) => {
            e.preventDefault();
            cartContainer.classList.toggle('active');
            searchForm.classList.remove('active');
        });

        document.addEventListener('click', (e) => {
            if (!e.target.closest('.header')) {
                navbar.classList.remove('active');
                searchForm.classList.remove('active');
                cartContainer.classList.remove('active');
                menuBtn.classList.remove('fa-times');
            }
        });

        currencyToggle.addEventListener('change', (e) => {
            currentCurrency = e.target.value;
            updateCurrencyDisplay();
            updateCartDisplay();
        });
    }

    function updateCurrencyDisplay() {
        const priceElements = document.querySelectorAll('.price');
        priceElements.forEach(el => {
            const usdPrice = parseFloat(el.dataset.usd);
            const inrPrice = parseFloat(el.dataset.inr);
            el.classList.remove('inr');
            if (currentCurrency === 'INR') {
                el.classList.add('inr');
                el.querySelector('span:first-child').textContent = inrPrice.toFixed(2);
            } else {
                el.querySelector('span:first-child').textContent = usdPrice.toFixed(2);
            }
        });

        const cartTotal = document.querySelector('.cart-total');
        if (cartTotal) {
            cartTotal.classList.remove('inr');
            if (currentCurrency === 'INR') {
                cartTotal.classList.add('inr');
            }
            updateCartTotal();
        }
    }

    function initializeSmoothScrolling() {
        const navLinks = document.querySelectorAll('.navbar a');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                const targetId = link.getAttribute('href').substring(1);
                const targetSection = document.getElementById(targetId);
                if (targetSection) {
                    const offsetTop = targetSection.offsetTop - 90;
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
                navbar.classList.remove('active');
                menuBtn.classList.remove('fa-times');
            });
        });
    }

    function initializeCart() {
        const addToCartBtns = document.querySelectorAll('.btn');
        addToCartBtns.forEach(btn => {
            if (btn.textContent.toLowerCase().includes('add to cart')) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const productBox = btn.closest('.box');
                    const productName = productBox.querySelector('h3').textContent;
                    const priceElement = productBox.querySelector('.price');
                    const productPriceUSD = parseFloat(priceElement.dataset.usd);
                    const productPriceINR = parseFloat(priceElement.dataset.inr);
                    const productImg = productBox.querySelector('img').src;
                    addToCart({
                        name: productName,
                        priceUSD: productPriceUSD,
                        priceINR: productPriceINR,
                        image: productImg,
                        id: Date.now()
                    });
                });
            }
        });

        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('fa-times')) {
                const cartItem = e.target.closest('.cart-item');
                const itemId = cartItem.dataset.id;
                removeFromCart(itemId);
            }
        });

        function addToCart(product) {
            cart.push(product);
            updateCartDisplay();
        }

        function removeFromCart(itemId) {
            cart = cart.filter(item => item.id != itemId);
            updateCartDisplay();
        }

        function updateCartDisplay() {
            const cartContainer = document.querySelector('.cart-items-container');
            const existingItems = cartContainer.querySelectorAll('.cart-item');
            existingItems.forEach(item => {
                if (!item.querySelector('.btn')) {
                    item.remove();
                }
            });

            cart.forEach(item => {
                const cartItem = createCartItem(item);
                cartContainer.insertBefore(cartItem, cartContainer.querySelector('.btn'));
            });

            updateCartCount();
            updateCartTotal();
        }

        function createCartItem(product) {
            const cartItem = document.createElement('div');
            cartItem.className = 'cart-item';
            cartItem.dataset.id = product.id;
            const price = currentCurrency === 'INR' ? product.priceINR : product.priceUSD;
            cartItem.innerHTML = `
                <span class="fas fa-times"></span>
                <img src="${product.image}" alt="">
                <div class="content">
                    <h3>${product.name}</h3>
                    <div class="price" data-usd="${product.priceUSD}" data-inr="${product.priceINR}">${price.toFixed(2)}</div>
                </div>
            `;
            if (currentCurrency === 'INR') {
                cartItem.querySelector('.price').classList.add('inr');
            }
            return cartItem;
        }

        function updateCartCount() {
            let cartCount = document.querySelector('.cart-count');
            if (!cartCount) {
                cartCount = document.createElement('span');
                cartCount.className = 'cart-count';
                cartBtn.appendChild(cartCount);
            }
            cartCount.textContent = cart.length;
            cartCount.style.display = cart.length > 0 ? 'block' : 'none';
        }

        function updateCartTotal() {
            totalPrice = cart.reduce((sum, item) => {
                return sum + (currentCurrency === 'INR' ? item.priceINR : item.priceUSD);
            }, 0);
            const cartTotal = document.querySelector('#cart-total');
            if (cartTotal) {
                cartTotal.textContent = totalPrice.toFixed(2);
            }
        }
    }

    function initializeSearch() {
        const searchBox = document.getElementById('search-box');
        const searchableItems = document.querySelectorAll('.box h3, .title');
        searchBox.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            searchableItems.forEach(item => {
                const parent = item.closest('.box');
                const text = item.textContent.toLowerCase();
                if (text.includes(searchTerm)) {
                    parent.style.display = 'block';
                } else {
                    parent.style.display = 'none';
                }
            });
        });
    }

    function initializeFormEnhancements() {
        const form = document.querySelector('form');
        const inputs = document.querySelectorAll('input, textarea');
        if (form) {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                let isValid = true;
                inputs.forEach(input => {
                    if (input.type !== 'submit' && !input.value.trim()) {
                        isValid = false;
                        input.style.borderColor = '#e74c3c';
                    } else {
                        input.style.borderColor = 'var(--main-color)';
                    }
                });
                if (isValid) {
                    form.reset();
                }
            });
        }
    }

    function init() {
        initializeHeader();
        initializeSmoothScrolling();
        initializeCart();
        initializeSearch();
        initializeFormEnhancements();
        updateCurrencyDisplay();
    }

    init();
});
function initializeSearch() {
    const searchBox = document.getElementById('search-box');
    const searchableItems = document.querySelectorAll('.box h3, .title');
    searchBox.addEventListener('input', (e) => {
        const searchTerm = e.target.value.toLowerCase();
        searchableItems.forEach(item => {
            const parent = item.closest('.box');
            const text = item.textContent.toLowerCase();
            if (text.includes(searchTerm)) {
                parent.style.display = 'block';
            } else {
                parent.style.display = 'none';
            }
        });
    });
}
