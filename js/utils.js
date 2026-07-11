export const calculateWinRate = (playerWins, totalWins) => {
    return totalWins ? Math.round((playerWins / totalWins) * 100) : 0;
};
