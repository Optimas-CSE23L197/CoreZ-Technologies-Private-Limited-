/* ═══════════════════════════════════════════════
       CURSOR   RAF loop with lerp, stops when idle
    ═══════════════════════════════════════════════ */
(function () {
  var dot = document.getElementById("cDot");
  var ring = document.getElementById("cRing");
  if (!dot || !ring) return;

  var mx = window.innerWidth / 2,
    my = window.innerHeight / 2;
  var dx = mx,
    dy = my,
    rx = mx,
    ry = my;
  var rafId = null;

  // FIX: Track whether cursor has moved recently   stop RAF when idle
  var mouseMoved = false;

  document.addEventListener(
    "mousemove",
    function (e) {
      mx = e.clientX;
      my = e.clientY;
      if (!mouseMoved) {
        mouseMoved = true;
        if (!rafId) rafId = requestAnimationFrame(rafLoop);
      }
    },
    { passive: true },
  );

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function rafLoop() {
    dx = lerp(dx, mx, 0.72);
    dy = lerp(dy, my, 0.72);
    rx = lerp(rx, mx, 0.12);
    ry = lerp(ry, my, 0.12);

    dot.style.transform =
      "translate3d(" + (dx - 4) + "px," + (dy - 4) + "px,0)";
    ring.style.transform =
      "translate3d(" + (rx - 17) + "px," + (ry - 17) + "px,0)";

    // FIX: Stop loop when cursor position has fully caught up (saves CPU at rest)
    var dotDiffX = Math.abs(dx - mx),
      dotDiffY = Math.abs(dy - my);
    var ringDiffX = Math.abs(rx - mx),
      ringDiffY = Math.abs(ry - my);
    if (
      dotDiffX < 0.1 &&
      dotDiffY < 0.1 &&
      ringDiffX < 0.1 &&
      ringDiffY < 0.1
    ) {
      mouseMoved = false;
      rafId = null;
      return;
    }

    rafId = requestAnimationFrame(rafLoop);
  }

  document
    .querySelectorAll("a,button,.tc,.fc,.how-card,.testi-c,.trust-c,.phys-card")
    .forEach(function (el) {
      el.addEventListener("mouseenter", function () {
        dot.classList.add("hov");
        ring.classList.add("hov");
      });
      el.addEventListener("mouseleave", function () {
        dot.classList.remove("hov");
        ring.classList.remove("hov");
      });
    });
})();

/* ═══════════════════════════════════════════════
       SPOTLIGHT on cards via CSS var
    ═══════════════════════════════════════════════ */
document.querySelectorAll(".how-card,.fc").forEach(function (card) {
  card.addEventListener(
    "mousemove",
    function (e) {
      var r = card.getBoundingClientRect();
      card.style.setProperty("--mx", e.clientX - r.left + "px");
      card.style.setProperty("--my", e.clientY - r.top + "px");
    },
    { passive: true },
  );
});

/* ═══════════════════════════════════════════════
       MAIN INIT
    ═══════════════════════════════════════════════ */
