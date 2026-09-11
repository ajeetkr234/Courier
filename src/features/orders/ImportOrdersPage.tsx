import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, CheckCircle2, FileSpreadsheet, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '../../components/ui/Button';
import { usePlatformStore } from '../../services/store';

type ParsedRow = {
  externalOrderId: string;
  name: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  amount: number;
  payment: 'PREPAID' | 'COD';
  sku: string;
  itemName: string;
  quantity: number;
  weightKg: number;
  status: 'VALID' | 'INVALID';
  error?: string;
};

const splitCsvLine = (line: string) => {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];
    if (char === '"' && next === '"') {
      current += '"';
      index += 1;
    } else if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      cells.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }

  cells.push(current.trim());
  return cells;
};

const firstValue = (record: Record<string, string>, keys: string[]) => {
  for (const key of keys) {
    const value = record[key];
    if (value) return value.trim();
  }
  return '';
};

const parseCsv = (csv: string): ParsedRow[] => {
  const lines = csv.split(/\r?\n/).filter((line) => line.trim().length > 0);
  if (lines.length < 2) return [];

  const headers = splitCsvLine(lines[0]).map((header) => header.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, ''));

  return lines.slice(1).map((line, index) => {
    const values = splitCsvLine(line);
    const record = headers.reduce<Record<string, string>>((acc, header, headerIndex) => {
      acc[header] = values[headerIndex] || '';
      return acc;
    }, {});

    const name = firstValue(record, ['name', 'customer_name', 'buyer_name', 'shipping_name']);
    const phone = firstValue(record, ['phone', 'mobile', 'customer_phone', 'buyer_phone', 'shipping_phone']);
    const pincode = firstValue(record, ['pincode', 'pin', 'zipcode', 'zip', 'shipping_pincode']);
    const amount = Number(firstValue(record, ['amount', 'total', 'total_amount', 'order_value', 'price'])) || 0;
    const paymentRaw = firstValue(record, ['payment', 'payment_type', 'payment_mode']).toUpperCase();
    const payment = paymentRaw === 'COD' ? 'COD' : 'PREPAID';
    const sku = firstValue(record, ['sku', 'product_sku', 'item_sku']) || `CSV-ROW-${index + 1}`;
    const itemName = firstValue(record, ['item', 'item_name', 'product', 'product_name']) || 'Imported item';
    const quantity = Number(firstValue(record, ['quantity', 'qty'])) || 1;
    const weightKg = Number(firstValue(record, ['weight', 'weight_kg', 'dead_weight'])) || 0.5;
    const address = firstValue(record, ['address', 'address_line1', 'shipping_address']);
    const city = firstValue(record, ['city', 'shipping_city']);
    const state = firstValue(record, ['state', 'shipping_state']);
    const externalOrderId = firstValue(record, ['external_order_id', 'order_id', 'order_number', 'id']) || `CSV-${Date.now()}-${index + 1}`;

    const errors = [
      !name ? 'customer name missing' : '',
      !phone ? 'phone missing' : '',
      !/^\d{6}$/.test(pincode) ? 'valid 6 digit pincode missing' : '',
      amount <= 0 ? 'amount missing' : '',
    ].filter(Boolean);

    return {
      externalOrderId,
      name,
      phone,
      address,
      city,
      state,
      pincode,
      amount,
      payment,
      sku,
      itemName,
      quantity,
      weightKg,
      status: errors.length === 0 ? 'VALID' : 'INVALID',
      error: errors.join(', '),
    };
  });
};

