import { LoadingSpinner } from "@components";

export default function Loading() {
  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center">
      <LoadingSpinner size="lg" text="토너먼트 생성 중" />
    </div>
  );
}