$(document).ready(function () {
  /* Ticker duplicate */
  var t = document.getElementById("tickerTrack");
  if (t) t.innerHTML += t.innerHTML;

  /* ── Scroll progress + navbar (RAF-throttled) ── */
  var spEl = document.getElementById("sp");
  var scrollY = 0,
    scrollTicking = false;

  function onScroll() {
    scrollY = window.scrollY || window.pageYOffset;
    if (!scrollTicking) {
      requestAnimationFrame(function () {
        var dh = document.documentElement.scrollHeight - window.innerHeight;
        spEl.style.width = (scrollY / dh) * 100 + "%";

        if (scrollY > 45) $("#nav").addClass("sc");
        else $("#nav").removeClass("sc");

        if (scrollY > 380) $("#btt").addClass("show");
        else $("#btt").removeClass("show");

        scrollTicking = false;
      });
      scrollTicking = true;
    }
  }

  window.addEventListener("scroll", onScroll, { passive: true });

  /* Back to top   native smooth scroll */
  document.getElementById("btt").addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  /* Mobile nav */
  document.getElementById("hambBtn").addEventListener("click", function () {
    var isOpen = document.getElementById("mobNav").classList.contains("open");
    if (isOpen) {
      document.getElementById("mobNav").classList.remove("open");
      this.classList.remove("open");
    } else {
      document.getElementById("mobNav").classList.add("open");
      this.classList.add("open");
    }
  });
  document.querySelectorAll(".mob-lnk").forEach(function (a) {
    a.addEventListener("click", function () {
      document.getElementById("mobNav").classList.remove("open");
      document.getElementById("hambBtn").classList.remove("open");
    });
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") {
      document.getElementById("mobNav").classList.remove("open");
      document.getElementById("hambBtn").classList.remove("open");
    }
  });

  /* Owl Carousel */
  $("#testiCarousel").owlCarousel({
    loop: true,
    margin: 18,
    autoplay: true,
    autoplayTimeout: 4800,
    autoplayHoverPause: true,
    dots: true,
    nav: false,
    responsive: {
      0: { items: 1 },
      768: { items: 2 },
      1200: { items: 3 },
    },
  });

  /* Smooth anchor scrolling   native scroll */
  document.querySelectorAll('a[href^="#"]').forEach(function (a) {
    a.addEventListener("click", function (e) {
      var tgt = document.querySelector(this.getAttribute("href"));
      if (tgt) {
        e.preventDefault();
        tgt.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    });
  });

  /* ── IntersectionObserver for scroll reveals ── */
  var revObs = new IntersectionObserver(
    function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) en.target.classList.add("vis");
      });
    },
    { threshold: 0.1, rootMargin: "0px 0px -60px 0px" },
  );

  document.querySelectorAll(".rv,.rv-l,.rv-r,.rv-s").forEach(function (el) {
    revObs.observe(el);
  });

  /* ── Bar chart   animate only when visible ── */
  var barsEl = document.querySelector(".bars");
  if (barsEl) {
    new IntersectionObserver(
      function (entries) {
        if (entries[0].isIntersecting) barsEl.classList.add("vis");
      },
      { threshold: 0.3 },
    ).observe(barsEl);
  }

  /* ── Pause ticker animation when scrolled out of view ── */
  var tickerEl = document.querySelector(".ticker-track");
  if (tickerEl) {
    new IntersectionObserver(function (entries) {
      tickerEl.style.animationPlayState = entries[0].isIntersecting
        ? "running"
        : "paused";
    }).observe(tickerEl);
  }

  /* ── Pause CTA rings when section not visible ── */
  var ctaRings = document.querySelectorAll(".cta-ring");
  if (ctaRings.length) {
    var ctaSec = document.querySelector(".cta-sec");
    if (ctaSec) {
      new IntersectionObserver(function (entries) {
        var state = entries[0].isIntersecting ? "running" : "paused";
        ctaRings.forEach(function (r) {
          r.style.animationPlayState = state;
        });
      }).observe(ctaSec);
    }
  }

  /* ── Pause fl1/fl2 badge animations when hero not visible ── */
  var heroBadges = document.querySelectorAll(".pb1,.pb2,.pb3");
  if (heroBadges.length) {
    var heroSec = document.getElementById("home");
    if (heroSec) {
      new IntersectionObserver(function (entries) {
        var state = entries[0].isIntersecting ? "running" : "paused";
        heroBadges.forEach(function (b) {
          b.style.animationPlayState = state;
        });
      }).observe(heroSec);
    }
  }

  /* ── Counter animation   triggered once via IO ── */
  var countersDone = false;
  var ctrObs = new IntersectionObserver(
    function (entries) {
      if (countersDone) return;
      if (!entries[0].isIntersecting) return;
      countersDone = true;
      ctrObs.disconnect();

      document.querySelectorAll(".trust-n[data-target]").forEach(function (el) {
        var target = parseFloat(el.dataset.target);
        var suffix = el.dataset.suffix || "";
        var steps = 80,
          inc = target / steps,
          cur = 0;
        var tmr = setInterval(function () {
          cur += inc;
          if (cur >= target) {
            cur = target;
            clearInterval(tmr);
          }
          var disp =
            target >= 1000
              ? Math.floor(cur).toLocaleString("en-IN")
              : cur.toFixed(target % 1 !== 0 ? 1 : 0);
          el.textContent = disp + suffix;
        }, 18);
      });
    },
    { threshold: 0.3 },
  );

  var trustSec = document.querySelector(".trust-sec");
  if (trustSec) ctrObs.observe(trustSec);

  /* Form */
  document.getElementById("cSubmit").addEventListener("click", function () {
    var ok = true;
    ["#cName", "#cEmail", "#cSchool", "#cStudents"].forEach(function (sel) {
      var f = document.querySelector(sel);
      if (!f || !f.value.trim()) {
        ok = false;
        f.style.borderColor = "var(--red)";
        f.style.boxShadow = "0 0 0 3px rgba(232,52,42,.12)";
        setTimeout(function () {
          f.style.borderColor = "";
          f.style.boxShadow = "";
        }, 1500);
      }
    });
    if (!ok) return;
    var btn = this;
    btn.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Sending...';
    btn.style.opacity = "0.7";
    btn.disabled = true;
    setTimeout(function () {
      document.getElementById("fOk").style.display = "block";
      btn.style.display = "none";
    }, 1100);
  });
});

