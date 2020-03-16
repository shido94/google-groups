const { google } = require('googleapis')
const credentials = require(`./credentials.json`)
const SPREADSHEET_ID = `1E6EX07JokjlRy1QlMCQQq15glSZdfokBeuyQKOHE0BI`;

const SCOPE = ['https://www.googleapis.com/auth/spreadsheets'];
const positionIndex = {
    start: 'A',
    end: 'N'
};

const USER_ENTERED = 'USER_ENTERED';
const newEvent = {
    'User Id': 1,
    'Builders Email': 'rupesh@infoxen.com',
    'First Name': 'Rupesh',
    'Last Name': 'Yadav',
    'Cancelled': 'On-trial',
    'Coach Id': '808',
    'Coach Email': 'rupesh@gmail.com',
    'Joined Date': '03/12/2019 7:08:11',
    'Exclude/Include/Automatic on Email CCs': '',
    'They (if Active) + their Active Upteam': 'rupesh@forwardmatter.com',
    'Coach Name': 'Rupesh Yadav',
    'Email Address': 'rupesh@forwardmatter.com',
    'Scheduled Date': '12/03/2019 00:00:00',
    'Mail Merge Status': 'MAIL SENT 03-Dec-19 5:45 PM'
}

const client = new google.auth.JWT(
    credentials.client_email,
    null,
    credentials.private_key,
    SCOPE
);
client.authorize((err, tokens) => {
    if (err) {
        console.log(err);
        return;
    }
    console.log('connected');
    gsrun(client);
});
async function gsrun(cl) {
    const gsapi = google.sheets({ version: 'v4', auth: cl });
    try {
        const data = await getSheetRecord(SPREADSHEET_ID);

        const found = data.data.values.find(value => value[1] === newEvent['Builders Email']);
        if (found) {
            return await updateRecord(data.data.values, newEvent)
        }
        return await insertNewEvent(data.data.values, newEvent);
    } catch (error) {
        console.log(error);
    }
    
    /**
     * get the sheet
     */
    async function getSheetRecord(sheetId) {
        const opt = {
            spreadsheetId: sheetId,
            range: `${positionIndex.start}:${positionIndex.end}`
        }
        return await gsapi.spreadsheets.values.get(opt);
    }

    /**
     * update in sheet
     */
    async function updateRecord(record, event) {
        const newEvent = [];
        record[0].map(keys => {
            newEvent.push(event[keys]);
        });

        const valueToupdate = record.map((value) => {
            if (value[1] === newEvent[1]) {
                value = newEvent;
            }
            return value;
        });

        const updateResponse = {
            spreadsheetId: SPREADSHEET_ID,
            range: `${positionIndex.start}1:${positionIndex.end}`,
            valueInputOption: USER_ENTERED,
            resource: { values: valueToupdate }
        }
        return await gsapi.spreadsheets.values.update(updateResponse);
    }

    /**
     * Insert in sheet
     */
    async function insertNewEvent(record, event) {

        const newEvent = [];
        record[0].map(keys => {
            newEvent.push(event[keys]);
        });

        const valueToInsert = [newEvent];
        const insertResponse = {
            spreadsheetId: SPREADSHEET_ID,
            range: `${positionIndex.start}${record.length}:${positionIndex.end}${record.length}`,
            valueInputOption: USER_ENTERED,
            resource: { values: valueToInsert }
        }
        return await gsapi.spreadsheets.values.append(insertResponse);
    }
}