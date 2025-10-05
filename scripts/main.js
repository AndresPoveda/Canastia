const PRODUCTS = {
  frutas: {
    tropicales: [
      { id: 'mango', nombre: 'Mango', precioKg: 3000, unidad: 'kg', img: 'images/frutas/Mango.png', descripcion: 'Fruta dulce y jugosa, ideal para batidos.' },
      { id: 'pina', nombre: 'Piña', precioKg: 2500, unidad: 'kg', img: 'images/frutas/Piña.png', descripcion: 'Piña fresca, buena para jugos y postres.' },
      { id: 'papaya', nombre: 'Papaya', precioKg: 2200, unidad: 'kg', img: 'images/frutas/Papaya.png', descripcion: 'Suave y dulce, rica en enzimas digestivas.' }
    ],
    citricas: [
      { id: 'naranja', nombre: 'Naranja', precioKg: 2000, unidad: 'kg', img: 'images/frutas/Naranja.png', descripcion: 'Fuente de vitamina C, ideal para jugos.' },
      { id: 'limon', nombre: 'Limón', precioKg: 2800, unidad: 'kg', img: 'images/frutas/Limon.png', descripcion: 'Perfecto para aderezos y bebidas.' },
      { id: 'mandarina', nombre: 'Mandarina', precioKg: 2400, unidad: 'kg', img: 'images/frutas/Mandarina.png', descripcion: 'Dulce y fácil de pelar.' }
    ]
  },
  verduras: {
    de_hoja: [
      { id: 'espinaca', nombre: 'Espinaca', precioKg: 1800, unidad: 'kg', img: 'images/verduras/Espinaca.png', descripcion: 'Hoja fresca para ensaladas y batidos.' },
      { id: 'lechuga', nombre: 'Lechuga', precioKg: 1500, unidad: 'kg', img: 'images/verduras/Lechuga.png', descripcion: 'Crujiente, ideal para ensaladas.' },
      { id: 'acelga', nombre: 'Acelga', precioKg: 1600, unidad: 'kg', img: 'images/verduras/Acelga.png', descripcion: 'Hoja carnosa, buena al vapor.' }
    ],
    de_raiz: [
      { id: 'zanahoria', nombre: 'Zanahoria', precioKg: 1700, unidad: 'kg', img: 'images/verduras/Zanahoria.png', descripcion: 'Fuente de vitamina A.' },
      { id: 'remolacha', nombre: 'Remolacha', precioKg: 2100, unidad: 'kg', img: 'images/verduras/Remolacha.png', descripcion: 'Con sabor dulce, buena al horno.' },
      { id: 'papa', nombre: 'Papa', precioKg: 1600, unidad: 'kg', img: 'images/verduras/Papa.png', descripcion: 'Versátil y económica.' }
    ]
  },
};

/* -- Estado del carrito -- */
let cart = [];
const KG_TO_LB = 2.20462;

/* -- UI referencias -- */
const productArea = document.getElementById('product-area');
const catButtons = document.querySelectorAll('.cat-btn');
const cartPanel = document.getElementById('cart-panel');
const overlay = document.getElementById('overlay');
const openCartBtn = document.getElementById('open-cart');
const closeCartBtn = document.getElementById('close-cart');
const cartItemsEl = document.getElementById('cart-items');
const cartTotalEl = document.getElementById('cart-total');
const cartCountEl = document.getElementById('cart-count');
const globalUnitSelect = document.getElementById('global-unit');
const clearCartBtn = document.getElementById('clear-cart');
const checkoutBtn = document.getElementById('checkout');

/* -- Ayudadores -- */
function formatCurrency(val) {
  return new Intl.NumberFormat('es-CO').format(Math.round(val));
}

function kgToLb(kg) { return kg * KG_TO_LB; }
function lbToKg(lb) { return lb / KG_TO_LB; }

