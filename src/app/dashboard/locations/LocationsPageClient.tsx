'use client'

import { useState } from 'react'
import { createLocation, updateLocation, closeLocationAction, getLocationInventory } from '@/app/actions/location-actions'
import { MapPin, Store, Warehouse, Plus, Edit2, Power, Loader2, Package, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import Swal from 'sweetalert2'
import { LocationType } from '@prisma/client'

interface Location {
  id: string
  name: string
  type: LocationType
  address?: string | null
  phone?: string | null
  email?: string | null
  isActive: boolean
  createdAt: Date | string
}

interface InventoryItem {
  id: string
  stock: number
  product: { id: string; name: string; sku: string }
  location: { id: string; name: string; type: LocationType }
}

interface LocationsPageClientProps {
  initialLocations: Location[]
}

export default function LocationsPageClient({ initialLocations }: LocationsPageClientProps) {
  const [locations, setLocations] = useState(initialLocations)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingLocation, setEditingLocation] = useState<Location | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    type: 'STORE' as LocationType,
    address: '',
    phone: '',
    email: ''
  })

  const [isCloseModalOpen, setIsCloseModalOpen] = useState(false)
  const [closingLocation, setClosingLocation] = useState<Location | null>(null)
  const [closingInventory, setClosingInventory] = useState<InventoryItem[]>([])
  const [destinationId, setDestinationId] = useState('')
  const [isClosing, setIsClosing] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      if (editingLocation) {
        await updateLocation(editingLocation.id, formData)
        Swal.fire({ title: 'Actualizado', text: 'Sede actualizada correctamente', icon: 'success', background: '#0a0a0a', color: '#fff', confirmButtonColor: '#00f7ff' })
      } else {
        await createLocation(formData)
        Swal.fire({ title: 'Creada', text: 'Sede creada correctamente', icon: 'success', background: '#0a0a', color: '#fff', confirmButtonColor: '#00f7ff' })
      }

      const { getLocations } = await import('@/app/actions/location-actions')
      const updated = await getLocations()
      setLocations(updated)
      setIsModalOpen(false)
      setEditingLocation(null)
      setFormData({ name: '', type: 'STORE', address: '', phone: '', email: '' })
    } catch (error: any) {
      Swal.fire({ title: 'Error', text: error.message || 'No se pudo guardar', icon: 'error', background: '#0a0a0a', color: '#fff', confirmButtonColor: '#ef4444' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (location: Location) => {
    setEditingLocation(location)
    setFormData({
      name: location.name,
      type: location.type,
      address: location.address || '',
      phone: location.phone || '',
      email: location.email || ''
    })
    setIsModalOpen(true)
  }

  const handleOpenCloseModal = async (location: Location) => {
    setClosingLocation(location)
    setDestinationId('')
    setIsClosing(true)

    try {
      const inventory = await getLocationInventory(location.id)
      const itemsWithStock = inventory.filter((item: InventoryItem) => item.stock > 0)
      setClosingInventory(itemsWithStock)
    } catch (error: any) {
      Swal.fire({ title: 'Error', text: 'No se pudo cargar el inventario', icon: 'error', background: '#0a0a0a', color: '#fff', confirmButtonColor: '#ef4444' })
      setIsClosing(false)
      return
    }

    setIsClosing(false)
    setIsCloseModalOpen(true)
  }

  const handleCloseLocation = async () => {
    if (!closingLocation) return

    if (closingInventory.length > 0 && !destinationId) {
      Swal.fire({ title: 'Selecciona destino', text: 'Debes seleccionar una sede de destino para transferir el inventario', icon: 'warning', background: '#0a0a0a', color: '#fff', confirmButtonColor: '#ef4444' })
      return
    }

    setIsClosing(true)

    try {
      await closeLocationAction(closingLocation.id, destinationId || undefined)
      const { getLocations } = await import('@/app/actions/location-actions')
      const updated = await getLocations()
      setLocations(updated)
      setIsCloseModalOpen(false)
      setClosingLocation(null)
      setClosingInventory([])
      setDestinationId('')
      Swal.fire({ title: 'Sede cerrada', text: 'La sede ha sido cerrada correctamente y el inventario fue transferido', icon: 'success', background: '#0a0a0a', color: '#fff', confirmButtonColor: '#00f7ff' })
    } catch (error: any) {
      Swal.fire({ title: 'Error', text: error.message, icon: 'error', background: '#0a0a0a', color: '#fff', confirmButtonColor: '#ef4444' })
    } finally {
      setIsClosing(false)
    }
  }

  const otherLocations = locations.filter(loc => loc.id !== closingLocation?.id && loc.isActive)

  const openNewModal = () => {
    setEditingLocation(null)
    setFormData({ name: '', type: 'STORE', address: '', phone: '', email: '' })
    setIsModalOpen(true)
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <MapPin size={24} className="text-primary" />
            </div>
            Gestión de Sedes
          </h1>
          <p className="text-muted-foreground mt-1">Administra tiendas y almacenes</p>
        </div>
        <button
          onClick={openNewModal}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90 text-black font-bold px-5 py-2.5 rounded-xl transition-all shadow-[0_0_20px_rgba(0,247,255,0.2)]"
        >
          <Plus size={18} />
          Nueva Sede
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {locations.map((location) => (
          <div
            key={location.id}
            className="glass-panel rounded-2xl p-6 border-border/30 hover:border-primary/50 transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={cn(
                "w-12 h-12 rounded-xl flex items-center justify-center",
                location.type === 'WAREHOUSE' ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"
              )}>
                {location.type === 'WAREHOUSE' ? <Warehouse size={24} /> : <Store size={24} />}
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleEdit(location)}
                  className="p-2 rounded-lg hover:bg-foreground/10 text-muted-foreground hover:text-primary transition-all"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={() => handleOpenCloseModal(location)}
                  className="p-2 rounded-lg hover:bg-rose-500/10 text-muted-foreground hover:text-rose-500 transition-all"
                >
                  <Power size={16} />
                </button>
              </div>
            </div>

            <h3 className="text-lg font-bold text-white mb-1">{location.name}</h3>
            <p className="text-sm text-muted-foreground mb-3">
              {location.type === 'WAREHOUSE' ? 'Almacén' : 'Tienda'}
            </p>

            <div className={cn(
              "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold mb-3",
              location.type === 'WAREHOUSE'
                ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
            )}>
              {location.type === 'WAREHOUSE' ? <Warehouse size={12} /> : <Store size={12} />}
              {location.type === 'WAREHOUSE' ? 'ALMACÉN' : 'TIENDA'}
            </div>

            {!location.isActive && (
              <div className="mt-2 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20 inline-flex items-center gap-1">
                <AlertTriangle size={10} />
                INACTIVA
              </div>
            )}
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-md bg-[#111111] rounded-[2rem] p-8 border border-border/30 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />

            <div className="relative z-10">
              <h2 className="text-2xl font-bold text-white mb-6">
                {editingLocation ? 'Editar Sede' : 'Nueva Sede'}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block mb-2">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ej: Tienda Centro"
                    required
                    className="w-full bg-black/50 border border-border rounded-xl py-3 px-4 text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block mb-2">
                    Tipo de Sede
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'STORE' })}
                      className={cn(
                        "flex items-center justify-center gap-2 py-3 rounded-xl border transition-all",
                        formData.type === 'STORE'
                          ? "bg-emerald-500/10 border-emerald-500/50 text-emerald-400"
                          : "bg-foreground/5 border-border text-muted-foreground hover:border-emerald-500/30"
                      )}
                    >
                      <Store size={18} />
                      <span className="font-bold text-sm">Tienda</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData({ ...formData, type: 'WAREHOUSE' })}
                      className={cn(
                        "flex items-center justify-center gap-2 py-3 rounded-xl border transition-all",
                        formData.type === 'WAREHOUSE'
                          ? "bg-amber-500/10 border-amber-500/50 text-amber-400"
                          : "bg-foreground/5 border-border text-muted-foreground hover:border-amber-500/30"
                      )}
                    >
                      <Warehouse size={18} />
                      <span className="font-bold text-sm">Almacén</span>
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block mb-2">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    placeholder="Ej: Av. Javier Prado 2150, Lima"
                    className="w-full bg-black/50 border border-border rounded-xl py-3 px-4 text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block mb-2">
                      Teléfono
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="Ej: (01) 345-6789"
                      className="w-full bg-black/50 border border-border rounded-xl py-3 px-4 text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1 block mb-2">
                      Correo
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="Ej: tienda@razor.com"
                      className="w-full bg-black/50 border border-border rounded-xl py-3 px-4 text-white placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => { setIsModalOpen(false); setEditingLocation(null) }}
                    className="px-6 py-3 rounded-xl text-sm font-bold text-muted-foreground hover:text-white transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="px-8 py-3 rounded-xl bg-primary text-black font-bold text-sm hover:bg-primary/90 transition-all disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLoading && <Loader2 size={16} className="animate-spin" />}
                    {editingLocation ? 'Actualizar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {isCloseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-lg bg-[#111111] rounded-[2rem] p-8 border border-rose-500/30 shadow-[0_0_50px_rgba(0,0,0,0.5)] relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-rose-500/5 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
                  <Power size={20} className="text-rose-500" />
                </div>
                <h2 className="text-2xl font-bold text-white">Cerrar Sede</h2>
              </div>

              <p className="text-gray-400 mb-4">
                ¿Estás seguro de que deseas cerrar <span className="text-white font-bold">"{closingLocation?.name}"</span>?
              </p>

              {closingInventory.length > 0 && (
                <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-center gap-2 mb-3">
                    <AlertTriangle size={16} className="text-amber-400" />
                    <span className="text-amber-400 font-bold text-sm">Esta sede tiene inventario</span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">
                    Selecciona una sede de destino para transferir los productos antes de cerrar:
                  </p>

                  <div className="max-h-32 overflow-y-auto space-y-2 mb-3">
                    {closingInventory.map((item) => (
                      <div key={item.id} className="flex items-center justify-between text-xs">
                        <span className="text-gray-300">
                          <Package size={12} className="inline mr-1" />
                          {item.product.name}
                        </span>
                        <span className="text-amber-400 font-bold">{item.stock} UND</span>
                      </div>
                    ))}
                  </div>

                  <select
                    value={destinationId}
                    onChange={(e) => setDestinationId(e.target.value)}
                    className="w-full bg-black/50 border border-amber-500/30 rounded-xl py-3 px-4 text-white text-sm focus:border-amber-500 focus:outline-none transition-all"
                  >
                    <option value="">Seleccionar sede de destino...</option>
                    {otherLocations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name} ({loc.type === 'WAREHOUSE' ? 'Almacén' : 'Tienda'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {closingInventory.length === 0 && (
                <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <p className="text-emerald-400 text-sm font-bold flex items-center gap-2">
                    <Package size={16} />
                    Sin inventario
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Esta sede no tiene productos. Puedes cerrarla directamente.
                  </p>
                </div>
              )}

              <div className="flex items-center justify-end gap-4 mt-6">
                <button
                  onClick={() => { setIsCloseModalOpen(false); setClosingLocation(null); setClosingInventory([]); setDestinationId('') }}
                  className="px-6 py-3 rounded-xl text-sm font-bold text-muted-foreground hover:text-white transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleCloseLocation}
                  disabled={isClosing || (closingInventory.length > 0 && !destinationId)}
                  className="px-8 py-3 rounded-xl bg-rose-500 text-white font-bold text-sm hover:bg-rose-600 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                  {isClosing && <Loader2 size={16} className="animate-spin" />}
                  {closingInventory.length > 0 ? 'Transferir y Cerrar' : 'Cerrar Sede'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
