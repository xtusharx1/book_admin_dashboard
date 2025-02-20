import React, { useEffect, useState } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Default Icon for Markers
const defaultIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  shadowSize: [41, 41],
});

const LocationMap = () => {
  const [locations, setLocations] = useState([]);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await axios.get(
          "http://ec2-13-202-53-68.ap-south-1.compute.amazonaws.com:3000/api/locations/all/"
        );
        setLocations(response.data);
      } catch (error) {
        console.error("Error fetching location data:", error);
      }
    };
    fetchLocations();
  }, []);

  return (
    <div className="location-map-page">
      <h2>Map</h2>
      <div className="dashboard-map">
        <MapContainer
          center={[21.1458, 79.0882]} // Adjust center
          zoom={5}
          style={{ height: "800px", width: "100%" }}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {/* ✅ Use Clustering Here */}
          <MarkerClusterGroup chunkedLoading>
            {locations.map((location) => (
              <Marker
                key={location.location_id}
                position={[location.latitude, location.longitude]}
                icon={defaultIcon}
              >
                <Popup>
                  <a
                    href={`/portal/user-view/${location.u_id}`}
                    className="btn btn-primary btn-sm"
                    style={{
                      padding: "0.5rem",
                      textDecoration: "none",
                      color: "white",
                      backgroundColor: "#007bff",
                      borderRadius: "5px",
                      display: "inline-block",
                    }}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View Profile
                  </a>
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>
      </div>
    </div>
  );
};

export default LocationMap;
