# ldwebsocketkit.js
### this project already register in bower.io
```
bower install ldwebsocketkit.js --save
```

### Demo for webpack
```
  var ws = require("ldwebsocketkit.js/ldwebsocketkit.js").NewSocket("/ws",5000);

  ws.listen("system",function(obj){
    console.log("system",obj);
  });
```
