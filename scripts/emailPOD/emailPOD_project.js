function EmailPODproject() {
  document.addEventListener('LOAD_PLUGIN_ACTIONS', function (ev) {
    // Attach a POD action onto the actions combobox
    ev.detail.actions.push({
      name: "EMAIL",
      value: "EmailPOD"
    });
  });

  /**
   * Called from emailTransfer allowing the addition of GPS data 
   * to an email
   * @param {Object} request 
   * @returns 
   */
  Category.prototype.msgBodyInject = function (request) {
    let res = '';
    if (request.gps){
        res = `Latitude : ${request.gps.latitude}
        Longitude: ${request.gps.longitude}`;
    }
    return res;
  };

  document.addEventListener('LOAD_PLUGIN_CATEGORIES', function (ev) {
    // Attach a POD action onto the actions combobox
    let cat = new Category({
      name: "POD",
      value: "POD"
    });
    cat.addLabel({
      id: "nameLabel",
      text: "NAME"
    })
    cat.addField({
      id: "name",
      outputAs: "Name"
    })
    ev.detail.categories.push(cat);

    cat = new Category({
      name: "DAMAGE",
      value: "DAMAGE",
      onSelected: () => {
        $("#sign").hide();
      },
      onRemoved: () => {
        $("#sign").show();
      }
    });
    cat.addLabel({
      id: "nameLabel",
      text: "NAME"
    })
    cat.addField({
      id: "name",
      outputAs: "Damage note"
    })
    ev.detail.categories.push(cat);
  });
}

document.addEventListener('EMAILPOD_READY', function (e) {
  console.log('Email POD project added');
  e.detail.project = new EmailPODproject();
}, false);
