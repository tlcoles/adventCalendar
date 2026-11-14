// Wait for the DOM to load before executing the script
document.addEventListener("DOMContentLoaded", () => {
  // ✅ Detect touch support and add a class to <body>
  if ("ontouchstart" in window || navigator.maxTouchPoints > 0) {
    document.body.classList.add("touch-device");
    console.log("Touch device detected – .touch-device class added.");
  }

  // ----- Elements -----
  const calendar = document.getElementById("calendar");
  const modal = document.getElementById("surpriseModal");
  const dialog = modal.querySelector(".modal-dialog"); // tabindex="-1" in HTML
  const modalBody = document.getElementById("modalBody");

  // ----- Date-gating config -----
  const today = new Date();

  // --- Uncomment the two lines below for testing purposes: pretend today's date is Dec 10 for testing ---
  // today.setMonth(11);   // December (0-based)
  // today.setDate(12);

  const targetYear = today.getFullYear();
  const targetMonth = 11; // December

  // ----- Testing mode -----
  const FORCE_TESTING_MODE = false;
  // const autoTestingMode = today.getMonth() !== targetMonth; // now false
  const autoTestingMode = false;
  const testingMode = FORCE_TESTING_MODE || autoTestingMode; // false

  if (testingMode) {
    console.log(
      `🎁 Advent Calendar testing mode active — all doors unlocked for easy preview (${today.toLocaleString("default", { month: "long" })} ${today.getFullYear()}).`
    );
  }

  // ----- Date comparisons -----
  const currentDateMs = new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime();
  const isTargetWindow = today.getFullYear() === targetYear && today.getMonth() === targetMonth;

  // ----- Local storage keys -----
  const openedDoorsKey = `openedDoors-${targetYear}-${String(targetMonth + 1).padStart(2, "0")}`;
  const openedDoorsScoped = JSON.parse(localStorage.getItem(openedDoorsKey)) || [];

  // 🪄 Testing badge
  if (testingMode) {
    const badge = document.createElement("div");
    badge.textContent = "🧪 Testing Mode Active – All Doors Unlocked";
    Object.assign(badge.style, {
      position: "fixed",
      bottom: "0.75rem",
      right: "0.75rem",
      background: "rgba(46, 139, 87, 0.9)",
      color: "#fff",
      fontSize: "0.9rem",
      fontFamily: "system-ui, sans-serif",
      padding: "0.4rem 0.75rem",
      borderRadius: "0.5rem",
      zIndex: "9999",
      boxShadow: "0 2px 6px rgba(0,0,0,0.25)",
      pointerEvents: "none",
    });
    document.body.appendChild(badge);
  }

  // ----- Helpers -----
  function getYouTubeId(input) {
    if (!input) return null;
    if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
    try {
      const u = new URL(input);
      const host = u.hostname.replace(/^www\./, "");
      if (host === "youtu.be") return u.pathname.slice(1).split("/")[0];
      if (["youtube.com", "m.youtube.com", "youtube-nocookie.com"].includes(host)) {
        if (u.pathname.startsWith("/watch")) return u.searchParams.get("v");
        if (u.pathname.startsWith("/embed/")) return u.pathname.split("/")[2];
        if (u.pathname.startsWith("/shorts/")) return u.pathname.split("/")[2] || u.pathname.split("/")[1];
      }
    } catch {}
    return null;
  }

  function openModal() {
    modal.setAttribute("aria-hidden", "false");
    if (dialog) dialog.focus();
    document.addEventListener("keydown", onEsc);
  }

  // Stop a recording before the popup is cleared or another surprise is shown.
  function stopModalAudio() {
    const audio = modalBody.querySelector("audio");
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
  }

  function closeModal() {
    stopModalAudio();
    modal.setAttribute("aria-hidden", "true");
    modalBody.innerHTML = "";
    modal.classList.remove("modal--media");
    document.removeEventListener("keydown", onEsc);
  }

  function onEsc(e) {
    if (e.key === "Escape") closeModal();
  }

  modal.addEventListener("click", (e) => {
    if (e.target.closest("[data-close]") || e.target.classList.contains("modal-backdrop")) {
      closeModal();
    }
  });

  function renderSurprise(s) {
    stopModalAudio();
    modal.classList.remove("modal--media");
    modalBody.innerHTML = "";
    if (!s || !s.type) {
      modalBody.textContent = "Nothing here yet. Come back later!";
      return;
    }

    switch (s.type) {
      case "image":
        modal.classList.add("modal--media");
        const img = document.createElement("img");
        img.src = s.src;
        img.alt = s.alt || "";
        img.loading = "lazy";
        modalBody.appendChild(img);
        break;

      case "text":
        const wrap = document.createElement("div");
        wrap.className = "modal-text";
        if (s.title) {
          const h = document.createElement("h3");
          h.textContent = s.title;
          wrap.appendChild(h);
        }
        const p = document.createElement("p");
        p.textContent = s.body || "";
        wrap.appendChild(p);
        modalBody.appendChild(wrap);
        break;

      case "audio": {
        // Browser-native controls handle touch, seeking, and accessibility.
        // Playback never starts until the visitor presses Play.
        if (!s.src) {
          modalBody.textContent = "Audio unavailable.";
          break;
        }
        const audioWrap = document.createElement("div");
        audioWrap.className = "modal-audio";
        // Optional illustration shown above the player.
        if (s.image) {
          const art = document.createElement("img");
          art.src = s.image;
          art.alt = s.alt || "";
          art.className = "modal-audio-image";
          audioWrap.appendChild(art);
        }
        if (s.title) {
          const audioTitle = document.createElement("h3");
          audioTitle.textContent = s.title;
          audioWrap.appendChild(audioTitle);
        }
        if (s.description) {
          const description = document.createElement("p");
          description.textContent = s.description;
          audioWrap.appendChild(description);
        }
        const player = document.createElement("audio");
        player.controls = true;
        player.preload = "metadata";
        player.src = s.src;
        player.setAttribute("aria-label", s.title || "Audio surprise");
        // The optional Santa laugh may still be playing from opening the door.
        // Stop it as soon as the visitor starts the story, so the two never overlap.
        player.addEventListener("play", () => {
          if (hohoho && !hohoho.paused) {
            hohoho.pause();
            hohoho.currentTime = 0;
          }
        });
        player.addEventListener("error", () => {
          // Avoid inserting duplicate warnings if the browser reports more than once.
          if (!audioWrap.querySelector(".audio-error")) {
            const warning = document.createElement("p");
            warning.className = "audio-error";
            warning.textContent = "This recording could not be loaded.";
            audioWrap.appendChild(warning);
          }
        });
        audioWrap.appendChild(player);
        modalBody.appendChild(audioWrap);
        break;
      }

      case "youtube":
        modal.classList.add("modal--media");
        const id = getYouTubeId(s.url || s.id);
        if (!id) {
          modalBody.textContent = "Video unavailable.";
          break;
        }
        if (hohoho && !hohoho.paused) {
          try { hohoho.pause(); } catch {}
        }
        const box = document.createElement("div");
        box.className = "modal-video";
        const iframe = document.createElement("iframe");
        const base = `https://www.youtube.com/embed/${id}`;
        const params = new URLSearchParams({
          autoplay: "0",
          rel: "0",
          modestbranding: "1",
          playsinline: "1",
          enablejsapi: "1",
          origin: location.origin,
        });
        iframe.src = `${base}?${params.toString()}`;
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.allowFullscreen = true;
        iframe.title = s.title || "Video";
        iframe.referrerPolicy = "strict-origin-when-cross-origin";
        box.appendChild(iframe);
        modalBody.appendChild(box);
        break;

      default:
        modalBody.textContent = "Unknown surprise type.";
    }
  }

  function renderDoorPreview(doorEl, s) {
    if (!s) return;
    if (s.type === "image") {
      doorEl.innerHTML = `<img src="${s.src}" alt="${s.alt || ""}" loading="lazy" style="max-width:100%;height:auto;border-radius:.5rem">`;
    } else if (s.type === "text") {
      doorEl.innerHTML = `<div class="door-text" style="padding:.25rem .5rem;font-size:.9rem;line-height:1.3">${s.title || s.body || "Text"}</div>`;
    } else if (s.type === "youtube") {
      doorEl.innerHTML = `<div class="door-video" style="font-size:.9rem">▶ ${s.title || "Watch video"}</div>`;
    } else if (s.type === "audio") {
      if (s.image) {
        // Show the illustration on the opened door, with a small note badge.
        const thumb = document.createElement("img");
        thumb.src = s.image;
        thumb.alt = s.alt || "";
        thumb.loading = "lazy";
        const badge = document.createElement("span");
        badge.className = "door-audio-badge";
        badge.setAttribute("aria-hidden", "true");
        badge.textContent = "♫";
        doorEl.classList.add("door--audio");
        doorEl.replaceChildren(thumb, badge);
      } else {
        const preview = document.createElement("div");
        preview.className = "door-audio";
        preview.textContent = "♫ " + (s.title || "Listen to audio");
        doorEl.replaceChildren(preview);
      }
    }
  }

  // ----- Surprises -----
  // 2026: Happy Berlin Bear stories. Each door shows an illustration and a read-aloud recording.
  // The 2025 images and videos remain in assets/surprises/ and in the git history.
  const surprises = [
    { type: "audio", title: "The ribbon on the tower", image: "assets/2026/images/day-01-tower-tie.webp", alt: "Happy Berlin Bear in a Santa hat tying a big red bow around the base of the Fernsehturm", src: "assets/2026/audio/day-01-tower-tie.mp3" }, // 1
    { type: "audio", title: "A tree on two wheels", image: "assets/2026/images/day-02-tree-on-bike.webp", alt: "The bear in a yellow beanie riding a red bicycle with a Christmas tree strapped to the back", src: "assets/2026/audio/day-02-tree-on-bike.mp3" }, // 2
    { type: "audio", title: "The cookie thief", image: "assets/2026/images/day-03-cookie-thief.webp", alt: "The bear in a red knit hat holding a steaming red mug inside a Christmas market stall with a striped roof and a golden star", src: "assets/2026/audio/day-03-cookie-thief.mp3" }, // 3
    { type: "audio", title: "A star at the gate", image: "assets/2026/images/day-04-brandenburger-tor.webp", alt: "The bear reaching up to hang a golden star on the Brandenburg Gate", src: "assets/2026/audio/day-04-brandenburger-tor.mp3" }, // 4
    { type: "audio", title: "A small problem with the lights", image: "assets/2026/images/day-05-lights.webp", alt: "The bear dancing happily, tangled up in a string of glowing fairy lights", src: "assets/2026/audio/day-05-lights.mp3" }, // 5
    { type: "audio", title: "Red boots for Nikolaus Day", image: "assets/2026/images/day-06-red-boots-for-nikolaus.webp", alt: "The bear striding along in shiny red boots past an elevated U-Bahn train", src: "assets/2026/audio/day-06-red-boots-for-nikolaus.mp3" }, // 6
    { type: "audio", title: "The missing star cookie", image: "assets/2026/images/day-07-the-missing-cookie.webp", alt: "The bear in a Santa hat sneakily reaching for a star cookie on a baking tray", src: "assets/2026/audio/day-07-the-missing-cookie.mp3" }, // 7
    { type: "audio", title: "A snow bear in the courtyard", image: "assets/2026/images/day-08-a-snow-bear.webp", alt: "The bear in a green beanie building a snow bear with a red scarf", src: "assets/2026/audio/day-08-a-snow-bear.mp3" }, // 8
    { type: "audio", title: "Ninety-six steps", image: "assets/2026/images/day-09-so-many-stairs.webp", alt: "The bear pulling a wooden sled piled high with wrapped presents", src: "assets/2026/audio/day-09-so-many-stairs.mp3" }, // 9
    { type: "audio", title: "The pretzel tree", image: "assets/2026/images/day-10-the-pretzel-tree.webp", alt: "The bear hanging pretzels on a small Christmas tree", src: "assets/2026/audio/day-10-the-pretzel-tree.mp3" }, // 10
    { type: "audio", title: "The skating lesson", image: "assets/2026/images/day-11-the-skating-lesson.webp", alt: "The bear skating on the ice, wobbling with arms flung wide", src: "assets/2026/audio/day-11-the-skating-lesson.mp3" }, // 11
    { type: "audio", title: "Water for the little tree", image: "assets/2026/images/day-12-the-plumpe.webp", alt: "The bear filling a red watering can at a green Berlin street pump tied with a bow, next to a little potted tree", src: "assets/2026/audio/day-12-the-plumpe.mp3" }, // 12
    { type: "audio", title: "The chestnut stop", image: "assets/2026/images/day-13-chestnuts.webp", alt: "The bear eating roasted chestnuts from a paper cone", src: "assets/2026/audio/day-13-chestnuts.mp3" }, // 13
    { type: "audio", title: "The snowball trick", image: "assets/2026/images/day-14-the-snowball-trick.webp", alt: "The bear balancing a snowball on his nose, with the Fernsehturm in the background", src: "assets/2026/audio/day-14-the-snowball-trick.mp3" }, // 14
    { type: "audio", title: "A döner with a bow", image: "assets/2026/images/day-15-the-doener.webp", alt: "The bear carrying a giant döner tied with a red bow", src: "assets/2026/audio/day-15-the-doener.mp3" }, // 15
    { type: "audio", title: "Dancing in the kitchen", image: "assets/2026/images/day-16-dancing-delights.webp", alt: "The bear dancing happily next to a loudspeaker", src: "assets/2026/audio/day-16-dancing-delights.mp3" }, // 16
    { type: "audio", title: "The reading fort", image: "assets/2026/images/day-17-the-reading-fort.webp", alt: "The bear reading a red book in a cozy blanket fort under string lights, with a lantern beside him", src: "assets/2026/audio/day-17-the-reading-fort.mp3" }, // 17
    { type: "audio", title: "The tram surprise", image: "assets/2026/images/day-18-the-tram-surprise.webp", alt: "The bear in a Santa hat lifting a wrapped green present into the open door of a yellow tram", src: "assets/2026/audio/day-18-the-tram-surprise.mp3" }, // 18
    { type: "audio", title: "The Gingerbread King", image: "assets/2026/images/day-19-the-gingerbread-king.webp", alt: "The bear wearing a golden crown, admiring a gingerbread Brandenburg Gate", src: "assets/2026/audio/day-19-the-gingerbread-king.mp3" }, // 19
    { type: "audio", title: "The snow angel", image: "assets/2026/images/day-20-the-snow-angel.webp", alt: "The bear lying in the snow, making a snow angel", src: "assets/2026/audio/day-20-the-snow-angel.mp3" }, // 20
    { type: "audio", title: "The lost list", image: "assets/2026/images/day-21-the-lost-list.webp", alt: "The bear carrying a shopping bag with a baguette and an armful of evergreen branches", src: "assets/2026/audio/day-21-the-lost-list.mp3" }, // 21
    { type: "audio", title: "The accordion on the corner", image: "assets/2026/images/day-22-the-accordion-on-the-corner.webp", alt: "The bear in a Santa hat playing a red accordion", src: "assets/2026/audio/day-22-the-accordion-on-the-corner.mp3" }, // 22
    { type: "audio", title: "The cargo bike express", image: "assets/2026/images/day-23-the-cargo-bike-express.webp", alt: "The bear riding a cargo bike loaded with wrapped presents", src: "assets/2026/audio/day-23-the-cargo-bike-express.mp3" }, // 23
    { type: "audio", title: "The star on top", image: "assets/2026/images/day-24-the-star-on-top.webp", alt: "The bear standing on a wooden crate, placing a golden star on top of a candlelit Christmas tree", src: "assets/2026/audio/day-24-the-star-on-top.mp3" }, // 24
  ];

  // ----- Locked message -----
  function getLockedMessage() {
    const userLang = navigator.language || navigator.userLanguage;
    const isGerman = userLang && userLang.toLowerCase().startsWith("de");
    const messages = isGerman
      ? [
          "Geduld, kleiner Wichtel! Diese Tür öffnet sich erst, wenn die Weihnachtsmagie bereit ist.",
          "Hoppla! Selbst der Weihnachtsmann darf nicht vorher gucken 🎅.",
          "Netter Versuch – aber diese Tür wickelt noch ihr Geheimnis ein 🎁.",
          "Zu früh! Die Wichtel sind noch mitten im Plätzchenbacken 🍪.",
          "Immer langsam mit den jungen Rentieren! Diese Tür braucht noch einen Moment 🦌.",
          "Diese Tür steht noch auf der Liste der unartigen Kinder – schau später nochmal vorbei 😜.",
          "🎄 Die Zukunft ist festlich… aber *heute* noch nicht. Komm später wieder!",
          "Der Weihnachtsmann prüft hier noch einmal alles ganz genau – versuch’s am richtigen Tag nochmal!",
        ]
      : [
          "Patience, little elf! This door opens when the Christmas magic says so.",
          "Whoa there! Even Santa can’t peek early 🎅.",
          "Nice try, but this door’s still wrapping its surprise! 🎁",
          "Too early! The elves are still baking today’s cookies 🍪.",
          "Hold your reindeer! This door isn’t ready yet 🦌.",
          "This one’s still on the naughty list — check back later! 😜",
          "🎄 The future is festive… but not *today*. Come back later!",
          "Santa’s still double-checking this one. Try again on the right day!",
        ];
    return messages[Math.floor(Math.random() * messages.length)];
  }

  // ----- Custom festive popup -----
  function showLockedPopup(message) {
    // Remove any existing *temporary* locked popup,
    // but keep the reset dialog (which also uses locked-popup styles)
    const existing = document.querySelector(".locked-popup:not(.reset-confirm)");
    if (existing) existing.remove();

    // Create popup container
    const popup = document.createElement("div");
    popup.className = "locked-popup";
    popup.textContent = message;
    document.body.appendChild(popup);

    // Animate in
    requestAnimationFrame(() => popup.classList.add("visible"));

    // Close on click or after 3.5 seconds
    popup.addEventListener("click", () => popup.remove());
    setTimeout(() => popup.remove(), 3500);
  }

  // ----- Sound -----
  let isSoundOn = false;
  const hohoho = new Audio("assets/hohoho.mp3");
  const toggleLabel = document.createElement("label");
  toggleLabel.className = "sound-toggle";
  toggleLabel.innerHTML = `
    <input type="checkbox" id="soundToggle">
    🔊 Enable "Ho Ho Ho" Sound
  `;
  const container = document.getElementById("soundToggleContainer");
  if (container) container.appendChild(toggleLabel);
  if (localStorage.getItem("soundEnabled") === "true") {
    isSoundOn = true;
    toggleLabel.querySelector("#soundToggle").checked = true;
  }
  toggleLabel.querySelector("#soundToggle").addEventListener("change", (e) => {
    isSoundOn = e.target.checked;
    localStorage.setItem("soundEnabled", isSoundOn);
  });

  // ----- Door order -----
  let doorOrder = JSON.parse(localStorage.getItem("doorOrder"));
  if (!doorOrder) {
    doorOrder = Array.from({ length: 24 }, (_, i) => i + 1);
    for (let i = doorOrder.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [doorOrder[i], doorOrder[j]] = [doorOrder[j], doorOrder[i]];
    }
    localStorage.setItem("doorOrder", JSON.stringify(doorOrder));
  }

  // ----- Build doors -----
  for (const day of doorOrder) {
    const door = document.createElement("div");
    door.classList.add("door");
    door.setAttribute("data-day", day);
    door.id = `door-${day}`;

    const unlockDateMs = new Date(targetYear, targetMonth, day).setHours(0, 0, 0, 0);

    if (openedDoorsScoped.includes(day)) {
      door.classList.add("opened");
      renderDoorPreview(door, surprises[day - 1]);
      door.dataset.opened = "true";
    } else {
      door.textContent = day;
      const shouldLock = !testingMode && (!isTargetWindow || currentDateMs < unlockDateMs);
      if (shouldLock) {
        door.classList.add("locked");
        door.dataset.locked = "true";
      }
    }

    door.addEventListener("click", () => {
      // Remove any existing *temporary* festive popup before showing a new one
      const existingPopup = document.querySelector(".locked-popup:not(.reset-confirm)");
      if (existingPopup) existingPopup.remove();

      if (door.dataset.locked === "true") {
        showLockedPopup(getLockedMessage());
        return;
      }

      const surprise = surprises[day - 1];

      if (door.dataset.opened !== "true") {
        door.classList.add("opened");
        renderDoorPreview(door, surprise);
        openedDoorsScoped.push(day);
        localStorage.setItem(openedDoorsKey, JSON.stringify(openedDoorsScoped));
        door.dataset.opened = "true";

        if (surprise.type !== "youtube" && isSoundOn && hohoho) {
          hohoho.currentTime = 0;
          hohoho.play().catch((err) => console.log("Audio playback failed:", err));
        }
      }

      renderSurprise(surprise);
      openModal();
    });

    calendar.appendChild(door);
  }

  // ----- Reset -----
    // ----- Reset (accessible dialog) -----
  const resetButton = document.getElementById("resetButton");
  const resetDialog = document.getElementById("resetConfirm");
  const resetMsg = document.getElementById("resetConfirmMessage");
  const resetYes = document.getElementById("resetConfirmYes");
  const resetNo = document.getElementById("resetConfirmNo");

  let lastFocusedElement = null;

  function openResetDialog() {
    if (!resetDialog) return;

    // Remember where focus was
    lastFocusedElement = document.activeElement;

    // Detect language
    const userLang = navigator.language || navigator.userLanguage;
    const isGerman = userLang && userLang.toLowerCase().startsWith("de");

    // Your custom message:
    const message = isGerman
      ? "Möchtest du den Kalender zurücksetzen und alle Türen wieder verpacken?\n\nDein Fortschritt auf diesem Gerät wird gelöscht."
      : "Do you want to reset the calendar and wrap all the doors back up?\n\nYour progress on this device will be cleared.";

    // Dialog title (optional customization)
    const title = isGerman
      ? "🎄 Kalender zurücksetzen?"
      : "🎄 Reset calendar?";

    // Set the text content
    const titleEl = document.getElementById("resetConfirmTitle");
    if (titleEl) titleEl.textContent = title;
    resetMsg.textContent = message;

    // Show dialog
    resetDialog.classList.add("visible");
    resetDialog.setAttribute("aria-hidden", "false");

    // Move focus into the dialog — default button = "Yes"
    if (resetYes) resetYes.focus();

    // Enable ESC + focus trap
    document.addEventListener("keydown", handleResetKeydown);
  }

  function closeResetDialog() {
    if (!resetDialog) return;

    resetDialog.classList.remove("visible");
    resetDialog.setAttribute("aria-hidden", "true");

    document.removeEventListener("keydown", handleResetKeydown);

    // Restore focus to the button that opened it
    if (lastFocusedElement && typeof lastFocusedElement.focus === "function") {
      lastFocusedElement.focus();
    }
  }

  function handleResetKeydown(e) {
    if (e.key === "Escape") {
      e.preventDefault();
      closeResetDialog();
      return;
    }

    // Simple focus trap inside dialog
    if (e.key === "Tab" && resetDialog.classList.contains("visible")) {
      const focusable = [resetYes, resetNo].filter(Boolean);
      const currentIndex = focusable.indexOf(document.activeElement);

      if (e.shiftKey) {
        // Shift+Tab = backwards
        if (currentIndex <= 0) {
          e.preventDefault();
          focusable[focusable.length - 1].focus();
        }
      } else {
        // Tab = forwards
        if (currentIndex === focusable.length - 1) {
          e.preventDefault();
          focusable[0].focus();
        }
      }
    }
  }

  if (resetButton && resetDialog && resetYes && resetNo) {
    // Open dialog
    resetButton.addEventListener("click", () => {
      openResetDialog();
    });

    // Cancel button
    resetNo.addEventListener("click", () => {
      closeResetDialog();
    });

    // Confirm button
    resetYes.addEventListener("click", () => {
      // Clear all relevant storage
      localStorage.removeItem("openedDoors");
      localStorage.removeItem("doorOrder");

      // Remove any month-specific keys like "openedDoors-2025-12"
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith("openedDoors-")) {
          localStorage.removeItem(key);
        }
      });

      // Reload page
      location.reload();
    });
  }

  // ----- Auto-open via URL ?day=7 -----
  function autoOpenFromQuery() {
    const url = new URL(window.location.href);
    const paramDay = parseInt(url.searchParams.get("day"), 10);

    // If it's not a valid day number, do nothing
    if (!paramDay || paramDay < 1 || paramDay > 24) return;

    const doorToOpen = document.querySelector(`.door[data-day="${paramDay}"]`);
    if (!doorToOpen) return;

    // Optional: smooth scroll to the door
    doorToOpen.scrollIntoView({ behavior: "smooth", block: "center" });

    // Add matching hash for nicer sharing (optional)
    history.replaceState(null, "", `?day=${paramDay}#door-${paramDay}`);

    // If locked, show festive popup
    if (doorToOpen.dataset.locked === "true") {
      showLockedPopup(getLockedMessage());
      return;
    }

    // Otherwise: open it using your existing click logic
    doorToOpen.click();
  }

  // Run once on load
  autoOpenFromQuery();
});
