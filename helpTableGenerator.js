const AsciiTable = require("ascii-table");
const ProbabilityCalculator = require("./probabilityCalculator");

class HelpTableGenerator {
  constructor(dice, chalk) {
    this.dice = dice;
    this.probabilityCalculator = new ProbabilityCalculator();
    this.chalk = chalk;
  }

  generateTable() {
    const table = new AsciiTable("Probability of the win for the user:");
    table.setHeading(...this.generateHeaders());
    this.generateRows().forEach((row) => table.addRow(...row));
    return table.toString();
  }

  generateHeaders() {
    const headers = ["User dice v"];
    this.dice.forEach((dice) => headers.push(dice.faceValues.join(",")));
    return headers;
  }

  generateRows() {
    return this.dice.map((dice1) => {
      const row = [dice1.faceValues.join(",")];
      this.dice.forEach((dice2) =>
        row.push(this.formatProbability(dice1, dice2))
      );
      return row;
    });
  }

  formatProbability(dice1, dice2) {
    const probability = this.probabilityCalculator.calculateWinProbability(
      dice1,
      dice2
    );
    const formattedProbability = probability.toFixed(4);
    return dice1 === dice2
      ? `- (${formattedProbability})`
      : formattedProbability;
  }
}

module.exports = HelpTableGenerator;
