import React, { useState, useMemo } from 'react';
import { Customer, Burger, CustomerAnalytics } from '../types';
import { calculateCustomerAnalytics } from '../utils/analytics';
import {
  Search,
  Filter,
  ArrowUpDown,
  MapPin,
  Phone,
  Cake,
  DollarSign,
  Calendar,
  Clock,
  Sparkles,
  PlusCircle,
  Eye,
  Send,
  AlertTriangle,
  ChevronRight,
  Download,
} from 'lucide-react';

interface ClientDirectoryProps {
  customers: Customer[];
  burgers: Burger[];
  onSelectCustomer: (customer: Customer) => void;
  onNewOrderForCustomer: (customer: Customer) => void;
  onLocateOnMap: (customer: Customer) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
}

type SortField = 'averageTicket' | 'totalSpent' | 'totalOrders' | 'daysSinceLastOrder' | 'name';
type SortOrder = 'asc' | 'desc';

export const ClientDirectory: React.FC<ClientDirectoryProps> = ({
  customers,
  burgers,
  onSelectCustomer,
  onNewOrderForCustomer,
  onLocateOnMap,
  searchQuery,
  setSearchQuery,
}) => {
  const [selectedBurger, setSelectedBurger] = useState<string>('all');
  const [selectedSegment, setSelectedSegment] = useState<string>('all');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('averageTicket');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const pageSize = 20;

  // Precompute analytics for each customer
  const customerAnalyticsMap = useMemo(() => {
    const map = new Map<string, CustomerAnalytics>();
    customers.forEach((c) => {
      map.set(c.id, calculateCustomerAnalytics(c, burgers));
    });
    return map;
  }, [customers, burgers]);

  // Zones
  const zones = useMemo(() => {
    const set = new Set<string>();
    customers.forEach((c) => {
      if (c.zone) set.add(c.zone);
    });
    return Array.from(set).sort();
  }, [customers]);

  // Filtered & Sorted
  const processedCustomers = useMemo(() => {
    let list = customers.filter((customer) => {
      const analytics = customerAnalyticsMap.get(customer.id);
      if (!analytics) return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matches =
          customer.name.toLowerCase().includes(q) ||
          customer.phone.includes(q) ||
          customer.email.toLowerCase().includes(q) ||
          customer.address.toLowerCase().includes(q) ||
          analytics.favoriteBurgerName.toLowerCase().includes(q);
        if (!matches) return false;
      }

      // Burger
      if (selectedBurger !== 'all' && analytics.favoriteBurgerId !== selectedBurger) {
        return false;
      }

      // Zone
      if (selectedZone !== 'all' && customer.zone !== selectedZone) {
        return false;
      }

      // Segment
      if (selectedSegment === 'vip' && analytics.customerSegment !== 'VIP High-Ticket') {
        return false;
      }
      if (selectedSegment === 'at-risk' && analytics.customerSegment !== 'En Riesgo (>35d)') {
        return false;
      }
      if (selectedSegment === 'frequent' && analytics.customerSegment !== 'Cliente Frecuente') {
        return false;
      }
      if (selectedSegment === 'birthday' && !analytics.isBirthdayThisMonth && analytics.daysUntilBirthday > 20) {
        return false;
      }

      return true;
    });

    // Sorting
    list.sort((a, b) => {
      const aStats = customerAnalyticsMap.get(a.id)!;
      const bStats = customerAnalyticsMap.get(b.id)!;

      let aVal: number | string = 0;
      let bVal: number | string = 0;

      if (sortField === 'averageTicket') {
        aVal = aStats.averageTicket;
        bVal = bStats.averageTicket;
      } else if (sortField === 'totalSpent') {
        aVal = aStats.totalSpent;
        bVal = bStats.totalSpent;
      } else if (sortField === 'totalOrders') {
        aVal = aStats.totalOrders;
        bVal = bStats.totalOrders;
      } else if (sortField === 'daysSinceLastOrder') {
        aVal = aStats.daysSinceLastOrder ?? 999;
        bVal = bStats.daysSinceLastOrder ?? 999;
      } else if (sortField === 'name') {
        return sortOrder === 'asc'
          ? a.name.localeCompare(b.name)
          : b.name.localeCompare(a.name);
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });

    return list;
  }, [
    customers,
    customerAnalyticsMap,
    searchQuery,
    selectedBurger,
    selectedSegment,
    selectedZone,
    sortField,
    sortOrder,
  ]);

  const totalPages = Math.ceil(processedCustomers.length / pageSize) || 1;
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return processedCustomers.slice(start, start + pageSize);
  }, [processedCustomers, currentPage, pageSize]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  // Export to CSV
  const exportCSV = () => {
    const headers = [
      'ID',
      'Nombre',
      'Telefono',
      'Email',
      'Direccion',
      'Zona',
      'Fecha_Nacimiento',
      'Ticket_Medio',
      'Total_Gastado',
      'Total_Pedidos',
      'Burger_Favorita',
      'Dia_Habitual',
      'Horario_Pico',
      'Dias_Sin_Pedir',
      'Segmento',
    ];

    const rows = processedCustomers.map((c) => {
      const stats = customerAnalyticsMap.get(c.id)!;
      return [
        c.id,
        `"${c.name}"`,
        `"${c.phone}"`,
        c.email,
        `"${c.address}"`,
        `"${c.zone}"`,
        c.birthDate,
        stats.averageTicket,
        stats.totalSpent,
        stats.totalOrders,
        `"${stats.favoriteBurgerName}"`,
        stats.peakDay,
        `"${stats.peakHourSlot}"`,
        stats.daysSinceLastOrder ?? '',
        `"${stats.customerSegment}"`,
      ].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `clientes_ghostburger_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
      {/* Top Filter Bar */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-4 shadow-lg space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <h1 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Directorio CRM de Clientes</span>
              <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs font-semibold">
                {processedCustomers.length} de {customers.length}
              </span>
            </h1>
            <p className="text-xs text-zinc-400 mt-0.5">
              Gestión individual de perfiles, ticket medio, preferencias de hamburguesa y patrones de consumo
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={exportCSV}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-medium rounded-lg border border-zinc-700 transition-colors"
              title="Descargar lista de clientes en formato CSV"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-zinc-800">
          {/* Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por nombre, tel, dirección..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-zinc-950 border border-zinc-700 text-xs rounded-xl pl-9 pr-3 py-2 text-white placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Burger Filter */}
          <div>
            <select
              value={selectedBurger}
              onChange={(e) => {
                setSelectedBurger(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-zinc-950 border border-zinc-700 text-xs rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">Todas las Hamburguesas Favoritas</option>
              {burgers.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>

          {/* Segment Filter */}
          <div>
            <select
              value={selectedSegment}
              onChange={(e) => {
                setSelectedSegment(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-zinc-950 border border-zinc-700 text-xs rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">Todos los Segmentos</option>
              <option value="vip">⭐ VIP High-Ticket (&gt; $22)</option>
              <option value="frequent">🔥 Cliente Frecuente (4+ pedidos)</option>
              <option value="at-risk">⚠️ En Riesgo (&gt; 35 días inactivo)</option>
              <option value="birthday">🎂 Cumpleañeros</option>
            </select>
          </div>

          {/* Zone Filter */}
          <div>
            <select
              value={selectedZone}
              onChange={(e) => {
                setSelectedZone(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-zinc-950 border border-zinc-700 text-xs rounded-xl px-3 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
            >
              <option value="all">Todas las Zonas ({zones.length})</option>
              {zones.map((z) => (
                <option key={z} value={z}>
                  {z}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* CRM Table */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-300">
            <thead className="bg-zinc-950/80 text-zinc-400 uppercase text-[10px] tracking-wider border-b border-zinc-800">
              <tr>
                <th
                  onClick={() => toggleSort('name')}
                  className="py-3 px-4 font-semibold cursor-pointer hover:text-white"
                >
                  <div className="flex items-center gap-1">
                    <span>Cliente & Contacto</span>
                    <ArrowUpDown className="w-3 h-3 text-zinc-500" />
                  </div>
                </th>
                <th className="py-3 px-3 font-semibold">Dirección & Zona</th>
                <th
                  onClick={() => toggleSort('averageTicket')}
                  className="py-3 px-3 font-semibold cursor-pointer hover:text-white text-right"
                >
                  <div className="flex items-center justify-end gap-1">
                    <span>Ticket Medio</span>
                    <ArrowUpDown className="w-3 h-3 text-emerald-400" />
                  </div>
                </th>
                <th
                  onClick={() => toggleSort('totalOrders')}
                  className="py-3 px-3 font-semibold cursor-pointer hover:text-white text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Pedidos</span>
                    <ArrowUpDown className="w-3 h-3 text-zinc-500" />
                  </div>
                </th>
                <th className="py-3 px-3 font-semibold">Burger Favorita</th>
                <th className="py-3 px-3 font-semibold">Día / Hora Habitual</th>
                <th
                  onClick={() => toggleSort('daysSinceLastOrder')}
                  className="py-3 px-3 font-semibold cursor-pointer hover:text-white text-center"
                >
                  <div className="flex items-center justify-center gap-1">
                    <span>Recencia</span>
                    <ArrowUpDown className="w-3 h-3 text-zinc-500" />
                  </div>
                </th>
                <th className="py-3 px-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/70">
              {paginatedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-zinc-500">
                    No se encontraron clientes con los filtros especificados.
                  </td>
                </tr>
              ) : (
                paginatedCustomers.map((customer) => {
                  const stats = customerAnalyticsMap.get(customer.id)!;
                  const burgerObj = burgers.find((b) => b.id === stats.favoriteBurgerId);

                  return (
                    <tr
                      key={customer.id}
                      className="hover:bg-zinc-800/40 transition-colors group"
                    >
                      {/* Customer Name & Contacts */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {customer.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-bold text-white text-xs group-hover:text-amber-400 transition-colors flex items-center gap-1.5">
                              <span>{customer.name}</span>
                              {stats.isBirthdayThisMonth && (
                                <Cake
                                  className="w-3 h-3 text-pink-400"
                                  title="Cumpleaños este mes"
                                />
                              )}
                            </div>
                            <div className="text-[11px] text-zinc-400 flex items-center gap-2 mt-0.5">
                              <span className="text-zinc-300">{customer.phone}</span>
                              <span className="text-zinc-600">•</span>
                              <span className="text-zinc-500 truncate max-w-[140px]">
                                {customer.email}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Address & Zone */}
                      <td className="py-3 px-3">
                        <div className="text-xs text-zinc-300 truncate max-w-[190px]">
                          {customer.address}
                        </div>
                        <span className="text-[10px] text-zinc-500 block">{customer.zone}</span>
                      </td>

                      {/* Ticket Medio */}
                      <td className="py-3 px-3 text-right">
                        <span className="font-bold text-sm text-emerald-400">
                          ${stats.averageTicket.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-zinc-500 block">
                          Total: ${stats.totalSpent.toFixed(0)}
                        </span>
                      </td>

                      {/* Pedidos */}
                      <td className="py-3 px-3 text-center">
                        <span className="font-semibold text-xs text-zinc-200 bg-zinc-800 px-2 py-0.5 rounded-full">
                          {stats.totalOrders}
                        </span>
                      </td>

                      {/* Burger Favorita */}
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: burgerObj?.markerColor || '#f59e0b' }}
                          />
                          <span className="font-medium text-xs text-zinc-200 truncate max-w-[140px]">
                            {stats.favoriteBurgerName}
                          </span>
                        </div>
                        <span className="text-[10px] text-zinc-500 block ml-4">
                          {stats.topProducts[0]?.percentage}% de preferencia
                        </span>
                      </td>

                      {/* Dia y Hora */}
                      <td className="py-3 px-3">
                        <div className="text-xs text-amber-300/90 font-medium">
                          {stats.peakDay}
                        </div>
                        <div className="text-[10px] text-zinc-500">
                          {stats.peakHourSlot.split(' ')[0]}
                        </div>
                      </td>

                      {/* Recencia */}
                      <td className="py-3 px-3 text-center">
                        {stats.daysSinceLastOrder !== null ? (
                          <span
                            className={`text-xs font-medium px-2 py-0.5 rounded-full ${
                              stats.daysSinceLastOrder > 35
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-zinc-800 text-zinc-400'
                            }`}
                          >
                            Hace {stats.daysSinceLastOrder}d
                          </span>
                        ) : (
                          <span className="text-zinc-600 text-xs">Sin pedidos</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Map pinpoint */}
                          <button
                            onClick={() => onLocateOnMap(customer)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                            title="Geolocalizar en el Mapa"
                          >
                            <MapPin className="w-3.5 h-3.5 text-orange-400" />
                          </button>

                          {/* Quick new order */}
                          <button
                            onClick={() => onNewOrderForCustomer(customer)}
                            className="p-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white transition-colors"
                            title="Registrar nuevo pedido"
                          >
                            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
                          </button>

                          {/* Profile detail */}
                          <button
                            onClick={() => onSelectCustomer(customer)}
                            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-xs font-semibold flex items-center gap-1 transition-colors"
                          >
                            <span>Ver Perfil</span>
                            <ChevronRight className="w-3 h-3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 bg-zinc-950/80 border-t border-zinc-800 flex items-center justify-between text-xs text-zinc-400">
          <div>
            Mostrando {Math.min(processedCustomers.length, (currentPage - 1) * pageSize + 1)} -{' '}
            {Math.min(processedCustomers.length, currentPage * pageSize)} de {processedCustomers.length}{' '}
            clientes
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Anterior
            </button>
            <span className="px-2 font-medium text-white">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Siguiente
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
