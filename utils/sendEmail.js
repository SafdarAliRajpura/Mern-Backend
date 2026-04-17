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
        else console.log('Welcome email sent:', info.response);
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
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.log('Error sending ban email:', error);
        else console.log('Ban email sent:', info.response);
    });
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
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.log('Error sending unban email:', error);
        else console.log('Unban email sent:', info.response);
    });
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
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.log('Error sending partner approval email:', error);
        else console.log('Partner approval email sent:', info.response);
    });
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
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.log('Error sending partner rejection email:', error);
        else console.log('Partner rejection email sent:', info.response);
    });
};

/**
 * Send Password Change Alert
 */
const sendPasswordChangeAlert = ({ email, name }) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM || '"Arena Pro Security" <hbrajpura110@gmail.com>',
        to: email,
        subject: 'Security Alert: Password Changed 🔐',
        html: `
            <div style="font-family: 'Segoe UI', system-ui, sans-serif; max-width: 600px; margin: auto; background-color: #0f172a; border-radius: 24px; border: 1px solid #1e293b; color: #f8fafc; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%); padding: 50px 40px; text-align: center;">
                    <div style="display: inline-block; padding: 15px; background: rgba(139, 92, 246, 0.2); border-radius: 50%; margin-bottom: 20px;">
                        <span style="font-size: 30px;">🔐</span>
                    </div>
                    <h1 style="margin: 0; font-size: 24px; font-weight: 900; text-transform: uppercase; color: #a78bfa;">Password Updated</h1>
                </div>
                <div style="padding: 40px; text-align: center;">
                    <p style="font-size: 16px; color: #cbd5e1;">Hello <strong>${name}</strong>,</p>
                    <p style="font-size: 15px; color: #94a3b8; line-height: 1.6;">The password for your Arena Pro account was recently changed. If you made this change, you can safely ignore this email.</p>
                    <div style="margin-top: 30px; padding: 20px; background: rgba(239, 68, 68, 0.1); border-radius: 12px; border: 1px solid rgba(239, 68, 68, 0.2);">
                        <p style="margin: 0; font-size: 12px; font-weight: 700; color: #ef4444; text-transform: uppercase;">Didn't make this change?</p>
                        <p style="margin: 5px 0 0; font-size: 12px; color: #f8fafc;">Please contact support immediately to secure your account.</p>
                    </div>
                </div>
            </div>
        `
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.log('Error sending password change alert email:', error);
        else console.log('Password change alert email sent:', info.response);
    });
};

/**
 * Send Booking Confirmation
 */
const sendBookingConfirmation = ({ email, name, venueName, date, timeSlot }) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM || '"Arena Pro" <hbrajpura110@gmail.com>',
        to: email,
        subject: 'Booking Confirmed! Get Ready to Play ⚽',
        html: `
            <div style="font-family: 'Segoe UI', system-ui, sans-serif; max-width: 600px; margin: auto; background-color: #0f172a; border-radius: 24px; border: 1px solid #1e293b; color: #f8fafc; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%); padding: 50px 40px; text-align: center;">
                    <span style="font-size: 40px; margin-bottom: 10px; display: block;">✅</span>
                    <h1 style="margin: 0; font-size: 28px; font-weight: 900; text-transform: uppercase; color: #fff;">Match Confirmed</h1>
                </div>
                <div style="padding: 40px;">
                    <p style="font-size: 16px; color: #cbd5e1; margin-bottom: 30px;">Hey <strong>${name}</strong>, your turf is locked in. Let's make it count.</p>
                    
                    <div style="background: #020617; border-radius: 16px; padding: 25px; border: 1px solid #334155;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding-bottom: 15px; color: #64748b; font-size: 12px; font-weight: 800; text-transform: uppercase;">Venue</td>
                                <td style="padding-bottom: 15px; text-align: right; color: #fff; font-weight: 700;">${venueName}</td>
                            </tr>
                            <tr>
                                <td style="padding-bottom: 15px; color: #64748b; font-size: 12px; font-weight: 800; text-transform: uppercase;">Date</td>
                                <td style="padding-bottom: 15px; text-align: right; color: #fff; font-weight: 700;">${date}</td>
                            </tr>
                            <tr>
                                <td style="color: #64748b; font-size: 12px; font-weight: 800; text-transform: uppercase;">Time Slot</td>
                                <td style="text-align: right; color: #3b82f6; font-weight: 900;">${timeSlot}</td>
                            </tr>
                        </table>
                    </div>
                </div>
            </div>
        `
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.log('Error sending booking confirmation email:', error);
        else console.log('Booking confirmation email sent:', info.response);
    });
};

