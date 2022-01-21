import { useEffect, useRef, useState } from "react";
import { Row, RowState } from "./Row";
import dictionary from "./dictionary.json";
import { Clue, clue, describeClue, violation } from "./clue";
import { computeShareText } from "./share";
import { Keyboard } from "./Keyboard";
import targetList from "./targets.json";
import { dictionarySet, pick, getSeed, urlDate, speak, urlParam, getNewSeed, urlLength } from "./util";
import { decode } from "./base64";
import dayjs from 'dayjs'
import localizedFormat from 'dayjs/plugin/localizedFormat';
dayjs.extend(localizedFormat);

enum GameState {
  Playing,
  Won,
  Lost,
}

interface GameProps {
  maxGuesses: number;
  hidden: boolean;
  hard: boolean;
}

const targets = targetList.slice();

function randomTarget(wordLength: number, seed: string): string {
  const eligible = targets.filter((word) => word.length === wordLength);
  let candidate: string;
  do {
    candidate = pick(eligible, seed);
  } while (/\*/.test(candidate));
  return candidate;
}

function getDateStringFromUrlParam(dateParam:string) {
  return dayjs(dateParam, "YYYYMMDD").format("LL");
}


function setHistoryState(date: string, seed: string | null, length: number) {
  const queryString = (seed ? "?seed=" + seed : "?date=" + date) + "&length=" + length;
  window.history.replaceState({}, document.title, window.location.pathname + queryString);
}

function Game(props: GameProps) {
  const [gameState, setGameState] = useState(GameState.Playing);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [date, setDate] = useState<string>(urlDate)
  const [seed, setSeed] = useState<string | null>(getSeed())
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [hint, setHint] = useState<string>("");
  const [wordLength, setWordLength] = useState(
    urlLength
  );
  const [target, setTarget] = useState(() => {
    return randomTarget(wordLength, seed || date);
  });
  const tableRef = useRef<HTMLTableElement>(null);
  const startNextGame = () => {
    const newSeed = getNewSeed();
    setSeed(newSeed);
    setHistoryState(date, newSeed, wordLength);
    setTarget(randomTarget(wordLength, newSeed));
    setGuesses([]);
    setCurrentGuess("");
    setHint("");
    setGameState(GameState.Playing);
  };

  const onKey = (key: string) => {
    if (gameState !== GameState.Playing) {
      if (key === "Enter") {
        startNextGame();
      }
      return;
    }
    if (guesses.length === props.maxGuesses) return;
    if (/^[a-z]$/i.test(key)) {
      setCurrentGuess((guess) =>
        (guess + key.toLowerCase()).slice(0, wordLength)
      );
      tableRef.current?.focus();
      setHint("");
    } else if (key === "Backspace") {
      setCurrentGuess((guess) => guess.slice(0, -1));
      setHint("");
    } else if (key === "Enter") {
      if (currentGuess.length !== wordLength) {
        setHint("Too short");
        return;
      }
      if (!dictionary.includes(currentGuess)) {
        setHint("Not a valid word");
        return;
      }
      if (props.hard) {
        for (const g of guesses) {
          const feedback = violation(clue(g, target), currentGuess);
          if (feedback) {
            setHint(feedback);
            return;
          }
        }
      }
      setGuesses((guesses) => guesses.concat([currentGuess]));
      setCurrentGuess((guess) => "");

      const gameOver = (verbed: string) =>
        `You ${verbed}! The answer was ${target.toUpperCase()}. (”Enter” fo wa dzhógem nuva)`;

      if (currentGuess === target) {
        setHint(gameOver("won"));
        setGameState(GameState.Won);
      } else if (guesses.length + 1 === props.maxGuesses) {
        setHint(gameOver("lost"));
        setGameState(GameState.Lost);
      } else {
        setHint("");
        speak(describeClue(clue(currentGuess, target)));
      }
    }
  };

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!e.ctrlKey && !e.metaKey) {
        onKey(e.key);
      }
      if (e.key === "Backspace") {
        e.preventDefault();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [currentGuess, gameState]);

  let letterInfo = new Map<string, Clue>();
  const tableRows = Array(props.maxGuesses)
    .fill(undefined)
    .map((_, i) => {
      const guess = [...guesses, currentGuess][i] ?? "";
      const cluedLetters = clue(guess, target);
      const lockedIn = i < guesses.length;
      if (lockedIn) {
        for (const { clue, letter } of cluedLetters) {
          if (clue === undefined) break;
          const old = letterInfo.get(letter);
          if (old === undefined || clue > old) {
            letterInfo.set(letter, clue);
          }
        }
      }
      return (
        <Row
          key={i}
          wordLength={wordLength}
          rowState={
            lockedIn
              ? RowState.LockedIn
              : i === guesses.length
              ? RowState.Editing
              : RowState.Pending
          }
          cluedLetters={cluedLetters}
        />
      );
    });

  return (
    <div className="Game" style={{ display: props.hidden ? "none" : "block" }}>
      <div className="Game-options">
        
        {seed && <div>
          <label htmlFor="wordLength">Letters:</label>
          <input
            type="range"
            min="4"
            max="8"
            id="wordLength"
            disabled={
              gameState === GameState.Playing &&
              (guesses.length > 0 || currentGuess !== "")
            }
            value={wordLength}
            onChange={(e) => {
              const length = Number(e.target.value);
              setHistoryState(date, seed, length);
              setGameState(GameState.Playing);
              setGuesses([]);
              setCurrentGuess("");
              setTarget(randomTarget(length, seed || date));
              setWordLength(length);
              setHint(`${length} letters`);
            }}
          >
          </input>
        </div>}
      </div>
      <table
        className="Game-rows"
        tabIndex={0}
        aria-label="Table of guesses"
        ref={tableRef}
      >
        <tbody>{tableRows}</tbody>
      </table>
      <button
          style={{ flex: "0 0 auto" }}
          disabled={gameState !== GameState.Playing || guesses.length === 0}
          onClick={() => {
            setHint(
              `The answer was ${target.toUpperCase()}. (Enter to play again)`
            );
            setGameState(GameState.Lost);
            (document.activeElement as HTMLElement)?.blur();
          }}
        >
          Give up
        </button>
      <p
        role="alert"
        style={{ userSelect: /http:/.test(hint) ? "text" : "none" }}
      >
        {hint || `\u00a0`}
      </p>
      <Keyboard letterInfo={letterInfo} onKey={onKey} />
      {gameState !== GameState.Playing && (
        <p>
          <button
            onClick={() => {
              const shareText = computeShareText(guesses, target, date, seed, wordLength);
              if (!navigator.clipboard) {
                setHint(shareText);
              } else {
                navigator.clipboard
                  .writeText(shareText)
                  .then(() => {
                    setHint("Results copied to clipboard!");
                  })
                  .catch(() => {
                    setHint(shareText);
                  });
              }
            }}
          >
            Share your results
          </button>
        </p>
      )}
      {seed ? <div className="Game-seed-info">
          Random Game with seed {seed}, length {wordLength}
        </div> : 
        <div className="Game-seed-info">
          Game for {getDateStringFromUrlParam(date)}, length {wordLength}
        </div> 
        }
        
    </div>
  );
}

export default Game;
