import { NextResponse } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { generateRoundRobinMatches } from "@/utils/matchGenerator";
import { Participant, isActiveMatch, isByeEntry } from "@/types/type";

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

    // 참가자 정보 저장 (집계 컬럼 없음 — 실시간 집계는 matches 테이블 기반)
    const participants = players.map((player: { name: string; handicap: number }) => ({
      game_id: gameId,
      name: player.name,
      handicap: player.handicap,
    }));

    const { error: participantError, data: savedParticipants } = await supabase
      .from("participants")
      .insert(participants)
      .select("id, game_id, name, handicap");
    if (participantError) {
      console.error("참가자 저장 오류:", participantError);
      throw participantError;
    }

    // Lap 1 대진표 자동 생성 (matches 테이블에 insert)
    const participantList: Participant[] = savedParticipants ?? [];
    const rounds = generateRoundRobinMatches(participantList);
    const matchRecords = rounds.flatMap((round, roundIdx) =>
      round
        .map((entry) => {
          if (isActiveMatch(entry)) {
            return {
              game_id: gameId,
              lap_number: 1,
              round_number: roundIdx + 1,
              player1_id: entry.player1.id,
              player2_id: entry.player2.id,
              score1: 0,
              score2: 0,
              is_bye: false,
              bye_player_id: null,
              submitted_at: null,
            };
          }
          if (isByeEntry(entry)) {
            return {
              game_id: gameId,
              lap_number: 1,
              round_number: roundIdx + 1,
              player1_id: entry.restPlayer.id,
              player2_id: entry.restPlayer.id,
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

    if (matchRecords.length > 0) {
      const { error: matchError } = await supabase.from("matches").insert(matchRecords);
      if (matchError) {
        console.error("Lap 1 대진 생성 오류:", matchError);
        throw matchError;
      }
    }

    return NextResponse.json({ message: "게임 및 참가자 생성 완료", gameId }, { status: 201 });
  } catch (error) {
    console.error("서버 오류:", error);
    return NextResponse.json({ error: "서버 오류 발생" }, { status: 500 });
  }
}
