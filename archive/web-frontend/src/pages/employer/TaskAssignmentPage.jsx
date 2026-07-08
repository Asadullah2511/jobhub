import { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import axios from '../../lib/axios';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix for default marker icons in react-leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const blueIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const greenIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

export default function TaskAssignmentPage() {
  const [jobLocation, setJobLocation] = useState({ lat: 31.5204, lng: 74.3587 }); // Lahore default
  const [radius, setRadius] = useState(5000); // 5km default
  const [nearbyWorkers, setNearbyWorkers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedWorker, setSelectedWorker] = useState(null);

  useEffect(() => {
    fetchNearbyWorkers();
  }, [radius]);

  const fetchNearbyWorkers = async () => {
    try {
      setLoading(true);
      // Mock data for demonstration - replace with actual API call
      const mockWorkers = [
        {
          id: 1,
          name: 'Ahmed Khan',
          skills: ['Plumbing', 'Electrical'],
          rating: 4.5,
          location: { lat: 31.5304, lng: 74.3687 },
          available: true,
          hourlyRate: 'Rs 500/hour',
        },
        {
          id: 2,
          name: 'Fatima Ali',
          skills: ['Carpentry', 'Painting'],
          rating: 4.8,
          location: { lat: 31.5154, lng: 74.3487 },
          available: true,
          hourlyRate: 'Rs 600/hour',
        },
        {
          id: 3,
          name: 'Hassan Ahmed',
          skills: ['Construction', 'Masonry'],
          rating: 4.2,
          location: { lat: 31.5254, lng: 74.3787 },
          available: false,
          hourlyRate: 'Rs 450/hour',
        },
      ];
      setNearbyWorkers(mockWorkers);
    } catch (err) {
      console.error('Failed to fetch nearby workers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleAssignWorker = async (worker) => {
    if (window.confirm(`Assign task to ${worker.name}?`)) {
      try {
        // API call to assign worker would go here
        alert(`Task assigned to ${worker.name} successfully!`);
        setSelectedWorker(null);
      } catch (err) {
        alert('Failed to assign task');
      }
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-neutral-900 mb-2">Task Assignment</h1>
        <p className="text-neutral-600 mb-8">Find and assign nearby workers for your tasks</p>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2">
            <div className="bg-white/70 backdrop-blur-lg border border-white/50 rounded-2xl overflow-hidden shadow-lg">
              <div className="p-4 border-b border-neutral-200">
                <div className="flex items-center gap-4">
                  <label className="text-sm font-medium text-neutral-700">
                    Search Radius:
                  </label>
                  <input
                    type="range"
                    min="1000"
                    max="20000"
                    step="1000"
                    value={radius}
                    onChange={(e) => setRadius(parseInt(e.target.value))}
                    className="flex-1"
                  />
                  <span className="text-sm font-semibold text-neutral-900">
                    {(radius / 1000).toFixed(1)} km
                  </span>
                </div>
              </div>

              <div className="h-[600px]">
                <MapContainer
                  center={[jobLocation.lat, jobLocation.lng]}
                  zoom={13}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {/* Job Location */}
                  <Marker position={[jobLocation.lat, jobLocation.lng]} icon={greenIcon}>
                    <Popup>
                      <div className="p-2">
                        <strong>Job Location</strong>
                      </div>
                    </Popup>
                  </Marker>

                  {/* Search Radius Circle */}
                  <Circle
                    center={[jobLocation.lat, jobLocation.lng]}
                    radius={radius}
                    pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
                  />

                  {/* Worker Markers */}
                  {nearbyWorkers.map((worker) => (
                    <Marker
                      key={worker.id}
                      position={[worker.location.lat, worker.location.lng]}
                      icon={blueIcon}
                      eventHandlers={{
                        click: () => setSelectedWorker(worker),
                      }}
                    >
                      <Popup>
                        <div className="p-2">
                          <strong>{worker.name}</strong>
                          <div className="text-sm text-neutral-600">
                            {worker.skills.join(', ')}
                          </div>
                          <div className="text-xs text-neutral-500 mt-1">
                            ⭐ {worker.rating} • {worker.hourlyRate}
                          </div>
                        </div>
                      </Popup>
                    </Marker>
                  ))}
                </MapContainer>
              </div>
            </div>
          </div>

          {/* Worker List */}
          <div>
            <div className="bg-white/70 backdrop-blur-lg border border-white/50 rounded-2xl p-6 shadow-lg sticky top-8">
              <h2 className="text-xl font-bold text-neutral-900 mb-4">
                Nearby Workers ({nearbyWorkers.length})
              </h2>

              {loading ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                </div>
              ) : nearbyWorkers.length === 0 ? (
                <p className="text-neutral-500 text-center py-8">No workers found in this area</p>
              ) : (
                <div className="space-y-4 max-h-[600px] overflow-y-auto">
                  {nearbyWorkers.map((worker) => (
                    <div
                      key={worker.id}
                      className={`p-4 border rounded-lg transition-all cursor-pointer ${
                        selectedWorker?.id === worker.id
                          ? 'border-primary-500 bg-primary-50'
                          : 'border-neutral-200 bg-white hover:border-neutral-300'
                      }`}
                      onClick={() => setSelectedWorker(worker)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-neutral-900">{worker.name}</h3>
                          <div className="text-sm text-neutral-600">⭐ {worker.rating}</div>
                        </div>
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            worker.available
                              ? 'bg-success-100 text-success-700'
                              : 'bg-neutral-100 text-neutral-600'
                          }`}
                        >
                          {worker.available ? 'Available' : 'Busy'}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-1 mb-2">
                        {worker.skills.map((skill, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-primary-100 text-primary-700 rounded text-xs"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>

                      <div className="text-sm text-neutral-600 mb-3">{worker.hourlyRate}</div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAssignWorker(worker);
                        }}
                        disabled={!worker.available}
                        className="w-full px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {worker.available ? 'Assign Task' : 'Not Available'}
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
