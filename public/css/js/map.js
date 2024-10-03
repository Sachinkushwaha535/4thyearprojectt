mapboxgl.accessToken = mapToken;

try {
    // Ensure that listing and its geometry are defined and valid
    const coordinates = (listing && 
                         listing.geometry && 
                         Array.isArray(listing.geometry.coordinates) && 
                         listing.geometry.coordinates.length === 2) 
        ? listing.geometry.coordinates 
        : [78.051195, 27.595193];  // Fallback coordinates if invalid

    console.log('Coordinates:', coordinates); // Debugging log to check coordinates

    const map = new mapboxgl.Map({
        container: 'map', // ID of the HTML element where the map will be rendered
        center: coordinates, // Center the map on the listing's coordinates
        zoom: 9 // Starting zoom level
    });

    const marker = new mapboxgl.Marker({ color: "red" })
        .setLngLat(coordinates)
        .setPopup(
            new mapboxgl.Popup({ offset: 25 }).setHTML(
                `<h4>${listing.location}</h4><p>Exact Location provided after booking</p>`
            )
        )
        .addTo(map);

    map.addControl(new mapboxgl.NavigationControl());

} catch (error) {
    console.error('Error initializing Mapbox:', error);
    alert('Map failed to load. Please try again later.');
}
