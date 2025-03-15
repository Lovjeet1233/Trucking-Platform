
// components/tracking/TrackingMap.js
import { useState, useEffect } from 'react';

const TrackingMap = ({ currentLocation, pickupLocation, deliveryLocation }) => {
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapId = 'tracking-map';

  useEffect(() => {
    // Load Google Maps API script
    const loadGoogleMapsScript = () => {
      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setMapLoaded(true);
      };
      document.body.appendChild(script);
    };

    if (!window.google) {
      loadGoogleMapsScript();
    } else {
      setMapLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (mapLoaded && pickupLocation && deliveryLocation) {
      initMap();
    }
  }, [mapLoaded, currentLocation, pickupLocation, deliveryLocation]);

  const initMap = () => {
    const google = window.google;
    
    // Create the map centered on the current location or the middle point between pickup and delivery
    let mapCenter;
    if (currentLocation && currentLocation.coordinates) {
      mapCenter = { 
        lat: currentLocation.coordinates[1], 
        lng: currentLocation.coordinates[0] 
      };
    } else {
      // Calculate middle point between pickup and delivery
      const pickupLatLng = {
        lat: pickupLocation.coordinates[1],
        lng: pickupLocation.coordinates[0]
      };
      const deliveryLatLng = {
        lat: deliveryLocation.coordinates[1],
        lng: deliveryLocation.coordinates[0]
      };
      
      mapCenter = {
        lat: (pickupLatLng.lat + deliveryLatLng.lat) / 2,
        lng: (pickupLatLng.lng + deliveryLatLng.lng) / 2
      };
    }

    const map = new google.maps.Map(document.getElementById(mapId), {
      center: mapCenter,
      zoom: 10,
      mapTypeControl: false,
      fullscreenControl: false,
    });

    // Create markers
    const pickupMarker = new google.maps.Marker({
      position: { lat: pickupLocation.coordinates[1], lng: pickupLocation.coordinates[0] },
      map: map,
      title: 'Pickup Location',
      icon: {
        url: 'http://maps.google.com/mapfiles/ms/icons/green-dot.png',
      },
    });

    const deliveryMarker = new google.maps.Marker({
      position: { lat: deliveryLocation.coordinates[1], lng: deliveryLocation.coordinates[0] },
      map: map,
      title: 'Delivery Location',
      icon: {
        url: 'http://maps.google.com/mapfiles/ms/icons/red-dot.png',
      },
    });

    // Add current location marker if available
    if (currentLocation && currentLocation.coordinates) {
      const currentLocationMarker = new google.maps.Marker({
        position: { lat: currentLocation.coordinates[1], lng: currentLocation.coordinates[0] },
        map: map,
        title: 'Current Location',
        icon: {
          url: 'http://maps.google.com/mapfiles/ms/icons/blue-dot.png',
        },
      });
    }

    // Draw route
    const directionsService = new google.maps.DirectionsService();
    const directionsRenderer = new google.maps.DirectionsRenderer({
      map: map,
      suppressMarkers: true, // We'll use our own markers
    });

    directionsService.route(
      {
        origin: { lat: pickupLocation.coordinates[1], lng: pickupLocation.coordinates[0] },
        destination: { lat: deliveryLocation.coordinates[1], lng: deliveryLocation.coordinates[0] },
        travelMode: google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status === 'OK') {
          directionsRenderer.setDirections(response);
          
          // Fit the map to show the entire route
          const bounds = new google.maps.LatLngBounds();
          bounds.extend({ lat: pickupLocation.coordinates[1], lng: pickupLocation.coordinates[0] });
          bounds.extend({ lat: deliveryLocation.coordinates[1], lng: deliveryLocation.coordinates[0] });
          
          if (currentLocation && currentLocation.coordinates) {
            bounds.extend({ lat: currentLocation.coordinates[1], lng: currentLocation.coordinates[0] });
          }
          
          map.fitBounds(bounds);
        } else {
          console.error('Directions request failed due to ' + status);
        }
      }
    );
  };

  return (
    <div className="mt-4">
      <div id={mapId} className="h-96 w-full rounded-lg shadow-md"></div>
      <div className="mt-2 flex justify-end">
        <div className="flex items-center mr-4">
          <div className="h-4 w-4 bg-green-500 rounded-full mr-1"></div>
          <span className="text-xs text-gray-600">Pickup</span>
        </div>
        <div className="flex items-center mr-4">
          <div className="h-4 w-4 bg-red-500 rounded-full mr-1"></div>
          <span className="text-xs text-gray-600">Delivery</span>
        </div>
        <div className="flex items-center">
          <div className="h-4 w-4 bg-blue-500 rounded-full mr-1"></div>
          <span className="text-xs text-gray-600">Current Location</span>
        </div>
      </div>
    </div>
  );
};

export default TrackingMap;