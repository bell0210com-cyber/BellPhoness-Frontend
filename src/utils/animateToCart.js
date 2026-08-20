export function animateToCart(e, imageUrl) {
  if (!e || !e.target) return;
  const targetBtn = e.target.closest('button');
  if (!targetBtn) return;
  
  const cartIcon = document.getElementById('cart-icon');
  if (!cartIcon) return;

  const btnRect = targetBtn.getBoundingClientRect();
  const cartRect = cartIcon.getBoundingClientRect();

  const img = document.createElement('img');
  img.src = imageUrl || '/apple-touch-icon.png';
  img.className = 'fly-to-cart-img';
  
  const startX = btnRect.left + btnRect.width / 2 - 25;
  const startY = btnRect.top + btnRect.height / 2 - 25;
  
  const endX = cartRect.left + cartRect.width / 2 - 25;
  const endY = cartRect.top + cartRect.height / 2 - 25;

  img.style.left = `${startX}px`;
  img.style.top = `${startY}px`;
  img.style.setProperty('--fly-x', `${endX - startX}px`);
  img.style.setProperty('--fly-y', `${endY - startY}px`);

  document.body.appendChild(img);
  
  // Add animation class after a tiny delay to ensure CSS registers initial state
  requestAnimationFrame(() => {
    img.classList.add('is-flying');
  });

  // Remove element after animation completes
  setTimeout(() => {
    if (document.body.contains(img)) {
      document.body.removeChild(img);
    }
  }, 800); // 800ms matching CSS duration
}
