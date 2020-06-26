<template>
  <v-container>
    <h1>
      一覧
    </h1>
    <p>
      表示したい曲を選択してください
    </p>
    <v-alert v-if="state.show === false" type="info">
      Loading...
    </v-alert>
    <v-row>
      <v-col v-for="item in list" :key="item.id" cols="12">
        <v-card :to="`/song/${item.id}`">
          <v-card-title>
            {{ item.song }}
          </v-card-title>
          <v-card-subtitle>
            {{ item.artist }}
          </v-card-subtitle>
          <v-card-text>
            <v-chip-group>
              <v-chip v-for="(tag, i) in item.tags" :key="i">
                <v-icon left>
                  mdi-label
                </v-icon>
                {{ tag }}
              </v-chip>
            </v-chip-group>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import {
  defineComponent,
  reactive,
  onBeforeMount,
  ref
} from '@vue/composition-api'
import { IUserSong, HasId } from '@@/models/firestore'

export default defineComponent({
  middleware: 'authenticated',
  setup(_, { root: { $firebase } }) {
    const state = reactive({
      show: false
    })
    const list = ref([] as (IUserSong & HasId)[])

    onBeforeMount(() => {
      $firebase
        .firestore()
        .collection('users')
        .doc($firebase.auth().currentUser!.uid)
        .collection('songs')
        .get()
        .then((snap) => {
          snap.docs.forEach((song) => {
            const data = { ...song.data(), id: song.id } as IUserSong & HasId
            list.value.push(data)
          })
          state.show = true
        })
    })

    return {
      state,
      list
    }
  }
})
</script>
