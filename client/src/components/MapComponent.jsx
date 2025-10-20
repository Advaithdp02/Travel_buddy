import { useEffect, useState, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";

function DynamicRouting({ userCoords, destCoords }) {
  const map = useMap();
  const routingRef = useRef(null);

  useEffect(() => {
    if (!userCoords || !destCoords) return;

    // If routing already exists, just update waypoints
    if (routingRef.current) {
      routingRef.current.setWaypoints([
        L.latLng(userCoords.latitude, userCoords.longitude),
        L.latLng(destCoords[1], destCoords[0]),
      ]);
      map.flyTo([destCoords[1], destCoords[0]], 13);
      return;
    }

    // Create routing for the first time
    routingRef.current = L.Routing.control({
      waypoints: [
        L.latLng(userCoords.latitude, userCoords.longitude),
        L.latLng(destCoords[1], destCoords[0]),
      ],
      lineOptions: { styles: [{ color: "#3b82f6", weight: 5 }] },
      addWaypoints: false,
      draggableWaypoints: false,
      fitSelectedRoutes: true,
      show: false,
    }).addTo(map);

    map.flyTo([destCoords[1], destCoords[0]], 13);

    // Clean up on unmount
    return () => {
      if (routingRef.current) map.removeControl(routingRef.current);
    };
  }, [map, userCoords, destCoords]);

  return null;
}

export default function MapComponent({ destination }) {
  const [userCoords, setUserCoords] = useState(null);
  const [destCoords, setDestCoords] = useState(null);

  useEffect(() => {
    if (
      destination?.userCoordinates?.length &&
      destination?.destinationCoordinates?.length
    ) {
      setUserCoords({
        latitude: destination.userCoordinates[1],
        longitude: destination.userCoordinates[0],
      });
      setDestCoords(destination.destinationCoordinates);
    }
  }, [destination]);

  if (!userCoords || !destCoords) {
    return (
      <div className="h-[400px] flex items-center justify-center text-gray-500">
        Loading map...
      </div>
    );
  }

  return (
    <MapContainer
      center={[userCoords.latitude, userCoords.longitude]}
      zoom={7}
      className="h-[400px] w-full rounded-2xl shadow-lg"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <Marker position={[userCoords.latitude, userCoords.longitude]}>
        <Popup>You are here</Popup>
      </Marker>

      <Marker position={[destCoords[1], destCoords[0]]}>
        <Popup>{destination.name || "Destination"}</Popup>
      </Marker>

      <DynamicRouting userCoords={userCoords} destCoords={destCoords} />
    </MapContainer>
  );
}
