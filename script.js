// HerBloom landing page — light interactivity

// Footer year
document.getElementById('year').textContent = new Date().getFullYear();

// Mobile menu toggle
const menuToggle = document.getElementById('menuToggle');
const mobileMenu = document.getElementById('mobileMenu');
if (menuToggle && mobileMenu) {
  menuToggle.addEventListener('click', () => {
    mobileMenu.hidden = !mobileMenu.hidden;
  });
  mobileMenu.querySelectorAll('a').forEach((a) =>
    a.addEventListener('click', () => (mobileMenu.hidden = true))
  );
}

// Add-to-cart counter
let cartCount = 0;
const cartBadge = document.querySelector('.cart-count');
document.querySelectorAll('.btn--add').forEach((btn) => {
  btn.addEventListener('click', () => {
    cartCount += 1;
    if (cartBadge) cartBadge.textContent = String(cartCount);
    const original = btn.textContent;
    btn.textContent = 'Added ✓';
    btn.disabled = true;
    setTimeout(() => {
      btn.textContent = original;
      btn.disabled = false;
    }, 1200);
  });
});

// Newsletter signup
const form = document.getElementById('signupForm');
const note = document.getElementById('signupNote');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (note) note.hidden = false;
    form.reset();
  });
}
