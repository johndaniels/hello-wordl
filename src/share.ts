import { Clue, clue, describeClue, violation } from "./clue";
import { encode } from "./base64";
import dayjs from "dayjs";

const START_DATE = dayjs.utc("2022-01-20", "YYYY-MM-DD");

function getUrl(date: string , seed: string | null, length: number): string {
    if (!seed) {
        return window.location.origin;
    }
    return (
      window.location.origin +
      window.location.pathname +
      (seed ? 
        "?seed=" + seed
        : "?date=" + date) +
        "&length=" + length
    );
  }

function getRows(guesses: string[], target: string): string {
    return guesses.map(guess => 
        clue(guess, target).map(cluedLetter => {
            switch(cluedLetter.clue) {
                case Clue.Correct:
                    return "🟩";
                case Clue.Elsewhere:
                    return "🟨";
                case Clue.Absent:
                    return "⬛";
            }
        }).join("")).join("\n");
}

export function computeShareText(guesses: string[], target: string, date: string, seed: string | null, length: number): string {
    const url = getUrl(date, seed, length);
    const rows = getRows(guesses, target);
    if (seed) {
        return `My random ${length}-Letter Game: ${guesses.length}/6

${rows}

${url}
#LangBelta
`
    } else {
        const day = dayjs.utc().diff(START_DATE, "days");
        return `Dzhogem fo Tudiye #${day}: ${guesses.length}/6

${rows}

${url}
#LangBelta`;
    }
}