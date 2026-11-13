/* LN Cars Valjevo: mali vanilla JS, bez biblioteka */
(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var hasIO = "IntersectionObserver" in window;

  /* ---------- Header: providan preko hero slike, pun posle ---------- */
  var header = document.querySelector(".site-header");
  var hero = document.querySelector(".hero");
  function onScroll() {
    if (header && hero) header.classList.toggle("is-solid", window.scrollY > 40);
  }
  if (header && hero) { onScroll(); window.addEventListener("scroll", onScroll, { passive: true }); }

  /* ---------- Brojač kilometara ---------- */
  function fmt(n) { return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, "."); }
  document.querySelectorAll(".odo[data-km]").forEach(function (el) {
    var km = String(el.getAttribute("data-km"));
    var roll = el.hasAttribute("data-roll");
    var html = "";
    var len = km.length;
    for (var i = 0; i < len; i++) {
      var d = +km[i];
      var last = i === len - 1;
      if (i > 0 && (len - i) % 3 === 0) html += '<span class="odo__sep" aria-hidden="true"></span>';
      if (roll) {
        var spins = 1 + (i % 3);
        var cells = "";
        for (var s = 0; s <= spins; s++) for (var k = 0; k < 10; k++) cells += "<span>" + k + "</span>";
        html += '<span class="odo__d' + (last ? " odo__d--last" : "") + '"><span class="reel" data-target="' + (spins * 10 + d) + '">' + cells + "</span></span>";
      } else {
        html += '<span class="odo__d' + (last ? " odo__d--last" : "") + '"><span>' + d + "</span></span>";
      }
    }
    html += '<span class="odo__unit">km</span>';
    el.setAttribute("role", "img");
    el.setAttribute("aria-label", fmt(km) + " km");
    el.innerHTML = html;

    if (roll) {
      var spin = function () {
        el.querySelectorAll(".reel").forEach(function (r) {
          r.style.transform = "translateY(" + (-1.5 * +r.getAttribute("data-target")) + "em)";
        });
      };
      if (reduce || !hasIO) { spin(); return; }
      var io = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          if (e.isIntersecting) { setTimeout(spin, 150); io.disconnect(); }
        });
      }, { threshold: 0.6 });
      io.observe(el);
    }
  });

  /* ---------- Suptilna pojava sekcija ---------- */
  if (hasIO && !reduce) {
    var rio = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add("is-in"); rio.unobserve(e.target); }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    document.querySelectorAll(".reveal").forEach(function (el) { rio.observe(el); });
  } else {
    document.querySelectorAll(".reveal").forEach(function (el) { el.classList.add("is-in"); });
  }

  /* ---------- Plutajuća dugmad i sticky traka ---------- */
  function toggleOnPast(target, el) {
    if (!target || !el) return;
    var check = function () {
      var r = target.getBoundingClientRect();
      el.classList.toggle("is-visible", r.bottom < 0);
    };
    check();
    window.addEventListener("scroll", check, { passive: true });
    window.addEventListener("resize", check);
  }
  toggleOnPast(document.querySelector(".hero__cta"), document.querySelector(".fab"));
  toggleOnPast(document.querySelector(".buy__ctas"), document.querySelector(".sticky-buy"));

  /* ---------- Pretraga (demo) ---------- */
  var form = document.querySelector(".search");
  if (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var target = document.getElementById("ponuda");
      if (target) target.scrollIntoView({ behavior: reduce ? "auto" : "smooth" });
    });
  }

  /* ---------- Galerija i lightbox ---------- */
  var gallery = document.querySelector("[data-gallery]");
  if (!gallery) return;
  var items = Array.prototype.map.call(gallery.querySelectorAll("[data-full]"), function (b) {
    return { full: b.getAttribute("data-full"), alt: b.getAttribute("data-alt") || "" };
  });
  var mainBtn = gallery.querySelector(".gallery__main");
  var mainImg = mainBtn.querySelector("img");
  var thumbs = gallery.querySelectorAll(".thumbs button");
  var current = 0;

  function setMain(i) {
    current = i;
    mainImg.src = items[i].full;
    mainImg.alt = items[i].alt;
    thumbs.forEach(function (t, k) { t.setAttribute("aria-current", k === i ? "true" : "false"); });
  }
  thumbs.forEach(function (t, i) {
    t.addEventListener("click", function () {
      if (t.hasAttribute("data-more") && window.matchMedia("(min-width: 1001px)").matches) { openLb(i); return; }
      setMain(i);
    });
  });

  var lb = document.querySelector(".lightbox");
  var lbImg = lb.querySelector(".lightbox__stage img");
  var lbCount = lb.querySelector(".lightbox__counter");
  var lbCap = lb.querySelector(".lightbox__caption");
  var lastFocus = null;

  function show(i) {
    current = (i + items.length) % items.length;
    lbImg.src = items[current].full;
    lbImg.alt = items[current].alt;
    lbCount.textContent = (current + 1) + " / " + items.length;
    lbCap.textContent = items[current].alt;
    [current + 1, current - 1].forEach(function (k) {
      var pre = new Image(); pre.src = items[(k + items.length) % items.length].full;
    });
  }
  function openLb(i) {
    lastFocus = document.activeElement;
    show(i);
    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    lb.querySelector(".lightbox__close").focus();
  }
  function closeLb() {
    lb.classList.remove("is-open");
    lb.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
    setMain(current);
    if (lastFocus) lastFocus.focus();
  }
  mainBtn.addEventListener("click", function () { if (!mainBtn.dataset.swiped) openLb(current); });
  lb.querySelector(".lightbox__prev").addEventListener("click", function () { show(current - 1); });
  lb.querySelector(".lightbox__next").addEventListener("click", function () { show(current + 1); });
  lb.querySelector(".lightbox__close").addEventListener("click", closeLb);
  lb.querySelector(".lightbox__stage").addEventListener("click", function (e) { if (e.target === e.currentTarget) closeLb(); });
  document.addEventListener("keydown", function (e) {
    if (!lb.classList.contains("is-open")) return;
    if (e.key === "Escape") closeLb();
    else if (e.key === "ArrowRight") show(current + 1);
    else if (e.key === "ArrowLeft") show(current - 1);
    else if (e.key === "Tab") {
      var f = lb.querySelectorAll("button");
      var first = f[0], last = f[f.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    }
  });

  /* Swipe: na lightboxu i na glavnoj slici */
  function swipe(el, onLeft, onRight) {
    var x0 = null, y0 = null;
    el.addEventListener("touchstart", function (e) { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    el.addEventListener("touchend", function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy)) {
        el.dataset.swiped = "1";
        setTimeout(function () { delete el.dataset.swiped; }, 350);
        if (dx < 0) onLeft(); else onRight();
      }
      x0 = null;
    });
  }
  swipe(lb.querySelector(".lightbox__stage"), function () { show(current + 1); }, function () { show(current - 1); });
  swipe(mainBtn, function () { setMain((current + 1) % items.length); }, function () { setMain((current - 1 + items.length) % items.length); });
})();
