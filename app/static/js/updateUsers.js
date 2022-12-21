let users = {}
const gameId = getCookie('game_id')
const userId = Number(getCookie('user_id'))
const usersContainer = document.querySelector("form.left-panel-item");


setInterval(update, 1000);

async function update() {
  let response = await fetch('/api/games/' + gameId);
  let result = await response.json();
  result['users'].forEach(function(user) {
    if (user["id"] !== userId && !(user["id"] in users)){
      users[user["id"]] = user["name"];
      const userElem = document.createElement("label")
      userElem.className = 'gamer'
      usersContainer.appendChild(userElem)

      const userNameElem = document.createElement("output");
      userNameElem.className = 'gamer-name'
      userNameElem.appendChild(document.createTextNode(user["name"]));
      userElem.appendChild(userNameElem)

      if(user["role"] === 'master'){
        const userRoleElem = document.createElement("output");
        userRoleElem.className = 'gamer-role'
        userRoleElem.appendChild(document.createTextNode('(Ведущий)'));
        userElem.appendChild(userRoleElem)
      }

      const viewFieldBtn = document.createElement("input")
      viewFieldBtn.className = 'view-field'
      viewFieldBtn.type = 'image'
      viewFieldBtn.src = '/static/images/open-board.svg'
      userElem.appendChild(viewFieldBtn)
    }
  })
}

function getCookie(name) {
  let matches = document.cookie.match(new RegExp(
    "(?:^|; )" + name.replace(/([.$?*|{}()\[\]\\\/+^])/g, '\\$1') + "=([^;]*)"
  ));
  return matches ? decodeURIComponent(matches[1]) : undefined;
}