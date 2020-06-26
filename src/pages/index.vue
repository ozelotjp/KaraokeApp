<template>
  <v-container>
    <h1>
      index
    </h1>
    <ul>
      <li
        v-for="item in ['/add', '/list', '/auth/login', '/auth/logout']"
        :key="item"
      >
        <nuxt-link :to="item">
          {{ item }}
        </nuxt-link>
      </li>
    </ul>
  </v-container>
</template>
