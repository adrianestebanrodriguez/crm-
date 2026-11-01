import React, { useState, useMemo } from 'react';
import { Customer, Burger, Order, OrderItem } from '../types';
import {
  X,
  Plus,
  Minus,
  ShoppingBag,
  DollarSign,
  Search,
  CheckCircle2,
  Calendar,
  Clock,
  CreditCard,
  ChefHat,
  Sparkles,
} from 'lucide-react';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  customers: Customer[];
  initialCustomerId?: string | null;
  burgers: Burger[];
  onOrderCreated: (customerId: string, newOrder: Omit<Order, 'id'> & { id?: string }) => void;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({
  isOpen,
  onClose,
  customers,
  initialCustomerId,
  burgers,
  onOrderCreated,
}) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>(
    initialCustomerId || (customers[0]?.id || '')
  );
  const [customerSearch, setCustomerSearch] = useState<string>('');

  // Selected burger quantities: { burgerId: quantity }
  const [quantities, setQuantities] = useState<{ [burgerId: string]: number }>({
    b1: 0,
    b2: 0,
    b3: 0,
    b4: 0,
    b5: 0,
  });

  const [paymentMethod, setPaymentMethod] = useState<Order['paymentMethod']>('Tarjeta');
  const [notes, setNotes] = useState<string>('');

  // Auto generated ticket number
  const initialTicket = useMemo(
    () => `TK-${Math.floor(2000 + Math.random() * 7999)}`,
    [isOpen]
  );
  const [customTicket, setCustomTicket] = useState<string>(initialTicket);

  // Default to current local ISO date-time
  const now = new Date();
  const defaultDateTime = new Date(now.getTime() - now.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
  const [orderDateTime, setOrderDateTime] = useState<string>(defaultDateTime);

  // Sync initialCustomerId
  React.useEffect(() => {
    if (initialCustomerId) {
      setSelectedCustomerId(initialCustomerId);
    }
  }, [initialCustomerId]);

  if (!isOpen) return null;

  const currentCustomer = customers.find((c) => c.id === selectedCustomerId);

  // Filtered customer list for selection
  const searchedCustomers = customers
    .filter((c) => {
      if (!customerSearch.trim()) return true;
      const q = customerSearch.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        c.address.toLowerCase().includes(q)
      );
    })
    .slice(0, 6);

  const handleQtyChange = (burgerId: string, delta: number) => {
    setQuantities((prev) => {
      const current = prev[burgerId] || 0;
      const next = Math.max(0, current + delta);
      return { ...prev, [burgerId]: next };
    });
  };

  // Build items array and total
  const orderItems: OrderItem[] = [];
  let totalAmount = 0;
  burgers.forEach((b) => {
    const qty = quantities[b.id] || 0;
    if (qty > 0) {
      orderItems.push({
        burgerId: b.id,
        burgerName: b.name,
        quantity: qty,
        unitPrice: b.price,
      });
      totalAmount += b.price * qty;
    }
  });

  const totalBurgersCount = orderItems.reduce((acc, it) => acc + it.quantity, 0);

  // Projected new ticket medio preview
  const currentOrders = currentCustomer?.orders || [];
  const currentTotalSpent = currentOrders.reduce((sum, o) => sum + o.totalAmount, 0);
  const projectedNewTotalSpent = currentTotalSpent + totalAmount;
  const projectedNewCount = currentOrders.length + 1;
  const projectedAverageTicket =
    projectedNewCount > 0
      ? (projectedNewTotalSpent / projectedNewCount).toFixed(2)
      : '0.00';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) {
      alert('Por favor selecciona un cliente');
      return;
    }
    if (orderItems.length === 0) {
      alert('Por favor agrega al menos 1 hamburguesa al pedido');
      return;
    }

    const timestamp = new Date(orderDateTime).toISOString();

    onOrderCreated(selectedCustomerId, {
      id: customTicket || initialTicket,
      timestamp,
      items: orderItems,
      totalAmount: Number(totalAmount.toFixed(2)),
      paymentMethod,
      notes: notes.trim() || undefined,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900/90 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center shadow-md">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                Registrar Nuevo Pedido
              </h1>
              <p className="text-xs text-zinc-400">
                Cocina Oculta GhostBurger • Actualización de perfil y consumos en vivo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-5">
          {/* 1. Customer Selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 uppercase tracking-wider mb-1.5">
              1. Cliente para el pedido
            </label>

            {currentCustomer ? (
              <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-white">
                      {currentCustomer.name}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                      {currentCustomer.orders.length} pedidos previos
                    </span>
                  </div>
                  <div className="text-xs text-zinc-400 mt-0.5">
                    📞 {currentCustomer.phone} • 📍 {currentCustomer.address}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedCustomerId('')}
                  className="text-xs text-amber-400 hover:underline ml-2"
                >
                  Cambiar
                </button>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-zinc-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Buscar cliente por nombre, teléfono o dirección..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full bg-zinc-900 border border-zinc-700 text-sm rounded-xl pl-9 pr-3 py-2 text-white focus:outline-none focus:border-amber-500"
                  />
                </div>

                <div className="bg-zinc-900 border border-zinc-800 rounded-xl divide-y divide-zinc-800 max-h-40 overflow-y-auto">
                  {searchedCustomers.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => {
                        setSelectedCustomerId(c.id);
                        setCustomerSearch('');
                      }}
                      className="p-2.5 hover:bg-zinc-800/80 cursor-pointer flex items-center justify-between text-xs transition-colors"
                    >
                      <div>
                        <span className="font-semibold text-zinc-200 block">
                          {c.name}
                        </span>
                        <span className="text-zinc-500 text-[11px]">
                          {c.phone} • {c.address}
                        </span>
                      </div>
                      <span className="text-amber-400 font-medium">Seleccionar</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 2. Burger Selection (5 Types) */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
                2. Selección de Hamburguesas (5 tipos)
              </label>
              <span className="text-xs text-amber-400 font-medium">
                {totalBurgersCount} seleccionadas
              </span>
            </div>

            <div className="space-y-2">
              {burgers.map((burger) => {
                const qty = quantities[burger.id] || 0;

                return (
                  <div
                    key={burger.id}
                    className={`p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      qty > 0
                        ? 'bg-amber-500/10 border-amber-500/40 shadow-sm'
                        : 'bg-zinc-900/60 border-zinc-800/80 hover:border-zinc-700'
                    }`}
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: burger.markerColor }}
                        />
                        <span className="font-bold text-sm text-zinc-100">
                          {burger.name}
                        </span>
                        <span className="text-xs font-bold text-emerald-400 ml-1">
                          ${burger.price.toFixed(2)}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-400 truncate max-w-sm sm:max-w-md mt-0.5">
                        {burger.tagline}
                      </p>
                    </div>

                    {/* Counter Buttons */}
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={() => handleQtyChange(burger.id, -1)}
                        disabled={qty === 0}
                        className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-colors ${
                          qty > 0
                            ? 'bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700'
                            : 'bg-zinc-900 border-zinc-800 text-zinc-600 cursor-not-allowed'
                        }`}
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>

                      <span className="w-6 text-center font-bold text-sm text-white">
                        {qty}
                      </span>

                      <button
                        type="button"
                        onClick={() => handleQtyChange(burger.id, 1)}
                        className="w-7 h-7 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold flex items-center justify-center shadow transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 3. Ticket ID, Date & Payment */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">
                Nº de Ticket / Comanda
              </label>
              <input
                type="text"
                value={customTicket}
                onChange={(e) => setCustomTicket(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 text-xs rounded-lg px-2.5 py-2 font-mono text-amber-300 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">
                Fecha & Hora del Pedido
              </label>
              <input
                type="datetime-local"
                value={orderDateTime}
                onChange={(e) => setOrderDateTime(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 text-xs rounded-lg px-2.5 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
              />
            </div>

            <div>
              <label className="block text-[11px] text-zinc-400 mb-1">
                Método de Pago
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
                className="w-full bg-zinc-900 border border-zinc-700 text-xs rounded-lg px-2.5 py-2 text-zinc-200 focus:outline-none focus:border-amber-500"
              >
                <option value="Tarjeta">Tarjeta de Crédito / Débito</option>
                <option value="Efectivo">Efectivo contra entrega</option>
                <option value="Transferencia">Transferencia Bancaria</option>
                <option value="Online">Pago Online / Pasarela</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[11px] text-zinc-400 mb-1">
              Instrucciones para Cocina / Notas del Cliente (Opcional)
            </label>
            <input
              type="text"
              placeholder="Ej: Término 3/4, sin pepinillos, extra servilletas..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 text-xs rounded-lg px-3 py-2 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500"
            />
          </div>

          {/* Live Impact Preview */}
          {currentCustomer && totalAmount > 0 && (
            <div className="bg-gradient-to-r from-emerald-950/30 to-amber-950/30 border border-emerald-500/30 rounded-xl p-3.5 text-xs">
              <div className="flex items-center gap-1.5 text-emerald-400 font-bold mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Impacto en el perfil del cliente tras este pedido:</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-zinc-300 mt-1">
                <div>
                  • Total pedidos: <b>{currentCustomer.orders.length}</b> →{' '}
                  <span className="text-emerald-400 font-bold">
                    {projectedNewCount} tickets
                  </span>
                </div>
                <div>
                  • Nuevo Ticket Medio: <b>${projectedAverageTicket}</b> (recalculado
                  en vivo)
                </div>
              </div>
            </div>
          )}

          {/* Footer Submit */}
          <div className="pt-3 border-t border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-[11px] text-zinc-400 block">Total del Ticket:</span>
              <span className="text-2xl font-black text-emerald-400">
                ${totalAmount.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={orderItems.length === 0}
                className={`px-5 py-2.5 rounded-lg text-xs font-bold shadow-lg transition-all flex items-center gap-1.5 ${
                  orderItems.length > 0
                    ? 'bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white cursor-pointer active:scale-95'
                    : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Registrar Pedido & Actualizar Perfil</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
