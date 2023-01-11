let users = {}
let masterId
const gameId = getCookie('game_id')
const userId = Number(getCookie('user_id'))
const usersContainer = document.getElementById('users-container')
const showBtn = document.getElementById('show')

createYou().then(r => true)
fillField().then(r => true)

setInterval(update, 1000);


async function update() {
  let response = await fetch('/api/games/' + gameId);
  let result = await response.json();
  result['users'].forEach(function(user) {
    if (user["id"] !== userId && !(user["id"] in users)){
      if(user['role'] === 'master')
        createUser(user['id'],user['name'], '(Ведущий)', user['can_view'])
      else
        createUser(user['id'],user['name'], '',user['can_view'])
      users[user["id"]] = user["name"];
    }

    if (masterId !== userId && user['id'] !== userId) {
      let userElem = document.getElementById('user-'+user['id'])
      if (user['can_view']) {
        if (userElem.children.item(userElem.childElementCount - 1).className !== 'view-field') {
          const viewFieldBtn = document.createElement("input")
          viewFieldBtn.className = 'view-field'
          viewFieldBtn.type = 'image'
          viewFieldBtn.name = user['id']
          viewFieldBtn.src = '/static/images/icons/open-board.svg'
          userElem.appendChild(viewFieldBtn)
        }
      } else {
        if (userElem.children.item(userElem.childElementCount - 1).className === 'view-field') {
          userElem.removeChild(userElem.children.item(userElem.childElementCount - 1))
        }
      }
    }

    let demoUserId = Number(getCookie('demo_user_id'))
    if (demoUserId === user['id'] && (user['id'] === userId || userId === masterId)){
      showBtn.hidden = false
      if (user['can_view'])
        showBtn.className = 'show-btn show-btn-on';
      else
        showBtn.className = 'show-btn show-btn-off';
    }

    if(demoUserId === user['id']){
      if (demoUserId === userId)
        document.getElementById('title-board').textContent = 'Ваше поле (' + user['name'] +')'
      else
        document.getElementById('title-board').textContent = 'Поле игрока ' + user['name']
    }
  })
}

async function createYou() {
  let response = await fetch('/api/games/' + gameId);
  let result = await response.json();
  let demoUserId = Number(getCookie('demo_user_id'))
  if(demoUserId === userId)
    document.getElementById('chips').style.cssText = '';
  else
    document.getElementById('back-form').style.cssText = '';
  result['users'].forEach(function (user) {
    if (user['role'] === 'master')
      masterId = user['id']
    if (user['id'] === userId)
      createUser(user['id'],user['name'], '(Вы)', false)
  })
}

async function fillField(){
  let response = await fetch('/api/games/' + gameId + '/users/' + Number(getCookie('demo_user_id')));
  let user = await response.json();
  let field = document.getElementById('field');
  if (user['board'] !== null) {
    const board = document.createElement("img")
          board.className = 'board'
          board.src = '/static/images/board.svg'
          board.alt = 'Игровое поле'
    field.appendChild(board)
  }
  else{
    const board = document.createElement("img")
          board.className = 'board'
          board.src = '/static/images/no-board.svg'
          board.alt = 'Игровое поле'
    field.appendChild(board)
  }
}

function createUser(id, name, role, canView) {
  const userElem = document.createElement("label")
  userElem.id = 'user-' + id
  userElem.className = 'gamer'
  usersContainer.appendChild(userElem)

  const userNameElem = document.createElement("output");
  userNameElem.className = 'gamer-name'
  userNameElem.appendChild(document.createTextNode(name));
  userElem.appendChild(userNameElem)

  if(role !== ''){
    const userRoleElem = document.createElement("output");
    userRoleElem.className = 'gamer-role'
    userRoleElem.appendChild(document.createTextNode(role));
    userElem.appendChild(userRoleElem)
  }

  if(role !== '(Вы)') {
      if(masterId === userId || canView) {
        const viewFieldBtn = document.createElement("input")
        viewFieldBtn.className = 'view-field'
        viewFieldBtn.type = 'image'
        viewFieldBtn.name = id
        viewFieldBtn.src = '/static/images/icons/open-board.svg'
        userElem.appendChild(viewFieldBtn)
    }
  }
}

function getCookie(name) {
  let matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([.$?*|{}()\[\]\\\/+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}