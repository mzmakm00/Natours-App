
import { login } from './login.js'; 
import { displayMap } from './mapbox.js';
import {logout} from './login.js';
import {updateSettings} from './updateSettings.js'

// console.log("index page running")

// DOM ELEMENTS 
const mapBox = document.getElementById('map')
const loginForm = document.querySelector('.form--login')
const logoutBtn = document.querySelector('.nav__el--logout')
const userDataForm = document.querySelector('.form-user-data')
const userPasswordForm  = document.querySelector('.form-user-password')

// DELEGATION
if(mapBox){
    const locations = JSON.parse(document.getElementById('map').dataset.locations);
    displayMap(locations)
}

if (loginForm) {
    loginForm.addEventListener('submit', e => {
        e.preventDefault();
        console.log('Login form submitted'); // Add this line
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        login(email, password);
    });
}


if (logoutBtn){
    logoutBtn.addEventListener('click',logout)
}

if (userDataForm) {
  userDataForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('name').value;
      const email = document.getElementById('email').value;
      const photo = document.getElementById('photo').files[0];

      // Create FormData object and append form values
      const formData = new FormData();
      formData.append('name', name);
      formData.append('email', email);
      formData.append('photo', photo);

      // Call the updateSettings function with the FormData
      await updateSettings(formData, 'data');
      // Additional actions after updateSettings (if needed)
  });
}


  if (userPasswordForm) {
    userPasswordForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      document.querySelector('.btn--save-password').textContent = 'Updating...'
      const passwordCurrent = document.getElementById('password-current').value;
      const password = document.getElementById('password').value;
      const passwordConfirm = document.getElementById('password-confirm').value;
      await updateSettings({passwordCurrent , password, passwordConfirm}, 'password');

      document.querySelector('.btn--save-password').textContent = 'Updated'
      document.getElementById('password-current').value = '';
      document.getElementById('password').value = '';
      document.getElementById('password-confirm').value = '';
    });
  }