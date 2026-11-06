// ==========================================================
// Dan Nguyen — Home page interactions
// ==========================================================
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

// Footer year
const year = $("#year");
if (year) year.textContent = new Date().getFullYear();

// ---------- Mobile menu ----------
const toggle = $(".nav-toggle");
const links = $(".nav-links");
if (toggle && links) {
  toggle.addEventListener("click", () => {
    const open = links.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open);
  });
  $$("a", links).forEach((a) =>
    a.addEventListener("click", () => {
      links.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    })
  );
}

// ---------- Typing role in the hero ----------
const typed = $(".typed");
if (typed) {
  const words = JSON.parse(typed.dataset.words);
  if (reduceMotion) {
    typed.textContent = words[0];
  } else {
    let w = 0, i = 0, deleting = false;
    const tick = () => {
      const word = words[w];
      typed.textContent = word.slice(0, i);
      if (!deleting && i < word.length) { i++; setTimeout(tick, 70); }
      else if (!deleting) { deleting = true; setTimeout(tick, 1600); }
      else if (i > 0) { i--; setTimeout(tick, 35); }
      else { deleting = false; w = (w + 1) % words.length; setTimeout(tick, 300); }
    };
    tick();
  }
}

// ---------- Terminal that "runs" commands ----------
const term = $(".terminal-body code");
if (term) {
  const script = [
    { cmd: "whoami", out: [["dan nguyen", "t-key"], [" · data science @ SJSU", "t-out"]] },
    { cmd: "cat focus.txt", out: [["machine learning · data analysis · full‑stack apps", "t-out"]] },
    { cmd: "python train.py --model xgboost", out: [["training on 2.26M sensor samples…", "t-out"], ["\n✓ accuracy: 0.964", "t-ok"]] },
    { cmd: "ls projects/", out: [["amazon-outflow/  noaa-visualizer/  har70/\nemotion-detectives/  social-media/  flower-shop/", "t-out"]] },
    { cmd: "status --career", out: [["● open to internships & entry‑level roles (Dec 2026)", "t-ok"]] },
  ];
  const esc = (t) => t.replace(/&/g, "&amp;").replace(/</g, "&lt;");
  const prompt = '<span class="t-prompt">❯</span> ';
  let html = "";
  const render = (extra = "", cursor = true) =>
    (term.innerHTML = html + extra + (cursor ? '<span class="t-cursor"></span>' : ""));
  const outHTML = (out) => out.map(([t, c]) => `<span class="${c}">${esc(t)}</span>`).join("");

  if (reduceMotion) {
    html = script.map((s) => `${prompt}<span class="t-cmd">${esc(s.cmd)}</span>\n${outHTML(s.out)}\n`).join("\n");
    render("", false);
  } else {
    let line = 0;
    const typeLine = () => {
      if (line >= script.length) { render(prompt); return; }
      const { cmd, out } = script[line];
      let i = 0;
      const step = () => {
        render(prompt + `<span class="t-cmd">${esc(cmd.slice(0, i))}</span>`);
        if (i++ < cmd.length) return setTimeout(step, 45 + Math.random() * 45);
        setTimeout(() => {
          html += `${prompt}<span class="t-cmd">${esc(cmd)}</span>\n${outHTML(out)}\n\n`;
          render();
          line++;
          setTimeout(typeLine, 650);
        }, 350);
      };
      step();
    };
    setTimeout(typeLine, 600);
  }
}

