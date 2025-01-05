const {CustomAPIError} = require('../errors');
const {StatusCodes} = require('http-status-codes');

const errorHandlerMiddleware= (err, req, res, next) =>{
    console.log(err);
    if(err instanceof CustomAPIError){
        return res.status(err.statusCode).json({msg:err.message});
    };

    if(err.status === 403){
        return res.status(err.status).json({msg:'Forbidden'});
        
    };
    return res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({msg:'Something went wrong try again later'});
};

module.exports = errorHandlerMiddleware;