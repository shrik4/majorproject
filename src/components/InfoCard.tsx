
import React from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from 'lucide-react';

interface InfoCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  onClick?: () => void;
  backgroundImage?: string;
}

const InfoCard: React.FC<InfoCardProps> = ({ title, description, icon, onClick, backgroundImage }) => {
  return (
    <Card
      className="relative overflow-hidden bg-white border-0 shadow-lg group h-full cursor-pointer transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 rounded-2xl"
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyPress={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          onClick?.();
        }
      }}
    >
      {/* Gradient overlay that appears on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/0 via-blue-500/0 to-pink-500/0 group-hover:from-purple-500/10 group-hover:via-blue-500/10 group-hover:to-pink-500/10 transition-all duration-500 z-10 pointer-events-none" />

      {/* Animated border glow */}
      <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 via-blue-600 to-pink-600 rounded-2xl opacity-0 group-hover:opacity-100 blur transition-all duration-500 -z-10" />

      <CardHeader
        className="relative pb-4 text-white transition-all duration-500 h-48 group-hover:h-52"
        style={backgroundImage ? {
          backgroundImage: backgroundImage,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        } : {
          backgroundImage: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70 group-hover:from-black/30 group-hover:via-black/40 group-hover:to-black/60 transition-all duration-500" />

        {/* Animated shine effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

        <div className="relative z-10 flex flex-col h-full justify-between">
          <div className="feature-icon-container bg-white/30 backdrop-blur-sm text-white p-3 rounded-xl w-fit group-hover:bg-white/40 group-hover:scale-110 transition-all duration-300 shadow-lg">
            {icon}
          </div>
          <CardTitle className="text-2xl font-bold drop-shadow-lg group-hover:scale-105 transition-transform duration-300">{title}</CardTitle>
        </div>
      </CardHeader>

      <CardContent className="pt-6 pb-4 relative z-20">
        <CardDescription className="text-gray-600 text-base leading-relaxed group-hover:text-gray-800 transition-colors duration-300">
          {description}
        </CardDescription>
      </CardContent>

      <CardFooter className="relative z-20 pb-6">
        <div className="flex items-center text-blue-600 font-semibold group-hover:text-purple-600 transition-all duration-300">
          <span className="mr-2">Learn more</span>
          <ArrowRight size={18} className="transition-transform group-hover:translate-x-2 group-hover:scale-110" />
        </div>
      </CardFooter>
    </Card>
  );
};

export default InfoCard;
