import React from "react";
import { Player } from "@/types/type";

const TournamentTable = ({ players }: { players: Player[] }) => {
  // 승점 -> 득점 순으로 정렬
  const sortedPlayers = [...players].sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    return b.goals_for - a.goals_for;
  });

  const tableHeaders = [
    { key: "rank", label: "순위" },
    { key: "name", label: "이름" },
    { key: "wins", label: "승" },
    { key: "draws", label: "무" },
    { key: "losses", label: "패" },
    { key: "goals_for", label: "득점" },
    { key: "goals_against", label: "실점" },
    { key: "goal_difference", label: "득실차" },
    { key: "points", label: "승점" },
  ];

  const getCellValue = (player: Player, index: number, key: string) => {
    if (key === "rank") return index + 1;
    if (key === "name") return player.name;
    return player[key as keyof Player];
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
      <h2 className="text-xl font-bold text-center mb-4">순위표</h2>
      <table className="w-full border-collapse border">
        <thead>
          <tr className="bg-gray-100">
            {tableHeaders.map((header) => (
              <th key={header.key} className="border p-2">
                {header.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sortedPlayers.map((player, index) => (
            <tr key={player.id} className="text-center">
              {tableHeaders.map((header) => (
                <td key={header.key} className="border p-2">
                  {getCellValue(player, index, header.key)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TournamentTable;
