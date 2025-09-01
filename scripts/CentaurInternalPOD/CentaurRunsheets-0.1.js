InternalPOD_Runsheets = class {
    constructor(pluginInstance) {
        console.log('InternalPOD_Runsheets instantiated');
        // Store reference to the plugin instance so we can access it later. Can't store a reference
        // See pluginContainer.instances
        this.x2 = null;
        const me = this;
        this.pluginId = pluginInstance.parent;
        this.pluginInstanceName = pluginInstance.name;
        if (location.href.endsWith('index.html')) {
            barcode.on('scan', (ev) => {
                return new Promise((resolve, reject) => {
                    const action = sessionStorage.getItem('action');
                    console.log('InternalPOD - Scan event trapped');
                    if (!action || action != 'CENTAUR_RUNSHEETS') {
                        resolve();
                        return;
                    }
                    // Change the destination to frame.html
                    ev.target = 'frame_1.html';
                    instance = $T.plugins[this.pluginId].instances[this.pluginInstanceName];
                    if (!me.x2) {
                        me.x2 = new X2({
                            username: instance.centaurUsername,
                            password: instance.centaurPassword,
                            host: instance.centaurHost,
                            script: instance.centaurScript,
                        });
                    }
                    me.x2.login()
                        .then((uuid) => {
                            const url = `${instance.centaurHost}/common/foxisapi.dll/${instance.centaurScript.trim()}.x2.isapi`;
                            // --- Build XML payload --------------------------------------------------
                            let xml;
                            if (ev.scanId)
                                xml = `<x uuid='${uuid}'><PROCESS class="tiRnHeader.getRunsheet">${ev.scanId}</PROCESS></x>`;
                            else
                                xml = `<x uuid='${uuid}'><PROCESS class="tiRnHeader.getActiveRunsheets"/></x>`;
                            const encodedXml = encodeURIComponent(xml);
                            const urlWithParams = `${url}?${encodedXml}`;
                            // --- Configure the advanced-http plugin ---------------------------------
                            cordova.plugin.http.setDataSerializer('utf8');       // raw UTF-8 string
                            const headers = { 'Content-Type': 'application/xml' };

                            // --- Fire the POST ------------------------------------------------------
                            cordova.plugin.http.get(
                                urlWithParams,
                                {},
                                headers,
                                (resp) => {     // success callback
                                    //console.dir(resp);
                                    const main = this.xmlToRunsheetList(resp.data);
                                    ev.target = 'frame_1.html';
                                    sessionStorage.setItem('frame_1_main', main);
                                    resolve();
                                },
                                (err) => {
                                    console.error(err);
                                }
                            );
                        })
                        .catch((e) => {
                            console.error(e);
                            reject();
                        });
                });
            });
        } else if (location.href.endsWith('frame_1.html')) {
            //const scriptTag = document.createElement('script');
            //scriptTag.textContent =  = this.runsheetListCode();
            //document.head.appendChild(scriptTag);
            const tableHTML = sessionStorage.getItem('frame_1_main');
            document.getElementById('main').innerHTML = tableHTML;
        } else if (location.href.endsWith('frame_2.html')) {
            //const scriptTag = document.createElement('script');
            //scriptTag.textContent =  = this.runsheetListCode();
            //document.head.appendChild(scriptTag);
            const tableHTML = sessionStorage.getItem('frame_2_main');
            document.getElementById('main').innerHTML = tableHTML;
        } else if (location.href.endsWith('signature2.1.html')) {
            //const scriptTag = document.createElement('script');
            //scriptTag.textContent =  = this.runsheetListCode();
            //document.head.appendChild(scriptTag);
            document.addEventListener('beforeHome', function(event) {
				event.preventDefault();
				//history.go(-2);
				history.back();
			});
        }
    }

	processItem(jobNumber){
		sessionStorage.setItem('currentBatchId', jobNumber);
		location.href = 'onBarcodeScanned.html';
	}

    showRunsheetItems(id) {
        if (!id) return;
        const me = this;
        instance = $T.plugins[this.pluginId].instances[this.pluginInstanceName];
        if (!me.x2) {
            me.x2 = new X2({
                username: instance.centaurUsername,
                password: instance.centaurPassword,
                host: instance.centaurHost,
                script: instance.centaurScript,
            });
        }
        me.x2.login()
            .then((uuid) => {
                const url = `${instance.centaurHost}/common/foxisapi.dll/${instance.centaurScript.trim()}.x2.isapi`;
                // --- Build XML payload --------------------------------------------------
                let xml;
                xml = `<x uuid='${uuid}'><PROCESS class="tiRnHeader.getConsolidatedEntries">${id}</PROCESS></x>`;
                const encodedXml = encodeURIComponent(xml);
                const urlWithParams = `${url}?${encodedXml}`;
                // --- Configure the advanced-http plugin ---------------------------------
                cordova.plugin.http.setDataSerializer('utf8');       // raw UTF-8 string
                const headers = { 'Content-Type': 'application/xml' };

                // --- Fire the POST ------------------------------------------------------
                cordova.plugin.http.get(
                    urlWithParams,
                    {},
                    headers,
                    (resp) => {     // success callback
                        //console.dir(resp);
                        const main = me.xmlToRunsheetEntries(resp.data);
                        sessionStorage.setItem('frame_2_main', main);
                        location.href = 'frame_2.html';
                    },
                    (err) => {
                        console.error(err);
                    }
                );
            })
            .catch((e) => {
                console.error(e);
            });
    }


    xmlToRunsheetEntries(xmlString) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");
        const tuples = xmlDoc.getElementsByTagName("TUPLE");
        let tableHtml = `
	<table class="table table-striped table-hover">
	    <thead class="table-dark">
	        <tr>
	            <th>JOB ID</th>
			    <th>NAME</th>
	            <th>ITEMS</th>
			    <th colspan='2'>ADDRESS</th>
	        </tr>
	    </thead>
	    <tbody>`;

        for (let tuple of tuples) {
            const refno = tuple.getElementsByTagName("REFNO")[0]?.textContent || '';
            const jobId = tuple.getElementsByTagName("CONNOTE")[0]?.textContent || '';
            tableHtml += `
	        <tr onclick="runsheets.processItem('${jobId}')" style="cursor: pointer;">
	            <td>${jobId}</td>
			    <td>${tuple.getElementsByTagName("RECEIVERNAME")[0]?.textContent || ''}</td>
	            <td>${tuple.getElementsByTagName("ITEMS")[0]?.textContent || ''}</td>
			    <td>${tuple.getElementsByTagName("STREET")[0]?.textContent || ''}</td>
			    <td>${tuple.getElementsByTagName("STREET2")[0]?.textContent || ''}</td>
	        </tr>`;
        }

        tableHtml += `
	    </tbody>
	</table>`;
        return tableHtml;
    }

    xmlToRunsheetList(xmlString) {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(xmlString, "text/xml");
        const tuples = xmlDoc.getElementsByTagName("TUPLE");
        let tableHtml = `
	<table class="table table-striped table-hover">
	    <thead class="table-dark">
	        <tr>
	            <th>RUN</th>
	            <th>ZONE</th>
	        </tr>
	    </thead>
	    <tbody>`;

        for (let tuple of tuples) {
            const refno = tuple.getElementsByTagName("REFNO")[0]?.textContent || '';
            const runnumber = tuple.getElementsByTagName("RUNNUMBER")[0]?.textContent || '';
            const descript = tuple.getElementsByTagName("DESCRIPT")[0]?.textContent || '';
            tableHtml += `
	        <tr onclick="runsheets.showRunsheetItems('${refno}')" style="cursor: pointer;">
	            <td>${runnumber}</td>
	            <td>${descript}</td>
	        </tr>`;
        }

        tableHtml += `
	    </tbody>
	</table>`;
        return tableHtml;
    }
};

document.addEventListener('PLUGIN_LOADED', function (ev) {
    // From src\www\js\scriptManagement.js
    if (ev.detail.instance.parent == 'Centaur_I_POD') {
        //const internalPOD = $T.getInstanceByName({name: 'InternalPOD'});
        window.runsheets = new InternalPOD_Runsheets(ev.detail.instance);
        ev.detail.instance.runsheets = runsheets;
        console.log('internalPOD.Runsheets plugin instantiated');
    }
});
