import { makeAutoObservable } from "mobx";
import { OpenContract } from "../types/deriv-api.types";

export class TradingPanelStore {
  duration = 15;
  price = "10";
  allowEquals = false;
  selectedDurationTab: "duration" | "endtime" = "duration";
  selectedStakeTab: "stake" | "payout" = "stake";
  durationError: string | null = null;
  priceError: string | null = null;
  is_rise_fall_valid: boolean = true;
  riseContractId: string | null = null;
  fallContractId: string | null = null;
  openContracts: OpenContract[] = [];
  isOpenContractsModalVisible = false;

  constructor() {
    makeAutoObservable(this);
  }

  setDuration = (value: string) => {
    if (!value) {
      this.duration = 0;
      this.durationError = "Duration is required";
      return;
    }

    const numValue = parseInt(value);
    if (isNaN(numValue)) {
      this.durationError = "Please enter a valid number";
      return;
    }

    if (numValue < 15) {
      this.durationError = "Minimum duration is 15 minutes";
      return;
    }

    if (numValue > 1440) {
      this.durationError = "Maximum duration is 1440 minutes";
      return;
    }

    this.duration = numValue;
    this.durationError = null;
  };

  setPrice = (value: string) => {
    if (!value) {
      this.price = "";
      this.priceError = "Price is required";
      return;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      this.priceError = "Please enter a valid number";
      return;
    }

    if (numValue <= 0) {
      this.priceError = "Price must be greater than 0";
      return;
    }

    this.price = numValue.toString();
    this.priceError = null;
  };

  setAllowEquals = (value: boolean) => {
    this.allowEquals = value;
  };

  setSelectedDurationTab = (value: "duration" | "endtime") => {
    this.selectedDurationTab = value;
  };

  setSelectedStakeTab = (value: "stake" | "payout") => {
    this.selectedStakeTab = value;
  };

  setIsRiseFallValid = (value: boolean) => {
    this.is_rise_fall_valid = value;
  };

  setRiseContractId = (id: string | null) => {
    this.riseContractId = id;
  };

  setFallContractId = (id: string | null) => {
    this.fallContractId = id;
  };

  addOpenContract = (contract: OpenContract) => {
    const existingIndex = this.openContracts.findIndex(
      (c) => c.contract_id === contract.contract_id
    );

    if (existingIndex !== -1) {
      this.openContracts[existingIndex] = contract;
    } else {
      contract.contract_id && this.openContracts.push(contract);
    }
  };

  setOpenContractsModalVisible = (visible: boolean) => {
    this.isOpenContractsModalVisible = visible;
  };
}

export const tradingPanelStore = new TradingPanelStore();
