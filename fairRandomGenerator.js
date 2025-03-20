const crypto = require("crypto");

class FairRandomGenerator {
    constructor(game, readlineSync, chalk) {
        this.game = game;
        this.readlineSync = readlineSync;
        this.chalk = chalk;
        this.previousKey = null;
    }

    generate(max) {
        const key = this.generateKey();
        this.logKey(key);

        if (this.isKeyReused(key)) {
            console.error(this.chalk.red("ERROR: The key is overused!"));
        }
        this.previousKey = key;

        const computerNumber = this.secureRandom(max);
        const hmac = this.calculateHmac(key, computerNumber);
        this.displayGameInfo(max, hmac);

        const userNumber = this.getUserNumber(max);
        const result = (computerNumber + userNumber) % (max + 1);
        this.displayResult(computerNumber, key, userNumber, result, max);

        return result;
    }

    generateKey() {
        return crypto.randomBytes(32).toString('hex');
    }

    logKey(key) {
        // console.log(this.chalk.magenta(`Generated key: ${key}`));
    }

    isKeyReused(key) {
        return this.previousKey === key;
    }

    calculateHmac(key, computerNumber) {
        return crypto.createHmac('sha3-256', key).update(computerNumber.toString()).digest('hex');
    }

    displayGameInfo(max, hmac) {
        console.log(this.chalk.yellow(`I selected a random value in the range 0..${max} (HMAC=${hmac}).`));
        console.log(`Add your number modulo ${max + 1}.`);
        this.displayNumberOptions(max);
        console.log("X - exit");
        console.log("? - help");
    }

    displayNumberOptions(max) {
        for (let i = 0; i <= max; i++) {
            console.log(`${i} - ${i}`);
        }
    }

    getUserNumber(max) {
        let userNumber;
        while (true) {
            const input = this.readlineSync.question(this.chalk.cyan(`Your selection: `));
            if (input.toUpperCase() === '?') {
                this.game.displayHelp();
                continue;
            }
            if (input.toUpperCase() === 'X') {
                this.exitGame();
                return null;
            }
            userNumber = parseInt(input, 10);
            if (this.isValidInput(userNumber, max)) {
                break;
            }
            console.log(this.chalk.red(`Invalid input. Please enter a number between 0 and ${max}.`));
        }
        return userNumber;
    }

    isValidInput(userNumber, max) {
        return !isNaN(userNumber) && userNumber >= 0 && userNumber <= max;
    }

    displayResult(computerNumber, key, userNumber, result, max) {
        console.log(this.chalk.yellow(`My number is ${computerNumber} (KEY=${key}).`));
        console.log(this.chalk.yellow(`The result is ${computerNumber} + ${userNumber} = ${result} (mod ${max + 1}).`));
    }

    exitGame() {
        console.log(this.chalk.red("Exiting the game."));
        process.exit(0);
    }

    secureRandom(max) {
        const randomNumber = crypto.randomInt(0, max + 1);
        // console.log(chalk.blue(`Random number generated: ${randomNumber}`)); 
        return randomNumber;
    }
}


let fairRandomGenerator;

function fairRandom(min, max) {
    return fairRandomGenerator.generate(max);
}

module.exports = FairRandomGenerator;
