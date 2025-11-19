import Image from "next/image";

interface IconButtonProps {
  icon: string;
  alt: string;
  onClick: () => void;
  disabled?: boolean;
  size?: number;
}

const IconButton = ({ icon, alt, onClick, disabled = false, size = 16 }: IconButtonProps) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="p-2 border border-gray-300 hover:bg-gray-50 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      <Image
        src={icon}
        alt={alt}
        width={size}
        height={size}
        style={{ width: `${size}px`, height: `${size}px` }}
      />
    </button>
  );
};

export default IconButton;
