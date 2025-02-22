import { arg, Command, Dictionary, format, GeneratorDefinitionWithPackage, HelpError } from '@prisma/cli'
import chalk from 'chalk'
import { Lift } from '../../Lift'
import { occupyPath } from '../../utils/occupyPath'

/**
 * $ prisma migrate new
 */
export class LiftTmpPrepare implements Command {
  public static new(generators: Dictionary<GeneratorDefinitionWithPackage>): LiftTmpPrepare {
    return new LiftTmpPrepare(generators)
  }

  // static help template
  private static help = format(`
    Watch local changes and migrate automatically

    ${chalk.bold('Usage')}

      prisma dev
  `)
  private constructor(private readonly generators: Dictionary<GeneratorDefinitionWithPackage>) {}

  // parse arguments
  public async parse(argv: string[]): Promise<string | Error> {
    await occupyPath(process.cwd())

    const lift = new Lift()
    await lift.watchUp({
      generatorDefinitions: this.generators,
    })

    lift.stop()

    console.log('Done executing tmp prepare')
    process.exit(0)

    return ''
  }

  // help message
  public help(error?: string): string | HelpError {
    if (error) {
      return new HelpError(`\n${chalk.bold.red(`!`)} ${error}\n${LiftTmpPrepare.help}`)
    }
    return LiftTmpPrepare.help
  }
}
