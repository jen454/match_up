import { createBrowserClient } from "@supabase/ssr";

// client component에서 supabase에 접근할 때 사용
export function createClient() {
    return createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
}