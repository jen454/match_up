import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { resolveGameId } from "@/utils/resolveGameId";

export async function GET(request: Request, { params }: { params: Promise<{ gameId: string }> }) {
  try {
    const { gameId } = await params;

    if (!gameId) {
      return NextResponse.json({ success: false, error: "게임 ID가 없습니다." }, { status: 400 });
    }

    const internalId = await resolveGameId(gameId);
    if (internalId === null) {
      return NextResponse.json({ success: false, error: "존재하지 않는 게임" }, { status: 404 });
    }

    const supabase = await createClient();
    const { data, error } = await supabase.from("participants").select("*").eq("game_id", internalId);

    if (error) throw error;

    return NextResponse.json({ success: true, players: data }, { status: 200 });
  } catch (error) {
    // DB 원본 에러 메시지는 로그에만 남기고 응답에는 노출하지 않는다
    console.error("참가자 조회 오류:", error);
    return NextResponse.json({ success: false, error: "서버 오류" }, { status: 500 });
  }
}
