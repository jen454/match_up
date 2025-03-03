"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation"; // useRouter 훅
import { Button } from "@/components"; // 버튼 컴포넌트

const HomePage = () => {
  const [participants, setParticipants] = useState<number | undefined>(undefined);
  const router = useRouter(); // 라우터 훅

  const onChangeInput = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setParticipants(Number(e.target.value)); // 문자열을 숫자로 변환하여 상태 업데이트
  };

  const onClickButton = (): void => {
    if (participants !== undefined) {
      // 참가자 수가 입력되었을 때만 페이지 이동
      router.push(`/participants/${participants}`);
    }
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-12">
        <div className="text-3xl font-bold text-center">게임 참가자 수</div>
        <input
          type="number"
          value={participants || ""} // 값이 undefined일 경우 빈 문자열로 표시
          onChange={onChangeInput}
          className="border p-2 rounded-md"
          placeholder="참가자 수 입력"
        />
        <Button text={"다음"} onClick={onClickButton} />
      </div>
    </div>
  );
};

export default HomePage;
