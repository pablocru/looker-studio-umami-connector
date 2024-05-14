const fs = require('fs')

const jsonString = JSON.stringify({
  scriptId: process.env.APPS_SCRIPT_ID,
  rootDir: 'src'
})

fs.writeFileSync('.clasp.json', jsonString, 'utf-8')
