import { createClient } from "@/utils/supabase/server";
/**
 * public_id(URL 노출용 string)로 games 테이블의 내부 id(number)를 조회합니다.
 * - 존재하지 않으면 null (→ 호출부에서 404)
 * - DB 오류는 throw (→ 호출부 catch에서 500) — "없는 게임"과 "일시적 장애"를 구분하기 위함
 */
export async function resolveGameId(publicId: string): Promise<number | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("games")
    .select("id")
    .eq("public_id", publicId)
    .maybeSingle();
  if (error) throw error;
  return data?.id ?? null;
}
