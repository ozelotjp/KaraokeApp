import firebase from 'firebase'

export type HasId = { id: string }

/**
 * /songs/{songId}
 */
export type ISong = {
  song?: string
  artist?: string
  code: {
    dam?: string
    joysound?: string
  }
}
