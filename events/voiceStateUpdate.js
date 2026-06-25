const { ChannelType } = require('discord.js');

module.exports = async (client, oldState, newState) => {
    try {
        // Kiểm tra nếu bot tham gia voice channel
        if (newState.member.id === client.user.id && newState.channelId && !oldState.channelId) {
            const voiceChannel = newState.channel;
            
            // Xóa status của kênh voice (nếu có)
            if (voiceChannel && voiceChannel.permissionsFor(client.user).has('ManageChannels')) {
                try {
                    await voiceChannel.edit({ topic: '' }).catch(() => {});
                } catch (error) {
                    // Nếu không có quyền, bỏ qua
                }
            }
        }

        // Kiểm tra nếu bot rời voice channel
        if (oldState.member.id === client.user.id && oldState.channelId && !newState.channelId) {
            // Bot đã rời, không cần làm gì
        }
    } catch (error) {
        console.error('Error in voiceStateUpdate event:', error);
    }
};
