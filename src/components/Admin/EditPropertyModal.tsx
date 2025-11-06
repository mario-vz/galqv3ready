import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { X, Upload, User, Home, MapPin, FileText, Percent } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
}

interface Property {
  id: string;
  owner_id: string;
  name: string;
  description: string | null;
  location: string;
  address: string | null;
  image_url: string | null;
  status: 'active' | 'maintenance' | 'inactive';
  commission_percentage: number;
}

interface EditPropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  property: Property;
}

export const EditPropertyModal = ({ isOpen, onClose, onSuccess, property }: EditPropertyModalProps) => {
  const { language } = useLanguage();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(property.image_url);

  const [formData, setFormData] = useState({
    owner_id: property.owner_id,
    name: property.name,
    description: property.description || '',
    location: property.location,
    address: property.address || '',
    status: property.status,
    commission_percentage: property.commission_percentage || 10.0,
    custom_commission: '',
    is_custom: false,
  });

  const translations = {
    es: {
      title: 'Editar Propiedad',
      owner: 'Propietario',
      selectOwner: 'Seleccionar propietario',
      propertyName: 'Nombre de la propiedad',
      description: 'Descripción',
      location: 'Ubicación',
      address: 'Dirección completa',
      status: 'Estado',
      active: 'Activa',
      maintenance: 'Mantenimiento',
      inactive: 'Inactiva',
      commission: 'Comisión Galquiler',
      custom: 'Personalizado',
      image: 'Imagen',
      selectImage: 'Seleccionar imagen',
      cancel: 'Cancelar',
      save: 'Guardar Cambios',
      saving: 'Guardando...',
      required: 'Campo requerido',
    },
    gl: {
      title: 'Editar Propiedade',
      owner: 'Propietario',
      selectOwner: 'Seleccionar propietario',
      propertyName: 'Nome da propiedade',
      description: 'Descrición',
      location: 'Ubicación',
      address: 'Dirección completa',
      status: 'Estado',
      active: 'Activa',
      maintenance: 'Mantemento',
      inactive: 'Inactiva',
      commission: 'Comisión Galquiler',
      custom: 'Personalizado',
      image: 'Imaxe',
      selectImage: 'Seleccionar imaxe',
      cancel: 'Cancelar',
      save: 'Gardar Cambios',
      saving: 'Gardando...',
      required: 'Campo requirido',
    },
  };

  const t = translations[language];

  useEffect(() => {
    if (isOpen) {
      fetchProfiles();
      const commission = property.commission_percentage || 10.0;
      const isCustom = commission !== 7 && commission !== 10 && commission !== 15;
      setFormData({
        owner_id: property.owner_id,
        name: property.name,
        description: property.description || '',
        location: property.location,
        address: property.address || '',
        status: property.status,
        commission_percentage: commission,
        custom_commission: isCustom ? commission.toString() : '',
        is_custom: isCustom,
      });
      setImagePreview(property.image_url);
      setImageFile(null);
    }
  }, [isOpen, property]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, full_name')
        .order('email');

      if (error) throw error;
      setProfiles(data || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!imageFile) return null;

    setUploading(true);
    try {
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${property.id}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('property-images')
        .upload(fileName, imageFile);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('property-images')
        .getPublicUrl(fileName);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.owner_id || !formData.name || !formData.location) {
      alert(t.required);
      return;
    }

    setLoading(true);

    try {
      let imageUrl = property.image_url;

      if (imageFile) {
        const newImageUrl = await uploadImage();
        if (newImageUrl) {
          imageUrl = newImageUrl;
        }
      }

      const { error: updateError } = await supabase
        .from('properties')
        .update({
          owner_id: formData.owner_id,
          name: formData.name,
          description: formData.description || null,
          location: formData.location,
          address: formData.address || null,
          status: formData.status,
          image_url: imageUrl,
          commission_percentage: formData.commission_percentage,
        })
        .eq('id', property.id);

      if (updateError) throw updateError;

      onSuccess();
      handleClose();
    } catch (error) {
      console.error('Error updating property:', error);
      alert('Error al actualizar la propiedad');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setImageFile(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-atlantic-blue">{t.title}</h2>
          <button
            onClick={handleClose}
            className="text-neutral-gray hover:text-atlantic-blue transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-gray mb-2">
              <User size={16} />
              {t.owner} *
            </label>
            <select
              value={formData.owner_id}
              onChange={(e) => setFormData({ ...formData, owner_id: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-atlantic-blue focus:border-transparent"
              required
            >
              <option value="">{t.selectOwner}</option>
              {profiles.map((profile) => (
                <option key={profile.id} value={profile.id}>
                  {profile.full_name || profile.email}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-gray mb-2">
              <Home size={16} />
              {t.propertyName} *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-atlantic-blue focus:border-transparent"
              placeholder="Ej: Apartamento Centro Histórico"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-gray mb-2">
              <FileText size={16} />
              {t.description}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-atlantic-blue focus:border-transparent resize-none"
              rows={4}
              placeholder="Descripción detallada de la propiedad..."
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-gray mb-2">
              <MapPin size={16} />
              {t.location} *
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-atlantic-blue focus:border-transparent"
              placeholder="Ej: Santiago de Compostela"
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-gray mb-2">
              <MapPin size={16} />
              {t.address}
            </label>
            <input
              type="text"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-atlantic-blue focus:border-transparent"
              placeholder="Dirección completa de la propiedad"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-gray mb-2">
              {t.status}
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-atlantic-blue focus:border-transparent"
            >
              <option value="active">{t.active}</option>
              <option value="maintenance">{t.maintenance}</option>
              <option value="inactive">{t.inactive}</option>
            </select>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-gray mb-2">
              <Percent size={16} />
              {t.commission}
            </label>
            <div className="space-y-3">
              <select
                value={formData.is_custom ? 'custom' : formData.commission_percentage.toString()}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === 'custom') {
                    setFormData({ ...formData, is_custom: true, custom_commission: formData.commission_percentage.toString() });
                  } else {
                    setFormData({ ...formData, is_custom: false, commission_percentage: parseFloat(value), custom_commission: '' });
                  }
                }}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-atlantic-blue focus:border-transparent"
              >
                <option value="7">7%</option>
                <option value="10">10%</option>
                <option value="15">15%</option>
                <option value="custom">{t.custom}</option>
              </select>
              {formData.is_custom && (
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.01"
                  value={formData.custom_commission}
                  onChange={(e) => {
                    const value = e.target.value;
                    setFormData({
                      ...formData,
                      custom_commission: value,
                      commission_percentage: parseFloat(value) || formData.commission_percentage
                    });
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-atlantic-blue focus:border-transparent"
                  placeholder="Ingrese porcentaje personalizado (ej: 12.5)"
                  autoFocus
                />
              )}
            </div>
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-neutral-gray mb-2">
              <Upload size={16} />
              {t.image}
            </label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-atlantic-blue transition-colors">
              {imagePreview ? (
                <div className="relative">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="max-h-48 mx-auto rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(null);
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelect}
                    className="hidden"
                  />
                  <Upload size={32} className="mx-auto mb-2 text-neutral-gray" />
                  <p className="text-neutral-gray">{t.selectImage}</p>
                  <p className="text-sm text-gray-400 mt-1">JPG, PNG, WEBP (max 5MB)</p>
                </label>
              )}
            </div>
          </div>

          <div className="flex gap-4 pt-4 border-t">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-neutral-gray rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              disabled={loading || uploading}
              className="flex-1 px-6 py-3 bg-atlantic-blue text-white rounded-lg hover:bg-opacity-90 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t.saving : t.save}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
