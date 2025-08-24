
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";

interface LocationCardProps {
  title: string;
  image: string;
  onClick: () => void;
}

const LocationCard: React.FC<LocationCardProps> = ({ title, image, onClick }) => {
  return (
    <Card 
      className="overflow-hidden cursor-pointer card-hover group h-full"
      onClick={onClick}
    >
      <div className="relative h-52 w-full overflow-hidden">
        <img 
          src={image} 
          alt={title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 p-4 w-full">
          <h3 className="text-white font-semibold text-lg">{title}</h3>
        </div>
      </div>
      <CardContent className="p-4 bg-gradient-to-r from-white to-gray-50">
        <p className="text-sm text-gray-600 flex items-center justify-between">
          <span>Click to view details</span>
          <span className="text-campus-600 text-xs font-medium">Details →</span>
        </p>
      </CardContent>
    </Card>
  );
};

export default LocationCard;
