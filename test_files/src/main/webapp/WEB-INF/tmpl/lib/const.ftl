<#-- placeholder -->

<#-- 仅为开发时使用，解决seajs模块打包前后调用不一致的问题 -->
<#macro DevelopOnly>
<#if isDevelop?default(true)>
<#nested>
</#if>
</#macro>

