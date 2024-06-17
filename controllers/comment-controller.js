const { prisma } = require("../prisma/prisma-client")

const CommentController = {
    createComment: async (req, res) => {
        const { content, postId } = req.body;
        if (!content || !postId){
            return res.status(400).json({error: "Все поля обязательные"});
        }
        try {
            const comment = await prisma.comment.create({
                data: {
                    content,
                    postId,
                    userId: req.user.userId
                }
            })
            res.json(comment);
        } catch (error) {
            console.error("Error in createComment", error);
            return res.status(500).json({error: "Internal server error"})
        }
    },
    deleteComment: async (req, res) => {
        const { id } = req.params;

        if (id.length!=24) {
            return res.status(400).json({error: "Некорректный id"})
        }

        const userId = req.user.userId;

        try {
            const comment = await prisma.comment.findUnique({where: {id}});
            if (!comment) {
                return res.status(404).json({error: "Пост не найден"}); 
            }
            if (comment.userId != userId){
                return res.status(403).json({error: "Нельзя удалить чужой комментарий"});
            }
            await prisma.comment.delete({where: {id}});
            res.json(comment);
        } catch (error) {
            console.error("Error in deleteComment", error);
            return res.status(500).json({error: "Internal server error"})
        }
    }
}

module.exports = CommentController;