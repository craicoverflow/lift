#!/usr/bin/env ts-node

process.on('uncaughtException', e => {
  console.log(e)
})
process.on('unhandledRejection', (e, promise) => {
  console.log(String(e), String(promise))
})

/**
 * Dependencies
 */
import { Dictionary, GeneratorDefinitionWithPackage, HelpError, isError } from '@prisma/cli'
import { generatorDefinition as definition } from '@prisma/photon'
import { LiftCommand } from './cli/commands/LiftCommand'
import { LiftDown } from './cli/commands/LiftDown'
import { LiftSave } from './cli/commands/LiftSave'
import { LiftTmpPrepare } from './cli/commands/LiftTmpPrepare'
import { LiftUp } from './cli/commands/LiftUp'
import { LiftWatch } from './cli/commands/LiftWatch'
import { LiftPanic } from './LiftEngine'
import { handlePanic } from './utils/handlePanic'
const photon = {
  definition,
  packagePath: '@prisma/photon',
}

const predefinedGenerators: Dictionary<GeneratorDefinitionWithPackage> = {
  photon,
  photonjs: photon,
  javascript: photon,
  typescript: photon,
}

// const access = fs.createWriteStream('out.log')
// process.stdout.write = process.stderr.write = access.write.bind(access)

/**
 * Main function
 */
async function main(): Promise<number> {
  // create a new CLI with our subcommands
  const cli = LiftCommand.new({
    save: LiftSave.new(),
    up: LiftUp.new(),
    down: LiftDown.new(),
    dev: LiftWatch.new(predefinedGenerators),
    ['tmp-prepare']: LiftTmpPrepare.new(predefinedGenerators),
  })
  // parse the arguments
  const result = await cli.parse(process.argv.slice(2))
  if (result instanceof HelpError) {
    console.error(result)
    return 1
  } else if (isError(result)) {
    console.error(result)
    return 1
  }
  console.log(result)

  return 0
}
process.on('SIGINT', () => {
  process.exit(1) // now the "exit" event will fire
})

/**
 * Run our program
 */
main()
  .then(code => {
    if (code !== 0) {
      process.exit(code)
    }
  })
  .catch(err => {
    if (err.rustStack) {
      handlePanic(err, 'TEST', 'TEST')
    } else {
      // console.error(err)
      // process.exit(1)
    }
  })
