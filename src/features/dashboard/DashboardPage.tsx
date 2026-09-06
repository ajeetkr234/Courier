import React from 'react';
import { Link } from 'react-router-dom';
import { 
  ShoppingBag, Truck, CheckCircle2, Clock, AlertTriangle, 
  RotateCcw, Scale, Wallet, ArrowUpRight, TrendingUp, RefreshCw 
} from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { Button } from '../../components/ui/Button';
import { StatusBadge } from '../../components/ui/Badge';
import { usePlatformStore } from '../../services/store';
import { Order } from '../../types';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';

export const DashboardPage: React.FC = () => {
  const { walletBalance, orders, shipments, ndrCases, weightDiscrepancies, codRemittances } = usePlatformStore();

  const ordersToday = orders.slice(0, 8);
  const readyToShip = orders.filter((o: Order) => o.current_status === 'READY_TO_SHIP').length;
  const inTransit = orders.filter((o: Order) => o.current_status === 'IN_TRANSIT').length;
  const delivered = orders.filter((o: Order) => o.current_status === 'DELIVERED').length;
  const ndrCount = ndrCases.length;
  const disputeCount = weightDiscrepancies.length;

  const totalCODPending = codRemittances
    .filter((c) => c.status === 'PENDING')
    .reduce((acc, c) => acc + c.amount, 0);

  const trendData = [
    { day: 'Mon', orders: 12, revenue: 14400 },
    { day: 'Tue', orders: 18, revenue: 21600 },
    { day: 'Wed', orders: 25, revenue: 31000 },
    { day: 'Thu', orders: 22, revenue: 27500 },
    { day: 'Fri', orders: 30, revenue: 41200 },
    { day: 'Sat', orders: 28, revenue: 38900 },
    { day: 'Sun', orders: 35, revenue: 49800 },
  ];

  const courierShare = [
    { name: 'Delhivery', value: 45, color: '#6366f1' },
    { name: 'Xpressbees', value: 30, color: '#06b6d4' },
    { name: 'Ecom Express', value: 15, color: '#10b981' },
    { name: 'Shadowfax', value: 10, color: '#f59e0b' },
  ];

  return (
    <div className="w-full space-y-6 pb-16 text-slate-900 font-sans">
      {/* Page Title */}
      <div className="space-y-1">
        <h1 className="text-2xl font-black text-slate-900 font-display tracking-tight">
          Seller Analytics Dashboard
        </h1>
        <p className="text-xs text-slate-500 font-medium">
          Real-time metrics, revenue analytics, carrier distribution &amp; order fulfillment SLAs.
        </p>
      </div>

      {/* Alert Banner */}
      {(ndrCount > 0 || disputeCount > 0) && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h4 className="text-xs font-extrabold text-amber-900 uppercase tracking-wider font-display">Operational Attention Required</h4>
              <p className="text-xs text-amber-800 font-medium">
                You have <strong className="text-amber-950 font-black">{ndrCount} NDR case</strong> needing buyer confirmation and <strong className="text-amber-950 font-black">{disputeCount} weight dispute</strong> awaiting evidence.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link to="/app/ndr">
              <Button size="sm" variant="outline" className="border-amber-300 text-amber-900 hover:bg-amber-100 font-bold text-xs">
                Resolve NDR
              </Button>
            </Link>
            <Link to="/app/weight-disputes">
              <Button size="sm" variant="outline" className="border-amber-300 text-amber-900 hover:bg-amber-100 font-bold text-xs">
                View Disputes
              </Button>
            </Link>
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Orders Today"
          value={orders.length}
          subtitle="+18.5% vs yesterday"
          icon={<ShoppingBag className="w-5 h-5 text-indigo-600" />}
          trend={{ value: '+18.5%', isPositive: true }}
          variant="indigo"
        />
        <StatCard
          title="Ready To Ship"
          value={readyToShip}
          subtitle="Pending courier allocation"
          icon={<Clock className="w-5 h-5 text-amber-600" />}
          variant="amber"
        />
        <StatCard
          title="In Transit"
          value={inTransit}
          subtitle="Across 4 carrier networks"
          icon={<Truck className="w-5 h-5 text-sky-600" />}
        />
        <StatCard
          title="Delivered SLA"
          value={delivered}
          subtitle="98.2% on-time delivery"
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-600" />}
          variant="emerald"
        />
      </div>

      {/* Financial Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Wallet Balance</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-200">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-emerald-600 font-display">
              ₹{walletBalance.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">Available for instant label printing</p>
          </div>
          <Link to="/app/wallet" className="block pt-1">
            <Button size="sm" variant="outline" className="w-full justify-center font-bold text-slate-800">
              Recharge Wallet
            </Button>
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending COD</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-200">
              <RefreshCw className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-amber-600 font-display">
              ₹{(totalCODPending || 2899).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-1">Collected by couriers, pending payout</p>
          </div>
          <Link to="/app/cod" className="block pt-1">
            <Button size="sm" variant="outline" className="w-full justify-center font-bold text-slate-800">
              View Remittances
            </Button>
          </Link>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4 hover:border-indigo-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Next Settlement Date</span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center border border-indigo-200">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div>
            <h3 className="text-3xl font-black text-slate-900 font-display">29 Aug 2026</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">Estimated payout: <span className="font-bold text-slate-900 font-mono">₹2,899.00</span></p>
          </div>
          <Link to="/app/cod" className="block pt-1">
            <Button size="sm" variant="outline" className="w-full justify-center font-bold text-slate-800">
              Bank Account Info
            </Button>
          </Link>
        </div>
      </div>

      {/* Analytics Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Orders Trend Chart */}
        <div className="lg:col-span-8 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-wider font-display">Weekly Order &amp; Revenue Trend</h3>
              <p className="text-xs text-slate-500 font-medium">Order volume progression over the last 7 days</p>
            </div>
          </div>
          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={trendData}>
                <defs>
                  <linearGradient id="colorOrders" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="day" stroke="#64748b" fontSize={12} fontWeight={600} />
                <YAxis stroke="#64748b" fontSize={12} fontWeight={600} />
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', color: '#0f172a', fontWeight: 'bold', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
                <Area type="monotone" dataKey="orders" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorOrders)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Courier Share Pie Chart */}
        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <div>
            <h3 className="text-base font-black text-slate-900 uppercase tracking-wider font-display">Courier Carrier Share</h3>
            <p className="text-xs text-slate-500 font-medium">Distribution by carrier volume</p>
          </div>
          <div className="h-48 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={courierShare} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                  {courierShare.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '12px', color: '#0f172a', fontWeight: 'bold', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 text-xs pt-1">
            {courierShare.map((c) => (
              <div key={c.name} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                <span className="text-slate-800 font-bold">{c.name} ({c.value}%)</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Orders Table Snapshot */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 uppercase tracking-wider font-display">Recent Orders</h3>
            <p className="text-xs text-slate-500 font-medium">Latest order dispatches and current fulfillment status</p>
          </div>
          <Link to="/app/orders" className="text-xs font-extrabold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
            View All Orders <ArrowUpRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-100 uppercase tracking-wider text-slate-700 font-bold border-b border-slate-200">
              <tr>
                <th className="p-3.5">Order ID</th>
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Destination</th>
                <th className="p-3.5">Amount</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {ordersToday.map((ord: Order) => (
                <tr key={ord.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3.5 font-mono font-bold text-slate-900">{ord.external_order_id || ord.id}</td>
                  <td className="p-3.5 font-bold text-slate-800">{ord.customer?.name || ord.shipping_address.name}</td>
                  <td className="p-3.5 text-slate-600">{ord.shipping_address.city}, {ord.shipping_address.state}</td>
                  <td className="p-3.5 font-bold text-emerald-700 font-mono">₹{ord.total_amount} ({ord.payment_type})</td>
                  <td className="p-3.5"><StatusBadge status={ord.current_status} /></td>
                  <td className="p-3.5 text-right">
                    <Link to={`/app/orders/${ord.id}`}>
                      <Button size="sm" variant="outline" className="text-xs">View</Button>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
