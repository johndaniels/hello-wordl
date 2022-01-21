import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export const maxGuesses = 6;

export interface DictionaryEntry {
  original: string,
  target: string,
  canTarget: boolean,
};

function mulberry32(a: number) {
  return function () {
    var t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function urlParam(name: string): string | null {
  return new URLSearchParams(window.location.search).get(name);
}

let seed = urlParam("seed");

export const urlDate = urlParam("date") || dayjs.utc().format("YYYYMMDD");
export const isToday = !seed && urlDate === dayjs.utc().format("YYYYMMDD");
export const urlLength = Number(urlParam("length") || "5");

export function getSeed() : string | null {
  return seed;
}

export function getNewSeed() : string {
  seed = getRandomSeed();
  return seed;
}

export function getRandomSeed() {
  return Math.floor((Math.random() * 1000000000)).toString();
}

export function pick<T>(array: Array<T>, seed: string): T {
  const randVal = mulberry32(Number(seed))();
  return array[Math.floor(array.length * randVal)];
}

// https://a11y-guidelines.orange.com/en/web/components-examples/make-a-screen-reader-talk/
export function speak(
  text: string,
  priority: "polite" | "assertive" = "assertive"
) {
  var el = document.createElement("div");
  var id = "speak-" + Date.now();
  el.setAttribute("id", id);
  el.setAttribute("aria-live", priority || "polite");
  el.classList.add("sr-only");
  document.body.appendChild(el);

  window.setTimeout(function () {
    document.getElementById(id)!.innerHTML = text;
  }, 100);

  window.setTimeout(function () {
    document.body.removeChild(document.getElementById(id)!);
  }, 1000);
}

export function ordinal(n: number): string {
  return n + ([, "st", "nd", "rd"][(n % 100 >> 3) ^ 1 && n % 10] || "th");
}
