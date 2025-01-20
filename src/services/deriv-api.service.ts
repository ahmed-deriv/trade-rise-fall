/**
 * Service class for interacting with the Deriv API via WebSocket connection.
 * Handles connection management, subscription handling, and API requests for trading operations.
 *
 * Features:
 * - Automatic reconnection on connection loss
 * - Subscription management with automatic resubscription after reconnect
 * - Connection state monitoring
 * - Trading operations (get symbols, contracts, price proposals, buy contracts)
 */

import DerivAPIBasic from "@deriv/deriv-api/dist/DerivAPIBasic";
import {
  DerivAPIConfig,
  ActiveSymbolsResponse,
  ContractForSymbolResponse,
  PriceProposalRequest,
  PriceProposalResponse,
  BuyContractRequest,
  BuyContractResponse,
} from "../types/deriv-api.types";

export class DerivAPIService {
  /** The Deriv API instance for making API calls */
  private api!: DerivAPIBasic;
  /** WebSocket connection instance */
  private connection!: WebSocket;
  /** Map of active subscriptions with their unsubscribe functions */
  private readonly activeSubscriptions: Map<
    string,
    { unsubscribe: () => void }
  >;
  /** Configuration for the Deriv API service */
  private config: DerivAPIConfig;
  /** Timer for reconnection attempts */
  private reconnectTimer: NodeJS.Timeout | null = null;
  /** Handlers for connection state changes */
  private connectionChangeHandlers: ((isConnected: boolean) => void)[] = [];

  /**
   * Creates a new instance of DerivAPIService.
   * Automatically establishes a WebSocket connection using the provided configuration.
   * @param config - Configuration object containing endpoint and app_id
   */
  constructor(config: DerivAPIConfig) {
    this.config = config;
    this.activeSubscriptions = new Map();
    this.connect();
  }

  /**
   * Establishes a WebSocket connection to the Deriv API.
   * Sets up event listeners for connection management.
   * @private
   */
  private connect() {
    const endpoint =
      this.config.endpoint ?? "wss://ws.derivws.com/websockets/v3";
    this.connection = new WebSocket(
      endpoint + `?app_id=${this.config.app_id}&l=EN&brand=deriv`
    );

    this.api = new DerivAPIBasic({
      connection: this.connection,
    });

    this.connection.addEventListener("close", () => {
      console.log("Connection lost. Attempting to reconnect...");
      this.notifyConnectionChange(false);
      this.reconnect();
    });

    this.connection.addEventListener("error", () => {
      console.log("Connection error. Will attempt to reconnect...");
      this.notifyConnectionChange(false);
      this.reconnect();
    });

    this.connection.addEventListener("open", () => {
      console.log("Connection established");
      this.notifyConnectionChange(true);
    });
  }

  /**
   * Handles reconnection logic when the connection is lost.
   * Attempts to reconnect after a 1-second delay and resubscribes to active subscriptions.
   * @private
   */
  private reconnect() {
    // Clear any existing reconnection timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    // Attempt to reconnect after 1 second
    this.reconnectTimer = setTimeout(() => {
      console.log("Reconnecting...");
      this.connect();
      // Resubscribe to active subscriptions
      this.resubscribeAll();
    }, 1000);
  }

  /**
   * Resubscribes to all active subscriptions after a reconnection.
   * Called automatically after successful reconnection.
   * @private
   */
  private async resubscribeAll() {
    console.log("this is happening");
    // Store current subscriptions
    const currentSubscriptions = Array.from(this.activeSubscriptions.entries());

    // Clear current subscriptions as we'll resubscribe
    this.activeSubscriptions.clear();

    // Resubscribe to each subscription
    for (const [key, subscription] of currentSubscriptions) {
      const [prefix, symbol] = key.split("_");
      if (symbol) {
        try {
          await this.subscribeStream(
            { ticks_history: symbol },
            () => {}, // You might want to store and reuse the original callbacks
            prefix
          );
        } catch (error) {
          console.error(`Failed to resubscribe to ${symbol}:`, error);
        }
      }
    }
  }

