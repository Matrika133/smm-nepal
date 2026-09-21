import { useState } from 'react';
import {
  Code,
  Terminal,
  Key,
  Copy,
  Check,
  Send,
  Zap,
  Globe,
  FileCode,
  Layers,
  RefreshCw,
  Play
} from 'lucide-react';
import { UserAccount, SMMService, SystemSettings } from '../types';

interface APIDocsTabProps {
  user: UserAccount;
  services: SMMService[];
  systemSettings?: SystemSettings;
}

export function APIDocsTab({ user, services, systemSettings }: APIDocsTabProps) {
  const [selectedEndpoint, setSelectedEndpoint] = useState<'add' | 'status' | 'services' | 'balance'>('add');
  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedSnippet, setCopiedSnippet] = useState(false);

  // Live Test Console states
  const [testAction, setTestAction] = useState('add');
  const [testService, setTestService] = useState('101');
  const [testLink, setTestLink] = useState('https://instagram.com/p/C9x81_qLM2');
  const [testQuantity, setTestQuantity] = useState('1000');
  const [testOrderId, setTestOrderId] = useState('8921');
  const [testResponse, setTestResponse] = useState<string | null>(null);
  const [isRunningTest, setIsRunningTest] = useState(false);

  const copyApiKey = () => {
    navigator.clipboard.writeText(user.apiKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const codeSnippets = {
    add: `// POST Request to Add Order
fetch("https://smmpanel-nepal.api/v2", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    key: "${user.apiKey}",
    action: "add",
    service: 101,
    link: "https://instagram.com/yourprofile",
    quantity: 1000,
    runs: 5,         // optional for drip-feed
    interval: 30     // optional for drip-feed (mins)
  })
})
.then(res => res.json())
.then(data => console.log(data));

// Response Sample:
// { "order": 8926 }`,

    status: `// POST Request for Order Status
fetch("https://smmpanel-nepal.api/v2", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    key: "${user.apiKey}",
    action: "status",
    order: 8921
  })
})
.then(res => res.json())
.then(data => console.log(data));

// Response Sample:
// {
//   "charge": "350.00",
//   "start_count": "4120",
//   "status": "Completed",
//   "remains": "0",
//   "currency": "NPR"
// }`,

    services: `// POST Request for Services List
fetch("https://smmpanel-nepal.api/v2", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    key: "${user.apiKey}",
    action: "services"
  })
})
.then(res => res.json())
.then(data => console.log(data));`,

    balance: `// POST Request for Account Balance
fetch("https://smmpanel-nepal.api/v2", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    key: "${user.apiKey}",
    action: "balance"
  })
})
.then(res => res.json())
.then(data => console.log(data));

// Response Sample:
// { "balance": "${user.balance.toFixed(2)}", "currency": "NPR" }`
  };

  const copySnippet = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedSnippet(true);
    setTimeout(() => setCopiedSnippet(false), 2000);
  };

  const handleRunApiTest = () => {
    setIsRunningTest(true);
    setTestResponse(null);

    setTimeout(() => {
      if (testAction === 'add') {
        const genId = Math.floor(8920 + Math.random() * 100);
        setTestResponse(JSON.stringify({ order: genId }, null, 2));
      } else if (testAction === 'status') {
        setTestResponse(
          JSON.stringify(
            {
              charge: '350.00',
              start_count: '4120',
              status: 'Completed',
              remains: '0',
              currency: 'NPR',
            },
            null,
            2
          )
        );
      } else if (testAction === 'balance') {
        setTestResponse(
          JSON.stringify(
            {
              balance: user.balance.toFixed(2),
              currency: 'NPR',
            },
            null,
            2
          )
        );
      } else {
        setTestResponse(
          JSON.stringify(
            services.slice(0, 3).map((s) => ({
              service: s.serviceId,
              name: s.name,
              type: s.type,
              category: s.category,
              rate: s.ratePer1k,
              min: s.minQuantity,
              max: s.maxQuantity,
              dripfeed: s.dripFeedAvailable,
              refill: s.refill,
            })),
            null,
            2
          )
        );
      }
      setIsRunningTest(false);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* API Key Banner */}
      <div className="bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Reseller API v2 Endpoint
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                Standard v2 REST API
              </span>
            </h3>
            <p className="text-xs text-neutral-400">
              Integrate {systemSettings?.siteName || 'SMM Panel Nepal'} with PerfectPanel, RentAPanel, WHMCS, or custom apps.
            </p>
          </div>
        </div>

        {/* API Key Card */}
        <div className="flex items-center gap-2 p-2 rounded-xl bg-neutral-950 border border-neutral-800 w-full sm:w-auto">
          <span className="text-[11px] text-neutral-500 font-mono pl-2">API Key:</span>
          <span className="font-mono text-xs text-emerald-400 font-bold px-2 py-1 bg-neutral-900 rounded border border-neutral-800">
            {user.apiKey}
          </span>
          <button
            onClick={copyApiKey}
            className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white transition cursor-pointer"
            title="Copy API Key"
          >
            {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Documentation & Code Examples (7 cols) */}
        <div className="lg:col-span-7 bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                API Methods & Parameters
              </span>
            </div>

            <div className="flex gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800">
              {(['add', 'status', 'services', 'balance'] as const).map((ep) => (
                <button
                  key={ep}
                  onClick={() => setSelectedEndpoint(ep)}
                  className={`px-3 py-1 rounded-lg text-xs font-mono capitalize transition cursor-pointer ${
                    selectedEndpoint === ep
                      ? 'bg-emerald-500 text-neutral-950 font-bold'
                      : 'text-neutral-400 hover:text-white'
                  }`}
                >
                  {ep}
                </button>
              ))}
            </div>
          </div>

          {/* Endpoint Info */}
          <div className="text-xs text-neutral-300 space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold font-mono text-[10px]">
                POST
              </span>
              <span className="font-mono text-white text-xs">
                https://smmpanel-nepal.api/v2
              </span>
            </div>
            <p className="text-neutral-400 leading-relaxed font-sans">
              {selectedEndpoint === 'add' && 'Create single or drip-feed orders programmatically with instant execution.'}
              {selectedEndpoint === 'status' && 'Retrieve real-time order progression, start count, and remaining count.'}
              {selectedEndpoint === 'services' && 'List all active SMM services, rates, min/max limits, and refill tags.'}
              {selectedEndpoint === 'balance' && 'Query your current live panel account balance.'}
            </p>
          </div>

          {/* Code Viewer */}
          <div className="relative rounded-xl bg-neutral-950 border border-neutral-800 p-4 font-mono text-xs text-neutral-200 overflow-x-auto">
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-neutral-800/80 text-[11px] text-neutral-500">
              <span>JavaScript (Node / Fetch)</span>
              <button
                onClick={() => copySnippet(codeSnippets[selectedEndpoint])}
                className="flex items-center gap-1 text-emerald-400 hover:underline cursor-pointer"
              >
                {copiedSnippet ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedSnippet ? 'Copied' : 'Copy Code'}</span>
              </button>
            </div>
            <pre className="text-emerald-400/90 whitespace-pre-wrap leading-relaxed">
              {codeSnippets[selectedEndpoint]}
            </pre>
          </div>
        </div>

        {/* Right: Live Interactive Test Sandbox (5 cols) */}
        <div className="lg:col-span-5 bg-neutral-900/90 border border-neutral-800/90 rounded-2xl p-5 shadow-xl space-y-4">
          <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="text-xs font-bold text-white uppercase tracking-wider">
                API Test Sandbox
              </span>
            </div>
            <span className="text-[10px] px-2 py-0.5 rounded bg-neutral-800 text-neutral-400 font-mono">
              Live Test
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <div>
              <label className="text-neutral-400 block mb-1 font-mono text-[11px]">Action Parameter</label>
              <select
                value={testAction}
                onChange={(e) => setTestAction(e.target.value)}
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-2 text-white font-mono focus:outline-none focus:border-emerald-500"
              >
                <option value="add">add (Place Order)</option>
                <option value="status">status (Check Order)</option>
                <option value="services">services (Get Services List)</option>
                <option value="balance">balance (Check Balance)</option>
              </select>
            </div>

            {testAction === 'add' && (
              <>
                <div>
                  <label className="text-neutral-400 block mb-1 font-mono text-[11px]">service ID</label>
                  <input
                    type="number"
                    value={testService}
                    onChange={(e) => setTestService(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1 font-mono text-[11px]">link</label>
                  <input
                    type="text"
                    value={testLink}
                    onChange={(e) => setTestLink(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="text-neutral-400 block mb-1 font-mono text-[11px]">quantity</label>
                  <input
                    type="number"
                    value={testQuantity}
                    onChange={(e) => setTestQuantity(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-white font-mono"
                  />
                </div>
              </>
            )}

            {testAction === 'status' && (
              <div>
                <label className="text-neutral-400 block mb-1 font-mono text-[11px]">order ID</label>
                <input
                  type="number"
                  value={testOrderId}
                  onChange={(e) => setTestOrderId(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-3 py-1.5 text-white font-mono"
                />
              </div>
            )}

            <button
              type="button"
              onClick={handleRunApiTest}
              disabled={isRunningTest}
              className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition cursor-pointer flex items-center justify-center gap-2"
            >
              {isRunningTest ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5" />}
              <span>Execute Sandbox Request</span>
            </button>

            {/* Test Result Window */}
            {testResponse && (
              <div className="p-3 bg-neutral-950 rounded-xl border border-emerald-500/30 font-mono text-[11px] text-emerald-400">
                <span className="text-neutral-500 block mb-1 font-sans text-[10px]">HTTP 200 OK Response:</span>
                <pre className="whitespace-pre-wrap">{testResponse}</pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
