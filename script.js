/* 杜泽浩 personal site — interactions */
(function () {
  "use strict";

  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- 1. system clock ---------- */
  var clocks = document.querySelectorAll(".clock");
  function tick() {
    var now = new Date().toLocaleTimeString("en-GB", { hour12: false });
    for (var i = 0; i < clocks.length; i++) clocks[i].textContent = now;
  }
  tick();
  setInterval(tick, 1000);

  /* ---------- 2. scroll progress ---------- */
  var bar = document.getElementById("scroll-progress");
  var portraitImg = document.querySelector(".portrait img");
  var ticking = false;

  function onScroll() {
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var y = window.scrollY || window.pageYOffset;
    if (bar) bar.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    if (portraitImg && !reduceMotion && y < window.innerHeight * 1.3) {
      portraitImg.style.transform = "scale(1.02) translateY(" + (y * 0.02).toFixed(2) + "px)";
    }
    ticking = false;
  }
  window.addEventListener("scroll", function () {
    if (!ticking) { ticking = true; window.requestAnimationFrame(onScroll); }
  }, { passive: true });
  onScroll();

  /* ---------- 3. reveal on scroll (with per-group stagger) ---------- */
  var revealables = document.querySelectorAll(".reveal");
  var groups = {};
  revealables.forEach(function (el) {
    var parent = el.parentElement;
    if (!parent) return;
    var key = (parent.id || parent.className || "root") + "|" + parent.children.length;
    if (!groups[key]) groups[key] = [];
    groups[key].push(el);
  });
  Object.keys(groups).forEach(function (key) {
    var list = groups[key];
    if (list.length < 2 || list.length > 12) return;
    list.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i * 70, 420) + "ms";
    });
  });

  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("visible");
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: "0px 0px -6% 0px" });
    revealables.forEach(function (el) { io.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add("visible"); });
  }

  /* deep-linked section: make its reveals visible immediately */
  if (window.location.hash) {
    var anchored = document.querySelector(window.location.hash);
    if (anchored) {
      anchored.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("visible"); });
      anchored.classList.add("visible");
    }
  }

  /* ---------- 4. nav scrollspy ---------- */
  var navLinks = Array.prototype.slice.call(document.querySelectorAll("#site-nav a"));
  var sections = navLinks
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  function spy() {
    var pos = (window.scrollY || 0) + window.innerHeight * 0.32;
    var currentId = null;
    sections.forEach(function (sec) {
      if (sec.offsetTop <= pos) currentId = sec.id;
    });
    navLinks.forEach(function (a) {
      a.classList.toggle("active", a.getAttribute("href") === "#" + currentId);
    });
  }
  if ("IntersectionObserver" in window && sections.length) {
    var spyIo = new IntersectionObserver(function () { spy(); }, { threshold: [0, 0.2, 0.6] });
    sections.forEach(function (sec) { spyIo.observe(sec); });
  }
  window.addEventListener("scroll", spy, { passive: true });
  window.addEventListener("resize", spy);
  spy();

  /* ---------- 5. hero stat counters ---------- */
  var stats = document.querySelectorAll("#hero-stats dt");
  function runCount(el) {
    var target = parseFloat(el.getAttribute("data-count")) || 0;
    var suffix = el.getAttribute("data-suffix") || "";
    var decimals = (String(target).split(".")[1] || "").length;
    if (reduceMotion) { el.textContent = target.toFixed(decimals) + suffix; return; }
    var start = null;
    var dur = 1400;
    function step(ts) {
      if (!start) start = ts;
      var t = Math.min((ts - start) / dur, 1);
      var eased = 1 - Math.pow(1 - t, 3);
      el.textContent = (target * eased).toFixed(decimals) + suffix;
      if (t < 1) window.requestAnimationFrame(step);
    }
    window.requestAnimationFrame(step);
  }
  if (stats.length && "IntersectionObserver" in window) {
    var statIo = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) { runCount(entry.target); statIo.unobserve(entry.target); }
      });
    }, { threshold: 0.4 });
    stats.forEach(function (el) { statIo.observe(el); });
  } else {
    stats.forEach(runCount);
  }

  /* ---------- 6. terminal boot log ---------- */
  var bootLines = [
    { t: "$ init profile --operator=ze-hao-du", c: "" },
    { t: "[ ok ]  education .... 西昌学院 / 电子信息工程 / 2026", c: "ok" },
    { t: "[ ok ]  embedded ..... STM32H743 · FreeRTOS · OpenMV", c: "ok" },
    { t: "[ ok ]  ai-toolchain . Codex · Claude Code · RAG", c: "ok" },
    { t: "[ ok ]  shipped ...... 7+ projects / 2 internships", c: "ok" },
    { t: "[ warn ] status ...... open for opportunities", c: "warn" }
  ];
  var bootEl = document.getElementById("boot-log");

  function renderAll() {
    if (!bootEl) return;
    var html = "";
    bootLines.forEach(function (line) {
      html += '<div class="' + line.c + '">' + escapeHtml(line.t) + "</div>";
    });
    bootEl.innerHTML = html;
  }

  function escapeHtml(str) {
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  function typeBoot() {
    if (!bootEl) return;
    if (reduceMotion) { renderAll(); return; }
    var li = 0;
    var ci = 0;
    bootEl.innerHTML = "";
    function nextLine() {
      if (li >= bootLines.length) {
        var cur = document.createElement("span");
        cur.className = "cur";
        bootEl.appendChild(cur);
        return;
      }
      var line = bootLines[li];
      var row = document.createElement("div");
      if (line.c) row.className = line.c;
      bootEl.appendChild(row);
      ci = 0;
      (function typeChar() {
        if (ci <= line.t.length) {
          row.textContent = line.t.slice(0, ci);
          ci += 1;
          setTimeout(typeChar, line.c === "" ? 26 : 13);
        } else {
          li += 1;
          setTimeout(nextLine, 190);
        }
      })();
    }
    setTimeout(nextLine, 500);
  }
  typeBoot();

  /* ---------- 7. cursor glow (pointer devices only) ---------- */
  var glow = document.getElementById("cursor-glow");
  if (glow && window.matchMedia("(pointer: fine)").matches && !reduceMotion) {
    var gx = window.innerWidth / 2;
    var gy = window.innerHeight / 2;
    var tx = gx;
    var ty = gy;
    window.addEventListener("mousemove", function (e) {
      tx = e.clientX; ty = e.clientY;
      glow.style.opacity = "1";
    }, { passive: true });
    (function loop() {
      gx += (tx - gx) * 0.09;
      gy += (ty - gy) * 0.09;
      glow.style.transform = "translate(" + gx.toFixed(1) + "px," + gy.toFixed(1) + "px)";
      window.requestAnimationFrame(loop);
    })();
  }

  /* ---------- 8. tilt on project cards ---------- */
  if (!reduceMotion && window.matchMedia("(pointer: fine)").matches) {
    document.querySelectorAll(".project, .adv-card, .honor-card").forEach(function (card) {
      card.addEventListener("mousemove", function (e) {
        var r = card.getBoundingClientRect();
        var dx = (e.clientX - r.left) / r.width - 0.5;
        var dy = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = "translateY(-6px) perspective(900px) rotateX(" + (-dy * 3).toFixed(2) + "deg) rotateY(" + (dx * 3.4).toFixed(2) + "deg)";
      });
      card.addEventListener("mouseleave", function () { card.style.transform = ""; });
    });
  }
})();
