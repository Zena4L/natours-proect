import axios from 'axios';
import { showAlert } from './alert';

export const updateSettings = async (data, type) => {
  //   console.log(email, password);
  try {
    const url =
      type === 'password'
        ? 'http://127.0.0.1:3000/api/v1/users/updateMyPassword'
        : 'http://127.0.0.1:3000/api/v1/users/updateMe';
    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });
    // console.log(res);

    if (res.data.status === 'success') {
      // alert('Logged in successful');
      showAlert('success', `${type.toUpperCase()} successfully updated`);
      window.setTimeout(() => {
        location.assign('/');
      }, 1500);
    }
  } catch (err) {
    // console.log(err.response.data.message);
    showAlert('error', 'Try again');
  }
};
