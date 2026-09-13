import React, { useState } from 'react';
import { 
  Code2, Copy, Check, ArrowRight, ShieldCheck, 
  Zap, Lock
} from 'lucide-react';
import { Link } from 'react-router-dom';

type LanguageKey = 'curl' | 'nodejs' | 'python';
type EndpointKey = 'create_shipment' | 'verify_webhook';

export const DeveloperApiSandbox: React.FC = () => {
  const [selectedLang, setSelectedLang] = useState<LanguageKey>('curl');
  const [selectedEndpoint, setSelectedEndpoint] = useState<EndpointKey>('create_shipment');
  const [copied, setCopied] = useState(false);

  const codeSnippets: Record<EndpointKey, Record<LanguageKey, string>> = {
    create_shipment: {
      curl: `curl -X POST https://api.shipfaster.com/v1/shipments/create \\
  -H "Authorization: Bearer sf_live_99481029410" \\
  -H "Content-Type: application/json" \\
  -H "X-Idempotency-Key: idemp_order_984210" \\
  -d '{
    "order_number": "ORD-984210",
    "pickup_pincode": "110020",
    "delivery_pincode": "400001",
    "consignee": {
      "name": "Aditi Sharma",
      "phone": "+919876543210",
      "address": "B-402, Apex Towers, Bandra West, Mumbai"
    },
    "package": {
      "weight_kg": 0.85,
      "dimensions_cm": { "length": 22, "width": 16, "height": 10 }
    },
    "payment_mode": "PREPAID",
    "order_value": 2499,
    "carrier_routing": "CHEAPEST_SLA_MATCH"
  }'`,
      nodejs: `import { ShipFasterClient } from '@shipfaster/sdk';

const client = new ShipFasterClient({
  apiKey: process.env.SHIPFASTER_API_KEY!
});

async function dispatchOrder() {
  const shipment = await client.shipments.create({
    orderNumber: 'ORD-984210',
    pickupPincode: '110020',
    deliveryPincode: '400001',
    consignee: {
      name: 'Aditi Sharma',
      phone: '+919876543210',
      address: 'B-402, Apex Towers, Bandra West, Mumbai'
    },
    package: {
      weightKg: 0.85,
      dimensions: { length: 22, width: 16, height: 10 }
    },
    paymentMode: 'PREPAID',
    orderValue: 2499,
    routingRule: 'CHEAPEST_SLA_MATCH'
  }, {
    idempotencyKey: 'idemp_order_984210'
  });

  console.log('Carrier Assigned:', shipment.carrierName);
  console.log('Live AWB:', shipment.awbNumber);
  console.log('Thermal Label URL:', shipment.labelPdfUrl);
}`,
      python: `import os
import requests

API_KEY = os.getenv("SHIPFASTER_API_KEY")
ENDPOINT = "https://api.shipfaster.com/v1/shipments/create"

headers = {
    "Authorization": f"Bearer {API_KEY}",
    "Content-Type": "application/json",
    "X-Idempotency-Key": "idemp_order_984210"
}

payload = {
    "order_number": "ORD-984210",
    "pickup_pincode": "110020",
    "delivery_pincode": "400001",
    "consignee": {
        "name": "Aditi Sharma",
        "phone": "+919876543210",
        "address": "B-402, Apex Towers, Bandra West, Mumbai"
    },
    "package": {
        "weight_kg": 0.85,
        "dimensions_cm": {"length": 22, "width": 16, "height": 10}
    },
    "payment_mode": "PREPAID",
    "order_value": 2499,
    "carrier_routing": "CHEAPEST_SLA_MATCH"
}

response = requests.post(ENDPOINT, json=payload, headers=headers)
shipment = response.json()
print(f"AWB Assigned: {shipment['data']['awb_number']} ({shipment['data']['carrier']})")`
    },
    verify_webhook: {
      curl: `# Test your local endpoint with a simulated signed webhook
curl -X POST https://yourstore.com/api/webhooks/shipfaster \\
  -H "Content-Type: application/json" \\
  -H "X-ShipFaster-Signature: t=1725700000,v1=9f8a3c42e12b7..." \\
  -d '{
    "event": "shipment.delivered",
    "timestamp": "2026-09-07T10:30:00Z",
    "data": {
      "awb": "DEL-98420194",
      "order_number": "ORD-984210",
      "carrier": "Delhivery Direct",
      "delivered_to": "Aditi Sharma",
      "pod_signature_url": "https://cdn.shipfaster.com/pod/DEL-98420194.jpg"
    }
  }'`,
      nodejs: `import crypto from 'crypto';
import express from 'express';

const app = express();
const WEBHOOK_SECRET = process.env.SHIPFASTER_WEBHOOK_SECRET!;

app.post('/api/webhooks/shipfaster', express.raw({ type: 'application/json' }), (req, res) => {
  const signatureHeader = req.headers['x-shipfaster-signature'] as string;
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const digest = 'v1=' + hmac.update(req.body).digest('hex');

  if (signatureHeader !== digest) {
    return res.status(401).send('Invalid HMAC Signature');
  }

  const event = JSON.parse(req.body.toString());
  console.log('Verified Webhook Event:', event.event, event.data.awb);
  
  res.status(200).json({ received: true });
});`,
      python: `import hmac
import hashlib
from flask import Flask, request, jsonify

app = Flask(__name__)
WEBHOOK_SECRET = os.getenv("SHIPFASTER_WEBHOOK_SECRET")

@app.route("/api/webhooks/shipfaster", methods=["POST"])
def handle_webhook():
    signature_header = request.headers.get("X-ShipFaster-Signature")
    raw_body = request.get_data()

    expected_signature = "v1=" + hmac.new(
        WEBHOOK_SECRET.encode("utf-8"),
        raw_body,
        hashlib.sha256
    ).hexdigest()

    if not hmac.compare_digest(signature_header, expected_signature):
        return jsonify({"error": "Signature mismatch"}), 401

    payload = request.get_json()
    print(f"Verified Event: {payload['event']} for AWB {payload['data']['awb']}")
    return jsonify({"received": True}), 200`
    }
  };

  const currentCode = codeSnippets[selectedEndpoint][selectedLang];

  const handleCopy = () => {
    navigator.clipboard.writeText(currentCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="developer-sandbox" className="py-10 sm:py-16 px-3 xs:px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto w-full space-y-6 sm:space-y-8 scroll-mt-20">
      {/* Header */}
      <div className="text-center space-y-3 sm:space-y-3.5 max-w-5xl mx-auto px-1 xs:px-2">
        <div className="inline-block">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 xs:px-3.5 rounded-full bg-blue-50 text-blue-700 text-[11px] xs:text-xs font-extrabold border border-blue-200/80 shadow-xs">
            <span className="flex h-2 w-2 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-600" />
            </span>
            <Code2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
            <span className="uppercase tracking-wider">DEVELOPER REST API &amp; SDK PLAYGROUND</span>
          </div>
        </div>

        <h2 className="text-2xl xs:text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.18] max-w-4xl mx-auto">
          Built for Developers.{' '}
          <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-sky-500 bg-clip-text text-transparent">
            Integrate in Under 5 Minutes.
          </span>
        </h2>

        <p className="text-xs xs:text-sm sm:text-base md:text-lg text-slate-600 font-medium leading-relaxed max-w-3xl mx-auto">
          Explore complete production code samples for order creation, label generation, and cryptographic webhook verification across any programming language.
        </p>
      </div>

      {/* Code Explorer Studio Box */}
      <div className="bg-slate-950 rounded-2xl sm:rounded-3xl border border-slate-800 shadow-2xl overflow-hidden">
        {/* Top Control Bar */}
        <div className="p-3 xs:p-4 sm:p-5 border-b border-slate-800/90 bg-slate-900/90 flex flex-col lg:flex-row lg:items-center justify-between gap-3 sm:gap-4">
          {/* Operation Selector */}
          <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
            <button
              type="button"
              onClick={() => setSelectedEndpoint('create_shipment')}
              className={`flex-1 sm:flex-initial text-center justify-center px-2.5 xs:px-3.5 py-1.5 rounded-xl text-[11px] xs:text-xs font-mono font-bold transition-all cursor-pointer ${
                selectedEndpoint === 'create_shipment'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              POST /v1/shipments/create
            </button>
            <button
              type="button"
              onClick={() => setSelectedEndpoint('verify_webhook')}
              className={`flex-1 sm:flex-initial text-center justify-center px-2.5 xs:px-3.5 py-1.5 rounded-xl text-[11px] xs:text-xs font-mono font-bold transition-all cursor-pointer ${
                selectedEndpoint === 'verify_webhook'
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700'
              }`}
            >
              Verify Webhook (HMAC-SHA256)
            </button>
          </div>

          {/* Language Selector & Copy Action */}
          <div className="flex flex-wrap items-center justify-between sm:justify-start gap-2 w-full lg:w-auto">
            <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800">
              {(['curl', 'nodejs', 'python'] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setSelectedLang(lang)}
                  className={`px-2.5 xs:px-3 py-1 rounded-lg text-[10px] xs:text-xs font-mono font-bold transition-all cursor-pointer uppercase ${
                    selectedLang === lang
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-400/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {lang === 'nodejs' ? 'Node.js' : lang}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={handleCopy}
              className="px-3 xs:px-3.5 py-1.5 rounded-xl text-[11px] xs:text-xs font-mono font-bold bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-700 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-slate-400" />
                  <span>Copy Snippet</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code Display Terminal Body */}
        <div className="p-3 xs:p-4 sm:p-6 overflow-x-auto bg-slate-950/95 font-mono text-[11px] xs:text-xs sm:text-sm text-slate-200 leading-relaxed max-h-[480px]">
          <pre className="selection:bg-blue-600 selection:text-white">
            <code>{currentCode}</code>
          </pre>
        </div>

        {/* Bottom Feature Badges & Developer Link */}
        <div className="p-3.5 xs:p-4 sm:p-5 border-t border-slate-800/90 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 text-[11px] xs:text-xs font-mono">
          <div className="flex flex-wrap items-center gap-2.5 xs:gap-4 text-slate-400">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Zap className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>P95 Latency: &lt;350ms</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              <span>Idempotent via X-Idempotency-Key</span>
            </span>
            <span className="flex items-center gap-1.5 text-slate-300">
              <Lock className="w-3.5 h-3.5 text-blue-400 shrink-0" />
              <span>HMAC-SHA256 Signed Bus</span>
            </span>
          </div>

          <Link to="/app/developers" className="inline-flex items-center gap-1.5 text-blue-400 hover:text-blue-300 font-bold transition-colors">
            <span>Explore Developer Portal &amp; API Keys</span>
            <ArrowRight className="w-3.5 h-3.5 shrink-0" />
          </Link>
        </div>
      </div>
    </section>
  );
};
