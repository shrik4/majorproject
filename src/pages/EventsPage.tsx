import Navbar from '@/components/Navbar';
import AuthCheck from '../components/AuthCheck';
import React, { useState, useEffect } from 'react';

interface Event {
  id?: number;
  title: string;
  date: string;
  time: string;
  location: string;
  description: string;
}

const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch('http://localhost:5001/events');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setEvents(data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

  return (
    <AuthCheck>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6 text-center">Upcoming Events</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event, index) => (
              <div key={event.id || index} className="bg-white rounded-lg shadow-md overflow-hidden">
                <div className="p-6">
                  <h2 className="text-xl font-semibold mb-2 text-gray-800">{event.title}</h2>
                  <p className="text-gray-600 text-sm mb-1"><span className="font-medium">Date:</span> {event.date}</p>
                  <p className="text-gray-600 text-sm mb-1"><span className="font-medium">Time:</span> {event.time}</p>
                  <p className="text-gray-600 text-sm mb-3"><span className="font-medium">Location:</span> {event.location}</p>
                  <p className="text-gray-700 text-base">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
          {events.length === 0 && (
            <p className="text-center text-gray-500 text-lg mt-8">No upcoming events at the moment. Please check back later!</p>
          )}
        </main>
      </div>
    </AuthCheck>
  );
};

export default EventsPage;