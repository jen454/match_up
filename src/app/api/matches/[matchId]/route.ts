import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

// PATCH /api/matches/[matchId]
// 개별 매치의 점수를 저장한다 (제출 전 임시 저장 포함)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ matchId: string }> },
) {
  try {
    const { matchId } = await params;
    const parsedMatchId = Number(matchId);

    if (isNaN(parsedMatchId)) {
      return NextResponse.json({ error: "잘못된 매치 ID" }, { status: 400 });
    }

    const { score1, score2 } = await req.json();

    if (score1 === undefined || score2 === undefined || score1 < 0 || score2 < 0) {
      return NextResponse.json({ error: "올바른 점수를 입력하세요." }, { status: 400 });
    }

    const supabase = await createClient();

    const { data, error } = await supabase
      .from("matches")
      .update({ score1, score2 })
      .eq("id", parsedMatchId)
      .select("*")
      .single();

    if (error) throw error;

    return NextResponse.json({ match: data }, { status: 200 });
  } catch (error) {
    console.error("점수 저장 오류:", error);
    return NextResponse.json({ error: "서버 오류" }, { status: 500 });
  }
}
