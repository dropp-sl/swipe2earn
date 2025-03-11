import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as SendGrid from '@sendgrid/mail';
import { User } from 'src/api/v1/user/schema/user.schema';
import handleErrorException from 'src/exception/error.exception';

@Injectable()
export class SendGridService {
  constructor(private readonly configService: ConfigService) {
    SendGrid.setApiKey(this.configService.get<string>('SENDGRID_API_KEY'));
  }

  async verifyEmail(user: User, token: string) {
    return await handleErrorException(async () => {
      const mail = {
        from: `${process.env.SENDGRID_ACCOUNT_EMAIL}`,
        templateId: `${process.env.SENDGRID_TEM_ID_FOR_VERIFY_EMAIL}`,
        personalizations: [
          {
            to: { email: `${user?.email}` },
            dynamic_template_data: {
              subject: 'Verify Your Email ✔',
              button_url: `${process.env.CLIENT_URL}verify-email/${token}`,
              name: user?.username,
            },
          },
        ],
      };

      const transport = await SendGrid.send(mail);
      return transport;
    });
  }

  async signUpEmail(userEmails: string[], token: string[]) {
    return await handleErrorException(async () => {
      const personalizations = [];

      for (const userEmail of userEmails) {
        personalizations.push({
          to: { email: userEmail },
          dynamic_template_data: {
            subject: 'Register Your Account ✔',
            button_url: `${process.env.CLIENT_URL}sign-up/${token}`,
          },
        });
      }

      const mail = {
        from: process.env.SENDGRID_ACCOUNT_EMAIL,
        templateId: process.env.SENDGRID_TEM_ID_FOR_SIGN_UP_EMAIL,
        personalizations: personalizations,
      };

      const responses = await Promise.all(
        userEmails.map(() => SendGrid.send(mail)),
      );
      return responses.map(([response]) => response);
    });
  }

  async forgotPasswordEmail(user: User, token: string) {
    const mail = {
      from: `${process.env.SENDGRID_ACCOUNT_EMAIL}`,
      templateId: `${process.env.SENDGRID_TEM_ID_FOR_FORGOT_EMAIL}`,
      personalizations: [
        {
          to: { email: `${user?.email}` },
          dynamic_template_data: {
            subject: 'Forgot Password ✔',
            button_url: `${process.env.CLIENT_URL}reset-new-password/${token}`,
            name: user?.username,
          },
        },
      ],
    };

    const transport = await SendGrid.send(mail);
    return transport;
  }

  async accountDeactivationRequestNotification(user: User) {
    return await handleErrorException(async () => {
      const mail = {
        from: `${process.env.SENDGRID_ACCOUNT_EMAIL}`,
        templateId: `${process.env.SENDGRID_TEM_ID_FOR_ACCOUNT_DEACTIVATION_REQUEST}`,
        personalizations: [
          {
            to: { email: `${user?.email}` },
            dynamic_template_data: {
              subject: 'Account Deactivation Requested',
              name: user?.username,
              link: `${process.env.CLIENT_URL}sign-in`,
            },
          },
        ],
      };

      const transport = await SendGrid.send(mail);
      return transport;
    });
  }

  async accountDeactivationByAdminNotification(user: User) {
    return await handleErrorException(async () => {
      const mail = {
        from: `${process.env.SENDGRID_ACCOUNT_EMAIL}`,
        templateId: `${process.env.SENDGRID_TEM_ID_FOR_ACCOUNT_DEACTIVATION_BY_ADMIN_NOTIFICATION}`,
        personalizations: [
          {
            to: { email: `${user?.email}` },
            dynamic_template_data: {
              subject: 'Account Permanently Deactivated!',
              name: user?.username,
            },
          },
        ],
      };

      const transport = await SendGrid.send(mail);
      return transport;
    });
  }

  async accountDeactivationByUserNotification(user: User) {
    return await handleErrorException(async () => {
      const mail = {
        from: `${process.env.SENDGRID_ACCOUNT_EMAIL}`,
        templateId: `${process.env.SENDGRID_TEM_ID_FOR_ACCOUNT_DEACTIVATION_BY_USER_NOTIFICATION}`,
        personalizations: [
          {
            to: { email: `${user?.email}` },
            dynamic_template_data: {
              subject: 'Account Permanently Deactivated!',
              name: user?.username,
            },
          },
        ],
      };

      const transport = await SendGrid.send(mail);
      return transport;
    });
  }

  async accounReactivationReminder(user: User) {
    return await handleErrorException(async () => {
      const mail = {
        from: `${process.env.SENDGRID_ACCOUNT_EMAIL}`,
        templateId: `${process.env.SENDGRID_TEM_ID_FOR_ACCOUNT_REACTIVATION_REMINDER}`,
        personalizations: [
          {
            to: { email: `${user?.email}` },
            dynamic_template_data: {
              subject: 'Re-activate your account!',
              name: user?.username,
              link: `${process.env.CLIENT_URL}/sign-in`,
            },
          },
        ],
      };

      const transport = await SendGrid.send(mail);
      return transport;
    });
  }

  async send(mail: any) {
    const transport = await SendGrid.send(mail);
    return transport;
  }
}
