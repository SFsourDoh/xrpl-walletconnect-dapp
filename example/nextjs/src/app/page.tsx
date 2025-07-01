"use client";
import { useWalletConnectClient } from "@xrpl-walletconnect/react";
import { mainnet, testnet, devnet } from "@xrpl-walletconnect/core";
import { useEffect, useState } from "react";
import Image from "next/image";
import { Client } from "xrpl";

/**
 * XRPL WalletConnect Integration Demo
 * 
 * This component demonstrates how to:
 * 1. Connect to a wallet using WalletConnect v2
 * 2. Sign XRPL transactions with the connected wallet
 * 3. Submit signed transactions to the XRP Ledger
 * 
 * Key Features:
 * - Multi-network support (Mainnet, Testnet, Devnet)
 * - Dynamic transaction creation with connected account
 * - Two-step process: Sign → Submit
 * - Real-time transaction status feedback
 */
export default function Home() {
  // WalletConnect client hook - provides connection, signing, and account management
  const { connect, disconnect, accounts, chains, setChains, signTransaction, uri } =
    useWalletConnectClient();
  
  // State management for transaction workflow
  const [result, setResult] = useState<Record<string, any>>(); // Signed transaction result
  const [transactionData, setTransactionData] = useState<string>(""); // JSON transaction input
  const [submissionResult, setSubmissionResult] = useState<Record<string, any>>(); // XRPL submission result
  const [isSubmitting, setIsSubmitting] = useState(false); // Submission loading state
  const [isSigning, setIsSigning] = useState(false); // Signing loading state
  const [signedTxBlob, setSignedTxBlob] = useState<string>(""); // Signed transaction blob for submission
  
  // Available XRPL networks
  const network = [mainnet, testnet, devnet];

  // Initialize with Testnet as default, but preserve user selections
  useEffect(() => {
    // Only set default chain if no chains are currently selected
    // This prevents overwriting user's network selection after connection
    if (chains.length === 0) {
      setChains([testnet.id]);
    }
  }, [setChains, chains.length]);

  /**
   * Network Selection Handler
   * Allows users to switch between XRPL networks (Mainnet, Testnet, Devnet)
   */
  const selectNetwork = (chainId: string) => {
    setChains([chainId]);
  };

  /**
   * Wallet Connection Handler
   * Initiates WalletConnect connection and displays QR code/URI
   */
  const handleConnect = async () => {
    try {
      await connect();
    } catch (error) {
      console.error("Connection error:", error);
    }
  };

  /**
   * Transaction Signing Handler
   * 
   * This function:
   * 1. Parses the JSON transaction data
   * 2. Sends the transaction to the connected wallet for signing
   * 3. Extracts the signed transaction blob for later submission
   * 4. Handles errors and provides user feedback
   */
  const testTransaction = async () => {
    try {
      const parsedJson = JSON.parse(transactionData);

      // Reset states and set loading
      setIsSigning(true);
      setResult(undefined);
      setSubmissionResult(undefined);
      setSignedTxBlob("");
      
      console.log("Starting transaction signing...");
      console.log("Transaction data:", parsedJson);
      console.log("Chain:", chains[0]);
      
      // Request wallet to sign the transaction
      const result = await signTransaction(chains[0], parsedJson);
      console.log("Signing result:", result);
      setResult(result);
      
      // Extract the signed transaction blob from the response
      // WalletConnect returns: { signedTransaction: { tx_blob: "...", hash: "..." } }
      if (result && typeof result === 'object' && 'signedTransaction' in result && 
          result.signedTransaction && typeof result.signedTransaction === 'object' && 
          'tx_blob' in result.signedTransaction) {
        console.log("Found tx_blob, setting signedTxBlob");
        setSignedTxBlob(result.signedTransaction.tx_blob as string);
      } else {
        console.log("No tx_blob found in result:", result);
        alert("No transaction blob found in signing result. Check the result details below.");
      }
    } catch (e: any) {
      console.error("Error during transaction signing:", e);
      alert(`Error during transaction signing: ${e.message || 'Unknown error'}`);
    } finally {
      setIsSigning(false);
    }
  };

  /**
   * Clear Results Handler
   * Resets all transaction-related state for a fresh start
   */
  const clearResults = () => {
    setResult(undefined);
    setSubmissionResult(undefined);
    setSignedTxBlob("");
    setTransactionData("");
  };

  /**
   * XRPL Transaction Submission Handler
   * 
   * This function:
   * 1. Connects to the appropriate XRPL server based on selected network
   * 2. Submits the signed transaction blob to the XRPL
   * 3. Waits for transaction confirmation
   * 4. Provides detailed feedback on success/failure
   * 
   * @param txBlob - The signed transaction blob from the wallet
   */
  const submitTransactionToXRPL = async (txBlob: string) => {
    setIsSubmitting(true);
    setSubmissionResult(undefined);
    
    try {
      // Select XRPL server based on chosen network
      const serverUrl = chains[0] === testnet.id 
        ? "wss://s.altnet.rippletest.net:51233"  // Testnet server
        : chains[0] === mainnet.id
        ? "wss://xrplcluster.com"                // Mainnet server
        : "wss://s.devnet.rippletest.net:51233"; // Devnet server
      
      console.log("Connecting to XRPL server:", serverUrl);
      const client = new Client(serverUrl);
      await client.connect();
      
      console.log("Submitting transaction to XRPL...");
      setSubmissionResult({ status: "Submitting transaction..." });
      
      // Submit and wait for transaction confirmation
      const submitResult = await client.submitAndWait(txBlob);
      setSubmissionResult(submitResult);
      
      console.log("Transaction submitted successfully:", submitResult);
      
      // Extract transaction status from metadata
      const status = typeof submitResult.result.meta === 'string' 
        ? submitResult.result.meta 
        : submitResult.result.meta?.TransactionResult || 'Unknown';
      
      // Provide user feedback based on transaction result
      if (status === 'tesSUCCESS') {
        alert(`✅ Transaction submitted successfully!\n\nHash: ${submitResult.result.hash}\nStatus: ${status}`);
      } else {
        alert(`⚠️ Transaction submitted but failed!\n\nHash: ${submitResult.result.hash}\nStatus: ${status}`);
      }
      
      await client.disconnect();
    } catch (error: any) {
      console.error("Error submitting transaction:", error);
      setSubmissionResult({ error: error.message || 'Unknown error' });
      alert(`❌ Error submitting transaction: ${error.message || 'Unknown error'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Clear signing result when accounts change (new connection)
  useEffect(() => {
    setResult(undefined);
  }, [accounts]);

  return (
    <main className="flex flex-col min-h-screen gap-2 p-24 justify-center items-center">
      {/* Header */}
      <Image
        width="192"
        height="133"
        src="walletconnect.svg"
        alt="walletconnect"
      />
      <div className="m-10 text-center">
        <span className="text-4xl md:text-6xl">XRPL WalletConnect</span>
      </div>

      {/* Network Selection */}
      <div className="text-end">
        {network.map((net) => (
          <div key={net.id} className="form-control">
            <label className="label cursor-pointer gap-2">
              <span className="label-text">{net.name}</span>
              <input
                type="checkbox"
                className="toggle toggle-primary"
                checked={chains.includes(net.id)}
                onChange={() => selectNetwork(net.id)}
              />
            </label>
          </div>
        ))}
      </div>

      {/* Connection Controls */}
      <div className="flex gap-2 m-2">
        <button
          className="btn btn-primary"
          disabled={!chains.length}
          onClick={handleConnect}
        >
          Connect
        </button>
        <button
          className="btn btn-secondary"
          disabled={!accounts.length}
          onClick={() => disconnect()}
        >
          Disconnect
        </button>
      </div>
      
      {/* Connection Status */}
      <div className="text-sm text-gray-600">
        <p>Selected Network: {chains.join(', ')}</p>
        <p>Connected Accounts: {accounts.length}</p>
        <p>WalletConnect URI: {uri ? 'Ready' : 'Not ready'}</p>
        <p>Signed Transaction: {signedTxBlob ? 'Ready to submit' : 'Not signed'}</p>
        {uri && (
          <div className="mt-2 p-2 bg-gray-100 rounded">
            <p className="font-mono text-xs break-all text-gray-900">{uri}</p>
          </div>
        )}
      </div>

      {/* Transaction Interface - Only show when connected */}
      {accounts.length > 0 && (
        <div className="text-center w-full max-w-4xl">
          {/* Connected Account Display */}
          <span className="text-xl">Connected Accounts:</span>
          {accounts.map((account) => (
            <div key={account} className="font-mono text-sm bg-gray-100 text-gray-900 p-2 rounded mt-1">
              {account}
            </div>
          ))}
          
          {/* Transaction JSON Input */}
          <div className="mt-4 w-full">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Transaction JSON:
            </label>
            <textarea 
              className="w-full h-32 p-3 border border-gray-300 rounded-lg font-mono text-sm bg-white text-gray-900 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Enter JSON transaction data..."
              value={transactionData}
              onChange={(e) => setTransactionData(e.target.value)} 
            />
          </div>
          
          {/* Transaction Controls */}
          <button
            className="btn btn-sm btn-outline mt-2"
            onClick={() => {
              const connectedAccount = accounts[0];
              // Extract just the account address without chain ID prefix
              // WalletConnect format: "xrpl:1:r9KyXomvRhgzwFgaSGfzf62kUAadr1tPgy"
              // We need: "r9KyXomvRhgzwFgaSGfzf62kUAadr1tPgy"
              const accountAddress = connectedAccount.split(':').pop() || connectedAccount;
              const sampleTx = {
                TransactionType: "AccountSet",
                Account: accountAddress
              };
              setTransactionData(JSON.stringify(sampleTx, null, 2));
            }}
          >
            Load Sample Transaction
          </button>
          
          <button
            className="btn btn-accent mt-2"
            onClick={() => testTransaction()}
            disabled={isSigning || isSubmitting}
          >
            {isSigning ? "Signing..." : "Sign Transaction"}
          </button>
          
          {/* Submit to XRPL - Only show when transaction is signed */}
          {signedTxBlob && (
            <div className="mt-4">
              <button
                className="btn btn-success"
                onClick={() => submitTransactionToXRPL(signedTxBlob)}
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting to XRPL..." : "Submit to XRPL"}
              </button>
              <p className="text-sm text-gray-600 mt-2">
                Transaction signed successfully! Click above to submit to the XRPL.
              </p>
            </div>
          )}
          
          {/* Clear Results */}
          {(result || submissionResult) && (
            <div className="mt-4">
              <button
                className="btn btn-outline btn-sm"
                onClick={clearResults}
              >
                Clear Results
              </button>
            </div>
          )}
        </div>
      )}

      {/* Transaction Results Display */}
      {result && (
        <div className="max-w-full">
          <h3 className="text-lg font-semibold mb-2">✅ Signed Transaction Result:</h3>
          <pre className="overflow-x-scroll bg-gray-100 p-4 rounded">
            <code>{JSON.stringify(result, null, 2)}</code>
          </pre>
        </div>
      )}
      
      {/* XRPL Submission Results */}
      {submissionResult && (
        <div className="max-w-full">
          <h3 className="text-lg font-semibold mb-2">
            {isSubmitting ? "⏳ XRPL Submission Status:" : "📋 XRPL Submission Result:"}
          </h3>
          <pre className="overflow-x-scroll bg-gray-100 p-4 rounded">
            <code>{JSON.stringify(submissionResult, null, 2)}</code>
          </pre>
        </div>
      )}
    </main>
  );
}
