import React from "react";

interface Player {
  id: number;
  game_id: number;
  name: string;
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
}

export const TournamentTable = ({ players }: { players: Player[] }) => {
  // 승점 -> 득점 순으로 정렬
  const sortedPlayers = [...players].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.goals_for - a.goals_for;
  });

  return (
    <div className="bg-white border rounded-lg shadow p-4">
      <h2 className="text-xl font-bold text-center mb-4">순위표</h2>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            <th className="border p-2">순위</th>
            <th className="border p-2">이름</th>
            <th className="border p-2">승</th>
            <th className="border p-2">무</th>
            <th className="border p-2">패</th>
            <th className="border p-2">득점</th>
            <th className="border p-2">실점</th>
            <th className="border p-2">득실차</th>
            <th className="border p-2">승점</th>
          </tr>
        </thead>
        <tbody>
          {sortedPlayers.map((player, index) => (
            <tr key={player.id} className="text-center">
              <td className="border p-2">{index + 1}</td>
              <td className="border p-2">{player.name}</td>
              <td className="border p-2">{player.wins}</td>
              <td className="border p-2">{player.draws}</td>
              <td className="border p-2">{player.losses}</td>
              <td className="border p-2">{player.goals_for}</td>
              <td className="border p-2">{player.goals_against}</td>
              <td className="border p-2">{player.goal_difference}</td>
              <td className="border p-2">{player.points}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
