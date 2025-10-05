import { ApiTable } from "@/components/api-table";
import { Example } from "@/components/example";

export default function ExamplesPage() {
    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-4xl font-bold">Examples</h1>
                <p className="text-xl text-muted-foreground mt-4">
                    Working examples and code patterns for common Tezos dApp functionality.
                </p>
            </div>

            <section>
                <h2 className="text-3xl font-semibold mb-4">Wallet Connection Flow</h2>
                <p className="mb-4">
                    Complete example of implementing wallet connection with proper error handling and state management.
                </p>

                <Example title="Complete Wallet Integration">
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                        <code>{`"use client";

import { useState, useEffect } from "react";
import { DAppClient, BeaconEvent } from "@airgap/beacon-sdk";
import { TezosToolkit } from "@taquito/taquito";

const dAppClient = new DAppClient({ name: "My Tezos DApp" });
const tezos = new TezosToolkit("https://ghostnet.ecadinfra.com/");

export function useWallet() {
  const [connected, setConnected] = useState(false);
  const [address, setAddress] = useState("");
  const [balance, setBalance] = useState("0");

  useEffect(() => {
    // Check for existing connection
    dAppClient.getActiveAccount().then(account => {
      if (account) {
        setAddress(account.address);
        fetchBalance(account.address);
        setConnected(true);
      }
    });

    // Listen for account changes
    dAppClient.subscribeToEvent(BeaconEvent.ACTIVE_ACCOUNT_SET, account => {
      if (account) {
        setAddress(account.address);
        fetchBalance(account.address);
        setConnected(true);
      }
    });
  }, []);

  const fetchBalance = async (addr: string) => {
    try {
      const bal = await tezos.tz.getBalance(addr);
      setBalance((bal.toNumber() / 1000000).toFixed(2));
    } catch (error) {
      console.error("Failed to fetch balance:", error);
    }
  };

  const connect = async () => {
    try {
      const permissions = await dAppClient.requestPermissions();
      setAddress(permissions.address);
      await fetchBalance(permissions.address);
      setConnected(true);
    } catch (error) {
      console.error("Connection failed:", error);
    }
  };

  const disconnect = async () => {
    await dAppClient.clearActiveAccount();
    setConnected(false);
    setAddress("");
    setBalance("0");
  };

  return { connected, address, balance, connect, disconnect };
}`}</code>
                    </pre>
                </Example>
            </section>

            <section>
                <h2 className="text-3xl font-semibold mb-4">Sending Transactions</h2>
                <p className="mb-4">Example of sending XTZ transactions with proper validation and error handling.</p>

                <Example title="Transaction Handler">
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                        <code>{`import { TezosToolkit } from "@taquito/taquito";
import { BeaconWallet } from "@taquito/beacon-wallet";

export async function sendTransaction(
  recipient: string, 
  amount: number,
  tezos: TezosToolkit
) {
  try {
    // Validate recipient address
    if (!recipient.startsWith('tz1') && !recipient.startsWith('tz2') && !recipient.startsWith('tz3')) {
      throw new Error('Invalid recipient address');
    }

    // Convert XTZ to mutez
    const amountMutez = Math.floor(amount * 1000000);
    
    // Estimate gas and fees
    const estimate = await tezos.estimate.transfer({
      to: recipient,
      amount: amountMutez,
      mutez: true
    });

    console.log('Estimated gas:', estimate.gasLimit);
    console.log('Estimated fee:', estimate.fee);

    // Send the transaction
    const operation = await tezos.wallet.transfer({
      to: recipient,
      amount: amountMutez,
      mutez: true
    }).send();

    console.log('Operation hash:', operation.opHash);

    // Wait for confirmation
    const confirmation = await operation.confirmation();
    console.log('Transaction confirmed:', confirmation);

    return {
      success: true,
      opHash: operation.opHash,
      confirmation
    };

  } catch (error) {
    console.error('Transaction failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}`}</code>
                    </pre>
                </Example>
            </section>

            <section>
                <h2 className="text-3xl font-semibold mb-4">SmartPy Contract Interaction</h2>
                <p className="mb-4">
                    Example of calling SmartPy contract methods and handling parameters. This shows interacting with
                    classic SmartPy contracts like counters.
                </p>

                <Example title="SmartPy Counter Contract">
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                        <code>{`import { TezosToolkit } from "@taquito/taquito";

export async function callContract(
  contractAddress: string, 
  entrypoint: string, 
  params: any,
  tezos: TezosToolkit
) {
  try {
    const contract = await tezos.wallet.at(contractAddress);
    
    // Call the contract method
    const operation = await contract.methods[entrypoint](params).send();
    
    console.log('Operation hash:', operation.opHash);

    // Wait for confirmation
    await operation.confirmation();
    
    return {
      success: true,
      opHash: operation.opHash
    };

  } catch (error) {
    console.error('Contract call failed:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Example: Calling a SmartPy counter contract
export async function incrementCounter(
  contractAddress: string,
  incrementValue: number,
  tezos: TezosToolkit
) {
  return callContract(contractAddress, 'increment', incrementValue, tezos);
}

export async function decrementCounter(
  contractAddress: string,
  decrementValue: number,
  tezos: TezosToolkit
) {
  return callContract(contractAddress, 'decrement', decrementValue, tezos);
}`}</code>
                    </pre>
                </Example>
            </section>

            <section>
                <h2 className="text-3xl font-semibold mb-4">Fetching NFT Data</h2>
                <p className="mb-4">Example of fetching FA2 token data with metadata from IPFS.</p>

                <Example title="NFT Data Fetcher">
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                        <code>{`interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  attributes?: Array<{ trait_type: string; value: string }>;
}

export async function fetchNFTsForAddress(
  address: string,
  contractAddress: string
): Promise<Array<{ tokenId: number; metadata: NFTMetadata }>> {
  try {
    // Fetch tokens from TzKT API
    const response = await fetch(
      \`https://api.ghostnet.tzkt.io/v1/tokens/balances?\` +
      \`account=\${address}&token.contract=\${contractAddress}\`
    );
    
    const tokens = await response.json();
    
    // Fetch metadata for each token
    const nftsWithMetadata = await Promise.all(
      tokens.map(async (token: any) => {
        try {
          // Get token metadata from contract storage
          const metadataResponse = await fetch(
            \`https://api.ghostnet.tzkt.io/v1/contracts/\${contractAddress}/storage\`
          );
          const storage = await metadataResponse.json();
          
          // Parse metadata URI (usually IPFS)
          const metadataUri = storage.token_metadata[token.token.tokenId];
          let metadata: NFTMetadata = {
            name: \`Token #\${token.token.tokenId}\`,
            description: '',
            image: ''
          };

          if (metadataUri) {
            // Fetch from IPFS
            const ipfsResponse = await fetch(metadataUri.replace('ipfs://', 'https://ipfs.io/ipfs/'));
            metadata = await ipfsResponse.json();
          }

          return {
            tokenId: token.token.tokenId,
            balance: token.balance,
            metadata
          };
        } catch (error) {
          console.error(\`Failed to fetch metadata for token \${token.token.tokenId}:\`, error);
          return {
            tokenId: token.token.tokenId,
            balance: token.balance,
            metadata: {
              name: \`Token #\${token.token.tokenId}\`,
              description: 'Metadata unavailable',
              image: ''
            }
          };
        }
      })
    );

    return nftsWithMetadata;

  } catch (error) {
    console.error('Failed to fetch NFTs:', error);
    return [];
  }
}`}</code>
                    </pre>
                </Example>
            </section>

            <section>
                <h2 className="text-3xl font-semibold mb-4">TzKT API Integration</h2>
                <p className="mb-4">Examples of using the TzKT API for blockchain data exploration.</p>

                <ApiTable
                    rows={[
                        ["Account Info", "GET /v1/accounts/{address}"],
                        ["Account Operations", "GET /v1/accounts/{address}/operations"],
                        ["Token Balances", "GET /v1/tokens/balances?account={address}"],
                        ["Contract Storage", "GET /v1/contracts/{address}/storage"],
                        ["Latest Blocks", "GET /v1/blocks?limit=10"],
                        ["Search", "GET /v1/search?query={term}"],
                    ]}
                />

                <Example title="TzKT API Helper Functions">
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                        <code>{`const TZKT_API = 'https://api.ghostnet.tzkt.io/v1';

export class TzKTClient {
  static async getAccount(address: string) {
    const response = await fetch(\`\${TZKT_API}/accounts/\${address}\`);
    return response.json();
  }

  static async getAccountOperations(address: string, limit = 20) {
    const response = await fetch(
      \`\${TZKT_API}/accounts/\${address}/operations?limit=\${limit}\`
    );
    return response.json();
  }

  static async getTokenBalances(address: string) {
    const response = await fetch(
      \`\${TZKT_API}/tokens/balances?account=\${address}\`
    );
    return response.json();
  }

  static async getLatestBlocks(limit = 10) {
    const response = await fetch(\`\${TZKT_API}/blocks?limit=\${limit}\`);
    return response.json();
  }

  static async searchBlockchain(query: string) {
    const response = await fetch(\`\${TZKT_API}/search?query=\${query}\`);
    return response.json();
  }

  static async getContractStorage(address: string) {
    const response = await fetch(\`\${TZKT_API}/contracts/\${address}/storage\`);
    return response.json();
  }
}`}</code>
                    </pre>
                </Example>
            </section>

            <section>
                <h2 className="text-3xl font-semibold mb-4">Error Handling Patterns</h2>
                <p className="mb-4">Best practices for handling errors in Tezos dApp development.</p>

                <Example title="Comprehensive Error Handler">
                    <pre className="bg-muted p-4 rounded-md overflow-x-auto text-sm">
                        <code>{`export enum TezosErrorType {
  WALLET_NOT_CONNECTED = 'WALLET_NOT_CONNECTED',
  INSUFFICIENT_BALANCE = 'INSUFFICIENT_BALANCE',
  INVALID_ADDRESS = 'INVALID_ADDRESS',
  TRANSACTION_FAILED = 'TRANSACTION_FAILED',
  CONTRACT_NOT_FOUND = 'CONTRACT_NOT_FOUND',
  NETWORK_ERROR = 'NETWORK_ERROR',
  USER_REJECTED = 'USER_REJECTED'
}

export class TezosError extends Error {
  constructor(
    public type: TezosErrorType,
    message: string,
    public originalError?: any
  ) {
    super(message);
    this.name = 'TezosError';
  }
}

export function handleTezosError(error: any): TezosError {
  // Beacon SDK errors
  if (error.message?.includes('Request aborted')) {
    return new TezosError(
      TezosErrorType.USER_REJECTED,
      'Transaction was cancelled by user',
      error
    );
  }

  // Taquito errors
  if (error.message?.includes('balance_too_low')) {
    return new TezosError(
      TezosErrorType.INSUFFICIENT_BALANCE,
      'Insufficient balance for this transaction',
      error
    );
  }

  if (error.message?.includes('invalid_address')) {
    return new TezosError(
      TezosErrorType.INVALID_ADDRESS,
      'The provided address is not valid',
      error
    );
  }

  // Network errors
  if (error.message?.includes('fetch')) {
    return new TezosError(
      TezosErrorType.NETWORK_ERROR,
      'Network connection failed. Please try again.',
      error
    );
  }

  // Default error
  return new TezosError(
    TezosErrorType.TRANSACTION_FAILED,
    error.message || 'An unexpected error occurred',
    error
  );
}

// Usage example
export async function safeTransactionCall<T>(
  operation: () => Promise<T>
): Promise<{ success: true; data: T } | { success: false; error: TezosError }> {
  try {
    const data = await operation();
    return { success: true, data };
  } catch (error) {
    const tezosError = handleTezosError(error);
    console.error('Transaction failed:', tezosError);
    return { success: false, error: tezosError };
  }
}`}</code>
                    </pre>
                </Example>
            </section>

            <section>
                <h2 className="text-3xl font-semibold mb-4">Next Steps</h2>
                <div className="grid gap-4 md:grid-cols-2">
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">🏠 Try the Demo</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            See these examples in action on the home page
                        </p>
                        <a href="/" className="text-primary hover:underline text-sm">
                            Go to demo →
                        </a>
                    </div>
                    <div className="p-4 border rounded-lg">
                        <h3 className="font-semibold mb-2">📖 Read the Docs</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                            Learn more about configuration and components
                        </p>
                        <a href="/docs" className="text-primary hover:underline text-sm">
                            Back to docs →
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
