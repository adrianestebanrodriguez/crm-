import {
  Customer,
  Burger,
  Order,
  CustomerAnalytics,
  TopProductStats,
  PromotionRecommendation,
  KitchenStats,
} from '../types';

const DAYS_ES = [
  'Domingo',
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
];

export function calculateCustomerAnalytics(
  customer: Customer,
  burgers: Burger[],
  referenceDate: Date = new Date()
): CustomerAnalytics {
  const orders = customer.orders || [];
  const totalOrders = orders.length;
  const totalSpent = orders.reduce((sum, o) => sum + (o.totalAmount || 0), 0);
  const averageTicket = totalOrders > 0 ? Number((totalSpent / totalOrders).toFixed(2)) : 0;

  // Product frequency
  const productCountMap: { [burgerId: string]: { count: number; spent: number } } = {};
  let totalBurgersOrdered = 0;

  // Initialize all burgers with 0 so all 5 burgers exist in stats
  burgers.forEach((b) => {
    productCountMap[b.id] = { count: 0, spent: 0 };
  });

  // Day & Hour frequency
  const dayFrequency: { [dayName: string]: number } = {
    Domingo: 0,
    Lunes: 0,
    Martes: 0,
    Miércoles: 0,
    Jueves: 0,
    Viernes: 0,
    Sábado: 0,
  };

  const hourFrequency: { [hour: number]: number } = {};
  for (let i = 0; i < 24; i++) {
    hourFrequency[i] = 0;
  }

  let latestOrderTimestamp: number | null = null;

  orders.forEach((order) => {
    const orderDate = new Date(order.timestamp);
    const orderTimeMs = orderDate.getTime();
    if (!latestOrderTimestamp || orderTimeMs > latestOrderTimestamp) {
      latestOrderTimestamp = orderTimeMs;
    }

    const dayName = DAYS_ES[orderDate.getDay()];
    dayFrequency[dayName] = (dayFrequency[dayName] || 0) + 1;

    const hour = orderDate.getHours();
    hourFrequency[hour] = (hourFrequency[hour] || 0) + 1;

    (order.items || []).forEach((item) => {
      totalBurgersOrdered += item.quantity;
      if (!productCountMap[item.burgerId]) {
        productCountMap[item.burgerId] = { count: 0, spent: 0 };
      }
      productCountMap[item.burgerId].count += item.quantity;
      productCountMap[item.burgerId].spent += item.quantity * item.unitPrice;
    });
  });

  // Top products ranked
  const topProducts: TopProductStats[] = Object.keys(productCountMap)
    .map((burgerId) => {
      const burgerObj = burgers.find((b) => b.id === burgerId);
      const data = productCountMap[burgerId];
      const percentage =
        totalBurgersOrdered > 0
          ? Number(((data.count / totalBurgersOrdered) * 100).toFixed(1))
          : 0;
      return {
        burgerId,
        burgerName: burgerObj ? burgerObj.name : burgerId,
        count: data.count,
        percentage,
        totalSpentOnProduct: Number(data.spent.toFixed(2)),
      };
    })
    .sort((a, b) => b.count - a.count);

  const favoriteBurger = topProducts[0] || {
    burgerId: burgers[0]?.id || 'b1',
    burgerName: burgers[0]?.name || 'Trufada Royale',
  };

  // Peak day
  let peakDay = 'Viernes';
  let maxDayCount = -1;
  Object.entries(dayFrequency).forEach(([day, count]) => {
    if (count > maxDayCount) {
      maxDayCount = count;
      peakDay = day;
    }
  });

  // Peak hour
  let peakHour = 20;
  let maxHourCount = -1;
  Object.entries(hourFrequency).forEach(([hStr, count]) => {
    const h = parseInt(hStr, 10);
    if (count > maxHourCount) {
      maxHourCount = count;
      peakHour = h;
    }
  });

  let peakHourSlot = `${peakHour.toString().padStart(2, '0')}:00 - ${(peakHour + 1)
    .toString()
    .padStart(2, '0')}:00`;

  if (peakHour >= 12 && peakHour <= 15) {
    peakHourSlot += ' (Almuerzo)';
  } else if (peakHour >= 19 && peakHour <= 23) {
    peakHourSlot += ' (Cena / Noche)';
  }

  // Recency
  let daysSinceLastOrder: number | null = null;
  let lastOrderDate: string | null = null;
  if (latestOrderTimestamp) {
    lastOrderDate = new Date(latestOrderTimestamp).toISOString();
    const diffMs = referenceDate.getTime() - latestOrderTimestamp;
    daysSinceLastOrder = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  }

  // Birthday analytics
  let isBirthdayThisMonth = false;
  let daysUntilBirthday = 999;
  if (customer.birthDate) {
    const birth = new Date(customer.birthDate + 'T00:00:00');
    const refMonth = referenceDate.getMonth();
    const refDate = referenceDate.getDate();

    isBirthdayThisMonth = birth.getMonth() === refMonth;

    const nextBirthday = new Date(
      referenceDate.getFullYear(),
      birth.getMonth(),
      birth.getDate()
    );
    if (nextBirthday.getTime() < referenceDate.getTime() - 24 * 60 * 60 * 1000) {
      nextBirthday.setFullYear(referenceDate.getFullYear() + 1);
    }
    const diffDays = Math.ceil(
      (nextBirthday.getTime() - referenceDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    daysUntilBirthday = Math.max(0, diffDays);
  }

  // Segmentation
  let customerSegment: CustomerAnalytics['customerSegment'] = 'Nuevo';
  if (totalOrders === 0) {
    customerSegment = 'Nuevo';
  } else if (daysSinceLastOrder !== null && daysSinceLastOrder > 35) {
    customerSegment = 'En Riesgo (>35d)';
  } else if (averageTicket >= 22 || totalSpent >= 120) {
    customerSegment = 'VIP High-Ticket';
  } else if (totalOrders >= 4) {
    customerSegment = 'Cliente Frecuente';
  } else {
    customerSegment = 'Ocasional';
  }

  // Generate personalized promotions
  const recommendedPromotions = generatePersonalizedPromotions({
    customer,
    favoriteBurgerName: favoriteBurger.burgerName,
    favoriteBurgerId: favoriteBurger.burgerId,
    peakDay,
    peakHourSlot,
    averageTicket,
    daysSinceLastOrder,
    isBirthdayThisMonth,
    daysUntilBirthday,
    customerSegment,
  });

  return {
    totalOrders,
    totalSpent: Number(totalSpent.toFixed(2)),
    averageTicket,
    topProducts,
    favoriteBurgerId: favoriteBurger.burgerId,
    favoriteBurgerName: favoriteBurger.burgerName,
    dayFrequency,
    hourFrequency,
    peakDay,
    peakHourSlot,
    lastOrderDate,
    daysSinceLastOrder,
    isBirthdayThisMonth,
    daysUntilBirthday,
    customerSegment,
    recommendedPromotions,
  };
}

interface PromoInput {
  customer: Customer;
  favoriteBurgerName: string;
  favoriteBurgerId: string;
  peakDay: string;
  peakHourSlot: string;
  averageTicket: number;
  daysSinceLastOrder: number | null;
  isBirthdayThisMonth: boolean;
  daysUntilBirthday: number;
  customerSegment: CustomerAnalytics['customerSegment'];
}

export function generatePersonalizedPromotions(input: PromoInput): PromotionRecommendation[] {
  const {
    customer,
    favoriteBurgerName,
    peakDay,
    averageTicket,
    daysSinceLastOrder,
    isBirthdayThisMonth,
    daysUntilBirthday,
    customerSegment,
  } = input;

  const promos: PromotionRecommendation[] = [];
  const firstName = customer.name.split(' ')[0] || 'amig@';
  const shortCode = customer.name.substring(0, 3).toUpperCase() + Math.floor(10 + Math.random() * 89);

  // 1. Promo basada en producto favorito
  promos.push({
    id: `promo-fav-${customer.id}`,
    title: `Doble placer en ${favoriteBurgerName}`,
    badge: 'Basada en Hamburguesa Favorita',
    description: `20% de descuento en su hamburguesa más pedida (${favoriteBurgerName}) para impulsar repetición.`,
    couponCode: `FAV-${shortCode}`,
    discountValue: '20% OFF',
    reason: `El cliente ha pedido ${favoriteBurgerName} de forma recurrente.`,
    channel: 'WhatsApp',
    whatsappMessage: `¡Hola ${firstName}! 🍔 En nuestra cocina oculta sabemos que tu debilidad es la ${favoriteBurgerName}. Por ser cliente fiel, hoy te regalamos un 20% OFF en tu hamburguesa favorita con el código *FAV-${shortCode}*. ¿Te la enviamos a ${customer.address}? ¡Escríbenos para marchar tu orden caliente!`,
  });

  // 2. Promo basada en día/hora preferida
  promos.push({
    id: `promo-timing-${customer.id}`,
    title: `Especial ${peakDay}: Combo Upgrade Gratis`,
    badge: `Patrón de Horario: ${peakDay}`,
    description: `Aprovechar su día de mayor consumo (${peakDay}) regalando papas rústicas o bebida artesanal.`,
    couponCode: `${peakDay.toUpperCase().slice(0, 3)}-UPGRADE`,
    discountValue: 'Papas & Bebida Gratis',
    reason: `Suele ordenar los ${peakDay} habitualmente.`,
    channel: 'WhatsApp',
    whatsappMessage: `¡Hola ${firstName}! 🔥 Los ${peakDay} son sagrados para ti y nuestras parrillas lo saben. Pide hoy tu hamburguesa y te llevas GRATIS papas trufadas y bebida artesanal con el código *${peakDay.toUpperCase().slice(0, 3)}-UPGRADE*. ¿Marchamos tu pedido para hoy?`,
  });

  // 3. Promo por Cumpleaños si está cerca
  if (isBirthdayThisMonth || daysUntilBirthday <= 20) {
    promos.push({
      id: `promo-bday-${customer.id}`,
      title: `¡Festeja tu Cumpleaños en GhostBurger!`,
      badge: 'Club Cumpleañero',
      description: `Regalo de postre o hamburguesa 2x1 especial por su cumpleaños (${customer.birthDate}).`,
      couponCode: `BDAY-${shortCode}`,
      discountValue: '2x1 Cumpleañero',
      reason: `Cumpleaños en ${daysUntilBirthday === 0 ? '¡Hoy!' : daysUntilBirthday + ' días'}.`,
      channel: 'WhatsApp',
      whatsappMessage: `¡Hola ${firstName}! 🎉🎂 ¡Se acerca tu cumpleaños y queremos celebrarlo contigo! Te obsequiamos un 2x1 en tu hamburguesa favorita (${favoriteBurgerName}) usando el código *BDAY-${shortCode}*. Válido durante todo tu mes cumpleañero. ¡Reserva tu festín aquí!`,
    });
  }

  // 4. Promo de Reactivación si está en riesgo
  if (customerSegment === 'En Riesgo (>35d)' || (daysSinceLastOrder !== null && daysSinceLastOrder >= 30)) {
    promos.push({
      id: `promo-reactivate-${customer.id}`,
      title: '¡Te extrañamos en la cocina!',
      badge: 'Reactivación de Cliente',
      description: `Descuento agresivo del 25% para recuperar a este cliente tras ${daysSinceLastOrder || 30} días sin pedir.`,
      couponCode: `VUELVE-25`,
      discountValue: '25% OFF Total',
      reason: `Último pedido hace ${daysSinceLastOrder} días. Riesgo de deserción.`,
      channel: 'WhatsApp',
      whatsappMessage: `¡Hola ${firstName}! Hace días que nuestras parrillas no preparan tu ${favoriteBurgerName} favorita y te extrañamos. 🥺 Queremos consentirte con un 25% de descuento en toda tu orden hoy con el cupón *VUELVE-25*. ¡Pídelo calentito a tu puerta en ${customer.address}!`,
    });
  }

  // 5. Promo High-Ticket / VIP
  if (customerSegment === 'VIP High-Ticket' || averageTicket >= 20) {
    promos.push({
      id: `promo-vip-${customer.id}`,
      title: 'Pase VIP: Degustación Exclusiva',
      badge: 'Cliente VIP',
      description: `Reconocimiento especial a cliente de alto ticket ($${averageTicket.toFixed(2)} promedio).`,
      couponCode: `VIP-GOURMET`,
      discountValue: 'Bebida Premium + Envío Gratis',
      reason: `Ticket medio alto de $${averageTicket.toFixed(2)}.`,
      channel: 'WhatsApp',
      whatsappMessage: `¡Estimad@ ${firstName}! ⭐ Como parte de nuestro Círculo VIP de GhostBurger (Ticket preferencial), tienes Envío Gratis prioritario y una malteada artesanal de cortesía en tu próximo pedido con el código *VIP-GOURMET*. ¿Te provocó una buena burger hoy?`,
    });
  }

  return promos;
}

export function addNewOrderToCustomer(
  customer: Customer,
  orderData: Omit<Order, 'id'> & { id?: string }
): Customer {
  const newTicketId = orderData.id || `TK-${Math.floor(1000 + Math.random() * 9000)}`;
  const newOrder: Order = {
    ...orderData,
    id: newTicketId,
  };

  const updatedOrders = [newOrder, ...(customer.orders || [])];

  return {
    ...customer,
    orders: updatedOrders,
  };
}

export function calculateKitchenGlobalStats(
  customers: Customer[],
  burgers: Burger[]
): KitchenStats {
  const totalCustomers = customers.length;
  let totalOrders = 0;
  let totalRevenue = 0;
  const burgerSalesMap: { [id: string]: number } = {};
  const hourMap: { [hour: number]: number } = {};

  burgers.forEach((b) => {
    burgerSalesMap[b.id] = 0;
  });

  const now = new Date();
  let atRiskCustomersCount = 0;
  let activeCustomersCount = 0;

  customers.forEach((c) => {
    const orders = c.orders || [];
    totalOrders += orders.length;

    let hasRecentOrder = false;
    orders.forEach((o) => {
      totalRevenue += o.totalAmount || 0;
      const d = new Date(o.timestamp);
      const diffDays = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
      if (diffDays <= 30) {
        hasRecentOrder = true;
      }
      const h = d.getHours();
      hourMap[h] = (hourMap[h] || 0) + 1;

      (o.items || []).forEach((item) => {
        burgerSalesMap[item.burgerId] =
          (burgerSalesMap[item.burgerId] || 0) + item.quantity;
      });
    });

    if (hasRecentOrder) {
      activeCustomersCount++;
    } else {
      atRiskCustomersCount++;
    }
  });

  const globalAverageTicket = totalOrders > 0 ? Number((totalRevenue / totalOrders).toFixed(2)) : 0;

  // Best selling burger
  let topBurgerId = burgers[0]?.id || 'b1';
  let topBurgerUnits = 0;
  Object.entries(burgerSalesMap).forEach(([id, units]) => {
    if (units > topBurgerUnits) {
      topBurgerUnits = units;
      topBurgerId = id;
    }
  });
  const topBurger = burgers.find((b) => b.id === topBurgerId);

  // Peak hour
  let peakHour = 20;
  let peakCount = 0;
  Object.entries(hourMap).forEach(([h, count]) => {
    if (count > peakCount) {
      peakCount = count;
      peakHour = parseInt(h, 10);
    }
  });

  return {
    totalCustomers,
    totalOrders,
    globalAverageTicket,
    topSellingBurger: {
      name: topBurger ? topBurger.name : 'Trufada Royale',
      totalUnits: topBurgerUnits,
    },
    peakHours: `${peakHour}:00 - ${peakHour + 2}:00 hrs`,
    activeCustomersCount,
    atRiskCustomersCount,
  };
}
