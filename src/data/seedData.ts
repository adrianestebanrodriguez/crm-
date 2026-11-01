import { Customer, Order } from '../types';
import { BURGERS, KITCHEN_LOCATION } from './burgers';

const FIRST_NAMES = [
  'Carlos', 'Valentina', 'Mateo', 'Lucía', 'Andrés', 'Camila', 'Santiago',
  'Isabella', 'Diego', 'Mariana', 'Sebastián', 'Sofía', 'Alejandro', 'Daniela',
  'Nicolás', 'Paula', 'Felipe', 'Gabriela', 'Julián', 'Catalina', 'Esteban',
  'Laura', 'Gabriel', 'Natalia', 'Manuel', 'Carolina', 'Juan Pablo', 'María José',
  'Rodrigo', 'Andrea', 'Lucas', 'Juliana', 'David', 'Elena', 'Tomás', 'Valeria',
  'Emilio', 'Fernanda', 'Leonardo', 'Clara', 'Gonzalo', 'Victoria', 'Martín',
  'Renata', 'Ignacio', 'Ana Sofía', 'Alonso', 'Abril', 'Samuel', 'Bianca',
];

const LAST_NAMES = [
  'Mendoza', 'Gómez', 'Silva', 'Morales', 'Herrera', 'Castro', 'Ríos', 'Navarro',
  'Pardo', 'Vargas', 'Reyes', 'Torres', 'Acosta', 'Cabrera', 'Lozano', 'Delgado',
  'Paredes', 'Montoya', 'Cárdenas', 'Gutiérrez', 'Ortega', 'Salazar', 'Bermúdez',
  'Serrano', 'Campos', 'Restrepo', 'Velandia', 'Santana', 'Duque', 'Mejía',
  'Zambrano', 'Peña', 'Correa', 'Giraldo', 'Pinzón', 'Ospina', 'Osorio',
  'Vásquez', 'Quintero', 'Bustamante',
];

const ZONES = [
  { name: 'Chapinero Alto', baseLat: 4.651, baseLng: -74.054, radius: 0.012 },
  { name: 'Zona G / Rosales', baseLat: 4.656, baseLng: -74.052, radius: 0.010 },
  { name: 'Parque de la 93', baseLat: 4.676, baseLng: -74.048, radius: 0.011 },
  { name: 'Chicó Norte / Virrey', baseLat: 4.671, baseLng: -74.053, radius: 0.012 },
  { name: 'Usaquén Plaza', baseLat: 4.694, baseLng: -74.032, radius: 0.014 },
  { name: 'Quinta Camacho', baseLat: 4.654, baseLng: -74.062, radius: 0.009 },
  { name: 'Teusaquillo Gourmet', baseLat: 4.632, baseLng: -74.072, radius: 0.013 },
  { name: 'Santa Bárbara', baseLat: 4.691, baseLng: -74.045, radius: 0.012 },
  { name: 'Cedritos Delivery', baseLat: 4.715, baseLng: -74.036, radius: 0.015 },
  { name: 'Ciudad Salitre', baseLat: 4.648, baseLng: -74.108, radius: 0.014 },
];

const STREET_PREFIXES = ['Calle', 'Carrera', 'Transversal', 'Diagonal', 'Avenida'];

