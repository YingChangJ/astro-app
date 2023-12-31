/* eslint-disable react/prop-types */
// import { useState } from "react";
import Button from "react-bootstrap/Button";
// Define the functional component
function LocationComponent({ updateGeo }) {
  // const [userLocation, setUserLocation] = useState(null);

  // Define the function that finds the user's geolocation
  const getUserLocation = () => {
    // If geolocation is supported by the user's browser
    if (navigator.geolocation) {
      // Get the current user's location
      navigator.geolocation.getCurrentPosition(
        (position) => {
          // Save the geolocation coordinates in two variables
          const { latitude, longitude } = position.coords;
          // Update the value of the userLocation variable
          updateGeo({ latitude, longitude });
          console.log({ latitude, longitude });
        },
        // If there was an error getting the user's location
        (error) => {
          console.error("Error getting user location:", error);
        }
      );
    }
    // If geolocation is not supported by the user's browser
    else {
      console.error("Geolocation is not supported by this browser.");
    }
  };

  // Return an HTML page for the user to check their location
  return (
    <>
      {/* Create a button that is mapped to the function which retrieves the user's location */}
      <Button
        size="sm"
        className="mb-2"
        onClick={(e) => {
          e.stopPropagation(); // Stop the event from propagating
          getUserLocation();
        }}
        // className="mb-2"
        // style={{ width: "155px" }}
      >
        Get Loc.
      </Button>
    </>
  );
}

// Export the functional component
export default LocationComponent;
