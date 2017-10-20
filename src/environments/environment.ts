// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyDH5K_hglU9PPN0ywNFs_ixRa9tS1DVU6M",
    authDomain: "onsnapshot.firebaseapp.com",
    databaseURL: "https://onsnapshot.firebaseio.com",
    projectId: "onsnapshot",
    storageBucket: "onsnapshot.appspot.com",
    messagingSenderId: "77554050853"
  }
};
