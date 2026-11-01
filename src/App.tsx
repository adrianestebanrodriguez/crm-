import React, { useState, useMemo, useCallback } from 'react';
import { Customer, Burger, Order, CustomerAnalytics } from './types';
import { BURGERS } from './data/burgers';
import {
  getInitialCustomers,
  saveCustomersToStorage,
  resetCustomersToDefault,
} from './data/seedData';
import {
  calculateCustomerAnalytics,
  addNewOrderToCustomer,
  calculateKitchenGlobalStats,
} from './utils/analytics';
import { Navbar } from './components/Navbar';
import { StatsBar } from './components/StatsBar';
import { MapView } from './components/MapView';
import { ClientDirectory } from './components/ClientDirectory';
import { CustomerDetailModal } from './components/CustomerDetailModal';
import { NewOrderModal } from './components/NewOrderModal';
import { NewCustomerModal } from './components/NewCustomerModal';
import { PromotionsHub } from './components/PromotionsHub';
import { BurgerMenuModal } from './components/BurgerMenuModal';
import { CheckCircle2, X } from 'lucide-react';

export default function App() {
  const [customers, setCustomers] = useState<Customer[]>(() => getInitialCustomers());
  const [burgers] = useState<Burger[]>(BURGERS);

  // Active view
  const [activeTab, setActiveTab] = useState<'map' | 'crm' | 'promotions' | 'menu'>('map');

  // Search query
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Selected customer for modal view
  const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null);

  // Modals state
  const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState<boolean>(false);
  const [newOrderInitialCustomerId, setNewOrderInitialCustomerId] = useState<string | null>(null);
  const [isNewCustomerModalOpen, setIsNewCustomerModalOpen] = useState<boolean>(false);
  const [isBurgerMenuModalOpen, setIsBurgerMenuModalOpen] = useState<boolean>(false);

  // Notification Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  }, []);

  // Kitchen global stats
  const kitchenStats = useMemo(() => {
    return calculateKitchenGlobalStats(customers, burgers);
  }, [customers, burgers]);

  // Selected customer object & analytics
  const selectedCustomer = useMemo(() => {
    if (!selectedCustomerId) return null;
    return customers.find((c) => c.id === selectedCustomerId) || null;
  }, [customers, selectedCustomerId]);

  const selectedCustomerAnalytics = useMemo(() => {
    if (!selectedCustomer) return null;
    return calculateCustomerAnalytics(selectedCustomer, burgers);
  }, [selectedCustomer, burgers]);

  // Action handlers
  const handleSelectCustomer = useCallback((customer: Customer) => {
    setSelectedCustomerId(customer.id);
  }, []);

  const handleOpenNewOrder = useCallback((customer?: Customer) => {
    if (customer) {
      setNewOrderInitialCustomerId(customer.id);
    } else {
      setNewOrderInitialCustomerId(null);
    }
    setIsNewOrderModalOpen(true);
  }, []);

  const handleLocateOnMap = useCallback((customer: Customer) => {
    setSelectedCustomerId(customer.id);
    setActiveTab('map');
  }, []);

  const handleOrderCreated = useCallback(
    (customerId: string, newOrder: Omit<Order, 'id'> & { id?: string }) => {
      setCustomers((prevCustomers) => {
        const targetIndex = prevCustomers.findIndex((c) => c.id === customerId);
        if (targetIndex === -1) return prevCustomers;

        const updatedCustomer = addNewOrderToCustomer(prevCustomers[targetIndex], newOrder);
        const updatedList = [...prevCustomers];
        updatedList[targetIndex] = updatedCustomer;

        saveCustomersToStorage(updatedList);

        showToast(
          `¡Pedido ${newOrder.id || 'registrado'} creado con éxito! El ticket medio de ${updatedCustomer.name.split(' ')[0]} ha sido recalculado.`
        );

        return updatedList;
      });
    },
    [showToast]
  );

  const handleCustomerCreated = useCallback(
    (newCust: Customer) => {
      setCustomers((prev) => {
        const next = [newCust, ...prev];
        saveCustomersToStorage(next);
        showToast(`¡Cliente ${newCust.name} registrado y ubicado en el mapa!`);
        return next;
      });
      setSelectedCustomerId(newCust.id);
    },
    [showToast]
  );

  const handleResetData = useCallback(() => {
    if (
      window.confirm(
        '¿Restablecer los datos originales de la cocina oculta (300 clientes y sus compras)?'
      )
    ) {
      const reset = resetCustomersToDefault();
      setCustomers(reset);
      showToast('Datos restablecidos: 300 clientes cargados con su historial.');
    }
  }, [showToast]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans selection:bg-amber-500 selection:text-zinc-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-4 right-4 z-[999] flex items-center gap-2 px-4 py-3 bg-zinc-900 border border-emerald-500/50 text-emerald-400 rounded-xl shadow-2xl animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-400" />
          <span className="text-xs font-semibold">{toastMessage}</span>
          <button
            onClick={() => setToastMessage(null)}
            className="text-zinc-400 hover:text-white ml-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          if (tab === 'menu') {
            setIsBurgerMenuModalOpen(true);
          } else {
            setActiveTab(tab);
          }
        }}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onOpenNewOrder={() => handleOpenNewOrder()}
        onOpenNewCustomer={() => setIsNewCustomerModalOpen(true)}
        onResetData={handleResetData}
        totalCustomers={customers.length}
      />

      {/* KPI Stats Bar */}
      <StatsBar
        stats={kitchenStats}
        onFilterAtRisk={() => {
          setActiveTab('crm');
        }}
      />

      {/* Active View Container */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {activeTab === 'map' && (
          <MapView
            customers={customers}
            burgers={burgers}
            onSelectCustomer={handleSelectCustomer}
            onNewOrderForCustomer={(c) => handleOpenNewOrder(c)}
            selectedCustomerId={selectedCustomerId}
            searchQuery={searchQuery}
          />
        )}

        {activeTab === 'crm' && (
          <div className="flex-1 overflow-y-auto">
            <ClientDirectory
              customers={customers}
              burgers={burgers}
              onSelectCustomer={handleSelectCustomer}
              onNewOrderForCustomer={(c) => handleOpenNewOrder(c)}
              onLocateOnMap={handleLocateOnMap}
              searchQuery={searchQuery}
              setSearchQuery={setSearchQuery}
            />
          </div>
        )}

        {activeTab === 'promotions' && (
          <div className="flex-1 overflow-y-auto">
            <PromotionsHub
              customers={customers}
              burgers={burgers}
              onSelectCustomer={handleSelectCustomer}
            />
          </div>
        )}
      </main>

      {/* Customer Detail & Promotion Modal */}
      {selectedCustomer && selectedCustomerAnalytics && (
        <CustomerDetailModal
          customer={selectedCustomer}
          analytics={selectedCustomerAnalytics}
          burgers={burgers}
          onClose={() => setSelectedCustomerId(null)}
          onNewOrder={(c) => {
            handleOpenNewOrder(c);
          }}
        />
      )}

      {/* Register New Order Modal */}
      <NewOrderModal
        isOpen={isNewOrderModalOpen}
        onClose={() => {
          setIsNewOrderModalOpen(false);
          setNewOrderInitialCustomerId(null);
        }}
        customers={customers}
        initialCustomerId={newOrderInitialCustomerId}
        burgers={burgers}
        onOrderCreated={handleOrderCreated}
      />

      {/* Register New Customer Modal */}
      <NewCustomerModal
        isOpen={isNewCustomerModalOpen}
        onClose={() => setIsNewCustomerModalOpen(false)}
        onCustomerCreated={handleCustomerCreated}
      />

      {/* 5 Burgers Catalog Modal */}
      <BurgerMenuModal
        isOpen={isBurgerMenuModalOpen}
        onClose={() => setIsBurgerMenuModalOpen(false)}
        burgers={burgers}
        customers={customers}
        onOrderBurger={() => {
          setIsBurgerMenuModalOpen(false);
          setIsNewOrderModalOpen(true);
        }}
      />
    </div>
  );
}
