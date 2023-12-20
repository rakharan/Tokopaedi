import * as cron from 'node-cron';



export interface IScheduler {

    success: boolean;

    error: Error;

}



export abstract class Scheduler {



    private scheduleTime: string;

    private task;

    private options: cron.ScheduleOptions = {

        scheduled: true

    }



    constructor(timeToExecute: string) {

        this.scheduleTime = timeToExecute;

        this.initiateScheduler();

    }



    private initiateScheduler() {

        const isJobValidated = cron.validate(this.scheduleTime);

        if (isJobValidated) {

            this.task = cron.schedule(this.scheduleTime, this.taskInitializer, this.options);

        }



        this.task.start();

    }



    taskInitializer = async () => {

        const job: IScheduler = await this.executeJob();



        if (job.success) {

            console.log("Job Successfully executed");

        } else {

            job.error = new Error("Error to execute the scheduled job");

        }

    }



    abstract executeJob(): Promise<IScheduler>;



}