// ---------- Count-up stats ----------
const animateCount = (el) => {
  const target = parseFloat(el.dataset.count);
  const decimals = (el.dataset.count.split(".")[1] || "").length;
  const suffix = el.dataset.suffix || "";
  if (reduceMotion) { el.textContent = target.toFixed(decimals) + suffix; return; }
  const start = performance.now(), dur = 1400;
  const frame = (now) => {
    const t = Math.min((now - start) / dur, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = (target * eased).toFixed(decimals) + suffix;
    if (t < 1) requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
};
const countObs = new IntersectionObserver((entries) =>
  entries.forEach((e) => {
    if (e.isIntersecting) { animateCount(e.target); countObs.unobserve(e.target); }
  }), { threshold: 0.6 });
$$("[data-count]").forEach((el) => { el.textContent = "0" + (el.dataset.suffix || ""); countObs.observe(el); });

// ---------- Project filters ----------
const filters = $$(".filter");
const projects = $$(".project");
filters.forEach((btn) =>
  btn.addEventListener("click", () => {
    filters.forEach((b) => b.classList.remove("active"));
    btn.classList.add("active");
    const f = btn.dataset.filter;
    projects.forEach((p) => {
      const show = f === "all" || p.dataset.category.split(" ").includes(f);
      p.classList.toggle("hidden", !show);
    });
  })
);

// ---------- Cursor spotlight on project cards ----------
projects.forEach((card) =>
  card.addEventListener("pointermove", (e) => {
    const r = card.getBoundingClientRect();
    card.style.setProperty("--mx", `${e.clientX - r.left}px`);
    card.style.setProperty("--my", `${e.clientY - r.top}px`);
  })
);

// ---------- Copy email ----------
const copyBtn = $(".copy-email");
if (copyBtn) {
  copyBtn.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(copyBtn.dataset.email);
      copyBtn.textContent = "Copied ✓";
    } catch {
      copyBtn.textContent = copyBtn.dataset.email;
    }
    copyBtn.classList.add("copied");
    setTimeout(() => { copyBtn.textContent = "Copy email"; copyBtn.classList.remove("copied"); }, 2000);
  });
}

// ---------- Scroll reveal (staggered) ----------
const revealObs = new IntersectionObserver((entries) =>
  entries.forEach((e) => {
    if (e.isIntersecting) { e.target.classList.add("visible"); revealObs.unobserve(e.target); }
  }), { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
const groups = [".section > h2", ".section > p", ".about-grid > *", ".traits li", ".timeline > li", ".edu",
  ".filters", ".project", ".skill-group", ".beyond", ".contact .hero-actions"];
$$(groups.join(",")).forEach((el) => {
  const siblings = [...el.parentElement.children].filter((c) => c.matches(groups.join(",")));
  el.style.setProperty("--d", `${Math.min(siblings.indexOf(el), 5) * 0.08}s`);
  el.classList.add("reveal");
  revealObs.observe(el);
});

// ---------- Scroll: progress bar, nav border, active link, timeline fill ----------
const progress = $(".progress");
const nav = $(".nav");
const sections = $$("main section[id]");
const navLinks = $$(".nav-links a[href^='#']");
const timeline = $(".timeline");
const items = $$(".timeline > li");

const onScroll = () => {
  const y = scrollY, vh = innerHeight;
  const max = document.documentElement.scrollHeight - vh;
  if (progress) progress.style.setProperty("--p", max > 0 ? y / max : 0);
  if (nav) nav.classList.toggle("scrolled", y > 10);

  let current = "";
  sections.forEach((s) => { if (s.getBoundingClientRect().top < vh * 0.4) current = s.id; });
  navLinks.forEach((a) => a.classList.toggle("active", a.getAttribute("href") === "#" + current));

  if (timeline) {
    const r = timeline.getBoundingClientRect();
    const fill = Math.min(Math.max((vh * 0.6 - r.top) / r.height, 0), 1);
    timeline.style.setProperty("--fill", fill);
    items.forEach((li) => li.classList.toggle("lit", li.getBoundingClientRect().top + 30 < vh * 0.6));
  }
};
let ticking = false;
addEventListener("scroll", () => {
  if (!ticking) { requestAnimationFrame(() => { onScroll(); ticking = false; }); ticking = true; }
}, { passive: true });
addEventListener("resize", onScroll);
onScroll();
