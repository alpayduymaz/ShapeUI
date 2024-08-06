import React, { useState, useEffect } from 'react';
import ClientList from './components/ClientList';
import ShapePanel from './components/ShapePanel';
import axios from 'axios';
import './App.css';

function App() {
  const [mode, setMode] = useState('');
  const [ip, setIp] = useState('');
  const [port, setPort] = useState('');
  const [shapes, setShapes] = useState([]);
  const [messages, setMessages] = useState(new Set());
  const [serverInfo, setServerInfo] = useState('');
  const [isConnected, setIsConnected] = useState(false); //connection status


  const serverUrl = mode === 'client' ? `http://${ip}:${port}` : 'http://localhost:5180';

  const handleModeSelection = (selectedMode) => {
    setMode(selectedMode);
  };

  const fetchShapes = async () => { //apiden shapes verisini çekiyor
    try {
      const response = await axios.get(`${serverUrl}/Shape/shapes`);
      setShapes(response.data);
    } catch (error) {
      console.log(serverUrl)
      console.error('Error fetching shapes:', error);
    }
  };

  const updateShapes = () => {
    setShapes((prevShapes) => {
      return prevShapes.map((shape) => {
        const newShape = { ...shape };
        newShape.x += newShape.speedX;
        newShape.y += newShape.speedY;

        const containerSize = Math.min(window.innerWidth, window.innerHeight) * 0.9;
        const maxX = containerSize - newShape.width;
        const maxY = containerSize - newShape.height;

        if (newShape.x < 0 || newShape.x > maxX) {
          newShape.speedX *= -1;
          newShape.x = Math.max(0, Math.min(newShape.x, maxX)); 
        }
        if (newShape.y < 0 || newShape.y > maxY) {
          newShape.speedY *= -1;
          newShape.y = Math.max(0, Math.min(newShape.y, maxY)); 
        }

        return newShape;
      });
    });
  };

  const sendShapesToServer = async () => {  //güncellenmesi için apiye shapes gönderiyor
    try {
      await axios.post(`${serverUrl}/Shape/update`, shapes);
    } catch (error) {
      console.error('Error sending shapes to server:', error);
    }
  };

  useEffect(() => {
    if (mode === 'server' || (mode === 'client' && isConnected)) {
      fetchShapes();
      const updateInterval = setInterval(updateShapes, 1000 / 60);
      const sendInterval = setInterval(sendShapesToServer, 20);//20 milisaniyede bir güncelleme

      return () => {
        clearInterval(updateInterval);
        clearInterval(sendInterval);
      };
    }
  }, [mode, isConnected]); 

  const handleConnect = () => {  //websoket ile udp bağlantısı
    if (mode === 'client') {
      let ws;

      try {
        ws = new WebSocket(`ws://${ip}:${port}`);
      } catch (error) {
        console.error('Failed to create WebSocket:', error);
        setServerInfo('Failed to create WebSocket. Please check the IP and port.');
        return; // Exit function if WebSocket fails
      }
      ws.onopen = () => {
        console.log('Connected to server');
        setServerInfo(`Connected to server at ws://${ip}:${port}`);
        ws.send('Hello, server!');
        setIsConnected(true); // Set connection status to true
        fetchShapes();
        console.log(ip, port);
      };

      ws.onmessage = (event) => {
        console.log('Message from server:', event.data);
        try {
          const data = event.data;
          setMessages((prevMessages) => new Set(prevMessages).add(data));
        } catch (error) {
          console.log(event.data);
          console.error('Failed to parse message as JSON:', event.data);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        setServerInfo('WebSocket error occurred. Please check the IP and port.');
      };

      ws.onclose = () => {
        console.log('WebSocket connection closed');
        setServerInfo('Disconnected from server');
        setShapes([]); // Clear shapes when WebSocket is closed
        setIsConnected(false);//connection status false
      };
    } else {
      console.log('Running in server mode');
    }
  };

  return (
    <div className="App">
      <h1>Shape App</h1>
      {!mode && (
        <div>
          <button onClick={() => handleModeSelection('server')}>Server Mode</button>
          <button onClick={() => handleModeSelection('client')}>Client Mode</button>
        </div>
      )}
      {mode && (
        <button onClick={() => setMode('')}>Go Back</button>
      )}
      {mode === 'client' && (
        <div>
          <input
            type="text"
            placeholder="Server IP"
            value={ip}
            onChange={(e) => setIp(e.target.value)}
          />
          <input
            type="text"
            placeholder="Server Port"
            value={port}
            onChange={(e) => setPort(e.target.value)}
          />
          <button onClick={handleConnect}>Connect</button>
          <div>
            <h2>Server Info</h2>
            <p>{serverInfo}</p>
            <h2>Incoming Messages</h2>
            <ul>
              {[...messages].map((message, index) => (
                <li key={index}>{message}</li>
              ))}
            </ul>
            {isConnected && ( // Only display shapes if connected
              <div>
                <h2>Shapes</h2>
                <div className="shape-container">
                  {shapes.map((shape) => {
                    const { id, type, x, y, width, height, color } = shape;
                    const style = {
                      left: `${x}px`,
                      top: `${y}px`,
                      backgroundColor: color,
                      width: `${width}px`,
                      height: `${height}px`,
                    };
                    const shapeClass = type.toLowerCase();
                    return (
                      <div
                        key={id}
                        className={shapeClass}
                        style={style}
                      />
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {mode === 'server' && (
        <div>
          <ShapePanel serverUrl={serverUrl} fetchShapes={fetchShapes} />
          <div>
            <h2>Shapes</h2>
            <div className="shape-container">
              {shapes.map((shape) => {
                const { id, type, x, y, width, height, color } = shape;
                const style = {
                  left: `${x}px`,
                  top: `${y}px`,
                  backgroundColor: color,
                  width: `${width}px`,
                  height: `${height}px`,
                };
                const shapeClass = type.toLowerCase();
                return (
                  <div
                    key={id}
                    className={shapeClass}
                    style={style}
                  />
                );
              })}
            </div>
          </div>
          <ClientList />
        </div>
      )}
    </div>
  );
}

export default App;
