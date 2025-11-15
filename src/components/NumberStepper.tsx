import { IconButton } from "@/components/buttons";

interface NumberStepperProps {
  value: number;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  showSign?: boolean;
}

const NumberStepper = ({
  value,
  min = -Infinity,
  max = Infinity,
  onChange,
  showSign = false,
}: NumberStepperProps) => {
  const handleDecrement = () => {
    if (value > min) {
      onChange(value - 1);
    }
  };

  const handleIncrement = () => {
    if (value < max) {
      onChange(value + 1);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <IconButton
        icon="/MinusIcon.svg"
        alt="Minus"
        onClick={handleDecrement}
        disabled={value <= min}
      />
      <div className="w-16 text-center font-medium">
        {showSign && value > 0 ? "+" : ""}
        {value}
      </div>
      <IconButton
        icon="/PlusIcon.svg"
        alt="Plus"
        onClick={handleIncrement}
        disabled={value >= max}
      />
    </div>
  );
};

export default NumberStepper;
