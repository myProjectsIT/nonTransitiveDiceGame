class ProbabilityCalculator {
  calculateWinProbability(dice1, dice2) {
    const wins = dice1.faceValues.reduce(
      (count, face1) =>
        count + dice2.faceValues.filter((face2) => face1 > face2).length,
      0
    );
    return wins / (dice1.faceValues.length * dice2.faceValues.length);
  }
}

module.exports = ProbabilityCalculator;