/**
 * Send Inquiry Reply Email
 */
const sendInquiryReplyEmail = ({ email, name, subject, originalMessage, replyMessage }) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM || '"Arena Pro Support" <hbrajpura110@gmail.com>',
        to: email,
        subject: `Re: ${subject} - Arena Pro Support`,
        html: `
            <div style="font-family: 'Segoe UI', system-ui, sans-serif; max-width: 600px; margin: auto; background-color: #0f172a; border-radius: 24px; border: 1px solid #1e293b; color: #f8fafc; overflow: hidden;">
                <div style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-bottom: 2px solid #3b82f6; padding: 40px 40px; text-align: center;">
                    <h1 style="margin: 0; font-size: 24px; font-weight: 900; color: #fff;">Response to Your Inquiry</h1>
                </div>
                <div style="padding: 40px;">
                    <p style="font-size: 16px; color: #cbd5e1; margin-bottom: 25px;">Hello <strong>${name}</strong>,</p>
                    <p style="font-size: 15px; color: #fff; line-height: 1.6; white-space: pre-wrap;">${replyMessage}</p>
                    
                    <div style="margin-top: 40px; background: #020617; border-radius: 12px; padding: 20px; border-left: 4px solid #475569;">
                        <p style="margin: 0 0 10px; font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase;">Original Message</p>
                        <p style="margin: 0; font-size: 13px; color: #94a3b8; font-style: italic;">"${originalMessage}"</p>
                    </div>
                    
                    <p style="margin-top: 40px; font-size: 13px; color: #64748b; text-align: center;">Arena Pro Elite Support Team</p>
                </div>
            </div>
        `
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.log('Error sending inquiry reply email:', error);
        else console.log('Inquiry reply email sent:', info.response);
    });
};

/**
 * Send Booking Cancellation
 */
const sendBookingCancellation = ({ email, name, venueName, date, timeSlot }) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM || '"Arena Pro Operations" <hbrajpura110@gmail.com>',
        to: email,
        subject: 'URGENT: Session Status Modification 🏟️🚫',
        html: `
            <div style="font-family: 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 40px auto; background-color: #0c0e14; border-radius: 40px; overflow: hidden; border: 1px solid rgba(239, 68, 68, 0.3); box-shadow: 0 40px 100px rgba(0,0,0,0.5);">
                <!-- Animated-feel Header -->
                <div style="background: linear-gradient(180deg, #7f1d1d 0%, #0c0e14 100%); padding: 80px 40px; text-align: center; border-bottom: 1px solid rgba(255,255,255,0.05);">
                    <div style="width: 80px; height: 80px; line-height: 80px; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.4); border-radius: 24px; margin: 0 auto 30px; font-size: 32px;">
                        🚫
                    </div>
                    <h1 style="margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.05em; color: #ffffff; text-transform: uppercase; font-style: italic;">Deployment <span style="color: #ef4444;">Voided</span></h1>
                    <p style="margin: 10px 0 0; font-size: 11px; font-weight: 800; letter-spacing: 0.4em; color: rgba(239, 68, 68, 0.8); text-transform: uppercase;">Operational Update</p>
                </div>

                <div style="padding: 50px 50px 60px;">
                    <p style="font-size: 16px; color: #a0aec0; line-height: 1.8; margin: 0 0 40px; text-align: center;">
                        Hello <strong style="color: #ffffff;">${name}</strong>, please be advised that your upcoming session at <strong style="color: #ffffff;">${venueName}</strong> has been decommissioned by the venue partner.
                    </p>
                    
                    <!-- Intelligence Card -->
                    <div style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); border-radius: 30px; padding: 35px; margin-bottom: 45px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr>
                                <td style="padding-bottom: 25px; border-bottom: 1px solid rgba(255,255,255,0.05);">
                                    <p style="margin: 0; font-size: 10px; font-weight: 800; color: #4a5568; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 4px;">Assigned Venue</p>
                                    <p style="margin: 0; font-size: 15px; font-weight: 700; color: #ffffff;">${venueName}</p>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding: 25px 0; border-bottom: 1px solid rgba(255,255,255,0.05);">
                                    <p style="margin: 0; font-size: 10px; font-weight: 800; color: #4a5568; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 4px;">Scheduled Date</p>
                                    <p style="margin: 0; font-size: 15px; font-weight: 700; color: #ffffff;">${date}</p>
                                </td>
                            </tr>
                            <tr>
                                <td style="padding-top: 25px;">
                                    <p style="margin: 0; font-size: 10px; font-weight: 800; color: #4a5568; text-transform: uppercase; letter-spacing: 0.15em; margin-bottom: 4px;">Time Block</p>
                                    <p style="margin: 0; font-size: 16px; font-weight: 900; color: #ef4444; font-style: italic;">${timeSlot}</p>
                                </td>
                            </tr>
                        </table>
                    </div>

                    <p style="text-align: center; font-size: 13px; color: #4a5568; margin-bottom: 40px; line-height: 1.6;">
                        This reservation has been successfully voided in our systems. Any transactional credits will be processed in accordance with the Arena Pro Service Agreement.
                    </p>
                    
                    <a href="http://localhost:5173/venues" style="display: block; text-align: center; background: #ffffff; color: #000000; padding: 22px; border-radius: 18px; text-decoration: none; font-weight: 900; text-transform: uppercase; letter-spacing: 0.1em; font-size: 13px; transition: all 0.3s ease;">
                        Re-deploy Session
                    </a>
                </div>

                <div style="background-color: #000000; padding: 40px; text-align: center; border-top: 1px solid rgba(255,255,255,0.03);">
                    <p style="margin: 0; font-size: 10px; color: #2d3748; letter-spacing: 0.3em; font-weight: 900; text-transform: uppercase;">
                        Arena Pro Intelligence • Session Management
                    </p>
                </div>
            </div>
        `
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.log('Error sending booking cancellation email:', error);
        else console.log('Booking cancellation email sent:', info.response);
    });
};

