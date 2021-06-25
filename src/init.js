import axios from 'axios';
import { createCard, displayErrorToast, displayInfoToast } from './main';
const API_BASE_URL = 'https://todo-app-csoc.herokuapp.com/';

function getTasks() {
    displayInfoToast("Fetching the todos ...")
    axios({
      headers: {
        Authorization: "Token " + localStorage.getItem("token"),
      },
      url: API_BASE_URL + "todo/",
      method: "GET"
    }).then((response) => {
      /**@type {Todo[]} array of todos returned by API*/
      const todos = response.data;
      todos.forEach(element => {
        createCard(element)
      });
    }).catch((err) => {
      displayErrorToast(`${data.status}: ${data.statusText}`);
    })
}

document.addEventListener("DOMContentLoaded",() => {
  axios({
    headers: {
        Authorization: 'Token ' + localStorage.getItem('token'),
    },
    url: API_BASE_URL + 'auth/profile/',
    method: 'GET',
}).then(function({data, status}) {
  document.getElementById('avatar-image').src = 'https://ui-avatars.com/api/?name=' + data.name + '&background=fff&size=33&color=007bff';
  document.getElementById('profile-name').innerHTML = data.name;
  getTasks();
})
})
