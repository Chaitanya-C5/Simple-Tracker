import io from 'socket.io-client'
import { useEffect, useState } from 'react'
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";

function Home() {
  const [error, setError] = useState(null)
  const [position, setPosition] = useState(null)
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const socket = io.connect('https://simple-tracker-backend.onrender.com')
    if(navigator.geolocation) {
        navigator.geolocation.watchPosition(
            (position) => {
                const { latitude, longitude } = position.coords
                setPosition([latitude, longitude])
                socket.emit('send-location', { latitude, longitude })
            },
            (error) => {
                console.log(error)
                setError(error)
            },
            {
                enableHighAccuracy: true,
                maximumAge: 0, // No caching
                timeout: 3000,
            }
        )
    }

    socket.on('receive-location', (data) => {
        setUsers((prevUsers) => {
            const newUsers = prevUsers.filter((user) => user.id !== data.id);
            newUsers.push({ id: data.id, location: [data.latitude, data.longitude] });
            return newUsers;
          });
    })
    
    socket.on('disconnect-user', ({id}) => {
        setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id))
    });
        
  },[])

  if(error) return <div>{error}</div>
  if (position === null) return <div>Loading...</div>;

  return (
    <MapContainer center={position} zoom={15} style={{ height: "100%", width: "100%" }}> 
        <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />

        {
            users.map((user) => 
                user.location ? (
                    <Marker key={user.id} position={user.location}>
                            <Popup>Another user is here!</Popup>
                    </Marker> 
                        
                ) : null
            )
        }
    </MapContainer>
  )
}

export default Home