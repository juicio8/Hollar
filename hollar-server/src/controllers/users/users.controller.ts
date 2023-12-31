// IMPORTS
import { User } from '../../models/users.model.js'
import { GraphQLError } from 'graphql';
import sgMail from '@sendgrid/mail'
import { sendMail } from './sendMail.js'
import { signupMail } from './signupMail.js'
import bcrypt from "bcrypt";
import jwt from 'jsonwebtoken'

// INTERFACES
interface IUser { fullName: string, password: string, email: string, username: string, color: string, country: string, countrycode: string }

interface IaddUser { fullName: string, password?: string, confirmpassword?: string, email: string, country: string, countrycode: string, username: string, color?: string, avatar?: string, id?: string }

interface IloginUser {
    email?: string,
    username?: string
    password: string
}

// CONTROLLERS

// getallusers
export async function getAllUsers() {
    return await User.find({})
}

export async function tagSearchUsers(username: string, limit = 10) {
    const regex = new RegExp(username, 'gi')
    const result = await User.find({ username: regex }).limit(limit).exec()
    return result
}

// try$createauserwithemail
export async function tryEmailCreateUser(user: IUser) {
    const secret = process.env.SECRETKEY
    await invalidUsername(user.username)
    await invalidEmail(user.email)
    passwordCheck(user.password)

    console.log('user', user)
    const hash = await bcrypt.hash(user.password, 12)
    user.password = hash
    console.log('tryEmail', user)
    const token = jwt.sign(user, secret, { expiresIn: '1hr' })
    sgMail.setApiKey(process.env.SENDGRID)
    const url = `http://localhost:5173/verifyaccount?token=${token}`
    // sendMail(user.email, url)

    const msg = {
        to: user.email, // Change to your recipient
        from: 'holllarztm@gmail.com', // Change to your verified sender
        subject: 'Verification Mail',
        text: 'and easy to do anywhere, even with Node.js',
        html: signupMail(url),

    }
    try {
        let statement = await sgMail.send(msg)
        console.log(statement)
        return { message: 'email sent', code: 200 }
    }
    catch (err) {
        throw new GraphQLError('Email not sent.', {
            extensions: {
                code: 'EMAIL_ERROR',
                err: err
            }
        })

    }
}

// password check
export function passwordCheck(password: string) {
    if (password.length < 5) {
        throw new GraphQLError('Password not long enough.', {
            extensions: {
                code: 'PASSWORD_ERROR',
            }
        })
    }
}

// loginUserWithUsernameorMail
export async function loginWithEmail(loginUser: IloginUser) {
    const secret = process.env.SECRETKEY

    const { email, username, password } = loginUser
    let user
    if (username?.includes('@')) {
        user = await User.findOne({ email: username })

    }
    else {
        user = await User.findOne({ username })
    }
    console.log(user)
    const userfound = email ? await User.findOne({ email }).lean() : await User.findOne({ username }).lean()
    console.log('user', userfound)
    const hash = userfound?.password || ''
    const compare = await bcrypt.compare(password, hash)
    if (!userfound || !compare) {
        throw new GraphQLError('Username or password not correct.', {
            extensions: {
                code: 'AUTHENTICATION_ERROR',
            }
        })
    }
    // const token = jwt.sign(userfound, secret, { expiresIn: '1hr' })
    const token = jwt.sign(userfound, secret)

    return { token, user }

}

// createUser
export async function parseEmailCreateUser(token: string) {
    // const secret = process.env.SECRETKEY
    const secret = process.env.SECRETKEY

    try {
        const decoded: any = jwt.verify(token, secret);
        const { fullName, email, password, username, avatar, color, id, country, countrycode } = decoded


        const user = await addUser({ fullName, email, password, username, avatar, color, id, country, countrycode })
        console.log(user)
        return {
            message: 'Success!',
            code: 200
        }


    } catch (err) {
        console.error(err)
        throw new GraphQLError('This token is invalid.', {
            extensions: {
                code: 'INVALID_TOKEN',
                err: err
            }

        })
    }
}

// getUserById
export async function getUser(id: string) {
    return await User.findById(id).exec();
}

// getUserByUsername
export async function findUser(username: string) {
    return await User.findOne({ username }).exec();
}

// check for valid username
export async function invalidUsername(username: string) {
    const usernameRegex = /^[A-Za-z][A-Za-z0-9_]{3,29}$/;
    const user = await User.findOne({ username }).exec();
    if (user || !usernameRegex.test(username)) {
        throw new GraphQLError('username is not available.', {
            extensions: {
                code: 'USERNAME_UNAVILABLE',
            }
        })
    }
    else { return { message: 'valid username', code: 200 } }
}

// check for valid mailaddress
export async function invalidEmail(email: string) {
    const user = await User.findOne({ email }).exec();
    if (user) {
        throw new GraphQLError('email is not available.', {
            extensions: {
                code: 'EMAIL_UNAVILABLE',
            }
        })
    }
    else { return { message: 'valid username', code: 200 } }
}

// findUserByMail
export async function findUserByEmail(email: string) {
    return await User.findOne({}).exec();
}

// addAUser
export async function addUser(user: IaddUser) {
    let { fullName, email, password, username, avatar, color, id, country, countrycode } = user
    email = email.toLowerCase()
    username = username.toLowerCase()
    return await User.create({
        fullName,
        email,
        password,
        username,
        avatar,
        color,
        id,
        country,
        countrycode
    });
}

export async function editProfile(profile: { userId: 'string', avatar?: 'string', bg?: 'string', favourite?: 'string' }) {
    const { userId, avatar, bg, favourite } = profile
    const user = await getUser(userId)
    if (user) {
        if (avatar?.length) {
            user.avatar = avatar
        }
        if (bg?.length) {
            user.bg = bg
        }
        if (favourite?.length) {
            user.favourite = favourite
        }
        await user.save()
        console.log(user)
        return user
    }
    else {
        throw new GraphQLError('No user', {
            extensions: {
                code: 'NO_USER',
            }
        })
    }
}

// deleteAUser
export async function deleteUser(id: string) {
    const result = await User.deleteOne({ _id: id });
    return result
}