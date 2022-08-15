/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
  //   console.log(email, password);
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    // console.log(res);

    if (res.data.status === 'success') {
      // alert('Logged in successful');
      showAlert('success', 'Logged in successful');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    // alert(err.response.data.message);
    showAlert('error', 'incorrect email or password');
  }
};

export const logout = async () => {
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v1/users/logout',
    });

    if ((res.data.status = 'success')) {
      location.reload(true);
      location.assign('/');
      showAlert('success', 'Logged Out');
    }
  } catch (err) {
    console.log(err);
    showAlert('error', 'Logging out, Try again');
  }
};
