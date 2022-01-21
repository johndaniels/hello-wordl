import "./App.css";
import { maxGuesses, getRandomSeed, isToday} from "./util";
import Game from "./Game";
import { useEffect, useState } from "react";
import { About } from "./About";

function useSetting<T>(
  key: string,
  initial: T
): [T, (value: T | ((t: T) => T)) => void] {
  const [current, setCurrent] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initial;
    } catch (e) {
      return initial;
    }
  });
  const setSetting = (value: T | ((t: T) => T)) => {
    try {
      const v = value instanceof Function ? value(current) : value;
      setCurrent(v);
      window.localStorage.setItem(key, JSON.stringify(v));
    } catch (e) {}
  };
  return [current, setSetting];
}

function App() {
  const [page, setPage] = useState<"game" | "about" | "settings">("game");
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const [dark, setDark] = useSetting<boolean>("dark", prefersDark);
  const [hard, setHard] = useSetting<boolean>("hard", false);

  useEffect(() => {
    document.body.className = dark ? "dark" : "";
    setTimeout(() => {
      document.body.style.transition = "0.3s background-color ease-out";
    }, 1);
  }, [dark]);

  return (
    <div className="App-container">
      <h1><a href="/">Wowtle</a></h1>
      {page != "about" && <h2>Wowtel? Wówtewu? Whatever, it's Lang Belta Wordle!</h2>}
      <div className="top-right">
        {page !== "game" ? (
          <a
            href="#"
            onClick={() => setPage("game")}
            title="Close"
            aria-label="Close"
          >
            Close
          </a>
        ) : (
          <>
            <a
              href="#"
              onClick={() => setPage("about")}
              title="About"
              aria-label="About"
            >
              About
            </a>
          </>
        )}
      </div>
      <div
        style={{
          position: "absolute",
          left: 15,
          top: 15,
          visibility: page === "game" ? "visible" : "hidden",
        }}
      >
        <a
          href={isToday
            ? "?seed=" + getRandomSeed()
            : "?"}
        >
          {isToday ? "Random Game" : "Fo Tudiye"}
        </a>
      </div>
      {page === "about" && <About />}
      {page === "settings" && (
        <div className="Settings">
          <div className="Settings-setting">
            <input
              id="dark-setting"
              type="checkbox"
              checked={dark}
              onChange={() => setDark((x: boolean) => !x)}
            />
            <label htmlFor="dark-setting">Dark theme</label>
          </div>
          <div className="Settings-setting">
            <input
              id="hard-setting"
              type="checkbox"
              checked={hard}
              onChange={() => setHard((x: boolean) => !x)}
            />
            <label htmlFor="hard-setting">Hard mode (must use all clues)</label>
          </div>
        </div>
      )}
      <Game maxGuesses={maxGuesses} hidden={page !== "game"} hard={hard} />
      <footer>
        <div>Explore Belter words using the <a href="https://quickref.langbelta.org">Quick Reference</a>. </div>
        <div>Made with ♡ by <a href="https://twitter.com/ItReachesOut">a Lang Belta learner</a>, for the study and exploration of Lang Belta.</div>
    </footer>
    </div>
  );
}

export default App;
