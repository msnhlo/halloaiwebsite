// HalloAI Setup: window manager, sign-up flow, demo chat and pixel sprites.

// ---------- pixel sprites ----------
const SPRITES = {
  bot: [
    "........KAAK........", "........KAaK........", ".........KK.........", ".........KK.........",
    "..KKKKKKKKKKKKKKKK..", ".KHLLLLLLLLLLLLLLDK.", ".KLKKKKKKKKKKKKKKDK.", ".KLKSSSSSSSSSSSSKDK.",
    ".KLKSSWWSSSSWWSSKDK.", ".KLKSSWESSSSWESSKDK.", ".KLKSSSSSSSSSSSSKDK.", ".KLKSCSSMSSMSSCSKDK.",
    ".KLKSSSSSMMSSSSSKDK.", ".KLKKKKKKKKKKKKKKDK.", ".KLLLLLLLLLLLLGRLDK.", ".KDDDDDDDDDDDDDDDDK.",
    "..KKKKKKKKKKKKKKKK..", "......KDDDDDDK......", "....KKLLLLLLLLKK....", "....KKKKKKKKKKKK....",
  ],
};
const PALETTE = {
  K: "#000", H: "#fff", L: "#c0c0c0", D: "#808080", S: "#008080", W: "#fff", E: "#9ff",
  M: "#fff", C: "#ff8080", A: "#ff0000", a: "#800000", G: "#00ff00", R: "#ffff00",
};

function drawSprite(canvas) {
  const rows = SPRITES[canvas.dataset.sprite];
  const px = Number(canvas.dataset.px) || 4;
  canvas.width = rows[0].length * px;
  canvas.height = rows.length * px;
  const ctx = canvas.getContext("2d");
  rows.forEach((row, y) =>
    [...row].forEach((c, x) => {
      if (!PALETTE[c]) return;
      ctx.fillStyle = PALETTE[c];
      ctx.fillRect(x * px, y * px, px, px);
    })
  );
}
document.querySelectorAll("canvas[data-sprite]").forEach(drawSprite);

// ---------- windows ----------
const stage = document.getElementById("stage");
const wins = [...document.querySelectorAll(".win")];
const isPhone = () => matchMedia("(max-width: 760px)").matches;
let topZ = 10;

// data-x is an offset from the centre of the stage, data-y from its top
function place(win) {
  const x = (stage.clientWidth - win.offsetWidth) / 2 + (Number(win.dataset.x) || 0);
  win.style.left = Math.max(0, x) + "px";
  win.style.top = (Number(win.dataset.y) || 0) + "px";
  win.dataset.placed = "1";
}
wins.filter((w) => !w.hidden).forEach(place);

function focusWin(win) {
  wins.forEach((w) => w.classList.toggle("inactive", w !== win));
  win.style.zIndex = ++topZ;
}

function openWin(id) {
  const win = document.getElementById(id);
  win.hidden = false;
  if (!win.dataset.placed) place(win);
  focusWin(win);
  if (isPhone()) win.scrollIntoView({ behavior: "smooth", block: "start" });
  const first = win.querySelector("input:not([type=radio]), button.def, button");
  if (first) first.focus({ preventScroll: true });
  return win;
}

function closeWin(win) {
  win.hidden = true;
  const visible = wins.filter((w) => !w.hidden);
  if (visible.length) focusWin(visible[visible.length - 1]);
}

document.addEventListener("click", (e) => {
  const opener = e.target.closest("[data-open]");
  if (opener) openWin(opener.dataset.open);
  const closer = e.target.closest("[data-close]");
  if (closer) closeWin(closer.closest(".win"));
});

wins.forEach((win) => win.addEventListener("pointerdown", () => focusWin(win)));

// Drag windows by their title bar (desktop only)
wins.forEach((win) => {
  const bar = win.querySelector(".tb");
  bar.addEventListener("pointerdown", (e) => {
    if (isPhone() || e.target.closest("button")) return;
    bar.setPointerCapture(e.pointerId);
    const sx = e.clientX - win.offsetLeft;
    const sy = e.clientY - win.offsetTop;
    const move = (ev) => {
      const maxX = stage.clientWidth - 60;
      win.style.left = Math.min(maxX, Math.max(-win.offsetWidth + 60, ev.clientX - sx)) + "px";
      win.style.top = Math.max(-60, ev.clientY - sy) + "px";
    };
    const up = () => {
      bar.removeEventListener("pointermove", move);
      bar.removeEventListener("pointerup", up);
    };
    bar.addEventListener("pointermove", move);
    bar.addEventListener("pointerup", up);
  });
});

