// scripts/x2/PODtransfers-0.1.js
/**
 * Manages sequential (effectively "synchronous") transfers with Centaur servers
 */
class PODtransfers {
    constructor(opts) {
        this.requireReviews = opts.requireReviews;
        this.scanBuffer = [];
        this.bufferPtr = 0;
        this.$div = opts.$div;
        this.x2 = new X2(opts);

        this._running = false;    // ensures one loop at a time
        this._stop = false;       // optional external stop flag if you need it
    }

    /**
     * Add a job to be transferred.
     */
    add(opts) {
        this.scanBuffer.push(opts);
        // start loop if not already running
        if (!this._running) {
            this._running = true;
            this.processLoop().finally(() => { this._running = false; });
        }
    }

    /**
     * Main processing loop: handles one job at a time, with retry pauses.
     */
    async processLoop() {
        while (!this._stop && this.scanBuffer.length) {
            // Normalize pointer
            if (this.bufferPtr >= this.scanBuffer.length) this.bufferPtr = 0;

            const request = this.scanBuffer[this.bufferPtr];

            // Skip items that can’t go yet, but keep looping
            if (request.invalidFormat || (this.requireReviews && !request.reviewed)) {
                this.bufferPtr = (this.bufferPtr + 1) % this.scanBuffer.length;
                await this.sleep(1000);
                continue;
            }

            // Ready to try transfer
            request.startingTransfer = true;
            this.setDisplayState(request);

            let uuid;
            try {
                uuid = await this.x2.login();
            } catch (e) {
                this.loginFailed(e, request);
                await this.sleep(1000);
                continue; // retry later
            }

            try {
                // docDetails is intercepted by the POD upload route on the server
                // and a message constructed to the application.
                const contents = request.contents || [];
                for (const content of contents) {
                    const docDetails = {
                        uuid,
                        process: 'driverPDAinterface.setStatusByMailbox',
                        id: (request.id || -1).toString(),
                        reference: content.reference,
                        name: content.zones?.[0]?.value,
                        signed: content.img,
                        mimeType: "image/jpeg",
                        dt: this.getISOdate()
                    };

                    await this.loggedIn(docDetails, request.done, request);
                }

                // If we reached here without throwing, remove the item and update UI
                const item = this.scanBuffer.splice(this.bufferPtr, 1)[0];

                if (this.$div) {
                    if (typeof currentEditId !== 'undefined' && currentEditId === item.id) {
                        $('#inputFields').empty();
                        $('#inputDiv').hide();
                    }
                    $(`#${item.id}`).remove();
                }

                if (typeof host !== 'undefined') {
                    host.sendToHost(JSON.stringify({
                        type: 'delete',
                        fileName: item.fileName,
                        details: item
                    }));
                } else if (typeof item.done === 'function') {
                    item.done();
                }

                // do not advance bufferPtr here because splice removed current index
                // next iteration will naturally point at the next item

            } catch (err) {
                // Mark failure state and retry later
                request.startingTransfer = false;
                request.transferFailed = true;
                this.setDisplayState(request);
                await this.sleep(1000);
                // Move to next item so a permanently bad item doesn’t starve the queue
                this.bufferPtr = (this.bufferPtr + 1) % this.scanBuffer.length;
            }
        }
    }

    /**
     * Called when login fails; flags UI and keeps the queue alive.
     */
    loginFailed(e, rq) {
        console.log(e);
        if (rq?.error) {
            rq.error("Login failed");
        }
        // Display updates happen in the loop via flags.
    }

    /**
     * Perform the actual POST once logged in (awaitable).
     * Throws on failure, returns void on success.
     */
    async loggedIn(rq, cb /* optional */, requestForUi) {
        const me = this;
        const url = `${me.x2.host}/${me.x2.script}/api/pod`;
        const headers = { 'Content-Type': 'application/json' };

        // Wrap the Cordova HTTP plugin (callback API) into a Promise
        const resp = await new Promise((resolve, reject) => {
            try {
                cordova.plugin.http.setDataSerializer('json');
                cordova.plugin.http.post(
                    url,
                    rq,
                    headers,
                    (res) => resolve(res),
                    (err) => reject(err)
                );
            } catch (e) {
                reject(e);
            }
        });

        const xmlError = '<x2><ERROR><DESCRIPTION>Invalid booking number</DESCRIPTION></ERROR></x2>';

        if (resp?.data === xmlError) {
            alert(`${rq.reference} is an invalid booking number`);
            // mark as unreviewed again so it surfaces for correction
            for (let r = 0; r < this.scanBuffer.length; r++) {
                if (this.scanBuffer[r].id === rq.id) {
                    this.scanBuffer[r].reviewed = false;
                    break;
                }
            }
            // treat as "handled" (no throw), so the loop can continue to next item
            return;
        }
        if (resp?.data?.trim() !== "<x2><ACK/></x2>") {
            throw new Error(`Unexpected server response: ${resp?.data}`);
        }

        // Success path UI cleanup for this stage
        if (requestForUi) {
            requestForUi.transferFailed = false;
            requestForUi.startingTransfer = false;
            this.setDisplayState(requestForUi);
        }

        if (typeof cb === 'function') {
            // optional caller-supplied hook (non-blocking)
            try { cb(); } catch (_) {}
        }
    }

    getISOdate(dt) {
        if (!dt) dt = new Date();
        const pad = (n) => String(n).padStart(2, '0');
        return (
            dt.getFullYear() + "-" +
            pad(dt.getMonth() + 1) + "-" +
            pad(dt.getDate()) + " " +
            pad(dt.getHours()) + ":" +
            pad(dt.getMinutes())
        );
    }

    /**
     * Update status of pending transfers (kept as in original).
     */
    setDisplayState(msg) {
        return; // original code early-returns; keep behavior
        // ... (kept your original implementation below if you re-enable it)
    }

    /**
     * Helper: sleep for ms milliseconds.
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * Backwards-compat: kick the loop (no timers needed anymore).
     */
    startTransfers() {
        if (!this._running) {
            this._running = true;
            this.processLoop().finally(() => { this._running = false; });
        }
    }
}
