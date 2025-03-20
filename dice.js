class Dice {
  constructor(faceValues, randomGenerator) {
    this.faceValues = faceValues;
    this.randomGenerator = randomGenerator;
  }

  roll() {
    const randomIndex = this.randomGenerator.generate(
      this.faceValues.length - 1
    );
    return this.faceValues[randomIndex];
  }
}

module.exports = Dice;