  /**
   * Subscribes to a data stream from the Deriv API.
   * Automatically handles unsubscription of existing subscriptions with the same prefix.
   * @param request - The subscription request object
   * @param callback - Callback function to handle incoming data
   * @param activeSubscribePrefix - Prefix for identifying the subscription
   * @throws Will throw an error if the subscription fails
   */
  public async subscribeStream(
    request: any,
    callback: (data: any) => void,
    activeSubscribePrefix: string
  ): Promise<void> {
    try {
      // Unsubscribe from any existing tick subscriptions first
      this.unsubscribeByPrefix(activeSubscribePrefix + "_");

      const requestStream = await this.api.subscribe(request);

      const subscription = requestStream.subscribe(
        (response) => {
          try {
            const subscriptionResponse = response as Record<string, any>;
            callback(subscriptionResponse);
          } catch (error) {
            callback({ error });
          }
        },
        (error: any) => {
          callback(error);
        }
      );

      this.activeSubscriptions.set(
        `${activeSubscribePrefix}_${request.ticks_history}`,
        {
          unsubscribe: () => subscription.unsubscribe(),
        }
      );
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves a list of active trading symbols.
   * @returns Promise resolving to active symbols response
   * @throws Will throw an error if the request fails
   */
  public async getActiveSymbols(): Promise<ActiveSymbolsResponse> {
    try {
      return await this.api.send({
        active_symbols: "brief",
        product_type: "basic",
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Sends a generic request to the Deriv API.
   * @param request - The request object to send
   * @returns Promise resolving to the API response
   * @throws Will throw an error if the request fails
   */
  public async sendRequest(request: any): Promise<any> {
    try {
      return await this.api.send(request);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Retrieves available contracts for a specific symbol.
   * @param symbol - The trading symbol to get contracts for
   * @returns Promise resolving to contracts for symbol response
   * @throws Will throw an error if the request fails
   */
  public async getContractsForSymbol(
    symbol: string
  ): Promise<ContractForSymbolResponse> {
    try {
      return await this.api.send({
        contracts_for: symbol,
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * Gets a price proposal for a specific contract.
   * @param request - The price proposal request parameters
   * @returns Promise resolving to price proposal response
   * @throws Will throw an error if the request fails
   */
  public async getPriceProposal(
    request: PriceProposalRequest
  ): Promise<PriceProposalResponse> {
    try {
      return await this.api.send(request);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Purchases a contract based on the provided parameters.
   * @param request - The contract purchase request parameters
   * @returns Promise resolving to buy contract response
   * @throws Will throw an error if the purchase fails
   */
  public async buyContract(
    request: BuyContractRequest
  ): Promise<BuyContractResponse> {
    try {
      return await this.api.send(request);
    } catch (error) {
      throw error;
    }
  }

  /**
   * Unsubscribes from all active data streams.
   * Clears all stored subscriptions.
   */
  public unsubscribeAll(): void {
    this.activeSubscriptions.forEach((subscription) => {
      subscription.unsubscribe();
    });
    this.activeSubscriptions.clear();
  }

  /**
   * Disconnects from the Deriv API.
   * Cleans up subscriptions and closes the WebSocket connection.
   */
  public disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.unsubscribeAll();
    this.connection.close();
  }

  /**
   * Unsubscribes from all subscriptions matching a specific prefix.
   * @param prefix - The prefix to match subscriptions against
   * @private
   */
  public unsubscribeByPrefix(prefix: string): void {
    for (const [key, subscription] of this.activeSubscriptions) {
      if (key.startsWith(prefix)) {
        subscription.unsubscribe();
        this.activeSubscriptions.delete(key);
      }
    }
  }

  /**
   * Checks if the WebSocket connection is currently open.
   * @returns True if connected, false otherwise
   */
  public isConnected(): boolean {
    return this.connection.readyState === WebSocket.OPEN;
  }

  /**
   * Registers a handler for connection state changes.
   * @param handler - Function to be called when connection state changes
   * @returns Function to remove the handler
   */
  public onConnectionChange(
    handler: (isConnected: boolean) => void
  ): () => void {
    this.connectionChangeHandlers.push(handler);
    // Return cleanup function
    return () => {
      this.connectionChangeHandlers = this.connectionChangeHandlers.filter(
        (h) => h !== handler
      );
    };
  }

  /**
   * Notifies all registered handlers of a connection state change.
   * @param isConnected - Current connection state
   * @private
   */
  private notifyConnectionChange(isConnected: boolean): void {
    this.connectionChangeHandlers.forEach((handler) => handler(isConnected));
  }
}
