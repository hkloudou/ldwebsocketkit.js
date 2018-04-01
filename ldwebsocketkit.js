define([],function(){
  var reconnectingWebsocket = require("reconnectingWebsocket");

  function websocketFactory(path, heartCheckTime,options){
    var url = "";
    if (location.protocol=="https:") {
      url="wss://" + location.host + "/" + path;
    } else {
      url="ws://" + location.host + "/" + path;
    }
    var ws = new reconnectingWebsocket(url, null, options);
    this.ws=ws;
    this.onopenSendData=[];
    var isFirstOpen = true;
    var self = this;
    var listens = {};
    var sendlist = [];
    var heartCheck = {
          timeout: 0,//60ms
          timeoutObj: null,
          serverTimeoutObj: null,
          reset: function(){
            if (this.timeout==0) {
              return;
            }

            clearTimeout(this.serverTimeoutObj);
            clearTimeout(this.timeoutObj);
    　　　　 this.start();
          },
          start: function(){
            //console.log("start", this.timeout);
            if (this.timeout==0) {
              return;
            }
            var hcself = this;

            hcself.timeoutObj = setTimeout(function(){
                self.send("ping");
                hcself.serverTimeoutObj = setTimeout(function(){
                    self.send("close");
                    ws.close();//如果onclose会执行reconnect，我们执行ws.close()就行了.如果直接执行reconnect 会触发onclose导致重连两次
                }, hcself.timeout);
            }, hcself.timeout);
          },
    };
    if (heartCheckTime && parseInt(heartCheckTime) > 0){
      heartCheck.timeout=parseInt(heartCheckTime);
    }

    ws.onopen = function(evt) {
        console.log("on open");
        isFirstOpen=false;
        //self.refreshSubscriptionListens();  already insert to onopenSendData
        if (self.onopenSendData.length > 1) {
          self.send(self.onopenSendData);
        }
        heartCheck.start();
        while (true) {
          var sendItem = sendlist.pop();
          if (undefined == sendItem) {
            break;
          }
          try{
            self.send(sendItem,true);
          } catch(e) {
            console.log(e);
          };
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
    /*
    this.refreshSubscriptionListens = function(){
      var subArr = [];
      for (var v in listens) {
        if (listens.hasOwnProperty(v)) {
          subArr.push({
            "action":"sub",
            "channel":v
          });
        }
      }
      //console.log("subArr",subArr);
      if (subArr.length > 1) {
        self.send(subArr);
      }
    };
    */
    this.listen=function(chan,func){
      listens[chan]=func;

      this.onopenSendData.push({
        "action":"sub",
        "channel":chan
      });
      //if state is open, send raight now
      if (ws.readyState == WebSocket.OPEN){
        self.send({
          "action":"sub",
          "channel":chan
        });
      }
    };

    this.send=function(data,makesure){
      console.log("send",data);
      if (ws.readyState == WebSocket.OPEN){
        try{
          if (typeof data == "object") {
            ws.send(JSON.stringify(data));
          } else {
            ws.send(data);
          }
        } catch(e) {
          console.log(e);
        };
      } else if (makesure){
        sendlist.unshift(data);
      }
    };

    this.open = function(reconnectAttempt){
      //console.log("open");
      ws.open(reconnectAttempt);
      //console.log("open2");
    };
  }

  function NewSocket(path, heartCheckTime, options){
    return new websocketFactory(path, heartCheckTime, options);
  }

  return{
    NewSocket: NewSocket
  };
});
