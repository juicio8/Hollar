<template>
  <div class="mb-5 cursor-pointer">
    <!-- <rooms-header @openRoomModal="$emit('openRoomModal')" :rooms="rooms" @change="change" /> -->
    <div v-if="!result?.roomsPaginate?.length">
      <room-skeleton />
    </div>
    <div v-else>
      <scroll-results :result="result" @toRoom="toRoom" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRefreshStore } from '@/stores/refresh'
import { roomsPaginateQuery, searchRoomsQuery } from '@/graphql/queries'
import { useQuery, useLazyQuery } from '@vue/apollo-composable'
import { useAuthStore } from '@/stores/auth'
import RoomsHeader from './RoomsHeader.vue'
import RoomSkeleton from './RoomSkeleton.vue'
import ScrollResults from './ScrollResults.vue'
import SearchResults from './SearchResults.vue'

const auth = useAuthStore()

defineEmits(['openRoomModal'])
defineProps({
  rooms: Boolean
})
const router = useRouter()
const search = ref('')

function toRoom(title, id) {
  const name = title.split(' ').join('+')
  router.push(`channel/${name}/${id}`)
}
let vars = auth?.user?.id
  ? { cursor: '', limit: 2, userId: auth?.user?.id }
  : { cursor: '', limit: 2 }
const { result, loading, fetchMore, error } = useQuery(roomsPaginateQuery, () => vars, {
  notifyOnNetworkStatusChange: true,
  fetchPolicy: 'cache-and-network'
})

// load rooms function
function loadMore() {
  fetchMore({
    variables: {
      cursor: result?.value?.roomsPaginate?.slice(-1)[0].updatedAt
    },
    updateQuery: (previousResult, { fetchMoreResult }) => {
      // No new feed posts
      if (!fetchMoreResult) return previousResult

      // Concat previous feed with new feed posts

      return {
        ...previousResult,
        roomsPaginate: [...previousResult.roomsPaginate, ...fetchMoreResult.roomsPaginate]
      }
    }
  })
}
// load room on initial render

function infiniteScroll() {
  if (!loading.value) {
    const { scrollTop, offsetHeight } = document.documentElement
    const { innerHeight } = window
    const bottomOfWindow = Math.round(scrollTop) + innerHeight > offsetHeight - 100
    if (bottomOfWindow) {
      loadMore()
    }
  }
}

// infinite scrollin
window.addEventListener('scroll', infiniteScroll)
onUnmounted(() => window.removeEventListener('scroll', infiniteScroll))

// loadMore()
// search function
function change(value) {
  search.value = value
  console.log(value)
}

watch(error, () => {
  console.log(error.value)
})
</script>

<style scoped>
img {
  height: 130px;
  object-fit: cover;
  width: 100%;
}
</style>
