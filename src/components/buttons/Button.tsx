import React from "react";

interface ButtonProps {
  text: string;
  onClick: () => void;
  disabled?: boolean; // ✅ 버튼 비활성화 여부 추가
}

const Button: React.FC<ButtonProps> = ({ text, onClick, disabled = false }) => {
  return (
    <button
      onClick={!disabled ? onClick : undefined} // ✅ 비활성화 시 클릭 방지
      disabled={disabled} // ✅ 버튼 비활성화 상태 적용
      className={`flex justify-center items-center px-5 py-2 rounded-xl border-3 border-[#8C8C8C] bg-white
        shadow-[0px_4px_4px_0px_rgba(0,_0,_0,_0.25)] mb-16
        hover:bg-[#f0f0f0] hover:border-[#e5e5e5] hover:shadow-lg transition-all duration-200
        ${disabled ? "opacity-50 cursor-not-allowed bg-gray-200 border-gray-400 shadow-none" : ""}`} // ✅ 비활성화 스타일 추가
    >
      {text}
    </button>
  );
};

export default Button;

// import { ButtonHTMLAttributes, ReactNode } from "react";
//
// interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
//   variant?: "primary" | "secondary" | "outline" | "danger";
//   size?: "sm" | "md" | "lg";
//   children: ReactNode;
//   loading?: boolean;
// }
//
// function Button({
//   variant = "primary",
//   size = "md",
//   children,
//   loading = false,
//   className = "",
//   disabled,
//   ...props
// }: ButtonProps) {
//   const baseClasses =
//     "inline-flex items-center justify-center font-medium rounded-lg transition-colors whitespace-nowrap cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";
//
//   const variantClasses = {
//     primary: "bg-blue-600 hover:bg-blue-700 text-white",
//     secondary: "bg-gray-100 hover:bg-gray-200 text-gray-900",
//     outline: "border border-gray-300 hover:bg-gray-50 text-gray-700",
//     danger: "bg-red-600 hover:bg-red-700 text-white",
//   };
//
//   const sizeClasses = {
//     sm: "px-3 py-1.5 text-sm",
//     md: "px-4 py-2 text-sm",
//     lg: "px-6 py-3 text-base",
//   };
//
//   return (
//     <button
//       className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
//       disabled={disabled || loading}
//       {...props}
//     >
//       {loading && (
//         <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-current border-t-transparent" />
//       )}
//       {children}
//     </button>
//   );
// }
//
// export default Button;
