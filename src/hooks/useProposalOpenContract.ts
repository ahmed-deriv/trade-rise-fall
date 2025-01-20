import { useEffect } from "react";
import { getDerivAPI } from "../services/deriv-api.instance";
import { isLogged } from "../common/utils";
import { tradingPanelStore } from "../stores/TradingPanelStore";
import { OpenContract } from "../types/deriv-api.types";

interface ProposalOpenContractResponse {
  error?: {
    message: string;
    code: string;
  };
  proposal_open_contract?: OpenContract;
}

export const useProposalOpenContract = () => {
  const derivAPI = getDerivAPI();

  useEffect(() => {
    const subscribeToContract = async () => {
      try {
        await derivAPI.subscribeStream(
          {
            proposal_open_contract: 1,
            subscribe: 1,
          },
          (response: ProposalOpenContractResponse) => {
            if (response.error) {
              console.error("Proposal open contract error:", response.error);
            }
            if (response.proposal_open_contract) {
              const contract = response.proposal_open_contract;
              tradingPanelStore.addOpenContract(contract);
            }
          },
          "OPENCONTRACTS"
        );
      } catch (err) {
        console.error("Proposal open contract subscription error:", err);
      }
    };

    if (isLogged()) {
      subscribeToContract();
    }
  }, [derivAPI]);
};
