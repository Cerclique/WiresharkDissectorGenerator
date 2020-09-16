# WiresharkDissectorGenerator

## Introduction
This tool generate for you a dissector plugin for Wireshark based on a JSON description of the packet you want to analyze.
Once generated, you just have import the LUA plugin into Wireshark and let the magic begin !  

This work is inspired from [nocommentlab](https://github.com/nocommentlab) tool : [WDissectorGen](https://github.com/nocommentlab/WDissectorGen)

## Dependencies
- [jsonschema](https://www.npmjs.com/package/jsonschema) : Use to validate your JSON plugin against a generic JSON schema.
- [minimist](https://www.npmjs.com/package/minimist) : Parse arguments provided to the application.

## Installation && Usage
- Close the repository
- Run `yarn` to download dependencies
- Run the application :
    - `node index.json --schema <PATH_TO_SCHEMA> --dissector <PATH_TO_DISSECTOR> --output <OUTPUT_LUA_PATH>`

About the argument :
- **schema** : Path to the generic JSON schema file use to validate custom plugin. By default, the file used is `schema.json` provided with the application.
- **dissector** : Path to the custom JSON description of the packet. You can find `exemple_dissector.json` as an exemple and default argument to run test. 
- **output** : Path to the generated LUA plugin file. By default, the file is named `dissector.lua`
