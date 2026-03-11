import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { resolveGameId } from "@/utils/resolveGameId";

// GET /api/games/[gameId]/matches?lap=N
// lap 파라미터 없으면 전체 Lap 반환
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ gameId: string }> },
) {
  try {
    const { gameId } = await params;
    const lapParam = request.nextUrl.searchParams.get("lap");

    const internalId = await resolveGameId(gameId);
    if (internalId === null) {
      return NextResponse.json({ error: "존재하지 않는 게임" }, { status: 404 });
    }

    const supabase = await createClient();

    let query = supabase
      .from("matches")
      .select("*")
      .eq("game_id", internalId)
      .order("lap_number", { ascending: true })
      .order("round_number", { ascending: true });

    if (lapParam !== null) {
      const lapNumber = Number(lapParam);
      if (isNaN(lapNumber)) {
        return NextResponse.json({ error: "잘못된 lap 번호" }, { status: 400 });
      }
      query = query.eq("lap_number", lapNumber);
    }

    const { data, error } = await query;

    if (error) throw error;

    return NextResponse.json({ matches: data ?? [] }, { status: 200 });
  } catch (error) {
    console.error("매치 조회 오류:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
