import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";

export async function POST(req: Request) {
  try {
    const supabase = await createClient();
    const { players } = await req.json();

    if (!players || players.length === 0) {
      console.error("참가자 정보가 없습니다.");
      return NextResponse.json({ error: "참가자 정보가 없습니다." }, { status: 400 });
    }

    const { data: game, error: gameError } = await supabase
      .from("games")
      .insert([{ created_at: new Date() }])
      .select("id")
      .single();

    if (gameError) {
      console.error("게임 생성 오류:", gameError);
      throw gameError;
    }

    const gameId = game.id;

    // 참가자 정보 저장
    const participants = players.map((player: { name: string; handicap: number }) => ({
      game_id: gameId,
      name: player.name,
      handicap: player.handicap,
      wins: 0,
      draws: 0,
      losses: 0,
      goals_for: 0,
      goals_against: 0,
      goal_difference: 0,
      points: 0,
    }));

    const { error: participantError } = await supabase.from("participants").insert(participants);
    if (participantError) {
      console.error("참가자 저장 오류:", participantError);
      throw participantError;
    }

    return NextResponse.json({ message: "게임 및 참가자 생성 완료", gameId }, { status: 201 });
  } catch (error) {
    console.error("서버 오류:", error);
    return NextResponse.json({ error: "서버 오류 발생" }, { status: 500 });
  }
}
