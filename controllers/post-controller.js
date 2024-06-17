const { prisma } = require('../prisma/prisma-client')

const PostController = {
    createPost: async (req, res) => {
        const { content } = req.body;
        if (!content){
            return res.status(400).json({error: "Все поля обязательные"})
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
            return res.status(500).json({error: "Internal server error"})
        }
    },
    getAllPosts: async (req, res) => {
        try {
            const posts = await prisma.post.findMany({
                include: {
                    likes: true,
                    comments: true,
                    author: true
                }
            });
            res.json(posts);
        } catch (error) {
            console.error("Error in getAllPosts", error);
            return res.status(500).json({error: "Internal server error"})
        }
    },
    getPostById: async (req, res) => {
        const { id } = req.params;

        if (id.length!=24) {
            return res.status(400).json({error: "Некорректный id"})
        }

        try {
            const post = await prisma.post.findUnique({where: {id},
            include: {
                likes: true,
                comments: true,
                author: true
            }});

            if (!post){
                return res.status(404).json({error: "Пост не найден"});
            }
            res.json(post);
        } catch (error) {
            console.error("Error in getPostById", error);
            return res.status(500).json({error: "Internal server error"});
        }
    },
    deletePost: async (req, res) => {
        const { id } = req.params;

        if (id.length!=24) {
            return res.status(400).json({error: "Некорректный id"})
        }

        try {
            const post = await prisma.post.delete({where: {id}});

            if (!post){
                return res.status(404).json({error: "Пост не найден"});
            }
            res.json(post);
        } catch (error) {
            console.error("Error in deletePost", error);
            return res.status(500).json({error: "Internal server error"});
        }
    }
}

module.exports = PostController;