/* Sundus Hussain | MDBot for Her
   Set CONFIG.email below to receive volunteer, enrollment and speaking requests by email. */
const CONFIG = {
  email: "hussainsundus@gmail.com",
  linkedin: ""
};

(function () {
  "use strict";

  // Images: try the local file first, then the online fallback, then show a placeholder.
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
    if (!toggle || !links) return;
    links.classList.toggle("open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  }
  if (toggle && links) {
    toggle.addEventListener("click", function () { setMenu(!links.classList.contains("open")); });
    links.addEventListener("click", function (e) {
      if (e.target.tagName === "A") setMenu(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") setMenu(false);
    });
  }

  // Reveal on scroll
  var items = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add("in");
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    items.forEach(function (el) { io.observe(el); });
  } else {
    items.forEach(function (el) { el.classList.add("in"); });
  }

  // Service links preselect the form option
  var select = document.getElementById("f-interest");
  if (select) {
    document.querySelectorAll("[data-interest]").forEach(function (a) {
      a.addEventListener("click", function () {
        var wanted = a.getAttribute("data-interest");
        Array.prototype.forEach.call(select.options, function (opt) {
          if (opt.text === wanted) select.value = opt.value;
        });
      });
    });
  }

  // Gallery: enlarge a selected photo in an accessible dialog.
  var galleryDialog = document.getElementById("galleryDialog");
  var dialogImage = document.getElementById("galleryDialogImage");
  var dialogCaption = document.getElementById("galleryDialogCaption");
  var galleryClose = document.querySelector(".gallery__close");

  if (galleryDialog && dialogImage && dialogCaption) {
    document.querySelectorAll(".gallery__open").forEach(function (button) {
      button.addEventListener("click", function () {
        var img = button.querySelector("img");
        var caption = button.closest("figure").querySelector("figcaption");
        if (!img || !img.getAttribute("src")) return;
        dialogImage.src = img.src;
        dialogImage.alt = img.alt;
        dialogCaption.textContent = caption ? caption.textContent : "";
        if (typeof galleryDialog.showModal === "function") galleryDialog.showModal();
      });
    });

    if (galleryClose) {
      galleryClose.addEventListener("click", function () { galleryDialog.close(); });
    }
    galleryDialog.addEventListener("click", function (event) {
      if (event.target === galleryDialog) galleryDialog.close();
    });
  }

  // Form: opens the visitor's email app. This does not send silently in the background.
  var form = document.getElementById("joinForm");
  var status = document.getElementById("formStatus");
  if (!form) return;

  function say(message) {
    if (status) status.textContent = message;
  }

  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var name = form.elements.name;
    var email = form.elements.email;
    var valid = true;

    [name, email].forEach(function (field) {
      var ok = field.value.trim() !== "" &&
        (field.type !== "email" || /^\S+@\S+\.\S+$/.test(field.value.trim()));
      field.setAttribute("aria-invalid", ok ? "false" : "true");
      if (!ok) valid = false;
    });

    if (!valid) {
      say("Please add your name and a valid email address.");
      return;
    }

    var subject = form.elements.interest.value + " - " + name.value.trim();
    var body = "Hello Sundus,\n\nI would like to: " + form.elements.interest.value +
      "\n\n" + form.elements.message.value.trim() +
      "\n\nName: " + name.value.trim() + "\nEmail: " + email.value.trim();

    if (CONFIG.email) {
      window.location.href = "mailto:" + CONFIG.email + "?subject=" +
        encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
      say("Opening your email app. If nothing opens, write to " + CONFIG.email + ".");
      return;
    }

    var done = function (copied) {
      say(copied
        ? "Your message is copied. Paste it into the LinkedIn message that just opened."
        : "LinkedIn is opening. Please send me your message.");
      if (CONFIG.linkedin) window.open(CONFIG.linkedin, "_blank", "noopener");
    };

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(subject + "\n\n" + body)
        .then(function () { done(true); }, function () { done(false); });
    } else {
      done(false);
    }
  });
})();
