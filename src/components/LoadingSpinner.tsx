import Image from "next/image";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
}

export default function LoadingSpinner({ size = "md", text = "로딩 중..." }: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-12 h-12",
    md: "w-16 h-16",
    lg: "w-24 h-24",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-xl",
  };

  return (
    <div className="flex flex-col items-center justify-center gap-6">
      <div className={`${sizeClasses[size]} animate-bounce`}>
        <Image
          src="/SoccerBallIcon.svg"
          alt="Loading"
          width={96}
          height={96}
          className="w-full h-full"
        />
      </div>
      <p className={`${textSizeClasses[size]} text-gray-600 font-medium`}>{text}</p>
    </div>
  );
}
