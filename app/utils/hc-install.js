import cmd from 'node-cmd'

// Use to install the app fro mthe .hcadmin/holochain-download/<AppName>
export const hcJoin = (appName) => {
  console.log("Running : 'hcamdmin join'");
  cmd.get(
    `hcadmin join ~/.hcadmin/holochain-download/` + appName + ' ' + appName,
    function(err, data, stderr) {
      if (!err) {
        console.log('Succesfully Installed', data)
        // TODO: Refresh the electron page
      } else {
        console.log('error', err)
      }
    }
  );

  // cmd.run(`hcadmin join ~/.hcadmin/holochain-download/` + appName + ' ' + appName);

}

// Use to start the app
export const hcStart = (appName, portNumber) => {
  console.log("Running : hcd");
  // cmd.get(
  //   `hcd ` + appName + ' ' + portNumber,
  //   function(err, data, stderr) {
  //     if (!err) {
  //       console.log('Succesfully Started', data)
  //       // TODO: Update the port tracker file
  //     } else {
  //       console.log('error', err)
  //     }
  //   }
  // );

  cmd.run(`hcd ` + appName + ' ' + portNumber);
  // TODO: Update the port tracker file
  // TODO: Refresh the App page
}
