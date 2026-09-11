import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  RefreshCw,
  ShoppingBag,
  Truck,
  Wallet,
} from 'lucide-react';
import { Area, AreaChart, CartesianGrid, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { usePlatformStore } from '../../services/store';

const startOfDay = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());
const sameDay = (iso: string, date: Date) => startOfDay(new Date(iso)).getTime() === startOfDay(date).getTime();

export const DashboardPage: React.FC = () => {
  const {
    walletBalance,
    orders,
    shipments,
    ndrCases,
    weightDiscrepancies,
    codRemittances,
    isLoadingData,
    loadSupabaseData,
  } = usePlatformStore();

  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const ordersToday = orders.filter((order) => sameDay(order.created_at, today));
  const ordersYesterday = orders.filter((order) => sameDay(order.created_at, yesterday));
  const orderTrend = ordersYesterday.length > 0
    ? ((ordersToday.length - ordersYesterday.length) / ordersYesterday.length) * 100
    : null;
  const readyToShip = orders.filter((order) => order.current_status === 'READY_TO_SHIP').length;
  const inTransit = shipments.filter((shipment) => ['PICKED_UP', 'IN_TRANSIT', 'OUT_FOR_DELIVERY'].includes(shipment.status)).length;
  const delivered = shipments.filter((shipment) => shipment.status === 'DELIVERED').length;
  const deliveryRate = shipments.length > 0 ? (delivered / shipments.length) * 100 : null;
  const actionableNdr = ndrCases.filter((item) => item.status === 'ACTION_REQUIRED').length;
  const actionableDisputes = weightDiscrepancies.filter((item) => ['PENDING', 'DISPUTED'].includes(item.status)).length;
  const pendingRemittances = codRemittances.filter((item) => item.status === 'PENDING');
  const pendingCod = pendingRemittances.reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const freightSpend = shipments.reduce((sum, shipment) => sum + Number(shipment.total_freight_charge ?? shipment.shipping_cost ?? 0), 0);

  const trendData = useMemo(() => {
    return Array.from({ length: 7 }, (_, index) => {
      const date = new Date();
      date.setHours(0, 0, 0, 0);
      date.setDate(date.getDate() - (6 - index));
      const dayOrders = orders.filter((order) => sameDay(order.created_at, date));
      return {
        date: date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short' }),
        orders: dayOrders.length,
        value: dayOrders.reduce((sum, order) => sum + Number(order.total_amount || 0), 0),
      };
    });
  }, [orders]);

  const courierShare = useMemo(() => {
    const counts = new Map<string, number>();
    shipments.forEach((shipment) => {
      const name = shipment.courier_name || shipment.courier_code || 'Unassigned';
      counts.set(name, (counts.get(name) || 0) + 1);
    });
    const colors = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#db2777', '#7c3aed'];
    return [...counts.entries()].map(([name, value], index) => ({ name, value, color: colors[index % colors.length] }));
  }, [shipments]);

  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at)).slice(0, 8),
    [orders],
  );

  return (
    <div className="w-full space-y-6 pb-16 text-slate-900">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-black tracking-tight font-display">Seller Analytics Dashboard</h1>
          <p className="mt-1 text-xs font-medium text-slate-500">Metrics calculated from live orders, shipments, finance and exception records.</p>
        </div>
        <Button variant="outline" onClick={() => loadSupabaseData()} disabled={isLoadingData} className="text-xs font-bold">
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoadingData ? 'animate-spin' : ''}`} />
          {isLoadingData ? 'Refreshing' : 'Refresh data'}
        </Button>
      </div>

      {(actionableNdr > 0 || actionableDisputes > 0) && (
        <div className="flex flex-col items-start justify-between gap-4 rounded-2xl border border-amber-200 bg-amber-50 p-4 shadow-xs sm:flex-row sm:items-center">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-amber-600" />
            <div>
              <h2 className="text-xs font-extrabold uppercase tracking-wider text-amber-900">Operational attention required</h2>
              <p className="mt-1 text-xs font-medium text-amber-800">{actionableNdr} actionable NDR case(s) and {actionableDisputes} open weight dispute(s).</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Link to="/app/ndr"><Button size="sm" variant="outline" className="text-xs font-bold">Open NDR</Button></Link>
            <Link to="/app/weight-disputes"><Button size="sm" variant="outline" className="text-xs font-bold">Open disputes</Button></Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <Link to="/app/orders?tab=NEW" className="block cursor-pointer hover:scale-[1.01] transition-transform">
          <StatCard
            title="Orders today"
            value={isLoadingData ? '—' : ordersToday.length}
            subtitle={orderTrend === null ? 'No orders recorded yesterday' : `${Math.abs(orderTrend).toFixed(1)}% ${orderTrend >= 0 ? 'above' : 'below'} yesterday`}
            trend={orderTrend === null ? undefined : { value: `${orderTrend >= 0 ? '+' : ''}${orderTrend.toFixed(1)}%`, isPositive: orderTrend >= 0 }}
            icon={<ShoppingBag className="h-5 w-5 text-indigo-600" />}
            variant="indigo"
          />
        </Link>
        <Link to="/app/orders?tab=READY_TO_SHIP" className="block cursor-pointer hover:scale-[1.01] transition-transform">
          <StatCard title="Ready to ship" value={isLoadingData ? '—' : readyToShip} subtitle="Orders awaiting shipment" icon={<Clock className="h-5 w-5 text-amber-600" />} variant="amber" />
        </Link>
        <Link to="/app/shipments?status=IN_TRANSIT" className="block cursor-pointer hover:scale-[1.01] transition-transform">
          <StatCard title="In transit" value={isLoadingData ? '—' : inTransit} subtitle="Active shipment records" icon={<Truck className="h-5 w-5 text-sky-600" />} />
        </Link>
        <Link to="/app/shipments?status=DELIVERED" className="block cursor-pointer hover:scale-[1.01] transition-transform">
          <StatCard title="Delivered" value={isLoadingData ? '—' : delivered} subtitle={deliveryRate === null ? 'No shipment records' : `${deliveryRate.toFixed(1)}% of all shipments`} icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />} variant="emerald" />
        </Link>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          { label: 'Wallet balance', value: walletBalance, detail: 'Current balance from wallet record', icon: Wallet, color: 'text-emerald-600', path: '/app/wallet', action: 'View wallet' },
          { label: 'Pending COD', value: pendingCod, detail: `${pendingRemittances.length} pending remittance record(s)`, icon: RefreshCw, color: 'text-amber-600', path: '/app/cod', action: 'View remittances' },
          { label: 'Recorded freight spend', value: freightSpend, detail: `Across ${shipments.length} shipment record(s)`, icon: Truck, color: 'text-indigo-600', path: '/app/shipments', action: 'View shipments' },
        ].map(({ label, value, detail, icon: Icon, color, path, action }) => (
          <div key={label} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span><Icon className={`h-5 w-5 ${color}`} /></div>
            <div><div className={`text-3xl font-black font-display ${color}`}>{isLoadingData ? '—' : `₹${value.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`}</div><p className="mt-1 text-xs font-medium text-slate-500">{detail}</p></div>
            <Link to={path} className="block"><Button size="sm" variant="outline" className="w-full justify-center text-xs font-bold">{action}</Button></Link>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-8">
          <div><h2 className="text-base font-black uppercase tracking-wider font-display">Last 7 days</h2><p className="mt-1 text-xs font-medium text-slate-500">Orders grouped by their actual creation date.</p></div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs><linearGradient id="ordersFill" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3} /><stop offset="95%" stopColor="#4f46e5" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" /><XAxis dataKey="date" fontSize={11} stroke="#64748b" /><YAxis allowDecimals={false} fontSize={11} stroke="#64748b" />
                <Tooltip formatter={(value, name) => name === 'value' ? [`₹${Number(value).toLocaleString('en-IN')}`, 'Order value'] : [value, 'Orders']} />
                <Area type="monotone" dataKey="orders" stroke="#4f46e5" strokeWidth={3} fill="url(#ordersFill)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </section>

        <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-4">
          <div><h2 className="text-base font-black uppercase tracking-wider font-display">Courier share</h2><p className="mt-1 text-xs font-medium text-slate-500">Actual shipment count by courier.</p></div>
          {courierShare.length === 0 ? (
            <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-300 text-center text-xs font-medium text-slate-500">No shipment data available.</div>
          ) : (
            <><div className="h-48"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={courierShare} innerRadius={48} outerRadius={70} paddingAngle={3} dataKey="value">{courierShare.map((item) => <Cell key={item.name} fill={item.color} />)}</Pie><Tooltip /></PieChart></ResponsiveContainer></div>
            <div className="grid grid-cols-2 gap-2 text-xs">{courierShare.map((item) => <div key={item.name} className="flex items-center gap-2"><span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: item.color }} /><span className="truncate font-bold text-slate-700">{item.name} ({item.value})</span></div>)}</div></>
          )}
        </section>
      </div>

      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between"><div><h2 className="text-base font-black uppercase tracking-wider font-display">Recent orders</h2><p className="mt-1 text-xs font-medium text-slate-500">Latest live order records.</p></div><Link to="/app/orders" className="flex items-center gap-1 text-xs font-extrabold text-indigo-600">View all <ArrowUpRight className="h-4 w-4" /></Link></div>
        {recentOrders.length === 0 ? <div className="rounded-xl border border-dashed border-slate-300 py-10 text-center text-xs font-medium text-slate-500">No orders available.</div> : (
          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-200 bg-slate-100 font-bold uppercase tracking-wider text-slate-700">
                <tr>
                  <th className="p-3.5">Order ID</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Destination</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Created</th>
                  <th className="p-3.5">Status</th>
                  <th className="p-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {recentOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-mono font-bold">{order.external_order_id || order.id}</td>
                    <td className="p-3.5 font-bold">{order.customer?.name || order.shipping_address?.name || '—'}</td>
                    <td className="p-3.5 text-slate-600">{[order.shipping_address?.city, order.shipping_address?.state].filter(Boolean).join(', ') || '—'}</td>
                    <td className="p-3.5 font-mono font-bold text-emerald-700">₹{Number(order.total_amount).toLocaleString('en-IN')} ({order.payment_type})</td>
                    <td className="p-3.5 text-slate-600">{new Date(order.created_at).toLocaleString('en-IN')}</td>
                    <td className="p-3.5"><StatusBadge status={order.current_status} /></td>
                    <td className="p-3.5 text-right">
                      {(order.current_status === 'NEW' || order.current_status === 'CONFIRMED') ? (
                        <Link to={`/app/orders?shipOrderId=${order.id}`}>
                          <Button size="sm" className="text-xs font-bold py-1 px-2.5 h-7">
                            Ship Now
                          </Button>
                        </Link>
                      ) : (
                        <Link to="/app/shipments">
                          <Button size="sm" variant="outline" className="text-xs font-bold py-1 px-2.5 h-7">
                            Shipment
                          </Button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
};
