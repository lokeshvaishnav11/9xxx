import mongoose from 'mongoose'
import bluebird from 'bluebird'

import Locals from './Locals'
import Log from '../middlewares/Log'
import { CallbackError } from 'mongoose'
import cachegoose from 'recachegoose'

export class Database {
  // Initialize your database pool
  public static init(): void {
    // const dsn = Locals.config().mongooseUrl+`?retryWrites=false&authSource=admin&directConnection=true`
    // const dsn = "mongodb://admin:StrongPasswordHere@69.62.123.205:27017/infa?retryWrites=true&authSource=admin&replicaSet=rs0"
   
   
    const dsn = "mongodb://admin:9xbro%408824@69.62.123.205:27017/infa?retryWrites=true&authSource=admin&replicaSet=rs0";
  // const dsn = "mongodb+srv://infayou:rahul1234@cluster0.zbf0n.mongodb.net/infa?retryWrites=true&w=majority&appName=Cluster0&tlsAllowInvalidCertificates=true";

    //const dsn = Locals.config().mongooseUrl 
    // 
    // replicaSet=myReplicaSet

    console.log(dsn,"GHJK")
    
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useFindAndModify: false,
      retryWrites: false,
      useCreateIndex: true,
    }
    ;(<any>mongoose).Promise = bluebird

    //mongoose.set('useCreateIndex', true);
    this.redisCache()
    mongoose.connect(dsn, options, (error: CallbackError) => {
      // handle the error case
      if (error) {
        Log.info('Failed to connect to the Mongo server!!')
        console.log(error)
        throw error
      } else {
        Log.info('connected to mongo server at: ' + dsn)
      }
    })
  }

  public static redisCache = () => {
    cachegoose(mongoose, {
      engine: 'redis',
      port: +process.env.REDIS_QUEUE_PORT!,
      host: process.env.REDIS_QUEUE_HOST,
    })
  }

  public static getInstance = () => {
    return mongoose.connection
  }
}

export default mongoose


// import mongoose, { CallbackError } from 'mongoose';
// import bluebird from 'bluebird';
// import Locals from './Locals';
// import Log from '../middlewares/Log';
// import cachegoose from 'recachegoose';

// export class Database {
//   public static init(): void {
//     const baseUrl = Locals.config().mongooseUrl;

//     // Safely append query params to avoid double "?"
//     const connector = baseUrl.includes('?') ? '&' : '?';
//     const dsn = `${baseUrl}${connector}retryWrites=false&authSource=admin`;

//     const options = {
//       useNewUrlParser: true,
//       useUnifiedTopology: true,
//       useFindAndModify: false,
//       useCreateIndex: true,
//     };

//     // Use Bluebird for Promises
//     (mongoose as any).Promise = bluebird;

//     this.redisCache();

//     mongoose.connect(dsn, options, (error: CallbackError) => {
//       if (error) {
//         Log.info('❌ Failed to connect to the Mongo server!!');
//         console.error(error);
//         throw error;
//       } else {
//         Log.info('✅ Connected to Mongo server at: ' + dsn);
//       }
//     });
//   }

//   public static redisCache = () => {
//     cachegoose(mongoose, {
//       engine: 'redis',
//       port: +process.env.REDIS_QUEUE_PORT!,
//       host: process.env.REDIS_QUEUE_HOST,
//     });
//   };

//   public static getInstance = () => {
//     return mongoose.connection;
//   };
// }

// export default mongoose;
