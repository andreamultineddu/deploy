$(document).ready(function(){
    $("#footer").removeClass("navbar")
    $("#footer").removeClass("navbar-default")
})

function mobileUtilities(div)
{
    removeUselessInnerText()
    renderMobilePageChange(div)
}

function removeUselessInnerText()
{
    $(".search.normal").contents().filter(function () {
        return this.nodeType === 3;
    }).remove();
}

function renderMobilePageChange(div)
{
    div.innerHTML += "<div id='foot'><div style='max-width: 25em; margin: 0 auto;'></div></div>"
    foot = $("#foot div")[0]

    if(QueryObject.page > 1)
    {
        link1 = "<div class='pull-left text-right' style='margin-bottom: -4.25em;'><a href='/redirect?qr=" + QueryObject.q
        if(QueryObject.page > 2)
            link1 += "%26page=" + (parseInt(QueryObject.page) - 1)
        link1 += "&pg=" + QueryObject.page + "&sct=_ft&rdr=&asc=-1' style='display: block; width: 8.5em;'>&laquo;&nbsp;&nbsp;&nbsp;</a></div>"
    }
    else
        link1 = ""
    link2 = "<div class='text-center' style='width: 8em; margin: 0 auto;'>Pagina " + QueryObject.page + "</div>"
    link3 = "<div class='pull-right text-left' style='margin-top: -1.5em'><a href='/redirect?qr=" + QueryObject.q + "%26page=" + (parseInt(QueryObject.page) + 1) + "&pg=" + QueryObject.page + "&sct=_ft&rdr=&asc=-1' style='display: block; width: 8.5em;'>&nbsp;&nbsp;&nbsp;&raquo;</a></div>"

    foot.innerHTML = link1 + link2 + link3
}