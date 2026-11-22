/* Sundus Hussain | MDBot for Her
   Set CONFIG.email below to receive volunteer, enrollment and speaking requests by email. */
const CONFIG = {
  email: "hussainsundus@gmail.com",
  linkedin: ""
};

(function () {
  "use strict";


  // Images: try the local file first, then the online fallback, then show a placeholder
  function handleImageError(img) {
    var fallback = img.getAttribute("data-fallback");
    if (fallback && img.src.indexOf(fallback) === -1) {
      img.src = fallback;
      return;
    }
    var holder = img.closest("figure");
    if (holder) holder.classList.add("img-missing");
  }
  document.querySelectorAll("img").forEach(function (img) {
    img.addEventListener("error", function () { handleImageError(img); });
    if (img.complete && img.naturalWidth === 0) handleImageError(img);
  });

  // Mobile menu
  var toggle = document.getElementById("navToggle");
  var links = document.getElementById("navLinks");
  function setMenu(open) {
    links.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  if (toggle && links) {
    toggle.addEventListener("click", function () { setMenu(!links.classList.contains("open")); });
    links.addEventListener("click", function (e) { if (e.target.tagName === "A") setMenu(false); });
    document.addEventListener("keydown", function (e) { if (e.key === "Escape") setMenu(false); });
  }

  // Reveal on scroll
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("in"); });
  }

  // Service links preselect the form option
  var select = document.getElementById("f-interest");
  document.querySelectorAll("[data-interest]").forEach(function (a) {
    a.addEventListener("click", function () {
      var wanted = a.getAttribute("data-interest");
      Array.prototype.forEach.call(select.options, function (opt) {
        if (opt.text === wanted) select.value = opt.value;
      });
    });
  });

  // Form: opens the visitor's email app, or copies the message and opens LinkedIn
  var form = document.getElementById("joinForm");
  var status = document.getElementById("formStatus");
  if (!form) return;

  function say(text) { status.textContent = text; }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = form.elements.name;
    var email = form.elements.email;
    var valid = true;
    [name, email].forEach(function (f) {
      var ok = f.value.trim() !== "" && (f.type !== "email" || /^\S+@\S+\.\S+$/.test(f.value.trim()));
      f.setAttribute("aria-invalid", ok ? "false" : "true");
      if (!ok) valid = false;
    });
    if (!valid) { say("Please add your name and a valid email address."); return; }

    var subject = form.elements.interest.value + " - " + name.value.trim();
    var body = "Hello Sundus,\n\nI would like to: " + form.elements.interest.value +
      "\n\n" + form.elements.message.value.trim() +
      "\n\nName: " + name.value.trim() + "\nEmail: " + email.value.trim();

    if (CONFIG.email) {
      window.location.href = "mailto:" + CONFIG.email + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      say("Opening your email app. If nothing opens, write to " + CONFIG.email + ".");
      return;
    }

    var done = function (copied) {
      say(copied
        ? "Your message is copied. Paste it into the LinkedIn message that just opened."
        : "LinkedIn is opening. Please send me your message there.");
      window.open(CONFIG.linkedin, "_blank", "noopener");
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(subject + "\n\n" + body).then(function () { done(true); }, function () { done(false); });
    } else {
      done(false);
    }
  });
})();
