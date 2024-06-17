const { prisma } = require("../prisma/prisma-client")

const LikeController = {
    createLike: async (req, res) => {
        const { postId } = req.body;
        if (!postId){
            return res.status(400).json({error: "Все поля обязательные"});
        }
        try {
            const like = await prisma.like.create({
                data: {
                    postId,
                    userId: req.user.userId
                }
            })
            res.json(like);
        } catch (error) {
            console.error("Error in createLike", error);
            return res.status(500).json({error: "Internal server error"})
        }
    },
    deleteLike: async (req, res) => {
        const { id } = req.params;

        if (id.length!=24) {
            return res.status(400).json({error: "Некорректный id"})
        }

        const userId = req.user.userId;

        try {
            const like = await prisma.like.findUnique({where: {id}});
            if (!like) {
                return res.status(404).json({error: "Лайк не найден"}); 
            }
            if (like.userId != userId){
                return res.status(403).json({error: "Нельзя удалить чужой лайк"});
            }
            await prisma.like.delete({where: {id}});
            res.json(like);
        } catch (error) {
            console.error("Error in deleteLike", error);
            return res.status(500).json({error: "Internal server error"})
        }
    }
}

module.exports = LikeController;