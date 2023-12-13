const express = require('express');
const usersRouter = express.Router();
const db = require('../db');
const {constants} = require('../env');
const jwt = require('jsonwebtoken');
require('dotenv').config();

//function to executecute mysql queries
function executeQuery(statement){
    return new Promise((resolve, reject) => {
        db.query(statement, (error, data) => {
            if(error){
                reject(error);
            }else{
                resolve(data);
            }
        });
    });
};

//api to login the user
usersRouter.post('/assignment_auth', async(request, response) => {
    try{
        const {login_id, password} = request.body;
        if(login_id === "test@sunbasedata.com" && password === "Test@123"){
            const payload = {"email": login_id};
            jwt.sign({payload}, process.env.JWTKEY, {expiresIn: constants.JWT_KEY_EXPIRY_TIME}, (err, token) => {
                if(err){
                    response.status(404).send("user not found");
                }else{
                    response.send({"access_token": token});
                }
            })
        }else{
            response.status(404).send("user not found");
        }
    }catch(error){
        response.status(400).send("incorrect email or password");
    }
});

//function to verify token and get payload
function verifyToken(request, response, next){
    const bearerHeader = request.headers['authorization'];
    if(typeof bearerHeader !== 'undefined'){
        const bearer = bearerHeader.split(" ");
        const token = bearer[1];
        jwt.verify(token, process.env.JWTKEY, (error, authData) => {
            if(error){
                response.status(401).send("Invalid Authorization");
            }else{
                request.authData = authData;
                next();
            }
        })
    }else{
        response.status(401).send("Invalid Authorization");
    }
};

//api to create, update, delete customer
usersRouter.post('/assignment', verifyToken, async(request, response) => {
    try{
        if(request.query.cmd === "create"){
            if(request.body.first_name === undefined || request.body.last_name === undefined){
                response.status(400).send("First Name or Last Name is missing");
                return;
            }
            const statement = `insert into users_table values(default, '${request.body.first_name}',
            '${request.body.last_name}', '${request.body.street}', 
            '${request.body.address}', '${request.body.city}', 
            '${request.body.state}', '${request.body.email}', '${request.body.phone}')`;
    
            const data = await executeQuery(statement);
            if(data.affectedRows === 1){
                response.status(201).send("Successfully Created");
            }else{
                response.status(400).send("First Name or Last Name is missing");
            }
        }
        else if(request.query.cmd === "update"){
            if(request.query.uuid !== undefined){
                if(request.body.first_name===undefined || request.body.last_name===undefined
                    || request.body.street===undefined || request.body.city===undefined ||
                    request.body.state===undefined || request.body.email===undefined ||
                    request.body.phone===undefined || request.body.address===undefined){
                    response.status(400).send("Body is Empty");
                    return;
                }
                const statement = `update users_table set first_name='${request.body.first_name}',
                last_name='${request.body.last_name}', street='${request.body.street}', 
                address='${request.body.address}', city='${request.body.city}', 
                state='${request.body.state}', email='${request.body.email}', 
                phone='${request.body.phone}' where uuid = ${request.query.uuid}`;

                const data = await executeQuery(statement);
                if(data.affectedRows === 1){
                    response.status(200).send("Successfully Updated");
                }else{
                    response.status(400).send("UUID not found");
                }
            }
            else{
                response.status(500).send("UUID not found");
            }
        }
        else if(request.query.cmd === "delete"){
            if(request.query.uuid !== undefined){
                const statement = `delete from users_table where uuid = ${request.query.uuid}`;

                const data = await executeQuery(statement);
                if(data.affectedRows === 1){
                    response.status(200).send("Successfully deleted");
                }else{
                    response.status(500).send("Error: not deleted");
                }
            }
            else{
                response.status(400).send("UUID not found");
            }
        }
        else{
            response.status(500).send("Invalid command");
        }
        
    }catch(error){
        response.status(400).send("Something went wrong");
    }
});

//api to get customer list
usersRouter.get('/assignment', verifyToken, async(request, response) => {
    try{
        if(request.query.cmd === "get_customer_list"){
            const statement = `select uuid, first_name, last_name, street, address, city, state, 
            email, phone from users_table`;

            const data = await executeQuery(statement);
            if(data.length !== 0){
                response.status(200).send(data);
            }else{
                response.status(200).send({data, "msg": "no customers added"});
            }
        }
        else if(request.query.cmd === "get_customer_list_by_uuid"){
            if(request.query.uuid !== undefined){
                const statement = `select uuid, first_name, last_name, street, address, city, state, 
                email, phone from users_table where uuid = ${request.query.uuid}`;

                const data = await executeQuery(statement);
                if(data.length !== 0){
                    response.status(200).send(data);
                }else{
                    response.status(200).send({data, "msg": "no customers added"});
                }
            }
            else{
                response.status(404).send("UUID not found");
            }
        }
        else{
            response.status(500).send("Invalid command");
            return;
        }
    }catch(error){
        response.status(400).send("Something went wrong");
    }
});

module.exports = usersRouter;