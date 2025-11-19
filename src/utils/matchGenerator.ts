import { Player, Match } from "@/types/type";

export const generateRoundRobinMatches = (players: Player[]): Match[][] => {
  const totalPlayers = players.length;
  const isOdd = totalPlayers % 2 !== 0;
  const totalRounds = isOdd ? totalPlayers : totalPlayers - 1;

  const schedule: Match[][] = [];
  const rotatedPlayers = [...players];

  if (isOdd) {
    // 홀수일 경우
    for (let round = 0; round < totalRounds; round++) {
      const roundMatches: Match[] = [];
      const restPlayer = rotatedPlayers[0]; // 첫 번째 플레이어는 휴식
      const playingPlayers = rotatedPlayers.slice(1); // 나머지 선수들로 매칭 진행

      for (let i = 0; i < playingPlayers.length / 2; i++) {
        const player1 = playingPlayers[i];
        const player2 = playingPlayers[playingPlayers.length - 1 - i];

        roundMatches.push({
          player1: { id: player1.id, name: player1.name, handicap: player1.handicap },
          player2: { id: player2.id, name: player2.name, handicap: player2.handicap },
          restPlayer: null,
          score1: 0,
          score2: 0,
        });
      }

      // 휴식 선수 추가
      roundMatches.push({
        player1: null,
        player2: null,
        restPlayer: { id: restPlayer.id, name: restPlayer.name, handicap: restPlayer.handicap },
        score1: 0,
        score2: 0,
      });

      schedule.push(roundMatches);

      // 플레이어 순환 (맨 앞을 맨 뒤로 이동)
      rotatedPlayers.push(rotatedPlayers.splice(0, 1)[0]);
    }
  } else {
    // 짝수일 경우
    const fixedPlayer = rotatedPlayers[0]; // 첫 번째 플레이어는 고정
    const rotatingPlayers = rotatedPlayers.slice(1); // 나머지 선수들은 회전

    for (let round = 0; round < totalRounds; round++) {
      const roundMatches: Match[] = [];

      roundMatches.push({
        player1: { id: fixedPlayer.id, name: fixedPlayer.name, handicap: fixedPlayer.handicap },
        player2: {
          id: rotatingPlayers[0].id,
          name: rotatingPlayers[0].name,
          handicap: rotatingPlayers[0].handicap,
        },
        restPlayer: null,
        score1: 0,
        score2: 0,
      });

      for (let i = 1; i < rotatingPlayers.length / 2; i++) {
        const player1 = rotatingPlayers[i];
        const player2 = rotatingPlayers[rotatingPlayers.length - i];

        roundMatches.push({
          player1: { id: player1.id, name: player1.name, handicap: player1.handicap },
          player2: { id: player2.id, name: player2.name, handicap: player2.handicap },
          restPlayer: null,
          score1: 0,
          score2: 0,
        });
      }

      schedule.push(roundMatches);

      // 순환 (맨 마지막 선수를 앞으로 이동)
      rotatingPlayers.unshift(rotatingPlayers.pop()!);
    }
  }

  return schedule;
};
