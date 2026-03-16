import { useState } from "react";
import { ActiveMatch } from "@/types/type";

export const useScoreModal = (
  onScoreUpdate: (
    roundIndex: number,
    matchIndex: number,
    score1: number,
    score2: number,
  ) => void | Promise<void>,
) => {
  const [selectedMatch, setSelectedMatch] = useState<{
    roundIndex: number;
    matchIndex: number;
    match: ActiveMatch;
  } | null>(null);
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");

  const openModal = (roundIndex: number, matchIndex: number, match: ActiveMatch) => {
    setSelectedMatch({ roundIndex, matchIndex, match });
    setHomeScore(match.score1.toString());
    setAwayScore(match.score2.toString());
  };

  const closeModal = () => {
    setSelectedMatch(null);
    setHomeScore("");
    setAwayScore("");
  };

  const submitScore = () => {
    if (!selectedMatch || homeScore === "" || awayScore === "") return;

    const homeScoreNum = parseInt(homeScore);
    const awayScoreNum = parseInt(awayScore);

    onScoreUpdate(selectedMatch.roundIndex, selectedMatch.matchIndex, homeScoreNum, awayScoreNum);

    closeModal();
  };

  return {
    selectedMatch,
    homeScore,
    awayScore,
    setHomeScore,
    setAwayScore,
    openModal,
    closeModal,
    submitScore,
  };
};