export const ImportOrdersPage: React.FC = () => {
  const navigate = useNavigate();
  const { bulkImportOrders, currentSeller, warehouses } = usePlatformStore();

  const [step, setStep] = useState<'UPLOAD' | 'MAP' | 'IMPORTING' | 'DONE'>('UPLOAD');
  const [fileName, setFileName] = useState('');
  const [progress, setProgress] = useState(0);
  const [parsedRows, setParsedRows] = useState<ParsedRow[]>([]);
  const [importedCount, setImportedCount] = useState(0);
  const validRows = useMemo(() => parsedRows.filter((row) => row.status === 'VALID'), [parsedRows]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.name.toLowerCase().endsWith('.csv')) {
      toast.error('Please upload a CSV file. XLSX import needs a server/parser integration.');
      return;
    }

    const text = await file.text();
    const rows = parseCsv(text);
    setFileName(file.name);
    setParsedRows(rows);
    setStep('MAP');
    toast.success(`${rows.length} rows parsed from ${file.name}`);
  };

  const startImporting = () => {
    const activeSellerId = currentSeller?.id || '32d724db-23c4-4cba-a76f-f78e4022194e';

    if (!warehouses[0]?.id) {
      toast.error('Please add a pickup warehouse before importing orders');
      return;
    }
    if (validRows.length === 0) {
      toast.error('No valid rows available to import');
      return;
    }

    setStep('IMPORTING');
    setProgress(30);

    const count = bulkImportOrders(validRows.map((row) => ({
      seller_id: activeSellerId,
      warehouse_id: warehouses[0].id,
      customer_id: '',
      external_order_id: row.externalOrderId,
      source: 'CSV',
      payment_type: row.payment,
      cod_amount: row.payment === 'COD' ? row.amount : 0,
      total_amount: row.amount,
      weight_kg: row.weightKg,
      shipping_address: {
        name: row.name,
        phone: row.phone,
        address_line1: row.address || 'Imported address',
        city: row.city || 'Unknown',
        state: row.state || 'Unknown',
        pincode: row.pincode,
      },
      items: [{
        id: '',
        order_id: '',
        sku: row.sku,
        name: row.itemName,
        quantity: row.quantity,
        unit_price: row.amount,
      }],
      current_status: 'NEW',
    })));

    setProgress(80);
    setImportedCount(count);
    setProgress(100);
    setStep('DONE');
    toast.success(`${count} orders imported into database`);
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
        <button onClick={() => navigate('/app/orders')} className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Back to Orders
        </button>
        <h2 className="text-base font-extrabold text-slate-900 font-display">Bulk Import Orders (CSV)</h2>
      </div>

      {step === 'UPLOAD' && (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 hover:border-indigo-500 text-center space-y-4 cursor-pointer relative shadow-sm">
          <input type="file" accept=".csv" onChange={handleFileUpload} className="absolute inset-0 opacity-0 cursor-pointer" />
          <FileSpreadsheet className="w-12 h-12 text-indigo-600 mx-auto" />
          <div>
            <h3 className="text-base font-black text-slate-900 font-display">Upload real order CSV</h3>
            <p className="text-xs text-slate-500 font-medium mt-1">Accepted columns: order_id, name, phone, pincode, amount, payment, sku, item_name, quantity, address, city, state.</p>
          </div>
          <Button size="sm" variant="outline" className="text-xs font-bold">Browse CSV</Button>
        </div>
      )}

      {step === 'MAP' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900 uppercase tracking-wider font-display">Review Uploaded Data</h3>
              <p className="text-xs text-slate-500 font-medium">File: {fileName} ({parsedRows.length} rows, {validRows.length} valid)</p>
            </div>
            <Button size="sm" onClick={startImporting} className="font-bold">Import Valid Rows</Button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-slate-200">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100 uppercase font-bold text-slate-700 border-b border-slate-200">
                <tr>
                  <th className="p-3.5">Order ID</th>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Phone</th>
                  <th className="p-3.5">Pincode</th>
                  <th className="p-3.5">Amount</th>
                  <th className="p-3.5">Payment</th>
                  <th className="p-3.5">Validation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {parsedRows.map((row, index) => (
                  <tr key={`${row.externalOrderId}-${index}`} className="hover:bg-slate-50 transition-colors">
                    <td className="p-3.5 font-mono font-bold text-slate-900">{row.externalOrderId}</td>
                    <td className="p-3.5 font-bold text-slate-800">{row.name || '-'}</td>
                    <td className="p-3.5 font-mono text-slate-600">{row.phone || '-'}</td>
                    <td className="p-3.5 font-mono font-bold text-slate-800">{row.pincode || '-'}</td>
                    <td className="p-3.5 font-black text-emerald-700 font-mono">Rs {row.amount.toLocaleString('en-IN')}</td>
                    <td className="p-3.5 uppercase font-bold text-slate-700">{row.payment}</td>
                    <td className="p-3.5">
                      {row.status === 'VALID' ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-800 font-extrabold text-xs border border-emerald-200">
                          Valid
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-800 font-extrabold text-xs border border-rose-200">
                          <AlertTriangle className="w-3 h-3" /> {row.error}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {step === 'IMPORTING' && (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
          <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
          <h3 className="text-base font-black text-slate-900 font-display">Importing orders into database...</h3>
          <div className="max-w-md mx-auto w-full bg-slate-100 border border-slate-200 h-3 rounded-full overflow-hidden">
            <div className="bg-indigo-600 h-full transition-all duration-300" style={{ width: `${progress}%` }} />
          </div>
          <p className="text-xs text-slate-500 font-bold">{progress}% complete</p>
        </div>
      )}

      {step === 'DONE' && (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 shadow-sm text-center space-y-4">
          <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
          <h3 className="text-xl font-black text-slate-900 font-display">Import Completed</h3>
          <p className="text-xs text-slate-600 font-medium">{importedCount} orders imported. {parsedRows.length - validRows.length} invalid rows skipped.</p>
          <Button onClick={() => navigate('/app/orders')} className="font-bold">View Orders Registry</Button>
        </div>
      )}
    </div>
  );
};
