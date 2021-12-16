/**
 * Manages background transfers with Centaur servers
 */
class CentaurPODtransfers {
    constructor(opts) {
        this.x2State = {
            uuid: "",
            host: opts.host,
            script: opts.script
        };
        this.requireReviews = opts.requireReviews;
        this.x2State.url = this.x2State.host + "/common/foxisapi.dll/" +
            this.x2State.script + ".x2";
        this.scanBuffer = [];
        this.bufferPtr = 0;
        this.$div = opts.$div;
        this.username = opts.username;
        this.password = opts.password;
    }
    /**
     * Add a job to be transfered.
     */
    add(opts) {
        this.scanBuffer.push(opts);
        this.startTransfers();
    }
    /**
     * Attempt to transfer POD
     */
    transfer() {
        clearTimeout(this.to);
        if (!this.scanBuffer.length) {
            return;
        }
        var request = this.scanBuffer[this.bufferPtr];
        if (request.invalidFormat || (this.requireReviews && !request.reviewed)) {
            this.bufferPtr++;
            if (this.bufferPtr == this.scanBuffer.length)
                this.bufferPtr = 0;
            this.to = setTimeout(()=>{this.transfer()}, 1000);
            return;
        }
        request.startingTransfer = true;
        this.setDisplayState(request);
        let me = this;
        this.login(function () {
            // docDetails is intercepted by the POD upload route on the server
            // and a message constructed to the application.
            var docDetails = {
                uuid: this.x2State.uuid,
                process: 'driverPDAinterface.setStatus',
                id: request.id,
                reference: request.zones[0].value,
                signed: request.image,
                mimeType: "image/jpeg",
                dt: this.getISOdate(),
                done: request.done
            };
            me.loggedIn(docDetails);
        }, (e)=>{ this.loginFailed.call(this, e, request);});
    }
    
    /**
    * Login failed 
    */
    loginFailed(e, rq) {
        console.log(e);
        if (rq.error){ 
            rq.error("Login failed"); 
        }
        // Continue to try, if it was a server fault then it will just resume
        // when the problem is resolved.
        this.to = setTimeout(()=>{this.transfer()}, 1000);
        
    }
    
    /**
     * App is logged in and the transfer can start transfers
     */
    loggedIn(rq) {
        $.post(this.x2State.host + "/" + this.x2State.script + "/api/pod", rq, {
            crossDomain: true,
            dataType: "xml"
        })
        .done(function (rsp) {
            if (rsp == "<x2><ERROR><DESCRIPTION>Invalid booking number</DESCRIPTION></ERROR></x2>") {
                alert(rq.reference + " is an invalid booking number");
                for (var r = 0; r < this.scanBuffer.length; r++) {
                    if (this.scanBuffer[r].id = rq.id) {
                        this.scanBuffer[r].reviewed = false;
                        return;
                    }
                }
            }

            // Remove from pending
            var item = this.scanBuffer.splice(this.bufferPtr, 1)[0];
            if (this.$div){
                if (currentEditId == rq.id) {
                    $("#inputFields").empty();
                    $("#inputDiv").hide();
                }
                // Remove from the list
                $("#" + item.id).remove();
            }
            // Tell the host to remove the image file
            var msg = {
                type: "delete",
                fileName: item.fileName,
                details: item
            };
            if (host) {
                host.sendToHost(JSON.stringify(msg));
            } else if (rq.done){
                rq.done();
            }
            // Do the next pending POD
            this.bufferPtr++;
            if (this.bufferPtr >= this.scanBuffer.length)
                this.bufferPtr = 0;
            // Pause for 1 second to not overload the server
            this.to = setTimeout(()=>{this.transfer()}, 1000);
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            var req = this.scanBuffer[this.bufferPtr];
            req.startingTransfer = false;
            req.transferFailed = true;
            this.setDisplayState(req);
            if (rq.error){ 
                rq.error("Login failed"); 
            }
            // Continue to try, if it was a server fault then it will just resume
            // when the problem is resolved.
            this.to = setTimeout(()=>{this.transfer()}, 1000);
        });
    }

    getISOdate(dt) {
        if (!dt)
            dt = new Date()

                return dt.getFullYear() + "-" + (dt.getMonth() + 1)
                 + "-" + dt.getDate() + " " + dt.getHours() + ":" + dt.getMinutes();
    }

    login(cb, onFail) {
        if (this.x2State.uuid) {
            cb();
            return;
        }
        var str = "<x>" +
            "<PARAM0>" + this.username +
            "</PARAM0>" +
            "<PARAM1>" + this.password +
            "</PARAM1></x>";
        $.post(this.x2State.url + ".autologin", str, {
            crossDomain: true,
            dataType: "xml",
            contentType: "application/xml"
        })
        .done(function (result) {
            this.x2State.uuid = $(result).attr("uuid");
            if (!this.x2State.uuid)
                this.x2State.uuid = $(result).find("[uuid]").attr("uuid");
            if (this.x2State.uuid) {
                if (this.$div){
                    $("#sessionStatus").html("Connected");
                }
                cb();
            } else {
                if (this.$div){
                    $("#sessionStatus").html("Login failed");
                }
                onFail("Invalid login");
            }
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            console.log("Error during login");
            if (onFail)
                onFail(jqXHR);
            //this.to = setTimeout(()=>{this.transfer()}, 1000);
        });
    }
  
    /**
    * If a display is being used this will update the 
    * status of the pending transfers
    */
    setDisplayState(request) {
        request.invalidFormat = (request.zones[0].value == "");
        var newClass;
        if (!request.invalidFormat) {
            // Ready to go
            newClass = "empty green";
            request.statusMessage = "Pending transfer";
        }
        if (request.transferFailed) {
            newClass = "half empty red";
            request.statusMessage = "Transfer failed";
        } else if (request.invalidFormat) {
            // Barcode was not detected
            newClass = "empty red";
            request.statusMessage = "Review required";
        } else if (!request.reviewed) {
            // Not yet reviewed
            newClass = "black";
            request.statusMessage = "Pending review";
        } else if (!this.x2State.uuid) {
            // Login failed
            newClass = "half empty red";
            //request.statusMessage = "Login failed";
        } else if (request.startingTransfer) {
            // Transfer has started
            newClass = "half empty green";
            request.statusMessage = "in transit";
        }
        if (this.$div){
            $("#" + request.id + "_status").html("(" + request.statusMessage + ")");
            if (newClass)
                $("#" + request.id + "_icon").removeClass().addClass("icon star " + newClass);
        }
    }
    /**
    * Starts the background transfers
    */
    startTransfers() {
        clearTimeout(this.to);
        this.to = setTimeout(()=>{this.transfer()}, 1000);
    }

}
