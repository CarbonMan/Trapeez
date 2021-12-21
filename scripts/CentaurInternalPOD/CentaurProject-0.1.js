function CentaurProject(){
  document.addEventListener('LOAD_PLUGIN_ACTIONS', function (ev) {
    // Attach a POD action onto the actions combobox
    ev.detail.push({
      name: "POD",
      value: "DROP"
    });
  });
}

document.addEventListener('CENTAUR_POD_READY', function (e) {
  e.detail.project = new CentaurProject();
}, false);
