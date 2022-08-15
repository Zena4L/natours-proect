/*eslint-disable*/
import '@babel/polyfill';
import { login, logout } from './login';
import { signup } from './signup';
import { updateSettings } from './updateSettings';
import { bookTour } from './stripe';

const formBtn = document.querySelector('.form--login');
const signUpBtn = document.querySelector('.form--signup');
const logoutBtn = document.querySelector('.nav__el--logout');
const updateBtn = document.querySelector('.form-user-data');
const updatePsw = document.querySelector('.form-user-password');
const bookBtn = document.getElementById('book-tour');

if (formBtn)
  formBtn.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    login(email, password);
  });

if (signUpBtn)
  signUpBtn.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;

    // console.log(name, email, password, passwordConfirm);
    signup(name, email, password, passwordConfirm);
  });

if (logoutBtn) logoutBtn.addEventListener('click', logout);

if (updateBtn)
  updateBtn.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);

    updateSettings(form, 'data');
  });

if (updatePsw)
  updatePsw.addEventListener('submit', (e) => {
    e.preventDefault();
    const passwordCurrent = document.getElementById('password-current').value;
    const password = document.getElementById('password').value;
    const passwordConfirm = document.getElementById('password-confirm').value;
    updateSettings({ passwordCurrent, password, passwordConfirm }, 'password');
    // console.log(document.getElementById('password-current').value);
    // console.log('click');
    document.getElementById('password-current').value = '';
    document.getElementById('password').value = '';
    document.getElementById('password-confirm').value = '';
  });

// if (bookBtn)
//   bookBtn.addEventListener('click', (e) => {
//     e.target.textContent = 'processing...';
//     const { tourId } = e.target.dataset;
//     bookTour(tourId);
//   });