/**
 * Send Tournament Registration Confirmation
 */
const sendTournamentRegistrationEmail = ({ email, name, tournamentName, teamName, entryFee, date, players }) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM || '"Arena Pro Championships" <hbrajpura110@gmail.com>',
        to: email,
        subject: `Locked & Loaded: ${teamName} is for ${tournamentName}! 🏆`,
        html: `
            <div style="font-family: 'Inter', system-ui, sans-serif; max-width: 600px; margin: auto; background-color: #020617; border-radius: 32px; overflow: hidden; border: 1px solid #facc15; color: #f8fafc;">
                <div style="background: linear-gradient(135deg, #713f12 0%, #a16207 100%); padding: 70px 40px; text-align: center;">
                    <div style="display: inline-block; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 20px; margin-bottom: 20px;">
                        <span style="font-size: 40px;">🏆</span>
                    </div>
                    <h1 style="margin: 0; font-size: 34px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; font-style: italic; color: #facc15;">Challenge Accepted.</h1>
                    <p style="margin: 5px 0 0; font-size: 14px; font-weight: 800; color: #fff; text-transform: uppercase; letter-spacing: 3px;">${tournamentName}</p>
                </div>
                
                <div style="padding: 50px 40px;">
                    <p style="font-size: 16px; margin-bottom: 30px; color: #94a3b8; text-align: center;">
                        Athlete <strong style="color: #fff;">${name}</strong>, your deployment is authorized. 
                        The <strong style="color: #facc15;">${teamName}</strong> is officially entered into the arena.
                    </p>
                    
                    <div style="background: #0f172a; border-radius: 24px; padding: 30px; border: 1px solid #1e293b; margin-bottom: 40px;">
                        <table style="width: 100%; border-collapse: collapse;">
                            <tr style="border-bottom: 1px solid #1e293b;">
                                <td style="padding: 15px 0; color: #64748b; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">Engagement Date</td>
                                <td style="padding: 15px 0; text-align: right; color: #fff; font-weight: 700;">${date}</td>
                            </tr>
                            <tr style="border-bottom: 1px solid #1e293b;">
                                <td style="padding: 15px 0; color: #64748b; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">Entry Fee Paid</td>
                                <td style="padding: 15px 0; text-align: right; color: #facc15; font-weight: 900;">₹${entryFee}</td>
                            </tr>
                            <tr>
                                <td style="padding: 15px 0; color: #64748b; font-size: 11px; font-weight: 900; text-transform: uppercase; letter-spacing: 1px;">Status</td>
                                <td style="padding: 15px 0; text-align: right; color: #10b981; font-weight: 900; text-transform: uppercase;">Confirmed</td>
                            </tr>
                        </table>
                    </div>

                    <h4 style="font-size: 10px; font-weight: 900; color: #64748b; text-transform: uppercase; letter-spacing: 3px; margin: 0 0 15px; text-align: center;">Confirmed Roster</h4>
                    <div style="display: flex; flex-wrap: wrap; justify-content: center; gap: 8px; margin-bottom: 40px;">
                        ${players.map(p => `
                            <span style="padding: 6px 12px; background: #1e293b; border-radius: 8px; color: #cbd5e1; font-size: 11px; font-weight: 700; border: 1px solid #334155; margin: 4px;">${p}</span>
                        `).join('')}
                    </div>

                    <a href="http://localhost:5173/profile" style="display: block; text-align: center; background-color: #facc15; color: #000; padding: 22px; border-radius: 16px; text-decoration: none; font-weight: 900; text-transform: uppercase; letter-spacing: 2px; font-size: 13px; box-shadow: 0 10px 40px rgba(250, 204, 21, 0.15);">View Your Match Center</a>
                </div>

                <div style="background-color: #000; padding: 35px; text-align: center; border-top: 1px solid #1e293b;">
                    <p style="margin: 0; font-size: 10px; color: #475569; letter-spacing: 2px; font-weight: 800; text-transform: uppercase;">ARENA PRO CHAMPIONSHIPS • PLAY FOR GLORY</p>
                </div>
            </div>
        `
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.log('Error sending tournament registration email:', error);
        else console.log('Tournament registration email sent:', info.response);
    });
};

