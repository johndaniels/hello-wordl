import { Clue, clue, describeClue, violation } from "./clue";
import { encode } from "./base64";


function getPrefix(guesses: string[]): String {
    return `Dzhogem fo Tudiye: ${guesses.length}/6\n\n`;
}

function getUrl(date: string , seed: string | null, length: number): string {
    return (
      window.location.origin +
      window.location.pathname +
      (seed ? 
        "?seed=" + seed
        : "?date=" + date) +
        "&length=" + length
    );
  }

export function computeShareText(guesses: string[], target: string, date: string, seed: string | null, length: number): string {
    const url = getUrl(date, seed, length);
    const rows = guesses.map(guess => 
        clue(guess, target).map(cluedLetter => {
            switch(cluedLetter.clue) {
                case Clue.Correct:
                    return "🟩";
                case Clue.Elsewhere:
                    return "🟨";
                case Clue.Absent:
                    return "⬜";
            }
        }).join(""));
    return getPrefix(guesses) + rows.join("\n") + "\n\n#LangBelta\n" + url;
}