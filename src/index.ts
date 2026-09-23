import { app, command, console, t, zlib } from './shared/hostApi'
import { transform, type DataType } from './shared/lx2al'

const transformList = async () => {
  const [filePath] = await app.showOpenDialog({
    title: t('select_lx_list_file'),
    canSelectFiles: true,
    filters: {
      'LX Music list file': ['lxmc', 'json'],
    },
  })
  if (!filePath) return
  let fileContent: string | undefined
  if (filePath.endsWith('.lxmc')) {
    const fileData = await app.readOpenDialogFile(filePath, 'binary')
    fileContent = await zlib.gunzip(fileData, 'utf-8')
  } else fileContent = await app.readOpenDialogFile(filePath, 'utf-8')
  if (!fileContent) throw new Error('Failed to read file content')
  const transformedContent = await transform(JSON.parse(fileContent) as DataType)
  const savePath = await app.showSaveDialog({
    title: t('select_save_path'),
    defaultFileName: 'list.json',
    saveLabel: t('save'),
  })
  if (!savePath) return
  await app.writeSaveDialogFile(savePath, '', transformedContent)
  void app.showMessage(t('list_transformed_successfully'), { type: 'info' })
}
const init = async () => {
  await command.registerCommand('listTransform', async () => {
    try {
      await transformList()
    } catch (err) {
      console.log(err)
      void app.showMessage(t('failed_to_transform_list', { msg: (err as Error).message }), { type: 'error' })
    }
  })
}

void init()
