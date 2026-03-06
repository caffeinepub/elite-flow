import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  Loader2,
  PiggyBank,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import {
  EntryType,
  useAddCashflowEntry,
  useGetCashflowSummary,
} from "../hooks/useQueries";
import { formatINR } from "../lib/helpers";

function DonutChart({
  savings,
  expenses,
  investments,
}: { savings: number; expenses: number; investments: number }) {
  const total = savings + expenses + investments;
  if (total === 0)
    return (
      <div className="flex items-center justify-center w-32 h-32">
        <div className="w-28 h-28 rounded-full border-4 border-border flex items-center justify-center">
          <BarChart3 className="w-8 h-8 text-muted-foreground/30" />
        </div>
      </div>
    );

  const expPct = (expenses / total) * 100;
  const invPct = (investments / total) * 100;
  const savPct = (savings / total) * 100;

  // SVG donut chart
  const cx = 60;
  const cy = 60;
  const r = 50;
  const strokeWidth = 12;
  const circumference = 2 * Math.PI * r;

  const segments = [
    { pct: savPct, color: "oklch(0.67 0.17 152)", label: "Savings" },
    { pct: invPct, color: "oklch(0.58 0.18 264)", label: "Investments" },
    { pct: expPct, color: "oklch(0.62 0.22 30)", label: "Expenses" },
  ];

  let offset = 0;
  const paths = segments.map((seg) => {
    const dashArray = (seg.pct / 100) * circumference;
    const path = (
      <circle
        key={seg.label}
        cx={cx}
        cy={cy}
        r={r}
        fill="none"
        stroke={seg.color}
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        strokeDashoffset={circumference - dashArray}
        strokeLinecap="round"
        transform={`rotate(${offset * 3.6 - 90} ${cx} ${cy})`}
        style={{ transition: "stroke-dashoffset 0.6s ease" }}
      />
    );
    offset += seg.pct;
    return path;
  });

  return (
    <div className="flex items-center gap-4">
      <svg
        width="120"
        height="120"
        viewBox="0 0 120 120"
        role="img"
        aria-label="Cashflow breakdown donut chart"
      >
        <circle
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="oklch(var(--secondary))"
          strokeWidth={strokeWidth}
        />
        {paths}
        <text
          x={cx}
          y={cy - 4}
          textAnchor="middle"
          className="text-xs"
          fill="oklch(var(--foreground))"
          fontSize="10"
          fontWeight="600"
        >
          {Math.round(savPct)}%
        </text>
        <text
          x={cx}
          y={cy + 8}
          textAnchor="middle"
          fill="oklch(var(--muted-foreground))"
          fontSize="8"
        >
          saved
        </text>
      </svg>
      <div className="space-y-1.5">
        {segments.map((s) => (
          <div key={s.label} className="flex items-center gap-2 text-xs">
            <div
              className="w-2.5 h-2.5 rounded-full flex-shrink-0"
              style={{ background: s.color }}
            />
            <span className="text-muted-foreground">{s.label}</span>
            <span className="font-semibold ml-auto">{Math.round(s.pct)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface EntryFormProps {
  entryType: EntryType;
  onSubmit: (label: string, amount: number, date: string) => Promise<void>;
  isPending: boolean;
}

function EntryForm({ entryType, onSubmit, isPending }: EntryFormProps) {
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amt = Number.parseFloat(amount);
    if (!label.trim() || Number.isNaN(amt) || amt <= 0) return;
    await onSubmit(label.trim(), amt, date);
    setLabel("");
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
  };

  const placeholders: Record<EntryType, string> = {
    [EntryType.income]: "e.g. Freelance payment",
    [EntryType.expense]: "e.g. Groceries",
    [EntryType.investment]: "e.g. Mutual fund SIP",
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 pt-2">
      <div className="space-y-1.5">
        <Label className="text-xs">Description</Label>
        <Input
          placeholder={placeholders[entryType]}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          className="h-9"
          data-ocid="cashflow.label_input"
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Amount (₹)</Label>
          <Input
            type="number"
            placeholder="0"
            min="0"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="h-9"
            data-ocid="cashflow.amount_input"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Date</Label>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-9"
          />
        </div>
      </div>
      <Button
        type="submit"
        className="w-full h-9"
        disabled={!label.trim() || !amount || isPending}
        data-ocid="cashflow.submit_button"
      >
        {isPending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
          </>
        ) : (
          `Add ${entryType}`
        )}
      </Button>
    </form>
  );
}

export default function CashflowSystem() {
  const { data: summary, isLoading } = useGetCashflowSummary();
  const addEntry = useAddCashflowEntry();

  const makeSubmitHandler =
    (entryType: EntryType) =>
    async (label: string, amount: number, date: string) => {
      try {
        await addEntry.mutateAsync({
          entryType,
          entryLabel: label,
          amount,
          date: BigInt(new Date(date).getTime()),
        });
        toast.success(
          `${entryType.charAt(0).toUpperCase() + entryType.slice(1)} added!`,
        );
      } catch {
        toast.error(`Failed to add ${entryType}`);
      }
    };

  const totalIncome = summary?.totalIncome ?? 0;
  const totalExpenses = summary?.totalExpenses ?? 0;
  const totalInvestments = summary?.totalInvestments ?? 0;
  const savings = summary?.savings ?? 0;

  return (
    <div className="flex flex-col h-full">
      <div className="mb-4">
        <h3 className="font-display font-bold text-lg">Cashflow System</h3>
        <p className="text-sm text-muted-foreground">Track your money flow</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        {[
          {
            label: "Income",
            value: totalIncome,
            icon: TrendingUp,
            color: "text-emerald",
            bg: "bg-emerald/10",
            border: "border-emerald/20",
          },
          {
            label: "Expenses",
            value: totalExpenses,
            icon: TrendingDown,
            color: "text-ember",
            bg: "bg-ember/10",
            border: "border-ember/20",
          },
          {
            label: "Invested",
            value: totalInvestments,
            icon: BarChart3,
            color: "text-primary",
            bg: "bg-primary/10",
            border: "border-primary/20",
          },
          {
            label: "Savings",
            value: savings,
            icon: PiggyBank,
            color: "text-emerald",
            bg: "bg-emerald/10",
            border: "border-emerald/20",
          },
        ].map(({ label, value, icon: Icon, color, bg, border }) => (
          <div key={label} className={`p-3 rounded-xl ${bg} border ${border}`}>
            <div className={`flex items-center gap-1.5 ${color} mb-1`}>
              <Icon className="w-3.5 h-3.5" />
              <span className="text-xs font-medium">{label}</span>
            </div>
            {isLoading ? (
              <div className="h-5 w-20 bg-muted rounded animate-pulse" />
            ) : (
              <div className={`text-sm font-bold ${color}`}>
                {formatINR(value)}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="p-3 rounded-xl bg-secondary/50 border border-border mb-4">
        <DonutChart
          savings={savings > 0 ? savings : 0}
          expenses={totalExpenses}
          investments={totalInvestments}
        />
      </div>

      {/* Entry tabs */}
      <Tabs defaultValue="income" className="flex-1">
        <TabsList className="grid grid-cols-3 h-9">
          <TabsTrigger
            value="income"
            className="text-xs"
            data-ocid="cashflow.income_tab"
          >
            Income
          </TabsTrigger>
          <TabsTrigger
            value="expense"
            className="text-xs"
            data-ocid="cashflow.expense_tab"
          >
            Expense
          </TabsTrigger>
          <TabsTrigger
            value="investment"
            className="text-xs"
            data-ocid="cashflow.investment_tab"
          >
            Investment
          </TabsTrigger>
        </TabsList>
        <TabsContent value="income">
          <EntryForm
            entryType={EntryType.income}
            onSubmit={makeSubmitHandler(EntryType.income)}
            isPending={addEntry.isPending}
          />
        </TabsContent>
        <TabsContent value="expense">
          <EntryForm
            entryType={EntryType.expense}
            onSubmit={makeSubmitHandler(EntryType.expense)}
            isPending={addEntry.isPending}
          />
        </TabsContent>
        <TabsContent value="investment">
          <EntryForm
            entryType={EntryType.investment}
            onSubmit={makeSubmitHandler(EntryType.investment)}
            isPending={addEntry.isPending}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
