/**
 * Manages background transfers with Centaur servers
 */
class EmailTransfers {
    constructor(opts) {
        this.requireReviews = opts.requireReviews;
        this.scanBuffer = [];
        this.bufferPtr = 0;
        this.$div = opts.$div;
        this.emailAddress = opts.emailAddress;
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
        me.emailTransfer(request);
    }

    emailTransfer(msg) {
        // There can 1 or more images to be transferred
        // The email plugin requires the base64 image header to be stripped off
        let cats = new Categories();
        let request = msg.data;
        let d = new Date(),
            dOptions = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            },
            dt = d.toLocaleDateString('en-US', dOptions) + ' ' +
                d.toLocaleTimeString();
        let body = `ID: ${request.reference}
        DATE/TIME: ${dt}
        `;
        let attachments = [];
        request.contents.forEach((r,i)=>{
            // reformat the image base64 to be compatible with the email plugin
            let arr = r.img.split(',');
            let ext = 'jpg';
            if (arr[0].indexOf('png')>-1) ext = 'png';
            arr.shift();
            let imgName = `image-${i}`;
            let img = `base64:${imgName}.${ext}//`;
            img += arr.join(',');
            attachments.push(img);
            let title = cats.translate(r.category, r.zones[0].id);
            if (r.zones[0].value){
                body += `${title}: ${r.zones[0].value}`;
            }
            });
        cordova.plugins.email.open({
            to: this.emailAddress,
            subject: `Job # ${request.reference}`,
            body,
            isHTML: true,
            attachments
        }, function (err) {
            if (err!='OK') {
                console.log(err);
                msg.error(err);
            } else {
                console.log('Email success');
                msg.done();
            }
        });
    }


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
    setDisplayState(request) {
        request.invalidFormat = (request.reference == "");
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
