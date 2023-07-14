import { createPost, getAllPosts, getPost, deletePost, likePost, unlikePost, replyPost, getPostWithReplies, unlikeReply, likeReply, replyReply, getReplyWithReplies, getReplyAddon } from "./posts.controller.js";
export const resolvers = {
    Query: {
        posts: () => getAllPosts(),
        post: (_, { id }) => getPost(id),
        reply: (_, { id }) => getReplyAddon(id),
        postWithReplies: (_, { id, cursor, limit }) => getPostWithReplies(id, cursor, limit),
        ReplyWithReplies: (_, { id, cursor, limit }) => getReplyWithReplies(id, cursor, limit),
    },
    Mutation: {
        createPost: (_, { post }) => {
            const { authorId, comment, title, tv, tags, files, cover } = post;
            return createPost({ authorId, comment, title, tv, tags, files, cover });
        },
        deletePost: (_, { postId, authorId, roomId }) => deletePost(postId, authorId, roomId),
        likePost: (_, { postId, userId }) => likePost(postId, userId),
        unlikePost: (_, { postId, userId }) => unlikePost(postId, userId),
        likeReply: (_, { replyId, userId }) => likeReply(replyId, userId),
        unlikeReply: (_, { replyId, userId }) => unlikeReply(replyId, userId),
        replyPost: (_, { postId, reply }) => replyPost(postId, reply),
        replyReply: (_, { replyId, reply }) => replyReply(replyId, reply)
    }
};
