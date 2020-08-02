import jsonschema from 'jsonschema';

const v = new jsonschema.Validator()

const schema = {
    "id" : "/simpleShema",
    "type" : "object",
    "properties" : {
        "name": { "type" : "string" },
        "age" : { "type" : "number", "enum": [5, 10] }
    },
    "required" : ["name", "age"]
}

const toast = {
    "name" : "aa",
    "age" : "12"
}

console.log(v.validate(toast, schema));