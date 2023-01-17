let users = {}
let masterId
const gameId = getCookie('game_id')
const userId = Number(getCookie('user_id'))
const usersContainer = document.getElementById('users-container')
const showBtn = document.getElementById('show')
let lastChips = {}
let checkLastChips = false

createYou().then(r => true)


setInterval(update, 1000);


async function update() {
    let result = {}
    try {
        let response = await fetch('/api/games/' + gameId);
        result = await response.json();
    } catch (err) {
        window.location.href = '/'
    }
    result['users'].forEach(function (user) {
        if (user["id"] !== userId && !(user["id"] in users)) {
            if (user['role'] === 'master')
                createUser(user['id'], user['name'], '(Ведущий)', user['can_view'])
            else
                createUser(user['id'], user['name'], '', user['can_view'])
            users[user["id"]] = user["name"];
        }

        if (masterId !== userId && user['id'] !== userId) {
            let userElem = document.getElementById('user-' + user['id'])
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
        if (demoUserId === user['id'] && (user['id'] === userId || userId === masterId) && user['board'] !== null) {
            showBtn.hidden = false
            if (user['can_view'])
                showBtn.className = 'show-btn show-btn-on';
            else
                showBtn.className = 'show-btn show-btn-off';
        }

        if (demoUserId === user['id']) {
            if (demoUserId === userId)
                document.getElementById('title-board').textContent = 'Ваше поле (' + user['name'] + ')'
            else
                document.getElementById('title-board').textContent = 'Поле игрока ' + user['name']
        }
    })
    if (checkLastChips && Number(getCookie('demo_user_id')) !== userId){
        fetch('/api/games/' + gameId + '/users/' + Number(getCookie('demo_user_id')) + '/board/chips')
            .then(response => response.json())
            .then(data => {
                data.forEach(chip => {
                    let boardCoords = getCoords(board)
                    if(chip['id'] in lastChips) {
                        console.log('1')
                        if (chip['left'] - lastChips[chip['id']]['left'] > 1 || chip['top'] - lastChips[chip['id']]['top'] > 1 ||
                            chip['left'] - lastChips[chip['id']]['left'] < -1 || chip['top'] - lastChips[chip['id']]['top'] < -1) {
                            lastChips[chip['id']] = chip
                            console.log('2')
                            let k = boardCoords.height / 1024.0
                            let left = chip['left'] * k + boardCoords.left
                            let top = chip['top'] * k + boardCoords.top
                            let newChip = document.getElementById(chip['id'])
                            newChip.style.left = left + 'px'
                            newChip.style.top = top + 'px'
                        }
                    }
                    else {
                        console.log('3')
                        let k = boardCoords.height / 1024.0
                        let left = chip['left'] * k + boardCoords.left
                        let top = chip['top'] * k + boardCoords.top
                        let newChip = chip['color'] === 'white' ? whiteChip.cloneNode() : blackChip.cloneNode();
                        newChip.name = 'chip'
                        newChip.style.position = 'absolute';
                        newChip.style.zIndex = 1000;
                        newChip.style.left = left + 'px'
                        newChip.style.top = top + 'px'
                        newChip.id = chip['id']
                        let height = 0.125 * boardCoords.height
                        newChip.style.height = height + 'px'
                        document.body.appendChild(newChip);
                        lastChips[chip['id']] = chip
                    }
                })
            })
    }
}

async function createYou() {
    const noteElement = document.getElementById('note')
    let responseNote = await fetch('/api/games/' + gameId + '/users/' + userId + '/note')
    let note = await responseNote.json()
    noteElement.value = note['note_text']

    let responseGame = await fetch('/api/games/' + gameId);
    let result = await responseGame.json();

    let demoUserId = Number(getCookie('demo_user_id'))
    let responseDemoUser = await fetch('/api/games/' + gameId + '/users/' + demoUserId);
    let user = await responseDemoUser.json();

    if (demoUserId === userId && user['board'] !== null)
        document.getElementById('chips').style.cssText = '';
    else if (demoUserId !== userId)
        document.getElementById('back-form').style.cssText = '';
    result['users'].forEach(function (user) {
        if (user['role'] === 'master')
            masterId = user['id']
        if (user['id'] === userId)
            createUser(user['id'], user['name'], '(Вы)', false)
    })
    if (masterId === userId) {
        let endGameBtn = document.createElement('btn')
        endGameBtn.className = 'btn-success'
        endGameBtn.textContent = 'Завершить игру'
        endGameBtn.onclick = function () {
            endGame()
        }
        document.getElementById('end-game-container').appendChild(endGameBtn)
    }
}

async function fillField() {
    let demoUserId = Number(getCookie('demo_user_id'))
    let response = await fetch('/api/games/' + gameId + '/users/' + demoUserId);
    let user = await response.json();
    const board = document.getElementById("board")
    if (user['board'] !== null) {
        board.src = '/static/images/board.svg'
        let boardCoords = getCoords(board)
        fetch('/api/games/' + gameId + '/users/' + demoUserId + '/board/chips')
            .then(response => response.json())
            .then(data => {
                data.forEach(chip => {
                    lastChips[chip['id']] = chip
                    let k = boardCoords.height / 1024.0
                    let left = chip['left'] * k + boardCoords.left
                    let top = chip['top'] * k + boardCoords.top
                    let newChip = chip['color'] === 'white' ? whiteChip.cloneNode() : blackChip.cloneNode();
                    newChip.name = 'chip'
                    newChip.style.position = 'absolute';
                    newChip.style.zIndex = 1000;
                    newChip.style.left = left + 'px'
                    newChip.style.top = top + 'px'
                    newChip.id = chip['id']
                    let height = 0.125 * boardCoords.height
                    newChip.style.height = height + 'px'
                    if (userId === demoUserId)
                        newChip.onmousedown = function (e) {
                            moveChip(newChip, e)
                        }
                    document.body.appendChild(newChip);
                })
            })
        checkLastChips=true
    } else {
        board.src = '/static/images/no-board.svg'
    }
}

async function createUser(id, name, role, canView) {
    const userElem = document.createElement("label")
    userElem.id = 'user-' + id
    userElem.className = 'gamer'
    usersContainer.appendChild(userElem)

    const userNameElem = document.createElement("output");
    userNameElem.className = 'gamer-name'
    userNameElem.appendChild(document.createTextNode(name));
    userElem.appendChild(userNameElem)

    if (role !== '') {
        const userRoleElem = document.createElement("output");
        userRoleElem.className = 'gamer-role'
        userRoleElem.appendChild(document.createTextNode(role));
        userElem.appendChild(userRoleElem)
    }

    if (role !== '(Вы)') {
        if (masterId === userId || canView) {
            const viewFieldBtn = document.createElement("input")
            viewFieldBtn.className = 'view-field'
            viewFieldBtn.type = 'image'
            viewFieldBtn.name = id
            viewFieldBtn.src = '/static/images/icons/open-board.svg'
            userElem.appendChild(viewFieldBtn)
        }
    }
    await fillField()
}

function endGame() {
    let response = fetch('/api/games/' + gameId, {
        method: 'DELETE'
    })

}

function getCookie(name) {
    let matches = document.cookie.match(new RegExp(
        "(?:^|; )" + name.replace(/([.$?*|{}()\[\]\\\/+^])/g, '\\$1') + "=([^;]*)"
    ));
    return matches ? decodeURIComponent(matches[1]) : undefined;
}