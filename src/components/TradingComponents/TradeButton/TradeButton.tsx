import { Button, Text } from "@deriv-com/quill-ui";
import {
  TradeTypesUpsAndDownsRiseIcon,
  TradeTypesUpsAndDownsFallIcon,
} from "@deriv/quill-icons";

interface TradeButtonProps {
  type: "rise" | "fall";
  percentage: string;
  onBuy: (type: "rise" | "fall") => void;
}

export const TradeButton = ({ type, percentage, onBuy }: TradeButtonProps) => {
  const Icon =
    type === "rise"
      ? TradeTypesUpsAndDownsRiseIcon
      : TradeTypesUpsAndDownsFallIcon;
  const label = type === "rise" ? "Rise" : "Fall";
  const className = `${type}-button`;

  return (
    <Button
      variant="primary"
      size="lg"
      fullWidth
      className={className}
      onClick={() => onBuy(type)}
    >
      <div className="button-content">
        <div className="left">
          <Icon />
          <Text as="span" size="lg" className="text-bold">
            {label}
          </Text>
        </div>
        <Text as="span" size="lg" className="text-bold">
          {percentage}%
        </Text>
      </div>
    </Button>
  );
};
