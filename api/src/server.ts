import {Server} from 'http';
import app from "./app";
import config from './config';
import { initializeReminders } from './app/modules/reminder/reminder.service';

async function bootstrap(){
    const server:Server = app.listen(config.port, () =>{
        console.log(`Server running on port ${config.port}`);
    });

    // Re-schedule all active reminders after server starts
    initializeReminders();

    const exitHandler = () =>{
        if(server){
            server.close(() =>{
                console.log('Server Close')
            })
        }
    };

    const unexpectedHandler = () =>{
        console.log('Handler Error');
        exitHandler();
    }
    process.on('uncaughtException', unexpectedHandler);
    process.on('unhandledRejection', unexpectedHandler);

    process.on('SIGTERM', () =>{
        console.log('Sigterm Recieved');
        if(server){
            server.close();
        }
    })
}

bootstrap();