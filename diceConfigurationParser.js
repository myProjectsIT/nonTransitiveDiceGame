const Dice = require("./dice");

class DiceConfigurationParser {
  constructor(chalk) {
    this.chalk = chalk;
  }

  parse(args) {
    this.validateArgs(args);
    return args.map((arg) => this.createDice(arg));
  }

  validateArgs(args) {
    if (!args || args.length < 3) {
      this.throwError(
        "Invalid number of dice. Please specify at least three dice."
      );
    }
  }

  createDice(arg) {
    const faceValues = this.parseFaceValues(arg);
    return new Dice(faceValues);
  }

  parseFaceValues(arg) {
    const faceValues = arg.split(",").map(Number);
    this.validateFaceValues(faceValues);
    return faceValues;
  }

  validateFaceValues(faceValues) {
    if (faceValues.length !== 6 || faceValues.some(isNaN)) {
      this.throwError(
        "Invalid dice format. Each dice must have 6 comma-separated integers."
      );
    }

    if (faceValues.some((val) => !Number.isInteger(val))) {
      this.throwError(
        "Invalid face values of dice. Dice face values must be integers."
      );
    }
  }

  throwError(message) {
    throw new Error(this.chalk.red.bold(message));
  }
}

module.exports = DiceConfigurationParser;