/**
 * Send Event Join Notification to Organizer
 */
const sendEventJoinNotification = ({ organizerEmail, organizerName, eventTitle, joinerName }) => {
    const mailOptions = {
        from: process.env.EMAIL_FROM || '"Arena Pro Community" <hbrajpura110@gmail.com>',
        to: organizerEmail,
        subject: `New Athlete Alert! ${joinerName} just joined your ${eventTitle}! 🏟️`,
        html: `
            <div style="font-family: 'Segoe UI', system-ui, sans-serif; max-width: 600px; margin: auto; background-color: #0c0a09; border-radius: 32px; overflow: hidden; border: 1px solid #22c55e; color: #f8fafc;">
                <div style="background: linear-gradient(135deg, #14532d 0%, #22c55e 100%); padding: 60px 40px; text-align: center;">
                    <div style="display: inline-block; padding: 15px; background: rgba(0,0,0,0.3); border-radius: 20px; margin-bottom: 20px;">
                        <span style="font-size: 40px;">👤</span>
                    </div>
                    <h1 style="margin: 0; font-size: 28px; font-weight: 950; letter-spacing: -1px; text-transform: uppercase; font-style: italic; color: #000;">Squad Member Added</h1>
                </div>
                
                <div style="padding: 50px 40px;">
                    <p style="font-size: 16px; margin-bottom: 30px; color: #a1a1aa; text-align: center;">
                        Hello <strong style="color: #fff;">${organizerName}</strong>, your community event is gaining traction!
                        <strong style="color: #22c55e;">${joinerName}</strong> has just reserved a spot in your squad.
                    </p>
                    
                    <div style="background: #1c1917; border-radius: 24px; padding: 30px; border: 1px solid #292524; margin-bottom: 40px;">
                        <p style="margin: 0 0 5px; font-size: 10px; font-weight: 900; color: #57534e; text-transform: uppercase; letter-spacing: 2px;">Target Event</p>
                        <p style="margin: 0 0 20px; font-size: 18px; font-weight: 800; color: #fff;">${eventTitle}</p>
                        
                        <div style="height: 1px; background: #292524; margin-bottom: 20px;"></div>
                        
                        <p style="margin: 0 0 5px; font-size: 10px; font-weight: 900; color: #57534e; text-transform: uppercase; letter-spacing: 2px;">Joined Athlete</p>
                        <p style="margin: 0; font-size: 18px; font-weight: 800; color: #22c55e;">${joinerName}</p>
                    </div>

                    <a href="http://localhost:5173/community" style="display: block; text-align: center; background-color: #f8fafc; color: #000; padding: 20px; border-radius: 16px; text-decoration: none; font-weight: 950; text-transform: uppercase; letter-spacing: 1px; font-size: 13px;">View Live Hub</a>
                </div>

                <div style="background-color: #000; padding: 30px; text-align: center; border-top: 1px solid #1c1917;">
                    <p style="margin: 0; font-size: 10px; color: #44403c; letter-spacing: 1px; font-weight: 800; text-transform: uppercase;">ARENA PRO INTEL • COMMUNITY SYNC</p>
                </div>
            </div>
        `
    };
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) console.log('Error sending event join notification:', error);
        else console.log('Event join notification sent:', info.response);
    });
};

module.exports = {
    sendWelcomeEmail,
    sendBanEmail,
    sendUnbanEmail,
    sendPartnerApprovalEmail,
    sendPartnerRejectionEmail,
    sendPasswordChangeAlert,
    sendBookingConfirmation,
    sendBookingCancellation,
    sendTournamentRegistrationEmail,
    sendInquiryReplyEmail,
    sendEventJoinNotification
};

