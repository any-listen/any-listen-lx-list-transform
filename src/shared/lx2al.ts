/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { t } from './hostApi'

const listData: AnyListen_API.ListDataFull = {
  defaultList: {
    id: 'default',
    name: 'default',
    type: 'default',
    meta: {
      playCount: 0,
      createTime: Date.now(),
      updateTime: 0,
      posTime: 0,
      songCount: 0,
      pic: '',
      desc: '',
    },
    parentId: null,
    list: [],
  },
  loveList: {
    id: 'love',
    name: 'love',
    type: 'default',
    meta: {
      playCount: 0,
      createTime: Date.now(),
      updateTime: 0,
      posTime: 0,
      songCount: 0,
      pic: '',
      desc: '',
    },
    parentId: null,
    list: [],
  },
  userList: [],
}
const buildBackupData = (data: unknown) => {
  return {
    songlist: {
      version: 1,
      data,
    },
  }
}
type GeneralUserListItem = Extract<AnyListen_API.ListDataFull['userList'][number], { type: 'general' }>
const userList: GeneralUserListItem = {
  id: 'yqam636u7sc',
  name: '收藏',
  type: 'general',
  meta: {
    createTime: Date.now(),
    desc: '',
    playCount: 0,
    posTime: 0,
    updateTime: Date.now(),
    songCount: 0,
    pic: '',
  },
  parentId: null,
  list: [],
}
const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).slice(2)
}
const filterMusicList = (list: ListData['list']) => {
  const ids = new Set()
  return list.filter((s) => {
    if (!s.id || ids.has(s.id) || !s.name) return false
    s.singer ??= ''
    ids.add(s.id)
    return true
  })
}
const fixNewMusicInfoQuality = (musicInfo: Record<string, any>) => {
  if (musicInfo.source == 'local') return musicInfo

  if (musicInfo.meta._qualitys.flac32bit && !musicInfo.meta._qualitys.flac24bit) {
    musicInfo.meta._qualitys.flac24bit = musicInfo.meta._qualitys.flac32bit
    delete musicInfo.meta._qualitys.flac32bit

    musicInfo.meta.qualitys = musicInfo.meta.qualitys.map((quality: Record<string, any>) => {
      if (quality.type == 'flac32bit') quality.type = 'flac24bit'
      return quality
    })
  }

  return musicInfo
}
const buildQualitys = (lx: Record<string, Record<string, any>>) => {
  return Object.entries(lx).reduce((acc: Record<string, Record<string, any>>, [key, { size, ...arg }]) => {
    acc[key] = {
      ...arg,
      sizeStr: size,
    }
    return acc
  }, {})
}
const buildMusicInfo = (lx: Record<string, any>) => {
  if (lx.source === 'local') {
    return {
      id: lx.id,
      name: lx.name,
      singer: lx.singer,
      isLocal: true,
      interval: lx.interval,
      meta: {
        albumName: lx.meta.albumName || '',
        musicId: lx.id,
        createTime: 0,
        posTime: 0,
        updateTime: 0,
        sizeStr: '',
        picUrl: lx.meta.picUrl || '',
        bitrateLabel: '',
        deviceId: '',
        ext: lx.meta.ext || '',
        filePath: lx.meta.filePath || '',
      },
    }
  }
  const { qualitys, _qualitys, ...data } = lx.meta
  const info = {
    id: lx.id,
    name: lx.name,
    singer: lx.singer,
    isLocal: false,
    interval: lx.interval,
    meta: {
      ...data,
      source: lx.source,
      musicId: String(lx.meta.id || lx.meta.songId),
      qualitys: buildQualitys(_qualitys as Record<string, Record<string, any>>),
      createTime: 0,
      posTime: 0,
      updateTime: 0,
    },
  }
  if (lx.meta.songId) {
    info.meta.musicId = String(lx.meta.songId)
  }
  if (lx.meta.id) {
    info.meta.songId = String(lx.meta.id)
  }
  return info
}
const buildUserList = (list: ListData): AnyListen_API.ListDataFull['userList'][number] => {
  if (list.sourceListId) {
    const sourceId = list.sourceListId as string
    const isBoard = sourceId.startsWith('board__')
    const newList: AnyListen_API.ListDataFull['userList'][number] = {
      id: generateId(),
      name: list.name as string,
      type: 'online',
      parentId: null,
      meta: {
        ...userList.meta,
        extensionId: 'online-metadata',
        source: list.source as string,
        sourceType: isBoard ? 'topSongs' : 'songlist',
        pic: '',
        syncId: isBoard ? sourceId.replace(`board__${list.source as string}__`, '') : sourceId,
        syncTime: 0,
      },
      list: filterMusicList(list.list).map((musicInfo) => buildMusicInfo(fixNewMusicInfoQuality(musicInfo))),
    }
    if (isBoard) (newList.meta as Record<string, any>).date = ''
    newList.meta.songCount = newList.list.length

    return newList
  }

  const newList: GeneralUserListItem = {
    id: generateId(),
    name: list.name as string,
    type: 'general',
    parentId: null,
    meta: {
      ...userList.meta,
    },
    list: filterMusicList(list.list).map((musicInfo) => buildMusicInfo(fixNewMusicInfoQuality(musicInfo))),
  }
  newList.meta.songCount = newList.list.length

  return newList
}

const buildPlayList = (data: ListData[]) => {
  const defaultList = filterMusicList(data.shift()!.list)
  const loveList = filterMusicList(data.shift()!.list)
  listData.defaultList.list = defaultList.map((musicInfo) => buildMusicInfo(fixNewMusicInfoQuality(musicInfo)))
  listData.defaultList.meta.songCount = listData.defaultList.list.length
  listData.loveList.list = loveList.map((musicInfo) => buildMusicInfo(fixNewMusicInfoQuality(musicInfo)))
  listData.loveList.meta.songCount = listData.loveList.list.length
  listData.userList = data.map(buildUserList)

  return buildBackupData(listData)
}
const buildListPart = (data: ListData) => {
  return buildBackupData({
    userList: [buildUserList(data)],
  })
}

interface ListData {
  list: Array<{
    id: string
    [key: string]: unknown
  }>
  [key: string]: unknown
}

export type DataType =
  | {
      type: 'playList_v2'
      data: ListData[]
    }
  | {
      type: 'playListPart_v2'
      data: ListData
    }
  | {
      type: 'allData_v2'
      playList: ListData[]
    }
  | {
      type: 'unsupported'
    }
export const transform = async (data: DataType) => {
  switch (data.type) {
    case 'playList_v2':
      return JSON.stringify(buildPlayList(data.data))
    case 'allData_v2':
      return JSON.stringify(buildPlayList(data.playList))
    case 'playListPart_v2':
      return JSON.stringify(buildListPart(data.data))
    default:
      throw new Error(t('unsupported_file_type'))
  }
}
