define([],function(){
  var reconnectingWebsocket = require("reconnectingWebsocket");

  function websocketFactory(path, heartCheckTime){
    var url = "";
    if (location.protocol=="https:") {
      url="wss://" + location.host + "/" + path;
    } else {
      url="ws://" + location.host + "/" + path;
    }
    var ws = new reconnectingWebsocket(url);
    this.ws=ws;
    this.onopen=function(evt){};
    var isFirstOpen = true;
    var self = this;
    var listens = {};
    var heartCheck = {
          timeout: 0,//60ms
          timeoutObj: null,
          serverTimeoutObj: null,
          reset: function(){
            if (this.timeout==0) {
              return;
            }

            clearTimeout(this.timeoutObj);
            clearTimeout(this.serverTimeoutObj);
    　　　　 this.start();
          },
          start: function(){
            if (this.timeout==0) {
              return;
            }
            var self = this;

            this.timeoutObj = setTimeout(function(){
                ws.send("ping");
                self.serverTimeoutObj = setTimeout(function(){
                    ws.close();//如果onclose会执行reconnect，我们执行ws.close()就行了.如果直接执行reconnect 会触发onclose导致重连两次
                }, self.timeout);
            }, this.timeout);
          },
    };
    if (heartCheckTime && parseInt(heartCheckTime) > 0){
      heartCheck.timeout=parseInt(heartCheckTime);
    }

    ws.onopen = function(evt) {
        isFirstOpen=false;
        self.refreshsub();
        heartCheck.start();
        if (self.onopen) {
          self.onopen.apply(self);
        }
    };
    ws.onmessage = function(e) {
      heartCheck.reset();
      var obj = JSON.parse(e.data);
      if (obj.c && listens.hasOwnProperty(obj.c)) {
        if (listens[obj.c]) {
          listens[obj.c].apply(ws,[obj]);
        }
      }
    };
    this.refreshsub = function(){
      for (var v in listens) {
        if (listens.hasOwnProperty(v)) {
          self.send(JSON.stringify({
            "action":"sub",
            "channel":v
          }));
        }
      }
    };
    this.listen=function(chan,func){
      //console.log("send");
      //console.log("send2");
      listens[chan]=func;

      if (isFirstOpen==false) {
        self.send(JSON.stringify({
          "action":"sub",
          "channel":chan
        }));
      }
      //console.log("sen3");
    };
    this.send=function(data){
      ws.send(data);
    };
  }

  function NewSocket(path, heartCheckTime){
    return new websocketFactory(path, heartCheckTime);
  }

  return{
    NewSocket: NewSocket
  };
});
