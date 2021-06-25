import axios from 'axios';

export function displaySuccessToast(message) {
    iziToast.success({
        title: 'Success',
        message: message
    });
}

export function displayErrorToast(message) {
    iziToast.error({
        title: 'Error',
        message: message
    });
}

export function displayInfoToast(message) {
    iziToast.info({
        title: 'Info',
        message: message
    });
}

const API_BASE_URL = 'https://todo-app-csoc.herokuapp.com/';

document.addEventListener("DOMContentLoaded",function() {
  const logoutButton = document.getElementById("logout")
  if (logoutButton)
    logoutButton.onclick = logout

  const registerButton = document.getElementById("register")
  if (registerButton)
    registerButton.onclick = register

  const loginButton = document.getElementById("login")
  if (loginButton)
    loginButton.onclick = login

  const addTaskButton = document.getElementById("addTaskButton")
  if (addTaskButton)
    addTaskButton.onclick = addTask
})

function logout() {
    localStorage.removeItem('token');
    window.location.href = '/login/';
}

function registerFieldsAreValid(firstName, lastName, email, username, password) {
    if (firstName === '' || lastName === '' || email === '' || username === '' || password === '') {
        displayErrorToast("Please fill all the fields correctly.");
        return false;
    }
    if (!(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))) {
        displayErrorToast("Please enter a valid email address.")
        return false;
    }
    return true;
}

function register() {
    const firstName = document.getElementById('inputFirstName').value.trim();
    const lastName = document.getElementById('inputLastName').value.trim();
    const email = document.getElementById('inputEmail').value.trim();
    const username = document.getElementById('inputUsername').value.trim();
    const password = document.getElementById('inputPassword').value;

    if (registerFieldsAreValid(firstName, lastName, email, username, password)) {
        displayInfoToast("Please wait...");

        const dataForApiRequest = {
            name: firstName + " " + lastName,
            email: email,
            username: username,
            password: password
        }

        axios({
            url: API_BASE_URL + 'auth/register/',
            method: 'post',
            data: dataForApiRequest,
        }).then(function({data, status}) {
          localStorage.setItem('token', data.token);
          window.location.href = '/';
        }).catch(function(err) {
          displayErrorToast('An account using same email or username is already created');
        })
    }
}

function login() {
  const user = document.getElementById("inputUsername").value;
  const pass = document.getElementById("inputPassword").value;

  if (user == "" || pass == "") {
    displayErrorToast("Please fill all the fields");
    return;
  }
  displayInfoToast("Please wait...")
  axios({
    url: API_BASE_URL + "auth/login/",
    method: "POST",
    data: {
      username: user,
      password: pass,
    }
  }).then(function(response) {
    localStorage.setItem('token', response.data.token);
    window.location.href = '/';
  }).catch(function(error) {
    document.getElementById("inputPassword").value = "";
    displayErrorToast(`${data.status}: ${data.statusText}`);
  });
}

/**
 * Add's in new task
 */
function addTask() {
  /**
   * @type HTMLInputElement
  **/
  const addTaskElement = document.getElementById("addTask");
  const title = addTaskElement.value.trim()
  if(title === "")
    return;

  axios({
    headers: {
      Authorization: "Token " + localStorage.getItem("token"),
    },
    url: API_BASE_URL + "todo/create/",
    method: "POST",
    data: {
      title:title
    }
  }).then(({data, status}) => {
    addTaskElement.value = "";
    fetchTask()
    displaySuccessToast("Todo Added")
  })
}

/**
 * A single Todo Element
 * @typedef {object} Todo
 * @property {number} id
 * @property {string} title
 */

/**
 * @this Todo
 */
function editTask() {
    document.getElementById('task-' + this.id).classList.toggle('hideme');
    document.getElementById('task-actions-' + this.id).classList.toggle('hideme');
    document.getElementById('input-button-' + this.id).classList.toggle('hideme');
    document.getElementById('done-button-' + this.id).classList.toggle('hideme');
}

/**
 * @this Todo
 */
function deleteTask() {
    axios({
      headers: {
        Authorization: "Token " + localStorage.getItem("token"),
      },
      url: API_BASE_URL + `todo/${this.id}/`,
      method: "DELETE"
    }).then(({status}) => {
      document.getElementById("task-" + this.id).parentElement.remove();
      displaySuccessToast("Todo Deleted")
    }).catch(function (data) {
      console.log(data)
      displayErrorToast(`${data.status}: ${data.statusText}`);
    })
}

/**
 * @this Todo
 */
function updateTask() {
  /**@type HTMLInputElement */
  const updateText = document.getElementById(`input-button-${this.id}`);
  /**@type HTMLDivElement*/
  const taskBody = document.getElementById("task-" + this.id);
  /** @type HTMLButtonElement*/
  const taskButton = document.getElementById("task-actions-" + this.id);
  /** @type HTMLButtonElement*/
  const updateButton = document.getElementById("done-button-" + this.id);

  if(updateText.value.trim() === ""){
    editTask.apply(this)
    return;
  }

  axios({
    headers: {
      Authorization: "Token " + localStorage.getItem("token"),
    },
    url: API_BASE_URL + `todo/${this.id}/`,
    method: "PUT",
    data: {
      title: updateText.value.trim()
    }
  }).then(({data, status}) => {
    editTask.apply(this);

    taskBody.id = `task-${data.id}`;
    taskBody.textContent = data.title;

    updateButton.id = "done-button-" + data.id;

    updateText.value = "";
    updateText.id = `input-button-${data.id}`;
    taskButton.id = "task-actions-" + data.id;
    displaySuccessToast("Todo Updated")
  })
}

function fetchTask() {
  axios({
      headers: {
          Authorization: "Token " + localStorage.getItem("token"),
      },
      url: API_BASE_URL + "todo/",
      method: "GET",
      dataType: "json",
  }).then(({data}) => createCard(data[data.length-1]));
}

/**
 * Adds in a new todo element
 * @param {Todo} data - Todo element to add in dom
 */
export function createCard(data) {
  const containerUL = document.getElementsByClassName('todo-available-tasks')[0]
  let topContainer = document.createElement('li')
  topContainer.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-center')
  topContainer.innerHTML = `<input id="input-button-${data.id}" type="text" class="form-control todo-edit-task-input hideme"
          placeholder="Edit The Task" />
        <div id="done-button-${data.id}" class="input-group-append hideme">
          <button class="btn btn-outline-secondary todo-update-task" type="button" id="update-task-${data.id}">
            Done
          </button>
        </div>
        <div id="task-${data.id}" class="todo-task">
          ${data.title}
        </div>
        <span id="task-actions-${data.id}">
          <button style="margin-right: 5px;" type="button" id="edit-task-${data.id}" class="btn btn-outline-warning">
            <img src="https://res.cloudinary.com/nishantwrp/image/upload/v1587486663/CSOC/edit.png" width="18px"
              height="20px" />
          </button>
          <button type="button" class="btn btn-outline-danger" id="delete-task-${data.id}">
            <img src="https://res.cloudinary.com/nishantwrp/image/upload/v1587486661/CSOC/delete.svg" width="18px"
              height="22px" />
          </button>
        </span>`
  containerUL.appendChild(topContainer)

  const updateButton = document.getElementById(`update-task-${data.id}`)
  updateButton.onclick = updateTask.bind(data)

  const editButton = document.getElementById(`edit-task-${data.id}`)
  editButton.onclick = editTask.bind(data)

  const deleteButton = document.getElementById(`delete-task-${data.id}`)
  deleteButton.onclick = deleteTask.bind(data)
}
