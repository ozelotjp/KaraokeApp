<template>
  <v-container>
    <h1>
      追加
    </h1>
    <v-row>
      <v-col cols="12">
        <v-card>
          <v-card-text>
            <v-radio-group v-model="form.type" row>
              <v-radio label="DAM" value="dam" />
              <v-radio label="JoySound" value="joysound" />
            </v-radio-group>
            <v-text-field
              v-model="form.code"
              label="リクエストコード（数字６桁）"
              :error="state.error.formCode !== ''"
              :error-messages="state.error.formCode"
              :placeholder="form.type === 'dam' ? '619598' : '695887'"
            />
            <v-text-field
              v-model="details.song"
              label="曲名"
              readonly
              :disabled="canRegister === false"
            />
            <v-text-field
              v-model="details.artist"
              label="歌手名"
              readonly
              :disabled="canRegister === false"
            />
            <v-row>
              <v-col cols="6">
                <v-btn
                  block
                  :disabled="form.code.length !== 6"
                  :loading="state.loading.getDetails"
                  @click="getSongDetails"
                >
                  データ読み込み
                </v-btn>
              </v-col>
              <v-col cols="6">
                <v-btn
                  block
                  color="primary"
                  :disabled="canRegister === false"
                  :loading="state.loading.registerSong"
                  @click="registerSong"
                >
                  曲を登録
                </v-btn>
              </v-col>
            </v-row>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, reactive, computed } from '@vue/composition-api'
import {
  IGetSongDetailsInput,
  IGetSongDetailsOutput
} from '@@/models/functions'
import { IUserSong } from '@@/models/firestore'

export default defineComponent({
  middleware: 'authenticated',
  setup(_, { root: { $firebase } }) {
    const state = reactive({
      loading: {
        getDetails: false,
        registerSong: false
      },
      error: {
        formCode: ''
      }
    })
    const form = reactive({
      type: 'dam' as '' | 'dam' | 'joysound',
      code: ''
    })
    const details = reactive({
      id: '',
      type: '' as '' | 'dam' | 'joysound',
      code: '',
      song: '',
      artist: ''
    })

    const canRegister = computed(() => {
      // 曲データが存在しない場合
      if (
        details.type === '' ||
        details.code === '' ||
        details.song === '' ||
        details.artist === ''
      ) {
        return false
      }
      // 曲データがfirestore上にない場合
      if (details.id === '') {
        return false
      }
      // 入力値と曲データが一致しない場合
      if (form.type !== details.type || form.code !== details.code) {
        return false
      }
      return true
    })

    const getSongDetails = () => {
      state.loading.getDetails = true
      state.error.formCode = ''
      details.id = ''
      details.type = form.type
      details.code = form.code
      details.song = ''
      details.artist = ''
      $firebase
        .app()
        .functions('asia-northeast1')
        .httpsCallable('getSongDetails')({
          type: form.type,
          code: form.code
        } as IGetSongDetailsInput)
        .then(({ data }: { data: IGetSongDetailsOutput }) => {
          details.id = data.id
          details.song = data.song
          details.artist = data.artist
        })
        .catch(() => {
          state.error.formCode = '曲が見つかりませんでした'
        })
        .finally(() => {
          state.loading.getDetails = false
        })
    }

    const registerSong = () => {
      state.loading.registerSong = true
      $firebase
        .firestore()
        .collection('users')
        .doc($firebase.auth().currentUser!.uid)
        .collection('songs')
        .doc(details.id)
        .set({
          song: details.song,
          artist: details.artist,
          code: details.code,
          tags: [],
          records: []
        } as IUserSong)
        .then(() => {
          //
        })
        .catch((error) => {
          console.error({ error })
        })
        .finally(() => {
          state.loading.registerSong = false
        })
    }

    return {
      state,
      form,
      details,
      canRegister,
      getSongDetails,
      registerSong
    }
  }
})
</script>
