document.getElementById("copy-token").onclick = function () {
    const token = document.getElementById("token").textContent;
    navigator.clipboard.writeText(token).then(r => console.log('token copied to clipboard'));
}