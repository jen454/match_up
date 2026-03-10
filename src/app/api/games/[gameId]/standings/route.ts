import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { computeStandings } from "@/utils/standings";
import { Participant, DbMatch } from "@/types/type";

// GET /api/games/[gameId]/standings
// 모든 Lap의 matches를 집계하여 통합 순위 반환
export async function GET(_req: NextRequest, { params }: { params: Promise<{ gameId: string }> }) {
  try {
    const { gameId } = await params;
    const parsedGameId = Number(gameId);

    if (isNaN(parsedGameId)) {
      return NextResponse.json({ error: "잘못된 게임 ID" }, { status: 400 });
    }

    const supabase = await createClient();

    // 참가자 + 전체 매치 병렬 조회
    const [participantsResult, matchesResult] = await Promise.all([
      supabase
        .from("participants")
        .select("id, game_id, name, handicap")
        .eq("game_id", parsedGameId),
      supabase.from("matches").select("*").eq("game_id", parsedGameId),
    ]);

    if (participantsResult.error) throw participantsResult.error;
    if (matchesResult.error) throw matchesResult.error;

    const standings = computeStandings(
      (matchesResult.data ?? []) as DbMatch[],
      (participantsResult.data ?? []) as Participant[],
    );

    return NextResponse.json({ standings }, { status: 200 });
  } catch (error) {
    console.error("순위 조회 오류:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
