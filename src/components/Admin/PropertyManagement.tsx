import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Home, MapPin, User, Upload, Trash2, Plus, Edit2, Calendar, Search, Grid, List } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { AddPropertyModal } from './AddPropertyModal';
import { EditPropertyModal } from './EditPropertyModal';
import { DeleteConfirmationModal } from './DeleteConfirmationModal';
import { AddReservationModal } from './AddReservationModal';

interface Property {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  location: string;
  address: string | null;
  image_url: string | null;
  status: 'active' | 'maintenance' | 'inactive';
  created_at: string;
  profiles: {
    email: string;
    full_name: string | null;
  };
}

export const PropertyManagement = () => {
  const { language } = useLanguage();
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState<string | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<{id: string, name: string} | null>(null);
  const [propertyToEdit, setPropertyToEdit] = useState<Property | null>(null);
  const [propertyToDelete, setPropertyToDelete] = useState<{id: string, name: string} | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const translations = {
    es: {
      title: 'Gestión de Propiedades',
      addProperty: 'Añadir Propiedad',
      name: 'Nombre',
      location: 'Ubicación',
      owner: 'Propietario',
      status: 'Estado',
      active: 'Activa',
      maintenance: 'Mantenimiento',
      inactive: 'Inactiva',
      uploadImage: 'Subir imagen',
      delete: 'Eliminar',
      edit: 'Editar',
      noProperties: 'No hay propiedades',
      manageReservations: 'Reservas',
      search: 'Buscar por nombre o propietario...',
      gridView: 'Vista cuadrícula',
      listView: 'Vista lista',
    },
    gl: {
      title: 'Xestión de Propiedades',
      addProperty: 'Engadir Propiedade',
      name: 'Nome',
      location: 'Ubicación',
      owner: 'Propietario',
      status: 'Estado',
      active: 'Activa',
      maintenance: 'Mantemento',
      inactive: 'Inactiva',
      uploadImage: 'Subir imaxe',
      delete: 'Eliminar',
      edit: 'Editar',
      noProperties: 'Non hai propiedades',
      manageReservations: 'Reservas',
      search: 'Buscar por nome ou propietario...',
      gridView: 'Vista cuadrícula',
      listView: 'Vista lista',
    },
  };

  const t = translations[language];

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      const { data, error } = await supabase
        .from('properties')
        .select(`
          *,
          profiles (
            email,
            full_name
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProperties(data || []);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (propertyId: string, file: File) => {
    setUploading(propertyId);

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${propertyId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(fileName);

      const { error: updateError } = await supabase
        .from('properties')
        .update({ image_url: publicUrl })
        .eq('id', propertyId);

      if (updateError) throw updateError;

      fetchProperties();
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Error al subir la imagen');
    } finally {
      setUploading(null);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!propertyToDelete) return;

    setDeleting(true);

    try {
      const { error } = await supabase
        .from('properties')
        .delete()
        .eq('id', propertyToDelete.id);

      if (error) throw error;

      setShowDeleteModal(false);
      setPropertyToDelete(null);
      fetchProperties();
    } catch (error) {
      console.error('Error deleting property:', error);
      alert('Error al eliminar la propiedad');
    } finally {
      setDeleting(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800';
      case 'inactive':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return t.active;
      case 'maintenance':
        return t.maintenance;
      case 'inactive':
        return t.inactive;
      default:
        return status;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-atlantic-blue"></div>
      </div>
    );
  }

  const filteredProperties = properties.filter((property) => {
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = property.name.toLowerCase().includes(searchLower);
    const ownerMatch = property.profiles?.full_name?.toLowerCase().includes(searchLower) ||
                      property.profiles?.email.toLowerCase().includes(searchLower);
    const locationMatch = property.location.toLowerCase().includes(searchLower);
    return nameMatch || ownerMatch || locationMatch;
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-atlantic-blue">{t.title}</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-atlantic-blue text-white rounded-lg hover:bg-opacity-90 transition-colors"
        >
          <Plus size={20} />
          {t.addProperty}
        </button>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-gray" size={20} />
          <input
            type="text"
            placeholder={t.search}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-atlantic-blue focus:border-transparent"
          />
        </div>
        <div className="flex gap-2 bg-gray-100 p-1 rounded-lg">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'grid'
                ? 'bg-white text-atlantic-blue shadow-sm'
                : 'text-neutral-gray hover:text-atlantic-blue'
            }`}
            title={t.gridView}
          >
            <Grid size={20} />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded transition-colors ${
              viewMode === 'list'
                ? 'bg-white text-atlantic-blue shadow-sm'
                : 'text-neutral-gray hover:text-atlantic-blue'
            }`}
            title={t.listView}
          >
            <List size={20} />
          </button>
        </div>
      </div>

      {filteredProperties.length === 0 ? (
        <div className="text-center py-12 text-neutral-gray">
          {searchTerm ? 'No se encontraron propiedades' : t.noProperties}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProperties.map((property) => (
            <div key={property.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-40 bg-gray-100">
                {property.image_url ? (
                  <img
                    src={property.image_url}
                    alt={property.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <Home size={40} className="text-gray-400" />
                  </div>
                )}
                <label className="absolute bottom-2 right-2 cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(property.id, file);
                    }}
                    disabled={uploading === property.id}
                  />
                  <div className="bg-white p-2 rounded-lg shadow-md hover:bg-gray-50 transition-colors">
                    {uploading === property.id ? (
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-atlantic-blue"></div>
                    ) : (
                      <Upload size={20} className="text-atlantic-blue" />
                    )}
                  </div>
                </label>
              </div>
              <div className="p-4">
                <h3 className="text-lg font-bold text-atlantic-blue mb-2">{property.name}</h3>
                <div className="space-y-2 text-sm text-neutral-gray mb-4">
                  <div className="flex items-center gap-2">
                    <MapPin size={16} />
                    {property.location}
                  </div>
                  <div className="flex items-center gap-2">
                    <User size={16} />
                    {property.profiles?.full_name || property.profiles?.email}
                  </div>
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                      {getStatusLabel(property.status)}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => {
                      setSelectedProperty({ id: property.id, name: property.name });
                      setShowReservationModal(true);
                    }}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2 bg-atlantic-blue text-white rounded-lg hover:bg-opacity-90 transition-colors text-sm font-medium"
                  >
                    <Calendar size={16} />
                    {t.manageReservations}
                  </button>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setPropertyToEdit(property);
                        setShowEditModal(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-soft-mint text-atlantic-blue rounded-lg hover:bg-atlantic-blue hover:text-white transition-colors text-sm"
                    >
                      <Edit2 size={16} />
                      {t.edit}
                    </button>
                    <button
                      onClick={() => {
                        setPropertyToDelete({ id: property.id, name: property.name });
                        setShowDeleteModal(true);
                      }}
                      className="px-3 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {filteredProperties.map((property) => (
            <div key={property.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow">
              <div className="flex">
                <div className="relative w-20 h-20 bg-gray-100 flex-shrink-0">
                  {property.image_url ? (
                    <img
                      src={property.image_url}
                      alt={property.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Home size={20} className="text-gray-400" />
                    </div>
                  )}
                  <label className="absolute bottom-2 right-2 cursor-pointer">
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(property.id, file);
                      }}
                      disabled={uploading === property.id}
                    />
                    <div className="bg-white p-1 rounded shadow-sm hover:bg-gray-50 transition-colors">
                      {uploading === property.id ? (
                        <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-atlantic-blue"></div>
                      ) : (
                        <Upload size={12} className="text-atlantic-blue" />
                      )}
                    </div>
                  </label>
                </div>
                <div className="flex-1 px-4 py-3 flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="text-base font-bold text-atlantic-blue mb-1.5">{property.name}</h3>
                    <div className="flex gap-5 text-xs text-neutral-gray">
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} />
                        {property.location}
                      </div>
                      <div className="flex items-center gap-1.5">
                        <User size={14} />
                        {property.profiles?.full_name || property.profiles?.email}
                      </div>
                      <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(property.status)}`}>
                        {getStatusLabel(property.status)}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => {
                        setSelectedProperty({ id: property.id, name: property.name });
                        setShowReservationModal(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-atlantic-blue text-white rounded-lg hover:bg-opacity-90 transition-colors text-xs font-medium"
                    >
                      <Calendar size={14} />
                      {t.manageReservations}
                    </button>
                    <button
                      onClick={() => {
                        setPropertyToEdit(property);
                        setShowEditModal(true);
                      }}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-soft-mint text-atlantic-blue rounded-lg hover:bg-atlantic-blue hover:text-white transition-colors text-xs"
                    >
                      <Edit2 size={14} />
                      {t.edit}
                    </button>
                    <button
                      onClick={() => {
                        setPropertyToDelete({ id: property.id, name: property.name });
                        setShowDeleteModal(true);
                      }}
                      className="px-2 py-1.5 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <AddPropertyModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onSuccess={fetchProperties}
      />

      {propertyToEdit && (
        <EditPropertyModal
          isOpen={showEditModal}
          onClose={() => {
            setShowEditModal(false);
            setPropertyToEdit(null);
          }}
          onSuccess={fetchProperties}
          property={propertyToEdit}
        />
      )}

      {propertyToDelete && (
        <DeleteConfirmationModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setPropertyToDelete(null);
          }}
          onConfirm={handleDeleteConfirm}
          propertyName={propertyToDelete.name}
          isDeleting={deleting}
        />
      )}

      {selectedProperty && (
        <AddReservationModal
          isOpen={showReservationModal}
          onClose={() => {
            setShowReservationModal(false);
            setSelectedProperty(null);
          }}
          onSuccess={() => {}}
          propertyId={selectedProperty.id}
          propertyName={selectedProperty.name}
        />
      )}
    </div>
  );
};
