import jsonschema from 'jsonschema';
import fs from 'fs';
import minimist from 'minimist';

/**  CONSTANTS **/

const projectName = "WiresharkDissectorGenerator";

const dateOptions = { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
};

const timeOptions = { 
    hour12: false
}

const defaultArgument = {
    dissector : "example_dissector.json",
    schema : "schema.json",
    output : "dissector.lua"
}

const rawTemplatePath = './code_template';

/** FUNCTIONS **/

const FileRawtoJson = (filePath) => {
    const rawFile = fs.readFileSync(filePath, err => {
        throw (err);
    });

    return JSON.parse(rawFile);
}

const ValidateDissectorFromSchema = (schema, dissector) => {
    var isDissectorValid = true;

    const validator = new jsonschema.Validator()
    const validationResult = validator.validate(dissector, schema);
    
    if (validationResult.errors.length > 0) {
        console.error(validationResult.errors);
        isDissectorValid = false;
    }

    return  isDissectorValid;
}

const LoadRawTemplate = (filePath) => {
    const rawCodeTemplate = fs.readFileSync(filePath, err => {
        throw (err);
    });
    
    return rawCodeTemplate.toString();
}

const GenerateDissectorFile = (rawTemplateBuffer, dissector) => {

    // * %PROJECT_NAME%
    let outputBuffer = rawTemplateBuffer.split("%PROJECT_NAME%").join(projectName);

    // * %PROTOCOL_NAME%
    outputBuffer = outputBuffer.split("%PROTOCOL_NAME%").join(dissector.name);

    // * %DATE%
    const currentDate = new Date();
    const dateBuffer = `${currentDate.toLocaleDateString([], dateOptions)} ${currentDate.toLocaleTimeString([], timeOptions)}`;
    outputBuffer = outputBuffer.split("%DATE%").join(dateBuffer);

    /* 
        * %FIELDS_DECLARATION%
        * %FIELDS_LIST%
        * %LOCAL_VAR_DECLARATION%
        * %SUBTREE_POPULATION%
    */
    let fieldDeclarationBuffer = "";
    let fieldListBuffer = "";
    let localVariableDeclarationBuffer = "";
    let subtreePopulationBuffer = "";

    for (const element of dissector.data) {
        const full_filter = `${dissector.name}.${element.filter}`;
        fieldDeclarationBuffer += `${element.filter}=ProtoField.${element.type}("${full_filter}", "${element.short_description}", base.${element.base})\n`
        fieldListBuffer += `${element.filter},\n\t`
        localVariableDeclarationBuffer += `local ${element.filter} = buffer(${element.offset}, ${element.size})\n\t`
        subtreePopulationBuffer += `subtree:add(${element.filter}, ${element.name})\n\t`
    }

    /** This is just to make the final file pretty  **/
    fieldDeclarationBuffer = fieldDeclarationBuffer.slice(0, fieldDeclarationBuffer.length - 1);
    fieldListBuffer = fieldListBuffer.slice(0, fieldListBuffer.length - 2);
    localVariableDeclarationBuffer = localVariableDeclarationBuffer.slice(0, localVariableDeclarationBuffer.length - 2);

    outputBuffer = outputBuffer.split("%FIELDS_LIST%").join(fieldListBuffer);
    outputBuffer = outputBuffer.split("%FIELDS_DECLARATION%").join(fieldDeclarationBuffer);
    outputBuffer = outputBuffer.split("%LOCAL_VAR_DECLARATION%").join(localVariableDeclarationBuffer);
    outputBuffer = outputBuffer.split("%SUBTREE_POPULATION%").join(subtreePopulationBuffer);

    
    // * %PROTOCOL%
    outputBuffer = outputBuffer.split("%PROTOCOL%").join(dissector.connection.protocol);

    // * %PORTS%
    let portsBuffer = "";

    for (const element of dissector.connection.ports) {
        portsBuffer += `${dissector.connection.protocol}_port:add(${element}, ${dissector.name})\n`
    }

    outputBuffer = outputBuffer.split("%PORTS%").join(portsBuffer);

    return outputBuffer;
}

const bufferToFile = (outputBuffer, filePath) => {
    fs.writeFileSync(filePath, outputBuffer, err => {
        throw(err);
    });
}

const WiresharkDissectorGenerator = (args) => {
    const schemaJSON = FileRawtoJson(args.schema);
    const dissectorJSON = FileRawtoJson(args.dissector);

    const isDataValid = ValidateDissectorFromSchema(schemaJSON, dissectorJSON);

    if (isDataValid === false)
        return;

    const rawTemplateBuffer = LoadRawTemplate(rawTemplatePath);

    const outputBuffer = GenerateDissectorFile(rawTemplateBuffer, dissectorJSON);

    bufferToFile(outputBuffer, args.output);
}

/** MAIN **/

const argsObject = minimist(process.argv.slice(2), { default : defaultArgument });

WiresharkDissectorGenerator(argsObject);