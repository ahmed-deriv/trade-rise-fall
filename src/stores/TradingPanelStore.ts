import { makeAutoObservable } from "mobx";

export class TradingPanelStore {
  duration = 15;
  price = "10";
  allowEquals = false;
  selectedDurationTab: "duration" | "endtime" = "duration";
  selectedStakeTab: "stake" | "payout" = "stake";
  durationError: string | null = null;
  priceError: string | null = null;
  is_rise_fall_valid: boolean = true;

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
}

export const tradingPanelStore = new TradingPanelStore();