/* -- Renderizar productos -- */
function renderCategory(categoryKey) {
  productArea.innerHTML = '';
  if (!PRODUCTS[categoryKey]) return;
  const cat = PRODUCTS[categoryKey];
  for (const sub in cat) {
    const subTitle = sub.replace(/_/g,' ').toUpperCase();
    const subHeader = document.createElement('h3');
    subHeader.textContent = subTitle;
    productArea.appendChild(subHeader);

    const grid = document.createElement('div');
    grid.className = 'product-grid';
    productArea.appendChild(grid);

    cat[sub].forEach(p => {
      const card = document.createElement('article');
      card.className = 'product-card';
      card.innerHTML = `
        <img src="${p.img}" alt="${p.nombre}" onerror="this.src='images/placeholder.jpg'">
        <h4>${p.nombre}</h4>
        <p class="desc">${p.descripcion}</p>
        <div class="price-row">
          <div class="price">COP ${formatCurrency(p.precioKg)} / kg</div>
          <div class="price-sub" style="font-size:13px;color:var(--muted)">Precio por peso</div>
        </div>
        <div class="card-actions">
          <input class="qty-input" type="number" min="0.1" step="0.1" value="1" title="Peso a comprar (kg)">
          <button class="btn add-to-cart">Agregar al carrito</button>
        </div>
      `;
      const btn = card.querySelector('.add-to-cart');
      const qtyInput = card.querySelector('.qty-input');
      btn.addEventListener('click', () => {
        const weightKg = parseFloat(qtyInput.value) || 1;
        addToCart({...p, pricePerKg: p.precioKg}, weightKg);
      });

      grid.appendChild(card);
    });
  }
}

/* -- Cartas funciones -- */
function addToCart(product, weightKg = 1) {
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.weightKg = +(existing.weightKg + weightKg).toFixed(3);
  } else {
    cart.push({
      id: product.id,
      nombre: product.nombre,
      img: product.img,
      pricePerKg: product.pricePerKg || product.precioKg || 0,
      weightKg: +weightKg.toFixed(3)
    });
  }
  updateCartUI();
  openCart();
}

function removeFromCart(id) {
  cart = cart.filter(i => i.id !== id);
  updateCartUI();
}

function updateWeightInCart(id, newWeight, unit='kg') {
  let wKg = unit === 'kg' ? parseFloat(newWeight) : lbToKg(parseFloat(newWeight));
  if (isNaN(wKg) || wKg <= 0) return;
  const item = cart.find(i => i.id === id);
  if (item) item.weightKg = +wKg.toFixed(3);
  updateCartUI();
}

function clearCart() {
  cart = [];
  updateCartUI();
}

function cartTotal(currentUnit = 'kg') {
  let total = 0;
  cart.forEach(i => total += i.pricePerKg * i.weightKg);
  return total;
}

/* -- UI actualizaciones -- */
function updateCartUI() {
  cartItemsEl.innerHTML = '';
  cart.forEach(item => {
    const li = document.createElement('li');
    li.className = 'cart-item';
    const unit = globalUnitSelect.value || 'kg';
    const displayWeight = unit === 'kg' ? item.weightKg : +(kgToLb(item.weightKg)).toFixed(2);
    const weightLabel = unit === 'kg' ? `${displayWeight} kg` : `${displayWeight} lb`;
    const priceForItem = item.pricePerKg * item.weightKg;

    li.innerHTML = `
      <img src="${item.img}" alt="${item.nombre}" onerror="this.src='images/placeholder.jpg'">
      <div class="meta">
        <h5>${item.nombre}</h5>
        <p>${item.pricePerKg ? 'COP ' + formatCurrency(item.pricePerKg) + ' / kg' : ''}</p>
        <p class="small">Peso: <input data-id="${item.id}" class="cart-weight" style="width:80px;border-radius:6px;padding:6px;border:1px solid #eee" value="${displayWeight}"> ${unit}</p>
      </div>
      <div class="actions">
        <div style="font-weight:700">COP ${formatCurrency(priceForItem)}</div>
        <button data-id="${item.id}" class="remove-item" style="background:transparent;border:none;color:#cc4444;cursor:pointer">Eliminar</button>
      </div>
    `;

    cartItemsEl.appendChild(li);
  });

  cartItemsEl.querySelectorAll('.remove-item').forEach(btn=>{
    btn.addEventListener('click', e=>{
      const id = e.target.dataset.id;
      removeFromCart(id);
    });
  });
  cartItemsEl.querySelectorAll('.cart-weight').forEach(input=>{
    input.addEventListener('change', e=>{
      const id = e.target.dataset.id;
      const val = parseFloat(e.target.value);
      if (isNaN(val) || val <= 0) { updateCartUI(); return; }
      updateWeightInCart(id, val, globalUnitSelect.value);
    });
  });

  const total = cartTotal();
  cartTotalEl.textContent = `COP ${formatCurrency(total)}`;

  const count = cart.reduce((s,i)=> s + i.weightKg, 0);
  cartCountEl.textContent = cart.length;
}

