import { parse } from 'csv-parse/sync';
import * as fs from 'fs';

const data = fs.readFileSync(process.argv[2]);
const result = parse(data, {delimiter: '\t', relaxQuotes: true})

const json = result.map(row => {
    return {
        original: row[0],
        target: row[1],
        canTarget: row[10] !== "DICTIONARY ONLY"
    };
});

process.stdout.write(JSON.stringify(json, null, 4));