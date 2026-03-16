import { createClient } from "@/utils/supabase/server";
/**
 * public_id(URL 노출용 string)로 games 테이블의 내부 id(number)를 조회합니다.
 * 존재하지 않으면 null을 반환합니다.
 */
export async function resolveGameId(publicId: string): Promise<number | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("games")
    .select("id")
    .eq("public_id", publicId)
    .single();
  if (error || !data) return null;
  return data.id;
}
