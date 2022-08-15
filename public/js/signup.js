/* eslint-disable */

import axios from 'axios';
import { showAlert } from './alert';

export const signup = async (name, email, password, passwordConfirm) => {
  //   console.log(email, password);
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.001:3000/api/v1/users/signup',
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });
    // console.log(res);

    if (res.data.status === 'success') {
      // alert('Logged in successful');
      showAlert('success', 'Welcome');
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    // alert(err.response.data.message);
    showAlert('error', 'incorrect email or password');
  }
};
