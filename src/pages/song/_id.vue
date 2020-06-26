<template>
  <v-container>
    <h1>
      {{ details.song }}
    </h1>
    <p>
      {{ details.artist }}
    </p>
    <v-row>
      <v-col>
        <v-card>
          <v-card-text>
            <pre>{{ state }}</pre>
            <pre>{{ details }}</pre>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script lang="ts">
import { defineComponent, reactive, onBeforeMount } from '@vue/composition-api'
import { ISong, IUserSong, HasId } from '@@/models/firestore'

export default defineComponent({
  middleware: 'authenticated',
  setup(_, { root: { $firebase, $nuxt, $route } }) {
    const state = reactive({
      show: false
    })
    const details = reactive({
      id: $route.params.id,
      song: '',
      artist: '',
      code: {
        dam: '',
        joysound: ''
      },
      tags: [],
      records: []
    } as IUserSong & HasId)

    onBeforeMount(() => {
      $firebase
        .firestore()
        .collection('users')
        .doc($firebase.auth().currentUser!.uid)
        .collection('songs')
        .doc(details.id)
        .get()
        .then((snap) => {
          if (snap.exists === false) {
            $nuxt.error({ statusCode: 404 })
            return
          }
          const data = snap.data() as ISong
          details.song = data.song!
          details.artist = data.artist!
          state.show = true
        })
        .catch((error) => {
          console.error({ error })
        })
    })

    return {
      state,
      details
    }
  }
})
</script>
