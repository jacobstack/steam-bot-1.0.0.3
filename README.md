# steam-bot-1.0.0.3 Install and setup

# 1. you must have your account verified with Steam Desktop Authenticator (SDA).
  - a version of this is included in the download, but an updated version can likely be found at [SDA Versions](https://github.com/Jessecar96/SteamDesktopAuthenticator/releases)

# 2. you must not encrypt the data in SDA until you have retrieved the sharedSecret and identitySecret keys.
  - retreive them from SDA-version/maFiles/'yoursteamID'.maFile
  - if this file is encrypted, decrypt it by clicking on 'Manage Encryption' on SDA.
  
# 3. Fill all of this information into the config.json file in /steam-bot-version/config.json
- the ownerID is only used if you want to send chat commands to the bot from a personal account, or if you want it to accept all of your trades.


    "accountName" : "",\
    "password" : "",\
    "sharedSecret" : "",\
    "identitySecret": "",\
    "ownerID": ""
    
