import React from 'react';
import {
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  AlertTriangle,
  Flame,
  Award,
} from 'lucide-react';
import { KitchenStats } from '../types';

interface StatsBarProps {
  stats: KitchenStats;
  onFilterAtRisk?: () => void;
  onFilterVip?: () => void;
}

export const StatsBar: React.FC<StatsBarProps> = ({ stats, onFilterAtRisk }) => {
  return (
    <div className="bg-zinc-900/90 border-b border-zinc-800/80 px-4 py-2.5">
      <div className="max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
        {/* Total Customers */}
        <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-2.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-zinc-400 font-medium truncate">Clientes CRM</p>
            <p className="text-sm font-bold text-white tracking-tight">
              {stats.totalCustomers}
              <span className="text-[10px] text-emerald-400 font-normal ml-1.5">
                {stats.activeCustomersCount} activos
              </span>
            </p>
          </div>
        </div>

        {/* Global Average Ticket */}
        <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-2.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-zinc-400 font-medium truncate">Ticket Medio</p>
            <p className="text-sm font-bold text-emerald-400 tracking-tight">
              ${stats.globalAverageTicket.toFixed(2)}
              <span className="text-[10px] text-zinc-400 font-normal ml-1">prom.</span>
            </p>
          </div>
        </div>

        {/* Total Orders */}
        <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-2.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0">
            <TrendingUp className="w-4 h-4 text-purple-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-zinc-400 font-medium truncate">Total Pedidos</p>
            <p className="text-sm font-bold text-white tracking-tight">
              {stats.totalOrders}
              <span className="text-[10px] text-zinc-400 font-normal ml-1">tickets</span>
            </p>
          </div>
        </div>

        {/* Top Burger */}
        <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-2.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center shrink-0">
            <Award className="w-4 h-4 text-amber-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-zinc-400 font-medium truncate">Burger Top #1</p>
            <p className="text-sm font-bold text-amber-300 truncate" title={stats.topSellingBurger.name}>
              {stats.topSellingBurger.name}
            </p>
          </div>
        </div>

        {/* Peak Hours */}
        <div className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-2.5 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/20 flex items-center justify-center shrink-0">
            <Flame className="w-4 h-4 text-orange-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-zinc-400 font-medium truncate">Horario Pico</p>
            <p className="text-xs font-bold text-orange-300 truncate">
              {stats.peakHours}
            </p>
          </div>
        </div>

        {/* At risk clients */}
        <div
          onClick={onFilterAtRisk}
          className="bg-zinc-950/60 border border-zinc-800 rounded-xl p-2.5 flex items-center gap-3 cursor-pointer hover:border-amber-600/40 transition-colors"
        >
          <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4 text-rose-400" />
          </div>
          <div className="min-w-0">
            <p className="text-[11px] text-zinc-400 font-medium truncate">En Riesgo (&gt;35d)</p>
            <p className="text-sm font-bold text-rose-400 tracking-tight">
              {stats.atRiskCustomersCount}
              <span className="text-[10px] text-zinc-400 font-normal ml-1">por reactivar</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
