import React, { useMemo, useState } from 'react';
import { BarChart3, Calendar, Download } from 'lucide-react';
import { toast } from 'sonner';
import { usePlatformStore } from '../../services/store';

export const ReportsPage: React.FC = () => {
  const { orders, shipments, ndrCases, ledgerEntries, codRemittances } = usePlatformStore();
  const [reportType, setReportType] = useState<'ORDERS' | 'COURIER_PERFORMANCE' | 'NDR' | 'FINANCE'>('ORDERS');
  const [dateRange, setDateRange] = useState('THIS_MONTH');

  const inDateRange = (createdAt: string) => {
    const now = new Date();
    const date = new Date(createdAt);
    if (dateRange === 'TODAY') return date.toDateString() === now.toDateString();
    if (dateRange === 'LAST_7_DAYS') return date.getTime() >= Date.now() - 7 * 86400000;
    if (dateRange === 'THIS_MONTH') return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    return true;
  };

  const filteredOrders = useMemo(() => orders.filter((order) => inDateRange(order.created_at)), [dateRange, orders]);
  const filteredShipments = useMemo(() => shipments.filter((shipment) => inDateRange(shipment.created_at)), [dateRange, shipments]);
  const filteredNdr = useMemo(() => ndrCases.filter((ndr) => inDateRange(ndr.created_at)), [dateRange, ndrCases]);
  const filteredLedger = useMemo(() => ledgerEntries.filter((entry) => inDateRange(entry.created_at)), [dateRange, ledgerEntries]);

  const deliveredShipments = filteredShipments.filter((shipment) => shipment.status === 'DELIVERED');
  const avgDeliveryDays = deliveredShipments.length === 0
    ? null
    : deliveredShipments.reduce((sum, shipment) => sum + Math.max(0, (Date.parse(shipment.updated_at) - Date.parse(shipment.created_at)) / 86400000), 0) / deliveredShipments.length;
  const ndrResolutionRate = filteredNdr.length === 0
    ? null
    : (filteredNdr.filter((ndr) => ndr.status === 'RESOLVED').length / filteredNdr.length) * 100;

  const courierRows = useMemo(() => {
    const grouped = new Map<string, typeof filteredShipments>();
    filteredShipments.forEach((shipment) => {
      const name = shipment.courier_name || 'Courier Partner';
      grouped.set(name, [...(grouped.get(name) || []), shipment]);
    });

    return Array.from(grouped.entries()).map(([courierName, rows]) => {
      const delivered = rows.filter((shipment) => shipment.status === 'DELIVERED').length;
      const ndr = rows.filter((shipment) => shipment.status === 'NDR').length;
      const avgCost = rows.reduce((sum, shipment) => sum + Number(shipment.total_freight_charge || shipment.shipping_cost || 0), 0) / rows.length;
      return {
        courierName,
        total: rows.length,
        deliveryRate: rows.length === 0 ? 0 : (delivered / rows.length) * 100,
        ndrRate: rows.length === 0 ? 0 : (ndr / rows.length) * 100,
        avgCost,
      };
    });
  }, [filteredShipments]);

  const downloadCsv = (filename: string, headers: string[], rows: Array<Array<string | number | undefined>>) => {
    const escape = (value: unknown) => `"${String(value ?? '').replace(/"/g, '""')}"`;
    const csv = [headers.join(','), ...rows.map((row) => row.map(escape).join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportReport = () => {
    if (reportType === 'ORDERS') {
      downloadCsv('orders-report.csv', ['Order ID', 'Source', 'Customer', 'Pincode', 'Value', 'Status'], filteredOrders.map((order) => [
        order.external_order_id || order.id,
        order.source,
        order.customer?.name || order.shipping_address.name,
        order.shipping_address.pincode,
        order.total_amount,
        order.current_status,
      ]));
    } else if (reportType === 'COURIER_PERFORMANCE') {
      downloadCsv('courier-performance-report.csv', ['Courier', 'Shipments', 'Delivery Rate %', 'NDR Rate %', 'Avg Cost'], courierRows.map((row) => [
        row.courierName,
        row.total,
        row.deliveryRate.toFixed(2),
        row.ndrRate.toFixed(2),
        row.avgCost.toFixed(2),
      ]));
    } else if (reportType === 'NDR') {
      downloadCsv('ndr-report.csv', ['NDR ID', 'AWB', 'Reason', 'Attempts', 'Status'], filteredNdr.map((ndr) => [
        ndr.id,
        ndr.shipment?.awb_number || ndr.shipment_id,
        ndr.reason,
        ndr.attempt_count,
        ndr.status,
      ]));
    } else {
      downloadCsv('finance-report.csv', ['Reference', 'Type', 'Amount', 'Direction', 'Description', 'Created At'], filteredLedger.map((entry) => [
        entry.reference_id,
        entry.type,
        entry.amount,
        entry.direction,
        entry.description,
        entry.created_at,
      ]));
    }
    toast.success(`${reportType} report exported from live records`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 font-display flex items-center gap-2">
            <BarChart3 className="h-6 w-6 text-indigo-600" /> Logistics Reports
          </h2>
          <p className="text-xs text-slate-500 mt-1">Reports are calculated from live orders, shipments, NDR and finance records.</p>
        </div>
        <button onClick={exportReport} className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-semibold text-xs transition flex items-center gap-2 shadow-lg shadow-emerald-600/20 cursor-pointer">
          <Download className="h-4 w-4" /> Export CSV
        </button>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          {[
            ['ORDERS', `Orders Report (${filteredOrders.length})`],
            ['COURIER_PERFORMANCE', `Courier SLA (${filteredShipments.length})`],
            ['NDR', `NDR & RTO Analytics (${filteredNdr.length})`],
            ['FINANCE', `Finance & Wallet (${filteredLedger.length})`],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setReportType(id as typeof reportType)}
              className={`px-4 py-2 rounded-xl text-xs font-semibold transition ${reportType === id ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center space-x-2">
          <Calendar className="h-4 w-4 text-slate-400" />
          <select value={dateRange} onChange={(event) => setDateRange(event.target.value)} className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 text-xs text-slate-800 focus:outline-none">
            <option value="TODAY">Today</option>
            <option value="LAST_7_DAYS">Last 7 Days</option>
            <option value="THIS_MONTH">This Month</option>
            <option value="ALL_TIME">All Time</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">Total Orders Processed</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">{filteredOrders.length}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">Avg Delivery SLA</span>
          <span className="text-2xl font-bold text-emerald-600 mt-1 block">{avgDeliveryDays === null ? 'NA' : `${avgDeliveryDays.toFixed(1)} Days`}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">NDR Resolution Rate</span>
          <span className="text-2xl font-bold text-cyan-600 mt-1 block">{ndrResolutionRate === null ? 'NA' : `${ndrResolutionRate.toFixed(1)}%`}</span>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <span className="text-xs text-slate-500 font-semibold block">COD Remitted Total</span>
          <span className="text-2xl font-bold text-indigo-600 mt-1 block">Rs {codRemittances.reduce((acc, item) => acc + item.amount, 0).toLocaleString('en-IN')}</span>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-black text-slate-900 uppercase tracking-wider font-display">{reportType} Data Table</h3>
          <span className="text-xs text-slate-500">Live records only</span>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          {reportType === 'ORDERS' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 uppercase text-slate-700 font-bold border-b border-slate-200"><tr><th className="p-3.5">Order ID</th><th className="p-3.5">Source</th><th className="p-3.5">Customer</th><th className="p-3.5">Pincode</th><th className="p-3.5">Value</th><th className="p-3.5">Status</th></tr></thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredOrders.map((order) => <tr key={order.id}><td className="p-3.5 font-mono font-bold">{order.external_order_id || order.id}</td><td className="p-3.5">{order.source}</td><td className="p-3.5">{order.customer?.name || order.shipping_address.name}</td><td className="p-3.5">{order.shipping_address.pincode}</td><td className="p-3.5 font-bold text-emerald-600">Rs {order.total_amount}</td><td className="p-3.5">{order.current_status}</td></tr>)}
              </tbody>
            </table>
          )}

          {reportType === 'COURIER_PERFORMANCE' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 uppercase text-slate-700 font-bold border-b border-slate-200"><tr><th className="p-3.5">Courier</th><th className="p-3.5">Shipments</th><th className="p-3.5">Delivery %</th><th className="p-3.5">NDR %</th><th className="p-3.5">Avg Cost</th></tr></thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {courierRows.map((row) => <tr key={row.courierName}><td className="p-3.5 font-bold">{row.courierName}</td><td className="p-3.5">{row.total}</td><td className="p-3.5 text-emerald-600 font-bold">{row.deliveryRate.toFixed(1)}%</td><td className="p-3.5 text-amber-600 font-bold">{row.ndrRate.toFixed(1)}%</td><td className="p-3.5">Rs {row.avgCost.toFixed(2)}</td></tr>)}
              </tbody>
            </table>
          )}

          {reportType === 'NDR' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 uppercase text-slate-700 font-bold border-b border-slate-200"><tr><th className="p-3.5">NDR ID</th><th className="p-3.5">AWB</th><th className="p-3.5">Reason</th><th className="p-3.5">Attempts</th><th className="p-3.5">Status</th></tr></thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredNdr.map((ndr) => <tr key={ndr.id}><td className="p-3.5 font-mono font-bold">{ndr.id}</td><td className="p-3.5">{ndr.shipment?.awb_number || ndr.shipment_id}</td><td className="p-3.5">{ndr.reason}</td><td className="p-3.5">{ndr.attempt_count}</td><td className="p-3.5">{ndr.status}</td></tr>)}
              </tbody>
            </table>
          )}

          {reportType === 'FINANCE' && (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 uppercase text-slate-700 font-bold border-b border-slate-200"><tr><th className="p-3.5">Ref ID</th><th className="p-3.5">Type</th><th className="p-3.5">Amount</th><th className="p-3.5">Direction</th><th className="p-3.5">Description</th><th className="p-3.5">Timestamp</th></tr></thead>
              <tbody className="divide-y divide-slate-100 font-medium text-slate-800">
                {filteredLedger.map((entry) => <tr key={entry.id}><td className="p-3.5 font-mono">{entry.reference_id}</td><td className="p-3.5">{entry.type}</td><td className={`p-3.5 font-bold ${entry.direction === 'CREDIT' ? 'text-emerald-600' : 'text-rose-600'}`}>{entry.direction === 'CREDIT' ? '+' : '-'}Rs {entry.amount}</td><td className="p-3.5">{entry.direction}</td><td className="p-3.5">{entry.description}</td><td className="p-3.5">{new Date(entry.created_at).toLocaleString('en-IN')}</td></tr>)}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};
