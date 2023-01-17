const note = document.getElementById('note')
note.oninput = function () {putText_note().then(r => true)}
async function putText_note() {
    let userId = getCookie('user_id')
    let text = note.value
    const response = await fetch('/api/games/' + gameId + '/users/' + userId + '/note', {
        method: 'PUT',
        headers: {'Content-type': 'application/json', 'Accept': 'text/plain'},
        body: JSON.stringify({
            'note_text': text
        })
    })
}