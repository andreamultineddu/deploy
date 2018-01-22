var QueryObject = function () {
    var search = location.search.substring(1)
    var obj = JSON.parse('{"' + decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g,'":"') + '"}')
    return obj
}()

var PageTitle = " " + document.title


$(document).ready(function(){
    $("#q").attr("value", myDecodeURI(QueryObject.q))

    query($("#searchbar")[0], false)
})

function query(form, push)
{
    $("#bottom-row").show()
    
    if(QueryObject.tbm === "nws")
    {
        $("#searchbar").attr("action", "/search?tbm=nws")
    }
    else if(QueryObject.tbm === "vid")
    {
        $("#searchbar").attr("action", "/search?tbm=vid")
    }

    $("#1 a").attr("href", $("#1 a").attr("href") + "/search?q=" + QueryObject.q)
    if(QueryObject.tbm === "" || QueryObject.tbm === undefined) { $("#1").addClass("active") }
    else { $("#1").addClass("normal") }

    $("#2 a").attr("href", "https://www.google.it/search?q=" + QueryObject.q + "&tbm=isch")
    $("#2").addClass("normal")

    $("#3 a").attr("href", $("#3 a").attr("href") + "/search?q=" + QueryObject.q + "&tbm=vid")
    if(QueryObject.tbm === "vid") { $("#3").addClass("active") }
    else { $("#3").addClass("normal") }

    $("#4 a").attr("href", $("#4 a").attr("href") + "/search?q=" + QueryObject.q + "&tbm=nws")
    if(QueryObject.tbm === "nws") { $("#4").addClass("active") }
    else { $("#4").addClass("normal") }

    $("#5 a").attr("href", "https://www.google.it/maps/search/" + QueryObject.q)
    $("#5").addClass("normal")

    post_for_results(form, push)
}

function post_for_results(form, push)
{
    var query = form.q.value
    var start = QueryObject.page
    start = parseInt(start)

    if (typeof start !== "number" || isNaN(start) || start < 1)
    {
        QueryObject.page = 1
        start = QueryObject.page
    }

    query = query.trim()
    if(query !== "")
    {
        document.title = query + PageTitle
        $("#footer").hide()
        var now = Date.now()
        //a query io devo applicare encode uri
        query = encodeURI(query)
        query = myEncodeURI(query)

        if(QueryObject.tbm === "nws")
        {
            $.post("/results/news",
                {
                    q: query,
                    page: start - 1
                }).done(function(data, success) {printNewsSearchResult(data, now)})
                .fail(function() {})
        }
        else if(QueryObject.tbm === "vid")
        {
            $.post("/results/videos",
                {
                    q: query,
                    page: start - 1
                }).done(function(data, success) {printVideoSearchResult(data, now)})
                .fail(function() {})
        }
        else
        {
            $.post("/results/all",
                {
                    q: query,
                    page: start - 1
                }).done(function(data, success) {printSearchResult(data, now)})
                .fail(function() {})
        }
    }

}


//
// RECUPERO DELLE QUERY E URL
//
function myEncodeURI(query)
{
    query = query.split("#").join("%23")
    query = query.split("+").join("%2B")
    query = query.split("=").join("%3D")
    query = query.split("&").join("%26")
    query = query.split("#").join("%23")
    query = query.split("%20").join("+")

    return query
}

function myDecodeURI(query)
{
    query = query.split("+").join(" ")
    query = query.split("%23").join("#")
    query = query.split("%2B").join("+")
    query = query.split("%3D").join("=")
    query = query.split("%26").join("&")
    query = query.split("%23").join("#")

    return query
}

function mySpecialDecodeURI(query)
{
    query = query.split("%3D").join("=")
    query = query.split("%23").join("#")
    query = query.split("%26").join("&")
    query = query.split("%3F").join("?")

    return query
}


