// scripts/x2/auth-0.1.js
X2.prototype.login = function () {
  return new Promise((resolve, reject) => {
    const me = this;

    if (me.uuid) {
      return resolve(me.uuid);           // already authenticated
    }
    if (!this.username || !this.password) {
      return reject('No credentials');
    }

    // --- Build XML payload --------------------------------------------------
    const xml = `<x>
                   <PARAM0>${this.username}</PARAM0>
                   <PARAM1>${this.password}</PARAM1>
                 </x>`;

    // --- Configure the advanced-http plugin ---------------------------------
    cordova.plugin.http.setDataSerializer('utf8');       // raw UTF-8 string
    const headers = { 'Content-Type': 'application/xml' };

    // --- Fire the POST ------------------------------------------------------
    cordova.plugin.http.post(
      `${me.url}.autologin`,
      xml,            // request body
      headers,
      (resp) => {     // success callback
        try {
          /* resp.data is a string – turn it into an XML document */
          const $r = $( $.parseXML(resp.data) );

          if (
            $r.children().length &&
            $r.children().first()[0].tagName.toLowerCase() === 'error'
          ) {
            return reject($r.children().first().children().first().text());
          }

          me.uuid = $r.attr('uuid') || $r.find('[uuid]').attr('uuid') || null;

          if (me.uuid) {
            me.$div && $('#sessionStatus').text('Connected');
            return resolve(me.uuid);
          }

          me.$div && $('#sessionStatus').text('Login failed');
          reject('Invalid login');
        } catch (err) {
          reject(`Parser error: ${err.message}`);
        }
      },
      (err) => {       // error callback
        console.log('Error during login', err);
        reject(err);
      }
    );
  });
};

// X2.prototype.login = function () {
    // return new Promise((resolve, reject) => {
        // let me = this;
        // if (me.uuid) {
            // resolve(me.uuid);
            // return;
        // }
        // if (!this.username || !this.password){
            // reject('No credentials');
        // }
        // var str = "<x>" +
            // "<PARAM0>" + this.username +
            // "</PARAM0>" +
            // "<PARAM1>" + this.password +
            // "</PARAM1></x>";
        // $.ajax({
            // url: me.url + ".autologin",
            // type: "POST",
            // data: str,
            // crossDomain: true,
            // dataType: "xml",
            // contentType: "application/xml"
        // })
            // .done(function (result) {
                // let $r = $(result);
                // if ($r.children.length && $r.children(0).prop("tagName").toLowerCase() == 'error') {
                    // reject($r.children(0).children(0).html());
                // } else {
                    // me.uuid = $r.attr("uuid");
                // }
                // if (!me.uuid)
                    // me.uuid = $r.find("[uuid]").attr("uuid");
                // if (me.uuid) {
                    // console.log('Log in successful');
                    // if (me.$div) {
                        // $("#sessionStatus").html("Connected");
                    // }
                    // resolve(me.uuid);
                // } else {
                    // if (me.$div) {
                        // $("#sessionStatus").html("Login failed");
                    // }
                    // reject("Invalid login");
                // }
            // })
            // .fail(function (jqXHR, textStatus, errorThrown) {
                // console.log("Error during login");
                // reject(jqXHR);
            // });
    // });
// }
