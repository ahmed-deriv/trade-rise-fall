import { useContractsFor } from "./useContractsFor";
import { usePriceProposal } from "./usePriceProposal";
import { useProposalOpenContract } from "./useProposalOpenContract";
import { useBuyContract } from "./useBuyContract";

export const useRiseFallTrading = (
  symbol: string,
  price: string,
  duration: number,
  basis: string,
  durationError: string | null,
  priceError: string | null,
  isRiseFallValid: boolean
) => {
  // Use hooks internally
  useContractsFor(symbol);
  useProposalOpenContract();
  const { proposal, clearProposal, isLoading, handleProposal } =
    usePriceProposal(
      price,
      duration,
      basis,
      symbol,
      durationError,
      priceError,
      isRiseFallValid
    );

  const { buyContract } = useBuyContract(price, handleProposal);

  return {
    proposal,
    clearProposal,
    isLoading,
    buyContract,
  };
};