//
// PAGINA RICERCA PRINCIPALE
//
function printSearchResult(data, now1)
{
    var div = $("#searches")[0]
    var obj = JSON.parse(data)

    div.innerHTML = ""
    now2 = Date.now()
    searchstat = ""

    if (obj.resultStats === "") searchstat = ""
    else if(parseInt(QueryObject.page) > 1) searchstat = "Pagina " + QueryObject.page + " di circa " + obj.resultStats.split(" ")[4] + " risultati" + "&nbsp;(" + ((now2 - now1) / 1000).toFixed(2) + " secondi)"
    else searchstat = "Circa " + obj.resultStats.split(" ")[1] + " risultati" + "&nbsp;(" + ((now2 - now1) / 1000).toFixed(2) + " secondi)"

    div.innerHTML = "<div id='searchStat' style='line-height: 43px; color: #808080; padding-left: 16px; width: 600px;'>" + searchstat + "</div>"

    div.innerHTML += "<div id='leftcol' style='margin-top: 10px; display: inline-block; vertical-align: top;'></div>"
    if (obj.resultLeftSearches !== null)
    {
        for(var i = 0; i < obj.resultLeftSearches.length; i++)
        {
            RenderSearch($("#leftcol")[0], obj.resultLeftSearches[i], i)
        }

        renderRelatedReseaches($("#leftcol")[0], obj.relatedResearches)
        if(typeof(mobileUtilities) !== "function")
            renderPageChange($("#leftcol")[0], obj.changePage)
        else
            mobileUtilities(div)

        div.innerHTML += "<div id='rightcol' style='margin-top: 10px; margin-left: 70px; display: inline-block; vertical-align: top; width: 454px; box-shadow: 0 2px 2px 0 rgba(0,0,0,0.16), 0 0 0 1px rgba(0,0,0,0.08); border-radius: 2px;'></div>"
        renderInformationColumn($("#rightcol")[0], obj.additionalInformation)
    }
    else
    {
        div.innerHTML += "<div id='no_answers' style='font-size:16px;padding-left:10px'>"
            + "<p>La ricerca di - <b>" + myDecodeURI(QueryObject.q) + "</b> - non ha prodotto risultati in nessun documento. </p>"
            + "<p style='margin-top:1em'>Suggerimenti:"
            + "<ul class='_Gnc'>"
            + "    <li>Assicurarsi che tutte le parole siano state digitate correttamente.</li>"
            + "<li>Provare con parole chiave diverse.</li>"
            + "<li>Provare con parole chiave più generiche.</li>"
            + "<li>Provare con un numero minore di parole chiave.</li>"
            + "</ul>"
            + "</p>"
            + "</div>"

            if(QueryObject.page > 1)
                if(typeof(mobileUtilities) !== "function")
                    renderPageChange(div, obj.changePage)
                else
                    mobileUtilities(div)
    }


    if(window.innerHeight - 85 > $("#upper-menu").height() + $("#searches").height())
        $("#footer").addClass("navbar-fixed-bottom")
    else
        $("#footer").removeClass("navbar-fixed-bottom")

    $("#footer").show()
    cleanAllGoogleURL()
    mapsImagesLink()
    correctYoutubeLink()
    setLinkOnClick()
}

function RenderTable1(table)
{
    var ctn = ""
    for(var i = 0; i < table.length; i++)
    {
        ctn += "<div class='cel' style='"
        if(i % 2 === 0)
            ctn += "width: 55%;"
        ctn += "'>"
            + "<div style='width: 250px;'>" + table[i] + "</div>"
            + "</div>"

    }

    ctn = "<div class='link_table'>"
        + ctn
        + "</div>"

    return ctn
}

