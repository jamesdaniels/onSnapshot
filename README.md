# onSnapshot

A sample AngularFire app!

[![Extend Firebase to the Web #firebasesummit](https://img.youtube.com/vi/puUqJTJVz5A/0.jpg)](https://www.youtube.com/watch?v=puUqJTJVz5A)

FYI there's a flicker right now, when it switches over from server to client side. I'm fixing that.

# Run it locally

```bash
cd angular
yarn
yarn start
```

# Deploy it on AppEngine Flex

```bash
cd angular
yarn
yarn build:flex
cd ../appengine
gcloud app deploy
```

See it in action here http://onsnapshot-flex.appspot.com/

# Deploy it on Firebase Hosting + Cloud Functions

__This is unfourtunately broken right now, there's a Zone.js problem that we're hunting down.__

```bash
cd angular
yarn
yarn build:firebase
cd ../functions
firebase deploy
```

See it in action here https://onsnapshot.com/
