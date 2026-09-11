import jwt from "jsonwebtoken"

export const authGuardJWT = async (req, res, next) => {
 console.log("middleware is running...");

 
 const authHeader = req.headers.authorization;
 console.log("authHeader ==>", authHeader);


 const token = authHeader && authHeader.split(" ")[1];
 console.log("token ==>", token);

 if (!token) {
  return res.status(401).json({ message: "unauthorized!" });
 }

 try {
    const decodedToken = jwt.verify(token, process.env.JWT_KEY)
 console.log(decodedToken)

 next()
 } catch (error) {
      console.error(error)
        return res.status(401).send({
            message: "unauthorized"
        })
    
 }

}