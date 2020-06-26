import firebase from 'firebase'

export type HasId = { id: string }

/**
 * /users/{userId}
 */
export type IUser = {
  name?: string
}

/**
 * /users/{userId}/songs/{songId}
 */
export type IUserSong = {
  tags?: string[]
  records?: {
    type?: 'dam' | 'joysound'
    point?: number
    createdAt?: firebase.firestore.Timestamp
  }[]
} & ISong

/**
 * /songs/{songId}
 */
export type ISong = {
  song?: string
  artist?: string
  code?: {
    dam?: string
    joysound?: string
  }
}
