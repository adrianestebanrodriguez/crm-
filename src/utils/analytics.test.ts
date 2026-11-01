import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateCustomerAnalytics,
  addNewOrderToCustomer,
  calculateKitchenGlobalStats,
} from './analytics';
import { Customer, Burger, Order } from '../types';

const mockBurgers: Burger[] = [
  {
    id: 'b1',
    name: 'Trufada Royale',
    tagline: 'Angus con mayonesa de trufa negra y gouda ahumado',
    price: 14.0,
    category: 'Gourmet',
    description: 'Carne angus 180g, mayonesa trufada, champiñones salteados.',
    badgeColor: 'amber',
    markerColor: '#f59e0b',
  },
  {
    id: 'b2',
    name: 'La Bestia BBQ Smash',
    tagline: 'Doble smash crispy con bacon y cheddar fundido',
    price: 12.5,
    category: 'Smash',
    description: 'Doble carne smash, bacon crocante, cheddar, salsa BBQ.',
    badgeColor: 'red',
    markerColor: '#ef4444',
  },
  {
    id: 'b3',
    name: 'Clásica Doble Cheddar',
    tagline: 'La receta clásica americana infalible',
    price: 10.5,
    category: 'Clásica',
    description: 'Doble carne, cuádruple cheddar, pepinillos dulces.',
    badgeColor: 'emerald',
    markerColor: '#10b981',
  },
  {
    id: 'b4',
    name: 'Spicy Habanero Crunch',
    tagline: 'Picante y adictiva con jalapeños caramelizados',
    price: 13.0,
    category: 'Spicy',
    description: 'Blend de res, queso monterey jack, jalapeños.',
    badgeColor: 'orange',
    markerColor: '#f97316',
  },
  {
    id: 'b5',
    name: 'Veggie Portobello Melt',
    tagline: 'Medallón portobello gratinado al alioli de hierbas',
    price: 11.5,
    category: 'Veggie',
    description: 'Portobello grill, provolone, rúcula fresca.',
    badgeColor: 'purple',
    markerColor: '#a855f7',
  },
];

const mockCustomer: Customer = {
  id: 'cust-1',
  name: 'Alejandro Morales',
  email: 'alejandro.m@gmail.com',
  phone: '+57 311 234 5678',
  address: 'Calle 85 #14-22, Chapinero',
  zone: 'Chapinero',
  birthDate: '1992-11-05', // 5 days from reference date (ref: 2026-10-31)
  coordinates: { lat: 4.6712, lng: -74.0567 },
  createdAt: '2026-01-15',
  orders: [
    {
      id: 'TK-1001',
      timestamp: '2026-10-24T20:30:00Z', // Saturday night
      totalAmount: 28.0,
      paymentMethod: 'Tarjeta',
      items: [
        { burgerId: 'b1', burgerName: 'Trufada Royale', quantity: 2, unitPrice: 14.0 },
      ],
    },
    {
      id: 'TK-1002',
      timestamp: '2026-10-17T21:15:00Z', // Saturday night
      totalAmount: 26.5,
      paymentMethod: 'Tarjeta',
      items: [
        { burgerId: 'b1', burgerName: 'Trufada Royale', quantity: 1, unitPrice: 14.0 },
        { burgerId: 'b2', burgerName: 'La Bestia BBQ Smash', quantity: 1, unitPrice: 12.5 },
      ],
    },
  ],
};

test('calculateCustomerAnalytics computes average ticket and totals accurately', () => {
  const refDate = new Date('2026-10-31T12:00:00Z');
  const analytics = calculateCustomerAnalytics(mockCustomer, mockBurgers, refDate);

  assert.equal(analytics.totalOrders, 2);
  assert.equal(analytics.totalSpent, 54.5);
  assert.equal(analytics.averageTicket, 27.25);
  assert.equal(analytics.favoriteBurgerName, 'Trufada Royale');
  assert.equal(analytics.topProducts[0].count, 3); // 2 in first order + 1 in second
  assert.equal(analytics.isBirthdayThisMonth, false); // November vs October
  assert.equal(analytics.daysUntilBirthday, 5); // Nov 5 is 5 days from Oct 31
});

