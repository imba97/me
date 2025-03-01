import { spawn } from 'node:child_process'
import process from 'node:process'

const child = spawn('npx', ['nuxi', 'build'], {
  env: process.env
})

const successCondition = [
  'npx nuxthub deploy',
  'node .output/server/index.mjs'
]

child.stdout.on('data', (data) => {
  process.stdout.write(data)

  if (!successCondition.some(condition => data.toString().includes(condition))) {
    return
  }

  console.log('Build Success')

  setTimeout(() => {
    process.exit(0)
  }, 3000)
})
