"use client";

import React from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components";

const ParticipantsPage = () => {
  const params = useParams();
  const id = params.id;

  if (!id) {
    return <div>Loading...</div>; // id가 없으면 로딩 메시지 표시
  }

  const onClickButton = (): void => {
    alert("대진표 생성하기 버튼 클릭");
  };

  return (
    <div className="h-screen flex flex-col items-center justify-center">
      <div className="flex flex-col items-center gap-12">
        <div className="text-3xl font-bold text-center">게임 참가자 정보 입력</div>
        <div>유저 카드</div>
        <Button text={"대진표 생성하기"} onClick={onClickButton} />
      </div>
    </div>
  );
};

export default ParticipantsPage;