function RenderSearch(div, node, i)
{
    if(node.Rendering === 0)
    {
        var ctn = ""

        if(node.Table !== null)
        {
            ctn = RenderTable1(node.Table)
        }

        title = mySpecialDecodeURI(node.Title)
        if(title.indexOf(".wikipedia.org/") !== -1)
            title = title.split("%25").join("%")

        div.innerHTML += "<div id='" + i + "' class='search normal'>"
            + title
            + "<p class='coloured_link'>" + node.URL + "</p>"
            + "<p class='description_link'>" + node.Text + "</p>"
            + ctn
            + "</div>"
    }
    else if(node.Rendering === 1)
    {
        s = "<div class='news'>" + node.Table.join("</div><div class='news'>") + "</div>"
        div.innerHTML += "<div id='" + i + "' class='search news-list'>"
            + node.Title
            + s
            + "</div>"

    }
    else if(node.Rendering === 2)
    {
        div.innerHTML += "<div id='" + i + "' class='search images'>"
            + "<h3 style='color: #000; height: auto; padding-bottom: 10px; font-size: 18px; line-height: 18px; font-weight: normal; margin: 0;'>Immagini relative a " + myDecodeURI(decodeURI(QueryObject.q)) + "</h3>"
            + "<style> .images a { margin-right: 10px;} </style>"
            + mySpecialDecodeURI(node.Table.join(""))
            + "</div>"
    }
    else if(node.Rendering === 3)
    {
        div.innerHTML += "<div id='" + i + "' class='search video table'>"
            + "<h3>" + mySpecialDecodeURI(node.Title) + "</h3>"
            + node.Text
            + "</div>"
    }
    else if(node.Rendering === 4)
    {
        div.innerHTML += "<div id='" + i + "' class='search book'>"
            + "<h3>" + mySpecialDecodeURI(node.Title) + "</h3>"
            + node.Text
            + "</div>"
    }
    else if(node.Rendering === 5)
    {
        div.innerHTML += "<div id='" + i + "' class='search mega-video'>"
            + node.Text
            + "</div>"
    }
    else if(node.Rendering === 6)
    {
        div.innerHTML += "<div id='" + i + "' class='search graph'>"
            + node.Text.replace("/finance/chart", "https://www.google.it/finance/chart")
            + "</div>"
    }
    else
    {
        //altri tipi di rendering
    }
}

function renderRelatedReseaches(div, list)
{
    if(list != null)
    {
        var s = ""
        for(i = 0; i < list.length; i++)
        {
            s += "<div style='padding: 3px 0; width:"
            if(i % 2 === 0)
                s += "45%;"
            else
                s += "54%;"
            s += "'>" + list[i] + "</div>"
        }

        div.innerHTML += "<div id='related-searches'>"
            + "<h3> Ricerche correlate a " + myDecodeURI(decodeURI(QueryObject.q)) + "</h3>"
            + s
            + "</div>"
    }


    //creo il questionario sulla qualita' delle risposte
    div.innerHTML += "<div id='feed'>"
        + "<div class='h'>"
        + "<h3>Valutazione dei risultati</h3>"
        + "</div>"
        + "<div class='b'>"
        + "<p>La qualit&agrave; delle risposte ha soddisfatto le tue aspettattive: </p>"
        + "<form>"
        + "     <div class='stars'>"
        + "         <input type='radio' name='star' class='star-1' id='star-1'>"
        + "         <label class=;star-1' for='star-1'>1</label>"
        + "         <input type='radio' name='star' class='star-2' id='star-2'>"
        + "         <label class=;star-2' for='star-2'>2</label>"
        + "         <input type='radio' name='star' class='star-3' id='star-3' checked>"
        + "         <label class=;star-3' for='star-3'>3</label>"
        + "         <input type='radio' name='star' class='star-4' id='star-4'>"
        + "         <label class=;star-4' for='star-4'>4</label>"
        + "         <input type='radio' name='star' class='star-5' id='star-5'>"
        + "         <label class=;star-5' for='star-5'>5</label>"
        + "         <span></span>"
        + "     </div>"
        + "</form>"
        + "<button class='pull-right' onclick='sendFeedback()'>INVIA FEEDBACK</button>"
        + "</div>";
        + "</div>";
}

