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

// 특정 게임 참가자 불러오기 함수
export const getGameParticipants = async (gameId: number) => {
    const response = await fetch(`/api/games/${gameId}/participants`, {
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "게임 참가자 데이터를 불러오지 못했습니다.");
    }

    return response.json();
};