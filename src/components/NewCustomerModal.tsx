import React, { useState } from 'react';
import { Customer } from '../types';
import { X, UserPlus, MapPin, Phone, Mail, Calendar, CheckCircle2 } from 'lucide-react';
import { KITCHEN_LOCATION } from '../data/burgers';

interface NewCustomerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCustomerCreated: (newCustomer: Customer) => void;
}

export const NewCustomerModal: React.FC<NewCustomerModalProps> = ({
  isOpen,
  onClose,
  onCustomerCreated,
}) => {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('+57 3');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [zone, setZone] = useState('Chapinero Alto');
  const [birthDate, setBirthDate] = useState('1995-05-15');
  const [lat, setLat] = useState(KITCHEN_LOCATION.lat + 0.005);
  const [lng, setLng] = useState(KITCHEN_LOCATION.lng + 0.004);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !address.trim()) {
      alert('Por favor completa el nombre y la dirección');
      return;
    }

    const newCust: Customer = {
      id: `cust-${Date.now()}`,
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '')}@gmail.com`,
      address: address.trim(),
      zone,
      birthDate,
      coordinates: {
        lat: Number(lat),
        lng: Number(lng),
      },
      orders: [],
      createdAt: new Date().toISOString().slice(0, 10),
    };

    onCustomerCreated(newCust);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-lg bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-zinc-800 bg-zinc-900 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">Registrar Nuevo Cliente</h1>
              <p className="text-xs text-zinc-400">Añadir al CRM y geolocalizar en el mapa</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Nombre Completo *
            </label>
            <input
              type="text"
              required
              placeholder="Ej: Laura Camila Restrepo"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-700 text-xs rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Celular / WhatsApp *
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 text-xs rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                placeholder="cliente@ejemplo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 text-xs rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Dirección de Entrega *
              </label>
              <input
                type="text"
                required
                placeholder="Calle 85 #14-22 Apt 402"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 text-xs rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Zona / Barrio
              </label>
              <select
                value={zone}
                onChange={(e) => setZone(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 text-xs rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              >
                <option value="Chapinero Alto">Chapinero Alto</option>
                <option value="Zona G / Rosales">Zona G / Rosales</option>
                <option value="Parque de la 93">Parque de la 93</option>
                <option value="Chicó Norte / Virrey">Chicó Norte / Virrey</option>
                <option value="Usaquén Plaza">Usaquén Plaza</option>
                <option value="Quinta Camacho">Quinta Camacho</option>
                <option value="Teusaquillo Gourmet">Teusaquillo Gourmet</option>
                <option value="Santa Bárbara">Santa Bárbara</option>
                <option value="Cedritos Delivery">Cedritos Delivery</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Fecha de Nacimiento (Cumpleaños)
              </label>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-700 text-xs rounded-xl px-3 py-2 text-white focus:outline-none focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Geolocalización (Lat, Lng)
              </label>
              <div className="flex gap-1">
                <input
                  type="number"
                  step="0.0001"
                  value={lat}
                  onChange={(e) => setLat(parseFloat(e.target.value) || 0)}
                  className="w-1/2 bg-zinc-900 border border-zinc-700 text-[11px] rounded-xl px-2 py-2 text-zinc-300 focus:outline-none"
                />
                <input
                  type="number"
                  step="0.0001"
                  value={lng}
                  onChange={(e) => setLng(parseFloat(e.target.value) || 0)}
                  className="w-1/2 bg-zinc-900 border border-zinc-700 text-[11px] rounded-xl px-2 py-2 text-zinc-300 focus:outline-none"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-zinc-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-lg transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white text-xs font-bold rounded-lg shadow-md transition-all flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Guardar Cliente</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
