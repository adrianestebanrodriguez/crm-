import React, { useEffect, useRef, useState, useMemo } from 'react';
import L from 'leaflet';
import {
  Customer,
  Burger,
  CustomerAnalytics,
} from '../types';
import { KITCHEN_LOCATION } from '../data/burgers';
import { calculateCustomerAnalytics } from '../utils/analytics';
import {
  MapPin,
  Filter,
  Layers,
  Search,
  ExternalLink,
  PlusCircle,
  Sparkles,
  ShoppingBag,
  Award,
  Calendar,
  Clock,
  Phone,
  ChevronRight,
} from 'lucide-react';

interface MapViewProps {
  customers: Customer[];
  burgers: Burger[];
  onSelectCustomer: (customer: Customer) => void;
  onNewOrderForCustomer: (customer: Customer) => void;
  selectedCustomerId?: string | null;
  searchQuery: string;
}

export const MapView: React.FC<MapViewProps> = ({
  customers,
  burgers,
  onSelectCustomer,
  onNewOrderForCustomer,
  selectedCustomerId,
  searchQuery,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const circlesLayerRef = useRef<L.LayerGroup | null>(null);

  // Filters
  const [selectedBurgerFilter, setSelectedBurgerFilter] = useState<string>('all');
  const [segmentFilter, setSegmentFilter] = useState<'all' | 'vip' | 'at-risk' | 'birthday'>('all');
  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [showCoverageRings, setShowCoverageRings] = useState<boolean>(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );

  // Precompute analytics for each customer for high performance
  const customerAnalyticsMap = useMemo(() => {
    const map = new Map<string, CustomerAnalytics>();
    customers.forEach((c) => {
      map.set(c.id, calculateCustomerAnalytics(c, burgers));
    });
    return map;
  }, [customers, burgers]);

  // Unique zones
  const zones = useMemo(() => {
    const set = new Set<string>();
    customers.forEach((c) => {
      if (c.zone) set.add(c.zone);
    });
    return Array.from(set).sort();
  }, [customers]);

  // Filtered customers
  const filteredCustomers = useMemo(() => {
    return customers.filter((customer) => {
      const analytics = customerAnalyticsMap.get(customer.id);
      if (!analytics) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesName = customer.name.toLowerCase().includes(q);
        const matchesPhone = customer.phone.includes(q);
        const matchesAddress = customer.address.toLowerCase().includes(q);
        const matchesBurger = analytics.favoriteBurgerName.toLowerCase().includes(q);
        if (!matchesName && !matchesPhone && !matchesAddress && !matchesBurger) {
          return false;
        }
      }

      // Burger filter
      if (selectedBurgerFilter !== 'all') {
        if (analytics.favoriteBurgerId !== selectedBurgerFilter) {
          return false;
        }
      }

      // Zone filter
      if (selectedZone !== 'all' && customer.zone !== selectedZone) {
        return false;
      }

      // Segment filter
      if (segmentFilter === 'vip' && analytics.customerSegment !== 'VIP High-Ticket') {
        return false;
      }
      if (segmentFilter === 'at-risk' && analytics.customerSegment !== 'En Riesgo (>35d)') {
        return false;
      }
      if (segmentFilter === 'birthday' && !analytics.isBirthdayThisMonth && analytics.daysUntilBirthday > 20) {
        return false;
      }

      return true;
    });
  }, [customers, customerAnalyticsMap, searchQuery, selectedBurgerFilter, selectedZone, segmentFilter]);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;

    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [KITCHEN_LOCATION.lat, KITCHEN_LOCATION.lng],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      // OpenStreetMap public tiles without API key requirements
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        className: 'osm-dark-mode-tiles',
      }).addTo(map);

      // Custom zoom control in bottom right
      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // Attribution
      L.control
        .attribution({ position: 'bottomleft', prefix: false })
        .addAttribution('&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors')
        .addTo(map);

      // Layers for circles & markers
      const circlesLayer = L.layerGroup().addTo(map);
      const markersLayer = L.layerGroup().addTo(map);

      circlesLayerRef.current = circlesLayer;
      markersLayerRef.current = markersLayer;
      mapInstanceRef.current = map;
    }

    return () => {
      // Map cleanup if needed on unmount
    };
  }, []);

  // Update Kitchen Marker & Delivery Radii Rings
  useEffect(() => {
    const map = mapInstanceRef.current;
    const circlesLayer = circlesLayerRef.current;
    if (!map || !circlesLayer) return;

    circlesLayer.clearLayers();

    // Central Kitchen Beacon
    const kitchenIcon = L.divIcon({
      className: 'kitchen-hub-marker',
      html: `
        <div style="position: relative; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; inset: 0; background: rgba(249, 115, 22, 0.35); border-radius: 9999px; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="position: relative; width: 34px; height: 34px; background: #ea580c; border: 2.5px solid #ffffff; border-radius: 9999px; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 14px rgba(234,88,12,0.6);">
            <svg style="width: 18px; height: 18px; color: white;" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
        </div>
      `,
      iconSize: [44, 44],
      iconAnchor: [22, 22],
    });

    const kitchenMarker = L.marker([KITCHEN_LOCATION.lat, KITCHEN_LOCATION.lng], {
      icon: kitchenIcon,
      zIndexOffset: 1000,
    });

    kitchenMarker.bindPopup(`
      <div style="color: #18181b; font-family: sans-serif; padding: 4px; min-width: 200px;">
        <div style="font-weight: bold; font-size: 13px; color: #ea580c; margin-bottom: 2px;">
          🍔 ${KITCHEN_LOCATION.name}
        </div>
        <div style="font-size: 11px; color: #52525b; margin-bottom: 6px;">
          ${KITCHEN_LOCATION.address}
        </div>
        <div style="font-size: 10px; background: #fff7ed; border: 1px solid #fed7aa; padding: 4px 8px; border-radius: 6px; color: #c2410c;">
          Hub central de despacho y producción
        </div>
      </div>
    `);

    circlesLayer.addLayer(kitchenMarker);

    // Delivery radii rings if enabled
    if (showCoverageRings) {
      const colors = ['#10b981', '#f59e0b', '#ef4444'];
      const labels = ['Radio Express 2.5km (15-20 min)', 'Radio Estándar 5km (25-35 min)', 'Radio Extendido 7.5km (35-45 min)'];

      KITCHEN_LOCATION.deliveryRadiiKm.forEach((radiusKm, idx) => {
        const circle = L.circle([KITCHEN_LOCATION.lat, KITCHEN_LOCATION.lng], {
          radius: radiusKm * 1000,
          color: colors[idx],
          weight: 1.5,
          opacity: 0.6,
          fillColor: colors[idx],
          fillOpacity: 0.03,
          dashArray: '6, 6',
        });
        circle.bindTooltip(labels[idx], { sticky: true, className: 'leaflet-custom-tooltip' });
        circlesLayer.addLayer(circle);
      });
    }
  }, [showCoverageRings]);

  // Update Customer Markers
  useEffect(() => {
    const map = mapInstanceRef.current;
    const markersLayer = markersLayerRef.current;
    if (!map || !markersLayer) return;

    markersLayer.clearLayers();

    filteredCustomers.forEach((customer) => {
      const analytics = customerAnalyticsMap.get(customer.id);
      if (!analytics) return;

      const burgerObj = burgers.find((b) => b.id === analytics.favoriteBurgerId) || burgers[0];
      const markerColor = burgerObj.markerColor || '#f59e0b';
      const isSelected = selectedCustomerId === customer.id;

      // Custom marker icon with burger color and selection highlight
      const customIcon = L.divIcon({
        className: `customer-marker-${customer.id}`,
        html: `
          <div style="
            position: relative;
            width: ${isSelected ? '32px' : '22px'};
            height: ${isSelected ? '32px' : '22px'};
            background-color: ${markerColor};
            border: ${isSelected ? '3px solid #ffffff' : '2px solid rgba(255,255,255,0.85)'};
            border-radius: 9999px;
            box-shadow: 0 0 10px ${markerColor}99, 0 3px 6px rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s ease;
            cursor: pointer;
          ">
            <div style="
              width: ${isSelected ? '10px' : '6px'};
              height: ${isSelected ? '10px' : '6px'};
              background-color: #ffffff;
              border-radius: 9999px;
            "></div>
          </div>
        `,
        iconSize: [isSelected ? 32 : 22, isSelected ? 32 : 22],
        iconAnchor: [isSelected ? 16 : 11, isSelected ? 16 : 11],
      });

      const marker = L.marker([customer.coordinates.lat, customer.coordinates.lng], {
        icon: customIcon,
      });

      // Popup content
      const popupHtml = `
        <div style="color: #09090b; font-family: ui-sans-serif, system-ui, sans-serif; padding: 2px; min-width: 230px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 4px;">
            <span style="font-weight: 700; font-size: 13px; color: #18181b;">${customer.name}</span>
            <span style="font-size: 10px; font-weight: 600; padding: 2px 6px; border-radius: 4px; background: ${markerColor}20; color: ${markerColor}; border: 1px solid ${markerColor}50;">
              ${analytics.customerSegment}
            </span>
          </div>

          <div style="font-size: 11px; color: #71717a; margin-bottom: 8px;">
            📍 ${customer.address}
          </div>

          <div style="background: #f4f4f5; padding: 6px 8px; border-radius: 6px; margin-bottom: 8px; display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 11px;">
            <div>
              <div style="color: #71717a; font-size: 9px; text-transform: uppercase;">Ticket Medio</div>
              <div style="font-weight: 700; color: #059669; font-size: 12px;">$${analytics.averageTicket.toFixed(2)}</div>
            </div>
            <div>
              <div style="color: #71717a; font-size: 9px; text-transform: uppercase;">Favorita</div>
              <div style="font-weight: 600; color: #d97706; font-size: 11px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
                ${analytics.favoriteBurgerName}
              </div>
            </div>
          </div>

          <div style="font-size: 10px; color: #52525b; margin-bottom: 8px;">
            ⏰ Pide: <b>${analytics.peakDay}</b> (${analytics.peakHourSlot})
          </div>

          <div style="display: flex; gap: 4px;">
            <button id="btn-view-profile-${customer.id}" style="
              flex: 1;
              background: #f59e0b;
              color: #09090b;
              font-weight: 600;
              font-size: 11px;
              padding: 6px 8px;
              border: none;
              border-radius: 6px;
              cursor: pointer;
            ">
              Ver Perfil & Promos
            </button>
            <button id="btn-new-order-${customer.id}" style="
              background: #18181b;
              color: #ffffff;
              font-weight: 600;
              font-size: 11px;
              padding: 6px 8px;
              border: none;
              border-radius: 6px;
              cursor: pointer;
            ">
              + Pedido
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml, { maxWidth: 280, closeButton: false });

      marker.on('popupopen', () => {
        const viewBtn = document.getElementById(`btn-view-profile-${customer.id}`);
        if (viewBtn) {
          viewBtn.onclick = () => {
            onSelectCustomer(customer);
          };
        }
        const orderBtn = document.getElementById(`btn-new-order-${customer.id}`);
        if (orderBtn) {
          orderBtn.onclick = () => {
            onNewOrderForCustomer(customer);
          };
        }
      });

      marker.on('click', () => {
        onSelectCustomer(customer);
      });

      markersLayer.addLayer(marker);
    });
  }, [filteredCustomers, customerAnalyticsMap, burgers, selectedCustomerId, onSelectCustomer, onNewOrderForCustomer]);

  // Center on selected customer if changed externally
  useEffect(() => {
    if (!selectedCustomerId || !mapInstanceRef.current) return;
    const target = customers.find((c) => c.id === selectedCustomerId);
    if (target) {
      mapInstanceRef.current.flyTo([target.coordinates.lat, target.coordinates.lng], 15, {
        duration: 0.8,
      });
    }
  }, [selectedCustomerId, customers]);

  return (
    <div className="relative w-full h-[calc(100vh-125px)] overflow-hidden bg-zinc-950 flex">
      {/* Map Filter Toolbar Overlay */}
      <div className="absolute top-3 left-3 z-[25] flex flex-wrap items-center gap-2 bg-zinc-900/90 backdrop-blur-md p-2 rounded-xl border border-zinc-800 shadow-xl max-w-full">
        {/* Burger Filter Pills */}
        <div className="flex items-center gap-1 overflow-x-auto max-w-[500px] scrollbar-none py-0.5">
          <button
            onClick={() => setSelectedBurgerFilter('all')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
              selectedBurgerFilter === 'all'
                ? 'bg-zinc-200 text-zinc-950 font-semibold'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
            }`}
          >
            Todas ({customers.length})
          </button>
          {burgers.map((b) => (
            <button
              key={b.id}
              onClick={() => setSelectedBurgerFilter(b.id)}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all shrink-0 ${
                selectedBurgerFilter === b.id
                  ? 'bg-amber-500 text-zinc-950 font-semibold shadow'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: b.markerColor }}
              />
              <span>{b.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        <div className="h-4 w-px bg-zinc-700 hidden sm:block" />

        {/* Segment Filter */}
        <select
          value={segmentFilter}
          onChange={(e) => setSegmentFilter(e.target.value as any)}
          className="bg-zinc-950 border border-zinc-700 text-xs text-zinc-300 rounded-lg px-2 py-1 focus:outline-none focus:border-amber-500"
        >
          <option value="all">Todos los segmentos</option>
          <option value="vip">⭐ VIP High-Ticket (&gt; $22)</option>
          <option value="at-risk">⚠️ En Riesgo (&gt; 35d)</option>
          <option value="birthday">🎂 Cumpleañeros</option>
        </select>

        {/* Zone Selector */}
        <select
          value={selectedZone}
          onChange={(e) => setSelectedZone(e.target.value)}
          className="bg-zinc-950 border border-zinc-700 text-xs text-zinc-300 rounded-lg px-2 py-1 focus:outline-none focus:border-amber-500 hidden md:block"
        >
          <option value="all">Todas las zonas ({zones.length})</option>
          {zones.map((z) => (
            <option key={z} value={z}>
              {z}
            </option>
          ))}
        </select>

        {/* Toggle Radii */}
        <button
          onClick={() => setShowCoverageRings(!showCoverageRings)}
          className={`px-2 py-1 rounded-lg text-xs font-medium border transition-colors hidden sm:flex items-center gap-1 ${
            showCoverageRings
              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
              : 'bg-zinc-950 text-zinc-500 border-zinc-800'
          }`}
          title="Alternar radios de cobertura delivery"
        >
          <Layers className="w-3 h-3" />
          <span>Radios Despacho</span>
        </button>

        {/* Toggle Sidebar */}
        <button
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          className="px-2 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-lg text-xs font-medium ml-auto"
        >
          {isSidebarOpen ? 'Ocultar Lista' : `Ver Lista (${filteredCustomers.length})`}
        </button>
      </div>

      {/* Main Map Canvas */}
      <div className="flex-1 h-full w-full relative">
        <div ref={mapContainerRef} className="w-full h-full z-10" />

        {/* Map Legend */}
        <div className="absolute bottom-3 left-3 z-[25] bg-zinc-900/90 backdrop-blur-md p-2.5 rounded-xl border border-zinc-800 text-[11px] text-zinc-300 shadow-xl hidden md:block">
          <div className="font-semibold text-white mb-1.5 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Leyenda de Clientes (Hamburguesa Favorita)</span>
          </div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            {burgers.map((b) => (
              <div key={b.id} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: b.markerColor }}
                />
                <span className="text-zinc-400 truncate max-w-[130px]">{b.name}</span>
              </div>
            ))}
            <div className="flex items-center gap-1.5 col-span-2 pt-1 border-t border-zinc-800 mt-0.5">
              <span className="w-3 h-3 rounded-full bg-orange-600 border border-white" />
              <span className="text-orange-400 font-medium">Cocina Oculta Central (Hub)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Side Customer Drawer */}
      {isSidebarOpen && (
        <aside className="fixed inset-y-0 right-0 top-36 md:top-0 md:static w-full sm:w-80 md:w-96 bg-zinc-900/98 backdrop-blur-md border-l border-zinc-800 flex flex-col h-full z-30 shrink-0 shadow-2xl md:shadow-none">
          {/* Header */}
          <div className="p-3.5 border-b border-zinc-800 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                <span>Clientes Filtrados</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20 text-xs">
                  {filteredCustomers.length} de {customers.length}
                </span>
              </h2>
              <p className="text-[11px] text-zinc-400">
                Haz clic en cualquier cliente para localizarlo
              </p>
            </div>
          </div>

          {/* Customer list scrollable */}
          <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/60 p-2 space-y-1">
            {filteredCustomers.length === 0 ? (
              <div className="p-8 text-center text-zinc-500 text-xs">
                No se encontraron clientes con los filtros seleccionados.
              </div>
            ) : (
              filteredCustomers.map((customer) => {
                const analytics = customerAnalyticsMap.get(customer.id);
                if (!analytics) return null;
                const isSelected = selectedCustomerId === customer.id;

                const burgerObj =
                  burgers.find((b) => b.id === analytics.favoriteBurgerId) || burgers[0];

                return (
                  <div
                    key={customer.id}
                    onClick={() => {
                      onSelectCustomer(customer);
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.flyTo(
                          [customer.coordinates.lat, customer.coordinates.lng],
                          16,
                          { duration: 0.6 }
                        );
                      }
                    }}
                    className={`p-3 rounded-xl cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-amber-500/10 border border-amber-500/40 shadow-sm'
                        : 'bg-zinc-950/40 hover:bg-zinc-800/60 border border-zinc-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: burgerObj.markerColor }}
                          title={`Burger favorita: ${analytics.favoriteBurgerName}`}
                        />
                        <span className="font-semibold text-xs text-white truncate max-w-[150px]">
                          {customer.name}
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-emerald-400">
                        ${analytics.averageTicket.toFixed(2)}
                      </span>
                    </div>

                    <div className="text-[11px] text-zinc-400 flex items-center gap-1 truncate mb-2">
                      <MapPin className="w-3 h-3 text-zinc-500 shrink-0" />
                      <span className="truncate">{customer.address}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[10px] text-zinc-400 bg-zinc-900/80 p-2 rounded-lg border border-zinc-800">
                      <div>
                        <span className="text-zinc-500 block">Favorita:</span>
                        <span className="font-medium text-zinc-300 truncate block">
                          {analytics.favoriteBurgerName}
                        </span>
                      </div>
                      <div>
                        <span className="text-zinc-500 block">Horario habitual:</span>
                        <span className="font-medium text-amber-300/90 truncate block">
                          {analytics.peakDay} ({analytics.peakHourSlot.split(' ')[0]})
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between pt-1">
                      <span className="text-[10px] text-zinc-500">
                        {analytics.totalOrders} pedidos realizados
                      </span>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onNewOrderForCustomer(customer);
                          }}
                          className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-[10px] font-medium transition-colors"
                        >
                          + Pedido
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCustomer(customer);
                          }}
                          className="px-2 py-0.5 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 text-[10px] font-medium flex items-center gap-0.5 transition-colors"
                        >
                          <span>Perfil</span>
                          <ChevronRight className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </aside>
      )}
    </div>
  );
};
