import { useEffect, useState } from "react";
import { getDerivAPI } from "../services/deriv-api.instance";
import { PriceProposalResponse } from "../types/deriv-api.types";
import useDebounce from "./useDebounce";
import { tradingPanelStore } from "../stores/TradingPanelStore";

interface ProposalState {
  rise?: PriceProposalResponse["proposal"];
  fall?: PriceProposalResponse["proposal"];
}

interface LoadingState {
  rise: boolean;
  fall: boolean;
}

export const usePriceProposal = (
  price: string,
  duration: number,
  basis: string,
  symbol: string,
  durationError: string | null,
  priceError: string | null,
  is_rise_fall_valid: boolean
) => {
  const [proposal, setProposal] = useState<ProposalState>({});
  const [isLoading, setIsLoading] = useState<LoadingState>({
    rise: false,
    fall: false,
  });
  const debouncedPrice = useDebounce(price, 1000);
  const debouncedDuration = useDebounce(duration, 1000);

  const derivAPI = getDerivAPI();

  const clearProposal = () => {
    setProposal({});
  };

  useEffect(() => {
    const handleProposal = async () => {
      setIsLoading({ fall: true, rise: true });

      const data = {
        price: debouncedPrice,
        duration: debouncedDuration,
        basis,
        symbol,
      };

      const numPrice = parseFloat(data.price);
      if (numPrice <= 0) {
        return;
      }

      const subscribeToProposal = async (type: "rise" | "fall") => {
        const config = {
          proposal: 1,
          subscribe: 1,
          amount: numPrice,
          basis: data.basis,
          contract_type: type === "rise" ? "CALL" : "PUT",
          currency: "USD",
          duration: data.duration,
          duration_unit: "m",
          symbol: data.symbol,
        };

        try {
          await derivAPI.subscribeStream(
            config,
            (response: any) => {
              setIsLoading((prev) => ({ ...prev, [type]: false }));
              if (response.error) {
                console.error(`${type} proposal error:`, response.error);
                tradingPanelStore.priceError =
                  response.error.message || "Invalid contract parameters";
              } else if (response.proposal) {
                setProposal((prev) => ({ ...prev, [type]: response.proposal }));
              }
            },
            `PROPOSAL_${type.toUpperCase()}`
          );
        } catch (err: any) {
          console.error(`${type} subscription error:`, err);
          setIsLoading((prev) => ({ ...prev, [type]: false }));

          if (err.code === "ContractBuyValidationError") {
            tradingPanelStore.priceError =
              err.message || "Invalid contract parameters";
          }
        }
      };

      await Promise.all([
        subscribeToProposal("rise"),
        subscribeToProposal("fall"),
      ]);
    };

    setProposal({});
    setIsLoading({ rise: false, fall: false });
    if (
      debouncedPrice &&
      duration &&
      basis &&
      symbol &&
      !durationError &&
      !priceError &&
      is_rise_fall_valid
    ) {
      handleProposal();
    }
  }, [
    debouncedPrice,
    debouncedDuration,
    basis,
    symbol,
    derivAPI,
    is_rise_fall_valid,
  ]);

  return { proposal, clearProposal, isLoading };
};
