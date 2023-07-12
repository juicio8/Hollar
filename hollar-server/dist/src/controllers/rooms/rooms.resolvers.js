import { getAllRooms, getRoom, addRoom, deleteRoom, searchTvTitles, getAllRoomsPaginated, getRoomsBySearch, roomWithPost, likeRoom, dislikeRoom } from './rooms.controller.js';
export const resolvers = {
    Query: {
        rooms: () => getAllRooms(),
        room: (_, { id }) => getRoom(id),
        searchTvTitles: (_, { title }) => searchTvTitles(title),
        roomsPaginate: (_, { cursor, limit }) => getAllRoomsPaginated(cursor, limit),
        searchRooms: (_, { cursor, limit, search }) => getRoomsBySearch(cursor, limit, search),
        roomPosts: (_, { id, cursor, limit }) => roomWithPost(id, cursor, limit)
        // roomsCursored: (_, { cursor, limit }) => getAllRoomCursor(cursor, limit)
    },
    Mutation: {
        createRoom: (_, { name, cover, description, tv, creator }) => {
            return addRoom({ name, cover, description, tv, creator });
        },
        removeRoom: (_, { id }) => {
            return deleteRoom(id);
        },
        likeRoom: (_, { roomId, userId }) => likeRoom(roomId, userId),
        dislikeRoom: (_, { roomId, userId }) => dislikeRoom(roomId, userId)
    }
};
