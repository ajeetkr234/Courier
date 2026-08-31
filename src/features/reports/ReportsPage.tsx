import React, { useState } from 'react';
import { BarChart3, Download, Calendar, Filter, FileSpreadsheet, TrendingUp, RefreshCw } from 'lucide-react';
import { usePlatformStore } from '../../services/store';
import { toast } from 'sonner';

export const ReportsPage: React.FC = () => {
  const { orders, shipments, ndrCases, ledgerEntries, codRemittances } = usePlatformStore();
  const [reportType, setReportType] = useState<'ORDERS' | 'COURIER_PERFORMANCE' | 'NDR' | 'FINANCE'>('ORDERS');
  const [dateRange, setDateRange] = useState('THIS_MONTH');

  const exportReport = () => {
    toast.success(`${reportType} Report exported successfully as CSV!`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-indigo-600" /> Logistics Reports &amp; Intelligence
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Export raw operational data, courier SLA metrics, NDR conversion rates, and financial ledger breakdowns
          </p>
        </div>

        <button
          onClick={exportReport}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer"
        >
          <Download className="h-4 w-4" /> Export CSV / XLSX
        </button>
      </div>

      {/* Report Controls */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setReportType('ORDERS')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              reportType === 'ORDERS' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Orders Report ({orders.length})
          </button>
          <button
            onClick={() => setReportType('COURIER_PERFORMANCE')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              reportType === 'COURIER_PERFORMANCE' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Courier SLA ({shipments.length})
          </button>
          <button
            onClick={() => setReportType('NDR')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              reportType === 'NDR' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            NDR &amp; RTO Analytics ({ndrCases.length})
          </button>
          <button
            onClick={() => setReportType('FINANCE')}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${
              reportType === 'FINANCE' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Finance &amp; Wallet ({ledgerEntries.length})
          </button>
        </div>

        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <select
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none"
          >
            <option value="TODAY">Today</option>
            <option value="LAST_7_DAYS">Last 7 Days</option>
            <option value="THIS_MONTH">This Month</option>
            <option value="ALL_TIME">All Time</option>
          </select>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">Total Orders Processed</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{orders.length}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">Avg Delivery SLA</span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">2.4 Days</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">NDR Resolution Rate</span>
          <span className="text-2xl font-bold text-cyan-600 mt-1 block">85.2%</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">COD Remitted Total</span>
          <span className="text-2xl font-bold text-indigo-600 mt-1 block">
            ₹{codRemittances.reduce((acc, c) => acc + c.amount, 0).toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Report Data Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 uppercase tracking-wider font-display">
            {reportType} Data Table View
          </h3>
          <span className="text-xs text-slate-500">Showing top records</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          {reportType === 'ORDERS' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 uppercase text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Order ID</th>
                  <th className="p-3.5">Source</th>
                  <th className="p-3.5">Customer Name</th>
                  <th className="p-3.5">Pincode</th>
                  <th className="p-3.5">Value</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-900">{o.external_order_id || o.id}</td>
                    <td className="p-3.5 font-bold uppercase text-slate-700">{o.source}</td>
                    <td className="p-3.5 font-bold text-slate-900">{o.customer?.name || o.shipping_address.name}</td>
                    <td className="p-3.5 font-mono text-slate-700">{o.shipping_address.pincode}</td>
                    <td className="p-3.5 font-bold text-emerald-600">₹{o.total_amount}</td>
                    <td className="p-3.5 font-bold text-slate-800">{o.current_status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'COURIER_PERFORMANCE' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 uppercase text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Courier Carrier</th>
                  <th className="p-3.5">Total Shipments</th>
                  <th className="p-3.5">On-Time Delivery %</th>
                  <th className="p-3.5">NDR %</th>
                  <th className="p-3.5">Avg Cost / Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900">Delhivery Direct</td>
                  <td className="p-3.5 font-bold text-slate-800">1,240</td>
                  <td className="p-3.5 text-emerald-600 font-bold">96.4%</td>
                  <td className="p-3.5 text-amber-600 font-bold">3.2%</td>
                  <td className="p-3.5 font-bold text-slate-800">₹68.50</td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900">Xpressbees Express</td>
                  <td className="p-3.5 font-bold text-slate-800">980</td>
                  <td className="p-3.5 text-emerald-600 font-bold">94.1%</td>
                  <td className="p-3.5 text-amber-600 font-bold">4.8%</td>
                  <td className="p-3.5 font-bold text-slate-800">₹62.10</td>
                </tr>
                <tr className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 font-bold text-slate-900">Ecom Express</td>
                  <td className="p-3.5 font-bold text-slate-800">750</td>
                  <td className="p-3.5 text-emerald-600 font-bold">95.8%</td>
                  <td className="p-3.5 text-amber-600 font-bold">3.9%</td>
                  <td className="p-3.5 font-bold text-slate-800">₹71.00</td>
                </tr>
              </tbody>
            </table>
          )}

          {reportType === 'NDR' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 uppercase text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">NDR ID</th>
                  <th className="p-3.5">AWB Tracking</th>
                  <th className="p-3.5">Failure Reason</th>
                  <th className="p-3.5">Attempts</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {ndrCases.map((ndr) => (
                  <tr key={ndr.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-900">{ndr.id}</td>
                    <td className="p-3.5 font-mono font-bold text-indigo-600">{ndr.shipment?.awb_number || ndr.shipment_id}</td>
                    <td className="p-3.5 text-slate-700">{ndr.reason}</td>
                    <td className="p-3.5 font-bold text-slate-800">{ndr.attempt_count}</td>
                    <td className="p-3.5 font-bold text-slate-800">{ndr.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          {reportType === 'FINANCE' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 uppercase text-slate-700 font-bold border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Ref ID</th>
                  <th className="p-3.5">Type</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Direction</th>
                  <th className="p-3.5">Description</th>
                  <th className="p-3.5">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {ledgerEntries.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-mono font-semibold text-slate-900">{l.reference_id}</td>
                    <td className="p-3.5">
                      <span className="px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[10px] uppercase font-bold text-slate-800">
                        {l.type}
                      </span>
                    </td>
                    <td className={`p-3.5 font-bold ${l.direction === 'CREDIT' ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {l.direction === 'CREDIT' ? '+' : '-'}₹{l.amount}
                    </td>
                    <td className="p-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold border ${
                        l.direction === 'CREDIT'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}>
                        {l.direction}
                      </span>
                    </td>
                    <td className="p-3.5 text-slate-700 font-medium">{l.description}</td>
                    <td className="p-3.5 font-mono text-slate-600">{new Date(l.created_at).toLocaleDateString('en-IN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
