const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
let jwt = require('jsonwebtoken');
let SECRET_ACCESS_JWT = process.env.SECRET_ACCESS_JWT;

class UserControllers {

    static async register(req, res){
        try {
            const {name, email, password} = req.body;
            //console.log({name, email, password}, "==> req body");
            const cekEmail = await prisma.user.findUnique({
                where: {email: email}
            });

            if (cekEmail) {
                return res.status(400).json({message: "Terdapat email yang sama"});
            }

            const encryptPassword = await bcrypt.hashSync(password, 10);

            const saveData = await prisma.user.create({
                data: {
                    name: name,
                    email: email,
                    password: encryptPassword
                }
            })
            console.log(saveData, "==> saveData");
            res.send("Anda berhasil Register")
        }catch (error) {
            console.log(error);
            res.status(500).json({error: "Something wrong i can feel it"});
        }
        
    }

    static async login(req,res){
        const {email, password} = req.body;

        try {
            const findUser = await prisma.user.findUnique({
                where:{ email: email }
            });

            let cekPassword = await bcrypt.compareSync(password, findUser.password);

            if(!findUser){
                return res.status(404).send("User tidak ditemukan");
            }
            if(!cekPassword){
                return res.status(401).send("Wrong password");
            }

            const accessToken = jwt.sign({
                id: findUser.id,
                name: findUser.name,
                email: findUser.email,
            }, SECRET_ACCESS_JWT);
            
            //res.send(`Selamat Datang ${findUser.name} Anda berhasil masuk`);
            res.status(200).json({
                message: `Selamat ${findUser.name}, Anda berhasil login`,
                accessToken
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({error: "Something wrong i can feel it"});
        }
    }

    static async forgetPassword(req, res){
        const {email, name} = req.body;

        try {
            
        } catch (err) {
            res.status(500).json({
                message: "Something wrong i can feel it",
                error: err
            });
        }

    }

}

module.exports = UserControllers;