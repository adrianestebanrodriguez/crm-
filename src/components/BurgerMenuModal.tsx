import React from 'react';
import { Burger, Customer } from '../types';
import { X, Flame, DollarSign, Award, ShoppingBag } from 'lucide-react';

interface BurgerMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  burgers: Burger[];
  customers: Customer[];
  onOrderBurger: (burgerId: string) => void;
}

export const BurgerMenuModal: React.FC<BurgerMenuModalProps> = ({
  isOpen,
  onClose,
  burgers,
  customers,
  onOrderBurger,
}) => {
  if (!isOpen) return null;

  // Compute stats per burger
  const burgerStats = burgers.map((b) => {
    let unitsSold = 0;
    let totalRevenue = 0;
    let uniqueLovers = 0;

    customers.forEach((c) => {
      let clientBoughtThis = false;
      (c.orders || []).forEach((o) => {
        (o.items || []).forEach((item) => {
          if (item.burgerId === b.id) {
            unitsSold += item.quantity;
            totalRevenue += item.quantity * item.unitPrice;
            clientBoughtThis = true;
          }
        });
      });
      if (clientBoughtThis) uniqueLovers++;
    });

    return {
      ...b,
      unitsSold,
      totalRevenue,
      uniqueLovers,
    };
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">
                Las 5 Hamburguesas de la Cocina Oculta
              </h1>
              <p className="text-xs text-zinc-400">
                Catálogo de productos, recetas, precios y rendimiento de ventas sobre los 300 clientes
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

        {/* List of burgers */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {burgerStats.map((burger) => (
              <div
                key={burger.id}
                className="bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 space-y-3 flex flex-col justify-between hover:border-amber-500/40 transition-all"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="w-3.5 h-3.5 rounded-full shrink-0"
                        style={{ backgroundColor: burger.markerColor }}
                      />
                      <div>
                        <h2 className="text-base font-bold text-white">{burger.name}</h2>
                        <span className="text-[10px] uppercase font-semibold text-zinc-400">
                          Línea {burger.category}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-lg font-black text-emerald-400">
                        ${burger.price.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-zinc-300 italic mt-2">{burger.tagline}</p>
                  <p className="text-xs text-zinc-400 mt-1 leading-relaxed">
                    {burger.description}
                  </p>
                </div>

                {/* Performance stats */}
                <div className="pt-3 border-t border-zinc-800 grid grid-cols-3 gap-2 bg-zinc-950/70 p-2.5 rounded-xl text-center text-xs">
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Unidades</span>
                    <span className="font-bold text-white text-sm">
                      {burger.unitsSold}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Facturación</span>
                    <span className="font-bold text-emerald-400 text-sm">
                      ${burger.totalRevenue.toFixed(0)}
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-zinc-500 block">Clientes</span>
                    <span className="font-bold text-amber-300 text-sm">
                      {burger.uniqueLovers}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-zinc-900 border-t border-zinc-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg transition-colors"
          >
            Cerrar Menú
          </button>
        </div>
      </div>
    </div>
  );
};