function renderPageChange(div, data)
{
    if(data !== "")
    {
        div.innerHTML += "<div id='foot'></div>"
        foot = $("#foot")[0]
        foot.innerHTML = data
        links_b = $("#foot td.b a")
        if(links_b.length === 2)
        {
            links_b[0].href = "/search?q=" + (links_b[0].href.split("q=")[1].split("&")[0]) + "&page=" + (parseInt(QueryObject.page) - 1)
            if(QueryObject.tbm === "vid" || QueryObject.tbm === "nws") { links_b[0].href += "&tbm=" + QueryObject.tbm }
            links_b[1].href = "/search?q=" + (links_b[1].href.split("q=")[1].split("&")[0]) + "&page=" + (parseInt(QueryObject.page) + 1)
            if(QueryObject.tbm === "vid" || QueryObject.tbm === "nws") { links_b[1].href += "&tbm=" + QueryObject.tbm }
        }
        else
        {
            if (links_b.find("span:nth-child(2)")[0].innerHTML === "Avanti")
            {
                links_b[0].href = "/search?q=" + (links_b[0].href.split("q=")[1].split("&")[0]) + "&page=" + (parseInt(QueryObject.page) + 1)
                if(QueryObject.tbm === "vid" || QueryObject.tbm === "nws") { links_b[0].href += "&tbm=" + QueryObject.tbm }
            }
            else
            {
                links_b[0].href = "/search?q=" + (links_b[0].href.split("q=")[1].split("&")[0]) + "&page=" + (parseInt(QueryObject.page) - 1)
                if(QueryObject.tbm === "vid" || QueryObject.tbm === "nws") { links_b[0].href += "&tbm=" + QueryObject.tbm }
            }
        }

        links = $("#foot td:not(.b)")
        actual = links.length
        for (i = 0;i < links.length; i++)
        {
            if(links[i].innerHTML.split("<b>").length !== 1)
            {
                actual = i
                break
            }
        }
        center = actual


        for (i = 0; i < links.length; i++)
        {
            if (i >= center - 5 && i <= center + 5)
            {
                if(actual === 0)
                {
                    links[i].innerHTML = "<span class='csb' style='background-position:-53px 0;width:20px'></span><b>" + QueryObject.page + "</b>"
                }
                else
                {
                    links[i].innerHTML = "<a class='fl' href='/search?q=" + myDecodeURI(QueryObject.q) + "&page=" + (parseInt(QueryObject.page) - actual) + "'><span class='csb' style='background-position:-74px 0;width:20px'></span>" + (parseInt(QueryObject.page) - actual) + "</a>"
                    if(QueryObject.tbm === "vid" || QueryObject.tbm === "nws") { links[i].href += "&tbm=" + QueryObject.tbm }
                }
            }
            else
                links[i].style = "display: none;";
            actual--;
        }

        links = $("#foot td:not(.b) a")
        for (i = 0; i < links.length; i++)
        {
            if(QueryObject.tbm === "vid" || QueryObject.tbm === "nws") { links[i].href += "&tbm=" + QueryObject.tbm }
        }
    }
}

function renderInformationColumn(div, data)
{
    if(data === "")
        $("#rightcol").hide()
    else
	    div.innerHTML = data;

    $("#rightcol ._KLb tr:gt(4)").hide()
}


//
// PAGINA RICERCHE CON ?TBM=VID
//

function printVideoSearchResult(data, now1)
{
    var div = $("#searches")[0]
    var obj = JSON.parse(data)

    div.innerHTML = ""
    now2 = Date.now()
    searchstat = ""

    if (obj.resultStats === "") searchstat = ""
    else if(parseInt(QueryObject.page) > 1) searchstat = "Pagina " + QueryObject.page + " di circa " + obj.resultStats.split(" ")[4] + " risultati" + "&nbsp;(" + ((now2 - now1) / 1000).toFixed(2) + " secondi)"
    else searchstat = "Circa " + obj.resultStats.split(" ")[1] + " risultati" + "&nbsp;(" + ((now2 - now1) / 1000).toFixed(2) + " secondi)"

    div.innerHTML = "<div id='searchStat' style='line-height: 43px; color: #808080; padding-left: 16px;'>" + searchstat + "</div>"

    div.innerHTML += "<div id='leftcol' style='margin-top: 10px; display: inline-block; vertical-align: top;'></div>"
    if (obj.resultSearches !== null)
    {
        for(var i = 0; i < obj.resultSearches.length; i++)
        {
            RenderSearch1($("#leftcol")[0], obj.resultSearches[i], i)
        }

        if(typeof(mobileUtilities) !== "function")
            renderPageChange($("#leftcol")[0], obj.changePage)
        else
            mobileUtilities(div)
    }
    else
    {
        div.innerHTML += "<div id='no_answers' style='font-size:16px;padding-left:10px'>"
            + "<p>La ricerca di - <b>" + myDecodeURI(QueryObject.q) + "</b> - non ha prodotto risultati in nessun documento. </p>"
            + "<p style='margin-top:1em'>Suggerimenti:"
            + "<ul class='_Gnc'>"
            + "    <li>Assicurarsi che tutte le parole siano state digitate correttamente.</li>"
            + "<li>Provare con parole chiave diverse.</li>"
            + "<li>Provare con parole chiave più generiche.</li>"
            + "<li>Provare con un numero minore di parole chiave.</li>"
            + "</ul>"
            + "</p>"
            + "</div>"

            if(QueryObject.page > 1)
                if(typeof(mobileUtilities) !== "function")
                    renderPageChange(div, obj.changePage)
                else
                    mobileUtilities(div)
    }


    if(window.innerHeight - 85 > $("#upper-menu").height() + $("#searches").height())
        $("#footer").addClass("navbar-fixed-bottom")
    else
        $("#footer").removeClass("navbar-fixed-bottom")

    $("#footer").show()
    cleanAllGoogleURL()
    correctYoutubeLink()
    setLinkOnClick()
}

