export type IGetSongDetailsInput = {
  type: 'dam' | 'joysound'
  code: string
}

export type IGetSongDetailsOutput = {
  id: string
  song: string
  artist: string
}
