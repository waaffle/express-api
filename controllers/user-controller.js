const { prisma } = require("../prisma/prisma-client");
const bcrypt = require("bcryptjs");
const jdenticon = require('jdenticon');
const path = require('path');
const fs = require('fs');
const jwt = require("jsonwebtoken")

const UserController = {
    register: async (req, res) => {
        const { email, password, name } = req.body;
        
        if (!email || !password || !name){
            return res.status(400).json({ error: "Все поля обязательные"})
        }

        try {
            const existingUser = await prisma.user.findUnique({ where: {email} });

            if (existingUser) {
                return res.status(400).json({error: "Пользователь существует"})
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            const png = jdenticon.toPng(name, 200);
            const avatarName = `${name}_${Date.now()}.png`;
            const avatarPath = path.join(__dirname, '../uploads', avatarName);
            fs.writeFileSync(avatarPath, png);

            const user = await prisma.user.create({
                data: {
                    email,
                    password: hashedPassword,
                    name,
                    avatarUrl: `./uploads/${avatarName}`
                }
            })

            res.json(user)
        }
        catch (error) {
            console.error("Error in register", error);
            res.status(500).json({error: "Internal server error"})
        }
    },
    login: async (req, res) => {
        const { email, password } = req.body;
        if (!email || !password){
            return res.status(400).json({ error: "Все поля обязательныe"})
        }
        try{
            const user = await prisma.user.findUnique({where: {email}});
            if (!user) {
                return res.status(400).json({ error: "Неверный логин или пароль"})
            }
            const valid = await bcrypt.compare(password, user.password);

            if(!valid) {
                return res.status(400).json({ error: "Неверный логин или пароль"})
            }
            const token = jwt.sign(({userId: user.id}), process.env.SECRET_KEY);

            res.json({token})
        }
        catch(error){
            console.error("Error in login", error);
            res.status(500).json("Internal server error")
        }
        

    },
    getUserById: async (req, res) => {
        res.send('getUserById')
    },
    updateUser: async (req, res) => {
        res.send('updateUser')
    },
    current: async (req, res) => {
        res.send('current')
    },
}

module.exports = UserController;
