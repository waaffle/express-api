const { prisma } = require("../prisma/prisma-client")

const LikeController = {
    likePost: async (req, res) => {
        const { postId } = req.body;
        const userId = req.user.userId;
        if (!postId){
            return res.status(400).json({error: "Все поля обязательные"});
        }
        try {
            const existingLike = await prisma.like.findFirst({where: {
                postId,
                userId
            }})

            if (existingLike){
                return res.status(400).json({error: "Вы уже поставили лайк"});
            }

            const like = await prisma.like.create({
                data: {
                    postId,
                    userId
                }
            })

            res.json(like);
        } catch (error) {
            console.error("Error in createLike", error);
            return res.status(500).json({error: "Internal server error"})
        }
    },
    unlikePost: async (req, res) => {
        const { postId } = req.params;
        const userId = req.user.userId;

        if (postId.length!=24) {
            return res.status(400).json({error: "Некорректный id"})
        }

        try {
            const like = await prisma.like.findFirst({where: {postId, userId}});

            if (!like) {
                return res.status(404).json({error: "Нет лайка"}); 
            }

            await prisma.like.delete({where: {id: like.id}});

            res.json(like);
        } catch (error) {
            console.error("Error in deleteLike", error);
            return res.status(500).json({error: "Internal server error"})
        }
    }
}

module.exports = LikeController;