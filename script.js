const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));

if (window.location.hash) {
  const anchoredSection = document.querySelector(window.location.hash);
  anchoredSection?.querySelectorAll(".reveal").forEach((element) => element.classList.add("visible"));
}

const hero = document.querySelector(".portrait img");
const glow = document.querySelector(".footer-glow");

window.addEventListener("scroll", () => {
  const y = window.scrollY;
  if (hero && y < window.innerHeight * 1.2) {
    hero.style.transform = `scale(1.015) translateY(${y * 0.018}px)`;
  }
  if (glow) {
    glow.style.transform = `translateY(${Math.max(-30, (y - glow.offsetTop) * 0.015)}px)`;
  }
}, { passive: true });

const clock = document.querySelector("#system-time");
const updateClock = () => {
  if (clock) clock.textContent = new Date().toLocaleTimeString("en-GB", { hour12: false });
};
updateClock();
setInterval(updateClock, 1000);
