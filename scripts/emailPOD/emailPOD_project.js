function EmailPODproject(){
    document.addEventListener('LOAD_PLUGIN_ACTIONS', function (ev) {
      // Attach a POD action onto the actions combobox
      ev.detail.actions.push({
        name: "EMAIL POD",
        value: "EmailPOD"
      });
    });
  }
  
  document.addEventListener('EMAILPOD_READY', function (e) {
    console.log('Email POD project added');
    e.detail.project = new EmailPODproject();
  }, false);
  