import { notifyAdminLowStockProductEmailTemplate, notifyAdminNewUserEmailTemplate } from "@application/service/Email/Admin/Mailer"
import { newUserEmailTemplate, payTransactionEmailTemplate, successfulTransactionEmailTemplate } from "@application/service/Email/User/Mailer"
import { MailError } from "@domain/model/Error/Error"
import { EmailParamsDto } from "@domain/model/params"
import * as nodemailer from "nodemailer"
import { MailOptions } from "nodemailer/lib/json-transport"
import dotenvFlow from 'dotenv-flow';
import path from "path";

//configuration for dotenv
dotenvFlow.config({ path: path.resolve(__dirname, `../../../`) });
export class Emailer {
    private readonly transporter: nodemailer.Transporter

    constructor() {
        this.transporter = nodemailer.createTransport({
            host: "smtp-relay.brevo.com",
            port: 587,
            secure: false, // `true` for port 465, `false` for all other ports
            auth: {
                user: process.env.SMTP_EMAIL,
                pass: process.env.SMTP_PASS,
            },
        })

        this.transporter.verify((err) => {
            if (err) {
                console.log(err)
                throw new MailError(err.message)
            } else {
                console.log("Mailer is ready")
            }
        })
    }

    public sendEmail(mailOptions: MailOptions) {
        return this.transporter.sendMail(mailOptions)
    }

    public async notifyAdminForNewUser(email: string, username: string) {
        try {
            await this.sendEmail(notifyAdminNewUserEmailTemplate(email, username));
        } catch (error) {
            console.error(`Failed to send email: ${error}`);
            throw new MailError(error)
        }
    }

    public async notifyUserForSignup(email: string, username: string, token: string) {
        try {
            await this.sendEmail(await newUserEmailTemplate(email, username, token));
        } catch (error) {
            console.error(`Failed to send email: ${error}`);
            throw new MailError(error)
        }
    }

    public async notifyAdminForLowStockProduct(product: { name: string; stock: number }[]) {
        try {
            await this.sendEmail(notifyAdminLowStockProductEmailTemplate(product));
        } catch (error) {
            console.error(`Failed to send email: ${error}`);
            throw new MailError(error)
        }
    }

    public async notifyUserToPayTransaction(params: EmailParamsDto.PayTransactionEmailParams) {
        try {
            const { email, products, total, username } = params;
            await this.sendEmail(await payTransactionEmailTemplate({ email, username, products, total }));
        } catch (error) {
            console.error(`Failed to send email: ${error}`);
            throw new MailError(error)
        }
    }

    public async notifyUserForSuccessfulTransaciton(params: EmailParamsDto.successfulTransactionEmailParams) {
        try {
            await this.sendEmail(successfulTransactionEmailTemplate(params));
        } catch (error) {
            console.error(`Failed to send email: ${error}`);
            throw new MailError(error)
        }
    }
}

export const emailer = new Emailer()
