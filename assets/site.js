/* Prestigia Group — site behavior (no dependencies)
   ------------------------------------------------------------------
   Contact forms appear once a business email is set in assets/site-config.js. They open the visitor's
   email app with the inquiry filled in and addressed to that email. */
var FORM_ENDPOINT = "";   // optional: a form service URL (e.g. Formspree); empty = forms open the visitor's email app
var COMPANY_EMAIL = "";
var COMPANY_PHONE = "202-840-3434";

(function () {
  "use strict";
  var reduce = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- mobile menu ---------- */
  var btn = document.querySelector(".menu-btn");
  var links = document.getElementById("nav-links");
  if (btn && links) {
    btn.addEventListener("click", function () {
      var open = links.classList.toggle("open");
      btn.setAttribute("aria-expanded", open ? "true" : "false");
      btn.querySelector("span").textContent = open ? "CLOSE" : "MENU";
    });
  }

  /* ---------- company details from assets/site-config.js ---------- */
  var info = window.SITE_CONFIG || {};
  Object.keys(info).forEach(function (k) {
    var v = String(info[k] || "").trim(); if (!v) return;
    document.querySelectorAll('[data-site="' + k + '"]').forEach(function (e) { e.textContent = v; e.hidden = false; });
    document.querySelectorAll('[data-site-wrap="' + k + '"]').forEach(function (e) { e.hidden = false; });
    document.querySelectorAll('[data-site-hide="' + k + '"]').forEach(function (e) { e.hidden = true; });
    document.querySelectorAll('[data-site-copy="' + k + '"]').forEach(function (e) { e.setAttribute("data-copy", v); });
  });
  if (info.email && String(info.email).trim()) {
    COMPANY_EMAIL = String(info.email).trim();
    document.querySelectorAll("[data-forms]").forEach(function (e) { e.hidden = false; });
    document.querySelectorAll("[data-noforms]").forEach(function (e) { e.hidden = true; });
  }

  /* ---------- year ---------- */
  document.querySelectorAll("[data-year]").forEach(function (el) { el.textContent = new Date().getFullYear(); });

  /* ---------- copy buttons ---------- */
  document.querySelectorAll("[data-copy]").forEach(function (b) {
    b.addEventListener("click", function () {
      var text = b.getAttribute("data-copy");
      var done = function () { var t = b.textContent; b.textContent = "Copied"; setTimeout(function () { b.textContent = t; }, 1600); };
      try {
        navigator.clipboard.writeText(text).then(done, function () { selectText(b.previousElementSibling); });
      } catch (e) { selectText(b.previousElementSibling); }
    });
  });
  function selectText(el) {
    if (!el) return;
    var r = document.createRange(); r.selectNodeContents(el);
    var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
  }

  /* ---------- contact tabs ---------- */
  var tabs = document.querySelectorAll(".tab");
  function showTab(id) {
    tabs.forEach(function (t) {
      var on = t.getAttribute("aria-controls") === id;
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute("aria-controls")).hidden = !on;
    });
  }
  if (tabs.length) {
    tabs.forEach(function (t) {
      t.addEventListener("click", function () { showTab(t.getAttribute("aria-controls")); });
      t.addEventListener("keydown", function (e) {
        if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
        var arr = Array.prototype.slice.call(tabs), i = arr.indexOf(t);
        var n = arr[(i + (e.key === "ArrowRight" ? 1 : arr.length - 1)) % arr.length];
        n.focus(); showTab(n.getAttribute("aria-controls"));
      });
    });
    var h = (location.hash || "").replace("#", "");
    if (h === "partner" || h === "teaming") showTab("panel-partner");
  }

  /* ---------- forms ---------- */
  document.querySelectorAll("form[data-lead]").forEach(function (form) {
    form.addEventListener("submit", function (e) {
      e.preventDefault();
      if (form.querySelector('[name="_gotcha"]').value) return;
      if (!form.reportValidity()) return;
      var status = form.querySelector("[role=status]");
      var subject = form.getAttribute("data-subject");
      var subjField = form.getAttribute("data-subject-field");
      var data = {}, lines = [];
      form.querySelectorAll("input, select, textarea").forEach(function (el) {
        if (!el.name || el.name === "_gotcha") return;
        var v = (el.value || "").trim();
        data[el.name] = v;
        var lab = form.querySelector('label[for="' + el.id + '"]');
        lines.push((lab ? lab.firstChild.textContent.trim() : el.name) + ": " + (v || "—"));
      });
      if (subjField && data[subjField]) subject += " – " + data[subjField];
      var submit = form.querySelector('button[type="submit"]');

      if (FORM_ENDPOINT) {
        submit.disabled = true; submit.firstChild.textContent = "Sending… ";
        data._subject = subject;
        data._kind = /teaming/i.test(form.getAttribute("data-subject")) ? "teaming" : "requirement";
        fetch(FORM_ENDPOINT, { method: "POST", headers: { "Content-Type": "application/json", Accept: "application/json" }, body: JSON.stringify(data) })
          .then(function (r) { if (!r.ok) throw new Error(); form.reset(); say(status, form.getAttribute("data-success"), false); })
          .catch(function () { say(status, "We could not send your message. Please call " + COMPANY_PHONE + (COMPANY_EMAIL ? " or email " + COMPANY_EMAIL : "") + ".", true); })
          .then(function () { submit.disabled = false; submit.firstChild.textContent = form.getAttribute("data-label") + " "; });
        return;
      }
      if (!COMPANY_EMAIL) { say(status, "Online submission is not available right now. Please call " + COMPANY_PHONE + ".", true); return; }
      window.location.href = "mailto:" + COMPANY_EMAIL + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(lines.join("\n"));
      say(status, "Your email app should open with this message pre-filled. Send it to complete your inquiry. If nothing opened, email " + COMPANY_EMAIL + " directly.", false);
    });
  });
  function say(el, msg, err) { el.innerHTML = ""; var p = document.createElement("p"); p.className = "form-status" + (err ? " err" : ""); p.textContent = msg; el.appendChild(p); }

  /* ---------- hero: bridge network canvas ---------- */
  var cv = document.getElementById("bridge-canvas");
  if (!cv || !cv.getContext) return;
  var ctx = cv.getContext("2d");
  var W = 0, H = 0, dpr = 1, nodesL = [], nodesR = [], packets = [], t0 = performance.now();
  var BLUE = "61,176,250", WHITE = "232,238,248", RED = "218,32,58";

  function bell(u) { // logo-like arch: flat ends, rounded crown
    var g = Math.exp(-Math.pow(Math.abs(u - 0.5) / 0.27, 2.4));
    var e = Math.exp(-Math.pow(0.5 / 0.27, 2.4));
    return (g - e) / (1 - e);
  }
  function geom() {
    var x0 = W * 0.14, x1 = W * 0.86, yb = H * 0.7, h = H * 0.42;
    return { x0: x0, x1: x1, yb: yb, h: h, pt: function (u) { return [x0 + (x1 - x0) * u, yb - h * bell(u)]; } };
  }
  function seed() {
    nodesL = []; nodesR = [];
    var rnd = mulberry(7);
    for (var i = 0; i < 11; i++) {
      nodesL.push({ x: W * (0.01 + rnd() * 0.12), y: H * (0.5 + rnd() * 0.42), p: rnd() * 6.28, r: 1.6 + rnd() * 2 });
      nodesR.push({ x: W * (0.87 + rnd() * 0.12), y: H * (0.5 + rnd() * 0.42), p: rnd() * 6.28, r: 1.6 + rnd() * 2 });
    }
    packets = [];
    for (var j = 0; j < 7; j++) packets.push({ u: j / 7, s: 0.055 + rnd() * 0.05, dir: j % 3 === 2 ? -1 : 1 });
  }
  function mulberry(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; var t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
  function resize() {
    var r = cv.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    seed(); draw(performance.now());
  }
  function draw(now) {
    var t = (now - t0) / 1000;
    var g = geom();
    ctx.clearRect(0, 0, W, H);

    // perspective floor
    var vx = W / 2, hor = g.yb;
    ctx.lineWidth = 1;
    for (var i = -10; i <= 10; i++) {
      ctx.strokeStyle = "rgba(" + BLUE + "," + (0.10 - Math.abs(i) * 0.006) + ")";
      ctx.beginPath(); ctx.moveTo(vx + i * W * 0.02, hor); ctx.lineTo(vx + i * W * 0.16, H); ctx.stroke();
    }
    for (var k = 1; k < 7; k++) {
      var f = Math.pow(k / 6, 1.9), y = hor + (H - hor) * f + ((t * 6) % ((H - hor) / 6)) * f * 0.3;
      ctx.strokeStyle = "rgba(" + BLUE + "," + (0.04 + f * 0.1) + ")";
      ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
    }

    // links from clusters to abutments
    function cluster(nodes, ax, ay) {
      nodes.forEach(function (n, idx) {
        var nx = n.x + Math.sin(t * 0.6 + n.p) * 3, ny = n.y + Math.cos(t * 0.5 + n.p) * 3;
        ctx.strokeStyle = "rgba(" + BLUE + ",0.18)";
        ctx.beginPath(); ctx.moveTo(nx, ny); ctx.lineTo(ax, ay); ctx.stroke();
        if (idx > 0) {
          var m = nodes[idx - 1];
          ctx.strokeStyle = "rgba(" + WHITE + ",0.06)";
          ctx.beginPath(); ctx.moveTo(nx, ny); ctx.lineTo(m.x, m.y); ctx.stroke();
        }
        var pulse = 0.55 + 0.45 * Math.sin(t * 1.4 + n.p);
        ctx.fillStyle = "rgba(" + WHITE + "," + (0.35 + pulse * 0.5) + ")";
        ctx.beginPath(); ctx.arc(nx, ny, n.r, 0, 6.283); ctx.fill();
      });
      ctx.fillStyle = "rgba(" + BLUE + ",1)";
      ctx.beginPath(); ctx.arc(ax, ay, 4, 0, 6.283); ctx.fill();
    }
    cluster(nodesL, g.x0, g.yb);
    cluster(nodesR, g.x1, g.yb);

    // deck + railing
    var N = 120, p, q;
    ctx.lineWidth = 2.2;
    ctx.strokeStyle = "rgba(" + WHITE + ",0.9)";
    ctx.beginPath();
    for (var s = 0; s <= N; s++) { p = g.pt(s / N); s ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1]); }
    ctx.stroke();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = "rgba(" + WHITE + ",0.35)";
    ctx.beginPath();
    for (s = 0; s <= N; s++) { p = g.pt(s / N); s ? ctx.lineTo(p[0], p[1] - 14) : ctx.moveTo(p[0], p[1] - 14); }
    ctx.stroke();
    ctx.strokeStyle = "rgba(" + WHITE + ",0.5)";
    for (s = 0; s <= 22; s++) { p = g.pt(s / 22); ctx.beginPath(); ctx.moveTo(p[0], p[1]); ctx.lineTo(p[0], p[1] - 18); ctx.stroke(); }
    // base line
    ctx.strokeStyle = "rgba(" + BLUE + ",0.5)"; ctx.lineWidth = 1;
    ctx.beginPath(); ctx.moveTo(g.x0, g.yb); ctx.lineTo(g.x1, g.yb); ctx.stroke();

    // compass under the crown
    var R = Math.min(W, H) * 0.1, cx = W / 2, cy = g.yb - R * 1.25;
    ctx.save(); ctx.translate(cx, cy);
    ctx.strokeStyle = "rgba(" + BLUE + ",0.9)"; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.arc(0, 0, R, 0.18, Math.PI / 2 - 0.18); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, R, Math.PI / 2 + 0.18, Math.PI - 0.18); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, R, Math.PI + 0.18, 1.5 * Math.PI - 0.18); ctx.stroke();
    ctx.beginPath(); ctx.arc(0, 0, R, 1.5 * Math.PI + 0.18, 2 * Math.PI - 0.18); ctx.stroke();
    ctx.rotate(t * 0.15);
    ctx.strokeStyle = "rgba(" + BLUE + ",0.35)"; ctx.lineWidth = 1;
    for (var a = 0; a < 48; a++) { var an = a / 48 * 6.283, l = a % 6 ? 4 : 9; ctx.beginPath(); ctx.moveTo(Math.cos(an) * (R + 8), Math.sin(an) * (R + 8)); ctx.lineTo(Math.cos(an) * (R + 8 + l), Math.sin(an) * (R + 8 + l)); ctx.stroke(); }
    ctx.rotate(-t * 0.15);
    function star(len, wid, rot, col) {
      ctx.save(); ctx.rotate(rot); ctx.fillStyle = col;
      for (var d = 0; d < 4; d++) { ctx.beginPath(); ctx.moveTo(0, -len); ctx.lineTo(wid, 0); ctx.lineTo(0, len * 0.04); ctx.lineTo(-wid, 0); ctx.closePath(); ctx.fill(); ctx.rotate(Math.PI / 2); }
      ctx.restore();
    }
    star(R * 0.78, R * 0.13, Math.PI / 4, "rgba(" + BLUE + ",0.75)");
    star(R * 1.35, R * 0.16, 0, "rgba(" + BLUE + ",1)");
    ctx.fillStyle = "rgba(" + RED + ",1)"; ctx.beginPath(); ctx.moveTo(0, -R * 1.5); ctx.lineTo(R * 0.17, -R * 0.2); ctx.lineTo(-R * 0.17, -R * 0.2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "rgba(" + WHITE + ",1)"; ctx.beginPath(); ctx.arc(0, 0, R * 0.08, 0, 6.283); ctx.fill();
    ctx.restore();

    // packets travelling across the bridge
    packets.forEach(function (pk, idx) {
      var u = ((pk.u + (reduce ? 0 : t * pk.s * pk.dir)) % 1 + 1) % 1;
      var col = pk.dir < 0 ? RED : BLUE;
      for (var tr = 0; tr < 10; tr++) {
        var uu = u - pk.dir * tr * 0.008; if (uu < 0 || uu > 1) continue;
        var pp = g.pt(uu);
        ctx.fillStyle = "rgba(" + col + "," + (0.9 - tr * 0.09) + ")";
        ctx.beginPath(); ctx.arc(pp[0], pp[1] - 7, Math.max(0.6, 3 - tr * 0.25), 0, 6.283); ctx.fill();
      }
      var hp = g.pt(u);
      var grd = ctx.createRadialGradient(hp[0], hp[1] - 7, 0, hp[0], hp[1] - 7, 16);
      grd.addColorStop(0, "rgba(" + col + ",0.5)"); grd.addColorStop(1, "rgba(" + col + ",0)");
      ctx.fillStyle = grd; ctx.beginPath(); ctx.arc(hp[0], hp[1] - 7, 16, 0, 6.283); ctx.fill();
    });
  }
  var raf = 0, visible = true;
  function loop(now) { draw(now); raf = requestAnimationFrame(loop); }
  resize();
  window.addEventListener("resize", function () { cancelAnimationFrame(raf); resize(); if (!reduce && visible) raf = requestAnimationFrame(loop); });
  if (!reduce) {
    if ("IntersectionObserver" in window) {
      new IntersectionObserver(function (es) {
        visible = es[0].isIntersecting;
        cancelAnimationFrame(raf);
        if (visible) raf = requestAnimationFrame(loop);
      }).observe(cv);
    } else { raf = requestAnimationFrame(loop); }
  }
})();
