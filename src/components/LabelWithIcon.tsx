import Image from "next/image";

interface LabelWithIconProps {
  icon: string;
  label: string;
  alt?: string;
  iconSize?: number;
}

const LabelWithIcon = ({ icon, label, alt = "Icon", iconSize = 18 }: LabelWithIconProps) => {
  return (
    <label className="flex items-center gap-2 text-sm font-medium text-gray-700 mb-1">
      <Image
        src={icon}
        alt={alt}
        width={iconSize}
        height={iconSize}
        style={{ width: `${iconSize}px`, height: `${iconSize}px` }}
      />
      {label}
    </label>
  );
};

export default LabelWithIcon;
