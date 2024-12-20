const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
let jwt = require('jsonwebtoken');
let SECRET_ACCESS_JWT = process.env.SECRET_ACCESS_JWT;

class UserControllers {

    static async register(req, res){
        try {
            const {name, email, password} = req.body;
            //console.log({name, email, password}, "==> req body");
            if (!name || !email || !password) {
                //return res.status(400).json({message: "Data yang diinput tidak boleh kosong"});
                const error = new Error("Data yang diinput tidak boleh kosong");
                error.code = 404
                throw error;
            };
            
            const cekEmail = await prisma.user.findUnique({
                where: {email: email}
            });

            if (cekEmail) {
                //return res.status(400).json({message: "Terdapat email yang sama, silahkan masukkan email yang berbeda"});
                const error = new Error("Email Anda sudah terdaftar, silahkan gunakan email yang lain");
                error.code = 404
                throw error;
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
            //res.send("Anda berhasil Register")
            setTimeout(() => {
                res.redirect('/login');
            }, 3000);
        }catch (error) {
            console.log(error);
            res.status(error.code).json({
                message: error.message,
                error: error.message
            });
        }
        
    }

    static async login(req,res){
        const {email, password} = req.body;

        try {
            const findUser = await prisma.user.findUnique({
                where:{ email: email }
            });

            
            if(!findUser){
                //return res.status(404).json("Email & Password invalid");
                //throw new Error('Email & Password Invalid', { statusCode: 404 })
                const error = new Error("Email & password invalid")
                error.code = 404
                throw error;
            }

            let cekPassword = await bcrypt.compare(password, findUser.password);
            console.log(cekPassword, "===> cek password");
            if(!cekPassword){
                //("Email & Password invalid"); // dikasih throw error 
                //throw new Error('Email & Password Invalid', { statusCode: 404 })
                const error = new Error("Email & password invalid")
                error.code = 404
                throw error;
            }

            const accessToken = jwt.sign({
                id: findUser.id,
                name: findUser.name,
                email: findUser.email,
            }, SECRET_ACCESS_JWT);
            
            //res.send(`Selamat Datang ${findUser.name} Anda berhasil masuk`);
            setTimeout(() => {
                res.status(200).json({message: `Selamat ${findUser.name}, Anda berhasil login`,});
            }, 3000);
        } catch (error) {
            console.log(error);
            // error.statusCode = 404
            // throw error
            res.status(error.code).json({
            message: error.message, 
            error: error.message
            });
        }
    }

    static async forgetPassword(req, res){
        
        try {
            const {email, name} = req.body;
            const findUser = await prisma.user.findUnique({
                where:{ email: email }
            });

            if (!findUser) {
                // return res.status(400).json("Nama & Email invalid");
                const error = new Error("Nama & email invalid");
                error.code = 404
                throw error;
            }
            const resetToken = jwt.sign({ id: findUser.id }, SECRET_ACCESS_JWT);
            const linkReset = `http://localhost:3000/resetPassword?token=${resetToken}`;

            const transporter = nodemailer.createTransport({
                host: "smtp.gmail.com",
                auth: {
                    user: process.env.MAIL_ENV,
                    pass: process.env.PASS_MAIL_ENV
                }
            });

            const mailOptions = {
                from: process.env.MAIL_ENV,
                to: email,
                subject: "RESET PASSWORD",
                html: `
                    <p>Halo ${name}</p>
                    <p>Jika Anda benar-benar ingin mereset password Anda, silahkan klik link dibawah ini</p>
                    <p><a href="${linkReset}">Reset Password</a></p>
                `
            };

            transporter.sendMail(mailOptions, (err,info) => {
                if (err) {
                    console.log(err, "==> ini ERR");
                    //res.status(500).json({error: "Gagal mengirim Email"});
                    const error = new Error("Gagal mengirim email");
                    error.code = 400
                    throw error;
                }
                console.log(info.response, "===> Response info email terkirim");
                res.status(200).json({message: "berhasil mengirim email"})
            });

            res.status(200).json({message: "Konfirmasi Email berhasil, silahkan cek email Anda"});
        } catch (error) {
            console.log(error);
            res.status(error.code).json({
                message: error.message,
                error: error.message
            });
        }
    }

    static async resetPassword(req,res){
        const { token, newPassword } = req.body;
        try {
            console.log("billy masuk")
            const verify = jwt.verify(token, SECRET_ACCESS_JWT);
            const userId = verify.id;
            console.log(verify, "===> verify");
            console.log(userId, "==> userId");
            
            const encryptPassword = bcrypt.hashSync(newPassword, 10);
            if(!verify){
                res.status(400).json({message: "Token invalid"});
            }
            const data = await prisma.user.update({
                where: { id: userId},
                data: {password: encryptPassword}
            });
            

            console.log(data, "==> data ini berhasil ganti password");

            // res.status(200).json({
            //     message: "Password anda berhasil diganti"
            // });
        } catch (error) {
            res.status(500).json({
                message: "Something wrong i can feel it",
                error: error.message
            });
        }
    }
}

module.exports = UserControllers;