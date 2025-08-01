// src/components/admin/AddPartnerModal.tsx
"use client";

import React, { useState, useRef, useCallback } from 'react';
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserPlus, Plus, Building, Trash2, AlertTriangle } from 'lucide-react';
import { industries } from '@/lib/mockData';
import { useJsApiLoader, GoogleMap, Autocomplete, Marker } from '@react-google-maps/api';

interface AddPartnerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddPartner: (partnerData: any) => void;
}

const libraries: "places"[] = ['places'];

const StepOne = ({ partnerData, setPartnerData, handleSelectChange, handleInputChange }: any) => (
  <div className="space-y-4">
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="name" className="text-right">
        Org Name
      </Label>
      <Input
        id="name"
        name="name"
        value={partnerData.name}
        onChange={handleInputChange}
        className="col-span-3"
        placeholder="e.g., Acme Corporation"
        required
      />
    </div>
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="email" className="text-right">
        Admin Email
      </Label>
      <Input
        id="email"
        name="email"
        type="email"
        value={partnerData.email}
        onChange={handleInputChange}
        className="col-span-3"
        placeholder="admin@acme.com"
        required
      />
    </div>
    <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="plan" className="text-right">
        Plan
      </Label>
      <Select name="plan" value={partnerData.plan} onValueChange={(value) => handleSelectChange('plan', value)}>
        <SelectTrigger className="col-span-3">
          <SelectValue placeholder="Select a plan" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="Starter">Starter</SelectItem>
          <SelectItem value="Professional">Professional</SelectItem>
          <SelectItem value="Enterprise">Enterprise</SelectItem>
        </SelectContent>
      </Select>
    </div>
     <div className="grid grid-cols-4 items-center gap-4">
      <Label htmlFor="industryId" className="text-right">
        Industry
      </Label>
      <Select name="industryId" value={partnerData.industryId} onValueChange={(value) => handleSelectChange('industryId', value)}>
        <SelectTrigger className="col-span-3">
          <SelectValue placeholder="Select industry" />
        </SelectTrigger>
        <SelectContent>
          {industries.map(industry => (
            <SelectItem key={industry.id} value={industry.id}>{industry.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>
);

const NoApiKeyMessage = () => (
    <div className="flex items-center gap-4 rounded-lg border border-destructive/50 bg-red-50 p-4 text-sm text-destructive">
        <AlertTriangle className="h-6 w-6" />
        <div className="flex-1">
          <h4 className="font-semibold">Google Maps API Key is Missing</h4>
          <p className="text-xs">Please add `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` to your .env file to enable location features.</p>
        </div>
    </div>
);

const MapComponent = ({ outlets, setOutlets }: { outlets: any[], setOutlets: (outlets: any[]) => void }) => {
  const [newOutletName, setNewOutletName] = useState('');
  const [mapCenter, setMapCenter] = useState({ lat: 37.386051, lng: -122.083855 }); // Default to Mountain View, CA
  const [markerPosition, setMarkerPosition] = useState<{lat: number, lng: number} | null>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const addressInputRef = useRef<HTMLInputElement | null>(null);
  
  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  console.log("DEBUG: Google Maps API Key loaded in component:", googleMapsApiKey);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey,
    libraries,
    preventGoogleFontsLoading: true,
  });

  const handlePlaceSelect = useCallback(() => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place && place.geometry && place.geometry.location) {
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setMapCenter({ lat, lng });
        setMarkerPosition({ lat, lng });
      }
    }
  }, []);

  const handleAddOutlet = () => {
    if (newOutletName && addressInputRef.current?.value) {
      setOutlets([...outlets, { name: newOutletName, address: addressInputRef.current.value, location: markerPosition }]);
      setNewOutletName('');
      if(addressInputRef.current) addressInputRef.current.value = '';
      setMarkerPosition(null);
    }
  };
  
  const handleRemoveOutlet = (index: number) => {
    setOutlets(outlets.filter((_:any, i:number) => i !== index));
  }

  if (loadError) return <div>Error loading maps. Please check your API key and network connection.</div>;
  if (!isLoaded) return <div>Loading Maps...</div>;

  return (
    <div className="space-y-4">
      <div className="p-4 border rounded-lg space-y-4">
        <h4 className="font-medium">Add Business Outlet</h4>
        <div>
          <Label htmlFor="outletName">Outlet Name</Label>
          <Input 
            id="outletName" 
            placeholder="e.g., Downtown Branch" 
            value={newOutletName}
            onChange={(e) => setNewOutletName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="address">Address Search</Label>
          <Autocomplete
            onLoad={(ref) => autocompleteRef.current = ref}
            onPlaceChanged={handlePlaceSelect}
          >
            <Input 
              id="address" 
              placeholder="Search for an address..." 
              ref={addressInputRef}
            />
          </Autocomplete>
        </div>
        <div className="h-48 bg-secondary rounded-lg">
          <GoogleMap
            mapContainerStyle={{ width: '100%', height: '100%', borderRadius: '0.5rem' }}
            center={mapCenter}
            zoom={15}
          >
            {markerPosition && <Marker position={markerPosition} />}
          </GoogleMap>
        </div>
        <Button type="button" onClick={handleAddOutlet} className="w-full">
          <Plus className="w-4 h-4 mr-2" /> Add Outlet
        </Button>
      </div>
      
      <div className="space-y-2">
        <h4 className="font-medium">Added Outlets ({outlets.length})</h4>
        <div className="max-h-48 overflow-y-auto space-y-2 pr-2">
        {outlets.map((outlet: any, index: number) => (
          <div key={index} className="flex items-center gap-3 p-2 border rounded-lg bg-secondary/50">
            <div className="bg-secondary p-2 rounded">
              <Building className="w-4 h-4 text-muted-foreground" />
            </div>
            <div className="flex-1">
              <p className="font-medium text-sm">{outlet.name}</p>
              <p className="text-xs text-muted-foreground">{outlet.address}</p>
            </div>
            <Button variant="ghost" size="icon" className="w-8 h-8" onClick={() => handleRemoveOutlet(index)}>
                <Trash2 className="w-4 h-4"/>
            </Button>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
};


const StepTwo = ({ outlets, setOutlets }: any) => {
    const hasApiKey = !!process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    if (!hasApiKey) {
        return <NoApiKeyMessage />;
    }

    return <MapComponent outlets={outlets} setOutlets={setOutlets} />;
};


export default function AddPartnerModal({ isOpen, onClose, onAddPartner }: AddPartnerModalProps) {
  const [step, setStep] = useState(1);
  const [partnerData, setPartnerData] = useState({
    name: '',
    email: '',
    plan: 'Starter',
    industryId: '',
  });
  const [outlets, setOutlets] = useState<any[]>([]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPartnerData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setPartnerData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Here we would call a backend flow to:
    // 1. Create a new Tenant in Firebase Auth -> get tenantId
    // 2. Create a new Partner document in Firestore with the tenantId
    // 3. Invite the admin user to that tenant
    onAddPartner({ ...partnerData, outlets, tenantId: `tenant_${Date.now()}` }); // Mock tenantId
    
    // Reset state on close
    setStep(1);
    setPartnerData({ name: '', email: '', plan: 'Starter', industryId: '' });
    setOutlets([]);
    onClose();
  };
  
  const handleClose = () => {
    setStep(1);
    setPartnerData({ name: '', email: '', plan: 'Starter', industryId: '' });
    setOutlets([]);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="sm:max-w-2xl">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 font-headline">
              <UserPlus />
              Invite New Partner (Step {step} of 2)
            </DialogTitle>
            <DialogDescription>
             {step === 1 ? 'Enter core details for the new partner organization.' : 'Add one or more business locations for this partner.'}
            </DialogDescription>
          </DialogHeader>
          
          <div className="py-4">
            {step === 1 ? (
              <StepOne 
                partnerData={partnerData} 
                setPartnerData={setPartnerData} 
                handleInputChange={handleInputChange}
                handleSelectChange={handleSelectChange}
              />
            ) : (
              <StepTwo outlets={outlets} setOutlets={setOutlets} />
            )}
          </div>

          <DialogFooter>
            {step === 1 ? (
              <>
                <Button type="button" variant="outline" onClick={handleClose}>Cancel</Button>
                <Button type="button" onClick={() => setStep(2)} disabled={!partnerData.name || !partnerData.email || !partnerData.industryId}>
                  Next: Add Locations
                </Button>
              </>
            ) : (
              <>
                <Button type="button" variant="outline" onClick={() => setStep(1)}>
                  Back
                </Button>
                <Button type="submit" disabled={outlets.length === 0}>
                  Send Invitation
                </Button>
              </>
            )}
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
