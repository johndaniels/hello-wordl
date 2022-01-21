import { Clue } from "./clue";
import { Row, RowState } from "./Row";
import { maxGuesses } from "./util";

export function About() {
  return (
    <div className="App-about">
      <p>Practice your Lang Belta vocabulary and be rewarded with trendy squares to share. </p>
      <p>
        This is the inevitable Wordle variation for Belters! 
        You can play today’s traditional 5-letter game, or click Random Game to play as many times as you like. 
        If you share a random game’s result, the link you share will point to the same game so you can challenge other learners and chat about your answers. 
        It’s surprisingly difficult and fun to think about Belter vocab in a new way. 
      </p>
      <p>
        This game was based on <a href="https://github.com/lynn/hello-wordl">Lynn’s “hello wordl" project</a>. 
        Check out <a href="https://foldr.moe/">her website</a> and <a href="https://ko-fi.com/chordbug">buy her an <i>owkwa kaka</i> to say thanks!</a>
      </p>
      <h3>HOW TO PLAY</h3>
      <p>
      You get 6 tries to guess <i>da wowt da buza</i> — the target word. Here’s an example: 
      </p>
      <Row
        rowState={RowState.LockedIn}
        wordLength={5}
        cluedLetters={[
          { clue: Clue.Absent, letter: "s" },
          { clue: Clue.Absent, letter: "h" },
          { clue: Clue.Absent, letter: "e" },
          { clue: Clue.Absent, letter: "r" },
          { clue: Clue.Absent, letter: "u" },
        ]}
      />
      <p>
      Not actually a great “start.” None of these letters are in the target word. They’ll be greyed out on your keyboard so you can keep track. 
      </p>
      <Row
        rowState={RowState.LockedIn}
        wordLength={5}
        cluedLetters={[
          { clue: Clue.Elsewhere, letter: "y" },
          { clue: Clue.Absent, letter: "i" },
          { clue: Clue.Absent, letter: "t" },
          { clue: Clue.Absent, letter: "i" },
          { clue: Clue.Absent, letter: "m" },
        ]}
      />
      <p>
        Now we know that there’s a <b className="yellow-bg">Y</b>, but it’s not in that place. More letters are greyed out, and we can see that our only available vowels are A and O.
      </p>
      <Row
        rowState={RowState.LockedIn}
        wordLength={5}
        cluedLetters={[
          { clue: Clue.Absent, letter: "w" },
          { clue: Clue.Correct, letter: "a" },
          { clue: Clue.Correct, letter: "n" },
          { clue: Clue.Elsewhere, letter: "g" },
          { clue: Clue.Absent, letter: "o" },
        ]}
      />
      <p>
        So, we’re looking for a _ <b className="green-bg">A</b><b className="green-bg">N</b> _ _ word that also has a <b className="yellow-bg">G</b> and a <b className="yellow-bg">Y</b> in it.  
      </p>
      <Row
        rowState={RowState.LockedIn}
        wordLength={5}
        cluedLetters={[
          { clue: Clue.Correct, letter: "g" },
          { clue: Clue.Correct, letter: "a" },
          { clue: Clue.Correct, letter: "n" },
          { clue: Clue.Correct, letter: "y" },
          { clue: Clue.Correct, letter: "a" },
        ]}
      />
      <p>Of course! We win! </p>
    </div>
  );
}
