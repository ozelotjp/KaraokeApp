const func = {
} as { [functionName: string]: string }

for (const name in func) {
  if (!process.env.FUNCTION_NAME || process.env.FUNCTION_NAME === name) {
    exports[name] = require(func[name])
  }
}
