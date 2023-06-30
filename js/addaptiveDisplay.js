const chatBody = document.getElementById("chat");
window.addEventListener('resize', function() {
    changeSize();
});
function changeSize()
{
    windowWidth = window.innerWidth;
    if(windowWidth < 600)
    {
        chatBody.style.paddingRight = "0%";
        chatBody.style.paddingLeft = "0%";
    }
    else
    {
        chatBody.style.paddingRight = "15%";
        chatBody.style.paddingLeft = "15%";
    }
}

changeSize();