const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
        user: process.env.EMAIL_USER || 'hbrajpura110@gmail.com',
        pass: process.env.EMAIL_PASS || 'wmwzexqfxqycufll'
    }
});

/**
 * Send Welcome Email to Regular Users
 */
const sendWelcomeEmail = ({ email, name }) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM || '"Arena Pro" <hbrajpura110@gmail.com>',
        to: email,
        subject: 'Welcome to the Arena, Champion! 🏟️',
        html: `
            <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: auto; background-color: #0f172a; border-radius: 24px; overflow: hidden; border: 1px solid #1e293b; color: #f8fafc;">
                <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 60px 40px; text-align: center;">
                    <h1 style="margin: 0; font-size: 32px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; font-style: italic;">Welcome Home,</h1>
                    <h2 style="margin: 5px 0 0; font-size: 48px; font-weight: 950; color: #000; text-transform: uppercase;">${name}</h2>
                </div>
                <div style="padding: 40px; line-height: 1.6;">
                    <p style="font-size: 18px; margin-bottom: 25px;">The gates are open! You're now part of the most elite sports community in the city.</p>
                    <div style="background: #1e293b; border-radius: 16px; padding: 25px; margin-bottom: 30px; border-left: 4px solid #10b981;">
                        <h4 style="margin: 0 0 10px; color: #10b981; text-transform: uppercase; font-size: 13px; letter-spacing: 2px;">Your Advantage</h4>
                        <p style="margin: 0; font-size: 14px; color: #94a3b8;">Instantly book premium turfs, track your match history, and climb the community leaderboards.</p>
                    </div>
                    <a href="http://localhost:5173/venues" style="display: block; text-align: center; background-color: #f8fafc; color: #000; padding: 18px; border-radius: 12px; text-decoration: none; font-weight: 900; text-transform: uppercase; letter-spacing: 1px; font-size: 14px;">Find Your Next Pitch</a>
                </div>
                <div style="background-color: #020617; padding: 30px; text-align: center; border-top: 1px solid #1e293b;">
                    <p style="margin: 0; font-size: 12px; color: #475569; letter-spacing: 1px; font-weight: 700;">ARENA PRO ELITE • TRANSFORMING SPORTS</p>
                </div>
            </div>
        `
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.log('Error sending welcome email:', error);
    });
};

/**
 * Send Ban Notification Email
 */
const sendBanEmail = ({ email, name }) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM || '"Arena Pro" <hbrajpura110@gmail.com>',
        to: email,
        subject: 'Account Status Update - Arena Pro ⚠️',
        html: `
            <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; background-color: #020617; border-radius: 24px; border: 1px solid #dc2626; color: #f8fafc; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #7f1d1d 0%, #dc2626 100%); padding: 50px 40px; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 900; text-transform: uppercase;">Account Restricted</h1>
                </div>
                <div style="padding: 40px;">
                    <p style="font-size: 16px; color: #94a3b8;">Hello ${name},</p>
                    <p style="font-size: 16px;">We noticed some activity that doesn't align with our community standards. As a result, your account has been <strong>suspended</strong>.</p>
                    <p style="font-size: 14px; color: #64748b; margin-top: 30px; border-top: 1px solid #1e293b; pt: 20px;">If you believe this is an error, please reach out to our support squad.</p>
                </div>
            </div>
        `
    };
    transporter.sendMail(mailOptions);
};

/**
 * Send Unban Notification Email
 */
const sendUnbanEmail = ({ email, name }) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM || '"Arena Pro" <hbrajpura110@gmail.com>',
        to: email,
        subject: 'Welcome Back to the Pitch! 🟢',
        html: `
            <div style="font-family: 'Segoe UI', sans-serif; max-width: 600px; margin: auto; background-color: #0f172a; border-radius: 24px; border: 1px solid #22c55e; color: #f8fafc; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #14532d 0%, #22c55e 100%); padding: 50px 40px; text-align: center;">
                    <h1 style="margin: 0; font-size: 28px; font-weight: 900; text-transform: uppercase;">Access Restored</h1>
                    <p style="font-size: 14px; font-weight: 700; color: #000; margin-top: 5px;">TIME TO PLAY</p>
                </div>
                <div style="padding: 40px;">
                    <p style="font-size: 16px;">Great news, ${name}!</p>
                    <p>Your account has been fully reinstated. You can now log back in and continue booking your favorite turfs.</p>
                    <a href="http://localhost:5173/login" style="display: inline-block; margin-top: 20px; background: #22c55e; color: #000; padding: 12px 30px; border-radius: 10px; font-weight: 800; text-decoration: none; text-transform: uppercase; font-size: 12px;">Login Now</a>
                </div>
            </div>
        `
    };
    transporter.sendMail(mailOptions);
};

