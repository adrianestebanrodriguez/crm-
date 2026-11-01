import React, { useState } from 'react';
import {
  Customer,
  Burger,
  CustomerAnalytics,
  PromotionRecommendation,
} from '../types';
import {
  X,
  Phone,
  Mail,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  TrendingUp,
  ShoppingBag,
  Sparkles,
  Send,
  Copy,
  Check,
  PlusCircle,
  Cake,
  AlertCircle,
  Receipt,
  Utensils,
} from 'lucide-react';

interface CustomerDetailModalProps {
  customer: Customer | null;
  analytics: CustomerAnalytics | null;
  burgers: Burger[];
  onClose: () => void;
  onNewOrder: (customer: Customer) => void;
}

const DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const DAYS_ORDER = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

export const CustomerDetailModal: React.FC<CustomerDetailModalProps> = ({
  customer,
  analytics,
  burgers,
  onClose,
  onNewOrder,
}) => {
  const [copiedPromoId, setCopiedPromoId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'perfil' | 'promociones' | 'pedidos'>('perfil');

  if (!customer || !analytics) return null;

  const handleCopyMessage = (promo: PromotionRecommendation) => {
    navigator.clipboard.writeText(promo.whatsappMessage);
    setCopiedPromoId(promo.id);
    setTimeout(() => setCopiedPromoId(null), 2500);
  };

  const handleSendWhatsApp = (promo: PromotionRecommendation) => {
    // Sanitize phone number (remove spaces, symbols)
    const cleanPhone = customer.phone.replace(/[^0-9]/g, '');
    const encodedMsg = encodeURIComponent(promo.whatsappMessage);
    const url = `https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encodedMsg}`;
    window.open(url, '_blank');
  };

  // Find max count for day frequency chart scaling
  const maxDayCount = Math.max(1, ...Object.values(analytics.dayFrequency));

  // Find max count for hour frequency chart scaling
  const relevantHours = [12, 13, 14, 15, 18, 19, 20, 21, 22, 23];
  const maxHourCount = Math.max(
    1,
    ...relevantHours.map((h) => analytics.hourFrequency[h] || 0)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header Banner */}
        <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/40 p-5 border-b border-zinc-800 flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center font-bold text-xl text-zinc-950 shadow-lg border border-amber-400/40 shrink-0">
              {customer.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2.5 flex-wrap">
                <h1 className="text-xl font-bold text-white tracking-tight">{customer.name}</h1>
                <span
                  className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                    analytics.customerSegment === 'VIP High-Ticket'
                      ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                      : analytics.customerSegment === 'En Riesgo (>35d)'
                      ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                      : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                  }`}
                >
                  {analytics.customerSegment}
                </span>
                {analytics.isBirthdayThisMonth && (
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-pink-500/10 text-pink-400 border border-pink-500/20 flex items-center gap-1">
                    <Cake className="w-3 h-3" />
                    <span>Cumple este mes</span>
                  </span>
                )}
              </div>

              {/* Contact info row */}
              <div className="flex flex-wrap items-center gap-y-1 gap-x-4 mt-2 text-xs text-zinc-400">
                <span className="flex items-center gap-1 text-zinc-300">
                  <Phone className="w-3.5 h-3.5 text-amber-400" />
                  {customer.phone}
                </span>
                <span className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-zinc-500" />
                  {customer.email}
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-400" />
                  {customer.address}
                </span>
                <span className="flex items-center gap-1">
                  <Cake className="w-3.5 h-3.5 text-pink-400" />
                  Nacimiento: {customer.birthDate}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onNewOrder(customer)}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Registrar Pedido</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs inside modal */}
        <div className="flex border-b border-zinc-800 bg-zinc-900/60 px-5 text-xs font-medium">
          <button
            onClick={() => setActiveTab('perfil')}
            className={`py-3 px-4 border-b-2 font-semibold transition-colors ${
              activeTab === 'perfil'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            Perfil & Consumos
          </button>
          <button
            onClick={() => setActiveTab('promociones')}
            className={`py-3 px-4 border-b-2 font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'promociones'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Promociones Personalizadas ({analytics.recommendedPromotions.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('pedidos')}
            className={`py-3 px-4 border-b-2 font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'pedidos'
                ? 'border-amber-500 text-amber-400'
                : 'border-transparent text-zinc-400 hover:text-white'
            }`}
          >
            <Receipt className="w-3.5 h-3.5" />
            <span>Historial de Pedidos ({customer.orders.length})</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {/* TAB 1: PERFIL & CONSUMOS */}
          {activeTab === 'perfil' && (
            <div className="space-y-6">
              {/* 4 Key Metrics Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {/* Ticket Medio */}
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5">
                  <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
                    <span>Ticket Medio</span>
                    <DollarSign className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div className="text-xl font-bold text-emerald-400 tracking-tight">
                    ${analytics.averageTicket.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">
                    Gasto promedio por cada compra
                  </div>
                </div>

                {/* Total LTV */}
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5">
                  <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
                    <span>Total Gastado (LTV)</span>
                    <TrendingUp className="w-4 h-4 text-amber-400" />
                  </div>
                  <div className="text-xl font-bold text-amber-300 tracking-tight">
                    ${analytics.totalSpent.toFixed(2)}
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">
                    Facturación acumulada histórica
                  </div>
                </div>

                {/* Total Pedidos */}
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5">
                  <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
                    <span>Total Pedidos</span>
                    <ShoppingBag className="w-4 h-4 text-blue-400" />
                  </div>
                  <div className="text-xl font-bold text-white tracking-tight">
                    {analytics.totalOrders} tickets
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">
                    Frecuencia de reorden
                  </div>
                </div>

                {/* Último Pedido */}
                <div className="bg-zinc-900/80 border border-zinc-800 rounded-xl p-3.5">
                  <div className="flex items-center justify-between text-zinc-400 text-xs mb-1">
                    <span>Último Pedido</span>
                    <Clock className="w-4 h-4 text-orange-400" />
                  </div>
                  <div className="text-sm font-bold text-zinc-200 tracking-tight">
                    {analytics.daysSinceLastOrder !== null
                      ? `Hace ${analytics.daysSinceLastOrder} días`
                      : 'Sin pedidos'}
                  </div>
                  <div className="text-[10px] text-zinc-500 mt-0.5">
                    {analytics.lastOrderDate
                      ? new Date(analytics.lastOrderDate).toLocaleDateString('es-ES', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : 'N/A'}
                  </div>
                </div>
              </div>

              {/* 2 Column Section: Top Products & Schedule Patterns */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Left: Top Products (Hamburguesas que más pide) */}
                <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Utensils className="w-4 h-4 text-amber-400" />
                      <span>Hamburguesas que más pide</span>
                    </h2>
                    <span className="text-[11px] text-zinc-400">Preferencias</span>
                  </div>

                  <div className="space-y-3">
                    {analytics.topProducts.map((p, idx) => {
                      const burgerObj = burgers.find((b) => b.id === p.burgerId);
                      const isTop1 = idx === 0 && p.count > 0;

                      return (
                        <div key={p.burgerId} className="space-y-1">
                          <div className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-2.5 h-2.5 rounded-full"
                                style={{ backgroundColor: burgerObj?.markerColor || '#f59e0b' }}
                              />
                              <span className="font-semibold text-zinc-200">
                                {p.burgerName}
                              </span>
                              {isTop1 && (
                                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-bold border border-amber-500/30">
                                  FAVORITA #1
                                </span>
                              )}
                            </div>
                            <div className="text-zinc-400">
                              <span className="font-bold text-white">{p.count}</span> unidades ({p.percentage}%)
                            </div>
                          </div>

                          {/* Progress bar */}
                          <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-500"
                              style={{
                                width: `${Math.max(4, p.percentage)}%`,
                                backgroundColor: burgerObj?.markerColor || '#f59e0b',
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div className="mt-4 pt-3 border-t border-zinc-800 text-xs text-zinc-400">
                    💡 <b>Diagnóstico:</b> {customer.name.split(' ')[0]} concentra el{' '}
                    <b>{analytics.topProducts[0]?.percentage}%</b> de sus pedidos en la{' '}
                    <span className="text-amber-400 font-semibold">{analytics.favoriteBurgerName}</span>.
                  </div>
                </div>

                {/* Right: Día y Hora de Pedidos (Heatmap & Frequency) */}
                <div className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-orange-400" />
                      <span>Día y Hora habitual de pedidos</span>
                    </h2>
                    <span className="text-[11px] text-zinc-400">Patrón de compra</span>
                  </div>

                  {/* Day of Week Frequency Bars */}
                  <div className="mb-4">
                    <div className="text-xs text-zinc-400 mb-2 flex justify-between">
                      <span>Días de la semana más activos:</span>
                      <span className="text-amber-400 font-semibold">Pico: {analytics.peakDay}</span>
                    </div>

                    <div className="grid grid-cols-7 gap-1.5">
                      {DAYS_ORDER.map((dayName) => {
                        const count = analytics.dayFrequency[dayName] || 0;
                        const heightPct = Math.round((count / maxDayCount) * 100);
                        const isPeak = dayName === analytics.peakDay && count > 0;

                        return (
                          <div key={dayName} className="flex flex-col items-center">
                            <div className="h-16 w-full bg-zinc-800/80 rounded flex flex-col justify-end p-0.5">
                              <div
                                className={`w-full rounded transition-all duration-500 ${
                                  isPeak
                                    ? 'bg-amber-500 shadow-md shadow-amber-500/30'
                                    : count > 0
                                    ? 'bg-orange-600/70'
                                    : 'bg-transparent'
                                }`}
                                style={{ height: `${count > 0 ? Math.max(15, heightPct) : 0}%` }}
                                title={`${dayName}: ${count} pedidos`}
                              />
                            </div>
                            <span
                              className={`text-[10px] mt-1 font-medium ${
                                isPeak ? 'text-amber-400 font-bold' : 'text-zinc-500'
                              }`}
                            >
                              {dayName.slice(0, 3)}
                            </span>
                            <span className="text-[9px] text-zinc-400">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Hourly Distribution (Lunch vs Dinner) */}
                  <div className="pt-3 border-t border-zinc-800">
                    <div className="text-xs text-zinc-400 mb-2 flex justify-between">
                      <span>Horas frecuentes de pedido:</span>
                      <span className="text-orange-400 font-semibold">{analytics.peakHourSlot}</span>
                    </div>

                    <div className="grid grid-cols-10 gap-1">
                      {relevantHours.map((h) => {
                        const count = analytics.hourFrequency[h] || 0;
                        const heightPct = Math.round((count / maxHourCount) * 100);
                        const isLunch = h >= 12 && h <= 15;

                        return (
                          <div key={h} className="flex flex-col items-center">
                            <div className="h-12 w-full bg-zinc-800/80 rounded flex flex-col justify-end p-0.5">
                              <div
                                className={`w-full rounded transition-all ${
                                  count > 0
                                    ? isLunch
                                      ? 'bg-blue-500/80'
                                      : 'bg-orange-500/80'
                                    : 'bg-transparent'
                                }`}
                                style={{ height: `${count > 0 ? Math.max(20, heightPct) : 0}%` }}
                                title={`${h}:00 hrs: ${count} pedidos`}
                              />
                            </div>
                            <span className="text-[9px] text-zinc-400 mt-1">{h}h</span>
                            <span className="text-[8px] text-zinc-500">{count}</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-[10px] text-zinc-500">
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded bg-blue-500/80" /> Almuerzo (12h-15h)
                      </span>
                      <span className="flex items-center gap-1">
                        <span className="w-2 h-2 rounded bg-orange-500/80" /> Cena / Noche (18h-23h)
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 pt-3 border-t border-zinc-800 text-xs text-zinc-400">
                    ⏰ <b>Momento ideal de contacto:</b> Contactar preferentemente los{' '}
                    <span className="text-amber-400 font-semibold">{analytics.peakDay}</span> alrededor de las{' '}
                    <span className="text-orange-400 font-semibold">{analytics.peakHourSlot.split(' ')[0]}</span>.
                  </div>
                </div>
              </div>

              {/* Quick Promo Teaser */}
              <div className="bg-gradient-to-r from-amber-950/30 via-zinc-900 to-orange-950/30 border border-amber-600/30 rounded-xl p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
                    <Sparkles className="w-4 h-4" />
                    <span>Promoción recomendada activa: {analytics.recommendedPromotions[0]?.title}</span>
                  </div>
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {analytics.recommendedPromotions[0]?.description}
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('promociones')}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-lg transition-colors shrink-0"
                >
                  Ver Todas & Enviar
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: PROMOCIONES PERSONALIZADAS */}
          {activeTab === 'promociones' && (
            <div className="space-y-4">
              <div className="text-xs text-zinc-400 flex items-center justify-between">
                <p>
                  Promociones calculadas automáticamente para <b>{customer.name}</b> según su hamburguesa favorita (
                  {analytics.favoriteBurgerName}), días de mayor compra ({analytics.peakDay}) y ticket medio (${analytics.averageTicket.toFixed(2)}).
                </p>
              </div>

              <div className="grid grid-cols-1 gap-4">
                {analytics.recommendedPromotions.map((promo) => (
                  <div
                    key={promo.id}
                    className="bg-zinc-900/90 border border-zinc-800 rounded-xl p-4 hover:border-amber-600/40 transition-all space-y-3"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                            {promo.badge}
                          </span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                            {promo.discountValue}
                          </span>
                        </div>
                        <h2 className="text-base font-bold text-white mt-1.5">{promo.title}</h2>
                        <p className="text-xs text-zinc-400 mt-0.5">{promo.description}</p>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-[10px] text-zinc-500 block">Cupón:</span>
                        <code className="text-xs font-mono font-bold text-amber-300 bg-zinc-950 px-2 py-1 rounded border border-zinc-800 block">
                          {promo.couponCode}
                        </code>
                      </div>
                    </div>

                    {/* WhatsApp Message Preview */}
                    <div className="bg-zinc-950 border border-zinc-800/80 rounded-lg p-3 text-xs text-zinc-300">
                      <div className="text-[10px] font-semibold text-emerald-400 mb-1 flex items-center gap-1">
                        <span>💬 Mensaje personalizado para WhatsApp:</span>
                      </div>
                      <p className="whitespace-pre-line leading-relaxed">{promo.whatsappMessage}</p>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-1">
                      <span className="text-[11px] text-zinc-500 italic">
                        🎯 Razón: {promo.reason}
                      </span>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleCopyMessage(promo)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition-colors"
                        >
                          {copiedPromoId === promo.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span className="text-emerald-400 font-semibold">¡Copiado!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-zinc-400" />
                              <span>Copiar Texto</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={() => handleSendWhatsApp(promo)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg shadow-md transition-all active:scale-95"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Enviar por WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: HISTORIAL DE PEDIDOS */}
          {activeTab === 'pedidos' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-bold text-white">Registro de Tickets & Compras</h2>
                  <p className="text-xs text-zinc-400">
                    Historial de {customer.orders.length} pedidos registrados para este cliente
                  </p>
                </div>
                <button
                  onClick={() => onNewOrder(customer)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs font-bold rounded-lg transition-colors"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>+ Agregar Pedido</span>
                </button>
              </div>

              {customer.orders.length === 0 ? (
                <div className="p-8 text-center text-zinc-500 text-xs bg-zinc-900/50 rounded-xl border border-zinc-800">
                  No hay pedidos registrados aún para este cliente.
                </div>
              ) : (
                <div className="space-y-2.5">
                  {customer.orders.map((order) => {
                    const orderDate = new Date(order.timestamp);
                    const formattedDate = orderDate.toLocaleDateString('es-ES', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    });
                    const formattedTime = orderDate.toLocaleTimeString('es-ES', {
                      hour: '2-digit',
                      minute: '2-digit',
                    });

                    return (
                      <div
                        key={order.id}
                        className="bg-zinc-900/70 border border-zinc-800 rounded-xl p-3.5 hover:border-zinc-700 transition-all"
                      >
                        <div className="flex items-start justify-between gap-3 mb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded text-xs">
                              {order.id}
                            </span>
                            <span className="text-xs text-zinc-300 capitalize">{formattedDate}</span>
                            <span className="text-xs text-zinc-500">a las {formattedTime} hrs</span>
                          </div>
                          <div className="text-right">
                            <span className="text-sm font-bold text-emerald-400">
                              ${order.totalAmount.toFixed(2)}
                            </span>
                            <span className="text-[10px] text-zinc-500 block">
                              Pago: {order.paymentMethod}
                            </span>
                          </div>
                        </div>

                        {/* Items list */}
                        <div className="bg-zinc-950/60 p-2 rounded-lg border border-zinc-800/60 space-y-1">
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              className="flex items-center justify-between text-xs text-zinc-300"
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-amber-400">{item.quantity}x</span>
                                <span>{item.burgerName}</span>
                              </div>
                              <span className="text-zinc-400">
                                ${(item.quantity * item.unitPrice).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>

                        {order.notes && (
                          <div className="mt-2 text-[11px] text-zinc-400 italic">
                            Nota: &ldquo;{order.notes}&rdquo;
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex items-center justify-between">
          <div className="text-xs text-zinc-400">
            Cliente ID: <code className="text-zinc-300">{customer.id}</code> | Zona:{' '}
            <span className="text-zinc-200">{customer.zone}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg transition-colors"
            >
              Cerrar
            </button>
            <button
              onClick={() => onNewOrder(customer)}
              className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold rounded-lg shadow-md transition-all flex items-center gap-1.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Registrar Nuevo Pedido</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
