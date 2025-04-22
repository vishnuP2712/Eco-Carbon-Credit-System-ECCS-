document.addEventListener("DOMContentLoaded", function () {
  document.getElementById("tripDate").valueAsDate = new Date();

  const map = L.map("map").setView([51.505, -0.09], 13);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution:
      '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
  }).addTo(map);

  let fromMarker = null;
  let toMarker = null;
  let routeLine = null;

  const fromAddressInput = document.getElementById("from-address");
  const toAddressInput = document.getElementById("to-address");
  const calculateBtn = document.getElementById("calculate-route");
  const transportMode = document.getElementById("transport-mode");
  const routeDetails = document.getElementById("route-details");
  const distanceValue = document.getElementById("distance-value");
  const carbonValue = document.getElementById("carbon-value");
  const greenCredValue = document.getElementById("greencred-value");
  const tripDistanceInput = document.querySelector("[name=tripDistance]");

  if (!tripDistanceInput) {
    const hiddenInput = document.createElement("input");
    hiddenInput.type = "hidden";
    hiddenInput.name = "tripDistance";
    hiddenInput.id = "tripDistance";
    document.getElementById("newTripForm").appendChild(hiddenInput);
  }

  // Carbon footprint factors (g CO2 per mile)
  // Carbon footprint factors (g CO2 per mile)
  const carbonFactors = {
    driving: 120 * 1.60934,
    transit: 45 * 1.60934,
    bicycling: 0,
    walking: 0,
  };

  function calculateGreenCred(mode, distanceMiles) {
    switch (mode) {
      case "walking":
        return Math.round(distanceMiles * 80); // more points for walking per mile
      case "bicycling":
        return Math.round(distanceMiles * 60);
      case "transit":
        return Math.round(distanceMiles * 30);
      case "driving":
        return Math.round(distanceMiles * 10);
      default:
        return 0;
    }
  }

  async function geocodeAddress(address) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address
        )}&limit=1`
      );

      if (!response.ok) throw new Error("Failed to fetch location data");
      const data = await response.json();
      if (data.length === 0)
        throw new Error("No location found for this address");

      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        displayName: data[0].display_name,
      };
    } catch (error) {
      console.error("Geocoding error:", error);
      alert(`Error: ${error.message}`);
      return null;
    }
  }

  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // Earth radius in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
        Math.cos(deg2rad(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = R * c;
    return distanceKm * 0.621371; // Convert km to miles
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  calculateBtn.addEventListener("click", async function () {
    const fromAddress = fromAddressInput.value.trim();
    const toAddress = toAddressInput.value.trim();
    const mode = transportMode.value;

    if (!fromAddress || !toAddress) {
      alert("Please enter both starting location and destination");
      return;
    }

    calculateBtn.disabled = true;
    calculateBtn.innerHTML = '<i class="bi bi-spinner"></i> Calculating...';

    try {
      const fromLocation = await geocodeAddress(fromAddress);
      const toLocation = await geocodeAddress(toAddress);
      if (!fromLocation || !toLocation)
        throw new Error("Couldn't find one or both locations");

      if (fromMarker) map.removeLayer(fromMarker);
      if (toMarker) map.removeLayer(toMarker);
      if (routeLine) map.removeLayer(routeLine);

      fromMarker = L.marker([fromLocation.lat, fromLocation.lng])
        .addTo(map)
        .bindPopup(`<b>From:</b> ${fromLocation.displayName}`);
      toMarker = L.marker([toLocation.lat, toLocation.lng])
        .addTo(map)
        .bindPopup(`<b>To:</b> ${toLocation.displayName}`);

      routeLine = L.polyline(
        [
          [fromLocation.lat, fromLocation.lng],
          [toLocation.lat, toLocation.lng],
        ],
        { color: "#2e7d32", weight: 4 }
      ).addTo(map);

      map.fitBounds(
        L.latLngBounds(
          [fromLocation.lat, fromLocation.lng],
          [toLocation.lat, toLocation.lng]
        ),
        { padding: [50, 50] }
      );

      const distanceMiles = calculateDistance(
        fromLocation.lat,
        fromLocation.lng,
        toLocation.lat,
        toLocation.lng
      );

      const carbonEmission = distanceMiles * carbonFactors[mode];
      const greenCred = calculateGreenCred(mode, distanceMiles);

      distanceValue.value = `${distanceMiles.toFixed(2)} `;
      carbonValue.value = `${carbonEmission.toFixed(2)}`;
      greenCredValue.value = `${greenCred}`;

      document.getElementById("tripDistance").value = distanceMiles.toFixed(2);
      routeDetails.classList.remove("d-none");
    } catch (error) {
      console.error("Route calculation error:", error);
      alert(`Error: ${error.message}`);
    } finally {
      calculateBtn.disabled = false;
      calculateBtn.innerHTML = '<i class="bi bi-map"></i> Calculate Route';
    }
  });

  const newTripForm = document.getElementById("newTripForm");
  newTripForm.addEventListener("submit", function (e) {
    e.preventDefault();

    if (!fromMarker || !toMarker) {
      alert("Please calculate a route first");
      return;
    }

    if (!document.getElementById("tripDistance").value) {
      alert("Please calculate a route to determine distance");
      return;
    }

    const formData = new FormData(newTripForm);
    const transportModeValue = formData.get("travelMode");
    let travelMode;

    switch (transportModeValue) {
      case "driving":
        travelMode = "private_vehicle";
        break;
      case "transit":
        travelMode = "public_transit";
        break;
      case "bicycling":
        travelMode = "bicycle";
        break;
      case "walking":
        travelMode = "walking";
        break;
      default:
        travelMode = "other";
    }

    formData.set("travelMode", travelMode);

    fetch("http://127.0.0.1:5000/record-trip", {
      method: "POST",
      body: formData,
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.success) {
          alert("Trip recorded successfully!");
        } else {
          alert("Failed to record trip");
        }
      });

    newTripForm.reset();
    document.getElementById("tripDate").valueAsDate = new Date();

    if (fromMarker) map.removeLayer(fromMarker);
    if (toMarker) map.removeLayer(toMarker);
    if (routeLine) map.removeLayer(routeLine);

    routeDetails.classList.add("d-none");
  });
});
