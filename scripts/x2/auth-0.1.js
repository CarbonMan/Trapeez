X2.prototype.login = function () {
    return new Promise((resolve, reject) => {
        let me = this;
        if (me.x2State.uuid) {
            resolve(me.x2State.uuid);
            return;
        }
        if (!this.username || !this.password){
            reject('No credentials');
        }
        var str = "<x>" +
            "<PARAM0>" + this.username +
            "</PARAM0>" +
            "<PARAM1>" + this.password +
            "</PARAM1></x>";
        $.ajax({
            url: me.x2State.url + ".autologin",
            type: "POST",
            data: str,
            crossDomain: true,
            dataType: "xml",
            contentType: "application/xml"
        })
            .done(function (result) {
                let $r = $(result);
                if ($r.children.length && $r.children(0).prop("tagName").toLowerCase() == 'error') {
                    reject($r.children(0).children(0).html());
                } else {
                    me.x2State.uuid = $r.attr("uuid");
                }
                if (!me.x2State.uuid)
                    me.x2State.uuid = $r.find("[uuid]").attr("uuid");
                if (me.x2State.uuid) {
                    console.log('Log in successful');
                    if (me.$div) {
                        $("#sessionStatus").html("Connected");
                    }
                    resolve(me.x2State.uuid);
                } else {
                    if (me.$div) {
                        $("#sessionStatus").html("Login failed");
                    }
                    reject("Invalid login");
                }
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                console.log("Error during login");
                reject(jqXHR);
            });
    });
}
