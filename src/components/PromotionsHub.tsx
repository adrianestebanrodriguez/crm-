import React, { useState, useMemo } from 'react';
import { Customer, Burger, CustomerAnalytics, PromotionRecommendation } from '../types';
import { calculateCustomerAnalytics } from '../utils/analytics';
import {
  Sparkles,
  Send,
  Copy,
  Check,
  Users,
  Flame,
  Award,
  AlertTriangle,
  Cake,
  TrendingUp,
  MessageCircle,
  ExternalLink,
} from 'lucide-react';

interface PromotionsHubProps {
  customers: Customer[];
  burgers: Burger[];
  onSelectCustomer: (customer: Customer) => void;
}

export const PromotionsHub: React.FC<PromotionsHubProps> = ({
  customers,
  burgers,
  onSelectCustomer,
}) => {
  const [selectedCampaign, setSelectedCampaign] = useState<string>('favorites');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Compute analytics map
  const analyticsMap = useMemo(() => {
    const map = new Map<string, CustomerAnalytics>();
    customers.forEach((c) => {
      map.set(c.id, calculateCustomerAnalytics(c, burgers));
    });
    return map;
  }, [customers, burgers]);

  // Campaigns definitions
  const campaigns = useMemo(() => {
    // 1. Trufada Royale Fans
    const trufadaFans = customers.filter((c) => {
      const a = analyticsMap.get(c.id);
      return a && a.favoriteBurgerId === 'b1';
    });

    // 2. Weekend Rush (Fri, Sat, Sun)
    const weekendClients = customers.filter((c) => {
      const a = analyticsMap.get(c.id);
      return a && ['Viernes', 'Sábado', 'Domingo'].includes(a.peakDay);
    });

    // 3. Reactivation (>35 days dormant)
    const atRiskClients = customers.filter((c) => {
      const a = analyticsMap.get(c.id);
      return a && a.customerSegment === 'En Riesgo (>35d)';
    });

    // 4. Birthday Month Club
    const birthdayClients = customers.filter((c) => {
      const a = analyticsMap.get(c.id);
      return a && (a.isBirthdayThisMonth || a.daysUntilBirthday <= 20);
    });

    // 5. VIP High Ticket (> $22 ticket medio)
    const vipClients = customers.filter((c) => {
      const a = analyticsMap.get(c.id);
      return a && a.customerSegment === 'VIP High-Ticket';
    });

    return [
      {
        id: 'favorites',
        title: 'Especial Fans Trufada Royale',
        icon: Award,
        color: 'amber',
        badge: 'Gourmet Lover',
        discount: '20% OFF en Trufada',
        clients: trufadaFans,
        description:
          'Clientes cuya hamburguesa predilecta es la Trufada Royale. Ideal para generar compras recurrentes automáticas.',
        templateText: (c: Customer, a: CustomerAnalytics) =>
          `¡Hola ${c.name.split(' ')[0]}! 🍔 Sabemos que tu debilidad en GhostBurger es la Trufada Royale. Como cliente fiel, hoy tienes 20% OFF en tu favorita con el cupón *TRUFADA-LOVE*. ¿Te la enviamos caliente a ${c.address}?`,
      },
      {
        id: 'weekend',
        title: 'Fiebre de Fin de Semana (Viernes a Domingo)',
        icon: Flame,
        color: 'orange',
        badge: 'Patrón Horario',
        discount: 'Papas & Bebida Gratis',
        clients: weekendClients,
        description:
          'Clientes que acostumbran pedir durante el fin de semana. Promoción con regalo de acompañamientos para aumentar ticket.',
        templateText: (c: Customer, a: CustomerAnalytics) =>
          `¡Hola ${c.name.split(' ')[0]}! 🔥 Los ${a.peakDay} son sagrados para ti y nuestras parrillas lo saben. Pide hoy tu ${a.favoriteBurgerName} y te llevas GRATIS papas trufadas y bebida artesanal con el código *FINDE-UPGRADE*. ¡Pídelo ya!`,
      },
      {
        id: 'reactivation',
        title: 'Reactivación de Clientes Inactivos (>35 días)',
        icon: AlertTriangle,
        color: 'rose',
        badge: 'Recuperación',
        discount: '25% OFF Toda la Orden',
        clients: atRiskClients,
        description:
          'Clientes que llevan más de 35 días sin ordenar. Incentivo contundente para evitar la deserción definitiva.',
        templateText: (c: Customer, a: CustomerAnalytics) =>
          `¡Hola ${c.name.split(' ')[0]}! Hace tiempo que no preparas un festín con nosotros y te extrañamos en GhostBurger. 🥺 Vuelve hoy con un 25% de descuento directo usando el cupón *VUELVE-25*. ¡Te lo llevamos a ${c.address}!`,
      },
      {
        id: 'birthday',
        title: 'Club de Cumpleañeros de este Mes',
        icon: Cake,
        color: 'pink',
        badge: 'Fidelización Personal',
        discount: '2x1 Cumpleañero',
        clients: birthdayClients,
        description:
          'Clientes que cumplen años este mes o en los próximos 20 días. Oferta de celebración irresistible.',
        templateText: (c: Customer, a: CustomerAnalytics) =>
          `¡Hola ${c.name.split(' ')[0]}! 🎉🎂 ¡Se acerca tu cumpleaños y en GhostBurger la casa invita! Te regalamos un 2x1 en tu hamburguesa favorita (${a.favoriteBurgerName}) usando el código *BDAY-CELEBRATE*. Válido en tu mes cumpleañero.`,
      },
      {
        id: 'vip',
        title: 'Círculo VIP High-Ticket ($22+ ticket)',
        icon: TrendingUp,
        color: 'emerald',
        badge: 'Máximo Valor LTV',
        discount: 'Envío Gratis + Postre',
        clients: vipClients,
        description:
          'Clientes de mayor facturación promedio por pedido. Fidelización de alta gama con beneficios exclusivos.',
        templateText: (c: Customer, a: CustomerAnalytics) =>
          `¡Estimad@ ${c.name.split(' ')[0]}! ⭐ Por ser miembro de nuestro Círculo VIP (Ticket promedio $${a.averageTicket.toFixed(2)}), tienes Envío Gratis prioritario y postre de cortesía hoy con el cupón *VIP-PRIORITY*. ¡Buen provecho!`,
      },
    ];
  }, [customers, analyticsMap]);

  const activeCampaign =
    campaigns.find((c) => c.id === selectedCampaign) || campaigns[0];

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleSend = (phone: string, text: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const encoded = encodeURIComponent(text);
    window.open(`https://api.whatsapp.com/send?phone=${cleanPhone}&text=${encoded}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-zinc-900 via-zinc-900 to-amber-950/30 border border-zinc-800 rounded-2xl p-5 shadow-xl">
        <div className="flex items-center gap-2 text-amber-400 font-bold text-xs uppercase tracking-wider mb-1">
          <Sparkles className="w-4 h-4" />
          <span>Motor de Promociones Basadas en Datos de Consumo</span>
        </div>
        <h1 className="text-xl font-bold text-white tracking-tight">
          Campañas Personalizadas para Cocina Oculta
        </h1>
        <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
          El algoritmo segmenta en tiempo real a tus 300 clientes según sus productos predilectos,
          días y horarios de consumo, ticket medio y fecha de cumpleaños para generar mensajes
          personalizados con un solo clic a WhatsApp.
        </p>
      </div>

      {/* Campaign Selectors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {campaigns.map((camp) => {
          const isSelected = selectedCampaign === camp.id;
          const Icon = camp.icon;

          return (
            <div
              key={camp.id}
              onClick={() => setSelectedCampaign(camp.id)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                isSelected
                  ? 'bg-amber-500/15 border-amber-500/60 shadow-md shadow-amber-950/20'
                  : 'bg-zinc-900/80 border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="w-8 h-8 rounded-lg bg-zinc-800 flex items-center justify-center">
                  <Icon className="w-4 h-4 text-amber-400" />
                </div>
                <span className="text-xs font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
                  {camp.clients.length} clientes
                </span>
              </div>
              <h2 className="text-xs font-bold text-white line-clamp-1">{camp.title}</h2>
              <p className="text-[11px] font-semibold text-emerald-400 mt-1">
                {camp.discount}
              </p>
            </div>
          );
        })}
      </div>

      {/* Selected Campaign Details & Target Audience */}
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5 shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-4 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 text-xs font-bold border border-amber-500/20">
                {activeCampaign.badge}
              </span>
              <span className="text-xs text-emerald-400 font-bold">
                Beneficio: {activeCampaign.discount}
              </span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1.5">{activeCampaign.title}</h2>
            <p className="text-xs text-zinc-400 mt-0.5">{activeCampaign.description}</p>
          </div>

          <div className="bg-zinc-950 px-4 py-2.5 rounded-xl border border-zinc-800 text-right">
            <span className="text-[10px] text-zinc-500 uppercase block">Audiencia Segmentada</span>
            <span className="text-xl font-black text-amber-400">
              {activeCampaign.clients.length} clientes
            </span>
          </div>
        </div>

        {/* Audience Client List with 1-click personalized message */}
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span>Listado de clientes calificados para esta campaña:</span>
            <span>Mensajes listos con variables personalizadas (nombre, dirección, burger)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto p-1">
            {activeCampaign.clients.map((customer) => {
              const analytics = analyticsMap.get(customer.id)!;
              const personalizedMsg = activeCampaign.templateText(customer, analytics);
              const copyKey = `${activeCampaign.id}-${customer.id}`;

              return (
                <div
                  key={customer.id}
                  className="bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 space-y-3 hover:border-zinc-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-2">
                        <span>{customer.name}</span>
                        <span className="text-[10px] font-normal text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded">
                          ${analytics.averageTicket.toFixed(2)} ticket
                        </span>
                      </div>
                      <div className="text-[11px] text-zinc-400 mt-0.5">
                        📞 {customer.phone} • 📍 {customer.address}
                      </div>
                      <div className="text-[10px] text-amber-400/90 mt-1">
                        🍔 Favorita: <b>{analytics.favoriteBurgerName}</b> • Pide los{' '}
                        <b>{analytics.peakDay}</b>
                      </div>
                    </div>

                    <button
                      onClick={() => onSelectCustomer(customer)}
                      className="text-[10px] font-semibold text-zinc-400 hover:text-white px-2 py-1 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 shrink-0"
                    >
                      Ver Perfil
                    </button>
                  </div>

                  {/* Generated Copy Preview */}
                  <div className="bg-zinc-900/90 p-2.5 rounded-lg border border-zinc-800/80 text-xs text-zinc-300 whitespace-pre-line leading-relaxed">
                    {personalizedMsg}
                  </div>

                  {/* Buttons */}
                  <div className="flex items-center justify-end gap-2 pt-1">
                    <button
                      onClick={() => handleCopy(personalizedMsg, copyKey)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium rounded-lg transition-colors"
                    >
                      {copiedId === copyKey ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">¡Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => handleSend(customer.phone, personalizedMsg)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-colors shadow-sm active:scale-95"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>WhatsApp</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