function RenderSearch1(div, node, i)
{
    if(node.Rendering === 0)
    {
        title = "<h3" + node.Text.split("<h3")[1].split("</h3>")[0] + "</h3>"
        node.Text = node.Text.split("<h3")[0] + mySpecialDecodeURI(title) + node.Text.split("</h3>")[1]

        div.innerHTML += "<div id='" + i + "' class='g normal'>"
            + node.Text
            + "</div>"
    }
    else if(node.Rendering === 1)
    {
        title = "<h3" + node.Text.split("<h3")[1].split("</h3>")[0] + "</h3>"
        node.Text = node.Text.replace(title, "")
        node.Text = node.Text.split("<cite")[0] + "<cite>" + mySpecialDecodeURI(title.split("href=\"/url?q=")[1].split("&")[0]) + "</cite>" + node.Text.split("</cite>")[1]

        div.innerHTML += "<div id='" + i + "' class='g video table'>"
            + mySpecialDecodeURI(title)
            + node.Text
            + "</div>"
    }
}



//
// PAGINA RICERCHE CON ?TBM=NWS
//

function printNewsSearchResult(data, now1)
{
    var div = $("#searches")[0]
    var obj = JSON.parse(data)

    div.innerHTML = ""
    now2 = Date.now()
    searchstat = ""

    if (obj.resultStats === "") searchstat = ""
    else if(parseInt(QueryObject.page) > 1) searchstat = "Pagina " + QueryObject.page + " di circa " + obj.resultStats.split(" ")[4] + " risultati" + "&nbsp;(" + ((now2 - now1) / 1000).toFixed(2) + " secondi)"
    else searchstat = "Circa " + obj.resultStats.split(" ")[1] + " risultati" + "&nbsp;(" + ((now2 - now1) / 1000).toFixed(2) + " secondi)"

    div.innerHTML = "<div id='searchStat' style='line-height: 43px; color: #808080; padding-left: 16px;'>" + searchstat + "</div>"

    div.innerHTML += "<div id='leftcol' style='margin-top: 10px; display: inline-block; vertical-align: top;'></div>"
    if (obj.resultLeftSearches !== null)
    {
        for(var i = 0; i < obj.resultLeftSearches.length; i++)
        {
            RenderSearch2($("#leftcol")[0], obj.resultLeftSearches[i], i)
        }

        renderRelatedReseaches($("#leftcol")[0], obj.relatedResearches)
        if(typeof(mobileUtilities) !== "function")
            renderPageChange($("#leftcol")[0], obj.changePage)
        else
            mobileUtilities(div)
    }
    else
    {
        div.innerHTML += "<div id='no_answers' style='font-size:16px;padding-left:10px'>"
            + "<p>La ricerca di - <b>" + myDecodeURI(QueryObject.q) + "</b> - non ha prodotto risultati in nessun documento. </p>"
            + "<p style='margin-top:1em'>Suggerimenti:"
            + "<ul class='_Gnc'>"
            + "    <li>Assicurarsi che tutte le parole siano state digitate correttamente.</li>"
            + "<li>Provare con parole chiave diverse.</li>"
            + "<li>Provare con parole chiave più generiche.</li>"
            + "<li>Provare con un numero minore di parole chiave.</li>"
            + "</ul>"
            + "</p>"
            + "</div>"

            if(QueryObject.page > 1)
                if(typeof(mobileUtilities) !== "function")
                    renderPageChange(div, obj.changePage)
                else
                    mobileUtilities(div)
    }


    if(window.innerHeight - 85 > $("#upper-menu").height() + $("#searches").height())
        $("#footer").addClass("navbar-fixed-bottom")
    else
        $("#footer").removeClass("navbar-fixed-bottom")

    $("#footer").show()
    cleanAllGoogleURL()
    correctYoutubeLink()
    setLinkOnClick()
}

