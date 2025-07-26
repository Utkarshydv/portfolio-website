// main.js (for animated background)
const canvas = document.getElementById("bg-canvas");
const ctx = canvas.getContext("2d");
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let dots = Array.from({ length: 120 }).map(() => ({
  x: Math.random() * canvas.width,
  y: Math.random() * canvas.height,
  r: Math.random() * 1.5 + 0.5,
  dx: Math.random() * 0.3,
  dy: Math.random() * 0.3,
  color: Math.random() > 0.5 ? "rgba(127, 90, 240, 0.29)" : "rgba(0,255,255,0.2)"
}));

function animate() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  dots.forEach(dot => {
    ctx.beginPath();
    ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
    ctx.fillStyle = dot.color;
    ctx.fill();

    dot.x += dot.dx;
    dot.y += dot.dy;

    if (dot.x > canvas.width) dot.x = 0;
    if (dot.y > canvas.height) dot.y = 0;
  });
  requestAnimationFrame(animate);
}
animate();

window.addEventListener("resize", () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});
// Typewriter effect (runs only if typewriter element exists)
const typewriterElement = document.querySelector(".typewriter");
if (typewriterElement) {
  const sentences = [
    "Python is my jam.",
    "AI/ML developer."
  ];
  let current = 0;
  let charIndex = 0;
  let deleting = false;

  function type() {
    const currentText = sentences[current];
    typewriterElement.textContent = currentText.slice(0, charIndex);

    if (!deleting && charIndex < currentText.length) {
      charIndex++;
    } else if (deleting && charIndex > 0) {
      charIndex--;
    } else {
      deleting = !deleting;
      if (!deleting) current = (current + 1) % sentences.length;
      setTimeout(type, 1000);
      return;
    }

    setTimeout(type, deleting ? 60 : 90);
  }

  type();
}