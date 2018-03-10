# ldwebsocketkit.js
### this project already register in bower.io
```
bower install ldwebsocketkit.js --save
```

### Demo
```
  var ws = require("ldwebsocketkit.js/ldwebsocketkit.js").NewSocket("/ws",5000);

  ws.listen("system",function(obj){
    console.log("system",obj);
  });
```
### Tip
* this project  depend on https://github.com/hkloudou/reconnecting-websocket
* the best server side way in https://github.com/hkloudou/websoketkit
