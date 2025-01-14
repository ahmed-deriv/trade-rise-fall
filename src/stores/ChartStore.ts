import { makeAutoObservable } from "mobx";
import { tradingPanelStore } from "./TradingPanelStore";

export class ChartStore {
  symbol: string = "";
  chartStatus: boolean = false;
  showChart: boolean = false;

  constructor() {
    makeAutoObservable(this);
  }

  setSymbol = (symbol: string) => {
    tradingPanelStore.setIsRiseFallValid(false);
    this.symbol = symbol;
    tradingPanelStore.priceError = null;
    tradingPanelStore.durationError = null;
  };

  setChartStatus = (status: boolean) => {
    this.chartStatus = status;
  };

  setShowChart = (show: boolean) => {
    this.showChart = show;
  };
}

export const chartStore = new ChartStore();
