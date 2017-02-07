<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
        <meta http-equiv="Content-type" content="text/html;charset=utf-8"/>
        <title>Index - ${gTitle!}</title>
        <meta http-equiv="Content-Style-Type" content="text/css"/>
        <meta http-equiv="Content-Script-Type" content="text/javascript"/>
        <meta name="Author" content="netease"/>
        <#include "/tmpl/lib/const.ftl">
        <#include "/tmpl/lib/corecss.ftl">
    </head>
    <body>
    <div class="success">
        <h1>${user.name?html}</h1>
        <h2>${realHost}</h2>
        <div>
            <span>ddd服务器时间：</span> <span id="time"></span>
            <img src="/style/img/bg.png">
        </div>
        <div class="w-icon icon-alipay"></div>
        <a href="/demo/test1.jsp">test1.html</a>
        <a href="/demo/test2.jsp">test2.html</a>
    </div>
    <#include "/tmpl/lib/corejs.ftl">
    
    <script type="text/javascript" src="/js/module/index/index.page.js"></script>

    </body>
</html>