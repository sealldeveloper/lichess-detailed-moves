# Lichess - Detailed Moves

> This is an updated version of Thomas Sihapnya [lichess-good-moves](https://github.com/tomsihap/lichess-good-moves/)

> Displays brilliant, excellent and great moves into Lichess analysis, the same way Chess.com does.
> The accuracy may be debated and just like chess.com does, there is no consensus on what makes a move being a good move. This is purely informational and to have a more optimistic analysis of you game!
> 
> Please feel free to contribute !


## Openings

The script can show you when you and your opponent followed book moves, and which opening have been followed. This is an addition to the already existing opening book in Lichess if you want to see the openings in the PGN.

![Openings](images/opening.PNG?raw=true "Openings")

## Good moves, excellent moves, brillancies

You now can see when you have made a good, excellent move or a brillancy !

![Good moves](images/goodmove.PNG?raw=true "Good moves")

They are defined as such :
- **Great**: !?
- **Excellent**: !
- **Brilliant**: !!

You can also see a summary of your good moves in the analysis table :

![Table](images/table.PNG?raw=true "Table")


### How are great/excellent/brilliant moves defined?

Since you cannot really tell when a move is good (see [this StackOverflow thread](https://chess.stackexchange.com/questions/24378/why-does-lichess-only-tell-me-my-inaccuracies-mistakes-and-blunders-and)), the decision have been made that moves between the following thresholds:

```
From white prospective:
- Great :+0.6 centipawn
- Excellent: +1.0 centipawn
- Brilliant: +2.0 centipawn
```

Additionally, checkmates in X moves have been defined as `+100` centipawn.

These values are from my own trial and errors, please feel free to contribute to make these values more accurate.


# Installation

First, you will need to install a browser extension to run external scripts.

- [Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo)
- [Firefox](https://addons.mozilla.org/fr/firefox/addon/greasemonkey/)

When installed, you install from:
- [GreasyFork](https://greasyfork.org/en/scripts/464486-lichess-detailed-moves)
- [OpenUserJS](https://openuserjs.org/scripts/sealldeveloper/Lichess_-_Detailed_Moves)
- [GitHub](https://github.com/sealldeveloper/lichess-detailed-moves/raw/main/lichess-detailed-moves.user.js)

# Usage

- Make sure the script is activated and go to the analysis page of any game.
- If the computer analysis hasn't been run, you have to start it and refresh the page to active the script.
- You may be prompted something scary like this:

![Warning Tampermonkey](images/warning-tampermonkey.PNG?raw=true "Warning Tampermonkey")

- Don't worry, you can accept it, this is because the script needs to call an [external file](https://github.com/sealldeveloper/lichess-detailed-moves/raw/main/data/eco.json) which is a list of ECO codes, variations and names to show the opening name in Lichess.

