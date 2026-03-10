import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

type RouteParams = { params: Promise<{ gameId: string; lapNumber: string; roundNumber: string }> };

// POST — 라운드 제출 (submitted_at 기록)
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const { gameId, lapNumber, roundNumber } = await params;
    const [gameId_, lapNumber_, roundNumber_] = [
      Number(gameId),
      Number(lapNumber),
      Number(roundNumber),
    ];

    if (isNaN(gameId_) || isNaN(lapNumber_) || isNaN(roundNumber_)) {
      return NextResponse.json({ error: "잘못된 파라미터" }, { status: 400 });
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("matches")
      .update({ submitted_at: new Date().toISOString() })
      .eq("game_id", gameId_)
      .eq("lap_number", lapNumber_)
      .eq("round_number", roundNumber_)
      .eq("is_bye", false); // Bye 엔트리는 제출 대상 아님

    if (error) throw error;

    return NextResponse.json({ submitted: true }, { status: 200 });
  } catch (error) {
    console.error("라운드 제출 오류:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}

// DELETE — 라운드 제출 취소 (submitted_at → null)
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const { gameId, lapNumber, roundNumber } = await params;
    const [gameId_, lapNumber_, roundNumber_] = [
      Number(gameId),
      Number(lapNumber),
      Number(roundNumber),
    ];

    if (isNaN(gameId_) || isNaN(lapNumber_) || isNaN(roundNumber_)) {
      return NextResponse.json({ error: "잘못된 파라미터" }, { status: 400 });
    }

    const supabase = await createClient();

    const { error } = await supabase
      .from("matches")
      .update({ submitted_at: null })
      .eq("game_id", gameId_)
      .eq("lap_number", lapNumber_)
      .eq("round_number", roundNumber_)
      .eq("is_bye", false);

    if (error) throw error;

    return NextResponse.json({ submitted: false }, { status: 200 });
  } catch (error) {
    console.error("라운드 취소 오류:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