/* ═══════════════════════════════════════════════
       RESQID 3D   lerp tilt with spring return
    ═══════════════════════════════════════════════ */
(function () {
  var wrap = document.getElementById("rqWrap");
  var txt = document.getElementById("rqTxt");
  if (!wrap || !txt) return;

  var tRX = 0,
    tRY = 0,
    cRX = 0,
    cRY = 0;
  var hov = false,
    rafId = null;
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function tick() {
    cRX = lerp(cRX, hov ? tRX : 0, hov ? 0.09 : 0.08);
    cRY = lerp(cRY, hov ? tRY : 0, hov ? 0.09 : 0.08);
    txt.style.transform =
      "perspective(700px) rotateX(" + cRX + "deg) rotateY(" + cRY + "deg)";
    var near = Math.abs(cRX) < 0.05 && Math.abs(cRY) < 0.05;
    if (!hov && near) {
      txt.style.transform = "";
      txt.classList.remove("js-tilt");
      txt.style.filter = "drop-shadow(0 0 32px rgba(232,52,42,.3))";
      rafId = null;
      return;
    }
    rafId = requestAnimationFrame(tick);
  }

  wrap.addEventListener("mouseenter", function () {
    hov = true;
    txt.classList.add("js-tilt");
    txt.style.filter = "drop-shadow(0 0 52px rgba(232,52,42,.65))";
    if (!rafId) rafId = requestAnimationFrame(tick);
  });
  wrap.addEventListener(
    "mousemove",
    function (e) {
      var r = wrap.getBoundingClientRect();
      tRY = ((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 30;
      tRX = -((e.clientY - r.top - r.height / 2) / (r.height / 2)) * 20;
    },
    { passive: true },
  );
  wrap.addEventListener("mouseleave", function () {
    hov = false;
    tRX = 0;
    tRY = 0;
    if (!rafId) rafId = requestAnimationFrame(tick);
  });
  wrap.addEventListener(
    "touchmove",
    function (e) {
      var touch = e.touches[0],
        r = wrap.getBoundingClientRect();
      tRY = ((touch.clientX - r.left - r.width / 2) / (r.width / 2)) * 24;
      tRX = -((touch.clientY - r.top - r.height / 2) / (r.height / 2)) * 16;
    },
    { passive: true },
  );
})();

/* ═══════════════════════════════════════════════
       PHYSICAL CARD TILT   lerp spring
    ═══════════════════════════════════════════════ */
(function () {
  var pc = document.getElementById("physCard");
  if (!pc) return;
  var tRX = 2,
    tRY = -6,
    cRX = 2,
    cRY = -6;
  var hov = false,
    rafId = null;
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function tick() {
    cRX = lerp(cRX, tRX, 0.1);
    cRY = lerp(cRY, tRY, 0.1);
    pc.style.transform =
      "perspective(900px) rotateY(" + cRY + "deg) rotateX(" + cRX + "deg)";
    var near = Math.abs(cRX - tRX) < 0.02 && Math.abs(cRY - tRY) < 0.02;
    if (near && !hov) {
      rafId = null;
      return;
    }
    rafId = requestAnimationFrame(tick);
  }

  pc.addEventListener("mouseenter", function () {
    hov = true;
  });
  pc.addEventListener(
    "mousemove",
    function (e) {
      var r = pc.getBoundingClientRect();
      var x = (e.clientX - r.left - r.width / 2) / (r.width / 2);
      var y = (e.clientY - r.top - r.height / 2) / (r.height / 2);
      tRY = x * 13;
      tRX = -y * 8;
      if (!rafId) rafId = requestAnimationFrame(tick);
    },
    { passive: true },
  );
  pc.addEventListener("mouseleave", function () {
    hov = false;
    tRX = 2;
    tRY = -6;
    if (!rafId) rafId = requestAnimationFrame(tick);
  });
})();

/* ═══════════════════════════════════════════════
       TEAM CARDS TILT   lerp spring
    ═══════════════════════════════════════════════ */
document.querySelectorAll(".tc").forEach(function (card) {
  var tX = 0,
    tY = 0,
    cX = 0,
    cY = 0,
    hov = false,
    rafId = null;
  var isCeo = card.classList.contains("tc-ceo");
  var str = isCeo ? 4 : 6;
  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  card.querySelectorAll(".tc-sb").forEach(function (link) {
    link.addEventListener("mouseenter", function (e) {
      e.stopPropagation();
      hov = false;
      tX = 0;
      tY = 0;
    });
    link.addEventListener("click", function (e) {
      e.stopPropagation();
    });
  });

  function tick() {
    cX = lerp(cX, hov ? tX : 0, 0.09);
    cY = lerp(cY, hov ? tY : 0, 0.09);
    card.style.transform =
      "translateY(" +
      (hov ? -6 : -0) +
      "px) perspective(700px) rotateX(" +
      cY * 0.5 +
      "deg) rotateY(" +
      cX * 0.5 +
      "deg)";
    var near = Math.abs(cX) < 0.04 && Math.abs(cY) < 0.04;
    if (!hov && near) {
      card.style.transform = "";
      rafId = null;
      return;
    }
    rafId = requestAnimationFrame(tick);
  }

  card.addEventListener("mouseenter", function () {
    hov = true;
    if (!rafId) rafId = requestAnimationFrame(tick);
  });
  card.addEventListener(
    "mousemove",
    function (e) {
      var r = card.getBoundingClientRect();
      tX = ((e.clientX - r.left - r.width / 2) / (r.width / 2)) * str;
      tY = ((e.clientY - r.top - r.height / 2) / (r.height / 2)) * str;
    },
    { passive: true },
  );
  card.addEventListener("mouseleave", function () {
    hov = false;
    tX = 0;
    tY = 0;
    if (!rafId) rafId = requestAnimationFrame(tick);
  });
});

// =============================================================================
// EmailJS Configuration
// =============================================================================
const EMAILJS_CONFIG = {
  publicKey: "jWTBkLGozB9yGpOEu",
  serviceId: "service_pvkmy5q",
  templateId: "template_9hab3dk",
};

if (typeof emailjs !== "undefined") {
  emailjs.init(EMAILJS_CONFIG.publicKey);
}

// =============================================================================
// Toast
// =============================================================================
function showToast(message, type = "success", duration = 5000) {
  const existingToast = document.querySelector(".resqid-toast");
  if (existingToast) existingToast.remove();

  const toast = document.createElement("div");
  toast.className = `resqid-toast resqid-toast-${type}`;
  toast.innerHTML = `
    <div class="resqid-toast-icon">${type === "success" ? "✓" : type === "error" ? "✗" : "ℹ"}</div>
    <div class="resqid-toast-content">
      <div class="resqid-toast-title">${type === "success" ? "Success!" : type === "error" ? "Error!" : "Notice"}</div>
      <div class="resqid-toast-message">${message}</div>
    </div>
    <button class="resqid-toast-close">&times;</button>
  `;

  if (!document.querySelector("#resqidToastStyle")) {
    const style = document.createElement("style");
    style.id = "resqidToastStyle";
    style.textContent = `
      .resqid-toast {
        position: fixed; bottom: 24px; right: 24px;
        min-width: 320px; max-width: 400px;
        background: #0f0f0f; border: 1px solid #262626;
        border-radius: 16px; padding: 16px 20px;
        display: flex; align-items: center; gap: 14px;
        z-index: 10000; box-shadow: 0 20px 35px -10px rgba(0,0,0,0.5);
        animation: toastIn 0.3s ease;
      }
      .resqid-toast-success { border-left: 4px solid #22c55e; }
      .resqid-toast-error   { border-left: 4px solid #ef4444; }
      .resqid-toast-info    { border-left: 4px solid #f97316; }
      .resqid-toast-icon {
        width: 28px; height: 28px; border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 16px; font-weight: bold; flex-shrink: 0;
      }
      .resqid-toast-success .resqid-toast-icon { background: rgba(34,197,94,0.15); color: #22c55e; }
      .resqid-toast-error   .resqid-toast-icon { background: rgba(239,68,68,0.15);  color: #ef4444; }
      .resqid-toast-info    .resqid-toast-icon { background: rgba(249,115,22,0.15); color: #f97316; }
      .resqid-toast-content { flex: 1; }
      .resqid-toast-title   { font-weight: 600; color: #fff; font-size: 14px; margin-bottom: 4px; }
      .resqid-toast-message { color: #a3a3a3; font-size: 13px; line-height: 1.4; }
      .resqid-toast-close {
        background: transparent; border: none; color: #666;
        font-size: 20px; cursor: pointer; padding: 0;
        width: 24px; height: 24px; display: flex;
        align-items: center; justify-content: center;
        border-radius: 8px; transition: all 0.2s;
      }
      .resqid-toast-close:hover { background: #1f1f1f; color: #fff; }
      @keyframes toastIn  { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes toastOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
      .resqid-toast-hide { animation: toastOut 0.3s ease forwards; }
      @media (max-width: 600px) {
        .resqid-toast { left: 16px; right: 16px; bottom: 16px; min-width: auto; max-width: none; }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);

  toast.querySelector(".resqid-toast-close").addEventListener("click", () => {
    toast.classList.add("resqid-toast-hide");
    setTimeout(() => toast.remove(), 300);
  });

  setTimeout(() => {
    if (toast.parentNode) {
      toast.classList.add("resqid-toast-hide");
      setTimeout(() => toast.remove(), 300);
    }
  }, duration);
}

// =============================================================================
// Loading State
// =============================================================================
function setLoadingState(btn, isLoading) {
  if (isLoading) {
    btn._originalHTML = btn.innerHTML;
    btn.innerHTML =
      '<span class="loading-spinner"></span><span>Sending...</span>';
    btn.style.opacity = "0.7";
    btn.disabled = true;

    if (!document.querySelector("#resqidSpinnerStyle")) {
      const s = document.createElement("style");
      s.id = "resqidSpinnerStyle";
      s.textContent = `
        .loading-spinner {
          display: inline-block; width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
          border-radius: 50%; animation: spin 0.6s linear infinite;
          margin-right: 8px; vertical-align: middle;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `;
      document.head.appendChild(s);
    }
  } else {
    btn.innerHTML = btn._originalHTML;
    btn.style.opacity = "1";
    btn.disabled = false;
  }
}

// =============================================================================
// Field Error Highlight
// =============================================================================
function markField(field, valid) {
  if (valid) {
    field.style.borderColor = "";
    field.style.boxShadow = "";
  } else {
    field.style.borderColor = "var(--red, #ef4444)";
    field.style.boxShadow = "0 0 0 3px rgba(239,68,68,0.12)";
  }
  return valid;
}

// =============================================================================
// Submit Handler
// =============================================================================
document
  .getElementById("cSubmit")
  .addEventListener("click", async function (e) {
    e.preventDefault();

    const nameEl = document.getElementById("cName");
    const emailEl = document.getElementById("cEmail");
    const schoolEl = document.getElementById("cSchool");
    const studentsEl = document.getElementById("cStudents");
    const planEl = document.getElementById("cPlan");
    const phoneEl = document.getElementById("cPhone");

    const name = nameEl.value.trim();
    const email = emailEl.value.trim(); // OPTIONAL
    const school = schoolEl.value.trim();
    const students = studentsEl.value;
    const plan = planEl.value;
    const phone = phoneEl.value.trim(); // OPTIONAL

    // Validate
    const v = [
      markField(nameEl, name.length >= 2),
      markField(emailEl, !email || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)),
      markField(schoolEl, school.length >= 3),
      markField(studentsEl, !!students),
      markField(planEl, !!plan),
      markField(phoneEl, !phone || /^[0-9+\-\s]{7,15}$/.test(phone)),
    ];

    if (v.includes(false)) {
      showToast("Please fill in all required fields correctly.", "error", 4000);
      return;
    }

    const btn = this;
    setLoadingState(btn, true);

    try {
      // ─── TEMPLATE PARAMS ─────────────────────────────────────────────────────
      // Variable names MUST match your EmailJS template exactly: {{name}}, {{email}}, etc.
      const templateParams = {
        name: name,
        email: email || "Not provided",
        school: school,
        students: students,
        plan: plan,
        phone: phone || "Not provided",
      };
      // ─────────────────────────────────────────────────────────────────────────

      if (typeof emailjs !== "undefined") {
        await emailjs.send(
          EMAILJS_CONFIG.serviceId,
          EMAILJS_CONFIG.templateId,
          templateParams,
        );
      } else {
        // Dev fallback   remove in production
        console.log("[RESQID] Demo request (simulated):", templateParams);
        await new Promise((r) => setTimeout(r, 800));
      }

      showToast(
        "Demo request sent! We'll contact you within 24 hours.",
        "success",
        6000,
      );

      const fOk = document.getElementById("fOk");
      if (fOk) fOk.style.display = "block";
      btn.style.display = "none";

      // Reset field styles
      [nameEl, emailEl, schoolEl, studentsEl, planEl, phoneEl].forEach((f) => {
        f.style.borderColor = "";
        f.style.boxShadow = "";
        if (f.tagName === "SELECT") f.selectedIndex = 0;
        else f.value = "";
      });
    } catch (err) {
      console.error("[RESQID] EmailJS error:", err);
      showToast("Something went wrong. Please try again.", "error", 5000);
      setLoadingState(btn, false);
    }
  });
