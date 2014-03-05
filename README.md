# APICraft.org

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
