import jsonschema from 'jsonschema';
import fs from 'fs'

const v = new jsonschema.Validator()

/*
const schema = {
    "id" : "/simpleShema",
    "type" : "object",
    "properties" : {
        "name": { "type" : "string" },
        "age" : { "type" : "number", "enum": [5, 10] }
    },
    "required" : ["name", "age"]
}
*/

const toast = {
    "name" : "aa",
    "connection" : { },
    "data" : { }
}

const rawData = fs.readFileSync('schema.json');
const schema = JSON.parse(rawData);

console.log(v.validate(toast, schema));