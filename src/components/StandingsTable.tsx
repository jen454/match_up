import React from "react";
import { Standing } from "@/types/type";

const StandingsTable = ({
  standings,
  currentLap,
}: {
  standings: Standing[];
  currentLap: number;
}) => {
  const tableHeaders = [
    { key: "rank", label: "순위" },
    { key: "name", label: "이름" },
    { key: "played", label: "경기" },
    { key: "wins", label: "승" },
    { key: "draws", label: "무" },
    { key: "losses", label: "패" },
    { key: "goals_for", label: "득점" },
    { key: "goals_against", label: "실점" },
    { key: "goal_difference", label: "득실" },
    { key: "points", label: "승점" },
  ];

  const lastIndex = standings.length - 1;

  const getRankBadge = (index: number) => {
    if (index === 0) return "🥇";
    if (index === lastIndex && standings.length > 1) return "💀";
    return null;
  };

  const getRowClass = (index: number) => {
    if (index === 0) return "text-center bg-yellow-50 font-semibold";
    if (index === lastIndex && standings.length > 1) return "text-center bg-red-50";
    return "text-center";
  };

  const getCellValue = (standing: Standing, index: number, key: string) => {
    if (key === "rank") {
      const badge = getRankBadge(index);
      return badge ? <span title={`${index + 1}위`}>{badge}</span> : index + 1;
    }
    if (key === "name") {
      return (
        <span className="whitespace-nowrap" style={{ minWidth: "4em", display: "inline-block" }}>
          {standing.name}
        </span>
      );
    }
    return standing[key as keyof Standing];
  };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-4">
      <h2 className="text-xl font-bold text-center mb-4">{currentLap}회차 순위표</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border text-sm">
          <thead>
            <tr className="bg-gray-100">
              {tableHeaders.map((header) => (
                <th key={header.key} className="border p-2 whitespace-nowrap">
                  {header.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {standings.map((standing, index) => (
              <tr key={standing.participant_id} className={getRowClass(index)}>
                {tableHeaders.map((header) => (
                  <td key={header.key} className="border p-2">
                    {getCellValue(standing, index, header.key)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default StandingsTable;
