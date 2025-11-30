import React from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import AuthCheck from '@/components/AuthCheck';
import InfoCard from '@/components/InfoCard';
import { Button } from '@/components/ui/button';
import {
  Building,
  Clock,
  BookOpen,
  Coffee,
  Bus,
  Phone,
  Stethoscope,
  GraduationCap,
  Map
} from 'lucide-react';

// Add styles to index.css if not already present
const styles = `
  .feature-card {
    transition: all 0.3s ease;
    background: white;
    background-size: 400% 400%;
  }

  .feature-card:hover {
    transform: translateY(-5px);
  }

  .feature-card:hover .learn-more-text {
    color: var(--color);
  }

  .feature-card:hover .learn-more-arrow {
    transform: translateX(4px);
  }

  .animate-fade-in {
    animation: fadeIn 0.5s ease-out forwards;
    opacity: 0;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const OtherInformationPage: React.FC = () => {
  const navigate = useNavigate();
  const features = [
    {
      title: "Exam Hall Finder",
      description: "Find your exam hall location and seating arrangements easily.",
      icon: <Map size={24} />,
      backgroundImage: "url('/exam hall finder.png')",
      onClick: () => navigate('/exam-hall-finder')
    },
    {
      title: "Resume Builder",
      description: "Create and customize your professional resume with our easy-to-use builder.",
      icon: <BookOpen size={24} />,
      backgroundImage: "url('/resume builder.png')",
      onClick: () => navigate('/resume-builder')
    },
    {
      title: "JobFindr",
      description: "Explore job opportunities and career resources.",
      icon: <Building size={24} />,
      backgroundImage: "url(/jobfinder.png)",
      onClick: () => navigate('/job-search')
    },
    {
      title: "AI-Powered YouTube Search",
      description: "Find the perfect video tutorial or content.",
      icon: <GraduationCap size={24} />,
      backgroundImage: "url('/AI-Powered YouTube Search.png')",
      onClick: () => navigate('/youtube-search')
    },
    {
      title: "AI Study Buddy",
      description: "Your personal AI assistant for study plans, practice questions, and concept explanations.",
      icon: <BookOpen size={24} />,
      backgroundImage: "url('/AI Study Buddy.png')",
      onClick: () => navigate('/study-buddy')
    },
    // {
    //   title: "Campus Amenities",
    //   description: "Discover cafeterias, shops, printing services, and other amenities.",
    //   icon: <Coffee size={24} />,
    //   backgroundImage: "url(/background.png)",
    //   onClick: () => {}
    // },
    // {
    //   title: "Transportation",
    //   description: "Get details about college bus services and parking facilities.",
    //   icon: <Bus size={24} />,
    //   backgroundImage: "url(/background.png)",
    //   onClick: () => {}
    // },
    // {
    //   title: "Emergency Contacts",
    //   description: "Security: 100\nMedical Emergency: 102\nCampus Helpline: (555) 0123-4567",
    //   icon: <Phone className="w-8 h-8 text-red-500" />,
    //   color: "border-red-500"
    // },
    // {
    //   title: "Medical Facilities",
    //   description: "On-campus Medical Center, First Aid Stations, Ambulance Service, Mental Health Support",
    //   icon: <Stethoscope className="w-8 h-8 text-pink-500" />,
    //   color: "border-pink-500"
    // },
    // {
    //   title: "Academic Support",
    //   description: "Learning Resource Center, Writing Center, Career Counseling, Academic Advisors",
    //   icon: <BookOpen className="w-8 h-8 text-teal-500" />,
    //   color: "border-teal-500"
    // }
  ];

  return (
    <AuthCheck>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow">
          {/* Hero Section */}
          <section className="text-white pt-16 pb-24 md:pt-20 md:pb-32 relative overflow-hidden"
            style={{ backgroundImage: 'url("\campus hub.png")', backgroundSize: 'cover', backgroundPosition: 'center' }}>
            <div className="absolute inset-0 bg-black opacity-50"></div>
            <div className="container relative px-4 md:px-6 z-10">
              <div className="max-w-4xl mx-auto text-center">
                <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-6 animate-fade-in leading-tight">
                  Campus Hub
                </h1>
                <p className="text-lg md:text-xl mb-8 text-gray-100 animate-fade-in max-w-2xl mx-auto"
                  style={{ animationDelay: '100ms' }}>
                  campus tools and services
                </p>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="py-10 bg-gray-50">
            <div className="container px-4 md:px-6">
              <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-6">
                  <div>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900">Campus Resources</h2>
                    <p className="text-gray-600 mt-2">Access important information about campus facilities</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                  {features.map((feature, index) => (
                    <div key={index} className="animate-fade-in" style={{ animationDelay: `${index * 100 + 300}ms` }}>
                      <InfoCard
                        title={feature.title}
                        description={feature.description}
                        icon={feature.icon}
                        onClick={feature.onClick}
                        backgroundImage={feature.backgroundImage}
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </AuthCheck>
  );
};

export default OtherInformationPage;