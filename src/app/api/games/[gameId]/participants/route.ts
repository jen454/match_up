import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// gameId를 비동기적으로 처리하기 위해 params에 접근
export async function GET(request: Request, { params }: { params: Promise<{ gameId: string }> }) {
  // params를 비동기적으로 접근하여 gameId 얻기
  const { gameId } = await params;

  if (!gameId) {
    return NextResponse.json({ success: false, error: "게임 ID가 없습니다." }, { status: 400 });
  }

  const supabase = await createClient();
  const parsedGameId = Number(gameId); // gameId를 숫자로 변환

  if (isNaN(parsedGameId)) {
    return NextResponse.json({ success: false, error: "잘못된 게임 ID" }, { status: 400 });
  }

  // Supabase에서 game_id에 해당하는 참가자 데이터 조회
  const { data, error } = await supabase
    .from("participants")
    .select("*")
    .eq("game_id", parsedGameId);

  if (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true, players: data }, { status: 200 });
}
