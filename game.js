class Game {
  constructor(dice, helpTableGenerator, chalk) {
    this.dice = dice;
    this.helpTableGenerator = helpTableGenerator;
    this.chalk = chalk;
  }

  displayHelp() {
    this.log("\n   Game Rules:", this.chalk.green);
    this.log(
      "This is a dice game where you compete against the computer.",
      this.chalk.green
    );
    this.log(
      "First, it's determined who selects the dice first.",
      this.chalk.green
    );
    this.log(
      "Then, each player chooses a dice from the available options.",
      this.chalk.green
    );
    this.log(
      "Finally, each player's dice are used and the higher roll wins the round!\n",
      this.chalk.green
    );
    console.log(this.helpTableGenerator.generateTable(), "\n");
  }

  log(message, color = (str) => str) {
    console.log(color(message));
  }
}

module.exports = Game;