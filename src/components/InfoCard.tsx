
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';

interface InfoCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
  gradientClass?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, description, icon, onClick, gradientClass = "bg-gradient-campus" }) => {
  return (
    <Card 
      className="card-hover overflow-hidden bg-white border border-gray-100 shadow-sm group h-full hover-gradient-shine cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-1"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      }}
    >
      <CardHeader className={`pb-2 ${gradientClass} text-white transition-colors duration-300`}>
        <div className="feature-icon-container bg-white/20 text-white">
          {icon}
        </div>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <CardDescription className="text-sm">{description}</CardDescription>
      </CardContent>
      <CardFooter>
        <div className="flex items-center text-campus-600 group-hover:text-campus-800 transition-all duration-300">
          <span className="mr-2">Learn more</span>
          <ArrowRight size={16} className="transition-transform group-hover:translate-x-2" />
        </div>
      </CardFooter>
    </Card>
  );
};

export default InfoCard;
