import express from 'express'
import PostController from '../controllers/postController'
import authMiddleware from '../controllers/auth_middleware'

const router = express.Router()

router.get('/', PostController.getAll.bind(PostController))
router.get('/:id', PostController.getById.bind(PostController))

router.post('/', authMiddleware, PostController.post.bind(PostController))

router.put(
  '/:id',
  authMiddleware,
  PostController.updateById.bind(PostController)
)

router.delete(
  '/:id',
  authMiddleware,
  PostController.deleteById.bind(PostController)
)

export default router
