(function () {
  var revealEls = Array.prototype.slice.call(document.querySelectorAll(".reveal"));
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (reduce || !("IntersectionObserver" in window)) {
    revealEls.forEach(function (el) { el.classList.add("visible"); });
  } else {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.08 });
    revealEls.forEach(function (el) { observer.observe(el); });
  }

  if (window.location.hash) {
    var anchored = document.querySelector(window.location.hash);
    if (anchored) {
      Array.prototype.forEach.call(anchored.querySelectorAll(".reveal"), function (el) {
        el.classList.add("visible");
      });
      if (anchored.classList.contains("reveal")) anchored.classList.add("visible");
    }
  }

  var navLinks = Array.prototype.slice.call(document.querySelectorAll(".topnav a"));
  var pairs = [];
  navLinks.forEach(function (link) {
    var sec = document.querySelector(link.getAttribute("href"));
    if (sec) pairs.push({ sec: sec, link: link });
  });

  var highlight = function () {
    var pos = window.scrollY + 110;
    var current = null;
    pairs.forEach(function (pair) {
      if (pair.sec.offsetTop <= pos) current = pair.link;
    });
    navLinks.forEach(function (link) { link.classList.remove("active"); });
    if (current) current.classList.add("active");
  };
  window.addEventListener("scroll", highlight, { passive: true });
  window.addEventListener("resize", highlight);
  highlight();
})();
