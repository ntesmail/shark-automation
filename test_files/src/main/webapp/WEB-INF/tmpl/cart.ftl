<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
        <meta http-equiv="Content-type" content="text/html;charset=utf-8"/>
        <title>cart - ${gTitle!}</title>
        <meta http-equiv="Content-Style-Type" content="text/css"/>
        <meta http-equiv="Content-Script-Type" content="text/javascript"/>
        <meta name="Author" content="netease"/>
        <#include "/tmpl/lib/const.ftl">
        <#include "/tmpl/lib/corecss.ftl">
        <!-- build:css /style/css/test1.css -->
        <link type="text/css" href="/style/css/test1.css" rel="stylesheet"/>
        <!-- endbuild -->
    </head>
    <body>
    <div class="success">
        <h1>${user.name?html}</h1>
        <h2>${realHost}</h2>
    </div>

    <#include "/tmpl/lib/corejs.ftl">
    <script type="text/javascript" src="/js/module/cart/cart.page.js"></script>
    
    </body>
</html>