/**
 * Send Partner Approval Email with Generated Password
 */
const sendPartnerApprovalEmail = ({ email, name, turfName, password }) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM || '"Arena Pro Admin" <hbrajpura110@gmail.com>',
        to: email,
        subject: 'Ground Partnership Approved! 🏟️✨',
        html: `
            <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: auto; background-color: #0f172a; border-radius: 32px; overflow: hidden; border: 1px solid #10b981; color: #f8fafc;">
                <div style="background: linear-gradient(135deg, #064e3b 0%, #10b981 100%); padding: 70px 40px; text-align: center;">
                    <div style="display: inline-block; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 20px; margin-bottom: 20px;">
                        <span style="font-size: 40px;">🏟️</span>
                    </div>
                    <h1 style="margin: 0; font-size: 34px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; font-style: italic;">Welcome Aboard,</h1>
                    <h2 style="margin: 5px 0 0; font-size: 24px; font-weight: 700; color: #000; text-transform: uppercase;">${turfName} Partner</h2>
                </div>
                <div style="padding: 50px 40px; line-height: 1.8;">
                    <p style="font-size: 16px; margin-bottom: 30px; color: #94a3b8;">Congratulations <strong>${name}</strong>! Your application to become an official Arena Pro partner has been **Approved** by the Super Admin.</p>
                    
                    <div style="background: rgba(16, 185, 129, 0.05); border: 1px dashed rgba(16, 185, 129, 0.3); border-radius: 24px; padding: 30px; margin-bottom: 35px;">
                        <p style="margin: 0 0 15px; text-align: center; font-size: 10px; font-weight: 900; letter-spacing: 3px; color: #10b981; text-transform: uppercase;">Your Secure Terminal Access</p>
                        <div style="background: #020617; border-radius: 16px; padding: 20px; text-align: center;">
                            <p style="margin: 0 0 5px; font-size: 11px; color: #64748b; font-weight: 700;">LOGIN EMAIL</p>
                            <p style="margin: 0 0 20px; font-size: 18px; font-weight: 800; color: #fff;">${email}</p>
                            <p style="margin: 0 0 5px; font-size: 11px; color: #64748b; font-weight: 700;">GENERATED PASSWORD</p>
                            <p style="margin: 0; font-size: 24px; font-weight: 950; color: #10b981; letter-spacing: 2px; font-family: monospace;">${password}</p>
                        </div>
                    </div>

                    <a href="http://localhost:5173/partner/login" style="display: block; text-align: center; background-color: #f8fafc; color: #000; padding: 20px; border-radius: 16px; text-decoration: none; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; font-size: 14px; box-shadow: 0 10px 30px rgba(0,255,0,0.1);">Launch Partner Dashboard</a>
                    
                    <p style="text-align: center; font-size: 12px; color: #475569; margin-top: 30px;">For security, please change your password immediately after your first login.</p>
                </div>
            </div>
        `
    };
    transporter.sendMail(mailOptions);
};

/**
 * Send Partner Rejection Email
 */
const sendPartnerRejectionEmail = ({ email, name, turfName }) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM || '"Arena Pro Scrutiny" <hbrajpura110@gmail.com>',
        to: email,
        subject: 'Application Status - Arena Pro Partnership 🏟️🚫',
        html: `
            <div style="font-family: 'Inter', sans-serif; max-width: 600px; margin: auto; background-color: #020617; border-radius: 32px; border: 1px solid #334155; color: #f8fafc; overflow: hidden;">
                <div style="background: #1e293b; padding: 60px 40px; text-align: center;">
                    <h1 style="margin: 0; font-size: 26px; font-weight: 900; text-transform: uppercase; letter-spacing: -0.5px;">Application Declined</h1>
                </div>
                <div style="padding: 50px 40px; text-align: center;">
                    <p style="font-size: 16px; color: #94a3b8; margin-bottom: 25px;">Hello <strong>${name}</strong>,</p>
                    <p style="font-size: 15px; color: #f8fafc; line-height: 1.8;">Thank you for your interest in partnering with <strong>${turfName}</strong>. After a thorough review of your stadium profile and documents, we are unable to proceed with your partnership at this time.</p>
                    <div style="margin-top: 40px; padding: 20px; background: rgba(239, 68, 68, 0.05); border-radius: 16px; border: 1px solid rgba(239, 68, 68, 0.2);">
                        <p style="margin: 0; font-size: 12px; font-weight: 700; color: #ef4444; text-transform: uppercase;">Scrutiny Result: Failed to meet elite standards</p>
                    </div>
                </div>
            </div>
        `
    };
    transporter.sendMail(mailOptions);
};

module.exports = {
    sendWelcomeEmail,
    sendBanEmail,
    sendUnbanEmail,
    sendPartnerApprovalEmail,
    sendPartnerRejectionEmail
};