document.addEventListener("keydown", (e) => {
  if (e.key === "F1") { e.preventDefault(); openWin("win-help"); }
  if (e.key === "Escape") {
    const top = wins.filter((w) => !w.hidden && w.id !== "win-welcome")
      .sort((a, b) => (b.style.zIndex || 0) - (a.style.zIndex || 0))[0];
    if (top && top.id !== "win-progress") closeWin(top);
  }
});

// ---------- sign-up flow ----------
const form = document.getElementById("setup-form");
const biz = document.getElementById("biz");
const bizErr = document.getElementById("biz-err");
const gauge = document.getElementById("gauge");
const progressMsg = document.getElementById("progress-msg");
let timer = null;
let business = "";
let plan = "Crew";

const STEPS = [
  "Copying friendliness...",
  "Teaching your helper good manners...",
  "Reading %s's opening hours...",
  "Polishing the robot...",
  "Saying hallo...",
];

function setGauge(p) {
  gauge.style.setProperty("--p", p + "%");
  gauge.setAttribute("aria-valuenow", p);
  gauge.querySelectorAll(".t").forEach((t) => (t.textContent = p + "%"));
}

form.addEventListener("submit", (e) => {
  e.preventDefault();
  business = biz.value.trim();
  if (!business) {
    bizErr.hidden = false;
    biz.focus();
    return;
  }
  bizErr.hidden = true;
  plan = new FormData(form).get("plan");
  runProgress();
});

function runProgress() {
  clearInterval(timer);
  openWin("win-progress");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  let p = 0;
  setGauge(0);
  timer = setInterval(() => {
    p = Math.min(100, p + (reduced ? 25 : 2));
    setGauge(p);
    const step = STEPS[Math.min(STEPS.length - 1, Math.floor((p / 100) * STEPS.length))];
    progressMsg.textContent = step.replace("%s", business);
    if (p === 100) {
      clearInterval(timer);
      setTimeout(finish, 400);
    }
  }, reduced ? 300 : 70);
}

function finish() {
  closeWin(document.getElementById("win-progress"));
  document.getElementById("done-title").textContent = `HalloAI is ready to help ${business}.`;
  document.getElementById("done-text").textContent =
    `You're on the ${plan} plan. Your helper can now answer customers, sort your inbox and write the boring stuff. Start a chat to see it work.`;
  openWin("win-done");
}

document.getElementById("cancel").addEventListener("click", () => {
  clearInterval(timer);
  closeWin(document.getElementById("win-progress"));
});

document.getElementById("restart").addEventListener("click", () => {
  closeWin(document.getElementById("win-done"));
  openWin("win-welcome");
});

document.getElementById("exit-yes").addEventListener("click", () => {
  closeWin(document.getElementById("win-exit"));
  document.getElementById("foot-msg").textContent = "Setup was not finished. Fill in the Welcome box whenever you're ready.";
});

// ---------- demo chat ----------
const log = document.getElementById("log");
const chatForm = document.getElementById("chat-form");
const msg = document.getElementById("msg");

const REPLIES = [
  [/hallo|hello|hi\b|hey/i, () => `Hallo! I'm the helper for ${business || "your business"}. Ask me about plans, opening hours or Auto-pilot.`],
  [/price|plan|cost|\$/i, () => "Starter is free with 100 chats a month. Crew is $19 a month with 5,000 chats and Auto-pilot. Studio is $49 a month with unlimited chats and weekly reports."],
  [/hour|open|close/i, () => "Tell me your opening hours once and I'll answer every customer who asks, day or night."],
  [/auto|inbox|email|meeting/i, () => "Auto-pilot sorts your email, books meetings and fills in forms. Anything tricky comes back to you."],
  [/refund|angry|complain/i, () => "I'd pass that one to a person on your team, with a short summary so they can reply fast."],
];

function addLine(who, text) {
  const li = document.createElement("li");
  li.className = who;
  const name = document.createElement("b");
  name.textContent = who === "bot" ? "HalloAI" : "You";
  li.append(name, text);
  log.append(li);
  log.scrollTop = log.scrollHeight;
}

function reply(text) {
  const hit = REPLIES.find(([re]) => re.test(text));
  return hit ? hit[1]() : "Good question! In the real HalloAI I'd answer that from your own FAQ. This demo knows about plans, opening hours and Auto-pilot.";
}

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const text = msg.value.trim();
  if (!text) return;
  addLine("you", text);
  msg.value = "";
  setTimeout(() => addLine("bot", reply(text)), 500);
});

addLine("bot", "Hallo! I'm HalloAI. Ask me something a customer might ask, like \"What are your opening hours?\"");
