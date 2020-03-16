const { google } = require('googleapis')
const credentials = require('./credentials.json')
const GROUP_SCOPE = [
  'https://www.googleapis.com/auth/admin.directory.group'
];

const clientOptions = 'admin@connectcollaborative.com'

const jwt = new google.auth.JWT(
  credentials.client_email,
  null,
  credentials.private_key,
  GROUP_SCOPE,
  clientOptions
);

const userEmail = 'fellow-collaborators@connectcollaborative-195402.iam.gserviceaccount.com';

/**
 * Authorised JWT
 */

jwt.authorize(async (err, response) => {
  if (err) { throw err; }
  console.log("You have been successfully authenticated: ");
  // ggrun(jwt);
  const googlegroupsResult = await ggrun(jwt);
  console.log('googlegroupsResult: ', googlegroupsResult);
});

// interact with google groups
async function ggrun(cl) {
  // auth and get groups directory
  var googleGroups = google.admin({version: "directory_v1", auth: cl});
  try {

    const isFound = await checkIfUserExist(userEmail);
    console.log('isFound: ', isFound.data);
    if (isFound.status === 200) {
      console.log('isDeleted');
      return await deleteOldGroupemail(userEmail);
    }

    return await createGoogleGroupUser(userEmail);
  } catch (error) {
    return error;
  }
  /**
   * Get Google Groups Users
   */

  async function checkIfUserExist(userKey) {
    const options = {
      groupKey: 'active-on-nbs@connectcollaborative.com',
      memberKey: userKey
    }

    try {
      return await googleGroups.members.get(options);
    } catch( error ) {
      return error;
    }
  }

  async function deleteOldGroupemail(userKey) {
    const options = {
      groupKey: 'active-on-nbs@connectcollaborative.com',
      memberKey: userKey
    }

    try {
      return await googleGroups.members.delete(options);
    } catch( error ) {
      return error;
    }
  }

  async function createGoogleGroupUser(userKey) {
    const options = {
      groupKey: 'active-on-nbs@connectcollaborative.com',
      requestBody: {
        email: userKey
      }
    }

    try {
      return await googleGroups.members.insert(options);
    } catch( error ) {
      return error;
    }
  }
}