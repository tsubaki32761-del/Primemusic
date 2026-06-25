const { SlashCommandBuilder, ChannelType, PermissionFlagsBits, AttachmentBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('say')
        .setDescription('Gửi tin nhắn và hình ảnh vào kênh')
        .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages)
        .addChannelOption(option =>
            option
                .setName('channel')
                .setDescription('Chọn kênh để gửi tin nhắn')
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText)
        )
        .addStringOption(option =>
            option
                .setName('message')
                .setDescription('Nội dung tin nhắn (có thể để trống nếu có hình ảnh)')
                .setRequired(false)
                .setMaxLength(4000)
        )
        .addAttachmentOption(option =>
            option
                .setName('image')
                .setDescription('Đính kèm hình ảnh (tùy chọn)')
                .setRequired(false)
        )
        .addBooleanOption(option =>
            option
                .setName('embed')
                .setDescription('Gửi dưới dạng embed (mặc định: false)')
                .setRequired(false)
        ),

    async run(client, interaction) {
        const targetChannel = interaction.options.getChannel('channel');
        const message = interaction.options.getString('message');
        const attachment = interaction.options.getAttachment('image');
        const useEmbed = interaction.options.getBoolean('embed') || false;

        // Kiểm tra quyền của bot
        if (!targetChannel.permissionsFor(client.user).has('SendMessages')) {
            return interaction.reply({
                content: '❌ Bot không có quyền gửi tin nhắn vào kênh này!',
                ephemeral: true
            });
        }

        // Kiểm tra xem có nội dung nào không
        if (!message && !attachment) {
            return interaction.reply({
                content: '❌ Vui lòng cung cấp ít nhất tin nhắn hoặc hình ảnh!',
                ephemeral: true
            });
        }

        try {
            const messageOptions = {};

            // Thêm nội dung tin nhắn
            if (message) {
                if (useEmbed) {
                    const { EmbedBuilder } = require('discord.js');
                    const embed = new EmbedBuilder()
                        .setDescription(message)
                        .setColor(0x2f3136)
                        .setTimestamp();
                    
                    messageOptions.embeds = [embed];
                } else {
                    messageOptions.content = message;
                }
            }

            // Thêm hình ảnh nếu có
            if (attachment) {
                // Kiểm tra xem file có phải là hình ảnh không
                const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
                if (!validImageTypes.includes(attachment.contentType)) {
                    return interaction.reply({
                        content: '❌ File phải là hình ảnh hợp lệ (JPEG, PNG, GIF, WebP)!',
                        ephemeral: true
                    });
                }

                // Tải hình ảnh từ URL
                const response = await fetch(attachment.url);
                const buffer = await response.buffer();
                const file = new AttachmentBuilder(buffer, { name: attachment.name });
                messageOptions.files = [file];

                // Nếu là embed, thêm hình ảnh vào
                if (useEmbed && messageOptions.embeds) {
                    messageOptions.embeds[0].setImage(`attachment://${attachment.name}`);
                }
            }

            // Gửi tin nhắn
            await targetChannel.send(messageOptions);

            return interaction.reply({
                content: `✅ Tin nhắn đã được gửi vào <#${targetChannel.id}>!`,
                ephemeral: true
            });

        } catch (error) {
            console.error('Error in say command:', error);
            return interaction.reply({
                content: `❌ Có lỗi xảy ra khi gửi tin nhắn: ${error.message}`,
                ephemeral: true
            });
        }
    }
};
