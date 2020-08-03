import jsonschema from 'jsonschema';
import fs from 'fs'



const main = () => {
    const v = new jsonschema.Validator()

    const rawSchema = fs.readFileSync('schema.json');
    const schema = JSON.parse(rawSchema);

    const rawDissector = fs.readFileSync('dissector.json');
    const dissector = JSON.parse(rawDissector);

    const validationResult = v.validate(dissector, schema);
    // console.log(validationResult.errors.length);

    const rawCodeTemplate = fs.readFileSync('code_template');
    const codeTemplate = rawCodeTemplate.toString();

    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    const projectName = "WiresharkDissectorGenerator";

    let res = codeTemplate.split("%PROJECT_NAME%").join(projectName);
    res = res.split("%PROTOCOL_NAME%").join(dissector.name);
    res = res.split("%DATE%").join((new Date()).toLocaleDateString('fr-FR', options));


    let fieldDeclarationBuffer = "";
    let fieldListBuffer = "";
    let localVariableDeclarationBuffer = "";
    let subtreePopulationBuffer = "";

    for (const element of dissector.data) {
        const full_filter = `${dissector.name}.${element.filter}`;
        fieldDeclarationBuffer += `${element.filter}=ProtoField.${element.type}("${full_filter}", "${element.short_description}", base.${element.base})\n`

        fieldListBuffer += `\t${element.filter},\n`

        localVariableDeclarationBuffer += `local ${element.filter} = buffer(${element.offset}, ${element.size})\n`

        subtreePopulationBuffer += `\tsubtree:add(${element.filter}, ${element.name})\n`
    }

    let portsBuffer = "";

    for (const element of dissector.connection.ports) {
        portsBuffer += `${dissector.connection.protocol}_port:add(${element}, ${dissector.name})\n`
    }

    // local udp_port = DissectorTable.get("udp.port")
    // udp_port:add(8888, myprotocol)

    // local %PROTOCOL%_port = DissectorTable.get("%PROTOCOL%.port")
    // %PORTS%

    // local sequence_counter = buffer(0,4)

    // subtree:add(sequence_counter_field, sequence_counter)
    //                FILTER                   NAME

    // sequence_counter_field=ProtoField.uint32("myprotocol.sequence_counter_field","Sequence Counter",base.DEC)
    // const buffer = `${dissector.data[0].filter}=ProtoField.${dissector.data[0].type}("${dissector.data[0].name}${dissector.data[0].filter}", "${dissector.data[0].short_description}", base.${dissector.data[0].base})`
    console.log(fieldDeclarationBuffer);
    console.log(fieldListBuffer);
    console.log(localVariableDeclarationBuffer);
    console.log(subtreePopulationBuffer);
    console.log(portsBuffer);
    // res = res.split("%FIELDS_DECLARATION%").join(buffer);
    // console.log(res);
}

main();


