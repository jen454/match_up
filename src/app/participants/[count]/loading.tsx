import { LoadingSpinner } from "@components";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center">
      <LoadingSpinner size="lg" text="참가자 입력 페이지 불러오는 중" />
    </div>
  );
}
