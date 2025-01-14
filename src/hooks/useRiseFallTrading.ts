import { useContractsFor } from "./useContractsFor";
import { usePriceProposal } from "./usePriceProposal";

export const useRiseFallTrading = (
  symbol: string,
  price: string,
  duration: number,
  basis: string,
  durationError: string | null,
  priceError: string | null,
  isRiseFallValid: boolean
) => {
  // Use both hooks internally
  useContractsFor(symbol);
  const { proposal, clearProposal, isLoading } = usePriceProposal(
    price,
    duration,
    basis,
    symbol,
    durationError,
    priceError,
    isRiseFallValid
  );

  return {
    proposal,
    clearProposal,
    isLoading,
  };
};
