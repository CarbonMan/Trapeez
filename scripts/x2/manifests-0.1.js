X2.prototype.getActiveManifests = function(){
    this.login()
    .then((uuid)=>{
        let me = this;
        $.ajax({
            url: me.host + "/" + me.script + "/api/manifest/active", 
            type: 'GET',
            crossDomain: true,
            dataType: "json"
        })
        .done(function (rsp) {
            console.log(rsp);
        })
        .fail(function (jqXHR, textStatus, errorThrown) {
            me.to = setTimeout(()=>{
                me.getActiveManifests()
            }, 1000);
        });

    })
    .catch(e=>{
        console.error(e);
    });
}