// Simple deterministic random generator for reproducible high quality dataset
function mulberry32(a: number) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateSeedCustomers(): Customer[] {
  const rand = mulberry32(1337);
  const customers: Customer[] = [];
  const TOTAL_CLIENTS = 300;

  // Reference date: late October 2026
  const refDate = new Date('2026-10-31T20:00:00Z');

  for (let i = 1; i <= TOTAL_CLIENTS; i++) {
    const fn = FIRST_NAMES[Math.floor(rand() * FIRST_NAMES.length)];
    const ln1 = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
    const ln2 = LAST_NAMES[Math.floor(rand() * LAST_NAMES.length)];
    const fullName = `${fn} ${ln1} ${ln2}`;

    const cleanName = `${fn.toLowerCase()}.${ln1.toLowerCase()}`.replace(/\s+/g, '');
    const emailDomain = ['gmail.com', 'hotmail.com', 'outlook.com', 'icloud.com', 'empresa.co'][
      Math.floor(rand() * 5)
    ];
    const email = `${cleanName}${Math.floor(rand() * 89) + 10}@${emailDomain}`;

    const phoneNum = Math.floor(rand() * 9000000) + 1000000;
    const phone = `+57 31${Math.floor(rand() * 9) + 1} ${phoneNum.toString().slice(0, 3)} ${phoneNum.toString().slice(3)}`;

    const zoneObj = ZONES[Math.floor(rand() * ZONES.length)];
    const streetPrefix = STREET_PREFIXES[Math.floor(rand() * STREET_PREFIXES.length)];
    const streetNum = Math.floor(rand() * 120) + 10;
    const houseNum = Math.floor(rand() * 80) + 1;
    const apt = rand() > 0.4 ? ` Apt ${Math.floor(rand() * 9) + 1}0${Math.floor(rand() * 4) + 1}` : '';
    const address = `${streetPrefix} ${streetNum} #${houseNum}-${Math.floor(rand() * 70) + 10}${apt}, ${zoneObj.name}`;

    // Coordinates with natural jitter around zone centroid
    const angle = rand() * Math.PI * 2;
    const dist = rand() * zoneObj.radius;
    const lat = Number((zoneObj.baseLat + Math.cos(angle) * dist).toFixed(6));
    const lng = Number((zoneObj.baseLng + Math.sin(angle) * dist).toFixed(6));

    // Birth date between 1980 and 2004
    const birthYear = 1980 + Math.floor(rand() * 25);
    const birthMonth = Math.floor(rand() * 12) + 1;
    const birthDay = Math.floor(rand() * 28) + 1;
    const birthDate = `${birthYear}-${birthMonth.toString().padStart(2, '0')}-${birthDay.toString().padStart(2, '0')}`;

    // Customer persona preference bias for burgers
    // Each client has an innate preference for 1 or 2 burgers (70% probability)
    const primaryBurger = BURGERS[Math.floor(rand() * BURGERS.length)];
    const secondaryBurger = BURGERS[Math.floor(rand() * BURGERS.length)];

    // Number of past orders (1 to 11)
    // 20% are VIP high frequency (6-11 orders)
    // 50% are medium regular (3-5 orders)
    // 30% are occasional (1-2 orders)
    const isVip = rand() < 0.2;
    const numOrders = isVip
      ? 6 + Math.floor(rand() * 6)
      : rand() < 0.65
      ? 3 + Math.floor(rand() * 3)
      : 1 + Math.floor(rand() * 2);

    // Preferred day and hour for this customer persona
    const preferredDayOffset = Math.floor(rand() * 7); // 0: Sun, 5: Fri, 6: Sat
    const prefersDinner = rand() < 0.75;
    const preferredHour = prefersDinner
      ? 19 + Math.floor(rand() * 4) // 19, 20, 21, 22
      : 12 + Math.floor(rand() * 3); // 12, 13, 14

    const orders: Order[] = [];

    // Generate orders backwards in time from reference date
    // Some customers ordered 2 days ago, some 45 days ago
    let currentDaysBack = Math.floor(rand() * 14); // latest order
    if (rand() < 0.15) {
      // 15% are at risk / dormant (haven't ordered in 36-70 days)
      currentDaysBack = 36 + Math.floor(rand() * 35);
    }

    for (let o = 0; o < numOrders; o++) {
      const orderDate = new Date(refDate.getTime() - currentDaysBack * 24 * 60 * 60 * 1000);

      // Adjust hour around customer's habit
      const hourJitter = Math.floor(rand() * 3) - 1;
      const orderHour = Math.min(23, Math.max(11, preferredHour + hourJitter));
      const orderMinute = Math.floor(rand() * 60);
      orderDate.setHours(orderHour, orderMinute, 0, 0);

      // Items in order: 1 to 3 burgers
      const itemCount = rand() < 0.4 ? 1 : rand() < 0.8 ? 2 : 3;
      const items = [];
      let totalAmount = 0;

      for (let it = 0; it < itemCount; it++) {
        // Bias towards favorite burger
        let chosenBurger = primaryBurger;
        const roll = rand();
        if (roll > 0.65) {
          chosenBurger = secondaryBurger;
        } else if (roll > 0.85) {
          chosenBurger = BURGERS[Math.floor(rand() * BURGERS.length)];
        }

        const quantity = rand() < 0.85 ? 1 : 2;
        items.push({
          burgerId: chosenBurger.id,
          burgerName: chosenBurger.name,
          quantity,
          unitPrice: chosenBurger.price,
        });
        totalAmount += chosenBurger.price * quantity;
      }

      const paymentMethods: Order['paymentMethod'][] = ['Tarjeta', 'Online', 'Efectivo', 'Transferencia'];
      const paymentMethod = paymentMethods[Math.floor(rand() * paymentMethods.length)];

      const ticketNum = 1000 + i * 20 + o;
      orders.push({
        id: `TK-${ticketNum}`,
        timestamp: orderDate.toISOString(),
        items,
        totalAmount: Number(totalAmount.toFixed(2)),
        paymentMethod,
        notes: rand() > 0.7 ? 'Sin cebolla cruda, extra servilletas.' : undefined,
      });

      // Space between subsequent past orders: 6 to 18 days
      currentDaysBack += 6 + Math.floor(rand() * 13);
    }

    // Sort orders descending (most recent first)
    orders.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    customers.push({
      id: `cust-${i}`,
      name: fullName,
      email,
      phone,
      address,
      zone: zoneObj.name,
      birthDate,
      coordinates: { lat, lng },
      orders,
      createdAt: new Date(refDate.getTime() - (currentDaysBack + 10) * 24 * 60 * 60 * 1000)
        .toISOString()
        .slice(0, 10),
    });
  }

  return customers;
}

const STORAGE_KEY = 'ghostburger_crm_customers_v1';

export function getInitialCustomers(): Customer[] {
  if (typeof window === 'undefined') {
    return generateSeedCustomers();
  }

  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length >= 50) {
        return parsed;
      }
    }
  } catch (err) {
    console.error('Error loading customers from localStorage:', err);
  }

  const fresh = generateSeedCustomers();
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
  } catch (e) {
    console.warn('Could not save initial to localStorage:', e);
  }
  return fresh;
}

export function saveCustomersToStorage(customers: Customer[]): void {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(customers));
    } catch (err) {
      console.error('Failed saving to localStorage:', err);
    }
  }
}

export function resetCustomersToDefault(): Customer[] {
  const fresh = generateSeedCustomers();
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fresh));
    } catch (err) {
      console.error('Failed resetting localStorage:', err);
    }
  }
  return fresh;
}
