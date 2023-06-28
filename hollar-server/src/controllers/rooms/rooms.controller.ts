// IMPORTS
import { Room } from '../../models/rooms.model.js'
import axios from 'axios';
import { GraphQLError } from 'graphql';



// CONTROLLERS


// Search for movie/tvseries
export async function searchTvTitles(title: string) {
    const key = process.env.OMDB_KEY
    console.log('title', title)
    let response
    const tvList: any = []
    try {
        response = await axios.get(`http://www.omdbapi.com/?s=${title}&apikey=${key}`)
        console.log('res', response.data)
        for (let data of response.data?.Search) {
            const finData: any = await axios.get(`http://www.omdbapi.com/?i=${data.imdbID}&apikey=${key}`)
            console.log('finData', finData)
            const room = await getRoomByName(finData.data.Title)
            console.log(room)
            if (room.length) {
                finData.data.inRoom = true
            }
            else {
                finData.data.inRoom = false
            }

            tvList.push(finData.data)

        }

    } catch (err) {
        console.log('err', err)
        throw new GraphQLError('omdb error.', {
            extensions: {
                code: 'OMDB_ERROR',
                err: err
            }
        })
    }
    return tvList
}

// getAllRooms
export async function getAllRooms() {
    return await Room.find({})
}

// getARoom
export async function getRoom(id: string) {
    return await Room.find({ _id: id }).exec()

}
// getARoomByName
export async function getRoomByName(name: string) {
    return await Room.find({ name }).exec()

}
// addaRoom
export async function addRoom(date: string, name: string, cover: string, creator: string, description?: string,) {
    return await Room.create({
        date,
        name,
        cover,
        description,
        creator
    });
}

export async function deleteRoom(id: string) {
    const result = await Room.deleteOne({ _id: id })
    if (!result) return { message: "error occured", error: true }
    return { message: "user deleted", success: true }
}