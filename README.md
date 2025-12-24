# Sentinel Discord Bot

## 🌟 An Advanced AI-Powered Discord Assistant

Sentinel is a sophisticated Discord bot designed to elevate your server's experience with the power of Google's Gemini AI. From intelligent chat responses to comprehensive moderation and fun utility commands, Sentinel is built to be a flexible and engaging assistant for any community.

## ✨ Features

- **🧠 AI-Powered Conversations:** Engage in natural and intelligent discussions powered by Gemini AI.
- **🛡️ Robust Moderation:** Keep your server safe and organized with a suite of administration commands (kick, ban, timeout, warn, role management, channel management, message deletion, and more).
- **💡 Contextual AI:** Customize the bot's AI responses to fit your server's specific needs and topics.
- **📊 Utility & Fun Commands:** Access a variety of helpful and entertaining commands like user info, server info, polls, 8-ball, and random facts.
- **📢 Forum Auto-Responder:** Automatically respond to new forum posts with AI-generated answers, providing immediate assistance.

## 🌐 Website & Support

Visit our official website to check the bot's status and learn more:
[Sentinel Discord Bot](https://sentinel-discordbot.onrender.com)

For support, feature requests, or any questions, please contact us via email at gl.aarav@gmail.com.

We are always striving to improve Sentinel and greatly appreciate your feedback!

## 🚀 Commands

Sentinel offers a wide array of commands, accessible via slash commands (`/`) and some legacy message commands (`!`).

### AI Commands
- `/askquestion <question>`: Ask AI a question with context.
- `!chat <message>`: Ask AI via AI (no context).
- `/setcontext <text>`: Update AI response behavior (Admin).
- `/getcontext`: Get AI context (Admin).
- `/summarize <amount>`: Summarize recent messages (Bot Access or Admin).

### Moderation Commands (Admin Only)
- `/kick <user> [reason]`: Kick a user from the server.
- `/ban <user> [reason]`: Ban a user from the server.
- `/timeout <user> <duration>`: Time out a user for a specified duration (in minutes).
- `/untimeout <user>`: Remove a timeout from a user.
- `/warn <user> <reason>`: Issue a warning to a user.
- `/nick <user> <nickname>`: Change a user's nickname.
- `/slowmode <duration>`: Set the slowmode for the current channel (in seconds).
- `/lock`: Lock a channel, preventing non-admin users from sending messages.
- `/unlock`: Unlock a channel, allowing non-admin users to send messages.
- `/delete <amount>`: Delete a number of recent messages in the channel (1–100, <14 days).
- `/deleteall`: Purge recent messages, recreating the channel if messages are older than 14 days.
- `/addrole <role> <user>`: Assign a role to a user.
- `/removerole <role> <user>`: Remove a role from a user.
- `/createrole <name>`: Create a new role.
- `/deleterole <name>`: Delete a role.
- `/renamerole <old> <new>`: Rename an existing role.
- `/createchannel <name>`: Create a new text channel.
- `/deletechannel <#channel>`: Delete a text channel.
- `/createprivatechannel <user>`: Create a private text channel for a user and admins.
- `/senddm <user> <message>`: Send a direct message to a user.
- `/verify <user>`: Add the "Students" role to a user.

### Utility & Fun Commands (Bot Access or Admin)
- `/help`: Shows a list of all available commands.
- `/ping`: Check the bot's latency.
- `/userinfo [user]`: Display information about a user.
- `/serverinfo`: Display information about the server.
- `/avatar [user]`: Get the avatar of a user.
- `/embed <title> <description> [color]`: Send a custom embed message.
- `/poll <question>`: Create a simple yes/no poll.
- `/8ball <question>`: Answers a yes/no question with a magical 8-ball response.
- `/randomfact`: Get a random fun fact.