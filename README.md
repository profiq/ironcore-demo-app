App for testing IronCore encryption technology

## Setting up APP
 Make sure you have Yarn installed
 Install dependencies
 ```
 yarn
 ```
 Start react app
 ```
 yarn start
 ```
Start Electron app
```
yarn electron
```


## Setting up IronCore SDK
Head to [IronCoreLabs](https://admin.ironcorelabs.com/login)
, login with GitHub account and create new project using 'Add Service Key'

Make sure you overwrite file 'ironcore-config.json' with your keys and IDs

Format of variables in config:
```
{
  "projectId": ???,
  "segmentId": "???",
  "serviceKeyId": ???,
  "privateKey": "-----BEGIN EC PRIVATE KEY-----\n???\n???\n-----END EC PRIVATE KEY-----"
}
```
## First login
Account for any user is automatically created by logging in with new username and new password