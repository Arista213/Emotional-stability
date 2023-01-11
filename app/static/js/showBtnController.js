btn = document.getElementById('show')

btn.onclick = async function(){
    const demoUserId = Number(getCookie('demo_user_id'));
    let canView = btn.className !== 'show-btn show-btn-on'
    const response = await fetch('/api/games/' + gameId +  '/users/' + demoUserId, {
        method: 'PUT',
        headers: { 'Content-type': 'application/json', 'Accept': 'text/plain'},
        body: JSON.stringify({
            'can_view': canView
        })
    })
}
