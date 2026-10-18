# HalloAI

The website for HalloAI, a (fictional) friendly AI helper for small teams.

The homepage looks like a Windows 3.1 Setup screen with 64-bit pixel art. Visitors type their business name, pick a plan, watch a progress bar fill up, and then try a small demo chat.

## Run it

It is a plain static site with no build step. Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8000
```

Then visit http://localhost:8000.

## Files

- `index.html` – the page and all its windows (Welcome, progress, Setup Complete, chat, help, exit)
- `styles.css` – the Windows 3.1 look
- `script.js` – window dragging, the sign-up flow, the demo chat and the pixel robot
