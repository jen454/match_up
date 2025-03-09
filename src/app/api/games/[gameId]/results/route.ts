import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// 경기 결과 타입 정의
interface MatchResult {
  player1_id: number;
  player2_id: number;
  score1: number;
  score2: number;
}

// 참가자 데이터 타입 정의
interface PlayerStats {
  id: number;
  game_id: number; // 반드시 포함
  name: string; // 추가
  wins: number;
  draws: number;
  losses: number;
  goals_for: number;
  goals_against: number;
  goal_difference: number;
  points: number;
  handicap: number;
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  try {
    const { gameId } = await params;
    const { results }: { results: MatchResult[] } = await req.json();
    const supabase = await createClient();
    const parsedGameId = Number(gameId); // gameId를 숫자로 변환

    if (!parsedGameId || !results || results.length === 0) {
      return NextResponse.json({ error: "잘못된 요청" }, { status: 400 });
    }

    // 참가자 데이터 가져오기
    const { data: playersData, error: fetchError } = await supabase
      .from("participants")
      .select("*")
      .eq("game_id", parsedGameId);

    if (fetchError) throw fetchError;

    // 참가자 데이터를 Map으로 저장
    const playersMap = new Map<number, PlayerStats>();
    playersData.forEach((player: PlayerStats) => {
      playersMap.set(player.id, { ...player });
    });

    // 결과 반영
    results.forEach(({ player1_id, player2_id, score1, score2 }) => {
      const player1 = playersMap.get(player1_id);
      const player2 = playersMap.get(player2_id);

      if (!player1 || !player2) return;

      // 골 기록
      player1.goals_for += score1;
      player1.goals_against += score2;
      player2.goals_for += score2;
      player2.goals_against += score1;

      // 골득실 계산
      player1.goal_difference = player1.goals_for - player1.goals_against;
      player2.goal_difference = player2.goals_for - player2.goals_against;

      if (score1 > score2) {
        // player1 승리
        player1.wins += 1;
        player1.points += 3;
        player2.losses += 1;
      } else if (score1 < score2) {
        // player2 승리
        player2.wins += 1;
        player2.points += 3;
        player1.losses += 1;
      } else {
        // 무승부
        player1.draws += 1;
        player2.draws += 1;
        player1.points += 1;
        player2.points += 1;
      }
    });

    // 핸디캡 반영
    playersMap.forEach((player) => {
      player.points += player.handicap;
    });

    // 업데이트할 데이터 생성
    const updatedPlayers = Array.from(playersMap.values());

    // Supabase에 업데이트 (onConflict: ["id"] 추가)
    const { error: updateError } = await supabase
      .from("participants")
      .upsert(updatedPlayers, { onConflict: "id" });

    if (updateError) throw updateError;

    return NextResponse.json({ message: "게임 결과 반영 완료", updatedPlayers }, { status: 200 });
  } catch (error) {
    console.error("게임 결과 저장 에러:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
