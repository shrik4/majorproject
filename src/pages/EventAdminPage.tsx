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

const EventAdminPage: React.FC = () => {
  const [events, setEvents] = useState<Event[]>([]);
  const [newEvent, setNewEvent] = useState<Event>({
    title: '',
    date: '',
    time: '',
    location: '',
    description: '',
  });
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setNewEvent((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setEditingEvent((prev) => {
      if (prev) {
        return {
          ...prev,
          [id]: value,
        };
      }
      return null;
    });
  };

  const handleAddEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5001/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEvent),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setNewEvent({
        title: '',
        date: '',
        time: '',
        location: '',
        description: '',
      });
      fetchEvents();
    } catch (error) {
      console.error('Error adding event:', error);
    }
  };

  const handleUpdateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent || editingEvent.id === undefined) return;
    try {
      const response = await fetch(`http://localhost:5001/events/${editingEvent.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(editingEvent),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setEditingEvent(null);
      fetchEvents();
    } catch (error) {
      console.error('Error updating event:', error);
    }
  };

  const handleDeleteEvent = async (id: number) => {
    try {
      const response = await fetch(`http://localhost:5001/events/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };

  return (
    <AuthCheck>
      <div className="min-h-screen flex flex-col bg-gray-50">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-6">Event Administration</h1>
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="mb-8">
              <h2 className="text-2xl font-semibold mb-4">{editingEvent ? 'Edit Event' : 'Add New Event'}</h2>
              <form onSubmit={editingEvent ? handleUpdateEvent : handleAddEvent} className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">Event Title</label>
                  <input type="text" id="title" value={editingEvent ? editingEvent.title : newEvent.title} onChange={editingEvent ? handleEditInputChange : handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" placeholder="e.g., Annual Tech Fest" required />
                </div>
                <div>
                  <label htmlFor="date" className="block text-sm font-medium text-gray-700">Date</label>
                  <input type="date" id="date" value={editingEvent ? editingEvent.date : newEvent.date} onChange={editingEvent ? handleEditInputChange : handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" required />
                </div>
                <div>
                  <label htmlFor="time" className="block text-sm font-medium text-gray-700">Time</label>
                  <input type="time" id="time" value={editingEvent ? editingEvent.time : newEvent.time} onChange={editingEvent ? handleEditInputChange : handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" required />
                </div>
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700">Location</label>
                  <input type="text" id="location" value={editingEvent ? editingEvent.location : newEvent.location} onChange={editingEvent ? handleEditInputChange : handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" placeholder="e.g., University Auditorium" required />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea id="description" rows={3} value={editingEvent ? editingEvent.description : newEvent.description} onChange={editingEvent ? handleEditInputChange : handleInputChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm p-2" placeholder="Brief description of the event" required></textarea>
                </div>
                <button type="submit" className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                  {editingEvent ? 'Update Event' : 'Add Event'}
                </button>
                {editingEvent && (
                  <button type="button" onClick={() => setEditingEvent(null)} className="ml-2 inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
                    Cancel
                  </button>
                )}
              </form>
            </div>

            <div>
              <h2 className="text-2xl font-semibold mb-4">Existing Events</h2>
              <ul className="space-y-4">
                {events.map((event, index) => (
                  <li key={event.id || index} className="bg-gray-100 p-4 rounded-md shadow-sm flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-medium">{event.title}</h3>
                      <p className="text-gray-600 text-sm">Date: {event.date} | Time: {event.time} | Location: {event.location}</p>
                      <p className="text-gray-700 text-sm">{event.description}</p>
                    </div>
                    <div className="flex space-x-2">
                      <button onClick={() => setEditingEvent({ ...event, id: index })} className="text-indigo-600 hover:text-indigo-900 text-sm">Edit</button>
                      <button onClick={() => handleDeleteEvent(index)} className="text-red-600 hover:text-red-900 text-sm">Delete</button>
                    </div>
                  </li>
                ))}
                {events.length === 0 && <p>No events found.</p>}
              </ul>
            </div>
          </div>
        </main>
      </div>
    </AuthCheck>
  );
};

export default EventAdminPage;