function RenderSearch2(div, node, i)
{
    if(node.Rendering === 0)
    {
        correction = ""
        if (node.Img === "<div class=\"f\"></div>")
            correction = " style='margin-top: 0 !important; margin-left: 10px;'"

        div.innerHTML += "<div id='" + i + "' class='g news'>"
            + "<div class='image'>" + node.Img + "</div>"
            + "<div class='description' " + correction + ">" + node.Text + "</div>"
            + "</div>"

        span = $(".g.news:last-child .description .slp .f")
        span[0].innerHTML = "<span style='color: #006621;'>" + span[0].innerHTML.split(" - ")[0] + "</span> - " + span[0].innerHTML.split(" - ")[1]
    }
}

function cleanAllGoogleURL()
{
    var links = $("a")

    for (i = 0; i < links.length; i++)
    {
        if(links[i].href.startsWith("http://localhost:26000/search?ie=UTF-8&"))
        {
            q = links[i].href.substring(30).split("&").filter(function (s) { return s.startsWith("q=") })
            links[i].href = "/search?" + q[0]
        }
        else if(links[i].href.startsWith("http://localhost:26000/url?q="))
        {
            links[i].href = links[i].href.substring(29).split("&")[0]
        }
    }
}

function mapsImagesLink()
{
    var imgs = $("#rightcol a img")

    for (i = 0; i < imgs.length; i++)
    {
        if(imgs[i].src.startsWith("http://localhost:26000/maps"))
        {
            imgs[i].src = "https://www.google.it/maps" + imgs[i].src.split("/maps")[1]
        }
    }
}

function setLinkOnClick()
{
    $("#leftcol > div:not('#related-searches'):not('#foot')").each(function () {
        _id = $(this).attr("id")

        $(this).find("a").each(function () {
            $(this).attr("href", "/redirect?qr=" + QueryObject.q + "&pg=" + QueryObject.page + "&sct=_ls&rdr=" + $(this).attr("href") + "&asc=" + _id)
        })
    })

    $("#leftcol #related-searches a").each(function () {
        $(this).attr("href", $(this).attr("href") + "&pg=" + QueryObject.page + "&sct=_rs&rdr=&asc=-1")
    })

    if(typeof(mobileUtilities) !== "function")
    {
        $("#leftcol #foot a").each(function () {
            $(this).attr("href", $(this).attr("href").replace("/search?q=", "/redirect?qr=").replace("&", "%26") + "&pg=" + QueryObject.page + "&sct=_ft&rdr=&asc=-1")
        })
    }

    $("#rightcol a").each(function(){
        if ($(this).attr("href").startsWith("/url")) {
            $(this).attr("href", "/redirect?qr=" + QueryObject.q + "&rdr=" + $(this).attr("href").split("?q=")[1].split("&")[0] + "&pg=1&sct=_rc&asc=-2")
        } else if($(this).attr("href").startsWith("/search")) {
            $(this).attr("href", "/redirect?qr=" + $(this).attr("href").split("q=")[1].split("&")[0] + "&pg=1&sct=_rc&asc=-1")
        }
    })
}

function correctYoutubeLink()
{
    var links = $("div.th a")

    for (i = 0; i < links.length; i++)
    {
        links[i].href = mySpecialDecodeURI(links[i].href)
    }
}

function sendFeedback()
{
    $.post("/feedback",
        {
            query: QueryObject.q,
            feed: $("#feed form input[type=radio]:checked")[0].id.substr(-1)
        }).done(function(data, success) {
            //dovrei cambiare con una scritta di ringraziamento
        })
        .fail(function() {})
}