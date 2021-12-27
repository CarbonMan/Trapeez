function TitanProject(){
  document.addEventListener('LOAD_PLUGIN_ACTIONS', function (ev) {
    // Attach a POD action onto the actions combobox
    ev.detail.push({
      name: "MANIFEST NOTES",
      value: "MANIFESTNOTES"
    });
  });
}

document.addEventListener('TITAN_TMS_READY', function (e) {
  console.log('Titan TMS project added');
  e.detail.project = new TitanProject();
}, false);
