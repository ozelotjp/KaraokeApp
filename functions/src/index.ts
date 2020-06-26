import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

admin.initializeApp(functions.config().firebase)

const func = {
  getSongDetails: './getSongDetails'
} as { [functionName: string]: string }

for (const name in func) {
  if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === name) {
    exports[name] = require(func[name])
  }
}
