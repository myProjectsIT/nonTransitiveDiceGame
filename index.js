
const readlineSync = require('readline-sync');
const chalk = require('chalk'); 

const DiceConfigurationParser = require("./diceConfigurationParser");
const FairRandomGenerator = require("./fairRandomGenerator");
const HelpTableGenerator = require("./helpTableGenerator");
const Game = require("./game");
const GameManager = require("./gameManager");

try {
    const diceConfigurationParser = new DiceConfigurationParser(chalk);
    const dice = diceConfigurationParser.parse(process.argv.slice(2));
    const helpTableGenerator = new HelpTableGenerator(dice, chalk);
    const game = new Game(dice, helpTableGenerator, chalk);
    const fairRandomGenerator = new FairRandomGenerator(game, readlineSync, chalk);
    const gameManager = new GameManager(game, fairRandomGenerator, readlineSync, chalk); 
    gameManager.startGame();

} catch (error) {
    console.error(chalk.red.bold("Error:"), error.message);
    console.error(chalk.yellow.bold("Example: node index.js 2,2,4,4,9,9 6,8,1,1,8,6 7,5,3,7,5,3"));
}

