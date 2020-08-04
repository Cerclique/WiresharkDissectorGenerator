import jsonschema from 'jsonschema';
import fs from 'fs'



const main = (rawSchemaPath, rawDissectorPath) => {
    
    const rawSchema = fs.readFileSync(rawSchemaPath, err => {
        throw(err);
    });
    const schema = JSON.parse(rawSchema);

    const rawDissector = fs.readFileSync(rawDissectorPath, err => {
        throw(err);
    });
    const dissector = JSON.parse(rawDissector);

    
    const v = new jsonschema.Validator()
    const validationResult = v.validate(dissector, schema);
    if (validationResult.errors.length > 0) {
        console.error(validationResult.errors);
    }

    const rawCodeTemplate = fs.readFileSync('code_template');
    const codeTemplate = rawCodeTemplate.toString();

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const projectName = "WiresharkDissectorGenerator";

    // * %PROJECT_NAME%
    let outputBuffer = codeTemplate.split("%PROJECT_NAME%").join(projectName);

    // * %PROTOCOL_NAME%
    outputBuffer = outputBuffer.split("%PROTOCOL_NAME%").join(dissector.name);

    // * %DATE%
    outputBuffer = outputBuffer.split("%DATE%").join((new Date()).toLocaleDateString('fr-FR', options));


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

    // * Write to output file
    const outputFilename = `dissector_${dissector.name}.lua`;
    fs.writeFileSync(outputFilename, outputBuffer, err => {
        throw(err);
    });
}

const cmdLineArguments = process.argv.slice(2);
const rawSchemaPath = cmdLineArguments[0];
const rawDissectorPath = cmdLineArguments[1];

main(rawSchemaPath, rawDissectorPath);


