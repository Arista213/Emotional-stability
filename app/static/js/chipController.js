const board = document.getElementById('board')
const whiteChip = document.getElementById('white-chip')
const blackChip = document.getElementById('black-chip')

whiteChip.onmousedown = function (e){
    moveFromMainChip(whiteChip, e)
}

blackChip.onmousedown = function (e){
    moveFromMainChip(blackChip, e)
}

board.onclick = function (){
    console.log(getCoords(board))
}


function moveFromMainChip(mainChip, e){
    let coords = getCoords(mainChip);
    let shiftX = e.pageX - coords.left;
    let shiftY = e.pageY - coords.top;
    let newChip = mainChip.cloneNode();
    newChip.name = 'chip'
    newChip.style.position = 'absolute';
    newChip.style.zIndex = 1000;
    let height = 0.125 * getCoords(board).height
    newChip.style.height = height + 'px'
    newChip.onmousedown = function (e){ moveChip(newChip, e)}
    document.body.appendChild(newChip);
    moveAt(e);
    document.onmousemove = function (e) {moveAt(e);};
        newChip.onmouseup = async function () {
            let boardCoords = getCoords(board)
            coords = getCoords(newChip)
            if (coords.left < boardCoords.left || coords.left > boardCoords.left + boardCoords.width
                || coords.top < boardCoords.top || coords.top > boardCoords.top + boardCoords.height)
                newChip.parentNode.removeChild(newChip)
            else {
                let color = mainChip.id === 'white-chip' ? 'white' : 'black'
                let k = 1024.0 / boardCoords.height
                console.log(coords)
                console.log(boardCoords)
                let left = (coords.left - boardCoords.left) * k
                let top = (coords.top - boardCoords.top) * k
                let response = await fetch('/api/games/' + gameId + '/users/' + userId + '/board/chips', {
                    method: 'POST',
                    headers: {'Content-type': 'application/json'},
                    body: JSON.stringify({
                        'color': color,
                        'left': left,
                        'top': top
                    })
                })
                let newChipJSON = await response.json()
                newChip.id = newChipJSON['id']
            }
            document.onmousemove = null;
            newChip.onmouseup = null;
        };
    function moveAt(e) {
        newChip.style.left = e.pageX - shiftX + 'px';
        newChip.style.top = e.pageY - shiftY + 'px';
    }
    newChip.ondragstart = function () {
        return false;
    }
}

function moveChip(chip, e){
        let coords = getCoords(chip);
        let shiftX = e.pageX - coords.left;
        let shiftY = e.pageY - coords.top;
        moveAt(e);
        function moveAt(e) {
            chip.style.left = e.pageX - shiftX + 'px';
            chip.style.top = e.pageY - shiftY + 'px';
        }

        document.onmousemove = function (e) {
            moveAt(e);

        };
        chip.onmouseup = async function () {
            let boardCoords = getCoords(board)
            coords = getCoords(chip)
            if (coords.left < boardCoords.left || coords.left > boardCoords.left + boardCoords.width
                || coords.top < boardCoords.top || coords.top > boardCoords.top + boardCoords.height) {
                chip.parentNode.removeChild(chip)
                let response = await fetch('/api/games/' + gameId + '/users/' + userId + '/board/chips/' + chip.id, {
                    method: 'DELETE',
                    headers: {'Content-type': 'application/json'}
                })
            }
            else{
                let left = (coords.left - boardCoords.left) * 1440.0 / boardCoords.width
                let top = (coords.top - boardCoords.top) * 1024.0 / boardCoords.height
                let response = await fetch('/api/games/' + gameId + '/users/' + userId + '/board/chips/' + chip.id, {
                    method: 'PUT',
                    headers: {'Content-type': 'application/json'},
                    body: JSON.stringify({
                        'left': left,
                        'top': top
                    })
                })
            }

            document.onmousemove = null;
            chip.onmouseup = null;

        };
        chip.ondragstart = function () {
            return false;
        }
}

function getCoords(elem){
    let c = elem.getBoundingClientRect();
    return {left: c.left, top : c.top, height: c.height, width: c.width}
}