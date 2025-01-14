import { Button, Text } from "@deriv-com/quill-ui";
import {
  LabelPairedBackwardSmBoldIcon,
  TradeTypesUpsAndDownsRiseIcon,
  TradeTypesUpsAndDownsFallIcon,
} from "@deriv/quill-icons";
import { observer } from "mobx-react-lite";
import { tradingPanelStore } from "../../../stores/TradingPanelStore";
import { chartStore } from "../../../stores/ChartStore";
import { useRiseFallTrading } from "../../../hooks/useRiseFallTrading";
import { DurationSection } from "../DurationSection/DurationSection";
import { StakeSection } from "../StakeSection/StakeSection";
import { TradeButton } from "../TradeButton/TradeButton";
import { PayoutInfo } from "../PayoutInfo/PayoutInfo";
import "./TradingPanel.scss";

export const TradingPanel = observer(() => {
  const {
    duration,
    price,
    allowEquals,
    selectedDurationTab,
    selectedStakeTab,
    setDuration,
    setPrice,
    setAllowEquals,
    setSelectedDurationTab,
    setSelectedStakeTab,
    durationError,
    priceError,
    is_rise_fall_valid,
  } = tradingPanelStore;

  const { proposal, clearProposal, isLoading } = useRiseFallTrading(
    chartStore.symbol,
    price,
    duration,
    selectedStakeTab,
    durationError,
    priceError,
    is_rise_fall_valid
  );

  const getAmount = (type: "rise" | "fall"): string => {
    const currentProposal = proposal[type];
    if (!currentProposal) return "0.00";

    if (selectedStakeTab === "stake") {
      return currentProposal.payout?.toFixed(2) ?? "0.00";
    }
    return currentProposal.ask_price?.toFixed(2) ?? "0.00";
  };

  const getPercentage = (type: "rise" | "fall"): string => {
    const currentProposal = proposal[type];
    if (!currentProposal) return "0.00";

    const { payout, ask_price } = currentProposal;
    if (!payout || !ask_price) return "0.00";

    return (((payout - ask_price) / ask_price) * 100).toFixed(2);
  };

  const label = selectedStakeTab === "stake" ? "Payout" : "Stake";

  return (
    <div className="trading-panel">
      <div className="panel-header">
        <div className="header-left">
          <Button variant="secondary" size="sm" onClick={() => {}}>
            <LabelPairedBackwardSmBoldIcon />
          </Button>
          <Text as="span" size="sm" className="learn-link">
            Learn about this trade type
          </Text>
        </div>
        <div className="trade-type">
          <div className="trade-icons">
            <div className="rise-icon">
              <TradeTypesUpsAndDownsRiseIcon />
            </div>
            <div className="fall-icon">
              <TradeTypesUpsAndDownsFallIcon />
            </div>
          </div>
          <Text as="span" size="sm" className="text-bold">
            Rise/Fall
          </Text>
        </div>
      </div>

      {!is_rise_fall_valid ? (
        <div className="error-message">
          <Text as="p" size="sm" color="error">
            This contract type is not valid for Rise/Fall
          </Text>
        </div>
      ) : (
        <>
          <div className="tabs-container">
            <DurationSection
              duration={duration}
              selectedDurationTab={selectedDurationTab}
              durationError={durationError ?? ""}
              setDuration={setDuration}
              setSelectedDurationTab={setSelectedDurationTab}
            />
            <StakeSection
              price={price}
              selectedStakeTab={selectedStakeTab}
              priceError={priceError ?? ""}
              setPrice={setPrice}
              setSelectedStakeTab={setSelectedStakeTab}
            />
          </div>

          {/* Equals section temporarily hidden
          <div className="equals-section">
            <Checkbox
              name="allow-equals"
              checked={allowEquals}
              onChange={(e) =>
                setAllowEquals((e.target as HTMLInputElement).checked)
              }
              label="Allow equals"
            />
            <Tooltip tooltipContent="Allow equals tooltip">
              <LabelPairedCircleInfoSmBoldIcon className="text-less-prominent" />
            </Tooltip>
          </div>
          */}

          <div className="payout-section">
            <TradeButton type="rise" percentage={getPercentage("rise")} />
            <PayoutInfo
              type="rise"
              label={label}
              amount={getAmount("rise")}
              isLoading={isLoading.rise}
            />

            <TradeButton type="fall" percentage={getPercentage("fall")} />
            <PayoutInfo
              type="fall"
              label={label}
              amount={getAmount("fall")}
              isLoading={isLoading.fall}
            />
          </div>
        </>
      )}
    </div>
  );
});
