
import React, { useState, useEffect } from 'react';
import { Ticket } from '@/utils/types';
import TicketManagement from '@/components/ticket/TicketManagement';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

// Placeholder for mock data - in a real app, this would come from an API
const MOCK_TICKETS: Ticket[] = [
  {
    id: '1',
    userId: 'farmer_1',
    userType: 'farmer',
    userName: 'John Farmer',
    userContact: '9876543210',
    message: 'I am having trouble adding new products to my inventory.',
    status: 'pending',
    dateCreated: new Date(2023, 4, 15),
    lastUpdated: new Date(2023, 4, 15)
  },
  {
    id: '2',
    userId: 'customer_1',
    userType: 'customer',
    userName: 'Jane Customer',
    userContact: '8765432109',
    message: 'My order #12345 has not been delivered yet, and it has been 5 days.',
    status: 'in-review',
    dateCreated: new Date(2023, 4, 10),
    lastUpdated: new Date(2023, 4, 12)
  },
  {
    id: '3',
    userId: 'farmer_2',
    userType: 'farmer',
    userName: 'Robert Grower',
    userContact: '7654321098',
    message: 'I need to update my bank account details.',
    status: 'closed',
    dateCreated: new Date(2023, 4, 5),
    lastUpdated: new Date(2023, 4, 7),
    resolution: 'Bank details updated successfully.'
  }
];

const TicketsPage: React.FC = () => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  
  useEffect(() => {
    // In a real app, this would be an API call
    // For now, load from localStorage or use mock data
    const savedTickets = localStorage.getItem('tickets');
    if (savedTickets) {
      try {
        setTickets(JSON.parse(savedTickets));
      } catch (error) {
        console.error('Error parsing tickets:', error);
        // Fallback to mock data
        setTickets(MOCK_TICKETS);
      }
    } else {
      setTickets(MOCK_TICKETS);
    }
  }, []);
  
  // Save tickets to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('tickets', JSON.stringify(tickets));
  }, [tickets]);

  const handleUpdateTicket = (updatedTicket: Ticket) => {
    setTickets(prevTickets => 
      prevTickets.map(ticket => 
        ticket.id === updatedTicket.id ? updatedTicket : ticket
      )
    );
    
    toast({
      title: "Ticket Updated",
      description: `Ticket #${updatedTicket.id} has been updated to ${updatedTicket.status}.`,
    });
  };

  return (
    <div className="container mx-auto p-4 min-h-screen max-h-screen flex flex-col">
      <h1 className="text-2xl font-bold mb-6">Ticket Management</h1>
      <ScrollArea className="flex-1 overflow-y-auto">
        <TicketManagement tickets={tickets} onUpdateTicket={handleUpdateTicket} />
      </ScrollArea>
    </div>
  );
};

export default TicketsPage;
