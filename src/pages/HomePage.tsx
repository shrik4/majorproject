
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import AuthCheck from '@/components/AuthCheck';
import InfoCard from '@/components/InfoCard';
import { Button } from "@/components/ui/button";
import { BookOpen, Users, Briefcase, FileText, ArrowRight, MapPin, MessageSquare, School } from 'lucide-react';

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  
  const infoCards = [
    {
      title: 'Study Materials',
      description: 'Access previous years question papers to help you prepare for exams and assessments.',
      icon: <FileText size={24} />,
      onClick: () => navigate('/question-papers'),
      backgroundImage: 'url(/study%20material.png)'
    },
        {
          title: 'Events',
          description: 'Access information about live events, announcements, and important notices.',
          icon: <Users size={24} />,
          onClick: () => navigate('/events'),
          backgroundImage: 'url(/events.png)'
        },
    {
      title: 'Courses',
      description: 'Explore a variety of courses, including YouTube tutorials and recommended study materials.',
      icon: <BookOpen size={24} />,
      onClick: () => navigate('/courses'),
      backgroundImage: 'url(/course.png)',
    },
    {
      title: 'Other Information',
      description: 'Access additional campus resources, events, announcements, and important notices.',
      icon: <BookOpen size={24} />,
      onClick: () => navigate('/other-information')
    }
  ];

  return (
    <AuthCheck>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        
        <main className="flex-grow">
          {/* Hero Section */}
          <section className="text-white pt-16 pb-24 md:pt-20 md:pb-32 relative overflow-hidden" style={{ backgroundImage: 'url("/campus new-3.webp")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div className="absolute inset-0 bg-black opacity-50"></div>
              <div className="container relative px-4 md:px-6 z-10">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in leading-tight">
                    Campus Information & Navigation System
                  </h1>
                <p className="text-lg md:text-xl mb-8 text-gray-100 animate-fade-in max-w-2xl mx-auto" style={{ animationDelay: '100ms' }}>
                  Your one-stop solution for navigating campus resources and
            accessing vital information. 
                </p>
                <div className="flex justify-center animate-fade-in" style={{ animationDelay: '200ms' }}>
                  <Button 
                    className="bg-white text-campus-700 hover:bg-gray-100 font-medium shadow-lg"
                    onClick={() => navigate('/navigation')}
                    size="lg"
                  >
                    <MapPin size={18} className="mr-2" />
                    <span>Campus Map</span>
                  </Button>
                </div>
              </div>
            </div>

          </section>
          
          {/* Quick Access Section */}
          <section className="py-10 bg-gray-50">
            <div className="container px-4 md:px-6">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Quick Access</h2>
                    <p className="text-gray-600 mt-2">Navigate to essential campus resources</p>
                  </div>

                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {infoCards.map((card, index) => (
                    <div key={index} className="animate-fade-in group" style={{ animationDelay: `${index * 100 + 300}ms` }}>
                      <InfoCard
                        title={card.title}
                        description={card.description}
                        icon={card.icon}
                        onClick={card.onClick}
                        backgroundImage={card.backgroundImage}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
          
          {/* Features Section */}
          <section className="py-20 bg-white">
            <div className="container px-4 md:px-6">
              <div className="max-w-3xl mx-auto text-center mb-16">
                <h2 className="text-3xl font-bold mb-4">Everything You Need</h2>
                <p className="text-gray-600">Our campus navigation system provides comprehensive tools and information to make your campus experience seamless.</p>
              </div>
              
              <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="bg-gray-50 rounded-2xl p-6 shadow-sm border border-gray-100 animate-float" style={{ animationDelay: '0ms' }}>
                  <div className="w-12 h-12 bg-campus-100 rounded-xl flex items-center justify-center text-campus-600 mb-4">
                    <MapPin size={24} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Interactive Maps</h3>
                  <p className="text-gray-600">Navigate campus with our detailed interactive maps and get directions to any building or facility.</p>
                </div>
                
                <div className="bg-gray-50 rounded-2xl p-6 shadow-sm border border-gray-100 animate-float" style={{ animationDelay: '200ms' }}>
                  <div className="w-12 h-12 bg-campus-100 rounded-xl flex items-center justify-center text-campus-600 mb-4">
                    <MessageSquare size={24} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">AI Chatbot</h3>
                  <p className="text-gray-600">Get instant answers to your questions about campus facilities, events, and resources.</p>
                </div>
                
                <div className="bg-gray-50 rounded-2xl p-6 shadow-sm border border-gray-100 animate-float" style={{ animationDelay: '400ms' }}>
                  <div className="w-12 h-12 bg-campus-100 rounded-xl flex items-center justify-center text-campus-600 mb-4">
                    <School size={24} />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Academic Resources</h3>
                  <p className="text-gray-600">Access course materials, past papers, and study resources all in one convenient place.</p>
                </div>
              </div>
            </div>
          </section>
        </main>
        
        <footer className="bg-white py-8 border-t border-gray-200">
          <div className="container px-4 md:px-6">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <div className="mb-4 md:mb-0">
                <p className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-campus-600 to-campus-800">Campus Connect</p>
                <p className="text-sm text-gray-600 mt-1">
                  © 2025 Campus Information & Navigation System. All rights reserved.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-8">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Resources</h4>
                  <div className="grid gap-1">
                    <a href="#" className="text-sm text-gray-600 hover:text-campus-600">FAQs</a>
                    <a href="#" className="text-sm text-gray-600 hover:text-campus-600">Support</a>
                    <a href="#" className="text-sm text-gray-600 hover:text-campus-600">Contact</a>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Legal</h4>
                  <div className="grid gap-1">
                    <a href="#" className="text-sm text-gray-600 hover:text-campus-600">Privacy Policy</a>
                    <a href="#" className="text-sm text-gray-600 hover:text-campus-600">Terms of Service</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </AuthCheck>
  );
};

export default HomePage;
