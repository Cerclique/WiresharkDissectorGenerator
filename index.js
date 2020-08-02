import jsonschema from 'jsonschema';
import fs from 'fs'

const v = new jsonschema.Validator()

const rawSchema = fs.readFileSync('schema.json');
const schema = JSON.parse(rawSchema);

const rawDissector = fs.readFileSync('dissector.json');
const dissector = JSON.parse(rawDissector);

const validationResult = v.validate(dissector, schema);
console.log(validationResult.errors.length);
/*
const rawCodeTemplate = fs.readFileSync('code_template');
const codeTemlate = rawCodeTemplate.toString();

const res = codeTemlate.split("%PROTOCOL_NAME%").join(dissector.name);

console.log(res);
*/