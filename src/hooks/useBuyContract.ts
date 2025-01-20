import { getDerivAPI } from "../services/deriv-api.instance";
import { tradingPanelStore } from "../stores/TradingPanelStore";

export const useBuyContract = (
  price: string,
  handleProposal: () => Promise<void>
) => {
  const buyContract = async (type: "rise" | "fall") => {
    const derivAPI = getDerivAPI();
    const contractId =
      type === "rise"
        ? tradingPanelStore.riseContractId
        : tradingPanelStore.fallContractId;

    if (!contractId) {
      console.error("No contract ID available for", type);
      return;
    }

    try {
      const response = await derivAPI.sendRequest({
        buy: contractId,
        price: parseFloat(price),
      });

      if (response.error) {
        console.error("Buy contract error:", response.error);
        return;
      }

      tradingPanelStore.setRiseContractId(null);
      tradingPanelStore.setFallContractId(null);
      await handleProposal();
      return response;
    } catch (error) {
      console.error("Error buying contract:", error);
    }
  };

  return { buyContract };
};
