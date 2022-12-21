const resizer = document.querySelector('.resizer');
const parent_container = resizer.closest('main');
const left_panel = parent_container.querySelector('.left-panel');
let isHandlerDragging = false;

document.addEventListener('mousedown', function(e) {
  if (e.target === resizer) {
    isHandlerDragging = true;
  }
});

document.addEventListener('mousemove', function(e) {
  if (!isHandlerDragging) {
    return false;
  }
  let containerOffsetLeft = parent_container.offsetLeft;
  let pointerRelativeXpos = e.clientX - containerOffsetLeft - 4;
  let leftPanelMinWidth = 250;
  let leftPanelMaxWidth = 450;
  left_panel.style.width = pointerRelativeXpos < leftPanelMinWidth ? leftPanelMinWidth + 'px'
          : pointerRelativeXpos > leftPanelMaxWidth ? leftPanelMaxWidth + 'px'
          : pointerRelativeXpos + 'px';
  left_panel.style.flexGrow = 0;
});

document.addEventListener('mouseup', function(e) {
  isHandlerDragging = false;
});