// ==================== Express / Webserver ====================
const express = require("express");
const app = express();
const path = require("path");

app.use(express.static("public"));

app.get("/run", (req, res) => {
  console.log("Run button clicked!");
  res.send("✅ Run action triggered!");
});

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/api/bot-status", (req, res) => {
  if (client.isReady()) {
    res.json({
      status: "online",
      latency: client.ws.ping,
      uptime: client.uptime,
    });
  } else {
    res.json({
      status: "offline",
      latency: "N/A",
      uptime: "N/A",
    });
  }
});

app.get("/api/commands", (req, res) => {
  // Use SLASH_COMMANDS to dynamically generate the list of commands
  const commands = SLASH_COMMANDS.map(cmd => {
    // Determine if the command is admin-only. The adminCommands array is defined later in the file.
    // For now, we'll assume a command is admin if it's in the hardcoded list from the original file.
    // This will be properly linked to the 'adminCommands' array later.
    const isAdminCommand = adminCommands.includes(cmd.name);
    return {
      name: `/${cmd.name}`,
      description: cmd.description,
      admin: isAdminCommand,
    };
  });
  res.json(commands);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

// ==================== Discord & Gemini Setup ====================
require("dotenv").config({ path: "./ai_bot.env" });
const {
  Client,
  GatewayIntentBits,
  PermissionsBitField,
  ChannelType,
  REST,
  Routes,
  SlashCommandBuilder,
  Partials,
  MessageFlags,
} = require("discord.js");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.GuildVoiceStates,
    GatewayIntentBits.GuildInvites,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.Channel, Partials.Message, Partials.Reaction],
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const ADMIN_ROLE = "Admin";
const BOT_ACCESS_ROLE = "botAccess";

// Default AI context
let contextPrompt = "You are a helpful assistant that provides concise initial answers. This is a Machine Learning club and any other topic than machine learning is discouraged. You should be extra polite and if people go off topic make a sentence that is friendly saying that the topic should be about machine learning only. Use emojis if necessary. Always make sure people don’t get offended. If a person is off topic try not to ask a follow up question.";

const adminCommands = ["delete", "getcontext", "deleteall", "setcontext", "addrole", "removerole", "createrole", "deleterole", "renamerole", "createchannel", "deletechannel", "createprivatechannel", "senddm", "verify", "kick", "ban", "timeout", "untimeout", "warn", "nick", "slowmode", "lock", "unlock", "summarize"];

const SLASH_COMMANDS = [
  new SlashCommandBuilder()
    .setName("delete")
    .setDescription("Delete a number of recent messages in this channel (1–100, <14 days)")
    .addIntegerOption(opt =>
      opt.setName("amount")
        .setDescription("Number of messages to delete (1–100)")
        .setRequired(true)
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName("getcontext")
    .setDescription("Displays the AI's current context.")
    .toJSON(),
  new SlashCommandBuilder()
    .setName("deleteall")
    .setDescription("Delete all messages in this channel (handles 14-day limit; may nuke channel)")
    .toJSON(),
  new SlashCommandBuilder()
    .setName("help")
    .setDescription("Shows a list of all available commands.")
    .toJSON(),
  new SlashCommandBuilder()
    .setName("setcontext")
    .setDescription("Updates the AI's response behavior/context.")
    .addStringOption(option =>
      option.setName("text")
        .setDescription("The new context for the AI.")
        .setRequired(true)
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName("addrole")
    .setDescription("Assigns a role to a user.")
    .addRoleOption(option =>
      option.setName("role")
        .setDescription("The role to add.")
        .setRequired(true)
    )
    .addUserOption(option =>
      option.setName("user")
        .setDescription("The user to give the role to.")
        .setRequired(true)
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName("removerole")
    .setDescription("Removes a role from a user.")
    .addRoleOption(option =>
      option.setName("role")
        .setDescription("The role to remove.")
        .setRequired(true)
    )
    .addUserOption(option =>
      option.setName("user")
        .setDescription("The user to remove the role from.")
        .setRequired(true)
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName("createrole")
    .setDescription("Creates a new role.")
    .addStringOption(option =>
      option.setName("name")
        .setDescription("The name for the new role.")
        .setRequired(true)
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName("deleterole")
    .setDescription("Deletes a role.")
    .addRoleOption(option =>
      option.setName("name")
        .setDescription("The role to delete.")
        .setRequired(true)
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName("renamerole")
    .setDescription("Renames an existing role.")
    .addRoleOption(option =>
      option.setName("old_name")
        .setDescription("The role to rename.")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("new_name")
        .setDescription("The new name for the role.")
        .setRequired(true)
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName("createchannel")
    .setDescription("Creates a new text channel.")
    .addStringOption(option =>
      option.setName("name")
        .setDescription("The name for the new channel.")
        .setRequired(true)
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName("deletechannel")
    .setDescription("Deletes a text channel.")
    .addChannelOption(option =>
      option.setName("channel")
        .setDescription("The channel to delete.")
        .setRequired(true)
        .addChannelTypes(ChannelType.GuildText)
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName("createprivatechannel")
    .setDescription("Creates a private text channel for a user and admins.")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("The user to create the private channel for.")
        .setRequired(true)
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName("senddm")
    .setDescription("Sends a direct message to a user.")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("The user to send the DM to.")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("message")
        .setDescription("The message to send.")
        .setRequired(true)
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName("verify")
    .setDescription("Adds the 'Students' role to a user.")
    .addUserOption(option =>
      option.setName("usr")
        .setDescription("The user to add the role to.")
        .setRequired(true)
    )
    .toJSON(),
  // ➕ New Moderation Commands
  new SlashCommandBuilder()
    .setName("kick")
    .setDescription("Kicks a user from the server.")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("The user to kick.")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("reason")
        .setDescription("The reason for the kick.")
        .setRequired(false)
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName("ban")
    .setDescription("Bans a user from the server.")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("The user to ban.")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("reason")
        .setDescription("The reason for the ban.")
        .setRequired(false)
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName("timeout")
    .setDescription("Times out a user for a specified duration.")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("The user to time out.")
        .setRequired(true)
    )
    .addIntegerOption(option =>
      option.setName("duration")
        .setDescription("Duration in minutes (e.g., 60 for 1 hour).")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("reason")
        .setDescription("The reason for the timeout.")
        .setRequired(false)
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName("untimeout")
    .setDescription("Removes a timeout from a user.")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("The user to remove the timeout from.")
        .setRequired(true)
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName("warn")
    .setDescription("Issues a warning to a user.")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("The user to warn.")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("reason")
        .setDescription("The reason for the warning.")
        .setRequired(true)
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName("nick")
    .setDescription("Changes a user's nickname.")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("The user to change the nickname of.")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("nickname")
        .setDescription("The new nickname.")
        .setRequired(true)
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName("slowmode")
    .setDescription("Sets the slowmode for the current channel.")
    .addIntegerOption(option =>
      option.setName("duration")
        .setDescription("Slowmode duration in seconds (0 to disable).")
        .setRequired(true)
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName("lock")
    .setDescription("Locks a channel, preventing non-admin users from sending messages.")
    .toJSON(),
  new SlashCommandBuilder()
    .setName("unlock")
    .setDescription("Unlocks a channel, allowing non-admin users to send messages.")
    .toJSON(),

  // ➕ New AI Commands
  new SlashCommandBuilder()
    .setName("summarize")
    .setDescription("Summarizes a specified number of recent messages.")
    .addIntegerOption(option =>
      option.setName("amount")
        .setDescription("The number of messages to summarize (1-50).")
        .setRequired(true)
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName("askquestion")
    .setDescription("Ask AI a question with context.")
    .addStringOption(option =>
      option.setName("question")
        .setDescription("The question to ask AI.")
        .setRequired(true)
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName("ping")
    .setDescription("Checks the bot's latency.")
    .toJSON(),

  // ➕ New Utility & Fun Commands
  new SlashCommandBuilder()
    .setName("userinfo")
    .setDescription("Displays information about a user.")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("The user to get info about.")
        .setRequired(false)
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName("serverinfo")
    .setDescription("Displays information about the server.")
    .toJSON(),
  new SlashCommandBuilder()
    .setName("avatar")
    .setDescription("Gets the avatar of a user.")
    .addUserOption(option =>
      option.setName("user")
        .setDescription("The user to get the avatar of.")
        .setRequired(false)
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName("embed")
    .setDescription("Sends a custom embed message.")
    .addStringOption(option =>
      option.setName("title")
        .setDescription("The title of the embed.")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("description")
        .setDescription("The description of the embed.")
        .setRequired(true)
    )
    .addStringOption(option =>
      option.setName("color")
        .setDescription("The color of the embed (hex code, e.g., #0099ff).")
        .setRequired(false)
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName("poll")
    .setDescription("Creates a simple yes/no poll.")
    .addStringOption(option =>
      option.setName("question")
        .setDescription("The question for the poll.")
        .setRequired(true)
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName("8ball")
    .setDescription("Answers a yes/no question with a magical 8-ball response.")
    .addStringOption(option =>
      option.setName("question")
        .setDescription("The question for the 8-ball.")
        .setRequired(true)
    )
    .toJSON(),
  new SlashCommandBuilder()
    .setName("randomfact")
    .setDescription("Gets a random fun fact.")
    .toJSON(),
];

// ==================== Helpers ====================
function isAdministrator(member) {
  if (!member) return false;
  return member.permissions.has(PermissionsBitField.Flags.Administrator);
}

function hasBotAccess(member) {
  if (!member) return false;
  return isAdministrator(member) || member.roles.cache.some(role => role.name === BOT_ACCESS_ROLE);
}

function splitMessage(message) {
  const chunks = [];
  while (message.length > 0) {
    let chunk = message.slice(0,1575);

    // Prefer to cut at the last newline if one exists in this chunk
    const lastNewline = chunk.lastIndexOf("\n");
    if (lastNewline !== -1 && message.length > 2000) {
      chunk = chunk.slice(0, lastNewline);
    }

    chunks.push(chunk);
    message = message.slice(chunk.length);
  }
  return chunks;
}

function getRole(guild, roleArg) {
  if (!roleArg) return null;
  const mentionMatch = roleArg.match(/^<@&(\d+)>$/);
  if (mentionMatch) return guild.roles.cache.get(mentionMatch[1]);
  return guild.roles.cache.find(
    (r) => r.name.toLowerCase() === roleArg.toLowerCase()
  );
}

function getMember(guild, userArg) {
  if (!userArg) return null;
  const mentionMatch = userArg.match(/^<@!?(\d+)>$/);
  if (mentionMatch) return guild.members.cache.get(mentionMatch[1]);
  return guild.members.cache.find(
    (m) =>
      m.user.username.toLowerCase() === userArg.toLowerCase() ||
      (m.nickname && m.nickname.toLowerCase() === userArg.toLowerCase())
  );
}

function getChannel(guild, channelArg) {
  if (!channelArg) return null;
  const mentionMatch = channelArg.match(/^<#(\d+)>$/);
  if (mentionMatch) return guild.channels.cache.get(mentionMatch[1]);
  return guild.channels.cache.find(
    (c) => c.name.toLowerCase() === channelArg.toLowerCase()
  );
}

// Utility: check perms in a channel for the bot
function botPermsIn(channel) {
  return channel.guild.members.me.permissionsIn(channel);
}

async function registerSlashCommandsForGuild(guildId) {
  const rest = new REST({ version: "10" }).setToken(process.env.DISCORD_BOT_TOKEN);
  try {
    console.log(`Attempting to register slash commands for guild ${guildId}...`);
    // Clear existing commands for this guild to prevent duplicates
    await rest.put(Routes.applicationGuildCommands(client.user.id, guildId), { body: [] });
    console.log(`Cleared existing commands in guild ${guildId}`);
    // Register new commands
    await rest.put(Routes.applicationGuildCommands(client.user.id, guildId), { body: SLASH_COMMANDS });
    console.log(`✅ Registered slash commands in guild ${guildId}`);
  } catch (err) {
    console.error(`Error registering slash commands in guild ${guildId}:`, err);
  }
}

// ==================== Bot Ready ====================
client.once("ready", async () => {
  console.log(`${client.user.tag} is online!`);

  try {
    const guilds = client.guilds.cache.map(g => g.id);
    for (const gid of guilds) {
      await registerSlashCommandsForGuild(gid);
    }
  } catch (err) {
    console.error("Error registering slash commands:", err);
  }
});

client.on("guildCreate", async (guild) => {
  await registerSlashCommandsForGuild(guild.id);
});

// ==================== Forum Post Auto-Responder ====================
client.on("threadCreate", async (thread) => {
  try {
    if (thread.parent?.name.toLowerCase() !== "questions") return;

    await thread.join();

    const messages = await thread.messages.fetch({ limit: 1 });
    const firstMessage = messages.first();
    if (!firstMessage) return;

    const prompt = `${contextPrompt}\n\nUser asked: ${firstMessage.content}`;
    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    await thread.send(
      `${firstMessage.author}, **AI Response** *(an instructor will respond with a full response within 1 business day)*:\n\n${response}`
    );
  } catch (err) {
    console.error("Error handling forum post:", err);
  }
});

// ==================== Slash Commands Handler ====================
client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;
  if (!interaction.inGuild()) {
    return interaction.reply({ content: "❌ This command can only be used in servers.", flags: [MessageFlags.Ephemeral] });
  }

  const channel = interaction.channel;
  const perms = botPermsIn(channel);
  const isUserAdmin = isAdministrator(interaction.member);
  const canUseBot = hasBotAccess(interaction.member);

  // Help Command
  if (interaction.commandName === "help") {
    let helpMessage = `\`\`\`\n📘 Available Commands\n\nAI (Bot Access or Admin):\n!chat <message>                → Ask AI via AI (no context)\n${SLASH_COMMANDS.filter(cmd => !adminCommands.includes(cmd.name) && (cmd.name === 'setcontext' || cmd.name === 'getcontext' || cmd.name === 'summarize' || cmd.name === 'askquestion')).map(cmd => `/${cmd.name} ${cmd.options.map(opt => `<${opt.name}>`).join(' ')}`.trim()).join('\n')}\n\nModeration (Admin Only):\n${SLASH_COMMANDS.filter(cmd => adminCommands.includes(cmd.name)).map(cmd => `/${cmd.name} ${cmd.options.map(opt => `<${opt.name}>`).join(' ')}`.trim()).join('\n')}\n\nUtility & Fun (Bot Access or Admin):\n!help                          → Show this help message\n${SLASH_COMMANDS.filter(cmd => !adminCommands.includes(cmd.name) && (cmd.name === 'ping' || cmd.name === 'userinfo' || cmd.name === 'serverinfo' || cmd.name === 'avatar' || cmd.name === 'embed' || cmd.name === 'poll' || cmd.name === '8ball' || cmd.name === 'randomfact')).map(cmd => `/${cmd.name} ${cmd.options.map(opt => `<${opt.name}>`).join(' ')}`.trim()).join('\n')}\`\`\`;\n    // Fix: Defer reply and split the message to avoid character limit issues\n    await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });\n    const helpChunks = splitMessage(helpMessage);\n    await interaction.editReply({ content: helpChunks[0] });\n    for (let i = 1; i < helpChunks.length; i++) {\n        await interaction.followUp({ content: helpChunks[i], flags: [MessageFlags.Ephemeral] });\n    }\n    return;\n  }\n\n  // Bot Access check for all commands (except 'help')\n  if (!canUseBot) {\n    return interaction.reply({ content: `❌ You need the "${BOT_ACCESS_ROLE}" role or Administrator permissions to use this bot.`, flags: [MessageFlags.Ephemeral] });\n  }\n\n  // Admin-only slash commands\n  if (adminCommands.includes(interaction.commandName) && !isUserAdmin) {\n    return interaction.reply({ content: "❌ You don't have permission to use this command.", flags: [MessageFlags.Ephemeral] });\n  }\n\n  switch (interaction.commandName) {\n    // Existing commands\n    case "setcontext": {\n      const newContext = interaction.options.getString("text");\n      contextPrompt = newContext;\n      return interaction.reply({ content: "✅ AI context updated successfully!", flags: [MessageFlags.Ephemeral] });\n    }\n    case "getcontext": {\n  return interaction.reply({ content: `✅ The current AI context is:\n\`\`\`${contextPrompt}\`\`\``, flags: [MessageFlags.Ephemeral] });\n}\n    case "addrole": {\n      const role = interaction.options.getRole("role");\n      const member = interaction.options.getMember("user");\n      if (!role || !member) return interaction.reply({ content: "❌ Role or user not found.", flags: [MessageFlags.Ephemeral] });\n      if (interaction.member.roles.highest.comparePositionTo(role) <= 0) {\n        return interaction.reply({ content: "❌ You cannot add a role higher or equal to your own.", flags: [MessageFlags.Ephemeral] });\n      }\n      try {\n        await member.roles.add(role);\n        return interaction.reply({ content: `✅ Added ${role.name} to ${member.user.tag}.`, flags: [MessageFlags.Ephemeral] });\n      } catch (err) {\n        console.error(err);\n        return interaction.reply({ content: `❌ Failed to add the role to ${member.user.tag}.`, flags: [MessageFlags.Ephemeral] });\n      }\n    }\n    case "removerole": {\n      const role = interaction.options.getRole("role");\n      const member = interaction.options.getMember("user");\n      if (!role || !member) return interaction.reply({ content: "❌ Role or user not found.", flags: [MessageFlags.Ephemeral] });\n      if (interaction.member.roles.highest.comparePositionTo(role) <= 0) {\n        return interaction.reply({ content: "❌ You cannot remove a role higher or equal to your own.", flags: [MessageFlags.Ephemeral] });\n      }\n      try {\n        await member.roles.remove(role);\n        return interaction.reply({ content: `✅ Removed ${role.name} from ${member.user.tag}.`, flags: [MessageFlags.Ephemeral] });\n      } catch (err) {\n        console.error(err);\n        return interaction.reply({ content: `❌ Failed to remove the role from ${member.user.tag}.`, flags: [MessageFlags.Ephemeral] });\n      }\n    }\n    case "createrole": {\n      const roleName = interaction.options.getString("name");\n      try {\n        await interaction.guild.roles.create({ name: roleName });\n        return interaction.reply({ content: `✅ Role "${roleName}" created.`, flags: [MessageFlags.Ephemeral] });\n      } catch (err) {\n        console.error(err);\n        return interaction.reply({ content: "❌ Failed to create role.", flags: [MessageFlags.Ephemeral] });\n      }\n    }\n    case "deleterole": {\n      const role = interaction.options.getRole("name");\n      if (interaction.member.roles.highest.comparePositionTo(role) <= 0) {\n        return interaction.reply({ content: "❌ You cannot delete a role higher or equal to your own.", flags: [MessageFlags.Ephemeral] });\n      }\n      try {\n        await role.delete();\n        return interaction.reply({ content: `✅ Role "${role.name}" deleted.`, flags: [MessageFlags.Ephemeral] });\n      } catch (err) {\n        console.error(err);\n        return interaction.reply({ content: `❌ Failed to delete role "${role.name}".`, flags: [MessageFlags.Ephemeral] });\n      }\n    }\n    case "renamerole": {\n      const oldRole = interaction.options.getRole("old_name");\n      const newName = interaction.options.getString("new_name");\n      if (interaction.member.roles.highest.comparePositionTo(oldRole) <= 0) {\n        return interaction.reply({ content: "❌ You cannot rename a role higher or equal to your own.", flags: [MessageFlags.Ephemeral] });\n      }\n      try {\n        await oldRole.setName(newName);\n        return interaction.reply({ content: `✅ Renamed "${oldRole.name}" to "${newName}".`, flags: [MessageFlags.Ephemeral] });\n      } catch (err) {\n        console.error(err);\n        return interaction.reply({ content: "❌ Failed to rename the role.", flags: [MessageFlags.Ephemeral] });\n      }\n    }\n    case "createchannel": {\n      const name = interaction.options.getString("name");\n      try {\n        const ch = await interaction.guild.channels.create({\n          name,\n          type: ChannelType.GuildText,\n        });\n        return interaction.reply({ content: `✅ Channel created: ${ch.toString()}`, flags: [MessageFlags.Ephemeral] });\n      } catch (err) {\n        console.error(err);\n        return interaction.reply({ content: "❌ Failed to create channel.", flags: [MessageFlags.Ephemeral] });\n      }\n    }\n    case "deletechannel": {\n      const ch = interaction.options.getChannel("channel");\n      try {\n        await ch.delete();\n        return interaction.reply({ content: `✅ Channel deleted: ${ch.name}`, flags: [MessageFlags.Ephemeral] });\n      } catch (err) {\n        console.error(err);\n        return interaction.reply({ content: "❌ Failed to delete channel.", flags: [MessageFlags.Ephemeral] });\n      }\n    }\n    case "createprivatechannel": {\n      const user = interaction.options.getMember("user");\n      const adminRole = interaction.guild.roles.cache.find((r) => r.name === ADMIN_ROLE);\n      const overwrites = [\n        { id: interaction.guild.id, deny: [PermissionsBitField.Flags.ViewChannel] },\n        {\n          id: user.id,\n          allow: [\n            PermissionsBitField.Flags.ViewChannel,\n            PermissionsBitField.Flags.SendMessages,\n            PermissionsBitField.Flags.ReadMessageHistory,\n          ],\n        },\n      ];\n      if (adminRole) {\n        overwrites.push({\n          id: adminRole.id,\n          allow: [\n            PermissionsBitField.Flags.ViewChannel,\n            PermissionsBitField.Flags.SendMessages,\n            PermissionsBitField.Flags.ReadMessageHistory,\n            PermissionsBitField.Flags.ManageChannels,\n          ],\n        });\n      }\n\n      try {\n        const privateCh = await interaction.guild.channels.create({\n          name: `${user.user.username}-private`,\n          type: ChannelType.GuildText,\n          permissionOverwrites: overwrites,\n        });\n        return interaction.reply({ content: `✅ Private channel created: ${privateCh.toString()}`, flags: [MessageFlags.Ephemeral] });\n      } catch (err) {\n        console.error(err);\n        return interaction.reply({ content: "❌ Failed to create private channel.", flags: [MessageFlags.Ephemeral] });\n      }\n    }\n    case "senddm": {\n      const member = interaction.options.getMember("user");\n      const dmMessage = interaction.options.getString("message");\n      try {\n        await member.send(dmMessage);\n        return interaction.reply({ content: `✅ Sent DM to ${member.user.tag}`, flags: [MessageFlags.Ephemeral] });\n      } catch (err) {\n        console.error(err);\n        return interaction.reply({ content: `❌ Could not send DM to ${member.user.tag}. They might have DMs disabled.`, flags: [MessageFlags.Ephemeral] });\n      }\n    }\n    case "delete": {\n      if (!perms.has(PermissionsBitField.Flags.ManageMessages) || !perms.has(PermissionsBitField.Flags.ReadMessageHistory)) {\n        return interaction.reply({\n          content: "❌ I need **Manage Messages** and **Read Message History** in this channel.",
          flags: [MessageFlags.Ephemeral],
        });
      }
      const amount = interaction.options.getInteger("amount");
      if (amount < 1 || amount > 100) {
        return interaction.reply({
          content: "⚠️ Please provide a number between **1** and **100**.",
          flags: [MessageFlags.Ephemeral],
        });
      }
      try {
        const deleted = await channel.bulkDelete(amount, true);
        await interaction.reply({
          content: `✅ Deleted **${deleted.size}** message(s) in ${channel}.`,
          flags: [MessageFlags.Ephemeral],
        });
      } catch (err) {
        console.error(err);
        await interaction.reply({ content: "❌ Failed to delete messages.", flags: [MessageFlags.Ephemeral] });
      }
      break;
    }
    case "deleteall": {
      if (!perms.has(PermissionsBitField.Flags.ManageMessages) || !perms.has(PermissionsBitField.Flags.ReadMessageHistory)) {
        return interaction.reply({
          content: "❌ I need **Manage Messages** and **Read Message History** in this channel.",
          flags: [MessageFlags.Ephemeral],
        });
      }

      await interaction.deferReply({ flags: [MessageFlags.Ephemeral] });

      const FOURTEEN_DAYS = 14 * 24 * 60 * 60 * 1000;
      let totalDeleted = 0;

      try {
        while (true) {
          const batch = await channel.messages.fetch({ limit: 100 });
          if (!batch.size) break;
          const now = Date.now();
          const deletable = batch.filter(msg => now - msg.createdTimestamp < FOURTEEN_DAYS);
          if (deletable.size === 0) break;
          const result = await channel.bulkDelete(deletable, true);
          totalDeleted += result.size;
          await new Promise(r => setTimeout(r, 750));
        }

        const leftover = await channel.messages.fetch({ limit: 1 });
        if (leftover.size === 0) {
          return interaction.editReply(`✅ Purged **${totalDeleted}** recent message(s). Channel is now empty.`);
        }

        if (!perms.has(PermissionsBitField.Flags.ManageChannels)) {
          return interaction.editReply(
            `✅ Purged **${totalDeleted}** recent message(s).\n` +
            `⚠️ I can't remove older messages (>14 days). Grant **Manage Channels** if you want me to recreate the channel (nuke).`
          );
        }

        const position = channel.position;
        const parent = channel.parent;
        const newChannel = await channel.clone({
          name: channel.name,
          reason: "Nuke channel to clear messages older than 14 days",
        });

        if (parent) await newChannel.setParent(parent.id, { lockPermissions: true });
        await newChannel.setPosition(position);
        await channel.delete("Nuked to clear messages older than 14 days");
        return interaction.editReply(
          `✅ Purged **${totalDeleted}** recent message(s).\n` +
          `🧨 Older messages couldn't be bulk-deleted, so I **recreated the channel**.\n` +
          `➡️ New channel: ${newChannel}`
        );
      } catch (err) {
        console.error(err);
        return interaction.editReply("❌ Failed to delete all messages (purge or nuke step errored).");
      }
    }
    case "verify": {
      const member = interaction.options.getMember("usr");
      const roleName = "Students";
      const role = interaction.guild.roles.cache.find(r => r.name === roleName);
      if (!role) {
        await interaction.reply({ content: `❌ Role "**${roleName}**" not found.`, flags: [MessageFlags.Ephemeral] });
        return;
      }
      if (!member) {
        await interaction.reply({ content: `❌ User not found.`, flags: [MessageFlags.Ephemeral] });
        return;
      }
      try {
        await member.roles.add(role);
        await interaction.reply({ content: `✅ Added the "**Students**" role to ${member.user.username}.` });
      } catch (err) {
        console.error(err);
        await interaction.reply({ content: `❌ Failed to add the role to ${member.user.username}.`, flags: [MessageFlags.Ephemeral] });
      }
      break;
    }

    // ➕ New Moderation Commands
    case "kick": {
      const user = interaction.options.getMember("user");
      const reason = interaction.options.getString("reason") || "No reason provided.";
      if (!user) return interaction.reply({ content: "❌ User not found.", flags: [MessageFlags.Ephemeral] });
      if (user.id === interaction.user.id) return interaction.reply({ content: "❌ You can't kick yourself.", flags: [MessageFlags.Ephemeral] });
      if (user.roles.highest.position >= interaction.member.roles.highest.position) return interaction.reply({ content: "❌ You cannot kick a user with a higher or equal role.", flags: [MessageFlags.Ephemeral] });
      try {
        await user.kick(reason);
        return interaction.reply({ content: `✅ Kicked ${user.user.tag}. Reason: ${reason}`, flags: [MessageFlags.Ephemeral] });
      } catch (err) {
        console.error(err);
        return interaction.reply({ content: "❌ Failed to kick user.", flags: [MessageFlags.Ephemeral] });
      }
    }
    case "ban": {
      const user = interaction.options.getMember("user");
      const reason = interaction.options.getString("reason") || "No reason provided.";
      if (!user) return interaction.reply({ content: "❌ User not found.", flags: [MessageFlags.Ephemeral] });
      if (user.id === interaction.user.id) return interaction.reply({ content: "❌ You can't ban yourself.", flags: [MessageFlags.Ephemeral] });
      if (user.roles.highest.position >= interaction.member.roles.highest.position) return interaction.reply({ content: "❌ You cannot ban a user with a higher or equal role.", flags: [MessageFlags.Ephemeral] });
      try {
        await user.ban({ reason });
        return interaction.reply({ content: `✅ Banned ${user.user.tag}. Reason: ${reason}`, flags: [MessageFlags.Ephemeral] });
      } catch (err) {
        console.error(err);
        return interaction.reply({ content: "❌ Failed to ban user.", flags: [MessageFlags.Ephemeral] });
      }
    }
    case "timeout": {
      const user = interaction.options.getMember("user");
      const duration = interaction.options.getInteger("duration");
      const reason = interaction.options.getString("reason") || "No reason provided.";
      if (!user) return interaction.reply({ content: "❌ User not found.", flags: [MessageFlags.Ephemeral] });
      if (user.id === interaction.user.id) return interaction.reply({ content: "❌ You can't time out yourself.", flags: [MessageFlags.Ephemeral] });
      if (user.roles.highest.position >= interaction.member.roles.highest.position) return interaction.reply({ content: "❌ You cannot time out a user with a higher or equal role.", flags: [MessageFlags.Ephemeral] });
      if (duration < 1 || duration > 28 * 24 * 60) return interaction.reply({ content: "❌ Duration must be between 1 minute and 28 days.", flags: [MessageFlags.Ephemeral] });
      try {
        await user.timeout(duration * 60 * 1000, reason);
        return interaction.reply({ content: `✅ Timed out ${user.user.tag} for ${duration} minutes. Reason: ${reason}`, flags: [MessageFlags.Ephemeral] });
      } catch (err) {
        console.error(err);
        return interaction.reply({ content: "❌ Failed to time out user.", flags: [MessageFlags.Ephemeral] });
      }
    }
    case "untimeout": {
      const user = interaction.options.getMember("user");
      if (!user) return interaction.reply({ content: "❌ User not found.", flags: [MessageFlags.Ephemeral] });
      try {
        await user.timeout(null);
        return interaction.reply({ content: `✅ Removed timeout from ${user.user.tag}.`, flags: [MessageFlags.Ephemeral] });
      } catch (err) {
        console.error(err);
        return interaction.reply({ content: "❌ Failed to remove timeout.", flags: [MessageFlags.Ephemeral] });
      }
    }
    case "warn": {
      const user = interaction.options.getMember("user");
      const reason = interaction.options.getString("reason");
      if (!user) return interaction.reply({ content: "❌ User not found.", flags: [MessageFlags.Ephemeral] });
      try {
        // You would typically store warnings in a database. For this example, we'll send a DM.
        await user.send(`⚠️ You have been warned in ${interaction.guild.name}. Reason: ${reason}`);
        return interaction.reply({ content: `✅ Warned ${user.user.tag}. Reason: ${reason}`, flags: [MessageFlags.Ephemeral] });
      } catch (err) {
                console.error(err);
        return interaction.reply({ content: "❌ Failed to warn user. They may have DMs disabled.", flags: [MessageFlags.Ephemeral] });
      }
    }
    case "nick": {
      const user = interaction.options.getMember("user");
      const newNickname = interaction.options.getString("nickname");
      if (!user) return interaction.reply({ content: "❌ User not found.", flags: [MessageFlags.Ephemeral] });
      if (user.roles.highest.position >= interaction.member.roles.highest.position) return interaction.reply({ content: "❌ You cannot change the nickname of a user with a higher or equal role.", flags: [MessageFlags.Ephemeral] });
      try {
        await user.setNickname(newNickname);
        return interaction.reply({ content: `✅ Changed ${user.user.tag}'s nickname to "${newNickname}".`, flags: [MessageFlags.Ephemeral] });
      } catch (err) {
        console.error(err);
        return interaction.reply({ content: "❌ Failed to change nickname.", flags: [MessageFlags.Ephemeral] });
      }
    }
    case "slowmode": {
      const duration = interaction.options.getInteger("duration");
      if (duration < 0 || duration > 21600) return interaction.reply({ content: "❌ Duration must be between 0 and 21600 seconds.", flags: [MessageFlags.Ephemeral] });
      try {
        await channel.setRateLimitPerUser(duration);
        if (duration > 0) {
          return interaction.reply({ content: `✅ Slowmode set to ${duration} seconds.`, flags: [MessageFlags.Ephemeral] });
        } else {
          return interaction.reply({ content: `✅ Slowmode disabled.`, flags: [MessageFlags.Ephemeral] });
        }
      } catch (err) {
        console.error(err);
        return interaction.reply({ content: "❌ Failed to set slowmode.", flags: [MessageFlags.Ephemeral] });
      }
    }
    case "lock": {
      const everyoneRole = interaction.guild.roles.cache.find(r => r.name === "@everyone");
      try {
        await channel.permissionOverwrites.edit(everyoneRole, { SendMessages: false });
        return interaction.reply({ content: "✅ Channel locked.", flags: [MessageFlags.Ephemeral] });
      } catch (err) {
        console.error(err);
        return interaction.reply({ content: "❌ Failed to lock channel.", flags: [MessageFlags.Ephemeral] });
      }
    }
    case "unlock": {
      const everyoneRole = interaction.guild.roles.cache.find(r => r.name === "@everyone");
      try {
        await channel.permissionOverwrites.edit(everyoneRole, { SendMessages: true });
        return interaction.reply({ content: "✅ Channel unlocked.", flags: [MessageFlags.Ephemeral] });
      } catch (err) {
        console.error(err);
        return interaction.reply({ content: "❌ Failed to unlock channel.", flags: [MessageFlags.Ephemeral] });
      }
    }

    // ➕ New AI Commands
    case "summarize": {
      await interaction.deferReply();
      const amount = interaction.options.getInteger("amount");
      if (amount < 1 || amount > 50) return interaction.editReply({ content: "❌ Please specify an amount between 1 and 50 messages.", flags: [MessageFlags.Ephemeral] });
      try {
        const messages = await channel.messages.fetch({ limit: amount });
        const textToSummarize = messages.map(msg => `${msg.author.tag}: ${msg.content}`).reverse().join('\n');
        const prompt = `Summarize the following conversation concisely:\n\n${textToSummarize}`;
        const result = await model.generateContent(prompt);
        const response = await result.response.text();
        splitMessage(response).forEach((chunk) => interaction.editReply(chunk));
      } catch (err) {
        console.error("Error summarizing messages:", err);
        return interaction.editReply({ content: "❌ Failed to summarize messages.", flags: [MessageFlags.Ephemeral] });
      }
      break;
    }
    case "askquestion": {
      await interaction.deferReply();
      const question = interaction.options.getString("question");
      try {
        const result = await model.generateContent(contextPrompt + `\n\nQuestion: ${question}`);
        const response = await result.response.text();
        interaction.editReply(response);
      } catch (err) {
        console.error("Error asking AI:", err);
        interaction.editReply({ content: "❌ An error occurred while asking AI.", flags: [MessageFlags.Ephemeral] });
      }
      break;
    }
    case "ping": {
      const latency = Math.round(client.ws.ping);
      interaction.reply(`🏓 Pong! Latency is ${latency}ms.`);
      break;
    }

    // ➕ New Utility & Fun Commands
    case "userinfo": {
      const user = interaction.options.getMember("user") || interaction.member;
      const embed = {
        color: 0x0099ff,
        title: `${user.user.username}'s Info`,
        thumbnail: { url: user.user.displayAvatarURL({ dynamic: true }) },
        fields: [
          { name: "👤 User", value: `${user.user.tag}`, inline: true },
          { name: "🆔 ID", value: `${user.id}`, inline: true },
          { name: "🗓️ Joined Discord", value: `<t:${Math.floor(user.user.createdTimestamp / 1000)}:f>`, inline: true },
          { name: "🗓️ Joined Server", value: `<t:${Math.floor(user.joinedTimestamp / 1000)}:f>`, inline: true },
          { name: "📝 Roles", value: user.roles.cache.map(r => r.toString()).join(" "), inline: false },
        ],
        footer: { text: `Requested by ${interaction.user.tag}`, icon_url: interaction.user.displayAvatarURL({ dynamic: true }) },
        timestamp: new Date(),
      };
      interaction.reply({ embeds: [embed] });
      break;
    }
    case "serverinfo": {
      const guild = interaction.guild;
      const owner = await guild.fetchOwner();
      const embed = {
        color: 0x0099ff,
        title: `${guild.name} Info`,
        thumbnail: { url: guild.iconURL({ dynamic: true }) },
        fields: [
          { name: "👑 Owner", value: `${owner.user.tag}`, inline: true },
          { name: "🆔 ID", value: `${guild.id}`, inline: true },
          { name: "🗓️ Created On", value: `<t:${Math.floor(guild.createdTimestamp / 1000)}:f>`, inline: true },
          { name: "👥 Members", value: `${guild.memberCount}`, inline: true },
          { name: "💬 Channels", value: `${guild.channels.cache.size}`, inline: true },
          { name: "🎭 Roles", value: `${guild.roles.cache.size}`, inline: true },
        ],
        footer: { text: `Requested by ${interaction.user.tag}`, icon_url: interaction.user.displayAvatarURL({ dynamic: true }) },
        timestamp: new Date(),
      };
      interaction.reply({ embeds: [embed] });
      break;
    }
    case "avatar": {
      const user = interaction.options.getUser("user") || interaction.user;
      const embed = {
        title: `${user.username}'s Avatar`,
        color: 0x0099ff,
        image: { url: user.displayAvatarURL({ dynamic: true, size: 1024 }) },
        footer: { text: `Requested by ${interaction.user.tag}`, icon_url: interaction.user.displayAvatarURL({ dynamic: true }) },
        timestamp: new Date(),
      };
      interaction.reply({ embeds: [embed] });
      break;
    }
    case "embed": {
      const title = interaction.options.getString("title");
      const description = interaction.options.getString("description");
      const color = interaction.options.getString("color") || "#0099ff";
      const embed = {
        color: parseInt(color.replace(/^#/, ''), 16),
        title,
        description,
        footer: { text: `Sent by ${interaction.user.tag}`, icon_url: interaction.user.displayAvatarURL({ dynamic: true }) },
        timestamp: new Date(),
      };
      interaction.reply({ embeds: [embed] });
      break;
    }
    case "poll": {
      const question = interaction.options.getString("question");
      const embed = {
        color: 0x0099ff,
        title: "📊 Poll",
        description: `**${question}**\n\n👍 Yes\n👎 No`,
        footer: { text: `Poll by ${interaction.user.tag}`, icon_url: interaction.user.displayAvatarURL({ dynamic: true }) },
        timestamp: new Date(),
      };
      const message = await interaction.reply({ embeds: [embed], fetchReply: true });
      await message.react("👍");
      await message.react("👎");
      break;
    }
    case "8ball": {
      const question = interaction.options.getString("question");
      const responses = [
        "It is certain.", "It is decidedly so.", "Without a doubt.", "Yes, definitely.", "You may rely on it.",
        "As I see it, yes.", "Most likely.", "Outlook good.", "Yes.", "Signs point to yes.",
        "Reply hazy, try again.", "Ask again later.", "Better not tell you now.", "Cannot predict now.", "Concentrate and ask again.",
        "Don't count on it.", "My reply is no.", "My sources say no.", "Outlook not so good.", "Very doubtful."
      ];
      const response = responses[Math.floor(Math.random() * responses.length)];
      interaction.reply(`🎱 **${question}**\n${response}`);
      break;
    }
    case "randomfact": {
      const facts = [
        "A group of flamingos is called a 'flamboyance'.",
        "The shortest war in history was between Britain and Zanzibar on August 27, 1896. Zanzibar surrendered after 38 minutes.",
        "Honey never spoils. Archaeologists have found pots of honey in ancient Egyptian tombs that are over 3,000 years old and still edible.",
        "Cows don't have upper front teeth.",
        "The average person walks the equivalent of five times around the world in their lifetime.",
        "The total weight of all the ants on Earth is estimated to be about the same as the total weight of all the humans on Earth.",
        "The electric eel is not an eel; it's a type of knifefish.",
      ];
      const fact = facts[Math.floor(Math.random() * facts.length)];
      interaction.reply(`💡 **Random Fact:** ${fact}`);
      break;
    }
  }
});

// ==================== Message Commands Handler ====================
client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  if (message.channel.type === ChannelType.DM) {
    try {
      const prompt = `${message.content}`;
      const result = await model.generateContent(prompt);
      const response = await result.response.text();
      splitMessage(response).forEach((chunk) => message.channel.send(chunk));
    } catch (err) {
      console.error("Error handling DM:", err);
      message.channel.send("❌ Sorry, something went wrong with the AI.");
    }
    return;
  }

  const args = message.content.trim().split(/\s+/);
  const command = args.shift()?.toLowerCase();
  const isCommandAllowed = hasBotAccess(message.member);
  
  // Role Commands
  if (command === "!addrole") {
    message.channel.send("❌ This `!` command has been moved to a slash command. Use `/addrole` instead.");
  }
 
  if (command === "!removerole") {
    message.channel.send("❌ This `!` command has been moved to a slash command. Use `/removerole` instead.");
  }
 
  if (command === "!createrole") {
    message.channel.send("❌ This `!` command has been moved to a slash command. Use `/createrole` instead.");
  }
 
  if (command === "!deleterole") {
    message.channel.send("❌ This `!` command has been moved to a slash command. Use `/deleterole` instead.");
  }
 
  if (command === "!renamerole") {
    message.channel.send("❌ This `!` command has been moved to a slash command. Use `/renamerole` instead.");
  }
 
  // Channel Commands
  if (command === "!createchannel") {
    message.channel.send("❌ This `!` command has been moved to a slash command. Use `/createchannel` instead.");
  }
 
  if (command === "!deletechannel") {
    message.channel.send("❌ This `!` command has been moved to a slash command. Use `/deletechannel` instead.");
  }
 
  // Private Channel
  if (command === "!createprivatechannel") {
    message.channel.send("❌ This `!` command has been moved to a slash command. Use `/createprivatechannel` instead.");
  }
 
  // Send DM (corrected logic)
  if (command === "!senddm") {
    message.channel.send("❌ This `!` command has been moved to a slash command. Use `/senddm` instead.");
  }
});

// ==================== Login ====================
client.login(process.env.DISCORD_BOT_TOKEN);