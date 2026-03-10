import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { generateRoundRobinMatches } from "@/utils/matchGenerator";
import { Participant, isActiveMatch, isByeEntry } from "@/types/type";

// POST /api/games/[gameId]/laps
// 새 Lap의 대진표를 생성하여 matches 테이블에 일괄 insert
export async function POST(req: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  try {
    const { gameId } = await params;
    const parsedGameId = Number(gameId);

    if (isNaN(parsedGameId)) {
      return NextResponse.json({ error: "잘못된 게임 ID" }, { status: 400 });
    }

    const { lap_number } = await req.json();
    if (!lap_number || lap_number < 1) {
      return NextResponse.json({ error: "lap_number는 1 이상이어야 합니다." }, { status: 400 });
    }

    const supabase = await createClient();

    // 중복 Lap 방지: 이미 동일 lap_number가 있으면 에러
    const { count } = await supabase
      .from("matches")
      .select("id", { count: "exact", head: true })
      .eq("game_id", parsedGameId)
      .eq("lap_number", lap_number);

    if (count && count > 0) {
      return NextResponse.json({ error: `Lap ${lap_number}은 이미 존재합니다.` }, { status: 409 });
    }

    // 참가자 조회
    const { data: participantsData, error: participantsError } = await supabase
      .from("participants")
      .select("id, game_id, name, handicap")
      .eq("game_id", parsedGameId);

    if (participantsError) throw participantsError;
    if (!participantsData || participantsData.length < 2) {
      return NextResponse.json({ error: "참가자가 2명 이상이어야 합니다." }, { status: 400 });
    }

    const participants: Participant[] = participantsData;

    // 라운드 로빈 대진 생성
    const rounds = generateRoundRobinMatches(participants);

    // matches 테이블에 insert할 레코드 생성
    const matchRecords = rounds.flatMap((round, roundIdx) =>
      round
        .map((entry) => {
          if (isActiveMatch(entry)) {
            return {
              game_id: parsedGameId,
              lap_number,
              round_number: roundIdx + 1, // 1-based
              player1_id: entry.player1.id,
              player2_id: entry.player2.id,
              score1: 0,
              score2: 0,
              is_bye: false,
              bye_player_id: null,
              submitted_at: null,
            };
          }
          // ByeEntry
          if (isByeEntry(entry)) {
            return {
              game_id: parsedGameId,
              lap_number,
              round_number: roundIdx + 1,
              player1_id: entry.restPlayer.id, // bye 선수를 player1에 임시 저장
              player2_id: entry.restPlayer.id, // player2도 동일 (is_bye로 구분)
              score1: 0,
              score2: 0,
              is_bye: true,
              bye_player_id: entry.restPlayer.id,
              submitted_at: null,
            };
          }
          return null;
        })
        .filter(Boolean),
    );

    const { data: insertedMatches, error: insertError } = await supabase
      .from("matches")
      .insert(matchRecords)
      .select("*");

    if (insertError) throw insertError;

    return NextResponse.json({ lap_number, matches: insertedMatches }, { status: 201 });
  } catch (error) {
    console.error("Lap 생성 오류:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
