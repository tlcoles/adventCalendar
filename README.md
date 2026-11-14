# Advent calendar 2026

This is the 2026 edition of an online Advent calendar originally created collaboratively by **[HenniePenny](https://github.com/HenniePenny)** and **[Tammi Coles (@tlcoles)](https://github.com/tlcoles)**.

This repository is a fork of [HenniePenny/adventCalendar2025](https://github.com/HenniePenny/adventCalendar2025). It preserves the original project's history and credits while allowing the 2026 edition to be developed independently. The 2026 stories, recordings, and changes are by Tammi L. Coles; the 2025 calendar they build on is the joint work of both creators.

The 2026 edition runs at [tlcoles.com](https://www.tlcoles.com/). The 2025 documentation further down remains as a reference.

## What is new in 2026

- **Happy Berlin Bear stories.** All 24 doors hold a read-aloud story: an illustration plus a recording by Tammi L. Coles. The 2025 images and videos remain in `assets/surprises/` and in the git history.
- **Audio doors.** A new `audio` surprise type with an optional illustration (details below).
- **Santa laugh kept.** The optional "Ho Ho Ho" sound still plays once when a door is first opened, and stops as soon as the visitor starts the story.
- **"Our Happy Berlin Bear & his friends."** An optional section below the calendar introduces the recurring characters with a group picture and one line each.
- **Link preview.** Open Graph tags show the cast picture when the calendar link is shared in WhatsApp, Signal, or social media.
- **Credits.** The footer separates the 2026 edition from the original 2025 calendar.
- **Version tags.** `index.html` loads `styles.css` and `script.js` with a `?v=` tag, so returning visitors get the current files and not cached copies.

## Audio surprises

A door can contain a local audio recording, optionally with an illustration shown above the player and on the opened door (with a small ♫ badge). The player appears inside the existing surprise popup, uses the browser's native controls (including on phones), and **never autoplays**. Visitors press Play themselves; they can pause and seek using the controls. Playback stops and resets when the popup closes or another surprise is shown. In the popup, the illustration is capped in height so the player always stays visible, even on short laptop screens.

To add one, put the files under `assets/` and replace the chosen day's entry in the `surprises` array in `script.js`, for example:

```js
{
  type: "audio",
  title: "The tram surprise",
  image: "assets/2026/images/day-18-the-tram-surprise.webp",
  alt: "The bear in a Santa hat lifting a wrapped green present into the open door of a yellow tram",
  src: "assets/2026/audio/day-18-the-tram-surprise.mp3"
}
```

Use MP3 for broad compatibility with mobile and desktop browsers. `title`, `description`, `image`, and `alt` are optional, but a valid `src` is required. Always give an `alt` text when you add an `image`.

### The Santa laugh

If the visitor ticks "Enable Ho Ho Ho Sound," `assets/hohoho.mp3` plays once when a door is opened for the first time. Pressing Play on the story stops the laugh, so the two never overlap. Reopening a door does not laugh again. The laugh is never played for YouTube doors.

## Cast section

The section sits between the controls and the footer in `index.html`. It is a native `<details>` element, so it opens and closes without extra code and works with the keyboard and screen readers.

- Closed by default, shown as a small button styled like the sound toggle.
- Opens to a card with the group picture (`assets/2026/images/bear-and-friends.webp`) and a caption per character.
- `script.js` remembers whether the visitor left it open or closed (see storage keys below).
- Captions and alt text are edited directly in `index.html`; styles are in the "Our Happy Berlin Bear & his friends" block at the end of `styles.css`.

## Link preview

The `<head>` of `index.html` holds Open Graph and Twitter card tags. The preview image is `assets/2026/images/bear-and-friends-share.jpg` (1200 × 800 px JPEG, kept under 300 KB for WhatsApp). The `og:image` URL must be absolute, so update it if the calendar moves to another domain. Messaging apps cache previews, so links shared before a change may keep the old preview for a while.

## Assets

2026 files live in `assets/2026/audio/` and `assets/2026/images/`, named `day-NN-short-title`.

- **Recordings:** leveled to the same loudness (about −21 LUFS, peaks below −1 dBFS) and saved as 64 kbps mono MP3, about 1 MB per story. Day 15 also has gentle compression to even out quiet and loud passages.
- **Illustrations:** 900 × 900 px WebP, about 110 KB each.
- **Cast picture:** 1200 × 800 px WebP for the page, plus the JPEG for link previews.
- **Favicon:** `assets/favicon/` holds a calendar door with "24" in the page's red and green. `favicon.svg` is used by most browsers, `favicon.ico` (16, 32 and 48 px, with a simplified 16 px version) is the fallback, and `apple-touch-icon.png` (180 px, on the page background color) is used when someone adds the calendar to an iPhone or iPad home screen.

## Storage keys

The calendar keeps its state in the visitor's browser (`localStorage`), on that device only:

| Key | Purpose |
| --- | --- |
| `openedDoors-YYYY-12` | Doors opened this December (a new key each year, so every year starts with closed doors) |
| `doorOrder` | The visitor's shuffled door order |
| `soundEnabled` | Whether the Santa laugh is switched on |
| `castOpen` | Whether the cast section was left open |

The Reset button clears the opened doors and the door order.

## Deploying

The calendar is a static site: upload `index.html`, `styles.css`, `script.js`, `snowEffect.js`, and the `assets/` folder to the web root. Before deploying:

1. Make sure `FORCE_TESTING_MODE` is `false` in `script.js`.
2. After changing `styles.css` or `script.js`, bump the matching `?v=` tag in `index.html` (for example `?v=2026c` to `?v=2026d`).
3. After uploading, do a hard refresh (Cmd+Shift+R or Ctrl+Shift+R) to see the changes.

## Testing

Doors stay locked until their December date, so the live calendar cannot be tested in November.

- **On your own computer:** set `FORCE_TESTING_MODE = true` to unlock all doors. Turn it off before deploying, because it unlocks the doors for every visitor.
- **On the live website**, to test on a real phone, make a temporary copy instead:
  1. Copy `index.html` to `preview.html` and `script.js` to `preview-script.js`.
  2. In `preview.html`, change `script.js` to `preview-script.js`, and add this line inside `<head>` so search engines skip the page:
     `<meta name="robots" content="noindex, nofollow">`
  3. In `preview-script.js`, set `FORCE_TESTING_MODE = true`.
  4. Upload both files and open `yoursite.com/preview.html` **in a private or incognito window**. The calendar remembers opened doors in the browser, and a private window keeps that memory separate, so doors you open while testing will not show as opened on your real calendar.
  5. Delete both files when you are done.

Check on Safari for iPhone, Chrome for Android, and a desktop browser: Play, Pause, seeking, closing the popup, switching doors, reopening the same door, the Santa laugh with the sound on, and the cast toggle.

---

# 🎄 Advent Calendar 2025

> _A cozy, customizable digital advent calendar — perfect for any December, every year._

![Screenshot of the Advent Calendar](assets/screenshot-placeholder.jpg)

Ho ho ho! Welcome to **Advent Calendar 2025**, a joyful little web project that lets you create your _own_ online advent calendar.

Whether you’re surprising friends, delighting family, or spreading cheer in your classroom, this calendar unlocks a new surprise each day in December — images, videos, or messages — all with festive sparkle.

---

## ✨ Features

- **🎁 Daily surprises** — Each door unlocks a new image, message, or YouTube video.
- **🕰️ Date-gated magic** — Doors open only on or after their day (Dec 1–24).
- **🗃️ Memory included** — The calendar remembers opened doors until you reset it, with a friendly confirmation dialog so progress isn’t wiped by accident.
- **🧁 Customizable** — Swap in your own images, videos, or quotes — no coding skills required.
- **❄️ Falling snow** — Gentle snowflakes float across your screen (unless your device says “no thanks” to motion).
- **🔊 Ho Ho Ho toggle** — Optional Santa laugh when you open a door!
- **📱 Fully responsive** — Looks great on phones, tablets, and big desktop displays.
- **🧑‍🎄 Festive flair** — Candy-cane cursor, snow-capped doors, and Christmas coloring.

---

## 🛠️ Setup

1. **Download or clone this repository:**

   ```bash
   git clone https://github.com/HenniePenny/adventCalendar2025.git
   ```

2. **Open the project folder**, then double-click `index.html` to open it in your browser.
   That’s it! No installation, no build process — just pure, static HTML + CSS + JS joy.

3. _(Optional)_ Host it on your favorite static site service such as **GitHub Pages**, **Netlify**, or **Vercel** to share with others.

---

## 🧪 Testing your calendar

While you’re building or customizing, you don’t have to wait until December 1 to peek behind the doors.

Inside script.js, near the top, you’ll find:

```js
// --- TEMPORARY: pretend today's date is Dec 10 for testing ---
today.setMonth(11); // December (0-based)
today.setDate(12);
```

You can change the day number to preview any date.

To unlock every door instantly, set:

```js
const FORCE_TESTING_MODE = true;
```

When you’re ready to go live, simply comment those lines back out and reset:

```js
const FORCE_TESTING_MODE = false;
```

Now the calendar will open each door only on its proper December day. 🎁

---

## 🔐 How door locking works

The calendar automatically unlocks each door on its correct day in **any December** based on the visitor’s local date.

No configuration is needed — as long as you’re viewing the calendar during December, each day opens at midnight and earlier days stay open.

Outside of December, the calendar automatically enters **testing mode**, which unlocks all doors so you can preview your content.

---

## 🎨 Make it your own

Everything you need lives inside the `script.js` file — look for the **`surprises`** array.

Each entry looks like this:

```js
{
  type: "image",
  src: "assets/surprises/my-photo.webp",
  alt: "A cozy mug of cocoa and cookies by the fire"
},
{
  type: "youtube",
  url: "https://youtu.be/dQw4w9WgXcQ",
  title: "A festive favorite"
}
```

You can mix and match:

- `type: "image"` → use local images in your `assets/surprises` folder
- `type: "youtube"` → embed cheerful videos
- `type: "text"` → show short messages or quotes

💡 **Tip:** You don’t need to change the code logic — just replace the content inside the array.

### Easy mode ( no coding )

If you don’t want to edit JavaScript, simply replace the images in the `assets/surprises` folder using the same file names.

Your calendar will automatically show your new pictures.

---

## 🔔 Optional extras

- **Reset button:** Clears progress and reshuffles door order, with confirmation popup.
- **Sound toggle:** Turn the “Ho Ho Ho” effect on / off — the setting is remembered.
- **Snow effect:** Automatically adapts to screen size and disables itself if the user prefers reduced motion.

---

## ♿ Accessibility & compatibility

- Works on modern browsers — Chrome, Safari, Firefox, Edge.
- Respects “Reduce Motion” settings for accessibility.
- Supports both mouse and touch input.
- Keyboard navigation and focus outlines included.

🎄 **Ongoing improvements:**  
We’re actively working to expand accessibility support to ensure this calendar is usable and enjoyable for _everyone_. Our roadmap includes improved keyboard flow, stronger screen-reader support, and enhanced color-contrast options.

---

## 👩‍💻 Authors

**Created by:** [@HenniePenny](https://github.com/HenniePenny) & [@tlcoles](https://github.com/tlcoles)  
Built with care, curiosity, and a sprinkle of Christmas magic. 🎄

---

## 🎥 Acknowledgements

A sleighful of thanks to all the creators whose work adds sparkle to this project:

- **Public domain Christmas cartoons** featured via YouTube — including classics like
  _“Christmas Comes But Once a Year”_ (1936, Fleischer Studios),
  _“Jack Frost”_ (1934, Ub Iwerks),
  _“Snow Foolin’”_ (1949, Famous Studios),
  _“The Pups’ Christmas”_ (1936, Happy Harmonies), and more.
- **Festive imagery** adapted from freely available, royalty-free sources such as [Pixabay](https://pixabay.com/), [Unsplash](https://unsplash.com/) and [Pexels](https://www.pexels.com/).
- **Fonts** from [Google Fonts](https://fonts.google.com/) — _Henny Penny_, the happiest font around.

And of course:

> 🪄 _Special thanks to all the coders whose work seeds the large language model behind ChatGPT (OpenAI). We used this resource for technical guidance, code wizardry, and creative collaboration throughout development._

---

## 🧑‍💻 Contributing

Found a bug in Santa’s code? Got a bright idea for a new festive feature?
Fork the repo, make your tweaks, and send a pull request — the elves will thank you!

---

## 📜 License

**Made with ❤️, JavaScript, and a pinch of cinnamon.**
Free to use, share, and remix — just spread the joy and credit the original project.
Happy coding, and may your December always be merry! 🎅
