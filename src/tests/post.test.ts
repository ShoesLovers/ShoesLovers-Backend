import { Express } from 'express'
import request from 'supertest'
import initApp from '../app'
import mongoose from 'mongoose'
import Post from '../models/postModel'
import Account from '../models/accountModel'

import {
  registerAccount,
  createAccountObject,
  createPostObject,
  createPost,
  getPostById,
  getAllPosts,
  updatePost,
  deletePost,
  createComment,
  createCommentObject,
} from '../helpers/testsHelpers'
import { commentModel } from '../models/commentModel'

afterAll(async () => {
  await commentModel.deleteMany()
  await Post.deleteMany()
  await Account.deleteMany()
  await mongoose.connection.close()
})

let app: Express
let dbAccount: request.Response
let dbPost: request.Response
let accessToken: string

const post = createPostObject('test1', 'message1', [])
const account = createAccountObject('test@gmail.com', '1234', 'test')

describe('Tests Posts', () => {
  beforeAll(async () => {
    app = await initApp()
    await commentModel.deleteMany()
    await Post.deleteMany()
    await Account.deleteMany()
    dbAccount = await registerAccount(app, account)
    accessToken = dbAccount.body.accessToken
  })

  test('Test if no posts', async () => {
    const response = await getAllPosts(app, accessToken)
    expect(response.status).toBe(200)
    expect(response.body).toEqual([])
  })

  test('Create post', async () => {
    dbPost = await createPost(app, post, accessToken)
    expect(dbPost.status).toBe(201)
    expect(dbPost.body.title).toBe(post.title)
    expect(dbPost.body.owner).toBe(dbAccount.body.account._id)
    expect(dbPost.body.comments).toEqual([])
    expect(dbPost.body.message).toBe(post.message)
  })

  test('Create invalid post', async () => {
    const response = await request(app)
      .post('/post')
      .send({})
      .set('Authorization', `JWT ${accessToken}`)
    expect(response.status).toBe(406)
  })

  test('Test get all posts', async () => {
    const response = await getAllPosts(app, accessToken)
    expect(response.status).toBe(200)
    expect(response.body.length).toBe(1)
  })

  test('Test get post by id', async () => {
    const response = await getPostById(app, dbPost.body._id, accessToken)

    expect(response.status).toBe(200)
    expect(response.body.title).toBe(post.title)
    expect(response.body.owner._id).toBe(dbAccount.body.account._id)
    expect(response.body.comments).toEqual([])
    expect(response.body.message).toBe(post.message)
  })

  test('Test get post by id with invalid id', async () => {
    const response = await getPostById(app, 'invalidid', accessToken)
    expect(response.status).toBe(500)
  })

  test('Test get post by id without token', async () => {
    const response = await getPostById(app, dbPost.body._id, '')

    expect(response.status).toBe(500)
  })

  test('Test get post by id with invalid token', async () => {
    const response = await getPostById(app, dbPost.body._id, 'invalidtoken')

    expect(response.status).toBe(500)
  })

  test('Test get post by invalid id', async () => {
    const response = await getPostById(app, 'invalidid', accessToken)
    expect(response.status).toBe(500)
  })

  test('Test get all posts', async () => {
    const response = await getAllPosts(app, accessToken)
    expect(response.status).toBe(200)
    expect(response.body.length).toBe(1)
  })

  test('Test get all posts without token', async () => {
    const response = await getAllPosts(app, '')
    expect(response.status).toBe(500)
  })

  test('Test get all posts with invalid token', async () => {
    const response = await getAllPosts(app, 'invalidtoken')
    expect(response.status).toBe(500)
  })

  test('Test update post', async () => {
    const response = await updatePost(app, dbPost.body._id, accessToken, {
      title: 'test1 updated',
      message: 'message1 updated',
      comments: [],
    })
    expect(response.status).toBe(200)
    expect(response.body.title).toBe('test1 updated')
    expect(response.body.message).toBe('message1 updated')
  })

  test('Delete post with invalid id', async () => {
    const response = await deletePost(app, 'invalidid', accessToken)
    expect(response.status).toBe(500)
  })

  test('Delete post without token', async () => {
    const response = await deletePost(app, dbPost.body._id, '')
    expect(response.status).toBe(500)
  })

  test('Test delete post', async () => {
    console.log(dbAccount.body.account._id)
    const response = await deletePost(app, dbPost.body._id, accessToken)
    expect(response.status).toBe(200)
    expect(response.text).toBe('Post deleted')
  })

  test('Test Post is not exist on user posts array', async () => {
    const response = await Account.findOne({ _id: dbAccount.body.account._id })
    expect(response.posts.length).toBe(0)
  })

  test('Test delete post that you are not owner', async () => {
    const post = createPostObject('test1', 'message1', [])
    const dbPost = await createPost(app, post, accessToken)
    const response = await deletePost(app, dbPost.body._id, 'invalidtoken')
    expect(response.status).toBe(500)
  })

  test('Create post without message or title', async () => {
    const post = createPostObject('', '', [])
    const response = await createPost(app, post, accessToken)
    expect(response.status).toBe(406)
  })

  test('Create post and add comment', async () => {
    const post = createPostObject('test1', 'message1', [])
    const dbPost = await createPost(app, post, accessToken)

    const dbComment = await createComment(
      app,
      createCommentObject('comment1'),
      dbPost.body._id,
      accessToken
    )

    expect(dbComment.body.content).toBe('comment1')
    expect(dbComment.body.postId).toBe(dbPost.body._id)
  })

  test('Delete Account', async () => {
    const response = await request(app)
      .delete(`/account/${dbAccount.body.account._id}`)
      .set('Authorization', `JWT ${accessToken}`)
    expect(response.status).toBe(200)
  })
})