/* -- Carta panel de control -- */
function openCart(){
  cartPanel.classList.add('open');
  overlay.classList.add('show');
  cartPanel.setAttribute('aria-hidden','false');
  overlay.setAttribute('aria-hidden','false');
}
function closeCart(){
  cartPanel.classList.remove('open');
  overlay.classList.remove('show');
  cartPanel.setAttribute('aria-hidden','true');
  overlay.setAttribute('aria-hidden','true');
}

/* -- Eventos globales -- */
openCartBtn.addEventListener('click', openCart);
closeCartBtn.addEventListener('click', closeCart);
overlay.addEventListener('click', closeCart);

globalUnitSelect.addEventListener('change', ()=>{
  updateCartUI();
});

clearCartBtn.addEventListener('click', ()=>{
  if (confirm('¿Vaciar el carrito?')) clearCart();
});

checkoutBtn.addEventListener('click', ()=>{
  if (cart.length === 0) { alert('El carrito está vacío'); return; }
  alert('Gracias por tu compra (simulación). Total: ' + cartTotalEl.textContent);
  clearCart();
});

/* -- Cambiar categoria --*/
catButtons.forEach(btn=>{
  btn.addEventListener('click', ()=>{
    catButtons.forEach(b=>b.classList.remove('active'));
    btn.classList.add('active');
    renderCategory(btn.dataset.cat);
  });
});

/* -- Slider básico -- */
const slides = document.querySelectorAll('.slide');
const prevBtn = document.getElementById('prev-slide');
const nextBtn = document.getElementById('next-slide');
let slideIndex = 0;
let slideInterval;

function showSlide(idx){
  slides.forEach(s=> s.classList.remove('active'));
  slides[idx].classList.add('active');
}
function nextSlide(){ slideIndex = (slideIndex + 1) % slides.length; showSlide(slideIndex); }
function prevSlide(){ slideIndex = (slideIndex - 1 + slides.length) % slides.length; showSlide(slideIndex); }

nextBtn.addEventListener('click', ()=>{ nextSlide(); resetSlideInterval(); });
prevBtn.addEventListener('click', ()=>{ prevSlide(); resetSlideInterval(); });

function startSlideInterval(){ slideInterval = setInterval(nextSlide, 6000); }
function resetSlideInterval(){ clearInterval(slideInterval); startSlideInterval(); }
startSlideInterval();

/* -- Tabla de contacto -- */
const contactForm = document.getElementById('contact-form');
contactForm.addEventListener('submit', (e)=>{
  e.preventDefault();
  const fd = new FormData(contactForm);
  alert('Gracias ' + fd.get('name') + ', mensaje enviado (simulación).');
  contactForm.reset();
});

const btnTheme = document.getElementById('btn-toggle-theme');
btnTheme.addEventListener('click', ()=>{
  document.body.classList.toggle('dark-mode');
});

/* -- Inicialización -- */
document.addEventListener('DOMContentLoaded', () => {
  renderCategory('frutas');
  updateCartUI();
  catButtons.forEach(btn => {
    if (btn.dataset.cat === 'frutas') {
      btn.classList.add('active');
    } else {
      btn.classList.remove('active');
    }
  });
});

