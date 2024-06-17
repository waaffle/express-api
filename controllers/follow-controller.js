const { prisma } = require("../prisma/prisma-client")

const FollowController = {
    follow: async (req, res) => {
        const { followingId } = req.body;
        const userId = req.user.userId;
        if (!followingId){
            return res.status(400).json({error: "Все поля обязательные"});
        }
        if (userId === followingId){
            return res.status(403).json({error: "Нельзя подписаться на самого себя"});
        }
        try {
            const existingFollow = await prisma.follows.findFirst({where: {
                followerId: userId,
                followingId
            }})

            if (existingFollow){
                return res.status(400).json({error: "Вы уже подписаны"});
            }

            const follow = await prisma.follows.create({
                data: {
                    followerId: userId,
                    followingId
                },
                include: {
                    follower: true,
                    following: true
                }
            })

            res.status(201).json({message: "Подписка успешно создана"});
        } catch (error) {
            console.error("Error in follow", error);
            return res.status(500).json({error: "Internal server error"})
        }
    },
    unfollow: async (req, res) => {
        const { followingId } = req.params;
        const userId = req.user.userId;
        if (followingId.length!=24) {
            return res.status(400).json({error: "Некорректный id"})
        }
        if (userId === followingId){
            return res.status(403).json({error: "Нельзя отписаться от самого себя"});
        }

        try {
            const follow = await prisma.follows.findFirst({where: {
                followerId: userId,
                followingId
            }});

            if (!follow) {
                return res.status(404).json({error: "Вы не подписаны"}); 
            }

            await prisma.follows.delete({where: {id: follow.id}});

            res.status(201).json({message: "Вы отписались"});
        } catch (error) {
            console.error("Error in deleteFollow", error);
            return res.status(500).json({error: "Internal server error"})
        }
    }
}

module.exports = FollowController;