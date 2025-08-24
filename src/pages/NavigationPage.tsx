
import React, { useState } from 'react';
import Navbar from '@/components/Navbar';
import AuthCheck from '@/components/AuthCheck';
import LocationCard from '@/components/LocationCard';
import LocationModal from '@/components/LocationModal';

interface Location {
  id: number;
  title: string;
  description: string;
  image: string;
  details: string;
}

const NavigationPage: React.FC = () => {
  const [selectedLocation, setSelectedLocation] = useState<Location | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const locations: Location[] = [
    {
      id: 1,
      title: 'Main Library',
      description: 'Central campus library with study spaces',
      image: 'https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80',
      details: 'The Main Library is located at the center of campus. It features multiple floors of study spaces, book collections, and computer labs. Opening hours are from 8 AM to 10 PM on weekdays, and 10 AM to 6 PM on weekends.'
    },
    {
      id: 2,
      title: 'Science Building',
      description: 'Home to labs and research facilities',
      image: 'https://images.unsplash.com/photo-1583468982228-19f19164aee1?auto=format&fit=crop&q=80',
      details: 'The Science Building houses state-of-the-art laboratories for physics, chemistry, and biology. It contains lecture halls, research spaces, and faculty offices. The building is accessible from 7 AM to 9 PM daily.'
    },
    {
      id: 3,
      title: 'Student Center',
      description: 'Hub for student activities and services',
      image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&q=80',
      details: 'The Student Center is the heart of campus life, offering dining options, study areas, and event spaces. It also houses the bookstore and various student service offices. Open daily from 7 AM to 11 PM.'
    },
    {
      id: 4,
      title: 'Engineering Complex',
      description: 'Advanced facilities for engineering students',
      image: 'https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80',
      details: 'The Engineering Complex features specialized labs, workshops, and project spaces. It includes computer labs with industry-standard software and equipment for various engineering disciplines. Accessible to engineering students 24/7 with ID.'
    },
    {
      id: 5,
      title: 'Cafeteria',
      description: 'Main dining area with various food options',
      image: 'https://images.unsplash.com/photo-1544148103-0773bf10d330?auto=format&fit=crop&q=80',
      details: 'The campus cafeteria offers a wide variety of food options including international cuisine, vegetarian, and vegan choices. Breakfast is served from 7 AM to 10 AM, lunch from 11 AM to 2 PM, and dinner from 5 PM to 8 PM.'
    },
    {
      id: 6,
      title: 'Sports Complex',
      description: 'Athletic facilities and recreation center',
      image: 'https://images.unsplash.com/photo-1626248801379-51a0748e0dfa?auto=format&fit=crop&q=80',
      details: 'The Sports Complex includes an indoor gymnasium, swimming pool, fitness center, and outdoor playing fields. Students can reserve facilities or join intramural sports programs. Open from 6 AM to 10 PM daily.'
    },
    {
      id: 7,
      title: 'Arts Building',
      description: 'Home to visual and performing arts',
      image: 'https://images.unsplash.com/photo-1513307018760-53c69a5ad46c?auto=format&fit=crop&q=80',
      details: 'The Arts Building houses galleries, studios, and performance spaces. It includes facilities for painting, sculpture, music practice, and theater productions. The building hosts regular exhibitions and performances open to the campus community.'
    },
    {
      id: 8,
      title: 'Administration Building',
      description: 'Central offices for campus administration',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&q=80',
      details: 'The Administration Building contains offices for university leadership, admissions, financial aid, and other administrative departments. Students can visit for enrollment services, transcript requests, and other administrative needs. Open weekdays from 9 AM to 5 PM.'
    },
  ];
  
  const handleLocationClick = (location: Location) => {
    setSelectedLocation(location);
    setIsModalOpen(true);
  };

  return (
    <AuthCheck>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        
        <main className="flex-grow container px-4 md:px-6 py-8">
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold">Campus Navigation</h1>
                <p className="text-gray-600 mt-2">Explore campus locations and find your way around</p>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {locations.map((location, index) => (
                <div key={location.id} className="animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                  <LocationCard
                    title={location.title}
                    image={location.image}
                    onClick={() => handleLocationClick(location)}
                  />
                </div>
              ))}
            </div>
          </div>
        </main>
        
        <LocationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          location={selectedLocation}
        />
      </div>
    </AuthCheck>
  );
};

export default NavigationPage;
