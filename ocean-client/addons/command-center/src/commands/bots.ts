import { getBorderCharacters, table, TableUserConfig } from 'table'
import { AvailableBots, Bot, BotData } from '../utils/available-bot'
import { Store } from '../utils/store'
import { Telegram } from '../utils/telegram'
import { VersionCheck } from '../utils/version-check'
import { Command } from './command'

const compatible = '\u{2705}'
const notCompatible = '\u{274C}'

const config: TableUserConfig = {
  border: getBorderCharacters('ramac'),
  columns: [{ alignment: 'left' }, { alignment: 'center' }, { alignment: 'center' }, { alignment: 'center' }],
}

export class Bots extends Command {
  private readonly versionCheck: VersionCheck

  constructor(
    telegram: Telegram,
    store: Store,
    availableBots: AvailableBots,
    commandData: string[],
    versionCheck: VersionCheck,
  ) {
    super(telegram, store, availableBots, commandData)
    this.versionCheck = versionCheck
  }

  static descriptionFor(): string {
    return 'Sends you a list of installed bots with version, compatibility check and last execution block'
  }

  listOfBots(): string {
    const data: string[][] = []
    data.push(['bot', 'version', 'block'])
    this.availableBots.list().forEach((info) => {
      data.push(this.rowFor(info[0], info[1]))
    })

    return '```' + table(data, config) + '```'
  }

  availableFor(): Bot[] {
    return []
  }

  isBasicCommand(): boolean {
    return true
  }

  doExecution(): Promise<unknown> {
    return this.telegram.send('\n' + this.listOfBots())
  }

  private rowFor(bot: Bot, data: BotData): string[] {
    const versionAndCompatibility =
      data.version + ' ' + (this.versionCheck.isCompatibleWith(bot) ? compatible : notCompatible)
    return [data.name, versionAndCompatibility, '' + data.lastBlock]
  }
}
