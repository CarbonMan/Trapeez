// scripts/f3/f3_PODtransfers-0.1.js
/**
 * Manages background transfers with Centaur servers
 */
class F3_PODtransfers {
    constructor(opts) {
        this.requireReviews = opts.requireReviews;
        this.scanBuffer = [];
        this.bufferPtr = 0;
        this.$div = opts.$div;
        this.f3 = new F3(opts);
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
        let me = this;
        clearTimeout(me.to);
        if (!me.scanBuffer.length) {
            return;
        }
        var request = me.scanBuffer[me.bufferPtr];
        if (request.invalidFormat || (me.requireReviews && !request.reviewed)) {
            me.bufferPtr++;
            if (me.bufferPtr == me.scanBuffer.length)
                me.bufferPtr = 0;
            me.to = setTimeout(() => { me.transfer() }, 1000);
            return;
        }
        request.startingTransfer = true;
        me.setDisplayState(request);
        me.f3.login()
            .then((uuid) => {
                // docDetails is intercepted by the POD upload route on the server
                // and a message constructed to the application.
                let contents = request.contents;
                contents.forEach((content) => {
                    let docDetails = {
                        uuid,
                        process: 'driverPDAinterface.setStatus',
                        id: (request.id || -1).toString(),
                        reference: content.reference,
                        name: content.zones[0].value,
                        signed: content.img,
                        mimeType: "image/jpeg",
                        dt: me.getISOdate()
                    };
                    // TODO: Implement as a promise.all
                    me.loggedIn(docDetails, request.done);
                });
            })
            .catch((e) => {
                me.loginFailed.call(me, e, request);
            });
    }

    /**
    * Login failed 
    */
    loginFailed(e, rq) {
        console.log(e);
        if (rq.error) {
            rq.error("Login failed");
        }
        // Continue to try, if it was a server fault then it will just resume
        // when the problem is resolved.
        this.to = setTimeout(() => { this.transfer() }, 1000);

    }

    /**
     * App is logged in and the transfer can start transfers
     */
	 loggedIn(rq, cb) {
		  const me   = this;
		  const url  = `${me.f3.host}/${me.f3.script}/api/pod`;

		  // --- headers: let server know we're posting url-encoded form data ----
		  //const headers = { 'Content-Type': 'application/x-www-form-urlencoded' };
		  const headers = { 'Content-Type': "application/json"};
		  // --- fire the request -------------------------------------------------
		  cordova.plugin.http.setDataSerializer('json')
		  cordova.plugin.http.post(
			  url,
			  rq,         // body – left as JS object; plugin encodes it for us
			  headers,
			  (resp) => { // ---------- success ----------
				const xmlError =
				  '<x2><ERROR><DESCRIPTION>Invalid booking number</DESCRIPTION></ERROR></x2>';

				if (resp.data === xmlError) {          // invalid booking #
				  alert(`${rq.reference} is an invalid booking number`);
				  for (let r = 0; r < me.scanBuffer.length; r++) {
					if (me.scanBuffer[r].id === rq.id) {
					  me.scanBuffer[r].reviewed = false;
					  return;
					}
				  }
				}

				// Remove from pending -------------------------------------------
				const item = me.scanBuffer.splice(me.bufferPtr, 1)[0];

				if (me.$div) {
				  if (currentEditId === rq.id) {
					$('#inputFields').empty();
					$('#inputDiv').hide();
				  }
				  $(`#${item.id}`).remove();           // drop from UI list
				}

				if (typeof host !== 'undefined') {
				  // running inside IOTkeys – tell host to delete the file
				  host.sendToHost(JSON.stringify({
					type: 'delete',
					fileName: item.fileName,
					details: item
				  }));
				} else if (cb) {
				  cb();                           // caller-supplied hook
				}

				// schedule next transfer ----------------------------------------
				me.bufferPtr = (me.bufferPtr + 1) % me.scanBuffer.length;
				me.to = setTimeout(() => me.transfer(), 1000);
			  },
			  (err) => {   // ---------- failure ----------
				const req = me.scanBuffer[me.bufferPtr];
				req.startingTransfer = false;
				req.transferFailed   = true;
				me.setDisplayState(req);

				cb && cb('Login failed');  // invoke caller hook

				// keep retrying every second – same logic as original
				me.to = setTimeout(() => me.transfer(), 1000);
			  }
			);
		}

    // loggedIn(rq) {
        // let me = this;
        // $.ajax({
            // url: me.f3.host + "/" + me.f3.script + "/api/pod",
            // type: 'POST',
            // data: rq,
            // crossDomain: true,
            // dataType: "xml"
        // })
            // .done(function (rsp) {
                // if (rsp == "<x2><ERROR><DESCRIPTION>Invalid booking number</DESCRIPTION></ERROR></x2>") {
                    // alert(rq.reference + " is an invalid booking number");
                    // for (var r = 0; r < me.scanBuffer.length; r++) {
                        // if (me.scanBuffer[r].id = rq.id) {
                            // me.scanBuffer[r].reviewed = false;
                            // return;
                        // }
                    // }
                // }

                // // Remove from pending
                // var item = me.scanBuffer.splice(this.bufferPtr, 1)[0];
                // if (me.$div) {
                    // if (currentEditId == rq.id) {
                        // $("#inputFields").empty();
                        // $("#inputDiv").hide();
                    // }
                    // // Remove from the list
                    // $("#" + item.id).remove();
                // }
                // if (typeof host != 'undefined') {
                    // // Running within IOTkeys
                    // // Tell the host to remove the image file
                    // var msg = {
                        // type: "delete",
                        // fileName: item.fileName,
                        // details: item
                    // };
                    // host.sendToHost(JSON.stringify(msg));
                // } else if (rq.done) {
                    // rq.done();
                // }
                // // Do the next pending POD
                // me.bufferPtr++;
                // if (me.bufferPtr >= me.scanBuffer.length)
                    // me.bufferPtr = 0;
                // // Pause for 1 second to not overload the server
                // me.to = setTimeout(() => { me.transfer() }, 1000);
            // })
            // .fail(function (jqXHR, textStatus, errorThrown) {
                // var req = me.scanBuffer[me.bufferPtr];
                // req.startingTransfer = false;
                // req.transferFailed = true;
                // me.setDisplayState(req);
                // if (rq.error) {
                    // rq.error("Login failed");
                // }
                // // Continue to try, if it was a server fault then it will just resume
                // // when the problem is resolved.
                // me.to = setTimeout(() => { me.transfer() }, 1000);
            // });
    // }

    getISOdate(dt) {
        if (!dt)
            dt = new Date()

        return dt.getFullYear() + "-" + (dt.getMonth() + 1)
            + "-" + dt.getDate() + " " + dt.getHours() + ":" + dt.getMinutes();
    }


    /**
    * If a display is being used this will update the 
    * status of the pending transfers
    */
    setDisplayState(msg) {
        return;
        let request = msg.data;
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
        } else if (!this.uuid) {
            // Login failed
            newClass = "half empty red";
            //request.statusMessage = "Login failed";
        } else if (request.startingTransfer) {
            // Transfer has started
            newClass = "half empty green";
            request.statusMessage = "in transit";
        }
        if (this.$div) {
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
        this.to = setTimeout(() => { this.transfer() }, 1000);
    }

}
