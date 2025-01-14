import { useEffect } from "react";
import { getDerivAPI } from "../services/deriv-api.instance";
import { tradingPanelStore } from "../stores/TradingPanelStore";

export const useContractsFor = (symbol: string) => {
  const derivAPI = getDerivAPI();

  useEffect(() => {
    const checkContractsAvailability = async () => {
      if (!symbol) return;

      try {
        const contractsResponse = await derivAPI.getContractsForSymbol(symbol);

        const hasRiseFallContracts =
          contractsResponse.contracts_for.available.some(
            (contract) =>
              contract.contract_category === "callput" &&
              contract.barriers === 0 &&
              contract.barrier_category === "euro_atm"
          );

        tradingPanelStore.setIsRiseFallValid(hasRiseFallContracts);
      } catch (error) {
        console.error("Error fetching contracts:", error);
        tradingPanelStore.setIsRiseFallValid(false);
      }
    };

    checkContractsAvailability();
  }, [symbol, derivAPI]);
};
