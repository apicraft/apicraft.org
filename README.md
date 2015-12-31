# APICraft.org

[![Join the chat at https://gitter.im/apicraft/apicraft.org](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/apicraft/apicraft.org?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

This is the website for [apicraft.org](http://apicraft.org). 

Get the basics going: 

```
npm install
node .
```

This website depends on an API. [Get the api](https://github.com/apicraft/api.apicraft.org) and then run 

```
npm install argo
```

Modify lines 2 & 3 of [functions.js](https://github.com/apicraft/apicraft.org/blob/master/public/js/functions.js) to point to your api. 
```
var baseURL = "http://api.api-craft.org";
var api_url = baseURL + "/conferences/detroit2014";
```
