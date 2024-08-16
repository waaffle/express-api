const { prisma } = require('../prisma/prisma-client')

const PostController = {
    createPost: async (req, res) => {
        const { content } = req.body;
        if (!content) {
            return res.status(400).json({ error: "Все поля обязательные" })
        }
        try {
            const post = await prisma.post.create({
                data: {
                    content,
                    authorId: req.user.userId
                }
            })
            res.json(post)
        } catch (error) {
            console.error("Error in createPost", error);
            return res.status(500).json({ error: "Internal server error" })
        }
    },
    getAllPosts: async (req, res) => {
        const userId = req.user.userId;
        try {
            const posts = await prisma.post.findMany({
                include: {
                    likes: true,
                    comments: true,
                    author: true
                },
                orderBy: {
                    createdAt: "desc"
                }
            });

            const postsWithLikeInfo = posts.map(post => ({
                ...post,
                likedByUser: post.likes.some(like => (like.userId === userId))
            }))

            res.json(postsWithLikeInfo);
        } catch (error) {
            console.error("Error in getAllPosts", error);
            return res.status(500).json({ error: "Internal server error" })
        }
    },
    getPostById: async (req, res) => {
        const { id } = req.params;
        const userId = req.user.userId;

        if (id.length != 24) {
            return res.status(400).json({ error: "Некорректный id" })
        }

        try {
            const post = await prisma.post.findUnique({
                where: { id },
                include: {
                    likes: true,
                    comments: {
                        include: {
                            user: true,
                        }
                    },
                    author: true
                }
            });

            if (!post) {
                return res.status(404).json({ error: "Пост не найден" });
            }

            const postWithLikeInfo = {
                ...post,
                likedByUser: post.likes.some(like => like.userId === userId)
            }
            res.json(postWithLikeInfo);

        } catch (error) {
            console.error("Error in getPostById", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    },
    deletePost: async (req, res) => {
        const { id } = req.params;
        const userId = req.user.userId;

        if (id.length != 24) {
            return res.status(400).json({ error: "Некорректный id" })
        }

        try {
            const post = await prisma.post.findUnique({ where: { id } });

            if (!post) {
                return res.status(404).json({ error: "Пост не найден" });
            }

            if (post.authorId !== userId) {
                return res.status(403).json({ error: "Нельзя удалить чужой пост" })
            }

            const transaction = await prisma.$transaction([
                prisma.like.deleteMany({ where: { postId: id } }),
                prisma.comment.deleteMany({ where: { postId: id } }),
                prisma.post.delete({ where: { id } }),
            ])

            res.json(transaction);
        } catch (error) {
            console.error("Error in deletePost", error);
            return res.status(500).json({ error: "Internal server error" });
        }
    }
}

module.exports = PostController;