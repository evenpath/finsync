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
  DialogClose,
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
import { UserPlus, Plus, Building, Trash2 } from 'lucide-react';
import { industries as mockIndustries } from '@/lib/mockData';
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
      <Select value={partnerData.plan} onValueChange={(value) => handleSelectChange('plan', value)}>
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
      <Select value={partnerData.industryId} onValueChange={(value) => handleSelectChange('industryId', value)}>
        <SelectTrigger className="col-span-3">
          <SelectValue placeholder="Select industry" />
        </SelectTrigger>
        <SelectContent>
          {mockIndustries.map(industry => (
            <SelectItem key={industry.id} value={industry.id}>{industry.name}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  </div>
);

const StepTwo = ({ outlets, setOutlets }: any) => {
  const [newOutlet, setNewOutlet] = useState({ name: '', address: '' });
  const [mapCenter, setMapCenter] = useState({ lat: 37.386051, lng: -122.083855 }); // Default to Mountain View, CA
  const [markerPosition, setMarkerPosition] = useState(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const handlePlaceSelect = useCallback(() => {
    if (autocompleteRef.current) {
      const place = autocompleteRef.current.getPlace();
      if (place && place.geometry && place.geometry.location) {
        const address = place.formatted_address || '';
        const lat = place.geometry.location.lat();
        const lng = place.geometry.location.lng();
        setNewOutlet(prev => ({ ...prev, address }));
        setMapCenter({ lat, lng });
        setMarkerPosition({ lat, lng });
      }
    }
  }, []);

  const handleAddOutlet = () => {
    if (newOutlet.name && newOutlet.address) {
      setOutlets([...outlets, { ...newOutlet, location: markerPosition }]);
      setNewOutlet({ name: '', address: '' });
      setMarkerPosition(null);
    }
  };
  
  const handleRemoveOutlet = (index: number) => {
    setOutlets(outlets.filter((_:any, i:number) => i !== index));
  }

  if (loadError) return <div>Error loading maps</div>;
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
            value={newOutlet.name}
            onChange={(e) => setNewOutlet({ ...newOutlet, name: e.target.value })}
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
              value={newOutlet.address}
              onChange={(e) => setNewOutlet({ ...newOutlet, address: e.target.value })}
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
    const { id, value } = e.target;
    setPartnerData(prev => ({ ...prev, [id]: value }));
  };

  const handleSelectChange = (id: string, value: string) => {
    setPartnerData(prev => ({ ...prev, [id]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAddPartner({ ...partnerData, outlets });
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
