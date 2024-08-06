import React, { useEffect, useState } from 'react';
import axios from 'axios';

function ClientList() {
  const [clients, setClients] = useState([]);

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get('http://localhost:5180/clients');
        setClients(response.data);
      } catch (error) {
        console.error('Error fetching client list:', error);
      }
    };

    fetchClients();
    const intervalId = setInterval(fetchClients, 5000); // Update every 5 seconds

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div>
      <h1>Connected Clients</h1>
      <ul>
        {clients.map((client, index) => (
          <li key={index}>Client {client}</li>
        ))}
      </ul>
    </div>
  );
}

export default ClientList;
