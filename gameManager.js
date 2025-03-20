const crypto = require("crypto");

class GameManager {
  constructor(game, fairRandomGenerator, readlineSync, chalk) {
    this.game = game;
    this.dice = game.dice;
    this.fairRandomGenerator = fairRandomGenerator;
    this.readlineSync = readlineSync;
    this.chalk = chalk;
    this.exit = false;
  }

  determineFirstMove() {
    this.log("Let's determine who makes the first move.", this.chalk.yellow);
    let userChoosesFirst = null;

    while (userChoosesFirst === null && !this.exit) {
      const { key, computerNumber } = this.generateFirstMoveData();
      this.displayFirstMoveOptions(key, computerNumber);

      const selection = this.getUserSelection(["0", "1", "X", "?"]);

      if (selection === null) {
        return null; 
      }

      if (selection === "?") {
        this.game.displayHelp();
        continue; 
      }

      const userGuess = parseInt(selection, 10);
      this.log(
        `My selection: ${computerNumber} (KEY=${key}).`,
        this.chalk.yellow
      );
      userChoosesFirst = userGuess === computerNumber;
    }
    return userChoosesFirst;
  }

  generateFirstMoveData() {
    const key = crypto.randomBytes(32).toString("hex");
    const computerNumber = this.fairRandomGenerator.secureRandom(1);
    return { key, computerNumber };
  }

  displayFirstMoveOptions(key, computerNumber) {
    const hmac = crypto
      .createHmac("sha3-256", key)
      .update(computerNumber.toString())
      .digest("hex");
    this.log(
      `I selected a random value in the range 0..1 (HMAC=${hmac}).`,
      this.chalk.yellow
    );
    this.log("Try to guess my selection.", this.chalk.yellow);
    this.log("0 - 0");
    this.log("1 - 1");
    this.log("X - exit");
    this.log("? - help");
  }

  getUserSelection(options) {
    while (true) {
      const selection = this.readlineSync.question(
        this.chalk.cyan("Your selection: ")
      );

      if (selection.toUpperCase() === "X") {
        this.exitGame();
        return null;
      }

      if (options.includes(selection.toUpperCase())) {
        return selection;
      }

      this.log("Invalid selection. Please try again.", this.chalk.red);
    }
  }

  exitGame() {
    this.log("Exiting the game.", this.chalk.red);
    this.exit = true;
    //process.exit(0);
  }

  processDiceChoice(chooser, availableDice) {
    const dice = chooser.call(this, availableDice);
    if (!dice) {
      return { dice: null, availableDice };
    }
    const newAvailableDice = availableDice.filter((d) => d !== dice);
    return { dice, availableDice: newAvailableDice };
  }

  getUserDiceChoice(availableDice) {
    this.log("Choose your dice:", this.chalk.yellow);
    let selectedDice = null;
    while (selectedDice === null && !this.exit) {
      availableDice.forEach((dice, index) => {
        this.log(`${index} - ${dice.faceValues.join(",")}`);
      });
      this.log("X - exit");
      this.log("? - help");

      const selection = this.getUserSelection([
        "X",
        "?",
        ...availableDice.map((_, i) => String(i)),
      ]);

      if (selection === null) {
        return null; 
      }

      if (selection === "?") {
        this.game.displayHelp();
        continue;
      }

      const index = parseInt(selection, 10);
      if (!isNaN(index) && index >= 0 && index < availableDice.length) {
        selectedDice = availableDice[index];
      } else {
        this.log("Invalid selection. Please try again.", this.chalk.red);
      }
    }

    return selectedDice;
  }

  computerMove(availableDice) {
    const randomIndex = Math.floor(Math.random() * availableDice.length);
    return availableDice[randomIndex];
  }

  playRound(userDice, computerDice) {
    if (!userDice || !computerDice) {
      return;
    }
    this.log("It's time for my throw.", this.chalk.yellow);

    const computerThrowIndex = this.fairRandomGenerator.generate(
      computerDice.faceValues.length - 1
    );
    const computerThrow = computerDice.faceValues[computerThrowIndex];
    this.log(`My throw is ${computerThrow}.`, this.chalk.yellow);

    this.log("It's time for your throw.", this.chalk.yellow);

    const userThrowIndex = this.fairRandomGenerator.generate(
      userDice.faceValues.length - 1
    );
    const userThrow = userDice.faceValues[userThrowIndex];
    this.log(`Your throw is ${userThrow}.`, this.chalk.yellow);

    if (userThrow > computerThrow) {
      this.log(`You win (${userThrow} > ${computerThrow})!`, this.chalk.green);
    } else if (computerThrow > userThrow) {
      this.log(`I win (${computerThrow} > ${userThrow})!`, this.chalk.red);
    } else {
      this.log("It's a tie!", this.chalk.yellow);
    }
  }

  userChoosesDiceFirst(availableDice) {
    const userDice = this.getUserDiceChoice(availableDice);
    if (!userDice) {
      return { userDice: null, computerDice: null };
    }
    this.log(
      `You choose the [${userDice.faceValues.join(",")}] dice.`,
      this.chalk.yellow
    );

    const { dice: computerDice, availableDice: availableDiceAfterComputer } =
      this.processDiceChoice(
        this.computerMove,
        availableDice.filter((d) => d !== userDice)
      );
    this.log(
      `I choose the [${computerDice.faceValues.join(",")}] dice.`,
      this.chalk.yellow
    );
    return { userDice, computerDice };
  }

  computerChoosesDiceFirst(availableDice) {
    const { dice: computerDice, availableDice: availableDiceAfterComputer } =
      this.processDiceChoice(this.computerMove, availableDice);
    if (!computerDice) {
      return { userDice: null, computerDice: null };
    }
    this.log(
      `I make the first move and choose the [${computerDice.faceValues.join(
        ","
      )}] dice.`,
      this.chalk.yellow
    );

    const userDice = this.getUserDiceChoice(availableDiceAfterComputer);
    if (!userDice) {
      return { userDice: null, computerDice: null };
    }
    this.log(
      `You choose the [${userDice.faceValues.join(",")}] dice.`,
      this.chalk.yellow
    );
    return { userDice, computerDice };
  }

  startGame() {
    try {
      const userChoosesFirst = this.determineFirstMove();
      if (userChoosesFirst === null || this.exit) {
        return;
      }

      let availableDice = [...this.dice];
      let userDice, computerDice;

      if (userChoosesFirst) {
        const { userDice: uDice, computerDice: cDice } =
          this.userChoosesDiceFirst(availableDice);
        userDice = uDice;
        computerDice = cDice;
      } else {
        const { userDice: uDice, computerDice: cDice } =
          this.computerChoosesDiceFirst(availableDice);
        userDice = uDice;
        computerDice = cDice;
      }
      if (!userDice || !computerDice) {
        return;
      }

      this.playRound(userDice, computerDice);
    } catch (error) {
      console.error(this.chalk.red.bold("An error occurred:"), error.message);
    }
  }

  log(message, color) {
    console.log(color ? color(message) : message);
  }
}

module.exports = GameManager;