test('calculateCustomerAnalytics detects peak day and generates personalized promos', () => {
  const refDate = new Date('2026-10-31T12:00:00Z');
  const analytics = calculateCustomerAnalytics(mockCustomer, mockBurgers, refDate);

  // Both orders were on Saturday
  assert.equal(analytics.peakDay, 'Sábado');
  assert.ok(analytics.recommendedPromotions.length >= 2);

  // Should have promo for favorite burger
  const favPromo = analytics.recommendedPromotions.find((p) => p.title.includes('Trufada Royale'));
  assert.ok(favPromo, 'Should include favorite burger promotion');
  assert.ok(favPromo?.whatsappMessage.includes('Trufada Royale'));

  // Should have birthday promo since it is in 5 days
  const bdayPromo = analytics.recommendedPromotions.find((p) => p.badge === 'Club Cumpleañero');
  assert.ok(bdayPromo, 'Should offer birthday promotion when within 20 days');
});

test('addNewOrderToCustomer updates orders list and recalculates stats cleanly', () => {
  const refDate = new Date('2026-10-31T12:00:00Z');
  const initialAnalytics = calculateCustomerAnalytics(mockCustomer, mockBurgers, refDate);
  assert.equal(initialAnalytics.totalOrders, 2);

  const updatedCustomer = addNewOrderToCustomer(mockCustomer, {
    timestamp: '2026-10-31T20:00:00Z',
    totalAmount: 12.5,
    paymentMethod: 'Tarjeta',
    items: [
      { burgerId: 'b2', burgerName: 'La Bestia BBQ Smash', quantity: 1, unitPrice: 12.5 },
    ],
  });

  assert.equal(updatedCustomer.orders.length, 3);
  assert.ok(updatedCustomer.orders[0].id.startsWith('TK-'));

  const newAnalytics = calculateCustomerAnalytics(updatedCustomer, mockBurgers, refDate);
  assert.equal(newAnalytics.totalOrders, 3);
  assert.equal(newAnalytics.totalSpent, 67.0);
  assert.equal(newAnalytics.averageTicket, 22.33);
});

test('calculateKitchenGlobalStats calculates kitchen KPIs across clients', () => {
  const stats = calculateKitchenGlobalStats([mockCustomer], mockBurgers);
  assert.equal(stats.totalCustomers, 1);
  assert.equal(stats.totalOrders, 2);
  assert.equal(stats.globalAverageTicket, 27.25);
  assert.equal(stats.topSellingBurger.name, 'Trufada Royale');
});

test('generateSeedCustomers generates exactly 300 customers with complete CRM profiles', async () => {
  const { generateSeedCustomers } = await import('../data/seedData');
  const customers = generateSeedCustomers();
  assert.equal(customers.length, 300, 'Must have exactly 300 customers');

  // Verify first and random customers
  const sample = customers[0];
  assert.ok(sample.id);
  assert.ok(sample.name);
  assert.ok(sample.email.includes('@'));
  assert.ok(sample.phone);
  assert.ok(sample.address);
  assert.ok(sample.birthDate);
  assert.ok(sample.coordinates.lat && sample.coordinates.lng);
  assert.ok(sample.orders.length > 0);

  const sampleOrder = sample.orders[0];
  assert.ok(sampleOrder.id.startsWith('TK-'));
  assert.ok(sampleOrder.totalAmount > 0);
  assert.ok(sampleOrder.items.length > 0);

  const globalStats = calculateKitchenGlobalStats(customers, mockBurgers);
  assert.equal(globalStats.totalCustomers, 300);
  assert.ok(globalStats.totalOrders > 500);
  assert.ok(globalStats.globalAverageTicket > 10);
});

