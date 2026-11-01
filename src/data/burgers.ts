import { Burger } from '../types';

export const BURGERS: Burger[] = [
  {
    id: 'b1',
    name: 'Trufada Royale',
    tagline: 'Angus 180g con mayonesa de trufa negra y gouda ahumado',
    price: 14.5,
    category: 'Gourmet',
    description:
      'Medallón de angus certificado 180g, mayonesa artesanal de trufa negra, champiñones salteados al romero y queso gouda ahumado holandés en suave pan brioche tostado con mantequilla.',
    badgeColor: 'amber',
    markerColor: '#f59e0b',
  },
  {
    id: 'b2',
    name: 'La Bestia BBQ Smash',
    tagline: 'Doble smash crispy con bacon crocante y BBQ ahumada',
    price: 13.0,
    category: 'Smash',
    description:
      'Doble smash de res 2x90g con costra caramelizada, doble queso cheddar fundido, tocineta ahumada crujiente, cebolla crispy y salsa BBQ casera al bourbon.',
    badgeColor: 'red',
    markerColor: '#ef4444',
  },
  {
    id: 'b3',
    name: 'Clásica Doble Cheddar',
    tagline: 'La receta clásica americana infalible y ultra jugosa',
    price: 11.0,
    category: 'Clásica',
    description:
      'Doble carne de res premium, cuádruple queso cheddar americano derretido, pepinillos encurtidos en casa con eneldo, cebolla morada picada y salsa secreta Ghost.',
    badgeColor: 'emerald',
    markerColor: '#10b981',
  },
  {
    id: 'b4',
    name: 'Spicy Habanero Crunch',
    tagline: 'Picante y adictiva con pepper jack y jalapeños glaseados',
    price: 13.5,
    category: 'Spicy',
    description:
      'Blend de picaña y brisket, queso pepper jack fundido, toreado de jalapeños y habanero con miel de agave, guacamole rústico y nachos artesanales crocantes.',
    badgeColor: 'orange',
    markerColor: '#f97316',
  },
  {
    id: 'b5',
    name: 'Veggie Portobello Melt',
    tagline: 'Medallón de portobello a las hierbas con provolone gratinado',
    price: 12.0,
    category: 'Veggie',
    description:
      'Sombrero de hongo portobello marinado en hierbas provenzales y grillado, provolone ahumado derretido, tomates secos confitados, rúcula fresca y suave alioli de ajo asado.',
    badgeColor: 'purple',
    markerColor: '#a855f7',
  },
];

export const KITCHEN_LOCATION = {
  name: 'GhostBurger Central Dark Kitchen',
  lat: 4.6560,
  lng: -74.0570,
  address: 'Calle 72 #9-45 (Cocina Principal - Operaciones & Despacho)',
  deliveryRadiiKm: [2.5, 5.0, 7.5],
};
