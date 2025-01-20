import { Text } from "@deriv-com/quill-ui";
import { observer } from "mobx-react-lite";
import { tradingPanelStore } from "../../../stores/TradingPanelStore";

export const ContractItem = observer(() => {
  const { openContracts } = tradingPanelStore;

  if (openContracts.length === 0) {
    return (
      <div className="contract-item">
        <Text as="p" size="sm">
          No open contracts
        </Text>
      </div>
    );
  }

  return openContracts.map((contract) => (
    <div key={contract.contract_id} className="contract-item">
      <Text as="p" size="sm" className="text-bold">
        {contract.display_name} - {contract.contract_type}
      </Text>
      <div className="contract-details">
        <div className="detail-row">
          <Text as="span" size="sm">
            Entry Price:
          </Text>
          <Text as="span" size="sm">
            {contract.entry_spot_display_value}
          </Text>
        </div>
        <div className="detail-row">
          <Text as="span" size="sm">
            Current Price:
          </Text>
          <Text as="span" size="sm">
            {contract.current_spot_display_value}
          </Text>
        </div>
        <div className="detail-row">
          <Text as="span" size="sm">
            Buy Price:
          </Text>
          <Text as="span" size="sm">
            {contract.buy_price} {contract.currency}
          </Text>
        </div>
        <div className="detail-row">
          <Text as="span" size="sm">
            Payout:
          </Text>
          <Text as="span" size="sm">
            {contract.payout} {contract.currency}
          </Text>
        </div>
        <div className="detail-row">
          <Text as="span" size="sm">
            Profit/Loss:
          </Text>
          <Text
            as="span"
            size="sm"
            className={contract.profit >= 0 ? "profit" : "loss"}
          >
            {contract.profit.toFixed(2)} {contract.currency} (
            {contract.profit_percentage.toFixed(2)}%)
          </Text>
        </div>
      </div>
    </div>
  ));
});
