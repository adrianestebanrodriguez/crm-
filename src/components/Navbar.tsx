import React from 'react';
import {
  MapPin,
  Users,
  Tag,
  PlusCircle,
  RotateCcw,
  Search,
  Sparkles,
  UtensilsCrossed,
  ChefHat,
} from 'lucide-react';

interface NavbarProps {
  activeTab: 'map' | 'crm' | 'promotions' | 'menu';
  setActiveTab: (tab: 'map' | 'crm' | 'promotions' | 'menu') => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  onOpenNewOrder: () => void;
  onOpenNewCustomer: () => void;
  onResetData: () => void;
  totalCustomers: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  searchQuery,
  setSearchQuery,
  onOpenNewOrder,
  onOpenNewCustomer,
  onResetData,
  totalCustomers,
}) => {
  return (
    <header className="bg-zinc-950 border-b border-zinc-800 text-white sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-orange-500 flex items-center justify-center shadow-lg shadow-orange-950/40 border border-orange-400/30">
              <ChefHat className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold tracking-tight text-lg text-white">GhostBurger</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Cocina Oculta
                </span>
              </div>
              <p className="text-xs text-zinc-400 hidden sm:block">
                CRM & Geolocalización de 300 Clientes
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-zinc-900/90 p-1 rounded-xl border border-zinc-800 text-xs">
            <button
              onClick={() => setActiveTab('map')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'map'
                  ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <MapPin className="w-3.5 h-3.5" />
              <span>Mapa Geográfico</span>
            </button>

            <button
              onClick={() => setActiveTab('crm')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'crm'
                  ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>Clientes ({totalCustomers})</span>
            </button>

            <button
              onClick={() => setActiveTab('promotions')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'promotions'
                  ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Promociones Smart</span>
            </button>

            <button
              onClick={() => setActiveTab('menu')}
              className={`hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-medium transition-all ${
                activeTab === 'menu'
                  ? 'bg-amber-500 text-zinc-950 font-semibold shadow-sm'
                  : 'text-zinc-400 hover:text-white hover:bg-zinc-800'
              }`}
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>5 Burgers</span>
            </button>
          </nav>

          {/* Search & Actions */}
          <div className="flex items-center gap-2">
            {/* Global Quick Search */}
            <div className="relative hidden lg:block w-48 xl:w-64">
              <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar cliente, tel..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 text-xs rounded-lg pl-8 pr-3 py-1.5 text-zinc-200 placeholder-zinc-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-zinc-500 hover:text-zinc-300"
                >
                  ×
                </button>
              )}
            </div>

            {/* "+ Registrar Pedido" Primary Action */}
            <button
              onClick={onOpenNewOrder}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-semibold rounded-lg shadow-md transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Nuevo Pedido</span>
            </button>

            {/* "+ Nuevo Cliente" */}
            <button
              onClick={onOpenNewCustomer}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 text-xs font-medium rounded-lg transition-all"
              title="Añadir nuevo cliente"
            >
              <Users className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden md:inline">+ Cliente</span>
            </button>

            {/* Reset data */}
            <button
              onClick={onResetData}
              className="p-1.5 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900 rounded-lg transition-colors border border-transparent hover:border-zinc-800"
              title="Restablecer datos originales (300 clientes)"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
