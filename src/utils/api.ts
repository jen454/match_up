// API 요청을 위한 Helper 함수

// 게임 생성 함수
export const createGame = async (players: { name: string; handicap: number }[]) => {
    const response = await fetch("/api/games", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ players }),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "게임 생성 실패");
    }

    return response.json();
};