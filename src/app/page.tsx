'use client';
import Footer from 'src/components/Footer';
import { tenderlySimulateHandleOpLink, traceUserOp, parseUserOp, UserOperation, DUMMY_WALLET_PASSKEY_SIG } from '../lib';
import { useAccount } from 'wagmi';
import LoginButton from '../components/LoginButton';
import SignupButton from '../components/SignupButton';
import ArrowSvg from 'src/svg/ArrowSvg';
import { useState } from 'react';
import { base, baseSepolia, mainnet, optimism, arbitrum, polygon } from 'viem/chains'
import { createPublicClient, http, PublicClient } from 'viem';
export default function Page() {
  const { address } = useAccount();
  
  // Add state management
  const [chainId, setChainId] = useState<number>(base.id);
  const [userOpJson, setUserOpJson] = useState('');
  const [rpcUrl, setRpcUrl] = useState('');
  const [output, setOutput] = useState('');
  const [userOp, setUserOp] = useState<UserOperation | null>(null);
  const [parseError, setParseError] = useState<string>('');
  const [signatureMessage, setSignatureMessage] = useState('');
  const [provider, setProvider] = useState<PublicClient | null>(null);

  const chains = [base, baseSepolia, mainnet, optimism, arbitrum, polygon]

  const tryParseUserOp = (json: string) => {
    try {
      if (!json.trim()) {
        setUserOp(null);
        setParseError('');
        return '';
      }
      const parsedUserOp = parseUserOp(json);

      let signatureMessage = '';
      if (parsedUserOp.signature == '0x') {
        parsedUserOp.signature = DUMMY_WALLET_PASSKEY_SIG;
        signatureMessage = 'Note: A dummy passkey signature was added since none was provided.';
      } // todo add EOA sig if needed (add button to switch between passkey and EOA)

      setUserOp(parsedUserOp);
      setParseError('');
      return signatureMessage;
    } catch (error: any) {
      setUserOp(null);
      setParseError(error.message);
      return '';
    }
  };

  // Add handlers
  const handleGetTenderlySimulation = async () => {
    try {
      setOutput('Fetching simulation...');
      if (!userOp) {
        throw new Error('UserOp is not correctly parsed');
      }
      const result = await tenderlySimulateHandleOpLink({ chainId, userOp });
      setOutput(JSON.stringify(result, null, 2));
    } catch (error: any) {
      setOutput(`Error: ${error.message}`);
    }
  };

  const handleTraceUserOp = async () => {
    try {
      setOutput('Tracing UserOp...');
      if (!userOp) {
        throw new Error('UserOp is not correctly parsed');
      }
      if (!provider) {
        throw new Error('Provider is not correctly set');
      }
      const result = await traceUserOp({ chainId, userOp, provider });
      setOutput(JSON.stringify(result, null, 2));
    } catch (error: any) {
      setOutput(`Error: ${error.message}`);
    }
  };

  const handleUserOpJsonChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserOpJson(e.target.value);
    const message = tryParseUserOp(e.target.value);
    setSignatureMessage(message);
  };

  const handleRpcUrlChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setRpcUrl(e.target.value);

    if (!e.target.value) {
      setProvider(null);
      return;
    }

    // validate RPC URL
    const provider = createPublicClient({ transport: http(e.target.value) });
    setProvider(provider);
    try {
      const chain = await provider.getChainId();
      console.log("chain", chain);
      if (chain !== chainId) {
        throw new Error("Chain id mismatch for RPC URL");
      }
      setChainId(chain);
    } catch (error) {
      // Optional: Add error handling here if needed
      console.error('Failed to validate RPC URL:', error);
    }
  };

  return (
    <div className="flex h-full w-96 max-w-full flex-col px-1 md:w-[1008px]">
      <section className="mt-6 mb-6 flex w-full flex-col md:flex-row">
        <div className="flex w-full flex-row items-center justify-between gap-2 md:gap-0">
          <a
            title="userop debugger"
            target="_blank"
            rel="noreferrer"
          >
            <span className="text-xl font-bold">Userop Debugger</span>
          </a>
          <div className="flex items-center gap-3">
            <SignupButton />
            {!address && <LoginButton />}
          </div>
        </div>
      </section>
      <section className="flex w-full flex-col gap-6 rounded-xl bg-gray-100 px-6 py-8">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <label htmlFor="chainSelect" className="text-sm font-medium text-gray-700">
              Chain
            </label>
            <select
              id="chainSelect"
              className="w-full rounded-lg border border-gray-300 p-3 text-sm appearance-none bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23000000%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:0.7em] bg-[right_0.75rem_center] bg-no-repeat"
              value={chainId}
              onChange={(e) => setChainId(Number(e.target.value))}
            >
              {chains.map((chain) => (
                <option key={chain.id} value={chain.id}>
                  {chain.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="userOpJson" className="text-sm font-medium text-gray-700">
              UserOp JSON
            </label>
            <textarea
              id="userOpJson"
              className="min-h-[120px] w-full rounded-lg border border-gray-300 p-3 text-sm"
              placeholder="Paste your UserOp JSON here..."
              value={userOpJson}
              onChange={handleUserOpJsonChange}
            />
            {parseError && (
              <p className="text-sm text-red-600">{parseError}</p>
            )}
            {userOp && !parseError && (
              <>
                {signatureMessage && (
                  <p className="text-sm text-amber-600">{signatureMessage}</p>
                )}
                <p className="text-sm text-green-600">UserOp parsed successfully!</p>
              </>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <label htmlFor="rpcUrl" className="text-sm font-medium text-gray-700">
                Node RPC URL (Optional)
              </label>
              <a 
                href="https://portal.cdp.coinbase.com"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-600 hover:underline"
              >
                <span className="flex items-center">Get one for Base at CDP <ArrowSvg /></span>
              </a>
            </div>
            <input
              id="rpcUrl"
              type="text"
              className="w-full rounded-lg border border-gray-300 p-3 text-sm"
              placeholder="https://..."
              value={rpcUrl}
              onChange={handleRpcUrlChange}
            />
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <button
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
            onClick={handleGetTenderlySimulation}
            disabled={!userOp}
          >
            Get Tenderly Simulation
          </button>

          <button
            className="rounded-lg bg-gray-600 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-gray-700"
            onClick={handleTraceUserOp}
            disabled={!userOpJson || !provider}
          >
            Trace UserOp (RPC URL required)
          </button>
        </div>

        <div className="flex flex-col gap-2">
          <h3 className="text-sm font-medium text-gray-700">Output</h3>
          <div className="min-h-[100px] rounded-lg border border-gray-300 bg-white p-4">
            <pre className="whitespace-pre-wrap break-words text-sm">
              {output}
            </pre>
          </div>
        </div>
      </section>
      <Footer />
    </div>
  );
}
