import { useEffect, useState } from "react";
import { getDerivAPI } from "../../../services/deriv-api.instance";
import { SmartChart, ChartTitle } from "@deriv/deriv-charts";
import { isBrowser } from "../../../common/utils";
import "@deriv/deriv-charts/dist/smartcharts.css";
import { ChartSettings } from "../types";
import { observer } from "mobx-react-lite";
import { chartStore } from "../../../stores/ChartStore";
import { ReconnectingLoader } from "../../ReconnectingLoader/ReconnectingLoader";
import "./Chart.scss";

export const Chart = observer(() => {
  const {
    symbol,
    chartStatus,
    showChart,
    setChartStatus,
    setSymbol,
    setShowChart,
  } = chartStore;
  const derivAPI = getDerivAPI();
  const [isConnected, setIsConnected] = useState(derivAPI.isConnected());
  // Initialize chart store
  useEffect(() => {
    setSymbol("1HZ10V");
    setChartStatus(true);
    setShowChart(isBrowser());
  }, []);

  // Handle connection changes
  useEffect(() => {
    const cleanup = derivAPI.onConnectionChange((connected: boolean) => {
      setIsConnected(connected);
      setChartStatus(connected && isBrowser());
    });

    // Initial state
    const initialConnected = derivAPI.isConnected();
    setIsConnected(initialConnected);
    setChartStatus(initialConnected && isBrowser());

    return cleanup;
  }, [derivAPI]);

  const requestAPI = async (request: any): Promise<any> => {
    return derivAPI.sendRequest(request);
  };

  const requestSubscribe = async (
    request: any,
    callback: (data: any) => void
  ): Promise<void> => {
    try {
      derivAPI.subscribeStream(
        request,
        (response: any) => {
          if (response?.error?.code === "MarketIsClosed") {
            return callback([]);
          }
          if (response?.error) {
            throw response.error;
          }
          callback(response);
        },
        "ticks"
      );
    } catch (error: any) {
      if (error?.code === "MarketIsClosed") {
        callback([]);
      }
    }
  };

  const settings: ChartSettings = {
    assetInformation: true,
    countdown: true,
    isHighestLowestMarkerEnabled: true,
    language: "en",
    position: "bottom",
    theme: "light",
  };

  const barriers: any[] = [];
  const is_connection_opened = isConnected;

  return (
    <div className="chart-section">
      <div className="chart-container">
        {!isConnected && <ReconnectingLoader />}
        {showChart && (
          <SmartChart
            id="dbot"
            barriers={barriers}
            chartControlsWidgets={null}
            enabledChartFooter={true}
            chartStatusListener={(v: boolean) => setChartStatus(!v)}
            toolbarWidget={() => <></>}
            chartType={"line"}
            isMobile={false}
            enabledNavigationWidget={true}
            granularity={0}
            requestAPI={requestAPI}
            requestForget={() => {}}
            requestForgetStream={() => {}}
            requestSubscribe={requestSubscribe}
            settings={settings}
            symbol={symbol}
            topWidgets={() => <ChartTitle onChange={setSymbol} />}
            isConnectionOpened={is_connection_opened}
            isLive
          />
        )}
      </div>
    </div>
  );
});
