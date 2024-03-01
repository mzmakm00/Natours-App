import { showAlert } from "./alerts.js";

// Either type can be data or password
export const updateSettings = async (data,type) => {
    try {
      const url = type === 'password' ? 
      'http://localhost:3000/api/v1/users/updateMypassword' : 'http://localhost:3000/api/v1/users/updateMe'
      const response = await fetch(url, {
        method: 'PATCH',
        // headers: {
        //   'Content-Type': 'application/json'
        // },
        body : data,
        credentials: 'include',
      });
      console.log('response :',response)
      const result = await response.json();
      if (response.ok) 
      {
       showAlert('success', `${type.toUpperCase()} has been updated successfully!`);
       console.log('Updated User:', result.data.user);
      } else {
       showAlert('error', result.message || 'Update failed.'); // Display the server-side error message if available
      }
    } catch (err) {
         console.error('An error occurred during the update:', err);
         showAlert('error', `An error occurred during the update: ${err.message}`);
}
}