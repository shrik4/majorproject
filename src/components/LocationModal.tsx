
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { MapPin } from 'lucide-react';

interface LocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  location: {
    title: string;
    description: string;
    image: string;
    details: string;
  } | null;
}

const LocationModal: React.FC<LocationModalProps> = ({ isOpen, onClose, location }) => {
  if (!location) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MapPin size={18} className="text-campus-600" />
            {location.title}
          </DialogTitle>
          <DialogDescription>
            {location.description}
          </DialogDescription>
        </DialogHeader>
        <div className="relative h-48 sm:h-64 w-full my-4 rounded-md overflow-hidden">
          <img 
            src={location.image} 
            alt={location.title}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="text-sm text-gray-700">
          <p>{location.details}</p>
        </div>
        <DialogFooter className="sm:justify-start">
          <div className="w-full flex justify-between items-center">
            <Button 
              variant="outline" 
              onClick={onClose}
            >
              Close
            </Button>
            <Button onClick={() => alert('Navigation feature coming soon!')}>
              Navigate
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default LocationModal;
